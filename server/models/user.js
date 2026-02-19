/**
 * User Model
 * Defines the schema for all users on UrbanStay.com platform
 * Supports three user roles: regular users, property sellers, and admins
 * Handles authentication, profiles, and favorites
 * 
 * @module models/User
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Schema
 * Contains user account information, authentication data,
 * personal details, and role-specific fields
 */
const userSchema = new mongoose.Schema(
    {
        // Core Account Information
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
            // Used for login and communication
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false,
            // Hashed using bcrypt before storage
        },
        phone: {
            type: String,
            trim: true,
            match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
        },
        avatar: {
            type: String,
            default: "",
            // URL to profile picture
        },
        
        // User Role and Verification
        role: {
            type: String,
            enum: ["user", "seller", "admin"],
            default: "user",
            // user: property seeker, seller: property owner, admin: platform admin
        },
        isVerified: {
            type: Boolean,
            default: false,
            // Email verification status
        },
        
        // User Preferences
        favorites: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Property",
            },
        ],
        
        // Personal Details
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ["male", "female", "other", ""],
            default: "",
        },
        
        // Address Information
        address: {
            street: {
                type: String,
                trim: true,
            },
            city: {
                type: String,
                trim: true,
            },
            state: {
                type: String,
                trim: true,
            },
            zipCode: {
                type: String,
                trim: true,
            },
        },
        bio: {
            type: String,
            maxlength: [500, "Bio cannot exceed 500 characters"],
        },
        // Professional Details
        companyName: {
            type: String,
            trim: true,
        },
        reraNumber: {
            type: String,
            trim: true,
        },
        // System Fields
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        lastLogin: Date,
        registrationStatus: {
            type: String,
            enum: ["incomplete", "complete", "verified"],
            default: "complete",
        },
        registrationDate: {
            type: Date,
            default: Date.now,
        },
        otpHash: {
            type: String,
        },
        otpExpiresAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for user's properties
userSchema.virtual("properties", {
    ref: "Property",
    localField: "_id",
    foreignField: "owner",
});

// Hash password before saving
// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
userSchema.methods.generateResetToken = function () {
    const crypto = require("crypto");
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

module.exports = mongoose.model("User", userSchema);
