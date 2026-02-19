const { z } = require("zod");       
// -------- ZOD SCHEMAS --------
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&]).{8,}$/;

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .regex(passwordRegex, 
      "Password must have uppercase, lowercase, number & special character"),
  phone: z.string().optional(),
  role: z.enum(["user", "seller"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z
    .string()
    .regex(passwordRegex, "New password is too weak"),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/),
  newPassword: z
    .string()
    .regex(passwordRegex, "Password is too weak"),
});

/**
 * Authentication Controller
 * Handles all user authentication operations including registration, login,
 * password management, profile updates, and favorites
 * 
 * @module controllers/authController
 */

const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail, sendPasswordResetOtpEmail } = require("../utils/email");
const crypto = require("crypto");

/**
 * Generates a JWT token for authenticated users
 * 
 * @param {string} userId - MongoDB user ID
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || "your-secret-key", {
        expiresIn: process.env.JWT_EXPIRE || "7d",
    });
};

/**
 * Sends token response to client
 * Removes password from user object before sending
 * 
 * @param {Object} user - User document from database
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);

    // Remove password from output for security
    user.password = undefined;

    res.status(statusCode).json({
        success: true,
        token,
        user,
    });
};

/**
 * Register a new user
 * Creates user account, sends welcome email, and returns authentication token
 * 
 * @route   POST /api/auth/register
 * @access  Public
 * @param   {Object} req.body - User registration data
 * @returns {Object} Success response with token and user data
 */
exports.register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            role,
            dateOfBirth,
            gender,
            address,
            companyName,
            reraNumber,
            bio,
        } = req.body;

        // Validate: Check if email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered",
            });
        }

        // Create new user with provided details
        // Only 'user' and 'seller' roles allowed during registration
        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: role === "seller" ? "seller" : "user",
            dateOfBirth,
            gender,
            address: address || {},
            companyName: role === "seller" ? companyName : "",
            reraNumber: role === "seller" ? reraNumber : "",
            bio,
            registrationStatus: "complete",
            registrationDate: new Date(),
        });

        // Send welcome email asynchronously
        // Don't block registration if email fails
        try {
            await sendWelcomeEmail({
                email: user.email,
                name: user.name,
                role: user.role,
            });
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError.message);
        }

        sendTokenResponse(user, 201, res);
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error creating user",
        });
    }
};

/**
 * Login existing user
 * Validates credentials, updates last login time, and returns auth token
 * 
 * @route   POST /api/auth/login
 * @access  Public
 * @param   {string} req.body.email - User email
 * @param   {string} req.body.password - User password
 * @returns {Object} Success response with token and user data
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password",
            });
        }

        // Find user by email and include password field for comparison
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Verify password using bcrypt comparison
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Track last login time for analytics
        user.lastLogin = new Date();
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Error logging in",
        });
    }
};

/**
 * Get current logged in user's profile
 * Includes populated favorites list
 * 
 * @route   GET /api/auth/me
 * @access  Private (requires authentication)
 * @returns {Object} User profile data with favorites
 */
exports.getMe = async (req, res) => {
    try {
        // Fetch user and populate favorite properties
        const user = await User.findById(req.user.id).populate("favorites");

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("GetMe error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user",
        });
    }
};

/**
 * Update user profile information
 * Allows updating personal details, contact info, and seller-specific data
 * 
 * @route   PUT /api/auth/updateprofile
 * @access  Private (requires authentication)
 * @param   {Object} req.body - Profile fields to update
 * @returns {Object} Updated user profile
 */
exports.updateProfile = async (req, res) => {
    try {
        // Define allowed fields for profile update
        const fieldsToUpdate = {
            name: req.body.name,
            phone: req.body.phone,
            avatar: req.body.avatar,
            bio: req.body.bio,
            address: req.body.address,
            companyName: req.body.companyName,
            reraNumber: req.body.reraNumber,
            dateOfBirth: req.body.dateOfBirth,
            gender: req.body.gender,
        };

        if (req.user.role !== "admin" && ["user", "seller"].includes(req.body.role)) {
            fieldsToUpdate.role = req.body.role;
        }

        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach(
            (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
        );

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            returnDocument: 'after',
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating profile",
        });
    }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select("+password");

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        user.password = newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error("Update password error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating password",
        });
    }
};

// @desc    Forgot password (send OTP)
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const email = (req.body.email || "").trim().toLowerCase();
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }
        const emailPattern = /^\S+@\S+\.\S+$/;
        if (!emailPattern.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.log("Forgot password - User not found:", email);
            return res.status(200).json({
                success: true,
                message: "If the email exists, an OTP was sent",
            });
        }

        const otp = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
        user.otpHash = otpHash;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save({ validateBeforeSave: false });
        
        console.log("OTP generated for:", email, "- OTP:", otp, "Expires:", user.otpExpiresAt);

        await sendPasswordResetOtpEmail({
            email: user.email,
            otp,
        });
        
        console.log("OTP email sent to:", user.email);

        res.status(200).json({
            success: true,
            message: "If the email exists, an OTP was sent",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            success: false,
            message: "Error sending password reset OTP",
        });
    }
};

// @desc    Check if email is already registered
// @route   GET /api/auth/check-email
// @access  Public
exports.checkEmail = async (req, res) => {
    try {
        const email = (req.query.email || "").trim().toLowerCase();
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const existingUser = await User.findOne({ email }).select("_id");
        return res.status(200).json({
            success: true,
            exists: !!existingUser,
        });
    } catch (error) {
        console.error("Check email error:", error);
        return res.status(500).json({
            success: false,
            message: "Error checking email",
        });
    }
};

// @desc    Reset password (verify OTP)
// @route   POST /api/auth/resetpassword
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        console.log("Reset password request received:", { email: req.body.email, hasOtp: !!req.body.otp, hasPassword: !!req.body.newPassword });
        const email = (req.body.email || "").trim().toLowerCase();
        const otp = (req.body.otp || "").trim();
        const newPassword = req.body.newPassword || "";

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP, and new password are required",
            });
        }

        const emailPattern = /^\S+@\S+\.\S+$/;
        if (!emailPattern.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
            });
        }

        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: "OTP must be a 6-digit number",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        const user = await User.findOne({ email }).select("+password");
        console.log("User found:", !!user, "Has OTP hash:", !!user?.otpHash, "Has expiry:", !!user?.otpExpiresAt);
        if (!user || !user.otpHash || !user.otpExpiresAt) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP",
            });
        }

        const now = Date.now();
        const expiresAt = new Date(user.otpExpiresAt).getTime();
        console.log("OTP expiry check:", { now, expiresAt, expired: expiresAt < now });
        if (user.otpExpiresAt < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP",
            });
        }

        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
        console.log("OTP hash match:", otpHash === user.otpHash);
        if (otpHash !== user.otpHash) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP",
            });
        }

        user.password = newPassword;
        user.otpHash = undefined;
        user.otpExpiresAt = undefined;
        await user.save();
        console.log("Password reset successful for:", email);

        res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            success: false,
            message: "Error resetting password",
        });
    }
};

// @desc    Toggle favorite property
// @route   PUT /api/auth/favorites/:propertyId
// @access  Private
exports.toggleFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const propertyId = req.params.propertyId;

        const index = user.favorites.indexOf(propertyId);
        if (index > -1) {
            user.favorites.splice(index, 1);
        } else {
            user.favorites.push(propertyId);
        }

        await user.save();

        res.status(200).json({
            success: true,
            favorites: user.favorites,
            isFavorite: index === -1,
        });
    } catch (error) {
        console.error("Toggle favorite error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating favorites",
        });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.role) filter.role = req.query.role;
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
            ];
        }

        const users = await User.find(filter)
            .skip(skip)
            .limit(limit)
            .sort("-createdAt");

        const total = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            users,
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching users",
        });
    }
};

// @desc    Update user role (Admin)
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!["user", "seller", "admin"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { returnDocument: 'after' }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Update user role error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating user role",
        });
    }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting user",
        });
    }
};
