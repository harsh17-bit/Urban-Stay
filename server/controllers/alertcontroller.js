const Alert = require("../models/alert");
const Property = require("../models/property");

exports.createAlert = async (req, res) => {
    try {
        const userAlerts = await Alert.countDocuments({ user: req.user.id, isActive: true });
        if (userAlerts >= 10) return res.status(400).json({ success: false, message: "Maximum 10 alerts allowed" });

        const alert = await Alert.create({ ...req.body, user: req.user.id });
        res.status(201).json({ success: true, alert });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || "Error creating alert" });
    }
};

exports.getMyAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({ user: req.user.id }).sort("-createdAt");
        res.status(200).json({ success: true, alerts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching alerts" });
    }
};

exports.getAlert = async (req, res) => {
    try {
        const alert = await Alert.findOne({ _id: req.params.id, user: req.user.id });
        if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });
        res.status(200).json({ success: true, alert });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching alert" });
    }
};

exports.updateAlert = async (req, res) => {
    try {
        const alert = await Alert.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id }, req.body, { returnDocument: 'after', runValidators: true }
        );
        if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });
        res.status(200).json({ success: true, alert });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating alert" });
    }
};

exports.deleteAlert = async (req, res) => {
    try {
        const alert = await Alert.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });
        res.status(200).json({ success: true, message: "Alert deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting alert" });
    }
};

exports.toggleAlertStatus = async (req, res) => {
    try {
        const alert = await Alert.findOne({ _id: req.params.id, user: req.user.id });
        if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });
        alert.isActive = !alert.isActive;
        await alert.save();
        res.status(200).json({ success: true, alert });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error toggling alert" });
    }
};

exports.getMatchingProperties = async (req, res) => {
    try {
        const alert = await Alert.findOne({ _id: req.params.id, user: req.user.id });
        if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });

        const filter = { status: "available" };
        if (alert.criteria.listingType) filter.listingType = alert.criteria.listingType;
        if (alert.criteria.propertyTypes?.length) filter.propertyType = { $in: alert.criteria.propertyTypes };
        if (alert.criteria.cities?.length) filter["location.city"] = { $in: alert.criteria.cities.map(c => new RegExp(c, "i")) };
        if (alert.criteria.minPrice || alert.criteria.maxPrice) {
            filter.price = {};
            if (alert.criteria.minPrice) filter.price.$gte = alert.criteria.minPrice;
            if (alert.criteria.maxPrice) filter.price.$lte = alert.criteria.maxPrice;
        }
        if (alert.criteria.minBedrooms) filter["specifications.bedrooms"] = { $gte: alert.criteria.minBedrooms };

        const properties = await Property.find(filter).populate("owner", "name avatar").limit(20).sort("-createdAt");
        res.status(200).json({ success: true, properties });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching matching properties" });
    }
};
