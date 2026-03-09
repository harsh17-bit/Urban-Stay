/**
 * Inquiry Controller
 * Handles property inquiry management including creating inquiries,
 * viewing received/sent inquiries, and status updates
 *
 * @module controllers/inquiryController
 */

const Inquiry = require("../models/inquiry");
const Property = require("../models/property");
const User = require("../models/user");
const {
  sendInquiryNotification,
  sendInquiryReplyNotification,
} = require("../utils/email");

/**
 * Create a new property inquiry
 * Sends inquiry to property owner and email notification
 * Prevents duplicate pending inquiries for same property
 *
 * @route   POST /api/inquiries
 * @access  Private (authenticated users only)
 * @param   {Object} req.body - Inquiry details
 * @param   {string} req.body.propertyId - Property being inquired about
 * @param   {string} req.body.message - Inquiry message
 * @param   {string} req.body.inquiryType - Type: 'buy', 'rent', 'visit'
 * @param   {Date} [req.body.preferredVisitDate] - Optional visit date
 * @param   {string} [req.body.preferredVisitTime] - Optional visit time
 * @param   {string} [req.body.phone] - Contact phone (defaults to user's)
 * @param   {string} [req.body.email] - Contact email (defaults to user's)
 * @returns {Object} Created inquiry with property and sender details
 */
exports.createInquiry = async (req, res) => {
  try {
    const {
      propertyId,
      message,
      inquiryType,
      preferredVisitDate,
      preferredVisitTime,
      phone,
      email,
    } = req.body;

    // Fetch property and populate owner details for email notification
    const property = await Property.findById(propertyId).populate(
      "owner",
      "name email",
    );
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Prevent duplicate PENDING inquiries to avoid spam
    // (allow re-inquiry if previous was responded/cancelled/completed)
    const existingInquiry = await Inquiry.findOne({
      property: propertyId,
      sender: req.user.id,
      status: { $in: ["pending"] },
    });

    if (existingInquiry) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending inquiry for this property",
      });
    }

    // Create inquiry record
    const inquiry = await Inquiry.create({
      property: propertyId,
      sender: req.user.id,
      receiver: property.owner._id,
      message,
      inquiryType,
      preferredVisitDate,
      preferredVisitTime,
      phone: phone || req.user.phone,
      email: email || req.user.email,
    });

    // Update property inquiry count for analytics
    property.inquiries += 1;
    await property.save();

    // Populate inquiry with related data for response
    await inquiry.populate([
      { path: "property", select: "title images location price" },
      { path: "sender", select: "name email avatar" },
    ]);

    // Send email notification to property owner (non-blocking)
    try {
      await sendInquiryNotification({
        ownerEmail: property.owner.email,
        propertyTitle: property.title,
        inquiryType: inquiryType || "general",
        userName: req.user.name,
        userEmail: req.user.email,
        phone: phone || req.user.phone,
        message: message,
        preferredVisitDate: preferredVisitDate,
        preferredVisitTime: preferredVisitTime,
      });
    } catch (emailError) {
      console.error("Email notification failed:", emailError.message);
      // Continue even if email fails - inquiry is still created
    }

    res.status(201).json({
      success: true,
      inquiry,
    });
  } catch (error) {
    console.error("Create inquiry error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error creating inquiry",
    });
  }
};

/**
 * Get inquiries received by current user (for property owners/sellers)
 * Supports pagination and filtering by status or specific property
 *
 * @route   GET /api/inquiries/received
 * @access  Private (sellers only)
 * @param   {number} [req.query.page=1] - Page number
 * @param   {number} [req.query.limit=10] - Items per page
 * @param   {string} [req.query.status] - Filter by status
 * @param   {string} [req.query.property] - Filter by property ID
 * @returns {Object} Paginated inquiries with property and sender details
 */
exports.getReceivedInquiries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter for received inquiries
    const filter = { receiver: req.user.id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.property) filter.property = req.query.property;

    const inquiries = await Inquiry.find(filter)
      .populate("property", "title images location price")
      .populate("sender", "name email phone avatar")
      .skip(skip)
      .limit(limit)
      .sort("-createdAt");

    const total = await Inquiry.countDocuments(filter);
    const unreadCount = await Inquiry.countDocuments({
      receiver: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      unreadCount,
      inquiries,
    });
  } catch (error) {
    console.error("Get received inquiries error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching inquiries",
    });
  }
};

// @desc    Get sent inquiries (for users)
// @route   GET /api/inquiries/sent
// @access  Private
exports.getSentInquiries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { sender: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const inquiries = await Inquiry.find(filter)
      .populate("property", "title images location price")
      .populate("receiver", "name email phone avatar companyName")
      .skip(skip)
      .limit(limit)
      .sort("-createdAt");

    const total = await Inquiry.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: inquiries.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      inquiries,
    });
  } catch (error) {
    console.error("Get sent inquiries error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching inquiries",
    });
  }
};

// @desc    Get single inquiry
// @route   GET /api/inquiries/:id
// @access  Private
exports.getInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate("property", "title images location price slug")
      .populate("sender", "name email phone avatar")
      .populate("receiver", "name email phone avatar companyName")
      .populate("responses.responder", "name avatar");

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    // Check if user is sender or receiver
    if (
      inquiry.sender._id.toString() !== req.user.id &&
      inquiry.receiver._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this inquiry",
      });
    }

    // Mark as read if receiver is viewing
    if (inquiry.receiver._id.toString() === req.user.id && !inquiry.isRead) {
      inquiry.isRead = true;
      inquiry.readAt = new Date();
      await inquiry.save();
    }

    // Mark reply as read if sender (buyer) is viewing and there are responses
    if (
      inquiry.sender._id.toString() === req.user.id &&
      !inquiry.replyRead &&
      inquiry.responses.length > 0
    ) {
      inquiry.replyRead = true;
      await inquiry.save();
    }

    res.status(200).json({
      success: true,
      inquiry,
    });
  } catch (error) {
    console.error("Get inquiry error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching inquiry",
    });
  }
};

// @desc    Respond to inquiry
// @route   POST /api/inquiries/:id/respond
// @access  Private
exports.respondToInquiry = async (req, res) => {
  try {
    const { message } = req.body;

    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    // Only sender or receiver can respond
    if (
      inquiry.sender.toString() !== req.user.id &&
      inquiry.receiver.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to respond to this inquiry",
      });
    }

    inquiry.responses.push({
      message,
      responder: req.user.id,
    });

    // Update status if owner is responding for first time
    if (
      inquiry.receiver.toString() === req.user.id &&
      inquiry.status === "pending"
    ) {
      inquiry.status = "responded";
    }

    // Reset replyRead so buyer sees the "New Reply" chip again
    if (inquiry.receiver.toString() === req.user.id) {
      inquiry.replyRead = false;
    }

    await inquiry.save();

    // Populate for response and for email details
    await inquiry.populate([
      { path: "sender", select: "name email" },
      { path: "receiver", select: "name email" },
      { path: "property", select: "title" },
      { path: "responses.responder", select: "name avatar" },
    ]);

    // Notify the other party via email (non-blocking)
    try {
      const isSenderReplying = inquiry.sender._id.toString() === req.user.id;
      const notifyUser = isSenderReplying ? inquiry.receiver : inquiry.sender;
      const replierName =
        req.user.name ||
        (isSenderReplying ? inquiry.sender.name : inquiry.receiver.name);

      await sendInquiryReplyNotification({
        toEmail: notifyUser.email,
        toName: notifyUser.name,
        replierName,
        propertyTitle: inquiry.property?.title || "the property",
        replyMessage: message,
        inquiryId: inquiry._id.toString(),
      });
    } catch (emailErr) {
      console.error(
        "Reply notification email failed (non-fatal):",
        emailErr.message,
      );
    }

    res.status(200).json({
      success: true,
      inquiry,
    });
  } catch (error) {
    console.error("Respond to inquiry error details:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error responding to inquiry: " + error.message,
    });
  }
};

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id/status
// @access  Private
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    // Only receiver can update status
    if (inquiry.receiver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this inquiry",
      });
    }

    inquiry.status = status;
    await inquiry.save();

    res.status(200).json({
      success: true,
      inquiry,
    });
  } catch (error) {
    console.error("Update inquiry status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating inquiry status",
    });
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private
exports.deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    // Only sender can delete their inquiry
    if (
      inquiry.sender.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this inquiry",
      });
    }

    await inquiry.deleteOne();

    res.status(200).json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (error) {
    console.error("Delete inquiry error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting inquiry",
    });
  }
};

// @desc    Get inquiry stats
// @route   GET /api/inquiries/stats
// @access  Private
exports.getInquiryStats = async (req, res) => {
  try {
    const receivedStats = await Inquiry.aggregate([
      { $match: { receiver: req.user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const sentStats = await Inquiry.aggregate([
      { $match: { sender: req.user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalReceived = await Inquiry.countDocuments({
      receiver: req.user.id,
    });
    const totalSent = await Inquiry.countDocuments({ sender: req.user.id });
    const unread = await Inquiry.countDocuments({
      receiver: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      stats: {
        received: {
          total: totalReceived,
          unread,
          byStatus: receivedStats,
        },
        sent: {
          total: totalSent,
          byStatus: sentStats,
        },
      },
    });
  } catch (error) {
    console.error("Get inquiry stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching inquiry stats",
    });
  }
};
