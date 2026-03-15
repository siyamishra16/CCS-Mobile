const pool = require("../db");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const QRCode = require("qrcode");

const ensureDir = async (dirPath) => {
    await fs.promises.mkdir(dirPath, { recursive: true });
};

// Generate unique referral code for institute
const generateReferralCode = async () => {
    const makeCode = () => Math.floor(100000 + Math.random() * 900000).toString();
    let code = makeCode();
    let attempts = 0;

    while (attempts < 5) {
        const existing = await pool.query("SELECT 1 FROM institutes WHERE referral_code = $1", [code]);
        if (existing.rowCount === 0) return code;
        code = makeCode();
        attempts += 1;
    }

    return `${makeCode()}${Math.floor(Math.random() * 10)}`.slice(0, 6);
};

// Upload Institute Media (Logo & Banner)
exports.uploadInstituteMedia = async (req, res) => {
    try {
        const userId = req.userId;

        const instituteRes = await pool.query(
            "SELECT id FROM institutes WHERE user_id = $1",
            [userId]
        );

        if (!instituteRes.rows.length) {
            return res.status(404).json({ message: "Institute profile not found" });
        }

        const instituteId = instituteRes.rows[0].id;

        let logoUrl = null;
        let bannerUrl = null;

        const uploadDir = path.join(__dirname, "../uploads/institute");
        await ensureDir(uploadDir);

        /* LOGO */
        if (req.files?.logoImage) {
            const logoFile = req.files.logoImage[0];
            const logoName = `logo_${instituteId}_${Date.now()}.webp`;
            const logoPath = path.join(uploadDir, logoName);

            await sharp(logoFile.buffer)
                .resize(300, 300)
                .webp({ quality: 80 })
                .toFile(logoPath);

            logoUrl = `/uploads/institute/${logoName}`;
        }

        /* BANNER */
        if (req.files?.bannerImage) {
            const bannerFile = req.files.bannerImage[0];
            const bannerName = `banner_${instituteId}_${Date.now()}.webp`;
            const bannerPath = path.join(uploadDir, bannerName);

            await sharp(bannerFile.buffer)
                .resize(1200, 400)
                .webp({ quality: 80 })
                .toFile(bannerPath);

            bannerUrl = `/uploads/institute/${bannerName}`;
        }

        const updateRes = await pool.query(
            `
            UPDATE institutes
            SET
                logo_url = COALESCE($1, logo_url),
                banner_url = COALESCE($2, banner_url),
                updated_at = NOW()
            WHERE id = $3
            RETURNING *
            `,
            [logoUrl, bannerUrl, instituteId]
        );

        res.json({ institute: updateRes.rows[0] });
    } catch (err) {
        console.error("UPLOAD INSTITUTE MEDIA ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

// Save / Update Institute Profile
exports.saveInstitute = async (req, res) => {
    try {
        const userId = req.userId;

        const {
            name,
            institute_type,
            founded_year,
            description,
            state,
            city,
            address,
            zipcode,
            phone,
            email,
            website
        } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Institute name is required" });
        }

        const result = await pool.query(
            `
            INSERT INTO institutes (
                user_id, name, institute_type,
                founded_year, description,
                state, city, address, zipcode,
                phone, email, website
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
            ON CONFLICT (user_id)
            DO UPDATE SET
                name=$2,
                institute_type=$3,
                founded_year=$4,
                description=$5,
                state=$6,
                city=$7,
                address=$8,
                zipcode=$9,
                phone=$10,
                email=$11,
                website=$12,
                updated_at=NOW()
            RETURNING *
            `,
            [
                userId,
                name,
                institute_type,
                founded_year || null,
                description,
                state,
                city,
                address,
                zipcode,
                phone,
                email,
                website
            ]
        );

        res.json({
            message: "Institute profile saved",
            institute: result.rows[0],
        });
    } catch (err) {
        console.error("SAVE INSTITUTE ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Institute Profile
exports.getInstitute = async (req, res) => {
    try {
        const userId = req.userId;

        const instituteRes = await pool.query(
            "SELECT * FROM institutes WHERE user_id = $1",
            [userId]
        );

        if (!instituteRes.rows.length) {
            return res.json({ institute: null });
        }

        const institute = instituteRes.rows[0];

        const socialRes = await pool.query(
            "SELECT * FROM institute_social_links WHERE institute_id = $1",
            [institute.id]
        );

        res.json({
            institute,
            social_links: socialRes.rows[0] || null,
        });
    } catch (err) {
        console.error("GET INSTITUTE ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

// Save / Update Institute Social Links
exports.saveInstituteSocialLinks = async (req, res) => {
    try {
        const userId = req.userId;
        const {
            linkedin,
            instagram,
            facebook,
            twitter,
            youtube,
            pinterest
        } = req.body;

        const instituteRes = await pool.query(
            "SELECT id FROM institutes WHERE user_id = $1",
            [userId]
        );

        if (!instituteRes.rows.length) {
            return res.status(404).json({ message: "Institute profile not found" });
        }

        const instituteId = instituteRes.rows[0].id;

        const existingRes = await pool.query(
            "SELECT id FROM institute_social_links WHERE institute_id = $1",
            [instituteId]
        );

        let result;
        let action = "saved";

        if (existingRes.rows.length) {
            result = await pool.query(
                `
                UPDATE institute_social_links
                SET
                    linkedin=$1,
                    instagram=$2,
                    facebook=$3,
                    twitter=$4,
                    youtube=$5,
                    pinterest=$6,
                    updated_at=NOW()
                WHERE institute_id=$7
                RETURNING *
                `,
                [
                    linkedin,
                    instagram,
                    facebook,
                    twitter,
                    youtube,
                    pinterest,
                    instituteId
                ]
            );
            action = "updated";
        } else {
            result = await pool.query(
                `
                INSERT INTO institute_social_links (
                    institute_id,
                    linkedin,
                    instagram,
                    facebook,
                    twitter,
                    youtube,
                    pinterest
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7)
                RETURNING *
                `,
                [
                    instituteId,
                    linkedin,
                    instagram,
                    facebook,
                    twitter,
                    youtube,
                    pinterest
                ]
            );
        }

        res.json({
            message: `Social links ${action} successfully`,
            social_links: result.rows[0],
        });
    } catch (err) {
        console.error("SAVE INSTITUTE SOCIAL LINKS ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

// Clear Institute Media (Logo or Banner)
exports.clearInstituteMedia = async (req, res) => {
    try {
        const userId = req.userId;
        const { type } = req.query || {};

        const existingRes = await pool.query(
            `SELECT logo_url, banner_url FROM institutes WHERE user_id = $1`,
            [userId]
        );

        if (!existingRes.rows.length) {
            return res.status(404).json({ message: 'Institute not found' });
        }

        const { logo_url: currentLogo, banner_url: currentBanner } = existingRes.rows[0];

        let query, params;

        if (type === 'logo') {
            query = `
                UPDATE institutes
                SET logo_url = NULL, updated_at = NOW()
                WHERE user_id = $1
                RETURNING *
            `;
            params = [userId];

            // Delete old logo file
            if (currentLogo) {
                const filePath = path.join(__dirname, '..', currentLogo);
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Error deleting logo:', err);
                });
            }
        } else if (type === 'banner') {
            query = `
                UPDATE institutes
                SET banner_url = NULL, updated_at = NOW()
                WHERE user_id = $1
                RETURNING *
            `;
            params = [userId];

            // Delete old banner file
            if (currentBanner) {
                const filePath = path.join(__dirname, '..', currentBanner);
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Error deleting banner:', err);
                });
            }
        } else {
            query = `
                UPDATE institutes
                SET logo_url = NULL, banner_url = NULL, updated_at = NOW()
                WHERE user_id = $1
                RETURNING *
            `;
            params = [userId];

            // Delete both files
            if (currentLogo) {
                const logoPath = path.join(__dirname, '..', currentLogo);
                fs.unlink(logoPath, (err) => {
                    if (err) console.error('Error deleting logo:', err);
                });
            }
            if (currentBanner) {
                const bannerPath = path.join(__dirname, '..', currentBanner);
                fs.unlink(bannerPath, (err) => {
                    if (err) console.error('Error deleting banner:', err);
                });
            }
        }

        const result = await pool.query(query, params);

        res.json({
            message: 'Media cleared successfully',
            institute: result.rows[0]
        });
    } catch (err) {
        console.error("CLEAR INSTITUTE MEDIA ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Public Institute Profile (no auth required)
exports.getPublicInstitute = async (req, res) => {
    try {
        const { id } = req.params;

        const instituteRes = await pool.query(
            "SELECT * FROM institutes WHERE id = $1",
            [id]
        );

        if (!instituteRes.rows.length) {
            return res.status(404).json({ message: "Institute not found" });
        }

        const institute = instituteRes.rows[0];

        const socialRes = await pool.query(
            "SELECT * FROM institute_social_links WHERE institute_id = $1",
            [institute.id]
        );

        res.json({
            institute,
            social_links: socialRes.rows[0] || null,
        });
    } catch (err) {
        console.error("GET PUBLIC INSTITUTE ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

// Generate QR Code for Institute Referral
exports.generateQRCode = async (req, res) => {
    try {
        const userId = req.userId;

        const instituteResult = await pool.query(
            "SELECT id, name, referral_code FROM institutes WHERE user_id = $1",
            [userId]
        );

        if (!instituteResult.rows.length) {
            return res.status(404).json({ message: "Institute profile not found" });
        }

        const instituteId = instituteResult.rows[0].id;
        const instituteName = instituteResult.rows[0].name || "Institute";
        let referralCode = instituteResult.rows[0].referral_code;

        if (!referralCode) {
            referralCode = await generateReferralCode();
            await pool.query(
                "UPDATE institutes SET referral_code = $1, updated_at = NOW() WHERE id = $2",
                [referralCode, instituteId]
            );
        }

        const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
        const registrationURL = `${FRONTEND_URL}/register?referralCode=${referralCode}`;

        const qrCodeDataURL = await QRCode.toDataURL(registrationURL, {
            errorCorrectionLevel: "H",
            type: "image/png",
            width: 300,
            margin: 2,
        });

        res.json({
            qrCode: qrCodeDataURL,
            referralCode,
            registrationURL,
            instituteName,
        });
    } catch (err) {
        console.error("GENERATE INSTITUTE QR CODE ERROR:", err.message);
        res.status(500).json({ message: "Failed to generate QR code" });
    }
};

// Get Referred Students for Institute
exports.getReferredStudents = async (req, res) => {
    try {
        const userId = req.userId;

        const instituteResult = await pool.query(
            "SELECT id, referral_code FROM institutes WHERE user_id = $1",
            [userId]
        );

        if (!instituteResult.rows.length) {
            return res.status(404).json({ message: "Institute profile not found" });
        }

        const instituteId = instituteResult.rows[0].id;
        const instituteReferralCode = instituteResult.rows[0].referral_code || null;

        // Update students who used this institute's referral code
        if (instituteReferralCode) {
            await pool.query(
                `UPDATE users
                 SET referred_by_institute_id = $1
                 WHERE referred_by_institute_id IS NULL
                   AND user_type = 3
                   AND referral_code = $2`,
                [instituteId, instituteReferralCode]
            );
        }

        // Fetch all referred students
        const studentsResult = await pool.query(
            `SELECT
                u.id,
                u.name,
                u.email,
                u.created_at as joined_date,
                p.phone,
                p.city,
                p.state,
                p.profile_image_url,
                p.headline
             FROM users u
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE u.user_type = 3
               AND (u.referred_by_institute_id = $1 OR u.referral_code = $2)
             ORDER BY u.created_at DESC`,
            [instituteId, instituteReferralCode]
        );

        res.json({
            students: studentsResult.rows,
            totalCount: studentsResult.rows.length,
        });
    } catch (err) {
        console.error("GET INSTITUTE REFERRED STUDENTS ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};
