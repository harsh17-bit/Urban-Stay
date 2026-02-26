const express = require("express");
const router = express.Router();
const {
  getAllProperties, getProperty, getPropertyBySlug, createProperty, updateProperty,
  deleteProperty, getMyProperties, getSimilarProperties, getFeaturedProperties,
  getPropertyCountByCity, verifyProperty, featureProperty, getAdminStats
} = require("../controllers/propertycontroller");
const { protect, authorize, optionalAuth } = require("../middleware/auth");
const { uploadPropertyImages } = require("../config/cloudinary");

// Public routes
router.get("/", getAllProperties);
router.get("/featured", getFeaturedProperties);
router.get("/stats/cities", getPropertyCountByCity);

// Protected routes (Static first)
router.get("/user/my", protect, getMyProperties);

// Admin routes (Static first)
router.get("/stats/admin", protect, authorize("admin"), getAdminStats);

// Dynamic public routes (slug/ID)
router.get("/slug/:slug", optionalAuth, getPropertyBySlug);
router.get("/:id", optionalAuth, getProperty);
router.get("/:id/similar", getSimilarProperties);

// Protected routes (Dynamic)
router.post("/", protect, authorize("seller", "admin"), uploadPropertyImages.array('images', 10), createProperty);
router.put("/:id/verify", protect, authorize("admin"), verifyProperty);
router.put("/:id/feature", protect, authorize("admin"), featureProperty);
router.put("/:id", protect, uploadPropertyImages.array('images', 10), updateProperty);
router.delete("/:id", protect, deleteProperty);

module.exports = router;