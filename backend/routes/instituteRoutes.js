const express = require("express");
const router = express.Router();
const multer = require("multer");

const authMiddleware = require("../middleware/authMiddleware");
const {
    getInstitute,
    saveInstitute,
    uploadInstituteMedia,
    saveInstituteSocialLinks,
    clearInstituteMedia,
    getPublicInstitute,
    generateQRCode,
    getReferredStudents
} = require("../controllers/instituteController");

/* Multer config */
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// Get Institute Profile
router.get("/", authMiddleware, getInstitute);

// Save / Update Institute Profile
router.put("/", authMiddleware, saveInstitute);

// Social Links
router.post("/social-links", authMiddleware, saveInstituteSocialLinks);
router.put("/social-links", authMiddleware, saveInstituteSocialLinks);

// Media Upload (Logo & Banner)
router.patch(
    "/media",
    authMiddleware,
    upload.fields([
        { name: "logoImage", maxCount: 1 },
        { name: "bannerImage", maxCount: 1 }
    ]),
    uploadInstituteMedia
);

// Clear Media
router.delete(
    "/media/clear",
    authMiddleware,
    clearInstituteMedia
);

// QR Code Generation
router.get("/qrcode", authMiddleware, generateQRCode);

// Referred Students
router.get("/referred-students", authMiddleware, getReferredStudents);

// Public Profile (no auth)
router.get("/public/:id", getPublicInstitute);

module.exports = router;
