// This file contains additional soft delete functions for exam management
// These functions should be added to the examManagementController.js file

// ===============================
// Subcategory Soft Delete Functions
// ===============================

exports.listTrashSubcategories = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const offset = (page - 1) * limit;

        const pool = require("../db");
        const countRes = await pool.query(
            "SELECT COUNT(*) FROM subcategories WHERE is_deleted = TRUE"
        );
        const total = parseInt(countRes.rows[0].count, 10);
        const totalPages = Math.ceil(total / limit);

        const listRes = await pool.query(
            `
            SELECT
                s.id, s.code, s.name, s.category_id, c.name AS category_name,
                s.short_description, s.is_active, s.created_at, s.deleted_at
            FROM subcategories s
            LEFT JOIN categories c ON c.id = s.category_id
            WHERE s.is_deleted = TRUE
            ORDER BY s.deleted_at DESC
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
        console.error("LIST TRASH SUBCATEGORIES ERROR:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.restoreSubcategory = async (req, res) => {
    try {
        const pool = require("../db");
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE subcategories SET is_deleted = FALSE, deleted_at = NULL WHERE id = $1 AND is_deleted = TRUE RETURNING id, code, name",
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Subcategory not found in trash" });
        }

        return res.json({ success: true, message: "Subcategory restored", data: result.rows[0] });
    } catch (err) {
        console.error("RESTORE SUBCATEGORY ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.permanentDeleteSubcategory = async (req, res) => {
    try {
        const pool = require("../db");
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM subcategories WHERE id = $1 RETURNING id",
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Subcategory not found" });
        }

        return res.json({ success: true, message: "Subcategory permanently deleted", data: { id } });
    } catch (err) {
        console.error("PERMANENT DELETE SUBCATEGORY ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ===============================
// Exam Soft Delete Functions
// ===============================

exports.listTrashExams = async (req, res) => {
    try {
        const pool = require("../db");
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const offset = (page - 1) * limit;

        const countRes = await pool.query(
            "SELECT COUNT(*) FROM exams WHERE is_deleted = TRUE"
        );
        const total = parseInt(countRes.rows[0].count, 10);
        const totalPages = Math.ceil(total / limit);

        const listRes = await pool.query(
            `
            SELECT e.id, e.code, e.title, e.category_id, c.name AS category_name,
                e.subcategory_id, s.name AS subcategory_name, e.language,
                e.level_id, lv.name AS level_name, e.exam_type,
                e.duration_minutes, e.passing_score, e.total_marks,
                e.is_active, e.created_at, e.deleted_at
            FROM exams e
            LEFT JOIN categories c ON c.id = e.category_id
            LEFT JOIN subcategories s ON s.id = e.subcategory_id
            LEFT JOIN levels lv ON lv.id = e.level_id
            WHERE e.is_deleted = TRUE
            ORDER BY e.deleted_at DESC
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
        console.error("LIST TRASH EXAMS ERROR:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.restoreExam = async (req, res) => {
    try {
        const pool = require("../db");
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE exams SET is_deleted = FALSE, deleted_at = NULL WHERE id = $1 AND is_deleted = TRUE RETURNING id, code, title",
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Exam not found in trash" });
        }

        return res.json({ success: true, message: "Exam restored", data: result.rows[0] });
    } catch (err) {
        console.error("RESTORE EXAM ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.permanentDeleteExam = async (req, res) => {
    try {
        const pool = require("../db");
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM exams WHERE id = $1 RETURNING id",
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Exam not found" });
        }

        return res.json({ success: true, message: "Exam permanently deleted", data: { id } });
    } catch (err) {
        console.error("PERMANENT DELETE EXAM ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ===============================
// Question Soft Delete Functions
// ===============================

exports.deleteExamQuestion = async (req, res) => {
    try {
        const pool = require("../db");
        const { examId, questionId } = req.params;
        const result = await pool.query(
            "UPDATE exam_questions SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1 AND exam_id = $2 AND is_deleted = FALSE RETURNING id",
            [questionId, examId]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        return res.json({ success: true, message: "Question moved to trash", data: { id: questionId } });
    } catch (err) {
        console.error("DELETE EXAM QUESTION ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.listTrashQuestions = async (req, res) => {
    try {
        const pool = require("../db");
        const { examId } = req.params;
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const offset = (page - 1) * limit;

        const countRes = await pool.query(
            "SELECT COUNT(*) FROM exam_questions WHERE exam_id = $1 AND is_deleted = TRUE",
            [examId]
        );
        const total = parseInt(countRes.rows[0].count, 10);
        const totalPages = Math.ceil(total / limit);

        const listRes = await pool.query(
            `
            SELECT id, exam_id, module_id, question_text, marks, difficulty, explanation, question_data, display_order, is_active, created_at, deleted_at
            FROM exam_questions
            WHERE exam_id = $1 AND is_deleted = TRUE
            ORDER BY deleted_at DESC
            LIMIT $2 OFFSET $3
            `,
            [examId, limit, offset]
        );

        res.json({
            success: true,
            data: listRes.rows,
            pagination: { page, limit, total, totalPages },
        });
    } catch (err) {
        console.error("LIST TRASH QUESTIONS ERROR:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.restoreExamQuestion = async (req, res) => {
    try {
        const pool = require("../db");
        const { examId, questionId } = req.params;
        const result = await pool.query(
            "UPDATE exam_questions SET is_deleted = FALSE, deleted_at = NULL WHERE id = $1 AND exam_id = $2 AND is_deleted = TRUE RETURNING id, question_text",
            [questionId, examId]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Question not found in trash" });
        }

        return res.json({ success: true, message: "Question restored", data: result.rows[0] });
    } catch (err) {
        console.error("RESTORE QUESTION ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.permanentDeleteExamQuestion = async (req, res) => {
    try {
        const pool = require("../db");
        const { examId, questionId } = req.params;
        const result = await pool.query(
            "DELETE FROM exam_questions WHERE id = $1 AND exam_id = $2 RETURNING id",
            [questionId, examId]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        return res.json({ success: true, message: "Question permanently deleted", data: { id: questionId } });
    } catch (err) {
        console.error("PERMANENT DELETE QUESTION ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.listAllTrashQuestions = async (req, res) => {
    try {
        const pool = require("../db");
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const offset = (page - 1) * limit;

        const countRes = await pool.query(
            "SELECT COUNT(*) FROM exam_questions WHERE is_deleted = TRUE"
        );
        const total = parseInt(countRes.rows[0].count, 10);
        const totalPages = Math.ceil(total / limit);

        const listRes = await pool.query(
            `
            SELECT 
                eq.id, eq.exam_id, eq.module_id, eq.question_text, eq.marks, eq.difficulty, 
                eq.explanation, eq.question_data, eq.display_order, eq.is_active, eq.created_at, eq.deleted_at,
                e.title AS exam_title
            FROM exam_questions eq
            LEFT JOIN exams e ON e.id = eq.exam_id
            WHERE eq.is_deleted = TRUE
            ORDER BY eq.deleted_at DESC
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
        console.error("LIST ALL TRASH QUESTIONS ERROR:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.restoreQuestion = async (req, res) => {
    try {
        const pool = require("../db");
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE exam_questions SET is_deleted = FALSE, deleted_at = NULL WHERE id = $1 AND is_deleted = TRUE RETURNING id, question_text",
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Question not found in trash" });
        }

        return res.json({ success: true, message: "Question restored", data: result.rows[0] });
    } catch (err) {
        console.error("RESTORE QUESTION ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.permanentDeleteQuestion = async (req, res) => {
    try {
        const pool = require("../db");
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM exam_questions WHERE id = $1 RETURNING id",
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        return res.json({ success: true, message: "Question permanently deleted", data: { id } });
    } catch (err) {
        console.error("PERMANENT DELETE QUESTION ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};