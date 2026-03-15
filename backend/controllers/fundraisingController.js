const pool = require("../db");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");
const { sendFundraisingApplicationEmail } = require("../utils/sendEmail");

const isUuid = (value) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        String(value || "")
    );

/* =============================
   CREATE FUNDRAISING EVENT
============================= */
exports.createFundraisingEvent = async (req, res) => {
    try {
        const adminId = req.userId;
        const {
            title,
            subtitle,
            status,
            about_event,
            eligibility_criteria,
            guidelines_for_students,
            selection_process,
            venue_name,
            venue_address,
            city,
            state,
            start_date,
            end_date,
            last_apply_date,
            organizing_body_name,
            coordinator_name,
            coordinator_phone,
            coordinator_email,
            max_funding_per_student,
            min_funding_per_student,
            total_fund_pool,
            banner_image_url,
        } = req.body;
        const normalizedStatus = status || "Upcoming";

        // Validate required fields
        if (!title || !start_date || !end_date || !last_apply_date) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        // Validate status
        if (!["Upcoming", "Closed"].includes(normalizedStatus)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const result = await pool.query(
            `INSERT INTO fundraising_events (
                admin_id, title, subtitle, banner_image_url, status,
                about_event, eligibility_criteria, guidelines_for_students, selection_process,
                venue_name, venue_address, city, state,
                start_date, end_date, last_apply_date,
                organizing_body_name, coordinator_name, coordinator_phone, coordinator_email,
                max_funding_per_student, min_funding_per_student, total_fund_pool
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
            RETURNING *`,
            [
                adminId,
                title,
                subtitle,
                banner_image_url,
                normalizedStatus,
                about_event,
                eligibility_criteria,
                guidelines_for_students,
                selection_process,
                venue_name,
                venue_address,
                city,
                state,
                start_date,
                end_date,
                last_apply_date,
                organizing_body_name,
                coordinator_name,
                coordinator_phone,
                coordinator_email,
                max_funding_per_student,
                min_funding_per_student,
                total_fund_pool,
            ]
        );

        res.status(201).json({
            message: "Fundraising event created successfully",
            event: result.rows[0],
        });
    } catch (err) {
        console.error("CREATE FUNDRAISING EVENT ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/* =============================
   GET ALL FUNDRAISING EVENTS (For Students)
============================= */
exports.getAllFundraisingEvents = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = "SELECT * FROM fundraising_events WHERE 1=1";
        const params = [];

        if (status && ["Upcoming", "Closed"].includes(status)) {
            query += " AND status = $" + (params.length + 1);
            params.push(status);
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${
            params.length + 2
        }`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Get total count
        let countQuery = "SELECT COUNT(*) FROM fundraising_events WHERE 1=1";
        const countParams = [];

        if (status && ["Upcoming", "Closed"].includes(status)) {
            countQuery += " AND status = $" + (countParams.length + 1);
            countParams.push(status);
        }

        const countResult = await pool.query(countQuery, countParams);
        const totalCount = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            events: result.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalCount,
                pageSize: parseInt(limit),
            },
        });
    } catch (err) {
        console.error("GET FUNDRAISING EVENTS ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/* =============================
   GET SINGLE FUNDRAISING EVENT
============================= */
exports.getFundraisingEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM fundraising_events WHERE id = $1",
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("GET FUNDRAISING EVENT ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/* =============================
   UPDATE FUNDRAISING EVENT (Admin Only)
============================= */
exports.updateFundraisingEvent = async (req, res) => {
    try {
        const adminId = req.userId;
        const { id } = req.params;
        const updates = req.body;

        // Verify ownership
        const eventResult = await pool.query(
            "SELECT admin_id FROM fundraising_events WHERE id = $1",
            [id]
        );

        if (!eventResult.rows.length) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (eventResult.rows[0].admin_id !== adminId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const allowedFields = [
            "title",
            "subtitle",
            "banner_image_url",
            "status",
            "about_event",
            "eligibility_criteria",
            "guidelines_for_students",
            "selection_process",
            "venue_name",
            "venue_address",
            "city",
            "state",
            "start_date",
            "end_date",
            "last_apply_date",
            "organizing_body_name",
            "coordinator_name",
            "coordinator_phone",
            "coordinator_email",
            "max_funding_per_student",
            "min_funding_per_student",
            "total_fund_pool",
        ];

        let updateQuery = "UPDATE fundraising_events SET updated_at = NOW()";
        const params = [];
        let paramIndex = 1;

        for (const field of allowedFields) {
            if (field in updates) {
                updateQuery += `, ${field} = $${paramIndex}`;
                params.push(updates[field]);
                paramIndex++;
            }
        }

        updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
        params.push(id);

        const result = await pool.query(updateQuery, params);

        res.json({
            message: "Event updated successfully",
            event: result.rows[0],
        });
    } catch (err) {
        console.error("UPDATE FUNDRAISING EVENT ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/* =============================
   DELETE FUNDRAISING EVENT (Admin Only)
============================= */
exports.deleteFundraisingEvent = async (req, res) => {
    try {
        const adminId = req.userId;
        const { id } = req.params;

        // Verify ownership
        const eventResult = await pool.query(
            "SELECT admin_id FROM fundraising_events WHERE id = $1",
            [id]
        );

        if (!eventResult.rows.length) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (eventResult.rows[0].admin_id !== adminId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await pool.query(
            "DELETE FROM fundraising_events WHERE id = $1",
            [id]
        );

        res.json({ message: "Event deleted successfully" });
    } catch (err) {
        console.error("DELETE FUNDRAISING EVENT ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/* =============================
   GET ADMIN FUNDRAISING EVENTS
============================= */
exports.getAdminFundraisingEvents = async (req, res) => {
    try {
        const adminId = req.userId;
        const result = await pool.query(
            "SELECT * FROM fundraising_events WHERE admin_id = $1 ORDER BY created_at DESC",
            [adminId]
        );

        res.json({ events: result.rows });
    } catch (err) {
        console.error("GET ADMIN FUNDRAISING EVENTS ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/* =============================
   APPLY FOR FUNDRAISING EVENT (Student)
============================= */
exports.applyForEvent = async (req, res) => {
    try {
        const studentId = req.userId;
        const { eventId } = req.params;
        const {
            event_id,
            full_name,
            email,
            phone_number,
            institution_name,
            application_type,
            group_member_count,
            group_member_names,
            estimated_budget_required,
        } = req.body;
        const normalizedEventId = String(eventId || event_id || "").trim();

        if (!studentId || !isUuid(studentId)) {
            return res.status(401).json({ message: "Session expired. Please login again." });
        }

        if (!normalizedEventId || !isUuid(normalizedEventId)) {
            return res.status(400).json({ message: "Invalid event selected." });
        }

        const aadharCardFile = req.files?.aadhar_card?.[0];
        const photoFile = req.files?.photo?.[0];

        if (
            !normalizedEventId ||
            !full_name ||
            !email ||
            !phone_number ||
            !institution_name ||
            !application_type ||
            !estimated_budget_required ||
            !aadharCardFile ||
            !photoFile
        ) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        let parsedGroupMemberNames = [];
        const parsedGroupMemberCount = Number(group_member_count || 0);
        if (application_type === "Group") {
            if (!parsedGroupMemberCount || parsedGroupMemberCount < 2) {
                return res.status(400).json({ message: "Group member count is invalid" });
            }

            try {
                parsedGroupMemberNames = JSON.parse(group_member_names || "[]");
            } catch (parseErr) {
                return res.status(400).json({ message: "Group member names are invalid" });
            }

            if (
                !Array.isArray(parsedGroupMemberNames) ||
                parsedGroupMemberNames.length !== parsedGroupMemberCount ||
                parsedGroupMemberNames.some((name) => !String(name || "").trim())
            ) {
                return res.status(400).json({ message: "Please provide all group member names" });
            }
        }

        // Verify event exists
        const eventResult = await pool.query(
            "SELECT * FROM fundraising_events WHERE id = $1",
            [normalizedEventId]
        );

        if (!eventResult.rows.length) {
            return res.status(404).json({ message: "Event not found" });
        }

        const event = eventResult.rows[0];

        const budgetValue = Number(estimated_budget_required);
        if (Number.isNaN(budgetValue)) {
            return res.status(400).json({ message: "Estimated budget is invalid" });
        }

        if (
            event.min_funding_per_student !== null &&
            event.max_funding_per_student !== null &&
            (budgetValue < event.min_funding_per_student || budgetValue > event.max_funding_per_student)
        ) {
            return res.status(400).json({
                message: `Estimated budget must be between ${event.min_funding_per_student} and ${event.max_funding_per_student}`,
            });
        }

        // Check for duplicate application
        const dupCheck = await pool.query(
            "SELECT id FROM fundraising_applications WHERE event_id = $1 AND student_id = $2",
            [normalizedEventId, studentId]
        );

        if (dupCheck.rows.length) {
            return res.status(400).json({ message: "You have already applied for this event" });
        }

        const [aadharCardUpload, photoUpload] = await Promise.all([
            uploadToCloudinary(aadharCardFile.buffer, "fundraising", "aadhar-card", { width: 800, height: 600, quality: 85 }),
            uploadToCloudinary(photoFile.buffer, "fundraising", "photos", { width: 400, height: 400, quality: 85 }),
        ]);

        const generatedIdeaTitle =
            application_type === "Group"
                ? `Group Funding Application (${parsedGroupMemberCount} Members)`
                : "Individual Funding Application";
        const generatedIdeaDescription =
            application_type === "Group"
                ? `Group application submitted with ${parsedGroupMemberCount} members.`
                : "Individual funding application submitted by student.";

        const result = await pool.query(
            `INSERT INTO fundraising_applications (
                event_id,
                student_id,
                applicant_full_name,
                applicant_email,
                applicant_phone,
                institution_name,
                idea_title,
                idea_description,
                application_type,
                group_member_count,
                group_member_names,
                requested_funding,
                estimated_budget_required,
                aadhar_front_url,
                aadhar_back_url,
                photo_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *`,
            [
                normalizedEventId,
                studentId,
                full_name,
                email,
                phone_number,
                institution_name,
                generatedIdeaTitle,
                generatedIdeaDescription,
                application_type,
                application_type === "Group" ? parsedGroupMemberCount : null,
                application_type === "Group" ? JSON.stringify(parsedGroupMemberNames) : null,
                budgetValue,
                budgetValue,
                aadharCardUpload.secure_url,
                null,
                photoUpload.secure_url,
            ]
        );

        // Send confirmation email to the applicant
        try {
            await sendFundraisingApplicationEmail(email, full_name, {
                eventTitle: event.title,
                organizerName: event.organizing_body_name || "CCS Platform",
                startDate: event.start_date 
                    ? new Date(event.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) 
                    : "Not specified",
                endDate: event.end_date 
                    ? new Date(event.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) 
                    : "Not specified",
                lastApplyDate: event.last_apply_date 
                    ? new Date(event.last_apply_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) 
                    : "Not specified",
                applicationType: application_type,
                estimatedBudget: budgetValue,
                applicationId: result.rows[0]?.id || "",
            });
        } catch (emailErr) {
            console.error("FUNDRAISING EMAIL ERROR:", emailErr.message);
            // Don't fail the request if email fails
        }

        res.status(201).json({
            message: "Application submitted successfully",
            application: result.rows[0],
        });
    } catch (err) {
        console.error("APPLY FOR EVENT ERROR:", err.message);
        if (err.stack) {
            console.error(err.stack);
        }
        if (err.code === "23505") {
            return res.status(400).json({ message: "You have already applied for this event" });
        }
        if (err.code === "22P02") {
            return res.status(400).json({ message: "Invalid application data. Please login and try again." });
        }
        if (err.http_code || err.name === "Error") {
            return res.status(400).json({ message: "File upload failed. Please upload valid files and try again." });
        }
        res.status(500).json({ message: err.message || "Server error" });
    }
};

/* =============================
   GET APPLICATIONS FOR EVENT (Admin)
============================= */
exports.getApplicationsForEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { status } = req.query;

        let query = `
            SELECT 
                fa.id,
                fa.event_id,
                fa.student_id,
                fa.applicant_full_name,
                fa.applicant_email,
                fa.applicant_phone,
                fa.institution_name,
                fa.idea_title,
                fa.application_type,
                fa.group_member_count,
                fa.group_member_names,
                fa.estimated_budget_required,
                fa.aadhar_front_url,
                fa.aadhar_back_url,
                fa.photo_url,
                fa.application_status,
                fa.created_at,
                u.name as student_name,
                u.email as student_email,
                p.phone as student_phone
            FROM fundraising_applications fa
            JOIN users u ON fa.student_id = u.id
            LEFT JOIN profiles p ON fa.student_id = p.user_id
            WHERE fa.event_id = $1
        `;
        const params = [eventId];

        if (status) {
            query += " AND fa.application_status = $2";
            params.push(status);
        }

        query += " ORDER BY fa.created_at DESC";

        const result = await pool.query(query, params);

        res.json({ applications: result.rows });
    } catch (err) {
        console.error("GET APPLICATIONS ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/* =============================
   GET ALL APPLICATIONS FOR ADMIN EVENTS
============================= */
exports.getAdminApplications = async (req, res) => {
    try {
        const adminId = req.userId;

        const result = await pool.query(
            `SELECT
                fa.id,
                fa.event_id,
                fa.student_id,
                fa.applicant_full_name,
                fa.applicant_email,
                fa.applicant_phone,
                fa.institution_name,
                fa.application_type,
                fa.group_member_count,
                fa.group_member_names,
                fa.estimated_budget_required,
                fa.aadhar_front_url,
                fa.aadhar_back_url,
                fa.photo_url,
                fa.application_status,
                fa.created_at,
                fe.title AS event_title,
                fe.status AS event_status,
                fe.start_date,
                fe.end_date,
                fe.last_apply_date,
                u.name AS student_name,
                u.email AS student_email,
                p.phone AS student_phone
            FROM fundraising_applications fa
            JOIN fundraising_events fe ON fa.event_id = fe.id
            JOIN users u ON fa.student_id = u.id
            LEFT JOIN profiles p ON fa.student_id = p.user_id
            WHERE fe.admin_id = $1
            ORDER BY fa.created_at DESC`,
            [adminId]
        );

        const eventsResult = await pool.query(
            `SELECT id, title
             FROM fundraising_events
             WHERE admin_id = $1
             ORDER BY created_at DESC`,
            [adminId]
        );

        res.json({
            applications: result.rows,
            events: eventsResult.rows,
        });
    } catch (err) {
        console.error("GET ADMIN APPLICATIONS ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/* =============================
   GET SINGLE APPLICATION DETAIL (ADMIN)
============================= */
exports.getAdminApplicationDetail = async (req, res) => {
    try {
        const adminId = req.userId;
        const { applicationId } = req.params;

        const result = await pool.query(
            `SELECT
                fa.id,
                fa.event_id,
                fa.student_id,
                fa.applicant_full_name,
                fa.applicant_email,
                fa.applicant_phone,
                fa.institution_name,
                fa.idea_title,
                fa.application_type,
                fa.group_member_count,
                fa.group_member_names,
                fa.estimated_budget_required,
                fa.aadhar_front_url,
                fa.aadhar_back_url,
                fa.photo_url,
                fa.application_status,
                fa.created_at,
                fe.title AS event_title,
                fe.subtitle AS event_subtitle,
                fe.status AS event_status,
                fe.start_date,
                fe.end_date,
                fe.last_apply_date,
                fe.organizing_body_name,
                fe.coordinator_name,
                fe.coordinator_phone,
                fe.coordinator_email,
                u.name AS student_name,
                u.email AS student_email,
                p.phone AS student_phone,
                p.city AS student_city,
                p.state AS student_state
            FROM fundraising_applications fa
            JOIN fundraising_events fe ON fa.event_id = fe.id
            JOIN users u ON fa.student_id = u.id
            LEFT JOIN profiles p ON fa.student_id = p.user_id
            WHERE fa.id = $1 AND fe.admin_id = $2
            LIMIT 1`,
            [applicationId, adminId]
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.json({ application: result.rows[0] });
    } catch (err) {
        console.error("GET ADMIN APPLICATION DETAIL ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/* =============================
   UPDATE APPLICATION STATUS (Admin)
============================= */
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { application_status } = req.body;

        if (!["Pending", "Approved", "Rejected"].includes(application_status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const result = await pool.query(
            `UPDATE fundraising_applications 
             SET application_status = $1, updated_at = NOW() 
             WHERE id = $2 
             RETURNING *`,
            [application_status, applicationId]
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.json({
            message: "Application status updated",
            application: result.rows[0],
        });
    } catch (err) {
        console.error("UPDATE APPLICATION STATUS ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/* =============================
   GET STUDENT APPLICATIONS
============================= */
exports.getStudentApplications = async (req, res) => {
    try {
        const studentId = req.userId;

        const result = await pool.query(
            `SELECT 
                fa.*,
                fe.title as event_title,
                fe.status as event_status,
                fe.start_date,
                fe.end_date
            FROM fundraising_applications fa
            JOIN fundraising_events fe ON fa.event_id = fe.id
            WHERE fa.student_id = $1
            ORDER BY fa.created_at DESC`,
            [studentId]
        );

        res.json({ applications: result.rows });
    } catch (err) {
        console.error("GET STUDENT APPLICATIONS ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/* =============================
   UPLOAD EVENT BANNER IMAGE
============================= */
exports.uploadBannerImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const uploaded = await uploadToCloudinary(req.file.buffer, "fundraising", "banner", { width: 1600, height: 400, quality: 85 });

        res.json({ imageUrl: uploaded.secure_url });
    } catch (err) {
        console.error("UPLOAD BANNER ERROR:", err.message);
        if (err.message?.includes("Cloudinary")) {
            return res.status(500).json({ message: "Image upload failed. Please try again." });
        }
        res.status(500).json({ message: "Server error" });
    }
};
