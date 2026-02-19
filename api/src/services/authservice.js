/**
 * Authentication Service
 * Handles all authentication-related API calls and local storage management
 * Manages user sessions, tokens, and profile data
 * 
 * @module services/authService
 */

import api from "./api";
/**
 * Authentication service object containing all auth-related methods
 * Automatically manages JWT tokens and user data in localStorage
 */
export const authService = {
    /**
     * Register a new user account
     * Stores auth token and user data in localStorage upon success
     * 
     * @param {Object} userData - User registration information
     * @param {string} userData.name - Full name
     * @param {string} userData.email - Email address
     * @param {string} userData.password - Password
     * @param {string} userData.phone - Phone number
     * @param {string} userData.role - User role ('user' or 'seller')
     * @returns {Promise<Object>} Registration response with token and user
     */
    register: async (userData) => {
        const response = await api.post("/auth/register", userData);
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        return response.data;
    },

    /**
     * Check if an email is already registered
     * 
     * @param {string} email - Email address to check
     * @returns {Promise<Object>} Availability response
     */
    checkEmail: async (email) => {
        const response = await api.get("/auth/check-email", {
            params: { email },
        });
        return response.data;
    },

    /**
     * Login existing user
     * Stores auth token and user data in localStorage upon success
     * 
     * @param {Object} credentials - Login credentials
     * @param {string} credentials.email - User email
     * @param {string} credentials.password - User password
     * @returns {Promise<Object>} Login response with token and user
     */
    login: async (credentials) => {
        const response = await api.post("/auth/login", credentials);
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        return response.data;
    },

    /**
     * Logout current user
     * Clears all authentication data from localStorage
     */
    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },

    /**
     * Get current user's profile
     * Fetches fresh user data from server
     * 
     * @returns {Promise<Object>} User profile data
     */
    getMe: async () => {
        const response = await api.get("/auth/me");
        return response.data;
    },

    /**
     * Update user profile information
     * Updates localStorage with new user data upon success
     * 
     * @param {Object} data - Profile fields to update
     * @returns {Promise<Object>} Updated user profile
     */
    updateProfile: async (data) => {
        const response = await api.put("/auth/updateprofile", data);
        if (response.data.user) {
            localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        return response.data;
    },

    /**
     * Update user password
     * Requires current password for security
     * 
     * @param {Object} data - Password update data
     * @param {string} data.currentPassword - Current password
     * @param {string} data.newPassword - New password
     * @returns {Promise<Object>} Success response
     */
    updatePassword: async (data) => {
        const response = await api.put("/auth/updatepassword", data);
        return response.data;
    },

    /**
     * Request password reset email
     * Sends reset link to user's email
     * 
     * @param {string} email - User's email address
     * @returns {Promise<Object>} Success message
     */
    forgotPassword: async (email) => {
        const response = await api.post("/auth/forgotpassword", { email });
        return response.data;
    },

    /**
     * Reset password using reset token
     * Token is received via email after forgot password request
     * 
     * @param {string} token - Password reset token
     * @param {string} password - New password
     * @returns {Promise<Object>} Success response with new token
     */
    resetPassword: async (data) => {
        const response = await api.post("/auth/resetpassword", data);
        return response.data;
    },

    /**
     * Toggle property in user's favorites list
     * Adds property if not favorited, removes if already favorited
     * 
     * @param {string} propertyId - MongoDB property ID
     * @returns {Promise<Object>} Updated favorites list
     */
    toggleFavorite: async (propertyId) => {
        const response = await api.put(`/auth/favorites/${propertyId}`);
        return response.data;
    },
};

export default authService;
