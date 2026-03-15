const express = require("express");
const router = express.Router();
const examManagementController = require("../controllers/examManagementController");
const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");
const { imageUpload } = require("../middleware/upload");

const {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    listTrashCategories,
    restoreCategory,
    permanentDeleteCategory,
    toggleCategory,
    listSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    listTrashSubcategories,
    restoreSubcategory,
    permanentDeleteSubcategory,
    toggleSubcategory,
    listExams,
    uploadExamBadge,
    getExam,
    createExam,
    updateExam,
    deleteExam,
    listTrashExams,
    restoreExam,
    permanentDeleteExam,
    toggleExam,
    listLevels,
    listExamTypes,
    listQuestionTypes,
    toggleQuestionType,
    listExamModules,
    createExamModules,
    listExamQuestions,
    createExamQuestions,
    updateExamQuestion,
    deleteExamQuestion,
    listTrashQuestions,
    restoreExamQuestion,
    permanentDeleteExamQuestion,
    getExamAttemptStatus,
    submitExamAttempt,
    listExamAttempts,
} = examManagementController;

// Categories
router.get("/categories", listCategories);
router.post("/categories", authMiddleware, requireAdmin, createCategory);
router.put("/categories/:id", authMiddleware, requireAdmin, updateCategory);
router.delete("/categories/:id", authMiddleware, requireAdmin, deleteCategory);
router.get("/categories/trash/list", authMiddleware, requireAdmin, listTrashCategories);
router.patch("/categories/:id/restore", authMiddleware, requireAdmin, restoreCategory);
router.delete("/categories/:id/permanent", authMiddleware, requireAdmin, permanentDeleteCategory);
router.patch("/categories/:id/toggle", authMiddleware, requireAdmin, toggleCategory);

// Subcategories
router.get("/subcategories", listSubcategories);
router.post("/subcategories", authMiddleware, requireAdmin, createSubcategory);
router.put("/subcategories/:id", authMiddleware, requireAdmin, updateSubcategory);
router.delete("/subcategories/:id", authMiddleware, requireAdmin, deleteSubcategory);
router.get("/subcategories/trash/list", authMiddleware, requireAdmin, listTrashSubcategories);
router.patch("/subcategories/:id/restore", authMiddleware, requireAdmin, restoreSubcategory);
router.delete("/subcategories/:id/permanent", authMiddleware, requireAdmin, permanentDeleteSubcategory);
router.patch("/subcategories/:id/toggle", authMiddleware, requireAdmin, toggleSubcategory);

// Exams
router.get("/exams", listExams);
router.post("/exams/badge/upload", authMiddleware, requireAdmin, imageUpload.single("badge"), uploadExamBadge);
router.get("/exams/:id", getExam);
router.post("/exams", authMiddleware, requireAdmin, createExam);
router.put("/exams/:id", authMiddleware, requireAdmin, updateExam);
router.delete("/exams/:id", authMiddleware, requireAdmin, deleteExam);
router.get("/exams/trash/list", authMiddleware, requireAdmin, listTrashExams);
router.patch("/exams/:id/restore", authMiddleware, requireAdmin, restoreExam);
router.delete("/exams/:id/permanent", authMiddleware, requireAdmin, permanentDeleteExam);
router.patch("/exams/:id/toggle", authMiddleware, requireAdmin, toggleExam);

// Levels + Exam Types
router.get("/levels", listLevels);
router.get("/exam-types", listExamTypes);
router.get("/question-types", authMiddleware, requireAdmin, listQuestionTypes);
router.patch("/question-types/:id/toggle", authMiddleware, requireAdmin, toggleQuestionType);

// Exam Modules + Questions
router.get("/exams/:examId/modules", listExamModules);
router.post("/exams/:examId/modules", authMiddleware, requireAdmin, createExamModules);
router.get("/exams/:examId/questions", listExamQuestions);
router.post("/exams/:examId/questions", authMiddleware, requireAdmin, createExamQuestions);
router.put("/exams/:examId/questions/:questionId", authMiddleware, requireAdmin, updateExamQuestion);
router.delete("/exams/:examId/questions/:questionId", authMiddleware, requireAdmin, deleteExamQuestion);
router.get("/questions/trash/list", authMiddleware, requireAdmin, examManagementController.listAllTrashQuestions);
router.patch("/questions/:id/restore", authMiddleware, requireAdmin, examManagementController.restoreQuestion);
router.delete("/questions/:id/permanent", authMiddleware, requireAdmin, examManagementController.permanentDeleteQuestion);
router.get("/exams/:examId/questions/trash/list", authMiddleware, requireAdmin, listTrashQuestions);
router.patch("/exams/:examId/questions/:questionId/restore", authMiddleware, requireAdmin, restoreExamQuestion);
router.delete("/exams/:examId/questions/:questionId/permanent", authMiddleware, requireAdmin, permanentDeleteExamQuestion);

// Student attempt routes
router.get("/exams/:examId/attempt-status", authMiddleware, getExamAttemptStatus);
router.post("/exams/:examId/attempts/submit", authMiddleware, submitExamAttempt);
router.get("/attempts", authMiddleware, requireAdmin, listExamAttempts);

module.exports = router;
