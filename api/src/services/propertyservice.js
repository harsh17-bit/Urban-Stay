/**
 * Property Service
 * Handles all property-related API calls including CRUD operations,
 * search, filtering, and statistics
 *
 * @module services/propertyService
 */

import api from './api';

/**
 * Property service object containing all property-related methods
 * Provides interface for property management and search functionality
 */
export const propertyService = {
  /**
   * Get all properties with optional filters
   * Supports pagination, search, filtering by type, price, location, etc.
   *
   * @param {Object} [params={}] - Query parameters for filtering
   * @param {number} [params.page] - Page number for pagination
   * @param {number} [params.limit] - Items per page
   * @param {string} [params.listingType] - Filter by 'buy', 'rent', or 'pg'
   * @param {string} [params.propertyType] - Filter by property type
   * @param {string} [params.city] - Filter by city name
   * @param {number} [params.minPrice] - Minimum price filter
   * @param {number} [params.maxPrice] - Maximum price filter
   * @param {string} [params.sort] - Sort option ('price_low', 'price_high', 'newest')
   * @returns {Promise<Object>} Properties list with pagination info
   */
  getProperties: async (params = {}) => {
    const response = await api.get('/properties', { params });
    return response.data;
  },

  /**
   * Get single property by MongoDB ID
   *
   * @param {string} id - Property ID
   * @returns {Promise<Object>} Property details
   */
  getProperty: async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  /**
   * Get property by URL-friendly slug
   *
   * @param {string} slug - Property slug
   * @returns {Promise<Object>} Property details
   */
  getPropertyBySlug: async (slug) => {
    const response = await api.get(`/properties/slug/${slug}`);
    return response.data;
  },

  /**
   * Get featured/promoted properties
   * Returns properties marked as featured by admin
   *
   * @returns {Promise<Object>} Featured properties list
   */
  getFeatured: async () => {
    const response = await api.get('/properties/featured');
    return response.data;
  },

  /**
   * Get similar properties based on type and location
   * Used for property recommendations
   *
   * @param {string} propertyId - Reference property ID
   * @returns {Promise<Object>} Similar properties list
   */
  getSimilar: async (propertyId) => {
    const response = await api.get(`/properties/${propertyId}/similar`);
    return response.data;
  },

  /**
   * Get current seller's properties
   * Requires authentication as seller
   *
   * @param {Object} [params={}] - Filter parameters
   * @returns {Promise<Object>} Seller's properties with stats
   */
  getMyProperties: async (params = {}) => {
    const response = await api.get('/properties/user/my', { params });
    return response.data;
  },

  /**
   * Create new property listing
   * Requires authentication as seller
   *
   * @param {Object} propertyData - Property information
   * @param {string} propertyData.title - Property title
   * @param {string} propertyData.description - Detailed description
   * @param {number} propertyData.price - Property price
   * @param {string} propertyData.propertyType - Type of property
   * @param {string} propertyData.listingType - 'buy', 'rent', or 'pg'
   * @param {Object} propertyData.location - Address and coordinates
   * @param {Object} propertyData.specifications - Bedrooms, area, etc.
   * @returns {Promise<Object>} Created property data
   */
  createProperty: async (propertyData) => {
    const response = await api.post('/properties', propertyData);
    return response.data;
  },

  /**
   * Update existing property
   * Only property owner or admin can update
   *
   * @param {string} id - Property ID
   * @param {Object} propertyData - Fields to update
   * @returns {Promise<Object>} Updated property data
   */
  updateProperty: async (id, propertyData) => {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  },

  /**
   * Delete property listing
   * Only property owner or admin can delete
   *
   * @param {string} id - Property ID
   * @returns {Promise<Object>} Success message
   */
  deleteProperty: async (id) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },

  /**
   * Get property statistics by city
   * Returns count and average price per city
   *
   * @returns {Promise<Object>} City-wise statistics
   */
  getCityStats: async () => {
    const response = await api.get('/properties/stats/cities');
    return response.data;
  },

  /**
   * Get admin dashboard statistics
   * Requires admin authentication
   *
   * @returns {Promise<Object>} Platform-wide stats
   */
  getAdminStats: async () => {
    const response = await api.get('/properties/stats/admin');
    return response.data;
  },

  /**
   * Verify property (admin only)
   * Marks property as verified/trustworthy
   *
   * @param {string} id - Property ID
   * @returns {Promise<Object>} Updated property
   */
  verifyProperty: async (id) => {
    const response = await api.put(`/properties/${id}/verify`);
    return response.data;
  },

  /**
   * Feature/promote property (admin only)
   * Makes property appear in featured listings
   *
   * @param {string} id - Property ID
   * @param {number} [days=30] - Number of days to feature
   * @returns {Promise<Object>} Updated property
   */
  featureProperty: async (id, days = 30) => {
    const response = await api.put(`/properties/${id}/feature`, { days });
    return response.data;
  },

  /**
   * Cancel featured status (admin only)
   * @param {string} id - Property ID
   * @returns {Promise<Object>} Updated property
   */
  unfeatureProperty: async (id) => {
    const response = await api.delete(`/payments/unfeature/${id}`);
    return response.data;
  },
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use propertyService.getProperties() instead
 * @returns {Promise<Array>} Array of properties
 */
export const fetchProperties = async () => {
  const response = await propertyService.getProperties();
  return response.properties || [];
};

export default propertyService;
