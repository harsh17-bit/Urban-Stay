const Property = require("../models/property");
const Payment = require("../models/payment");

// GET /api/payments/pricing
const getPricing = async (req, res) => {
    res.json({
        success: true,
        pricing: {
            amount: 499,
            currency: "INR",
            duration: "30 days",
            label: "Featured Listing",
            benefits: [
                "Highlighted in Featured Properties section on the homepage",
                "Priority placement in search results",
                "Star badge on your listing",
                "30 days of featured visibility",
            ],
        },
    });
};

// POST /api/payments/feature/:propertyId
// Mock payment — simulates a successful transaction and marks the property as featured.
const featureProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;

        // Verify the property belongs to the authenticated seller
        const property = await Property.findById(propertyId);

        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found." });
        }

        // Allow admin or the owning seller to feature the property
        const isOwner =
            property.seller?.toString() === req.user._id.toString() ||
            property.owner?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to feature this property.",
            });
        }

        // Reject if already featured and the period hasn't expired yet
        if (property.isFeatured && property.featuredUntil && new Date(property.featuredUntil) > new Date()) {
            return res.status(400).json({
                success: false,
                message: `This property is already featured until ${new Date(property.featuredUntil).toLocaleDateString()}.`,
            });
        }

        // Calculate featuredUntil = now + 30 days
        const featuredUntil = new Date();
        featuredUntil.setDate(featuredUntil.getDate() + 30);

        const updatedProperty = await Property.findByIdAndUpdate(
            propertyId,
            { isFeatured: true, featuredUntil },
            { new: true }
        );

        // Persist payment record for admin audit trail
        const txnId = `TXN-MOCK-${Date.now()}`;
        await Payment.create({
            transactionId: txnId,
            property: updatedProperty._id,
            seller: req.user._id,
            amount: 499,
            currency: "INR",
            status: "captured",
            method: "mock",
            plan: "Featured Listing — 30 days",
            featuredUntil,
        });

        return res.json({
            success: true,
            message: "Your property has been featured for 30 days!",
            property: {
                _id: updatedProperty._id,
                title: updatedProperty.title,
                isFeatured: updatedProperty.isFeatured,
                featuredUntil: updatedProperty.featuredUntil,
            },
            transaction: {
                id: txnId,
                amount: 499,
                currency: "INR",
                status: "captured",
                method: "mock",
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("featureProperty error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again.",
        });
    }
};

// GET /api/payments/my — seller's own payments
const getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ seller: req.user._id })
            .populate("property", "title location")
            .sort({ createdAt: -1 });

        return res.json({ success: true, payments });
    } catch (error) {
        console.error("getMyPayments error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch payments." });
    }
};

// GET /api/payments — admin only
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate("property", "title location")
            .populate("seller", "name email phone")
            .sort({ createdAt: -1 });

        const total = payments.reduce((sum, p) => sum + p.amount, 0);

        return res.json({
            success: true,
            count: payments.length,
            totalRevenue: total,
            payments,
        });
    } catch (error) {
        console.error("getAllPayments error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch payments." });
    }
};

module.exports = { getPricing, featureProperty, getAllPayments, getMyPayments };
