/**
 * Booking Confirmation Modal Component
 * Simple UI for creating and confirming bookings
 * Minimal and easy to understand
 * 
 * @component
 */

import { useState } from "react";
import { FiCalendar, FiClock, FiCheck, FiX } from "react-icons/fi";
import { bookingService } from "../services/bookingservice";
import "./BookingConfirmation.css";

const BookingConfirmation = ({ property, onClose, onSuccess }) => {
  // Form state
  const [formData, setFormData] = useState({
    bookingType: "visit",
    visitDate: "",
    visitTime: "10:00",
    message: "",
    priceNegotiated: "",
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  /**
   * Handle booking submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.visitDate || !formData.visitTime) {
        throw new Error("Please fill in all required fields");
      }

      // Validate property
      if (!property || !property._id) {
        throw new Error("Property information is missing");
      }

      // Validate booking type
      const validTypes = ["visit", "purchase", "rent"];
      if (!validTypes.includes(formData.bookingType)) {
        throw new Error("Invalid booking type selected");
      }

      // Prepare booking data
      const bookingData = {
        propertyId: property._id,
        bookingType: formData.bookingType,
        visitDate: formData.visitDate,
        visitTime: formData.visitTime,
        message: formData.message && formData.message.trim() ? formData.message.trim() : "",
        priceNegotiated: formData.priceNegotiated && formData.priceNegotiated.trim()
          ? parseFloat(formData.priceNegotiated)
          : null,
      };

      // Validate price if provided
      if (bookingData.priceNegotiated !== null && isNaN(bookingData.priceNegotiated)) {
        throw new Error("Please enter a valid price");
      }

      console.log("Submitting booking with data:", bookingData);

      // Send booking request
      const response = await bookingService.createBooking(bookingData);

      if (response.success) {
        setSuccess(true);
        // Call success callback after 2 seconds
        setTimeout(() => {
          if (onSuccess) onSuccess(response.data || response.booking);
          onClose();
        }, 2000);
      } else {
        // Server returned error with success: false
        throw new Error(response.message || "Failed to create booking");
      }
    } catch (err) {
      // Extract actual error message from axios error response
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        "Failed to create booking. Please try again.";
      
      console.error("Booking error:", {
        status: err.response?.status,
        message: errorMessage,
        data: err.response?.data,
      });
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="booking-modal-overlay" onClick={onClose}>
        <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
          <div className="booking-success">
            <div className="success-icon">
              <FiCheck />
            </div>
            <h3>Booking Request Sent!</h3>
            <p>The seller will review your booking request and respond soon.</p>
            <button onClick={onClose} className="btn btn-primary">
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form screen
  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="booking-header">
          <h2>Schedule a Visit</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="booking-form">
          {/* Error Message */}
          {error && <div className="booking-error">{error}</div>}

          {/* Booking Type Selection */}
          <div className="form-group">
            <label>Booking Type *</label>
            <select
              name="bookingType"
              value={formData.bookingType}
              onChange={handleChange}
              className="form-input"
            >
              <option value="visit">Property Visit</option>
              <option value="purchase">Purchase Inquiry</option>
              <option value="rent">Rental Inquiry</option>
            </select>
          </div>

          {/* Date Input */}
          <div className="form-row">
            <div className="form-group">
              <label>
                <FiCalendar /> Visit Date *
              </label>
              <input
                type="date"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {/* Time Input */}
            <div className="form-group">
              <label>
                <FiClock /> Time *
              </label>
              <input
                type="time"
                name="visitTime"
                value={formData.visitTime}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Price Negotiation (for purchase/rent) */}
          {formData.bookingType !== "visit" && (
            <div className="form-group">
              <label>Proposed Price (Optional)</label>
              <div className="price-input-group">
                <span className="currency">₹</span>
                <input
                  type="number"
                  name="priceNegotiated"
                  value={formData.priceNegotiated}
                  onChange={handleChange}
                  placeholder="Enter your offer"
                  className="form-input"
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Message */}
          <div className="form-group">
            <label>Message (Optional)</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Add any special requests or questions..."
              className="form-input form-textarea"
              rows="3"
              maxLength="500"
            />
            <small>{formData.message.length}/500</small>
          </div>

          {/* Property Summary */}
          <div className="booking-summary">
            <h4>Property Summary</h4>
            <div className="summary-item">
              <span>Property:</span>
              <strong>{property.title}</strong>
            </div>
            <div className="summary-item">
              <span>Type:</span>
              <strong>{formData.bookingType}</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="booking-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Sending..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingConfirmation;
