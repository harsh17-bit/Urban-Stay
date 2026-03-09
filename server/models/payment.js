const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 499,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["captured", "failed", "refunded"],
      default: "captured",
    },
    method: {
      type: String,
      default: "mock",
    },
    plan: {
      type: String,
      default: "Featured Listing — 30 days",
    },
    featuredUntil: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
