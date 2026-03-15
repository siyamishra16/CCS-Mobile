require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const welcomeRoutes = require("./routes/welcomeRoutes");
const collegeRoutes = require("./routes/collegeRoutes");
const companyRoutes = require("./routes/companyRoutes");
const schoolRoutes = require("./routes/schoolRoutes");
const universityRoutes = require("./routes/universityRoutes");
const instituteRoutes = require("./routes/instituteRoutes");
const examManagementRoutes = require("./routes/examManagementRoutes");
const geoRoutes = require("./routes/geoRoutes");
const adminRoutes = require("./routes/adminRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const eventRoutes = require("./routes/eventRoutes");
const learningModuleRoutes = require("./routes/learningModuleRoutes");
const fundraisingRoutes = require("./routes/fundraisingRoutes");

const ensureSoftDeleteColumns = require("./utils/ensureSoftDeleteColumns");
const ensureLearningLessonPosition = require("./utils/ensureLearningLessonPosition");
const ensureLearningFinalExamSchema = require("./utils/ensureLearningFinalExamSchema");
const ensureFundraisingTables = require("./utils/ensureFundraisingTables");

const app = express();

/* =========================
   ✅ CORS CONFIG (FIXED)
========================= */

const allowedOrigins = [
  process.env.FRONTEND_URL,                 // production frontend
  "https://ccs-live.vercel.app",            // production vercel URL
  "http://localhost:3000",                  // local dev
  "http://localhost:5173"                   // vite dev
];

const isAllowedVercelPreviewOrigin = (origin) => {
  if (!origin || typeof origin !== "string") return false;
  if (!/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return false;
  return origin.includes("ccs-live");
};

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow postman / curl

    if (allowedOrigins.includes(origin) || isAllowedVercelPreviewOrigin(origin)) {
      callback(null, true);
    } else {
      callback(null, false); // do NOT throw error
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
}));

/* =========================
   Middlewares
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
   Routes
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/welcome", welcomeRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/college", collegeRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/university", universityRoutes);
app.use("/api/institute", instituteRoutes);
app.use("/api/exam-management", examManagementRoutes);
app.use("/api/geo", geoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/learning", learningModuleRoutes);
app.use("/api/fundraising", fundraisingRoutes);

/* =========================
   Start Server
========================= */

const startServer = async () => {
  try {
    await ensureSoftDeleteColumns();
    console.log("Soft-delete columns ensured");
  } catch (err) {
    console.error("Failed to ensure soft-delete columns:", err.message);
  }

  try {
    await ensureLearningLessonPosition();
    console.log("Learning lesson positions ensured");
  } catch (err) {
    console.error("Failed to ensure learning lesson positions:", err.message);
  }

  try {
    await ensureLearningFinalExamSchema();
    console.log("Learning final-exam schema ensured");
  } catch (err) {
    console.error("Failed to ensure learning final-exam schema:", err.message);
  }

  try {
    await ensureFundraisingTables();
    console.log("Fundraising tables ensured");
  } catch (err) {
    console.error("Failed to ensure fundraising tables:", err.message);
  }

  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
};

startServer();
