const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  getAllProperties, getProperty, getPropertyBySlug, createProperty, updateProperty,
  deleteProperty, getMyProperties, getSimilarProperties, getFeaturedProperties,
  getPropertyCountByCity, verifyProperty, featureProperty, getAdminStats
} = require("../controllers/propertycontroller");
const { protect, authorize, optionalAuth } = require("../middleware/auth");

// Storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/propertyimages'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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
router.post("/", protect, authorize("seller", "admin"), upload.array('images', 10), createProperty);
router.put("/:id/verify", protect, authorize("admin"), verifyProperty);
router.put("/:id/feature", protect, authorize("admin"), featureProperty);
router.put("/:id", protect, updateProperty);
router.delete("/:id", protect, deleteProperty);

module.exports = router;