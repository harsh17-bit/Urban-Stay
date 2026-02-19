/**
 * Inquiry Model
 * Defines the schema for property inquiries on UrbanStay.com
 * Manages communication between property seekers and sellers
 * Tracks inquiry status, responses, and visit scheduling
 * 
 @module models/Inquiry
 
*/
const mongoose = require("mongoose");

/**
 * Inquiry Schema
 * Represents a communication thread between a property seeker and owner
 * Includes message tracking, visit scheduling, and response management
 */
const inquirySchema = new mongoose.Schema(
    {
        // Related Entities
        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: [true, "Property reference is required"],
            // The property being inquired about
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Sender reference is required"],
            // User making the inquiry (property seeker)
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Receiver reference is required"],
            // Property owner receiving the inquiry
        },
        
        // Inquiry Details
        message: {
            type: String,
            required: [true, "Message is required"],
            maxlength: [1000, "Message cannot exceed 1000 characters"],
        },
        inquiryType: {
            type: String,
            enum: ["general", "schedule-visit", "price-negotiation", "documents", "other"],
            default: "general",
            // Categorizes the type of inquiry
        },
        
        // Visit Scheduling
        preferredVisitDate: Date,
        preferredVisitTime: String,
        
        // Inquiry Status Tracking
        status: {
            type: String,
            enum: ["pending", "responded", "scheduled", "completed", "cancelled"],
            default: "pending",
            // Tracks inquiry lifecycle
        },
        
        // Contact Information (can override user's default)
        phone: {
            type: String,
            // Flexible format to allow international numbers
        },
        email: {
            type: String,
            // Flexible format for email contact
        },
        
        // Response Thread
        responses: [{
            message: String,
            responder: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
        
        // Read Status
        isRead: {
            type: Boolean,
            default: false,
            // Indicates if receiver has read the inquiry
        },
        readAt: Date,
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
inquirySchema.index({ property: 1, sender: 1 });
inquirySchema.index({ receiver: 1, status: 1 });
inquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Inquiry", inquirySchema);
