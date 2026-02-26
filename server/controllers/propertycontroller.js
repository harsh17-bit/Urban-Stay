const Property = require("../models/property");

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
exports.getAllProperties = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {};

        // Status filter
        // - 'all'        → admin view, no filter
        // - explicit val → use it (e.g. 'available', 'sold')
        // - default      → show available + sold + rented so buyers see sold cards too
        if (req.query.status && req.query.status !== 'all') {
            filter.status = req.query.status;
        } else if (!req.query.status) {
            filter.status = { $in: ['available', 'sold', 'rented'] };
        }
        // if status=all, no status filter applied (used by admin)

        // Listing type filter
        if (req.query.listingType) {
            filter.listingType = req.query.listingType;
        }

        // Property type filter
        if (req.query.propertyType) {
            filter.propertyType = req.query.propertyType;
        }

        // City filter
        if (req.query.city) {
            filter["location.city"] = { $regex: req.query.city, $options: "i" };
        }

        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = parseInt(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = parseInt(req.query.maxPrice);
        }

        // Bedrooms filter
        if (req.query.bedrooms) {
            filter["specifications.bedrooms"] = parseInt(req.query.bedrooms);
        }

        // Area filter
        if (req.query.minArea || req.query.maxArea) {
            filter["specifications.carpetArea"] = {};
            if (req.query.minArea) filter["specifications.carpetArea"].$gte = parseInt(req.query.minArea);
            if (req.query.maxArea) filter["specifications.carpetArea"].$lte = parseInt(req.query.maxArea);
        }

        // Furnishing filter
        if (req.query.furnishing) {
            filter["specifications.furnishing"] = req.query.furnishing;
        }

        // Amenities filter
        if (req.query.amenities) {
            const amenitiesArray = req.query.amenities.split(",");
            filter.amenities = { $all: amenitiesArray };
        }

        // Featured filter
        if (req.query.featured === "true") {
            filter.isFeatured = true;
            filter.featuredUntil = { $gte: new Date() };
        }

        // Verified filter
        if (req.query.verified === "true") {
            filter.isVerified = true;
        }

        // Text search
        if (req.query.search) {
            filter.$text = { $search: req.query.search };
        }

        // Build sort object
        let sort = {};
        switch (req.query.sort) {
            case "price_low":
                sort = { price: 1 };
                break;
            case "price_high":
                sort = { price: -1 };
                break;
            case "newest":
                sort = { createdAt: -1 };
                break;
            case "oldest":
                sort = { createdAt: 1 };
                break;
            case "popular":
                sort = { views: -1 };
                break;
            default:
                sort = { isFeatured: -1, createdAt: -1 };
        }

        const properties = await Property.find(filter)
            .skip(skip)
            .limit(limit)
            .sort(sort);

        // Populate safely
        for (const prop of properties) {
            try {
                await prop.populate("owner", "name email phone avatar companyName");
            } catch (err) {
                // Ignore populate errors for list view
            }
        }

        const total = await Property.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: properties.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            properties,
        });
    } catch (error) {
        console.error("Get all properties error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching properties",
        });
    }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!require("mongoose").Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                success: false,
                message: "Property not found (Invalid ID)",
            });
        }

        const property = await Property.findById(id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found",
            });
        }

        try {
            await property.populate("owner", "name email phone avatar companyName bio reraNumber createdAt");
        } catch (popError) {
            console.warn("Populate failed for property owner:", popError.message);
        }

        // Increment views
        property.views += 1;
        await property.save();

        res.status(200).json({
            success: true,
            property,
        });
    } catch (error) {
        console.error("Get property error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching property",
        });
    }
};

// @desc    Get property by slug
// @route   GET /api/properties/slug/:slug
// @access  Public
exports.getPropertyBySlug = async (req, res) => {
    try {
        const property = await Property.findOne({ slug: req.params.slug });

        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found",
            });
        }

        try {
            await property.populate("owner", "name email phone avatar companyName bio reraNumber createdAt");
        } catch (popError) {
            console.warn("Populate failed for property slug owner:", popError.message);
        }

        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found",
            });
        }

        // Increment views
        property.views += 1;
        await property.save();

        res.status(200).json({
            success: true,
            property,
        });
    } catch (error) {
        console.error("Get property by slug error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching property",
        });
    }
};

// @desc    Create property
// @route   POST /api/properties
// @access  Private (Seller/Admin)
exports.createProperty = async (req, res) => {
    try {
        // Add owner to request body
        req.body.owner = req.user.id;

        // Parse JSON fields from FormData
        const location = req.body.location ? JSON.parse(req.body.location) : {};
        const specifications = req.body.specifications ? JSON.parse(req.body.specifications) : {};
        const amenities = req.body.amenities ? JSON.parse(req.body.amenities) : [];
        const highlights = req.body.highlights ? JSON.parse(req.body.highlights) : [];
        const priceBreakdown = req.body.priceBreakdown ? JSON.parse(req.body.priceBreakdown) : {};

        // Handle image uploads (Cloudinary)
        let images = [];
        if (req.files && req.files.length > 0) {
            // Cloudinary returns path (URL) for each uploaded file
            images = req.files.map((file, index) => ({
                url: file.path, // Cloudinary URL
                caption: "",
                isPrimary: parseInt(req.body.primaryImageIndex || 0) === index
            }));
            
            console.log("Uploaded images to Cloudinary:", images);
        } else if (req.body.images) {
            // Fallback for images in JSON format
            try {
                images = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
            } catch (e) {
                images = [];
            }
        }

        // Use placeholder if no images
        if (!images || images.length === 0) {
            images = [{ url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23e5e7eb' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E", isPrimary: true }];
        }

        const propertyData = {
            owner: req.body.owner,
            title: req.body.title,
            description: req.body.description,
            listingType: req.body.listingType,
            propertyType: req.body.propertyType,
            price: Number(req.body.price),
            location,
            specifications,
            amenities,
            highlights,
            images,
            priceBreakdown
        };

        console.log("Creating property with data:", JSON.stringify(propertyData, null, 2));

        const property = await Property.create(propertyData);

        res.status(201).json({
            success: true,
            property,
        });
    } catch (error) {
        console.error("Create property error:", error);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        
        // Send detailed validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors,
                details: error.message,
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || "Error creating property",
            error: process.env.NODE_ENV === 'development' ? error : {},
        });
    }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner/Admin)
exports.updateProperty = async (req, res) => {
    try {
        let property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found",
            });
        }

        // Check ownership (unless admin)
        if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this property",
            });
        }

        // Build update payload — supports both multipart/form-data and plain JSON
        const isMultipart = req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data');

        let updateData;
        if (isMultipart) {
            const location      = req.body.location      ? JSON.parse(req.body.location)      : undefined;
            const specifications = req.body.specifications ? JSON.parse(req.body.specifications) : undefined;
            const amenities     = req.body.amenities     ? JSON.parse(req.body.amenities)     : undefined;
            const highlights    = req.body.highlights    ? JSON.parse(req.body.highlights)    : undefined;
            const priceBreakdown = req.body.priceBreakdown ? JSON.parse(req.body.priceBreakdown) : undefined;

            // Existing images preserved from the client
            let existingImages = [];
            if (req.body.existingImages) {
                try { existingImages = JSON.parse(req.body.existingImages); } catch (e) { existingImages = []; }
            }

            // Newly uploaded files (Cloudinary)
            let newImages = [];
            if (req.files && req.files.length > 0) {
                newImages = req.files.map((file, index) => ({
                    url: file.path, // Cloudinary URL
                    caption: "",
                    isPrimary: false,
                }));
            }

            const allImages = [...existingImages, ...newImages];
            // Ensure at least one primary
            if (allImages.length > 0 && !allImages.some(img => img.isPrimary)) {
                allImages[0].isPrimary = true;
            }

            updateData = {
                ...(req.body.title       && { title: req.body.title }),
                ...(req.body.description && { description: req.body.description }),
                ...(req.body.listingType  && { listingType: req.body.listingType }),
                ...(req.body.propertyType && { propertyType: req.body.propertyType }),
                ...(req.body.price       && { price: Number(req.body.price) }),
                ...(location      && { location }),
                ...(specifications && { specifications }),
                ...(amenities     && { amenities }),
                ...(highlights    && { highlights }),
                ...(priceBreakdown && { priceBreakdown }),
                ...(allImages.length > 0 && { images: allImages }),
            };
        } else {
            updateData = req.body;
        }

        property = await Property.findByIdAndUpdate(req.params.id, updateData, {
            returnDocument: 'after',
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            property,
        });
    } catch (error) {
        console.error("Update property error:", error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, message: "Validation failed", details: error.message, errors });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Error updating property",
        });
    }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner/Admin)
exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found",
            });
        }

        // Check ownership (unless admin)
        if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this property",
            });
        }

        await property.deleteOne();

        res.status(200).json({
            success: true,
            message: "Property deleted successfully",
        });
    } catch (error) {
        console.error("Delete property error:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting property",
        });
    }
};

// @desc    Get my properties
// @route   GET /api/properties/my
// @access  Private
exports.getMyProperties = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { owner: req.user.id };
        if (req.query.status) filter.status = req.query.status;

        const properties = await Property.find(filter)
            .skip(skip)
            .limit(limit)
            .sort("-createdAt");

        // Populate safely
        for (const prop of properties) {
            try {
                await prop.populate("owner", "name email phone avatar companyName");
            } catch (err) { }
        }

        const total = await Property.countDocuments(filter);

        // Get stats
        const stats = await Property.aggregate([
            { $match: { owner: req.user._id } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalViews: { $sum: "$views" },
                    totalInquiries: { $sum: "$inquiries" },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            count: properties.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            stats,
            properties,
        });
    } catch (error) {
        console.error("Get my properties error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching properties",
        });
    }
};

// @desc    Get similar properties
// @route   GET /api/properties/:id/similar
// @access  Public
exports.getSimilarProperties = async (req, res) => {
    try {
        const { id } = req.params;

        if (!require("mongoose").Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                success: false,
                message: "Property not found (Invalid ID)",
            });
        }

        const property = await Property.findById(id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found",
            });
        }

        const similarProperties = await Property.find({
            _id: { $ne: property._id },
            status: "available",
            listingType: property.listingType,
            $or: [
                { "location.city": property.location.city },
                { propertyType: property.propertyType },
                {
                    price: {
                        $gte: property.price * 0.8,
                        $lte: property.price * 1.2,
                    },
                },
            ],
        })
            .limit(6)
            .sort("-createdAt");

        for (const prop of similarProperties) {
            try {
                await prop.populate("owner", "name avatar");
            } catch (err) { }
        }

        res.status(200).json({
            success: true,
            properties: similarProperties,
        });
    } catch (error) {
        console.error("Get similar properties error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching similar properties",
        });
    }
};

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
exports.getFeaturedProperties = async (req, res) => {
    try {
        const properties = await Property.find({
            status: "available",
            isFeatured: true,
            featuredUntil: { $gte: new Date() },
        })
            .limit(8)
            .sort("-createdAt");

        for (const prop of properties) {
            try {
                await prop.populate("owner", "name avatar");
            } catch (err) { }
        }

        res.status(200).json({
            success: true,
            properties,
        });
    } catch (error) {
        console.error("Get featured properties error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching featured properties",
        });
    }
};

// @desc    Get property count by city
// @route   GET /api/properties/stats/cities
// @access  Public
exports.getPropertyCountByCity = async (req, res) => {
    try {
        const cities = await Property.aggregate([
            { $match: { status: "available" } },
            {
                $group: {
                    _id: "$location.city",
                    count: { $sum: 1 },
                    avgPrice: { $avg: "$price" },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        res.status(200).json({
            success: true,
            cities,
        });
    } catch (error) {
        console.error("Get property count by city error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching city stats",
        });
    }
};

// @desc    Verify property (Admin)
// @route   PUT /api/properties/:id/verify
// @access  Private/Admin
exports.verifyProperty = async (req, res) => {
    try {
        const property = await Property.findByIdAndUpdate(
            req.params.id,
            {
                isVerified: true,
                verifiedAt: new Date(),
                verifiedBy: req.user.id,
            },
            { returnDocument: 'after' }
        );

        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found",
            });
        }

        res.status(200).json({
            success: true,
            property,
        });
    } catch (error) {
        console.error("Verify property error:", error);
        res.status(500).json({
            success: false,
            message: "Error verifying property",
        });
    }
};

// @desc    Feature property (Admin)
// @route   PUT /api/properties/:id/feature
// @access  Private/Admin
exports.featureProperty = async (req, res) => {
    try {
        const { days } = req.body;
        const featuredUntil = new Date();
        featuredUntil.setDate(featuredUntil.getDate() + (days || 30));

        const property = await Property.findByIdAndUpdate(
            req.params.id,
            {
                isFeatured: true,
                featuredUntil,
            },
            { returnDocument: 'after' }
        );

        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found",
            });
        }

        res.status(200).json({
            success: true,
            property,
        });
    } catch (error) {
        console.error("Feature property error:", error);
        res.status(500).json({
            success: false,
            message: "Error featuring property",
        });
    }
};

// @desc    Get admin stats
// @route   GET /api/properties/stats/admin
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
    try {
        const totalProperties = await Property.countDocuments();
        const activeProperties = await Property.countDocuments({ status: "available" });
        const pendingProperties = await Property.countDocuments({ status: "pending" });
        const verifiedProperties = await Property.countDocuments({ isVerified: true });

        const propertyByType = await Property.aggregate([
            {
                $group: {
                    _id: "$propertyType",
                    count: { $sum: 1 },
                },
            },
        ]);

        const propertyByListing = await Property.aggregate([
            {
                $group: {
                    _id: "$listingType",
                    count: { $sum: 1 },
                },
            },
        ]);

        const recentProperties = await Property.find()
            .sort("-createdAt")
            .limit(5);

        for (const prop of recentProperties) {
            try {
                await prop.populate("owner", "name email");
            } catch (err) { }
        }

        res.status(200).json({
            success: true,
            stats: {
                totalProperties,
                activeProperties,
                pendingProperties,
                verifiedProperties,
                propertyByType,
                propertyByListing,
            },
            recentProperties,
        });
    } catch (error) {
        console.error("Get admin stats error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching admin stats",
        });
    }
};