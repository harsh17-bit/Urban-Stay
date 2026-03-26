/**
 * @module models/Property
 */

const mongoose = require('mongoose');
const propertySchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      // Auto-generated URL-friendly version of title
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    // Pricing Information
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    priceUnit: {
      type: String,
      enum: ['total', 'per_sqft', 'per_month'],
      default: 'total',
      // Defines how price is calculated/displayed
    },

    // Property Classification
    propertyType: {
      type: String,
      enum: ['apartment', 'house', 'pg', 'plot', 'office', 'shop'],
      required: [true, 'Property type is required'],
    },
    listingType: {
      type: String,
      enum: ['buy', 'rent', 'pg'],
      required: [true, 'Listing type is required'],
      // buy: for sale, rent: for rent, pg: paying guest
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'rented', 'pending', 'draft'],
      default: 'available',
    },

    // Location Details
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        // Used for filtering and city-wise statistics
      },
      state: {
        type: String,
        required: [true, 'State is required'],
      },
      pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode'],
      },
      landmark: String,
      coordinates: {
        lat: Number,
        lng: Number,
        // Used for map display and location-based search
      },
    },

    // Property Specifications
    specifications: {
      bedrooms: {
        type: Number,
        min: [0, 'Bedrooms cannot be negative'],
      },
      bathrooms: {
        type: Number,
        min: [0, 'Bathrooms cannot be negative'],
      },
      balconies: {
        type: Number,
        min: [0, 'Balconies cannot be negative'],
      },
      carpetArea: {
        type: Number,
        min: [0, 'Carpet area cannot be negative'],
        // Usable floor area in sq ft
      },
      builtUpArea: {
        type: Number,
        min: [0, 'Built-up area cannot be negative'],
        // Includes walls and common areas
      },
      superBuiltUpArea: {
        type: Number,
        min: [0, 'Super built-up area cannot be negative'],
        // Includes all amenities and common spaces
      },
      plotArea: Number,
      totalFloors: Number,
      floorNumber: Number,
      facing: {
        type: String,
        enum: [
          'north',
          'south',
          'east',
          'west',
          'north-east',
          'north-west',
          'south-east',
          'south-west',
        ],
        // Direction property faces - important in Indian real estate
      },
      furnishing: {
        type: String,
        enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
        default: 'unfurnished',
      },
      ageOfProperty: Number,
      possessionStatus: {
        type: String,
        enum: ['ready-to-move', 'under-construction'],
        default: 'ready-to-move',
      },
      availableFrom: Date,
    },

    // Amenities - Common facilities available
    amenities: [
      {
        type: String,
        enum: [
          'parking',
          'lift',
          'power-backup',
          'gated-security',
          'swimming-pool',
          'gym',
          'clubhouse',
          'garden',
          'playground',
          'intercom',
          'fire-safety',
          'water-supply',
          'gas-pipeline',
          'air-conditioning',
          'internet',
          'cctv',
          'pet-friendly',
          'visitor-parking',
          'rainwater-harvesting',
          'solar-panels',
          'waste-disposal',
          'maintenance-staff',
          'shopping-center',
          'hospital-nearby',
        ],
      },
    ],

    // Images and Media
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        caption: String,
        isPrimary: {
          type: Boolean,
          default: false,
          // First image or marked primary shown in listings
        },
      },
    ],
    videoUrl: String,
    virtualTourUrl: String,
    // Pricing Details
    priceBreakdown: {
      basePrice: Number,
      maintenanceCharges: Number,
      bookingAmount: Number,
      stampDuty: Number,
      registrationCharges: Number,
      gst: Number,
      otherCharges: Number,
    },
    // Additional Details
    highlights: [String],
    nearbyPlaces: [
      {
        type: {
          type: String,
          enum: [
            'school',
            'hospital',
            'metro',
            'bus-stop',
            'market',
            'mall',
            'park',
            'atm',
            'restaurant',
          ],
        },
        name: String,
        distance: String,
      },
    ],
    // Owner/Agent Info
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Statistics
    views: {
      type: Number,
      default: 0,
    },
    inquiries: {
      type: Number,
      default: 0,
    },
    // Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Featured
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Enforce logical consistency for non-plot properties.
propertySchema.pre('validate', function (next) {
  if (this.propertyType === 'plot') return next();

  const bedrooms = Number(this.specifications?.bedrooms || 0);
  const bathrooms = Number(this.specifications?.bathrooms || 0);

  if (bathrooms > bedrooms) {
    this.invalidate(
      'specifications.bathrooms',
      'Bathrooms cannot be greater than bedrooms/BHK'
    );
  }

  return next();
});

// Virtual for average rating
propertySchema.virtual('averageRating', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'property',
});

// Create slug before saving
propertySchema.pre('save', async function () {
  if (this.isModified('title')) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/\s+/g, '-') +
      '-' +
      Date.now();
  }
});

// Index for search
propertySchema.index({
  title: 'text',
  description: 'text',
  'location.city': 'text',
  'location.address': 'text',
});
propertySchema.index({
  'location.city': 1,
  propertyType: 1,
  listingType: 1,
  price: 1,
});
propertySchema.index({ owner: 1 });
propertySchema.index({ status: 1, isFeatured: -1, createdAt: -1 });

module.exports = mongoose.model('Property', propertySchema);
