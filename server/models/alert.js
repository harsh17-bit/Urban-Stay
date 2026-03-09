const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    name: {
      type: String,
      required: [true, "Alert name is required"],
      trim: true,
      maxlength: [50, "Alert name cannot exceed 50 characters"],
    },
    // Search Criteria
    criteria: {
      listingType: {
        type: String,
        enum: ["buy", "rent", "pg"],
      },
      propertyTypes: [
        {
          type: String,
          enum: [
            "apartment",
            "house",
            "villa",
            "plot",
            "commercial",
            "office",
            "shop",
            "warehouse",
            "farmhouse",
          ],
        },
      ],
      cities: [String],
      localities: [String],
      minPrice: Number,
      maxPrice: Number,
      minBedrooms: Number,
      maxBedrooms: Number,
      minArea: Number,
      maxArea: Number,
      furnishing: [
        {
          type: String,
          enum: ["unfurnished", "semi-furnished", "fully-furnished"],
        },
      ],
      amenities: [String],
      possessionStatus: {
        type: String,
        enum: ["ready-to-move", "under-construction"],
      },
    },
    // Alert Settings
    frequency: {
      type: String,
      enum: ["instant", "daily", "weekly"],
      default: "daily",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notificationChannels: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: false,
      },
      sms: {
        type: Boolean,
        default: false,
      },
    },
    // Tracking
    lastTriggered: Date,
    matchCount: {
      type: Number,
      default: 0,
    },
    sentNotifications: [
      {
        propertyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Property",
        },
        sentAt: {
          type: Date,
          default: Date.now,
        },
        channel: String,
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient querying
alertSchema.index({ user: 1, isActive: 1 });
alertSchema.index({ isActive: 1, frequency: 1 });
alertSchema.index({ "criteria.cities": 1, "criteria.listingType": 1 });

module.exports = mongoose.model("Alert", alertSchema);
