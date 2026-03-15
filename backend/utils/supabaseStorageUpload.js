const path = require("path");
const { randomUUID } = require("crypto");
const dns = require("dns");
const { promises: dnsPromises } = require("dns");
const https = require("https");

const fallbackResolver = new dnsPromises.Resolver();
fallbackResolver.setServers(["1.1.1.1", "8.8.8.8"]);

const dnsLookupWithFallback = (hostname, options, callback) => {
    dns.lookup(hostname, options, async (error, address, family) => {
        if (!error) {
            if (options?.all) {
                const records = Array.isArray(address)
                    ? address
                    : [{ address, family: family || 0 }];
                return callback(null, records);
            }

            if (Array.isArray(address) && address.length) {
                return callback(null, address[0].address, address[0].family);
            }

            return callback(null, address, family);
        }

        try {
            const ipv4 = await fallbackResolver.resolve4(hostname);
            if (ipv4?.length) {
                if (options?.all) {
                    return callback(
                        null,
                        ipv4.map((item) => ({ address: item, family: 4 }))
                    );
                }
                return callback(null, ipv4[0], 4);
            }
        } catch {}

        try {
            const ipv6 = await fallbackResolver.resolve6(hostname);
            if (ipv6?.length) {
                if (options?.all) {
                    return callback(
                        null,
                        ipv6.map((item) => ({ address: item, family: 6 }))
                    );
                }
                return callback(null, ipv6[0], 6);
            }
        } catch {}

        return callback(error);
    });
};

const httpsAgentWithDnsFallback = new https.Agent({
    keepAlive: true,
    lookup: dnsLookupWithFallback,
});

const requestWithHttps = ({ url, method, headers, body }) =>
    new Promise((resolve, reject) => {
        const parsed = new URL(url);

        const req = https.request(
            {
                protocol: parsed.protocol,
                hostname: parsed.hostname,
                port: parsed.port || 443,
                path: `${parsed.pathname}${parsed.search}`,
                method,
                headers,
                agent: httpsAgentWithDnsFallback,
                lookup: dnsLookupWithFallback,
                servername: parsed.hostname,
            },
            (res) => {
                const chunks = [];
                res.on("data", (chunk) => chunks.push(chunk));
                res.on("end", () => {
                    resolve({
                        statusCode: Number(res.statusCode || 0),
                        bodyText: Buffer.concat(chunks).toString("utf8"),
                    });
                });
            }
        );

        req.on("error", reject);

        if (body) {
            req.write(body);
        }

        req.end();
    });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "fundraising-files";

const decodeBase64Url = (value) => {
    const base64 = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4 || 4)) % 4);
    return Buffer.from(padded, "base64").toString("utf8");
};

const deriveSupabaseUrlFromServiceKey = () => {
    try {
        if (!SUPABASE_SERVICE_ROLE_KEY) return null;
        const parts = String(SUPABASE_SERVICE_ROLE_KEY).split(".");
        if (parts.length < 2) return null;
        const payloadJson = decodeBase64Url(parts[1]);
        const payload = JSON.parse(payloadJson);
        const ref = payload?.ref;
        if (!ref) return null;
        return `https://${ref}.supabase.co`;
    } catch {
        return null;
    }
};

const RESOLVED_SUPABASE_URL = SUPABASE_URL || deriveSupabaseUrlFromServiceKey();
let isBucketEnsured = false;

const mimeToExt = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
};

const getFileExt = (originalName, mimeType) => {
    const fromName = path.extname(String(originalName || "")).toLowerCase();
    if (fromName) return fromName;
    return mimeToExt[mimeType] || "";
};

const supabaseAuthHeaders = {
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    apikey: SUPABASE_SERVICE_ROLE_KEY,
};

async function ensureSupabaseBucket() {
    if (isBucketEnsured) {
        return;
    }

    const inspectUrl = `${RESOLVED_SUPABASE_URL}/storage/v1/bucket/${SUPABASE_STORAGE_BUCKET}`;
    const inspectResult = await requestWithHttps({
        url: inspectUrl,
        method: "GET",
        headers: supabaseAuthHeaders,
    });

    if (inspectResult.statusCode >= 200 && inspectResult.statusCode < 300) {
        isBucketEnsured = true;
        return;
    }

    const bucketMissing =
        inspectResult.statusCode === 404 ||
        String(inspectResult.bodyText || "").toLowerCase().includes("bucket not found");

    if (!bucketMissing) {
        throw new Error(`Supabase bucket check failed (${inspectResult.statusCode}): ${inspectResult.bodyText}`);
    }

    const createUrl = `${RESOLVED_SUPABASE_URL}/storage/v1/bucket`;
    const createPayload = JSON.stringify({
        id: SUPABASE_STORAGE_BUCKET,
        name: SUPABASE_STORAGE_BUCKET,
        public: true,
    });

    const createResult = await requestWithHttps({
        url: createUrl,
        method: "POST",
        headers: {
            ...supabaseAuthHeaders,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(createPayload),
        },
        body: createPayload,
    });

    const created = createResult.statusCode >= 200 && createResult.statusCode < 300;
    const alreadyExists = String(createResult.bodyText || "").toLowerCase().includes("already exists");

    if (!created && !alreadyExists) {
        throw new Error(`Supabase bucket create failed (${createResult.statusCode}): ${createResult.bodyText}`);
    }

    isBucketEnsured = true;
}

async function uploadBufferToSupabase({ buffer, folder, mimeType, originalName }) {
    if (!RESOLVED_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Supabase storage env is not configured");
    }

    await ensureSupabaseBucket();

    const safeFolder = String(folder || "uploads").replace(/^\/+|\/+$/g, "");
    const ext = getFileExt(originalName, mimeType);
    const filePath = `${safeFolder}/${Date.now()}-${randomUUID()}${ext}`;

    const uploadUrl = `${RESOLVED_SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${filePath}`;

    let uploadResult;
    try {
        uploadResult = await requestWithHttps({
            url: uploadUrl,
            method: "POST",
            headers: {
                ...supabaseAuthHeaders,
                "Content-Type": mimeType || "application/octet-stream",
                "x-upsert": "false",
                "Content-Length": Buffer.byteLength(buffer),
            },
            body: buffer,
        });
    } catch (error) {
        const causeMessage = error?.cause?.message ? ` | cause: ${error.cause.message}` : "";
        throw new Error(`Supabase upload transport failed: ${error.message}${causeMessage}`);
    }

    if (uploadResult.statusCode < 200 || uploadResult.statusCode >= 300) {
        throw new Error(`Supabase upload failed (${uploadResult.statusCode}): ${uploadResult.bodyText}`);
    }

    const encodedPath = filePath
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");

    return {
        publicUrl: `${RESOLVED_SUPABASE_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${encodedPath}`,
        path: filePath,
    };
}

module.exports = {
    uploadBufferToSupabase,
};
