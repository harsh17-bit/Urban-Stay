const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property reference is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    ratings: {
      location: {
        type: Number,
        min: 1,
        max: 5,
      },
      valueForMoney: {
        type: Number,
        min: 1,
        max: 5,
      },
      amenities: {
        type: Number,
        min: 1,
        max: 5,
      },
      connectivity: {
        type: Number,
        min: 1,
        max: 5,
      },
      safety: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    pros: [String],
    cons: [String],
    images: [String],
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    votedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        isHelpful: Boolean,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: String,
    ownerResponse: {
      message: String,
      respondedAt: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent multiple reviews from same user for same property
reviewSchema.index({ property: 1, user: 1 }, { unique: true });
reviewSchema.index({ property: 1, status: 1, createdAt: -1 });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function (propertyId) {
  const result = await this.aggregate([
    { $match: { property: propertyId, status: "approved" } },
    {
      $group: {
        _id: "$property",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    const Property = mongoose.model("Property");
    if (result.length > 0) {
      await Property.findByIdAndUpdate(propertyId, {
        averageRating: Math.round(result[0].averageRating * 10) / 10,
        totalReviews: result[0].totalReviews,
      });
    } else {
      await Property.findByIdAndUpdate(propertyId, {
        averageRating: 0,
        totalReviews: 0,
      });
    }
  } catch (error) {
    console.error("Error updating property rating:", error);
  }
};

// Update average rating after save
reviewSchema.post("save", function () {
  this.constructor.calculateAverageRating(this.property);
});

// Update average rating after remove
reviewSchema.post("remove", function () {
  this.constructor.calculateAverageRating(this.property);
});

module.exports = mongoose.model("Review", reviewSchema);
