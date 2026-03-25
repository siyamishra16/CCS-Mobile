// const pool = require("../db");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");
// const { sendVerificationEmail, sendResetPasswordEmail, sendWelcomeStudentEmail, sendWelcomeOrganizationEmail } = require("../utils/sendEmail");


// exports.registerUser = async (req, res) => {
//     console.log("find")
//     try {
//         const { name, email, password, user_type, referral_code } = req.body;

//         if (!name || !email || !password || !user_type) {
//             return res.status(400).json({ message: "All fields are required" });
//         }

//         // Check user_type exists
//         const typeCheck = await pool.query("SELECT id FROM user_types WHERE id = $1", [user_type]);
//         if (!typeCheck.rows.length) {
//             return res.status(400).json({ message: "Invalid user type" });
//         }

//         // Check if email already exists
//         const emailCheck = await pool.query("SELECT id FROM users WHERE email=$1", [email.toLowerCase().trim()]);
//         if (emailCheck.rows.length) {
//             return res.status(400).json({ message: "Email already exists" });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Generate verification token
//         const verificationToken = crypto.randomBytes(32).toString("hex");

//          // If referral code is provided, look up the college ID
//         const normalizedReferralCode = referral_code?.trim() || null;
//         let referredByCollegeId = null;
//         if (normalizedReferralCode) {
//             const collegeResult = await pool.query(
//                 "SELECT id FROM colleges WHERE referral_code = $1",
//                 [normalizedReferralCode]
//             );
//             if (collegeResult.rows.length > 0) {
//                 referredByCollegeId = collegeResult.rows[0].id;
//             }
//         }

//         await pool.query(
//             `INSERT INTO users
//             (name, email, password, user_type, referral_code, referred_by_college_id, verification_token)
//             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
//             [
//                 name.trim(),
//                 email.toLowerCase().trim(),
//                 hashedPassword,
//                 user_type,
//                 normalizedReferralCode,
//                 referredByCollegeId,
//                 verificationToken,
//             ]
//         );
//         res.status(201).json({
//             message: "Registration successful. Check your email to verify your account.",
//         });

//         // Send email AFTER response
//         sendVerificationEmail(email, verificationToken)
//             .catch(err => console.error("EMAIL SEND FAILED 👉", err.message));

//     } catch (err) {
//         console.error("REGISTER ERROR 👉", err.message);
//         res.status(500).json({ message: "Server error" });
//     }
// };


// exports.verifyEmail = async (req, res) => {
//     try {
//         const { token } = req.params;

//         const userRes = await pool.query(
//             `SELECT id, name, email, user_type, is_verified FROM users WHERE verification_token=$1`,
//             [token]
//         );

//         // 🔹 TOKEN NOT FOUND
//         if (!userRes.rows.length) {
//             return res.status(200).json({
//                 message: "Email already verified or token expired",
//                 alreadyVerified: true,
//             });
//         }

//         const user = userRes.rows[0];

//         // 🔹 VERIFY USER
//         await pool.query(
//             `UPDATE users
//        SET is_verified=true, verification_token=NULL
//        WHERE id=$1`,
//             [user.id]
//         );

//         res.json({
//             message: "Email verified successfully",
//             success: true,
//         });

//         const userTypeLabelMap = {
//             3: "Student / Professional",
//             4: "College",
//             5: "University",
//             6: "School",
//             7: "Company",
//         };

//         if (user.email) {
//             const userTypeLabel = userTypeLabelMap[user.user_type] || "User";
//             const sendWelcome = user.user_type === 3
//                 ? sendWelcomeStudentEmail
//                 : sendWelcomeOrganizationEmail;

//             sendWelcome(user.email, user.name, userTypeLabel).catch((emailErr) => {
//                 console.error("WELCOME EMAIL AFTER VERIFY FAILED ->", emailErr.message);
//             });
//         }

//     } catch (err) {
//         console.error("VERIFY EMAIL ERROR 👉", err.message);
//         res.status(500).json({ message: "Server error" });
//     }
// };


// exports.resendVerification = async (req, res) => {
//     try {
//         const { email } = req.body;
//         if (!email) return res.status(400).json({ message: "Email is required" });

//         const userRes = await pool.query("SELECT id, is_verified FROM users WHERE email=$1", [email.toLowerCase().trim()]);
//         if (!userRes.rows.length) return res.status(400).json({ message: "User not found" });

//         const user = userRes.rows[0];
//         if (user.is_verified) return res.status(400).json({ message: "Email already verified" });

//         // Generate new verification token
//         const verificationToken = crypto.randomBytes(32).toString("hex");
//         await pool.query("UPDATE users SET verification_token=$1 WHERE id=$2", [verificationToken, user.id]);

//         // Respond first for faster UI, then send email in background.
//         res.json({ message: "Verification email resent successfully" });
//         sendVerificationEmail(email, verificationToken)
//             .catch(err => console.error("RESEND EMAIL SEND FAILED ->", err.message));
//     } catch (err) {
//         console.error("RESEND VERIFICATION ERROR 👉", err.message);
//         res.status(500).json({ message: "Server error" });
//     }
// };

// exports.loginUser = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password) return res.status(400).json({ message: "Email & password required" });

//         const userRes = await pool.query(
//             "SELECT id, name, email, password, user_type, is_verified FROM users WHERE email=$1",
//             [email.toLowerCase().trim()]
//         );
//         if (!userRes.rows.length) return res.status(400).json({ message: "Invalid credentials" });

//         const user = userRes.rows[0];
//         if (!user.is_verified) return res.status(403).json({ message: "Please verify your email" });

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//         // Sign JWT
//         const token = jwt.sign({ id: user.id, user_type: user.user_type }, process.env.JWT_SECRET, { expiresIn: "1d" });

//         // Set cookie — secure: true & sameSite: "none" required for cross-domain (Vercel → Render)
//         res.cookie("access_token", token, {
//             httpOnly: true,
//             secure: true,
//             sameSite: "none",
//             maxAge: 24 * 60 * 60 * 1000,
//         });

//         res.json({
//             message: "Login successful",
//             token,
//             user: { id: user.id, name: user.name, email: user.email, user_type: user.user_type },
//         });
//     } catch (err) {
//         console.error("LOGIN ERROR 👉", err.message);
//         res.status(500).json({ message: "Server error" });
//     }
// };

// exports.logoutUser = async (req, res) => {
//     try {
//         res.clearCookie("access_token", {
//             httpOnly: true,
//             secure: true,
//             sameSite: "none",
//         });
//         res.json({ message: "Logged out successfully" });
//     } catch (err) {
//         console.error("LOGOUT ERROR 👉", err.message);
//         res.status(500).json({ message: "Server error" });
//     }
// };

// exports.forgotPassword = async (req, res) => {
//     try {
//         const { email } = req.body;
//         const normalizedEmail = String(email || "").toLowerCase().trim();

//         if (!normalizedEmail) {
//             return res.status(400).json({ message: "Email is required" });
//         }

//         const userRes = await pool.query(
//             "SELECT id, email FROM users WHERE email=$1",
//             [normalizedEmail]
//         );

//         if (!userRes.rows.length) {
//             return res.json({
//                 message: "If the email exists, a reset link has been sent",
//             });
//         }

//         const rawToken = crypto.randomBytes(32).toString("hex");
//         const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
//         const expires = new Date(Date.now() + 15 * 60 * 1000);

//         await pool.query(
//             `UPDATE users
//        SET reset_password_token=$1,
//            reset_password_expires=$2
//        WHERE email=$3`,
//             [hashedToken, expires, normalizedEmail]
//         );

//         res.json({
//             message: "If the email exists, a reset link has been sent",
//         });

//         // Respond first for faster UI, then send email in background.
//         sendResetPasswordEmail(userRes.rows[0].email, rawToken)
//             .catch(err => console.error("FORGOT PASSWORD EMAIL SEND FAILED ->", err.message));
//     } catch (err) {
//         console.error("FORGOT PASSWORD ERROR ->", err.message);
//         res.status(500).json({ message: "Server error" });
//     }
// };

// exports.resetPassword = async (req, res) => {
//     try {
//         const { token } = req.params;
//         const { password } = req.body;

//         if (!password)
//             return res.status(400).json({ message: "Password is required" });

//         // 1️⃣ Hash incoming token
//         const hashedToken = crypto
//             .createHash("sha256")
//             .update(token)
//             .digest("hex");

//         // 2️⃣ Find valid token
//         const userRes = await pool.query(
//             `SELECT id FROM users
//        WHERE reset_password_token=$1
//        AND reset_password_expires > NOW()`,
//             [hashedToken]
//         );

//         if (!userRes.rows.length) {
//             return res.status(400).json({
//                 message: "Invalid or expired reset token",
//             });
//         }

//         // 3️⃣ Hash new password
//         const hashedPassword = await bcrypt.hash(password, 10);
//         await pool.query(
//             `UPDATE users
//    SET password=$1,
//        reset_password_token=NULL,
//        reset_password_expires=NULL,
//        password_changed_at=NOW()
//    WHERE id=$2`,
//             [hashedPassword, userRes.rows[0].id]
//         );

//         res.json({
//             message: "Password reset successful. You can now login.",
//         });
//     } catch (err) {
//         console.error("RESET PASSWORD ERROR 👉", err.message);
//         res.status(500).json({ message: "Server error" });
//     }
// };


// exports.checkUserStatus = async (req, res) => {
//     try {
//         const { email } = req.query;

//         if (!email) {
//             return res.status(400).json({ message: "Email is required" });
//         }

//         const result = await pool.query(
//             "SELECT is_verified FROM users WHERE email = $1",
//             [email.toLowerCase().trim()]
//         );

//         if (!result.rows.length) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         res.json({
//             verified: result.rows[0].is_verified,
//         });
//     } catch (err) {
//         console.error("CHECK USER STATUS ERROR 👉", err.message);
//         res.status(500).json({ message: "Server error" });
//     }
// };

// // Validate token - checks if the stored token is still valid
// exports.validateToken = async (req, res) => {
//     try {
//         const token = req.headers.authorization?.split(" ")[1];

//         if (!token) {
//             return res.status(401).json({ valid: false, message: "No token provided" });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         // Check if user still exists and is verified
//         const userRes = await pool.query(
//             "SELECT id, name, email, user_type, is_verified FROM users WHERE id = $1",
//             [decoded.id]
//         );

//         if (!userRes.rows.length) {
//             return res.status(401).json({ valid: false, message: "User not found" });
//         }

//         const user = userRes.rows[0];

//         if (!user.is_verified) {
//             return res.status(401).json({ valid: false, message: "User not verified" });
//         }

//         res.json({
//             valid: true,
//             user: {
//                 id: user.id,
//                 name: user.name,
//                 email: user.email,
//                 user_type: user.user_type
//             }
//         });
//     } catch (err) {
//         // Token is invalid or expired
//         return res.status(401).json({ valid: false, message: "Invalid or expired token" });
//     }
// };

const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { 
    sendVerificationEmail, 
    sendResetPasswordEmail, 
    sendWelcomeStudentEmail, 
    sendWelcomeOrganizationEmail 
} = require("../utils/sendEmail");

// --- NEW: COMPLETE PROFILE LOGIC ---
exports.completeProfile = async (req, res) => {
    try {
        const { userId } = req.body; // You can also get this from req.user.id if using auth middleware

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Update the user's profile status in the database
        const result = await pool.query(
            `UPDATE users 
             SET profile_completed = true, 
                 updated_at = NOW() 
             WHERE id = $1 
             RETURNING id, name, email, profile_completed`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            success: true,
            message: "Profile marked as completed",
            user: result.rows[0]
        });
    } catch (err) {
        console.error("COMPLETE PROFILE ERROR 👉", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, user_type, referral_code } = req.body;

        if (!name || !email || !password || !user_type) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const typeCheck = await pool.query("SELECT id FROM user_types WHERE id = $1", [user_type]);
        if (!typeCheck.rows.length) {
            return res.status(400).json({ message: "Invalid user type" });
        }

        const emailCheck = await pool.query("SELECT id FROM users WHERE email=$1", [email.toLowerCase().trim()]);
        if (emailCheck.rows.length) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const normalizedReferralCode = referral_code?.trim() || null;
        let referredByCollegeId = null;
        if (normalizedReferralCode) {
            const collegeResult = await pool.query(
                "SELECT id FROM colleges WHERE referral_code = $1",
                [normalizedReferralCode]
            );
            if (collegeResult.rows.length > 0) {
                referredByCollegeId = collegeResult.rows[0].id;
            }
        }

        await pool.query(
            `INSERT INTO users
            (name, email, password, user_type, referral_code, referred_by_college_id, verification_token)
            VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [
                name.trim(),
                email.toLowerCase().trim(),
                hashedPassword,
                user_type,
                normalizedReferralCode,
                referredByCollegeId,
                verificationToken,
            ]
        );

        res.status(201).json({
            message: "Registration successful. Check your email to verify your account.",
        });

        sendVerificationEmail(email, verificationToken)
            .catch(err => console.error("EMAIL SEND FAILED 👉", err.message));

    } catch (err) {
        console.error("REGISTER ERROR 👉", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const userRes = await pool.query(
            `SELECT id, name, email, user_type, is_verified FROM users WHERE verification_token=$1`,
            [token]
        );

        if (!userRes.rows.length) {
            return res.status(200).json({
                message: "Email already verified or token expired",
                alreadyVerified: true,
            });
        }

        const user = userRes.rows[0];

        await pool.query(
            `UPDATE users SET is_verified=true, verification_token=NULL WHERE id=$1`,
            [user.id]
        );

        res.json({
            message: "Email verified successfully",
            success: true,
        });

        const userTypeLabelMap = { 3: "Student / Professional", 4: "College", 5: "University", 6: "School", 7: "Company" };

        if (user.email) {
            const userTypeLabel = userTypeLabelMap[user.user_type] || "User";
            const sendWelcome = user.user_type === 3 ? sendWelcomeStudentEmail : sendWelcomeOrganizationEmail;
            sendWelcome(user.email, user.name, userTypeLabel).catch((emailErr) => {
                console.error("WELCOME EMAIL FAILED ->", emailErr.message);
            });
        }

    } catch (err) {
        console.error("VERIFY EMAIL ERROR 👉", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const userRes = await pool.query("SELECT id, is_verified FROM users WHERE email=$1", [email.toLowerCase().trim()]);
        if (!userRes.rows.length) return res.status(400).json({ message: "User not found" });

        const user = userRes.rows[0];
        if (user.is_verified) return res.status(400).json({ message: "Email already verified" });

        const verificationToken = crypto.randomBytes(32).toString("hex");
        await pool.query("UPDATE users SET verification_token=$1 WHERE id=$2", [verificationToken, user.id]);

        res.json({ message: "Verification email resent successfully" });
        sendVerificationEmail(email, verificationToken)
            .catch(err => console.error("RESEND EMAIL FAILED ->", err.message));
    } catch (err) {
        console.error("RESEND VERIFICATION ERROR 👉", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email & password required" });

        // 🔥 CRITICAL FIX: Added profile_completed to SELECT
        const userRes = await pool.query(
            "SELECT id, name, email, password, user_type, is_verified, profile_completed FROM users WHERE email=$1",
            [email.toLowerCase().trim()]
        );
        if (!userRes.rows.length) return res.status(400).json({ message: "Invalid credentials" });

        const user = userRes.rows[0];
        if (!user.is_verified) return res.status(403).json({ message: "Please verify your email" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, user_type: user.user_type }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.json({
            message: "Login successful",
            token,
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                user_type: user.user_type,
                profile_completed: user.profile_completed // 🔥 Fixed for frontend
            },
        });
    } catch (err) {
        console.error("LOGIN ERROR 👉", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        res.clearCookie("access_token", { httpOnly: true, secure: true, sameSite: "none" });
        res.json({ message: "Logged out successfully" });
    } catch (err) {
        console.error("LOGOUT ERROR 👉", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = String(email || "").toLowerCase().trim();
        if (!normalizedEmail) return res.status(400).json({ message: "Email is required" });

        const userRes = await pool.query("SELECT id, email FROM users WHERE email=$1", [normalizedEmail]);
        if (!userRes.rows.length) return res.json({ message: "If the email exists, a reset link has been sent" });

        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
        const expires = new Date(Date.now() + 15 * 60 * 1000);

        await pool.query(
            `UPDATE users SET reset_password_token=$1, reset_password_expires=$2 WHERE email=$3`,
            [hashedToken, expires, normalizedEmail]
        );

        res.json({ message: "If the email exists, a reset link has been sent" });
        sendResetPasswordEmail(userRes.rows[0].email, rawToken)
            .catch(err => console.error("FORGOT EMAIL FAILED ->", err.message));
    } catch (err) {
        console.error("FORGOT PASSWORD ERROR ->", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!password) return res.status(400).json({ message: "Password is required" });

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const userRes = await pool.query(
            `SELECT id FROM users WHERE reset_password_token=$1 AND reset_password_expires > NOW()`,
            [hashedToken]
        );

        if (!userRes.rows.length) return res.status(400).json({ message: "Invalid or expired reset token" });

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            `UPDATE users SET password=$1, reset_password_token=NULL, reset_password_expires=NULL, password_changed_at=NOW() WHERE id=$2`,
            [hashedPassword, userRes.rows[0].id]
        );

        res.json({ message: "Password reset successful." });
    } catch (err) {
        console.error("RESET PASSWORD ERROR 👉", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.checkUserStatus = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const result = await pool.query("SELECT is_verified FROM users WHERE email = $1", [email.toLowerCase().trim()]);
        if (!result.rows.length) return res.status(404).json({ message: "User not found" });

        res.json({ verified: result.rows[0].is_verified });
    } catch (err) {
        console.error("CHECK USER STATUS ERROR 👉", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.validateToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ valid: false, message: "No token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 🔥 CRITICAL FIX: Added profile_completed to SELECT
        const userRes = await pool.query(
            "SELECT id, name, email, user_type, is_verified, profile_completed FROM users WHERE id = $1",
            [decoded.id]
        );

        if (!userRes.rows.length) return res.status(401).json({ valid: false, message: "User not found" });

        const user = userRes.rows[0];
        if (!user.is_verified) return res.status(401).json({ valid: false, message: "User not verified" });

        res.json({
            valid: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                user_type: user.user_type,
                profile_completed: user.profile_completed // 🔥 Fixed
            }
        });
    } catch (err) {
        return res.status(401).json({ valid: false, message: "Invalid or expired token" });
    }
};