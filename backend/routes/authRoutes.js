const express = require("express");
const router = express.Router();
const { registerUser, loginUser, verifyEmail, logoutUser, resendVerification, forgotPassword,
    resetPassword, checkUserStatus, validateToken } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/resend-verification", resendVerification);
router.post("/login", loginUser);
router.get("/verify/:token", verifyEmail);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/check-user", checkUserStatus);
router.get("/validate-token", validateToken);
module.exports = router;

