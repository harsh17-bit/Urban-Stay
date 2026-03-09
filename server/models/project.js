const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Location Details
    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
      },
      pincode: {
        type: String,
        required: [true, "Pincode is required"],
      },
      landmark: String,
    },
    // Project Configuration
    configuration: {
      bhkTypes: [String], // e.g., ["2 BHK", "3 BHK"]
      priceRange: {
        min: Number,
        max: Number,
      },
      areaRange: {
        min: Number,
        max: Number,
      },
    },
    amenities: [
      {
        type: String,
        enum: [
          "parking",
          "lift",
          "power-backup",
          "gated-security",
          "swimming-pool",
          "gym",
          "clubhouse",
          "garden",
          "playground",
          "intercom",
          "fire-safety",
          "water-supply",
          "gas-pipeline",
          "air-conditioning",
          "internet",
          "cctv",
          "pet-friendly",
          "visitor-parking",
          "rainwater-harvesting",
          "solar-panels",
          "waste-disposal",
          "maintenance-staff",
          "shopping-center",
          "hospital-nearby",
        ],
      },
    ],
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        caption: String,
      },
    ],
    status: {
      type: String,
      enum: ["coming-soon", "under-construction", "ready-to-move", "completed"],
      default: "under-construction",
    },
    reraId: String,
    possessionDate: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Create slug before saving
projectSchema.pre("save", async function () {
  if (this.isModified("title")) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, "-") +
      "-" +
      Date.now();
  }
});

module.exports = mongoose.model("Project", projectSchema);
