const express = require("express");
const router = express.Router();
const {
  createInquiry,
  getReceivedInquiries,
  getSentInquiries,
  getInquiry,
  respondToInquiry,
  updateInquiryStatus,
  deleteInquiry,
  getInquiryStats,
} = require("../controllers/inquirycontroller");
const { protect } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

router.post("/", createInquiry);
router.get("/received", getReceivedInquiries);
router.get("/sent", getSentInquiries);
router.get("/stats", getInquiryStats);
router.get("/:id", getInquiry);
router.post("/:id/respond", respondToInquiry);
router.put("/:id/status", updateInquiryStatus);
router.delete("/:id", deleteInquiry);

module.exports = router;
