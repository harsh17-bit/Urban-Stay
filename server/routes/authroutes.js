const express = require("express");
const router = express.Router();
const {
    register, login, getMe, updateProfile, updatePassword,
    forgotPassword, resetPassword, toggleFavorite, getAllUsers,
    updateUserRole, deleteUser, checkEmail
} = require("../controllers/authcontroller");
const { protect, authorize } = require("../middleware/auth");
//for checking if auth route is healthy
router.get("/health", (req, res) => {
    res.json({ status: "ok" ,
        message: "Auth route is healthy"
    });
});
// Public routes
router.get("/check-email", checkEmail);
router.post("/register", register);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword", resetPassword);

// Protected routes
router.get("/me", protect, getMe);
router.put("/updateprofile", protect, updateProfile);
router.put("/updatepassword", protect, updatePassword);
router.put("/favorites/:propertyId", protect, toggleFavorite);

// Admin routes
router.get("/users", protect, authorize("admin"), getAllUsers);
router.put("/users/:id/role", protect, authorize("admin"), updateUserRole);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);
module.exports = router;
