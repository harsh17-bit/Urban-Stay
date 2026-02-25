const express = require("express");
const router = express.Router();
const { getPricing, featureProperty, getAllPayments, getMyPayments } = require("../controllers/paymentcontroller");
const { protect, authorize } = require("../middleware/auth");

// GET /api/payments/pricing — public
router.get("/pricing", getPricing);

// GET /api/payments — admin only audit trail
router.get("/", protect, authorize("admin"), getAllPayments);

// GET /api/payments/my — seller's own payment history
router.get("/my", protect, authorize("seller", "admin"), getMyPayments);

// POST /api/payments/feature/:propertyId — seller or admin only
router.post(
    "/feature/:propertyId",
    protect,
    authorize("seller", "admin"),
    featureProperty
);

module.exports = router;
