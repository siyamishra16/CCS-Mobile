// const express = require("express");
// const multer = require("multer");
// const authMiddleware = require("../middleware/authMiddleware");
// const {
//   uploadLearningMedia,
//   createCourse,
//   getCourses,
//   getCourseById,
//   updateCourseImage,
//   createSection,
//   getSectionsByCourse,
//   updateSection,
//   createLesson,
//   getLessons,
//   deleteLesson,
//   updateLesson,
//   reorderLesson,
//   createQuiz,
//   getQuizzes,
//   deleteQuiz,
//   deleteSection,
//   updateQuiz,
//   createQuestion,
//   getQuestions,
//   deleteQuestion,
//   updateQuestion,
// } = require("../controllers/learningModuleController");

// const router = express.Router();

// const learningMediaUpload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 25 * 1024 * 1024 },
// });

// router.use(authMiddleware);

// router.post("/media/upload", learningMediaUpload.single("media"), uploadLearningMedia);

// router.post("/courses", createCourse);
// router.get("/courses", getCourses);
// router.get("/courses/:courseId", getCourseById);
// router.patch("/courses/:courseId/image", updateCourseImage);

// router.post("/courses/:courseId/sections", createSection);
// router.get("/courses/:courseId/sections", getSectionsByCourse);
// router.patch("/sections/:sectionId", updateSection);

// router.post("/lessons", createLesson);
// router.get("/lessons", getLessons);
// router.delete("/lessons/:lessonId", deleteLesson);
// router.patch("/lessons/:lessonId", updateLesson);
// router.patch("/lessons/:lessonId/reorder", reorderLesson);

// router.post("/quizzes", createQuiz);
// router.get("/quizzes", getQuizzes);
// router.delete("/quizzes/:quizId", deleteQuiz);
// router.patch("/quizzes/:quizId", updateQuiz);

// router.post("/questions", createQuestion);
// router.get("/questions", getQuestions);
// router.delete("/questions/:questionId", deleteQuestion);
// router.patch("/questions/:questionId", updateQuestion);

// router.delete("/sections/:sectionId", deleteSection);
// module.exports = router;


const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const {
  uploadLearningMedia,
  createCourse,
  getCourses,
  getCourseById,
  updateCourseImage,
  createSection,
  getSectionsByCourse,
  updateSection,
  createLesson,
  getLessons,
  deleteLesson,
  updateLesson,
  reorderLesson,
  createQuiz,
  getQuizzes,
  deleteQuiz,
  deleteSection,
  updateQuiz,
  createQuestion,
  getQuestions,
  deleteQuestion,
  updateQuestion,
  getCourseFinalExam,
  submitFinalExamAttempt,
  getMyFinalExamAttempts,
  getStudentCourses,
  getStudentCourseContent,
  updateLessonReviewStatus,
  submitSectionQuizAttempt,
  enrollInCourse,
} = require("../controllers/learningModuleController");

const router = express.Router();

// ── 200 MB limit so videos don't get rejected ─────────────────────────────
const learningMediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
});

// ── Catch MulterError (file too large) and return a clean JSON response ───
const handleMulterError = (err, req, res, next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      message: "File too large. Maximum allowed size is 200 MB.",
    });
  }
  next(err);
};

router.use(authMiddleware);

router.post(
  "/media/upload",
  (req, res, next) => {
    learningMediaUpload.single("media")(req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next);
      next();
    });
  },
  uploadLearningMedia
);

router.post("/courses", createCourse);
router.get("/courses", getCourses);
router.get("/student/courses", getStudentCourses);
router.get("/student/courses/:courseId/content", getStudentCourseContent);
router.post("/student/lessons/:lessonId/review", updateLessonReviewStatus);
router.post("/courses/:courseId/enroll", enrollInCourse);
router.post("/student/quizzes/:quizId/submit", submitSectionQuizAttempt);
router.get("/courses/:courseId", getCourseById);
router.patch("/courses/:courseId/image", updateCourseImage);

router.post("/courses/:courseId/sections", createSection);
router.get("/courses/:courseId/sections", getSectionsByCourse);
router.patch("/sections/:sectionId", updateSection);
router.delete("/sections/:sectionId", deleteSection);

router.post("/lessons", createLesson);
router.get("/lessons", getLessons);
router.delete("/lessons/:lessonId", deleteLesson);
router.patch("/lessons/:lessonId", updateLesson);
router.patch("/lessons/:lessonId/reorder", reorderLesson);

router.post("/quizzes", createQuiz);
router.get("/quizzes", getQuizzes);
router.delete("/quizzes/:quizId", deleteQuiz);
router.patch("/quizzes/:quizId", updateQuiz);
router.get("/courses/:courseId/final-exam", getCourseFinalExam);
router.post("/courses/:courseId/final-exam/submit", submitFinalExamAttempt);
router.get("/courses/:courseId/final-exam/attempts/me", getMyFinalExamAttempts);

router.post("/questions", createQuestion);
router.get("/questions", getQuestions);
router.delete("/questions/:questionId", deleteQuestion);
router.patch("/questions/:questionId", updateQuestion);

module.exports = router;
