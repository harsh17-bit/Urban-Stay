/**
 * Booking Model
 * Handles property booking confirmations between buyers and sellers
 * Tracks booking status, dates, and associated parties
 * 
 * @module models/Booking
 */

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // References
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property ID is required"],
      index: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Buyer ID is required"],
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller ID is required"],
      index: true,
    },

    // Booking Details
    bookingType: {
      type: String,
      enum: ["visit", "purchase", "rent"],
      required: [true, "Booking type is required"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
      index: true,
    },

    // Dates
    visitDate: {
      type: Date,
      required: [true, "Visit/booking date is required"],
    },
    visitTime: {
      type: String,
      required: [true, "Visit time is required"],
    },

    // Pricing (for purchase/rent confirmations)
    priceNegotiated: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    totalAmount: {
      type: Number,
      min: [0, "Amount cannot be negative"],
    },

    // Notes and Messages
    buyerMessage: {
      type: String,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    sellerConfirmationNote: {
      type: String,
      maxlength: [500, "Note cannot exceed 500 characters"],
    },

    // Confirmation Tracking
    sellerConfirmedAt: {
      type: Date,
    },
    buyerConfirmedAt: {
      type: Date,
    },
    confirmationToken: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "bookings",
  }
);

// Index for common queries
bookingSchema.index({ property: 1, buyer: 1 });
bookingSchema.index({ property: 1, seller: 1 });
bookingSchema.index({ buyer: 1, status: 1 });
bookingSchema.index({ seller: 1, status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
