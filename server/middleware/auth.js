const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized to access this route",
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "3TktVLeU5tgYG43N2sWYPWzfFHvcWp65F9t9w7WxDfh");

        // Get user from token
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({
            success: false,
            message: "Not authorized to access this route",
        });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};

// Optional auth - attach user if token exists but don't block
exports.optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET || "3TktVLeU5tgYG43N2sWYPWzfFHvcWp65F9t9w7WxDfh");
            req.user = await User.findById(decoded.id);
        }

        next();
    } catch (error) {
        // Token invalid or expired - continue without user
        next();
    }
};
