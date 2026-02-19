/**
 * Booking Controller
 * Handles property booking confirmations with buyer and seller
 * Manages booking creation, confirmation, and status updates
 * 
 * @module controllers/bookingController
 */

const Booking = require("../models/booking");
const Property = require("../models/property");
const User = require("../models/user");
const crypto = require("crypto");

/**
 * Create a new booking request
 * Buyer initiates booking for property visit/purchase
 * 
 * @route   POST /api/bookings
 * @access  Private (authenticated users)
 * @param   {string} req.body.propertyId - Property to book
 * @param   {string} req.body.bookingType - 'visit', 'purchase', or 'rent'
 * @param   {Date} req.body.visitDate - Desired booking date
 * @param   {string} req.body.visitTime - Desired time (e.g., "10:00-11:00")
 * @param   {string} [req.body.message] - Optional message from buyer
 * @param   {number} [req.body.priceNegotiated] - Proposed price (for purchase)
 * @returns {Object} Created booking with details
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      propertyId,
      bookingType,
      visitDate,
      visitTime,
      message,
      priceNegotiated,
    } = req.body;

    // Validate required fields
    if (!propertyId || !bookingType || !visitDate || !visitTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Fetch property with seller info
    const property = await Property.findById(propertyId).populate(
      "owner",
      "name email phone"
    );
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Prevent buyer from booking own property
    if (property.owner._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own property",
      });
    }

    // Check for duplicate pending booking
    const existingBooking = await Booking.findOne({
      property: propertyId,
      buyer: req.user.id,
      status: "pending",
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending booking for this property",
      });
    }

    // Generate unique confirmation token
    const confirmationToken = crypto.randomBytes(16).toString("hex");

    // Create booking
    const booking = await Booking.create({
      property: propertyId,
      buyer: req.user.id,
      seller: property.owner._id,
      bookingType,
      visitDate: new Date(visitDate),
      visitTime,
      buyerMessage: message || "",
      priceNegotiated: priceNegotiated || null,
      confirmationToken,
    });

    // Populate booking with details
    await booking.populate([
      { path: "property", select: "title images location price" },
      { path: "buyer", select: "name email phone avatar" },
      { path: "seller", select: "name email phone avatar" },
    ]);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get bookings for current user
 * Returns bookings where user is buyer or seller
 * 
 * @route   GET /api/bookings
 * @access  Private
 * @param   {string} [req.query.role] - Filter by 'buyer' or 'seller'
 * @param   {string} [req.query.status] - Filter by booking status
 * @returns {Object[]} Array of bookings
 */
exports.getBookings = async (req, res) => {
  try {
    const { role, status } = req.query;

    // Build filter query
    let filter = {};

    if (role === "buyer") {
      filter.buyer = req.user.id;
    } else if (role === "seller") {
      filter.seller = req.user.id;
    } else {
      // Get all bookings for user
      filter = {
        $or: [{ buyer: req.user.id }, { seller: req.user.id }],
      };
    }

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate("property", "title images location price")
      .populate("buyer", "name email phone avatar")
      .populate("seller", "name email phone avatar")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get single booking details
 * 
 * @route   GET /api/bookings/:id
 * @access  Private
 * @param   {string} req.params.id - Booking ID
 * @returns {Object} Booking details
 */
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("property")
      .populate("buyer")
      .populate("seller");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check authorization
    const isAuthorized =
      booking.buyer._id.toString() === req.user.id ||
      booking.seller._id.toString() === req.user.id;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Confirm booking as seller
 * Seller confirms the booking request
 * 
 * @route   PUT /api/bookings/:id/confirm-seller
 * @access  Private (seller only)
 * @param   {string} req.params.id - Booking ID
 * @param   {string} [req.body.note] - Seller confirmation note
 * @returns {Object} Updated booking
 */
exports.confirmBookingSeller = async (req, res) => {
  try {
    const { note } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Verify seller authorization
    if (booking.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only seller can confirm this booking",
      });
    }

    // Update booking status
    booking.status = "confirmed";
    booking.sellerConfirmedAt = new Date();
    if (note) {
      booking.sellerConfirmationNote = note;
    }

    await booking.save();

    // Populate and respond
    await booking.populate([
      { path: "property", select: "title images" },
      { path: "buyer", select: "name email phone" },
      { path: "seller", select: "name email phone" },
    ]);

    res.json({
      success: true,
      message: "Booking confirmed by seller",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Confirm booking as buyer
 * Buyer confirms after seller approves
 * 
 * @route   PUT /api/bookings/:id/confirm-buyer
 * @access  Private (buyer only)
 * @returns {Object} Updated booking
 */
exports.confirmBookingBuyer = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Verify buyer authorization
    if (booking.buyer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only buyer can confirm this booking",
      });
    }

    // Check if seller already confirmed
    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Seller must confirm first",
      });
    }

    // Mark buyer as confirmed
    booking.buyerConfirmedAt = new Date();
    await booking.save();

    await booking.populate([
      { path: "property", select: "title images" },
      { path: "buyer", select: "name email phone" },
      { path: "seller", select: "name email phone" },
    ]);

    res.json({
      success: true,
      message: "Booking confirmed by buyer",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Cancel booking
 * Either buyer or seller can cancel
 * 
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 * @returns {Object} Updated booking
 */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check authorization
    const isAuthorized =
      booking.buyer.toString() === req.user.id ||
      booking.seller.toString() === req.user.id;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    // Prevent cancellation if already completed
    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed booking",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    await booking.populate([
      { path: "property", select: "title" },
      { path: "buyer", select: "name" },
      { path: "seller", select: "name" },
    ]);

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Mark booking as completed
 * Seller marks after visit/transaction is done
 * 
 * @route   PUT /api/bookings/:id/complete
 * @access  Private (seller only)
 * @returns {Object} Updated booking
 */
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Only seller can mark as completed
    if (booking.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only seller can mark booking as completed",
      });
    }

    booking.status = "completed";
    await booking.save();

    await booking.populate([
      { path: "property", select: "title" },
      { path: "buyer", select: "name" },
    ]);

    res.json({
      success: true,
      message: "Booking marked as completed",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
