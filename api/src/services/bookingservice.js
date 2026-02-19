/**
 * Booking Service
 * Frontend API client for booking operations
 * Handles communication with booking endpoints
 * Uses axios instance for automatic auth token handling
 * 
 * @module services/bookingService
 */

import api from "./api";

/**
 * Booking Service Object
 * Contains methods for booking operations
 */
export const bookingService = {
  /**
   * Create a new booking request
   * @param {Object} bookingData - Booking details
   * @param {string} bookingData.propertyId - Property ID
   * @param {string} bookingData.bookingType - 'visit', 'purchase', 'rent'
   * @param {Date} bookingData.visitDate - Booking date
   * @param {string} bookingData.visitTime - Booking time
   * @param {string} [bookingData.message] - Optional message
   * @param {number} [bookingData.priceNegotiated] - Optional price
   * @returns {Promise<Object>} Created booking
   */
  createBooking: async (bookingData) => {
    const response = await api.post("/bookings", bookingData);
    return response.data;
  },

  /**
   * Get all bookings for current user
   * @param {Object} [filters] - Filter options
   * @param {string} [filters.role] - 'buyer' or 'seller'
   * @param {string} [filters.status] - Booking status
   * @returns {Promise<Object>} Bookings array
   */
  getBookings: async (filters = {}) => {
    const response = await api.get("/bookings", { params: filters });
    return response.data;
  },

  /**
   * Get single booking details
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Booking details
   */
  getBooking: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  /**
   * Confirm booking as seller
   * @param {string} bookingId - Booking ID
   * @param {string} [note] - Optional confirmation note
   * @returns {Promise<Object>} Updated booking
   */
  confirmBookingSeller: async (bookingId, note = "") => {
    const response = await api.put(`/bookings/${bookingId}/confirm-seller`, { note });
    return response.data;
  },

  /**
   * Confirm booking as buyer
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Updated booking
   */
  confirmBookingBuyer: async (bookingId) => {
    const response = await api.put(`/bookings/${bookingId}/confirm-buyer`, {});
    return response.data;
  },

  /**
   * Cancel a booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Updated booking
   */
  cancelBooking: async (bookingId) => {
    const response = await api.put(`/bookings/${bookingId}/cancel`, {});
    return response.data;
  },

  /**
   * Mark booking as completed
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Updated booking
   */
  completeBooking: async (bookingId) => {
    const response = await api.put(`/bookings/${bookingId}/complete`, {});
    return response.data;
  },
};

export default bookingService;
