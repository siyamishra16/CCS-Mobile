const express = require("express");
const router = express.Router();
const fundraisingController = require("../controllers/fundraisingController");
const authMiddleware = require("../middleware/authMiddleware");
const { imageUpload } = require("../middleware/upload");
const multer = require("multer");

const requireRole = (allowedRoles = []) => (req, res, next) => {
    const userType = Number(req.userType || req.user?.user_type);
    if (!allowedRoles.includes(userType)) {
        return res.status(403).json({ message: "Unauthorized" });
    }
    next();
};

const applyUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Unsupported file type"), false);
        }
        cb(null, true);
    },
});

// ===== ADMIN ROUTES (Create, Update, Delete Events) =====
// Create fundraising event
router.post(
    "/create-event",
    authMiddleware,
    requireRole([1, 2]), // Admin, SubAdmin
    fundraisingController.createFundraisingEvent
);

// Update fundraising event
router.put(
    "/:id",
    authMiddleware,
    requireRole([1, 2]), // Admin, SubAdmin
    fundraisingController.updateFundraisingEvent
);

// Delete fundraising event
router.delete(
    "/:id",
    authMiddleware,
    requireRole([1, 2]), // Admin, SubAdmin
    fundraisingController.deleteFundraisingEvent
);

// Get applications for a specific event
router.get(
    "/:eventId/applications",
    authMiddleware,
    requireRole([1, 2]), // Admin, SubAdmin
    fundraisingController.getApplicationsForEvent
);

// Get all student applications across admin-created events
router.get(
    "/admin-applications",
    authMiddleware,
    requireRole([1, 2]),
    fundraisingController.getAdminApplications
);

// Get single student application detail for admin
router.get(
    "/admin-applications/:applicationId",
    authMiddleware,
    requireRole([1, 2]),
    fundraisingController.getAdminApplicationDetail
);

// Update application status
router.patch(
    "/application/:applicationId/status",
    authMiddleware,
    requireRole([1, 2]), // Admin, SubAdmin
    fundraisingController.updateApplicationStatus
);

// ===== PUBLIC/STUDENT ROUTES =====
// Get admin fundraising events
router.get(
    "/my-events",
    authMiddleware,
    requireRole([1, 2]),
    fundraisingController.getAdminFundraisingEvents
);

// Get student's applications
router.get(
    "/my-applications",
    authMiddleware,
    requireRole([3]), // Students only
    fundraisingController.getStudentApplications
);

// Get all fundraising events (with pagination and filtering)
router.get("/", fundraisingController.getAllFundraisingEvents);

// Apply for fundraising event (Students)
router.post(
    "/:eventId/apply",
    authMiddleware,
    requireRole([3]), // Students only
    applyUpload.fields([
        { name: "aadhar_card", maxCount: 1 },
        { name: "photo", maxCount: 1 },
    ]),
    fundraisingController.applyForEvent
);

// Get single fundraising event
router.get("/:id", fundraisingController.getFundraisingEvent);

// Upload banner image
router.post(
    "/upload-banner",
    authMiddleware,
    requireRole([1, 2]), // Admin, SubAdmin
    imageUpload.single("banner"),
    fundraisingController.uploadBannerImage
);

module.exports = router;
