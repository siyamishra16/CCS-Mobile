const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { imageUpload } = require("../middleware/upload");
const {
    createEvent,
    getMyEvents,
    getMyEventById,
    updateMyEvent,
    deleteMyEvent,
    updateMyEventStatus,
    getStudentEventFeed,
    getPublicEventFeed,
    getPublicEventById,
    applyToEvent,
    getEventApplicationsForOrganizer,
} = require("../controllers/eventController");

const router = express.Router();

router.get("/public/feed", getPublicEventFeed);
router.get("/public/:eventId", getPublicEventById);
router.use(authMiddleware);
router.post("/", imageUpload.single("eventMedia"), createEvent);
router.get("/my", getMyEvents);
router.get("/my/:eventId", getMyEventById);
router.put("/my/:eventId", imageUpload.single("eventMedia"), updateMyEvent);
router.delete("/my/:eventId", deleteMyEvent);
router.patch("/my/:eventId/status", updateMyEventStatus);
router.get("/feed", getStudentEventFeed);
router.post("/:eventId/apply", applyToEvent);
router.get("/my/:eventId/applications", getEventApplicationsForOrganizer);

module.exports = router;
