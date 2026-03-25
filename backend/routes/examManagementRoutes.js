// const express = require("express");
// const router = express.Router();
// const examManagementController = require("../controllers/examManagementController");
// const authMiddleware = require("../middleware/authMiddleware");
// const requireAdmin = require("../middleware/requireAdmin");
// const { imageUpload } = require("../middleware/upload");

// const {
//     listCategories,
//     createCategory,
//     updateCategory,
//     deleteCategory,
//     listTrashCategories,
//     restoreCategory,
//     permanentDeleteCategory,
//     toggleCategory,
//     listSubcategories,
//     createSubcategory,
//     updateSubcategory,
//     deleteSubcategory,
//     listTrashSubcategories,
//     restoreSubcategory,
//     permanentDeleteSubcategory,
//     toggleSubcategory,
//     listExams,
//     uploadExamBadge,
//     getExam,
//     createExam,
//     updateExam,
//     deleteExam,
//     listTrashExams,
//     restoreExam,
//     permanentDeleteExam,
//     toggleExam,
//     listLevels,
//     listExamTypes,
//     listQuestionTypes,
//     toggleQuestionType,
//     listExamModules,
//     createExamModules,
//     listExamQuestions,
//     createExamQuestions,
//     updateExamQuestion,
//     deleteExamQuestion,
//     listTrashQuestions,
//     restoreExamQuestion,
//     permanentDeleteExamQuestion,
//     getExamAttemptStatus,
//     submitExamAttempt,
//     listExamAttempts,
// } = examManagementController;

// // Categories
// router.get("/categories", listCategories);
// router.post("/categories", authMiddleware, requireAdmin, createCategory);
// router.put("/categories/:id", authMiddleware, requireAdmin, updateCategory);
// router.delete("/categories/:id", authMiddleware, requireAdmin, deleteCategory);
// router.get("/categories/trash/list", authMiddleware, requireAdmin, listTrashCategories);
// router.patch("/categories/:id/restore", authMiddleware, requireAdmin, restoreCategory);
// router.delete("/categories/:id/permanent", authMiddleware, requireAdmin, permanentDeleteCategory);
// router.patch("/categories/:id/toggle", authMiddleware, requireAdmin, toggleCategory);

// // Subcategories
// router.get("/subcategories", listSubcategories);
// router.post("/subcategories", authMiddleware, requireAdmin, createSubcategory);
// router.put("/subcategories/:id", authMiddleware, requireAdmin, updateSubcategory);
// router.delete("/subcategories/:id", authMiddleware, requireAdmin, deleteSubcategory);
// router.get("/subcategories/trash/list", authMiddleware, requireAdmin, listTrashSubcategories);
// router.patch("/subcategories/:id/restore", authMiddleware, requireAdmin, restoreSubcategory);
// router.delete("/subcategories/:id/permanent", authMiddleware, requireAdmin, permanentDeleteSubcategory);
// router.patch("/subcategories/:id/toggle", authMiddleware, requireAdmin, toggleSubcategory);

// // Exams
// router.get("/exams", listExams);
// router.post("/exams/badge/upload", authMiddleware, requireAdmin, imageUpload.single("badge"), uploadExamBadge);
// router.get("/exams/:id", getExam);
// router.post("/exams", authMiddleware, requireAdmin, createExam);
// router.put("/exams/:id", authMiddleware, requireAdmin, updateExam);
// router.delete("/exams/:id", authMiddleware, requireAdmin, deleteExam);
// router.get("/exams/trash/list", authMiddleware, requireAdmin, listTrashExams);
// router.patch("/exams/:id/restore", authMiddleware, requireAdmin, restoreExam);
// router.delete("/exams/:id/permanent", authMiddleware, requireAdmin, permanentDeleteExam);
// router.patch("/exams/:id/toggle", authMiddleware, requireAdmin, toggleExam);

// // Levels + Exam Types
// router.get("/levels", listLevels);
// router.get("/exam-types", listExamTypes);
// router.get("/question-types", authMiddleware, requireAdmin, listQuestionTypes);
// router.patch("/question-types/:id/toggle", authMiddleware, requireAdmin, toggleQuestionType);

// // Exam Modules + Questions
// router.get("/exams/:examId/modules", listExamModules);
// router.post("/exams/:examId/modules", authMiddleware, requireAdmin, createExamModules);
// router.get("/exams/:examId/questions", listExamQuestions);
// router.post("/exams/:examId/questions", authMiddleware, requireAdmin, createExamQuestions);
// router.put("/exams/:examId/questions/:questionId", authMiddleware, requireAdmin, updateExamQuestion);
// router.delete("/exams/:examId/questions/:questionId", authMiddleware, requireAdmin, deleteExamQuestion);
// router.get("/questions/trash/list", authMiddleware, requireAdmin, examManagementController.listAllTrashQuestions);
// router.patch("/questions/:id/restore", authMiddleware, requireAdmin, examManagementController.restoreQuestion);
// router.delete("/questions/:id/permanent", authMiddleware, requireAdmin, examManagementController.permanentDeleteQuestion);
// router.get("/exams/:examId/questions/trash/list", authMiddleware, requireAdmin, listTrashQuestions);
// router.patch("/exams/:examId/questions/:questionId/restore", authMiddleware, requireAdmin, restoreExamQuestion);
// router.delete("/exams/:examId/questions/:questionId/permanent", authMiddleware, requireAdmin, permanentDeleteExamQuestion);

// // Student attempt routes
// router.get("/exams/:examId/attempt-status", authMiddleware, getExamAttemptStatus);
// router.post("/exams/:examId/attempts/submit", authMiddleware, submitExamAttempt);
// router.get("/attempts", authMiddleware, requireAdmin, listExamAttempts);

// module.exports = router;

const supabase = require("../config/supabaseClient");

const examManagementController = {
    // --- CATEGORIES ---
    listCategories: async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('name', { ascending: true });
            if (error) throw error;
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    createCategory: async (req, res) => {
        try {
            const { name, short_description } = req.body;
            const { data, error } = await supabase
                .from('categories')
                .insert([{ name, short_description, is_active: true }])
                .select();
            if (error) throw error;
            res.status(201).json(data[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, short_description } = req.body;
            const { data, error } = await supabase
                .from('categories')
                .update({ name, short_description })
                .eq('id', id)
                .select();
            if (error) throw error;
            res.status(200).json(data[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const { error } = await supabase
                .from('categories')
                .update({ is_active: false })
                .eq('id', id);
            if (error) throw error;
            res.status(200).json({ message: "Category moved to trash" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    toggleCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body; // boolean
            const { error } = await supabase
                .from('categories')
                .update({ status })
                .eq('id', id);
            if (error) throw error;
            res.status(200).json({ message: "Status updated" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // --- SUBCATEGORIES ---
    listSubcategories: async (req, res) => {
        try {
            const { category_id } = req.query;
            let query = supabase.from('sub_categories').select('*').eq('is_active', true);
            
            if (category_id) {
                query = query.eq('category_id', category_id);
            }

            const { data, error } = await query.order('name', { ascending: true });
            if (error) throw error;
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    createSubcategory: async (req, res) => {
        try {
            const { category_id, name, short_description } = req.body;
            const { data, error } = await supabase
                .from('sub_categories')
                .insert([{ category_id, name, short_description, is_active: true }])
                .select();
            if (error) throw error;
            res.status(201).json(data[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // --- EXAMS ---
    listExams: async (req, res) => {
        try {
            const { sub_category_id } = req.query;
            let query = supabase.from('exams').select('*').eq('is_active', true);
            
            if (sub_category_id) {
                query = query.eq('sub_category_id', sub_category_id);
            }

            const { data, error } = await query;
            if (error) throw error;
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getExam: async (req, res) => {
        try {
            const { id } = req.params;
            const { data, error } = await supabase
                .from('exams')
                .select('*, exam_questions(*)')
                .eq('id', id)
                .single();
            if (error) throw error;
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // --- QUESTIONS & MODULES ---
    listExamQuestions: async (req, res) => {
        try {
            const { examId } = req.params;
            const { data, error } = await supabase
                .from('exam_questions')
                .select('*')
                .eq('exam_id', examId)
                .eq('is_active', true);
            if (error) throw error;
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // --- STUBS FOR REMAINING ROUTES (Add logic as needed) ---
    listTrashCategories: async (req, res) => { /* logic */ },
    restoreCategory: async (req, res) => { /* logic */ },
    permanentDeleteCategory: async (req, res) => { /* logic */ },
    updateSubcategory: async (req, res) => { /* logic */ },
    deleteSubcategory: async (req, res) => { /* logic */ },
    listTrashSubcategories: async (req, res) => { /* logic */ },
    restoreSubcategory: async (req, res) => { /* logic */ },
    permanentDeleteSubcategory: async (req, res) => { /* logic */ },
    toggleSubcategory: async (req, res) => { /* logic */ },
    uploadExamBadge: async (req, res) => { /* logic */ },
    createExam: async (req, res) => { /* logic */ },
    updateExam: async (req, res) => { /* logic */ },
    deleteExam: async (req, res) => { /* logic */ },
    listTrashExams: async (req, res) => { /* logic */ },
    restoreExam: async (req, res) => { /* logic */ },
    permanentDeleteExam: async (req, res) => { /* logic */ },
    toggleExam: async (req, res) => { /* logic */ },
    listLevels: async (req, res) => { /* logic */ },
    listExamTypes: async (req, res) => { /* logic */ },
    listQuestionTypes: async (req, res) => { /* logic */ },
    toggleQuestionType: async (req, res) => { /* logic */ },
    listExamModules: async (req, res) => { /* logic */ },
    createExamModules: async (req, res) => { /* logic */ },
    createExamQuestions: async (req, res) => { /* logic */ },
    updateExamQuestion: async (req, res) => { /* logic */ },
    deleteExamQuestion: async (req, res) => { /* logic */ },
    listAllTrashQuestions: async (req, res) => { /* logic */ },
    restoreQuestion: async (req, res) => { /* logic */ },
    permanentDeleteQuestion: async (req, res) => { /* logic */ },
    listTrashQuestions: async (req, res) => { /* logic */ },
    restoreExamQuestion: async (req, res) => { /* logic */ },
    permanentDeleteExamQuestion: async (req, res) => { /* logic */ },
    getExamAttemptStatus: async (req, res) => { /* logic */ },
    submitExamAttempt: async (req, res) => { /* logic */ },
    listExamAttempts: async (req, res) => { /* logic */ },
};

module.exports = examManagementController;