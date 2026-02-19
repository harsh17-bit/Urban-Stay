const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authroutes");
const propertyRoutes = require("./routes/propertyroutes");
const inquiryRoutes = require("./routes/inquiryroutes");
const reviewRoutes = require("./routes/reviewroutes");
const alertRoutes = require("./routes/alertroutes");
const projectRoutes = require("./routes/projectroutes");
const bookingRoutes = require("./routes/bookingroutes");

const app = express();

// Connect to database
connectDB();

// Middleware
const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/bookings", bookingRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Real Estate Backend API is running",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            properties: "/api/properties",
            inquiries: "/api/inquiries",
            reviews: "/api/reviews",
            alerts: "/api/alerts",
            projects: "/api/projects",
        },
        },);
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});
app.get("/api/health", (req, res) => {
    res.json({status:"ok"});
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}`);
});

module.exports = app;