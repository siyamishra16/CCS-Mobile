const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');
const {
	generateCertificatePdf,
	getCertificatesByStudent,
	getMyCertificates,
	verifyCertificate,
	generateCertificatesForPastExams,
	viewCertificateFile,
	downloadCertificateFile
} = require('../controllers/certificateController');

router.post('/generate', authMiddleware, requireAdmin, generateCertificatePdf);
router.post('/generate-for-past-exams', authMiddleware, requireAdmin, generateCertificatesForPastExams);
router.get('/student/me', authMiddleware, getMyCertificates);
router.get('/student/:studentId', authMiddleware, getCertificatesByStudent);
router.get('/verify/:certificate_number', verifyCertificate);
router.get('/view/:certificate_number', viewCertificateFile);
router.get('/download/:certificate_number', downloadCertificateFile);

module.exports = router;

