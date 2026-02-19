/**
 * Booking Routes
 * API endpoints for property booking management
 * Requires authentication for all routes
 * 
 * @module routes/bookingRoutes
 */

const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  confirmBookingSeller,
  confirmBookingBuyer,
  cancelBooking,
  completeBooking,
} = require("../controllers/bookingcontroller");
const { protect } = require("../middleware/auth");

// Apply authentication middleware to all routes
router.use(protect);

/**
 * POST /api/bookings
 * Create a new booking request
 */
router.post("/", createBooking);

/**
 * GET /api/bookings
 * Get bookings for current user
 * Query params: role (buyer/seller), status (pending/confirmed/cancelled/completed)
 */
router.get("/", getBookings);

/**
 * GET /api/bookings/:id
 * Get specific booking details
 */
router.get("/:id", getBooking);

/**
 * PUT /api/bookings/:id/confirm-seller
 * Seller confirms the booking
 */
router.put("/:id/confirm-seller", confirmBookingSeller);

/**
 * PUT /api/bookings/:id/confirm-buyer
 * Buyer confirms the booking
 */
router.put("/:id/confirm-buyer", confirmBookingBuyer);

/**
 * PUT /api/bookings/:id/cancel
 * Cancel the booking
 */
router.put("/:id/cancel", cancelBooking);

/**
 * PUT /api/bookings/:id/complete
 * Mark booking as completed
 */
router.put("/:id/complete", completeBooking);

module.exports = router;
