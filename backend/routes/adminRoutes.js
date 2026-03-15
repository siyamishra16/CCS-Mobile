const express = require("express");
const {
  getUsers,
  getJobs,
  getJobsSummary,
  getReferralSummary,
  getReferrals,
  getSignupSummary,
  getSignups,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/users", getUsers);
router.get("/jobs", getJobs);
router.get("/jobs/summary", getJobsSummary);
router.get("/referrals/summary", getReferralSummary);
router.get("/referrals", getReferrals);
router.get("/signups/summary", getSignupSummary);
router.get("/signups", getSignups);


module.exports = router;
