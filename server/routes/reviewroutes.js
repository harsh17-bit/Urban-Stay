const express = require("express");
const router = express.Router();
const {
  createReview,
  getPropertyReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  voteReview,
  respondToReview,
  moderateReview,
  getPendingReviews,
} = require("../controllers/reviewcontroller");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.get("/property/:propertyId", getPropertyReviews);

// Protected routes
router.post("/", protect, createReview);
router.get("/my", protect, getMyReviews);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);
router.put("/:id/vote", protect, voteReview);
router.post("/:id/respond", protect, respondToReview);

// Admin routes
router.get("/pending", protect, authorize("admin"), getPendingReviews);
router.put("/:id/moderate", protect, authorize("admin"), moderateReview);

module.exports = router;
