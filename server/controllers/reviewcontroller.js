const Review = require("../models/review");
const Property = require("../models/property");

exports.createReview = async (req, res) => {
    try {
        const { propertyId, rating, title, comment, ratings, pros, cons } = req.body;
        const property = await Property.findById(propertyId);
        if (!property) return res.status(404).json({ success: false, message: "Property not found" });

        const existingReview = await Review.findOne({ property: propertyId, user: req.user.id });
        if (existingReview) return res.status(400).json({ success: false, message: "Already reviewed" });

        const review = await Review.create({
            property: propertyId, user: req.user.id, rating, title, comment, ratings, pros, cons
        });
        await review.populate("user", "name avatar");
        res.status(201).json({ success: true, review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || "Error creating review" });
    }
};

exports.getPropertyReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filter = { property: req.params.propertyId, status: "approved" };

        const reviews = await Review.find(filter)
            .populate("user", "name avatar")
            .skip((page - 1) * limit).limit(limit).sort("-createdAt");
        const total = await Review.countDocuments(filter);

        res.status(201).json({ success: true, count: reviews.length, total, page, pages: Math.ceil(total / limit), reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching reviews" });
    }
};

exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user.id })
            .populate("property", "title images location").sort("-createdAt");
        res.status(201).json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching reviews" });
    }
};

exports.updateReview = async (req, res) => {
    try {
        let review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });
        if (review.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Not authorized" });

        review = await Review.findByIdAndUpdate(req.params.id, { ...req.body, status: "pending" }, { returnDocument: 'after' });
        res.status(200).json({ success: true, review });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating review" });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });
        if (review.user.toString() !== req.user.id && req.user.role !== "admin")
            return res.status(403).json({ success: false, message: "Not authorized" });
        await review.deleteOne();
        res.status(200).json({ success: true, message: "Review deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting review" });
    }
};

exports.voteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });

        const existingVote = review.votedBy.find(v => v.user.toString() === req.user.id);
        if (existingVote) {
            if (existingVote.isHelpful !== req.body.isHelpful) {
                existingVote.isHelpful = req.body.isHelpful;
                review.helpfulVotes += req.body.isHelpful ? 1 : -1;
            }
        } else {
            review.votedBy.push({ user: req.user.id, isHelpful: req.body.isHelpful });
            if (req.body.isHelpful) review.helpfulVotes += 1;
        }
        await review.save();
        res.status(200).json({ success: true, helpfulVotes: review.helpfulVotes });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error voting" });
    }
};

exports.respondToReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id).populate("property");
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });
        if (review.property.owner.toString() !== req.user.id)
            return res.status(403).json({ success: false, message: "Only owner can respond" });
        review.ownerResponse = { message: req.body.message, respondedAt: new Date() };
        await review.save();
        res.status(200).json({ success: true, review });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error responding" });
    }
};

exports.moderateReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, {
            status: req.body.status,
            rejectionReason: req.body.status === "rejected" ? req.body.rejectionReason : undefined
        }, { returnDocument: 'after' });
        res.status(200).json({ success: true, review });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error moderating review" });
    }
};

exports.getPendingReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ status: "pending" })
            .populate("user", "name avatar email").populate("property", "title location").sort("-createdAt");
        res.status(200).json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching pending reviews" });
    }
};
