const crypto = require("crypto");
const pool = require("../db");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");

const makeId = () => `cat_${crypto.randomBytes(6).toString("hex")}`;
const makeBaseCode = (name) => {
    const trimmed = String(name || "").trim();
    if (!trimmed) return "CAT";
    const parts = trimmed.split(/\s+/);
    const initials = parts.map((p) => p[0]).join("");
    return (initials || "CAT").toUpperCase();
};
const makeRandomSuffix = () => crypto.randomBytes(2).toString("hex").toUpperCase();

const ensureUniqueCode = async (table, name, providedCode) => {
    const base = String(providedCode || makeBaseCode(name)).trim().toUpperCase() || "CAT";
    let candidate = base;

    for (let i = 0; i < 5; i += 1) {
        const exists = await pool.query(`SELECT 1 FROM ${table} WHERE code = $1`, [candidate]);
        if (!exists.rows.length) return candidate;
        candidate = `${base}-${makeRandomSuffix()}`;
    }

    return `${base}-${makeRandomSuffix()}`;
};

// =======================
// Categories
// =======================
exports.listCategories = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const offset = (page - 1) * limit;

        const searchCode = req.query.search_code ?? req.query.code;
        const searchName = req.query.search_name ?? req.query.name;
        const { status } = req.query;

        const where = ["is_deleted = FALSE"];
        const values = [];

        if (searchCode) {
            values.push(`%${searchCode}%`);
            where.push(`code ILIKE $${values.length}`);
        }

        if (searchName) {
            values.push(`%${searchName}%`);
            where.push(`name ILIKE $${values.length}`);
        }

        if (status === "active" || status === "inactive") {
            values.push(status === "active");
            where.push(`is_active = $${values.length}`);
        }

        const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

        const countRes = await pool.query(
            `SELECT COUNT(*) FROM categories ${whereSql}`,
            values
        );
        const total = parseInt(countRes.rows[0].count, 10);
        const totalPages = Math.ceil(total / limit);

        const listValues = [...values, limit, offset];
        const listRes = await pool.query(
            `
            SELECT
                id,
                code,
                name,
                short_description,
                description,
                is_active,
                created_at,
                updated_at
            FROM categories
            ${whereSql}
            ORDER BY created_at DESC
            LIMIT $${listValues.length - 1}
            OFFSET $${listValues.length}
            `,
            listValues
        );

        res.json({
            success: true,
            data: listRes.rows,
            pagination: { page, limit, total, totalPages },
        });
    } catch (err) {
        console.error("LIST CATEGORIES ERROR:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, short_description, description, is_active, code } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        const id = makeId();
        const finalCode = await ensureUniqueCode("categories", name, code);

        const result = await pool.query(
            `
            INSERT INTO categories (id, code, name, short_description, description, is_active)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, code, name, short_description, description, is_active, created_at, updated_at
            `,
            [
                id,
                finalCode,
                name,
                short_description || null,
                description || null,
                typeof is_active === "boolean" ? is_active : true,
            ]
        );

        return res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ success: false, message: "Category already exists" });
        }
        console.error("CREATE CATEGORY ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, short_description, description, is_active } = req.body;

        const fields = [];
        const values = [];

        if (name !== undefined) {
            values.push(name);
            fields.push(`name = $${values.length}`);
        }
        if (short_description !== undefined) {
            values.push(short_description);
            fields.push(`short_description = $${values.length}`);
        }
        if (description !== undefined) {
            values.push(description);
            fields.push(`description = $${values.length}`);
        }
        if (is_active !== undefined) {
            values.push(is_active);
            fields.push(`is_active = $${values.length}`);
        }

        if (!fields.length) {
            return res.status(400).json({ success: false, message: "No fields to update" });
        }

        fields.push("updated_at = NOW()");
        values.push(id);

        const result = await pool.query(
            `
            UPDATE categories
            SET ${fields.join(", ")}
            WHERE id = $${values.length}
            RETURNING id, code, name, short_description, description, is_active, created_at, updated_at
            `,
            values
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ success: false, message: "Category already exists" });
        }
        console.error("UPDATE CATEGORY ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE categories SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1 AND is_deleted = FALSE RETURNING id",
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.json({ success: true, message: "Category moved to trash", data: { id } });
    } catch (err) {
        console.error("DELETE CATEGORY ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.listTrashCategories = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const offset = (page - 1) * limit;

        const countRes = await pool.query(
            "SELECT COUNT(*) FROM categories WHERE is_deleted = TRUE"
        );
        const total = parseInt(countRes.rows[0].count, 10);
        const totalPages = Math.ceil(total / limit);

        const listRes = await pool.query(
            `
            SELECT
                id, code, name, short_description, description,
                is_active, created_at, deleted_at
            FROM categories
            WHERE is_deleted = TRUE
            ORDER BY deleted_at DESC
            LIMIT $1 OFFSET $2
            `,
            [limit, offset]
        );

        res.json({
            success: true,
            data: listRes.rows,
            pagination: { page, limit, total, totalPages },
        });
    } catch (err) {
        console.error("LIST TRASH CATEGORIES ERROR:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.restoreCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE categories SET is_deleted = FALSE, deleted_at = NULL WHERE id = $1 AND is_deleted = TRUE RETURNING id, code, name",
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Category not found in trash" });
        }

        return res.json({ success: true, message: "Category restored", data: result.rows[0] });
    } catch (err) {
        console.error("RESTORE CATEGORY ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.permanentDeleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM categories WHERE id = $1 RETURNING id",
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.json({ success: true, message: "Category permanently deleted", data: { id } });
    } catch (err) {
        console.error("PERMANENT DELETE CATEGORY ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.toggleCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `
            UPDATE categories
            SET is_active = NOT is_active, updated_at = NOW()
            WHERE id = $1
            RETURNING id, is_active
            `,
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("TOGGLE CATEGORY ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// =======================
// Subcategories
// =======================
exports.listSubcategories = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const offset = (page - 1) * limit;

        const searchCode = req.query.search_code ?? req.query.code;
        const searchName = req.query.search_name ?? req.query.name;
        const { status, category_id } = req.query;

        const where = ["s.is_deleted = FALSE"];
        const values = [];

        if (searchCode) {
            values.push(`%${searchCode}%`);
            where.push(`s.code ILIKE $${values.length}`);
        }

        if (searchName) {
            values.push(`%${searchName}%`);
            where.push(`s.name ILIKE $${values.length}`);
        }

        if (category_id) {
            values.push(category_id);
            where.push(`s.category_id = $${values.length}`);
        }

        if (status === "active" || status === "inactive") {
            values.push(status === "active");
            where.push(`s.is_active = $${values.length}`);
        }

        const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

        const countRes = await pool.query(
            `SELECT COUNT(*) FROM subcategories s ${whereSql}`,
            values
        );
        const total = parseInt(countRes.rows[0].count, 10);
        const totalPages = Math.ceil(total / limit);

        const listValues = [...values, limit, offset];
        const listRes = await pool.query(
            `
            SELECT
                s.id,
                s.code,
                s.name,
                s.category_id,
                c.name AS category_name,
                s.short_description,
                s.is_active,
                s.created_at,
                s.updated_at
            FROM subcategories s
            JOIN categories c ON c.id = s.category_id
            ${whereSql}
            ORDER BY s.created_at DESC
            LIMIT $${listValues.length - 1}
            OFFSET $${listValues.length}
            `,
            listValues
        );

        res.json({
            success: true,
            data: listRes.rows,
            pagination: { page, limit, total, totalPages },
        });
    } catch (err) {
        console.error("LIST SUBCATEGORIES ERROR:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.createSubcategory = async (req, res) => {
    try {
        const { name, short_description, is_active, category_id, code } = req.body;
        if (!name || !category_id) {
            return res.status(400).json({ success: false, message: "Name and category_id are required" });
        }

        const finalCode = await ensureUniqueCode("subcategories", name, code);

        const result = await pool.query(
            `
            INSERT INTO subcategories (code, name, category_id, short_description, is_active)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, code, name, category_id, short_description, is_active, created_at, updated_at
            `,
            [
                finalCode,
                name,
                category_id,
                short_description || null,
                typeof is_active === "boolean" ? is_active : true,
            ]
        );

        return res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ success: false, message: "Subcategory already exists" });
        }
        console.error("CREATE SUBCATEGORY ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, short_description, is_active, category_id } = req.body;

        const fields = [];
        const values = [];

        if (name !== undefined) {
            values.push(name);
            fields.push(`name = $${values.length}`);
        }
        if (short_description !== undefined) {
            values.push(short_description);
            fields.push(`short_description = $${values.length}`);
        }
        if (category_id !== undefined) {
            values.push(category_id);
            fields.push(`category_id = $${values.length}`);
        }
        if (is_active !== undefined) {
            values.push(is_active);
            fields.push(`is_active = $${values.length}`);
        }

        if (!fields.length) {
            return res.status(400).json({ success: false, message: "No fields to update" });
        }

        fields.push("updated_at = NOW()");
        values.push(id);

        const result = await pool.query(
            `
            UPDATE subcategories
            SET ${fields.join(", ")}
            WHERE id = $${values.length}
            RETURNING id, code, name, category_id, short_description, is_active, created_at, updated_at
            `,
            values
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Subcategory not found" });
        }

        return res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ success: false, message: "Subcategory already exists" });
        }
        console.error("UPDATE SUBCATEGORY ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.deleteSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE subcategories SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1 AND is_deleted = FALSE RETURNING id",
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Subcategory not found" });
        }

        return res.json({ success: true, message: "Subcategory moved to trash", data: { id } });
    } catch (err) {
        console.error("DELETE SUBCATEGORY ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.toggleSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `
            UPDATE subcategories
            SET is_active = NOT is_active, updated_at = NOW()
            WHERE id = $1
            RETURNING id, is_active
            `,
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Subcategory not found" });
        }

        return res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("TOGGLE SUBCATEGORY ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// =======================
// Exams
// =======================
exports.listExams = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const offset = (page - 1) * limit;

        const searchCode = req.query.search_code ?? req.query.code;
        const searchTitle = req.query.search_title ?? req.query.title;
        const { status, exam_type, level_id, subcategory_id, category_id, language } = req.query;

        const where = ["e.is_deleted = FALSE"];
        const values = [];

        if (searchCode) {
            values.push(`%${searchCode}%`);
            where.push(`e.code ILIKE $${values.length}`);
        }

        if (searchTitle) {
            values.push(`%${searchTitle}%`);
            where.push(`e.title ILIKE $${values.length}`);
        }

        if (category_id) {
            values.push(category_id);
            where.push(`e.category_id = $${values.length}`);
        }

        if (subcategory_id) {
            values.push(subcategory_id);
            where.push(`e.subcategory_id = $${values.length}`);
        }

        if (language) {
            values.push(language);
            where.push(`e.language = $${values.length}`);
        }

        if (level_id) {
            values.push(level_id);
            where.push(`e.level_id = $${values.length}`);
        }

        if (exam_type) {
            values.push(exam_type);
            where.push(`e.exam_type = $${values.length}`);
        }

        if (status === "active" || status === "inactive") {
            values.push(status === "active");
            where.push(`e.is_active = $${values.length}`);
        } else if (status) {
            values.push(status);
            where.push(`e.status = $${values.length}`);
        }

        const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

        const countRes = await pool.query(
            `SELECT COUNT(*) FROM exams e ${whereSql}`,
            values
        );
        const total = parseInt(countRes.rows[0].count, 10);
        const totalPages = Math.ceil(total / limit);

        const listValues = [...values, limit, offset];
        const listRes = await pool.query(
            `
            SELECT
                e.id,
                e.code,
                e.title,
                e.category_id,
                c.name AS category_name,
                e.subcategory_id,
                s.name AS subcategory_name,
                e.language,
                e.level_id,
                lv.name AS level_name,
                e.exam_type,
                e.duration_minutes,
                e.passing_score,
                e.total_marks,
                e.badge_name,
                e.badge_image,
                e.visibility,
                e.status,
                e.is_active,
                e.created_at,
                e.updated_at
            FROM exams e
            LEFT JOIN categories c ON c.id = e.category_id
            LEFT JOIN subcategories s ON s.id = e.subcategory_id
            LEFT JOIN levels lv ON lv.id = e.level_id
            ${whereSql}
            ORDER BY e.created_at DESC
            LIMIT $${listValues.length - 1}
            OFFSET $${listValues.length}
            `,
            listValues
        );

        res.json({
            success: true,
            data: listRes.rows,
            pagination: { page, limit, total, totalPages },
        });
    } catch (err) {
        console.error("LIST EXAMS ERROR:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.uploadExamBadge = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Badge image is required" });
        }

        const result = await uploadToCloudinary(req.file.buffer, "exam", "badge", {
            width: 200,
            height: 200,
            quality: 90,
        });

        return res.status(201).json({
            success: true,
            data: {
                secure_url: result.secure_url,
                public_id: result.public_id,
            },
        });
    } catch (err) {
        console.error("UPLOAD EXAM BADGE ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getExam = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `
            SELECT
                e.id,
                e.code,
                e.title,
                e.category_id,
                c.name AS category_name,
                e.subcategory_id,
                s.name AS subcategory_name,
                e.language,
                e.level_id,
                lv.name AS level_name,
                e.exam_type,
                e.duration_minutes,
                e.passing_score,
                e.total_marks,
                e.badge_name,
                e.badge_image,
                e.visibility,
                e.status,
                e.is_active,
                e.created_at,
                e.updated_at
            FROM exams e
            LEFT JOIN categories c ON c.id = e.category_id
            LEFT JOIN subcategories s ON s.id = e.subcategory_id
            LEFT JOIN levels lv ON lv.id = e.level_id
            WHERE e.id = $1 AND e.is_deleted = FALSE
            LIMIT 1
            `,
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Exam not found" });
        }

        return res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("GET EXAM ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.createExam = async (req, res) => {
    try {
        const {
            title,
            category_id,
            subcategory_id,
            language,
            level_id,
            exam_type,
            duration_minutes,
            passing_score,
            total_marks,
            visibility,
            status,
            is_active,
            code,
            badge_name,
            badge_image,
        } = req.body;

        if (!title || !category_id || !subcategory_id || !language || !level_id) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        if (!badge_name || !String(badge_name).trim()) {
            return res.status(400).json({ success: false, message: "Badge name is required" });
        }
        if (!badge_image || !String(badge_image).trim()) {
            return res.status(400).json({ success: false, message: "Badge image is required" });
        }

        let examTypeToUse = String(exam_type || "").trim();
        if (!examTypeToUse) {
            const typeRes = await pool.query(
                `SELECT unnest(enum_range(NULL::exam_type_enum)) AS name LIMIT 1`
            );
            examTypeToUse = typeRes.rows[0]?.name || null;
            if (!examTypeToUse) {
                return res.status(400).json({ success: false, message: "Exam type is required" });
            }
        }

        const finalCode = await ensureUniqueCode("exams", title, code);

        const result = await pool.query(
            `
            INSERT INTO exams (
                code, title, category_id, subcategory_id, language, level_id,
                exam_type, duration_minutes, passing_score, total_marks, visibility, status, is_active,
                badge_name, badge_image
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
            RETURNING *
            `,
            [
                finalCode,
                title,
                category_id,
                subcategory_id,
                language,
                level_id,
                examTypeToUse,
                duration_minutes ?? 60,
                passing_score ?? 70,
                total_marks ?? 100,
                visibility ?? "Public",
                status ?? "Draft",
                typeof is_active === "boolean" ? is_active : true,
                badge_name || null,
                badge_image || null,
            ]
        );

        return res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Exam already exists",
                detail: err.detail || null,
                constraint: err.constraint || null,
            });
        }
        console.error("CREATE EXAM ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateExam = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            category_id,
            subcategory_id,
            language,
            level_id,
            exam_type,
            duration_minutes,
            passing_score,
            total_marks,
            visibility,
            status,
            is_active,
            badge_name,
            badge_image,
        } = req.body;

        const fields = [];
        const values = [];

        if (title !== undefined) {
            values.push(title);
            fields.push(`title = $${values.length}`);
        }
        if (category_id !== undefined) {
            values.push(category_id);
            fields.push(`category_id = $${values.length}`);
        }
        if (subcategory_id !== undefined) {
            values.push(subcategory_id);
            fields.push(`subcategory_id = $${values.length}`);
        }
        if (language !== undefined) {
            values.push(language);
            fields.push(`language = $${values.length}`);
        }
        if (level_id !== undefined) {
            values.push(level_id);
            fields.push(`level_id = $${values.length}`);
        }
        if (exam_type !== undefined) {
            values.push(exam_type);
            fields.push(`exam_type = $${values.length}`);
        }
        if (duration_minutes !== undefined) {
            values.push(duration_minutes);
            fields.push(`duration_minutes = $${values.length}`);
        }
        if (passing_score !== undefined) {
            values.push(passing_score);
            fields.push(`passing_score = $${values.length}`);
        }
        if (total_marks !== undefined) {
            values.push(total_marks);
            fields.push(`total_marks = $${values.length}`);
        }
        if (visibility !== undefined) {
            values.push(visibility);
            fields.push(`visibility = $${values.length}`);
        }
        if (status !== undefined) {
            values.push(status);
            fields.push(`status = $${values.length}`);
        }
        if (is_active !== undefined) {
            values.push(is_active);
            fields.push(`is_active = $${values.length}`);
        }
        if (badge_name !== undefined) {
            values.push(badge_name || null);
            fields.push(`badge_name = $${values.length}`);
        }
        if (badge_image !== undefined) {
            const trimmed = String(badge_image || "").trim();
            if (trimmed) {
                values.push(trimmed);
                fields.push(`badge_image = $${values.length}`);
            }
        }

        if (!fields.length) {
            return res.status(400).json({ success: false, message: "No fields to update" });
        }

        fields.push("updated_at = NOW()");
        values.push(id);

        const result = await pool.query(
            `
            UPDATE exams
            SET ${fields.join(", ")}
            WHERE id = $${values.length}
            RETURNING *
            `,
            values
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Exam not found" });
        }

        return res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ success: false, message: "Exam already exists" });
        }
        console.error("UPDATE EXAM ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.deleteExam = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE exams SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1 AND is_deleted = FALSE RETURNING id",
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Exam not found" });
        }

        return res.json({ success: true, message: "Exam moved to trash", data: { id } });
    } catch (err) {
        console.error("DELETE EXAM ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.toggleExam = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `
            UPDATE exams
            SET is_active = NOT is_active, updated_at = NOW()
            WHERE id = $1
            RETURNING id, is_active
            `,
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Exam not found" });
        }

        return res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("TOGGLE EXAM ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// =======================
// Levels + Exam Types
// =======================
exports.listLevels = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, display_order, color_class, created_at
             FROM levels
             ORDER BY display_order ASC`
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error("LIST LEVELS ERROR:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.listExamTypes = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT unnest(enum_range(NULL::exam_type_enum)) AS name`
        );
        const data = result.rows.map((r, idx) => ({
            id: idx + 1,
            name: r.name,
        }));
        res.json({ success: true, data });
    } catch (err) {
        console.error("LIST EXAM TYPES ERROR:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.listQuestionTypes = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT id, code, name, short_description, is_active, display_order, created_at, updated_at
            FROM question_types
            ORDER BY display_order ASC, id ASC
            `
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error("LIST QUESTION TYPES ERROR:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.toggleQuestionType = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `
            UPDATE question_types
            SET is_active = NOT is_active, updated_at = NOW()
            WHERE id = $1
            RETURNING id, code, name, short_description, is_active, display_order, created_at, updated_at
            `,
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Question type not found" });
        }

        return res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("TOGGLE QUESTION TYPE ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// =======================
// Exam Modules + Questions
// =======================
exports.listExamModules = async (req, res) => {
    try {
        const { examId } = req.params;
        const result = await pool.query(
            `
            SELECT id, exam_id, module_type, title, display_order, is_active, created_at, updated_at
            FROM exam_modules
            WHERE exam_id = $1
            ORDER BY display_order ASC
            `,
            [examId]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error("LIST EXAM MODULES ERROR:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.createExamModules = async (req, res) => {
    try {
        const { examId } = req.params;
        const { modules } = req.body;

        if (!Array.isArray(modules) || modules.length === 0) {
            return res.status(400).json({ success: false, message: "Modules are required" });
        }

        const values = [];
        const rows = [];

        modules.forEach((m, idx) => {
            const base = idx * 4;
            values.push(examId, m.module_type, m.title || m.module_type, m.display_order ?? idx + 1);
            rows.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
        });

        const result = await pool.query(
            `
            INSERT INTO exam_modules (exam_id, module_type, title, display_order)
            VALUES ${rows.join(", ")}
            RETURNING id, exam_id, module_type, title, display_order, is_active, created_at, updated_at
            `,
            values
        );

        res.status(201).json({ success: true, data: result.rows });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ success: false, message: "Module already exists" });
        }
        console.error("CREATE EXAM MODULES ERROR:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.listExamQuestions = async (req, res) => {
    try {
        const { examId } = req.params;
        const result = await pool.query(
            `
            SELECT id, exam_id, module_id, question_text, marks, difficulty, explanation, question_data, display_order, is_active, created_at, updated_at
            FROM exam_questions
            WHERE exam_id = $1 AND is_deleted = FALSE
            ORDER BY display_order ASC
            `,
            [examId]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error("LIST EXAM QUESTIONS ERROR:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.createExamQuestions = async (req, res) => {
    try {
        const { examId } = req.params;
        const { questions } = req.body;

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ success: false, message: "Questions are required" });
        }

        const moduleIdSet = new Set(questions.map((q) => q.module_id).filter(Boolean));
        if (moduleIdSet.size === 0) {
            return res.status(400).json({ success: false, message: "module_id is required for each question" });
        }

        const moduleIds = Array.from(moduleIdSet);
        const moduleCheck = await pool.query(
            `SELECT id FROM exam_modules WHERE exam_id = $1 AND id = ANY($2::int[])`,
            [examId, moduleIds]
        );
        const validModuleIds = new Set(moduleCheck.rows.map((r) => r.id));
        const invalidModule = moduleIds.find((id) => !validModuleIds.has(id));
        if (invalidModule) {
            return res.status(400).json({ success: false, message: "Invalid module_id for this exam" });
        }

        const values = [];
        const rows = [];

        questions.forEach((q, idx) => {
            const base = idx * 8;
            values.push(
                examId,
                q.module_id,
                q.question_text,
                q.marks ?? 1,
                q.difficulty ?? "Medium",
                q.explanation || null,
                q.question_data || {},
                q.display_order ?? idx + 1
            );
            rows.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`);
        });

        const result = await pool.query(
            `
            INSERT INTO exam_questions (
                exam_id, module_id, question_text, marks, difficulty, explanation, question_data, display_order
            )
            VALUES ${rows.join(", ")}
            RETURNING id, exam_id, module_id, question_text, marks, difficulty, explanation, question_data, display_order, is_active, created_at, updated_at
            `,
            values
        );

        res.status(201).json({ success: true, data: result.rows });
    } catch (err) {
        console.error("CREATE EXAM QUESTIONS ERROR:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateExamQuestion = async (req, res) => {
    try {
        const { examId, questionId } = req.params;
        const {
            module_id,
            question_text,
            marks,
            difficulty,
            explanation,
            question_data,
            display_order,
            is_active,
        } = req.body;

        const questionCheck = await pool.query(
            `SELECT id FROM exam_questions WHERE id = $1 AND exam_id = $2`,
            [questionId, examId]
        );
        if (!questionCheck.rows.length) {
            return res.status(404).json({ success: false, message: "Question not found for this exam" });
        }

        if (module_id !== undefined) {
            const moduleCheck = await pool.query(
                `SELECT id FROM exam_modules WHERE id = $1 AND exam_id = $2`,
                [module_id, examId]
            );
            if (!moduleCheck.rows.length) {
                return res.status(400).json({ success: false, message: "Invalid module_id for this exam" });
            }
        }

        const fields = [];
        const values = [];

        if (module_id !== undefined) {
            values.push(module_id);
            fields.push(`module_id = $${values.length}`);
        }
        if (question_text !== undefined) {
            values.push(question_text);
            fields.push(`question_text = $${values.length}`);
        }
        if (marks !== undefined) {
            values.push(marks);
            fields.push(`marks = $${values.length}`);
        }
        if (difficulty !== undefined) {
            values.push(difficulty);
            fields.push(`difficulty = $${values.length}`);
        }
        if (explanation !== undefined) {
            values.push(explanation);
            fields.push(`explanation = $${values.length}`);
        }
        if (question_data !== undefined) {
            values.push(question_data);
            fields.push(`question_data = $${values.length}`);
        }
        if (display_order !== undefined) {
            values.push(display_order);
            fields.push(`display_order = $${values.length}`);
        }
        if (is_active !== undefined) {
            values.push(is_active);
            fields.push(`is_active = $${values.length}`);
        }

        if (!fields.length) {
            return res.status(400).json({ success: false, message: "No fields to update" });
        }

        fields.push("updated_at = NOW()");
        values.push(questionId, examId);

        const result = await pool.query(
            `
            UPDATE exam_questions
            SET ${fields.join(", ")}
            WHERE id = $${values.length - 1} AND exam_id = $${values.length}
            RETURNING id, exam_id, module_id, question_text, marks, difficulty, explanation, question_data, display_order, is_active, created_at, updated_at
            `,
            values
        );

        return res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("UPDATE EXAM QUESTION ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// =======================
// Exam Attempts (Student)
// =======================
exports.getExamAttemptStatus = async (req, res) => {
    try {
        const { examId } = req.params;
        const userId = req.user?.id || req.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const result = await pool.query(
            `
            SELECT exam_id, user_id, score, total_questions, percentage, result_status, attempted_at
            FROM exam_attempts
            WHERE exam_id = $1 AND user_id = $2
            LIMIT 1
            `,
            [examId, userId]
        );

        if (!result.rows.length) {
            return res.json({
                success: true,
                data: {
                    has_attempted: false,
                    result_status: null,
                    score: 0,
                    total_questions: 0,
                    percentage: 0,
                },
            });
        }

        const row = result.rows[0];
        return res.json({
            success: true,
            data: {
                has_attempted: true,
                result_status: row.result_status,
                score: row.score,
                total_questions: row.total_questions,
                percentage: row.percentage,
                attempted_at: row.attempted_at,
            },
        });
    } catch (err) {
        console.error("GET EXAM ATTEMPT STATUS ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.submitExamAttempt = async (req, res) => {
    try {
        const { examId } = req.params;
        const userId = req.user?.id || req.userId;
        const { score, total_questions, percentage, passed } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (score === undefined || total_questions === undefined || percentage === undefined || passed === undefined) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const already = await pool.query(
            `SELECT id FROM exam_attempts WHERE exam_id = $1 AND user_id = $2 LIMIT 1`,
            [examId, userId]
        );

        if (already.rows.length) {
            return res.status(409).json({ success: false, message: "Exam already attempted" });
        }

        const result = await pool.query(
            `
            INSERT INTO exam_attempts (
                exam_id, user_id, score, total_questions, percentage, result_status
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, exam_id, user_id, score, total_questions, percentage, result_status, attempted_at
            `,
            [
                examId,
                userId,
                Number(score),
                Number(total_questions),
                Number(percentage),
                passed ? "PASSED" : "FAILED",
            ]
        );

        // Auto-generate certificate if exam passed
        if (passed) {
            try {
                // Get user details
                const userRes = await pool.query(
                    `SELECT name FROM users WHERE id = $1`,
                    [userId]
                );
                
                // Get exam details
                const examRes = await pool.query(
                    `SELECT title FROM exams WHERE id = $1`,
                    [examId]
                );

                if (userRes.rows.length && examRes.rows.length) {
                    const studentName = userRes.rows[0].name;
                    const examTitle = examRes.rows[0].title;
                    
                    // Generate certificate directly using database insert
                    try {
                        // Puppeteer certificate generation (non-blocking in background)
                        const { generateCertificatePdf } = require('./certificateController');
                        
                        const mockReq = {
                            body: {
                                student_name: studentName,
                                exam_title: examTitle,
                                issuer_name: 'CCS Institute',
                                student_id: userId,
                                exam_id: examId
                            },
                            protocol: process.env.BACKEND_PROTOCOL || 'http',
                            get: (header) => {
                                if (header === 'host') return process.env.BACKEND_HOST || `localhost:${process.env.PORT || 5000}`;
                                return '';
                            }
                        };

                        let certificateGenerated = false;
                        let certificateData = null;

                        const mockRes = {
                            status: (code) => ({
                                json: (data) => {
                                    if (code >= 200 && code < 300) {
                                        certificateGenerated = true;
                                        certificateData = data;
                                    }
                                }
                            }),
                            json: (data) => {
                                certificateGenerated = true;
                                certificateData = data;
                            }
                        };

                        // Generate certificate in background
                        generateCertificatePdf(mockReq, mockRes).catch((err) => {
                            console.error('Certificate generation failed:', err.message);
                        });
                    } catch (certErr) {
                        console.error('Certificate generation error:', certErr.message);
                    }
                }
            } catch (certErr) {
                console.error('Error in certificate generation process:', certErr.message);
                // Don't fail the exam attempt if certificate generation fails
            }
        }

        return res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ success: false, message: "Exam already attempted" });
        }
        console.error("SUBMIT EXAM ATTEMPT ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.listExamAttempts = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const offset = (page - 1) * limit;

        const search = String(req.query.search || "").trim();
        const status = String(req.query.status || "").trim().toUpperCase();

        const where = [];
        const values = [];

        if (search) {
            values.push(`%${search}%`);
            where.push(`(
                u.name ILIKE $${values.length}
                OR u.email ILIKE $${values.length}
                OR e.title ILIKE $${values.length}
            )`);
        }

        if (status === "PASSED" || status === "FAILED") {
            values.push(status);
            where.push(`ea.result_status = $${values.length}`);
        }

        const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

        const countRes = await pool.query(
            `
            SELECT COUNT(*)
            FROM exam_attempts ea
            JOIN users u ON u.id = ea.user_id
            JOIN exams e ON e.id = ea.exam_id
            ${whereSql}
            `,
            values
        );

        const total = parseInt(countRes.rows[0].count, 10);
        const totalPages = Math.ceil(total / limit);

        const listValues = [...values, limit, offset];
        const listRes = await pool.query(
            `
            SELECT
                ea.id,
                ea.exam_id,
                ea.user_id,
                u.name AS user_name,
                u.email AS user_email,
                e.title AS exam_title,
                e.code AS exam_code,
                ea.score,
                ea.total_questions,
                ea.percentage,
                ea.result_status,
                ea.attempted_at
            FROM exam_attempts ea
            JOIN users u ON u.id = ea.user_id
            JOIN exams e ON e.id = ea.exam_id
            ${whereSql}
            ORDER BY ea.attempted_at DESC
            LIMIT $${listValues.length - 1}
            OFFSET $${listValues.length}
            `,
            listValues
        );

        return res.json({
            success: true,
            data: listRes.rows,
            pagination: { page, limit, total, totalPages },
        });
    } catch (err) {
        console.error("LIST EXAM ATTEMPTS ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
// Add these soft delete functions
const softDeleteFunctions = require('./softDeleteFunctions');
Object.assign(exports, softDeleteFunctions);
