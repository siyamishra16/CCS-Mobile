const pool = require("../db");
const {
    uploadToCloudinary,
    deleteFromCloudinary,
} = require("../utils/cloudinaryUpload");
const { sendEventApplicationEmail } = require("../utils/sendEmail");

const ORGANIZER_CONFIG = {
    4: { type: "college", table: "colleges", idColumn: "id", nameColumn: "name" },
    5: { type: "university", table: "universities", idColumn: "id", nameColumn: "name" },
    6: { type: "school", table: "schools", idColumn: "id", nameColumn: "name" },
    7: { type: "company", table: "companies", idColumn: "id", nameColumn: "name" },
};

const ALLOWED_EVENT_STATUSES = ["active", "inactive"];
const ALLOWED_EVENT_TYPES = ["online", "in_person"];

const extractCloudinaryPublicIdFromUrl = (url) => {
    if (!url || typeof url !== "string") return null;
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[^/.?]+(?:\?|$)/);
    return matches ? matches[1] : null;
};

const parseSpeakers = (speakers) => {
    if (Array.isArray(speakers)) return speakers.filter(Boolean).map((s) => String(s).trim()).filter(Boolean);
    if (typeof speakers === "string") {
        const raw = speakers.trim();
        if (!raw) return [];
        if (raw.startsWith("[")) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed.filter(Boolean).map((s) => String(s).trim()).filter(Boolean);
            } catch (_) {
                // Fall back to comma-separated parsing below.
            }
        }
        return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
};

const getOrganizerByUser = async (userId, userType) => {
    const cfg = ORGANIZER_CONFIG[userType];
    if (!cfg) return null;

    const q = `
        SELECT ${cfg.idColumn} AS organizer_id, ${cfg.nameColumn} AS organizer_name
        FROM ${cfg.table}
        WHERE user_id = $1
        LIMIT 1
    `;

    const result = await pool.query(q, [userId]);
    if (!result.rows.length) return null;

    return {
        organizer_id: result.rows[0].organizer_id,
        organizer_name: result.rows[0].organizer_name,
        organizer_type: cfg.type,
    };
};

const normalizeEventPayload = (body) => {
    const eventType = body.event_type;
    const eventName = body.event_name;
    const eventLink = eventType === "online" ? body.event_link || null : null;
    const location = eventType === "in_person" ? body.location || null : null;
    const startDate = body.start_date;
    const startTime = body.start_time;
    const endDate = body.end_date || null;
    const endTime = body.end_time || null;
    const description = body.description || null;
    const status = body.status || "active";
    const speakers = parseSpeakers(body.speakers);
    const removeEventMedia = body.remove_event_media === true || body.remove_event_media === "true";

    return {
        eventType,
        eventName,
        eventLink,
        location,
        startDate,
        startTime,
        endDate,
        endTime,
        description,
        status,
        speakers,
        removeEventMedia,
    };
};

const validateEventPayload = (payload) => {
    if (!payload.eventType || !payload.eventName || !payload.startDate || !payload.startTime) {
        return "Required fields missing";
    }
    if (!ALLOWED_EVENT_TYPES.includes(payload.eventType)) {
        return "Invalid event type";
    }
    if (!ALLOWED_EVENT_STATUSES.includes(payload.status)) {
        return "Invalid status";
    }
    if (payload.eventType === "online" && !payload.eventLink) {
        return "Event link is required for online events";
    }
    if (payload.eventType === "in_person" && !payload.location) {
        return "Location is required for in-person events";
    }
    return null;
};

exports.createEvent = async (req, res) => {
    try {
        const userId = req.userId;
        const userType = Number(req.userType);

        const organizer = await getOrganizerByUser(userId, userType);
        if (!organizer) {
            return res.status(403).json({ message: "Only school, college, university, and company can create events." });
        }

        const payload = normalizeEventPayload(req.body);
        const validationError = validateEventPayload(payload);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        let eventMediaUrl = null;
        let eventMediaPath = null;
        if (req.file) {
            const upload = await uploadToCloudinary(req.file.buffer, "events", "banner", {
                width: 1280,
                height: 720,
                quality: 85,
            });
            eventMediaUrl = upload.secure_url;
            eventMediaPath = upload.public_id;
        }

        const insert = await pool.query(
            `
            INSERT INTO events (
                organizer_user_id,
                organizer_type,
                organizer_id,
                event_type,
                event_name,
                event_link,
                location,
                start_date,
                start_time,
                end_date,
                end_time,
                description,
                speakers,
                event_media_url,
                event_media_path,
                status
            )
            VALUES (
                $1,$2,$3,$4,$5,$6,$7,
                $8,$9,$10,$11,$12,$13,$14,$15,$16
            )
            RETURNING *
            `,
            [
                userId,
                organizer.organizer_type,
                organizer.organizer_id,
                payload.eventType,
                payload.eventName,
                payload.eventLink,
                payload.location,
                payload.startDate,
                payload.startTime,
                payload.endDate,
                payload.endTime,
                payload.description,
                payload.speakers,
                eventMediaUrl,
                eventMediaPath,
                payload.status,
            ]
        );

        return res.status(201).json({
            message: "Event created successfully",
            event: {
                ...insert.rows[0],
                organizer_name: organizer.organizer_name,
            },
        });
    } catch (err) {
        console.error("CREATE EVENT ERROR:", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.updateMyEvent = async (req, res) => {
    try {
        const userId = req.userId;
        const userType = Number(req.userType);
        const { eventId } = req.params;

        const organizer = await getOrganizerByUser(userId, userType);
        if (!organizer) {
            return res.status(403).json({ message: "Only school, college, university, and company can update events." });
        }

        const payload = normalizeEventPayload(req.body);
        const validationError = validateEventPayload(payload);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const existingResult = await pool.query(
            `
            SELECT id, event_media_url, event_media_path
            FROM events
            WHERE id = $1 AND organizer_user_id = $2
            `,
            [eventId, userId]
        );
        if (!existingResult.rows.length) {
            return res.status(404).json({ message: "Event not found" });
        }

        const existingEvent = existingResult.rows[0];
        let nextMediaUrl = existingEvent.event_media_url;
        let nextMediaPath = existingEvent.event_media_path;

        const existingCloudinaryPublicId = existingEvent.event_media_path?.startsWith("ccs/")
            ? existingEvent.event_media_path
            : extractCloudinaryPublicIdFromUrl(existingEvent.event_media_url);

        if (payload.removeEventMedia && existingCloudinaryPublicId) {
            await deleteFromCloudinary(existingCloudinaryPublicId);
            nextMediaUrl = null;
            nextMediaPath = null;
        }

        if (req.file) {
            const upload = await uploadToCloudinary(req.file.buffer, "events", "banner", {
                width: 1280,
                height: 720,
                quality: 85,
            });
            nextMediaUrl = upload.secure_url;
            nextMediaPath = upload.public_id;
            if (existingCloudinaryPublicId && existingCloudinaryPublicId !== nextMediaPath) {
                await deleteFromCloudinary(existingCloudinaryPublicId);
            }
        }

        const result = await pool.query(
            `
            UPDATE events
            SET
                event_type = $1,
                event_name = $2,
                event_link = $3,
                location = $4,
                start_date = $5,
                start_time = $6,
                end_date = $7,
                end_time = $8,
                description = $9,
                speakers = $10,
                event_media_url = $11,
                event_media_path = $12,
                status = $13,
                updated_at = NOW()
            WHERE id = $14 AND organizer_user_id = $15
            RETURNING *
            `,
            [
                payload.eventType,
                payload.eventName,
                payload.eventLink,
                payload.location,
                payload.startDate,
                payload.startTime,
                payload.endDate,
                payload.endTime,
                payload.description,
                payload.speakers,
                nextMediaUrl,
                nextMediaPath,
                payload.status,
                eventId,
                userId,
            ]
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: "Event not found" });
        }

        return res.json({
            message: "Event updated successfully",
            event: {
                ...result.rows[0],
                organizer_name: organizer.organizer_name,
            },
        });
    } catch (err) {
        console.error("UPDATE EVENT ERROR:", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.getMyEvents = async (req, res) => {
    try {
        const userId = req.userId;
        const userType = Number(req.userType);

        const organizer = await getOrganizerByUser(userId, userType);
        if (!organizer) {
            return res.status(403).json({ message: "Only school, college, university, and company can view organizer events." });
        }

        const result = await pool.query(
            `
            SELECT *
            FROM events
            WHERE organizer_user_id = $1
            ORDER BY created_at DESC
            `,
            [userId]
        );

        const events = result.rows.map((row) => ({
            ...row,
            organizer_name: organizer.organizer_name,
        }));

        return res.json({ events });
    } catch (err) {
        console.error("GET MY EVENTS ERROR:", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.getMyEventById = async (req, res) => {
    try {
        const userId = req.userId;
        const userType = Number(req.userType);
        const { eventId } = req.params;

        const organizer = await getOrganizerByUser(userId, userType);
        if (!organizer) {
            return res.status(403).json({ message: "Only school, college, university, and company can view organizer events." });
        }

        const result = await pool.query(
            `
            SELECT *
            FROM events
            WHERE id = $1 AND organizer_user_id = $2
            `,
            [eventId, userId]
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: "Event not found" });
        }

        return res.json({
            event: {
                ...result.rows[0],
                organizer_name: organizer.organizer_name,
            },
        });
    } catch (err) {
        console.error("GET MY EVENT BY ID ERROR:", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.updateMyEventStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const userType = Number(req.userType);
        const { eventId } = req.params;
        const { status } = req.body;

        const organizer = await getOrganizerByUser(userId, userType);
        if (!organizer) {
            return res.status(403).json({ message: "Only school, college, university, and company can update event status." });
        }

        if (!status || !ALLOWED_EVENT_STATUSES.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const result = await pool.query(
            `
            UPDATE events
            SET status = $1, updated_at = NOW()
            WHERE id = $2 AND organizer_user_id = $3
            RETURNING *
            `,
            [status, eventId, userId]
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: "Event not found" });
        }

        return res.json({
            message: "Status updated",
            event: {
                ...result.rows[0],
                organizer_name: organizer.organizer_name,
            },
        });
    } catch (err) {
        console.error("UPDATE EVENT STATUS ERROR:", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.deleteMyEvent = async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.userId;
        const userType = Number(req.userType);
        const { eventId } = req.params;

        const organizer = await getOrganizerByUser(userId, userType);
        if (!organizer) {
            return res.status(403).json({ message: "Only school, college, university, and company can delete events." });
        }

        const eventResult = await client.query(
            `
            SELECT id, event_media_url, event_media_path
            FROM events
            WHERE id = $1 AND organizer_user_id = $2
            `,
            [eventId, userId]
        );

        if (!eventResult.rows.length) {
            return res.status(404).json({ message: "Event not found" });
        }

        const event = eventResult.rows[0];
        const cloudinaryPublicId = event.event_media_path?.startsWith("ccs/")
            ? event.event_media_path
            : extractCloudinaryPublicIdFromUrl(event.event_media_url);

        await client.query("BEGIN");
        await client.query("DELETE FROM event_applications WHERE event_id = $1", [eventId]);
        await client.query("DELETE FROM events WHERE id = $1 AND organizer_user_id = $2", [eventId, userId]);
        await client.query("COMMIT");

        if (cloudinaryPublicId) {
            try {
                await deleteFromCloudinary(cloudinaryPublicId);
            } catch (mediaErr) {
                console.error("DELETE EVENT MEDIA ERROR:", mediaErr.message);
            }
        }

        return res.json({ message: "Event deleted successfully" });
    } catch (err) {
        try {
            await client.query("ROLLBACK");
        } catch (_) {
            // no-op
        }
        console.error("DELETE EVENT ERROR:", err.message);
        return res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
};

exports.getStudentEventFeed = async (req, res) => {
    try {
        const userId = req.userId;
        const eventType = req.query.event_type;
        const datePosted = req.query.date_posted;

        await pool.query(
            `
            UPDATE events
            SET status = 'inactive', updated_at = NOW()
            WHERE status = 'active'
              AND COALESCE(end_date, start_date) < CURRENT_DATE
            `
        );

        const whereConditions = [
            "e.status = 'active'",
            "COALESCE(e.end_date, e.start_date) >= CURRENT_DATE",
        ];
        const params = [userId];

        if (eventType === "online" || eventType === "in_person") {
            params.push(eventType);
            whereConditions.push(`e.event_type = $${params.length}`);
        }

        if (datePosted === "24h") {
            whereConditions.push("e.created_at >= NOW() - INTERVAL '24 hours'");
        } else if (datePosted === "7d") {
            whereConditions.push("e.created_at >= NOW() - INTERVAL '7 days'");
        } else if (datePosted === "30d") {
            whereConditions.push("e.created_at >= NOW() - INTERVAL '30 days'");
        }

        const result = await pool.query(
            `
            SELECT
                e.id,
                e.organizer_type,
                e.organizer_id,
                e.event_type,
                e.event_name,
                e.event_link,
                e.location,
                e.start_date,
                e.start_time,
                e.end_date,
                e.end_time,
                e.description,
                e.speakers,
                e.event_media_url,
                e.status,
                e.created_at,
                COALESCE(companies.name, schools.name, colleges.name, universities.name) AS organizer_name,
                EXISTS(
                    SELECT 1
                    FROM event_applications ea
                    WHERE ea.event_id = e.id
                      AND ea.student_id = $1
                ) AS is_applied,
                (
                    SELECT COUNT(*)
                    FROM event_applications ea_count
                    WHERE ea_count.event_id = e.id
                )::INT AS applications_count
            FROM events e
            LEFT JOIN companies ON e.organizer_type = 'company' AND e.organizer_id = companies.id
            LEFT JOIN schools ON e.organizer_type = 'school' AND e.organizer_id = schools.id
            LEFT JOIN colleges ON e.organizer_type = 'college' AND e.organizer_id = colleges.id
            LEFT JOIN universities ON e.organizer_type = 'university' AND e.organizer_id = universities.id
            WHERE ${whereConditions.join(" AND ")}
            ORDER BY e.start_date ASC, e.start_time ASC, e.created_at DESC
            `,
            params
        );

        const statsResult = await pool.query(
            `
            SELECT
                COUNT(*)::INT AS applied_count,
                COUNT(*) FILTER (
                    WHERE e.status = 'active'
                      AND COALESCE(e.end_date, e.start_date) >= CURRENT_DATE
                )::INT AS upcoming_count
            FROM event_applications ea
            INNER JOIN events e ON e.id = ea.event_id
            WHERE ea.student_id = $1
            `,
            [userId]
        );

        const stats = statsResult.rows[0] || {};

        return res.json({
            events: result.rows,
            meta: {
                applied_count: Number(stats.applied_count) || 0,
                upcoming_count: Number(stats.upcoming_count) || 0,
            },
        });
    } catch (err) {
        console.error("GET STUDENT EVENT FEED ERROR:", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.getPublicEventFeed = async (req, res) => {
    try {
        const eventType = req.query.event_type;
        const datePosted = req.query.date_posted;

        await pool.query(
            `
            UPDATE events
            SET status = 'inactive', updated_at = NOW()
            WHERE status = 'active'
              AND COALESCE(end_date, start_date) < CURRENT_DATE
            `
        );

        const whereConditions = [
            "e.status = 'active'",
            "COALESCE(e.end_date, e.start_date) >= CURRENT_DATE",
        ];
        const params = [];

        if (eventType === "online" || eventType === "in_person") {
            params.push(eventType);
            whereConditions.push(`e.event_type = $${params.length}`);
        }

        if (datePosted === "24h") {
            whereConditions.push("e.created_at >= NOW() - INTERVAL '24 hours'");
        } else if (datePosted === "7d") {
            whereConditions.push("e.created_at >= NOW() - INTERVAL '7 days'");
        } else if (datePosted === "30d") {
            whereConditions.push("e.created_at >= NOW() - INTERVAL '30 days'");
        }

        const result = await pool.query(
            `
            SELECT
                e.id,
                e.organizer_type,
                e.organizer_id,
                e.event_type,
                e.event_name,
                e.event_link,
                e.location,
                e.start_date,
                e.start_time,
                e.end_date,
                e.end_time,
                e.description,
                e.speakers,
                e.event_media_url,
                e.status,
                e.created_at,
                COALESCE(companies.name, schools.name, colleges.name, universities.name) AS organizer_name,
                (
                    SELECT COUNT(*)
                    FROM event_applications ea_count
                    WHERE ea_count.event_id = e.id
                )::INT AS applications_count
            FROM events e
            LEFT JOIN companies ON e.organizer_type = 'company' AND e.organizer_id = companies.id
            LEFT JOIN schools ON e.organizer_type = 'school' AND e.organizer_id = schools.id
            LEFT JOIN colleges ON e.organizer_type = 'college' AND e.organizer_id = colleges.id
            LEFT JOIN universities ON e.organizer_type = 'university' AND e.organizer_id = universities.id
            WHERE ${whereConditions.join(" AND ")}
            ORDER BY e.start_date ASC, e.start_time ASC, e.created_at DESC
            `,
            params
        );

        return res.json({ events: result.rows });
    } catch (err) {
        console.error("GET PUBLIC EVENT FEED ERROR:", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.getPublicEventById = async (req, res) => {
    try {
        const { eventId } = req.params;

        const result = await pool.query(
            `
            SELECT
                e.id,
                e.organizer_type,
                e.organizer_id,
                e.event_type,
                e.event_name,
                e.event_link,
                e.location,
                e.start_date,
                e.start_time,
                e.end_date,
                e.end_time,
                e.description,
                e.speakers,
                e.event_media_url,
                e.status,
                e.created_at,
                COALESCE(companies.name, schools.name, colleges.name, universities.name) AS organizer_name,
                (
                    SELECT COUNT(*)
                    FROM event_applications ea_count
                    WHERE ea_count.event_id = e.id
                )::INT AS applications_count
            FROM events e
            LEFT JOIN companies ON e.organizer_type = 'company' AND e.organizer_id = companies.id
            LEFT JOIN schools ON e.organizer_type = 'school' AND e.organizer_id = schools.id
            LEFT JOIN colleges ON e.organizer_type = 'college' AND e.organizer_id = colleges.id
            LEFT JOIN universities ON e.organizer_type = 'university' AND e.organizer_id = universities.id
            WHERE e.id = $1
              AND e.status = 'active'
              AND COALESCE(e.end_date, e.start_date) >= CURRENT_DATE
            LIMIT 1
            `,
            [eventId]
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: "Event not found" });
        }

        return res.json({ event: result.rows[0] });
    } catch (err) {
        console.error("GET PUBLIC EVENT BY ID ERROR:", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.getEventApplicationsForOrganizer = async (req, res) => {
    try {
        const userId = req.userId;
        const { eventId } = req.params;

        const eventResult = await pool.query(
            `
            SELECT id
            FROM events
            WHERE id = $1 AND organizer_user_id = $2
            `,
            [eventId, userId]
        );

        if (!eventResult.rows.length) {
            return res.status(404).json({ message: "Event not found" });
        }

        const applicantsResult = await pool.query(
            `
            SELECT
                ea.id,
                ea.student_id,
                ea.status,
                ea.created_at,
                u.name AS student_name,
                u.email AS student_email,
                p.profile_image_url
            FROM event_applications ea
            JOIN users u ON u.id = ea.student_id
            LEFT JOIN profiles p ON p.user_id = ea.student_id
            WHERE ea.event_id = $1
            ORDER BY ea.created_at DESC
            `,
            [eventId]
        );

        return res.json({
            count: applicantsResult.rows.length,
            applicants: applicantsResult.rows,
        });
    } catch (err) {
        console.error("GET EVENT APPLICATIONS ERROR:", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.applyToEvent = async (req, res) => {
    try {
        const userId = req.userId;
        const userType = Number(req.userType);
        const { eventId } = req.params;

        if (userType !== 3) {
            return res.status(403).json({ message: "Only students can apply to events." });
        }

        const eventResult = await pool.query(
            `
            SELECT
                e.id,
                e.status,
                e.event_type,
                e.event_name,
                e.event_link,
                e.location,
                e.start_date,
                e.start_time,
                COALESCE(companies.name, schools.name, colleges.name, universities.name) AS organizer_name
            FROM events e
            LEFT JOIN companies ON e.organizer_type = 'company' AND e.organizer_id = companies.id
            LEFT JOIN schools ON e.organizer_type = 'school' AND e.organizer_id = schools.id
            LEFT JOIN colleges ON e.organizer_type = 'college' AND e.organizer_id = colleges.id
            LEFT JOIN universities ON e.organizer_type = 'university' AND e.organizer_id = universities.id
            WHERE e.id = $1
            `,
            [eventId]
        );

        if (!eventResult.rows.length) {
            return res.status(404).json({ message: "Event not found" });
        }

        const event = eventResult.rows[0];
        if (event.status !== "active") {
            return res.status(400).json({ message: "Event is not open for applications" });
        }

        const insert = await pool.query(
            `
            INSERT INTO event_applications (event_id, student_id)
            VALUES ($1, $2)
            ON CONFLICT (event_id, student_id) DO NOTHING
            RETURNING id
            `,
            [eventId, userId]
        );

        if (!insert.rows.length) {
            return res.status(200).json({ message: "You have already applied for this event." });
        }

        const studentResult = await pool.query(
            "SELECT name, email FROM users WHERE id = $1",
            [userId]
        );
        const student = studentResult.rows[0];

        if (student?.email) {
            sendEventApplicationEmail(student.email, student.name, {
                eventName: event.event_name,
                organizerName: event.organizer_name,
                eventType: event.event_type,
                joinLink: event.event_link,
                location: event.location,
                eventDate: event.start_date ? new Date(event.start_date).toLocaleDateString() : "Not specified",
                eventTime: event.start_time || "Not specified",
            }).catch((emailErr) => {
                console.error("EVENT APPLICATION EMAIL SEND FAILED:", emailErr.message);
            });
        }

        return res.status(201).json({ message: "Applied for this event successfully." });
    } catch (err) {
        console.error("APPLY EVENT ERROR:", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};
