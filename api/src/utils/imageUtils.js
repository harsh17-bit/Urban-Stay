/**
 * Utility functions for image handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_BASE_URL = API_BASE_URL.replace('/api', ''); // Remove /api to get base server URL

/**
 * Convert relative image path to full URL
 * @param {string} imagePath - Image path (e.g., "/uploads/propertyimages/file.jpg" or full URL)
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) {
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3C/svg%3E`;
    }

    // If it's already a full URL (http/https), return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // If it's a data URL (for placeholders), return as-is
    if (imagePath.startsWith('data:')) {
        return imagePath;
    }

    // If it's a relative path, prepend the server base URL
    if (imagePath.startsWith('/')) {
        return `${SERVER_BASE_URL}${imagePath}`;
    }

    // Fallback: assume it's a relative path
    return `${SERVER_BASE_URL}/${imagePath}`;
};

/**
 * Get placeholder image SVG data URL
 * @param {number} width - Width in pixels
 * @param {number} height - Height in pixels
 * @returns {string} SVG data URL
 */
export const getPlaceholderImage = (width = 400, height = 300) => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect fill='%23e5e7eb' width='${width}' height='${height}'/%3E%3C/svg%3E`;
};
