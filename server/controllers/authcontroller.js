const { z } = require('zod');
// -------- ZOD SCHEMAS --------
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&]).{8,}$/;

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .regex(
      passwordRegex,
      'Password must have uppercase, lowercase, number & special character'
    ),
  phone: z.string().optional(),
  role: z.enum(['user', 'seller']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().regex(passwordRegex, 'New password is too weak'),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/),
  newPassword: z.string().regex(passwordRegex, 'Password is too weak'),
});

/**
 * Authentication Controller
 * Handles all user authentication operations including registration, login,
 * password management, profile updates, and favorites
 *
 * @module controllers/authController
 */

const User = require('../models/user');
const Property = require('../models/property');
const Inquiry = require('../models/inquiry');
const Review = require('../models/review');
const Alert = require('../models/alert');
const Project = require('../models/project');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
const {
  sendWelcomeEmail,
  sendPasswordResetOtpEmail,
} = require('../utils/email');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');

// In-memory cache for registration email verification.
// Keeps implementation minimal and avoids schema changes.
const registrationEmailOtpStore = new Map();

/**
 * Generates a JWT token for authenticated users
 *
 * @param {string} userId - MongoDB user ID
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
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

    const normalizedEmail = (email || '').toLowerCase().trim();

    // Validate: Check if email is already registered
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const verification = registrationEmailOtpStore.get(normalizedEmail);
    if (
      !verification ||
      !verification.verified ||
      verification.expiresAt < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email before registering',
      });
    }

    // Create new user with provided details
    // Only 'user' and 'seller' roles allowed during registration
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      phone,
      role: role === 'seller' ? 'seller' : 'user',
      isVerified: true,
      dateOfBirth,
      gender,
      address: address || {},
      companyName: role === 'seller' ? companyName : '',
      reraNumber: role === 'seller' ? reraNumber : '',
      bio,
      registrationStatus: 'verified',
      registrationDate: new Date(),
    });

    registrationEmailOtpStore.delete(normalizedEmail);

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
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating user',
    });
  }
};

// @desc    Send OTP for registration email verification
// @route   POST /api/auth/send-register-otp
// @access  Public
exports.sendRegisterOtp = async (req, res) => {
  try {
    const email = (req.body?.email || '').toLowerCase().trim();

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    registrationEmailOtpStore.set(email, {
      otp,
      verified: false,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    await transporter.sendMail({
      to: email,
      subject: 'Urban Stay - Registration Email OTP',
      text: `Your Urban Stay registration OTP is ${otp}. It expires in 10 minutes.`,
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent to email',
    });
  } catch (error) {
    console.error('Send register OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending OTP',
    });
  }
};

// @desc    Verify OTP for registration email verification
// @route   POST /api/auth/verify-register-otp
// @access  Public
exports.verifyRegisterOtp = async (req, res) => {
  try {
    const email = (req.body?.email || '').toLowerCase().trim();
    const otp = String(req.body?.otp || '')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (!email || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Email and valid 6-digit OTP are required',
      });
    }

    const verification = registrationEmailOtpStore.get(email);
    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Please request OTP first',
      });
    }

    if (verification.expiresAt < Date.now()) {
      registrationEmailOtpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'OTP expired, please request a new OTP',
      });
    }

    if (verification.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    registrationEmailOtpStore.set(email, {
      ...verification,
      verified: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      verified: true,
    });
  } catch (error) {
    console.error('Verify register OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
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
        message: 'Please provide email and password',
      });
    }

    // Find user by email and include password field for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Verify password using bcrypt comparison
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Keep verification flag consistent for already-verified registrations.
    if (!user.isVerified && user.registrationStatus === 'verified') {
      user.isVerified = true;
      await user.save();
    }

    // Track last login time for analytics (bypass validators to avoid phone/field validation errors)
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
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
    const user = await User.findById(req.user.id).populate('favorites');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
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

    if (
      req.user.role !== 'admin' &&
      ['user', 'seller'].includes(req.body.role)
    ) {
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
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password',
    });
  }
};

// @desc    Forgot password (send OTP)
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS exists:', process.env.EMAIL_PASS ? 'YES' : 'NO');

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email exists, OTP has been sent',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otpHash = otp;
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000;

    await user.save();

    // send email BEFORE response (safe version)
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset OTP',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Error sending password reset OTP',
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

    if (user?.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin cannot do any property wishlist.',
      });
    }

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
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating favorites',
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
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');

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
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
    });
  }
};

// @desc    Update user role (Admin)
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
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
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
    });
  }
};

// @desc    Delete user + all associated data (Admin)
// @route   DELETE /api/auth/users/:id
// @desc    Check if email exists
// @route   GET /api/auth/check-email
// @access  Public
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    res.status(200).json({
      success: true,
      exists: !!user,
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking email',
    });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/resetpassword
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.errors[0].message,
      });
    }

    const { email, otp, newPassword } = parsed.data;

    const user = await User.findOne({
      email: email.toLowerCase(),
      otpHash: otp,
      otpExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    user.password = newPassword;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
    });
  }
};

// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const normalizedEmail = (user.email || '').toLowerCase().trim();

    // Collect metadata for response and cleanup
    const userProperties = await Property.find({ owner: userId }).select(
      '_id images'
    );
    const propertyIds = userProperties.map((p) => p._id);
    const projectCount = await Project.countDocuments({ developer: userId });

    // Delete user account first so email becomes reusable even if cleanup fails later
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user account',
      });
    }

    // Safety purge: remove any residual duplicate documents with same email.
    await User.deleteMany({ email: normalizedEmail });

    // Best-effort cleanup: do not fail request if child cleanup throws
    try {
      for (const property of userProperties) {
        if (!Array.isArray(property.images)) continue;

        for (const img of property.images) {
          if (!img.url) continue;

          if (img.url.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, '../', img.url);
            fs.unlink(filePath, () => {});
          } else if (img.url.includes('cloudinary')) {
            const publicId = getPublicIdFromUrl(img.url);
            if (publicId) {
              try {
                await deleteImage(publicId);
              } catch (imgError) {
                console.warn('Image delete warning:', imgError.message);
              }
            }
          }
        }
      }

      if (propertyIds.length > 0) {
        await Review.deleteMany({ property: { $in: propertyIds } });
        await Inquiry.deleteMany({ property: { $in: propertyIds } });
      }

      await Property.deleteMany({ owner: userId });
      await Project.deleteMany({ developer: userId });
      await Review.deleteMany({ user: userId });
      await Inquiry.deleteMany({
        $or: [{ sender: userId }, { receiver: userId }],
      });
      await Alert.deleteMany({ user: userId });
    } catch (cleanupError) {
      console.warn('Post-user-delete cleanup warning:', cleanupError.message);
    }

    return res.status(200).json({
      success: true,
      message: 'User and all associated data deleted successfully',
      deleted: {
        properties: propertyIds.length,
        projects: projectCount,
      },
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
