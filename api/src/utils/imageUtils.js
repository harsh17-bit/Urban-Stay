/**
 * Utility functions for image handling
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_BASE_URL = API_BASE_URL.replace("/api", ""); // Remove /api to get base server URL

/**
 * Convert relative image path to full URL
 * @param {string} imagePath - Image path (e.g., "/uploads/propertyimages/file.jpg" or full URL)
 * @returns {string} Full image URL
 */
const FALLBACK_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23e5e7eb' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' font-size='28' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E`;

// Domains known to be defunct / unreachable placeholder services
const DEAD_PLACEHOLDER_HOSTS = [
  "via.placeholder.com",
  "placehold.it",
  "placeimg.com",
];

export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return FALLBACK_SVG;
  }

  // If it's already a full URL (http/https), return as-is — but block dead placeholder services
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    try {
      const host = new URL(imagePath).hostname;
      if (DEAD_PLACEHOLDER_HOSTS.includes(host)) return FALLBACK_SVG;
    } catch (_) {
      /* ignore malformed URLs */
    }
    return imagePath;
  }

  // If it's a data URL (for placeholders), return as-is
  if (imagePath.startsWith("data:")) {
    return imagePath;
  }

  // If it's a relative path, prepend the server base URL
  if (imagePath.startsWith("/")) {
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
