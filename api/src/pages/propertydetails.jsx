import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiHeart, FiShare2, FiMapPin, FiHome, FiMaximize, FiLayers,
  FiCheck, FiPhone, FiMessageSquare, FiChevronLeft, FiChevronRight,
  FiStar, FiShield, FiPrinter, FiX,  FiTrendingUp, FiCloud, FiGlobe
} from "react-icons/fi";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from "../context/authcontext.jsx";
import { propertyService } from "../services/propertyservice";
import { inquiryService, reviewService } from "../services/dataservice";
import { weatherService } from "../services/weatherservice";
import { getImageUrl } from "../utils/imageUtils";
import PropertyCard from "../components/propertycard";
import BookingConfirmation from "../components/BookingConfirmation";
import "./PropertyDetails.css";


// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const PropertyDetails = () => {
  const { id } = useParams();
  const Navigate = useNavigate();
  const { user, isAuthenticated, toggleFavorite } = useAuth();
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    message: "",
    phone: "",
    inquiryType: "general",
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showEMICalculator, setShowEMICalculator] = useState(false);
  const [emiData, setEmiData] = useState({
    loanAmount: "",
    interestRate: "8.5",
    tenure: "20",
  });
  const [emiResult, setEmiResult] = useState(null);
  const [weather, setWeather] = useState(null);
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: "",
    comment: "",
    ratings: {
      location: 5,
      valueForMoney: 5,
      amenities: 5,
      connectivity: 5,
      safety: 5,
    },
    pros: [],
    cons: [],
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const isValidId = id && id !== "undefined" && /^[a-f\d]{24}$/i.test(id);

    if (!isValidId) {
      setLoading(false);
      return;
    }
    
    const fetchProperty = async() => {
      setLoading(true);
      try{
        const data = await propertyService.getProperty(id);
        setProperty(data?.property || data);
        setIsFavorite(user?.favorites?.includes(id));

        // Fetch similar properties
        const similarRes = await propertyService.getSimilar(id);
        setSimilarProperties(similarRes.properties || []);

        // Fetch reviews
        const reviewsRes = await reviewService.getPropertyReviews(id);
        setReviews(reviewsRes.reviews || []);

        // Check if user has already reviewed this property
        if (isAuthenticated && user) {
          const hasReviewed = reviewsRes.reviews?.some(r => r.user?._id === user._id);
          setUserHasReviewed(hasReviewed);
        }
      }catch(err){
        console.log("error fetching property:",err);
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [id, user, isAuthenticated]);

  useEffect(() => {
    if (property?.location?.city) {
      fetchWeather();
    }
  }, [property]);

  const fetchWeather = async () => {
    try {
      const weatherData = await weatherService.getWeatherByCity(property.location.city);
      setWeather(weatherData);
    } catch (error) {
      console.error('Error fetching weather:', error);
    } 
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      return;
    }
    try {
      await toggleFavorite(id);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    try {
      await inquiryService.create({
        propertyId: id,
        ...inquiryData,
      });

      setShowInquiryForm(false);
      setInquiryData({ message: "", phone: "", inquiryType: "general" });
      alert("Inquiry sent successfully!");
    } catch (error) {
      console.error("Error sending inquiry:", error);
      alert("Error sending inquiry. Please try again.");
    }
  };

  const nextImage = () => {
    if (property?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const formatPrice = (price, type) => {
    if (type === "rent") {
      return `₹${price?.toLocaleString()}/month`;
    }
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lac`;
    }
    return `₹${price?.toLocaleString()}`;
  };

  const calculateEMI = () => {
    const principal = parseFloat(emiData.loanAmount);
    const rate = parseFloat(emiData.interestRate) / 12 / 100; // Monthly interest rate
    const time = parseFloat(emiData.tenure) * 12; // Total months

    if (!principal || !rate || !time) {
      alert("Please fill all fields correctly");
      return;
    }

    // EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
    const emi = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
    const totalAmount = emi * time;
    const totalInterest = totalAmount - principal;

    setEmiResult({
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
      principal: Math.round(principal),
    });
  };

  const handleEMIInputChange = (e) => {
    const { name, value } = e.target;
    setEmiData({ ...emiData, [name]: value });
    setEmiResult(null); // Reset result when inputs change
  };

  const openEMICalculator = () => {
    // Pre-fill loan amount with 80% of property price
    const suggestedLoan = Math.round(property.price * 0.8);
    setEmiData({ ...emiData, loanAmount: suggestedLoan.toString() });
    setShowEMICalculator(true);
    setEmiResult(null);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      console.alert("Please login to submit a review");
      return;
    }

    if (userHasReviewed) {
      console.alert("You have already reviewed this property");
      return;
    }

    setReviewSubmitting(true);
    try {
      await reviewService.createReview({
        propertyId: id,
        ...reviewData,
      });
      alert("Review submitted successfully! It will be visible after admin approval.");
      setShowReviewForm(false);
      setUserHasReviewed(true);
      if(user?.role === "admin"){
        // If admin, refresh reviews to show the new one immediately
       window.location.href = "/admin/dashboard/reviews";
      }else{
         window.location.href = "/dashboard";
      }
      // Reset form
      setReviewData({
        rating: 5,
        title: "",
        comment: "",
        ratings: {
          location: 5,
          valueForMoney: 5,
          amenities: 5,
          connectivity: 5,
          safety: 5,
        },
        pros: [],
        cons: [],
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.response?.data?.message || "Error submitting review. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReviewInputChange = (e) => {
    const { name, value } = e.target;
    setReviewData({ ...reviewData, [name]: value });
  };

  const handleRatingChange = (category, value) => {
    if (category === "overall") {
      setReviewData({ ...reviewData, rating: value });
    } else {
      setReviewData({
        ...reviewData,
        ratings: { ...reviewData.ratings, [category]: value },
      });
    }
  };

  const addProCon = (type) => {
    const item = prompt(`Enter a ${type}:`);
    if (item && item.trim() !== "") {
      if (type === "pro") {
        setReviewData({ ...reviewData, pros: [...reviewData.pros, item.trim()] });
      } else {
        setReviewData({ ...reviewData, cons: [...reviewData.cons, item.trim()] });
      }
    }
  };

  const removeProCon = (type, index) => {
    if (type === "pro") {
      setReviewData({
        ...reviewData,
        pros: reviewData.pros.filter((_, i) => i !== index),
      });
    } else {
      setReviewData({
        ...reviewData,
        cons: reviewData.cons.filter((_, i) => i !== index),
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading property details...</p>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="error-container">
        <h2>Invalid Property</h2>
        <p>No property ID provided.</p>
        <Link to="/" className="btn-primary">Go to Home</Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="error-container">
        <h2>Property not found</h2>
        <Link to="/properties" className="btn-primary">Browse Properties</Link>
      </div>
    );
  }

  return (
    <div className="property-details-page">
      {/* Image Gallery */}
      <section className="image-gallery">
        <div className="gallery-main">
          <img
            src={getImageUrl(property.images?.[currentImageIndex]?.url)}
            alt={property.title}
          />
          {property.images?.length > 1 && (
            <>
              <button className="gallery-nav prev" onClick={prevImage}>
                <FiChevronLeft />
              </button>
              <button className="gallery-nav next" onClick={nextImage}>
                <FiChevronRight />
              </button>
              <div className="gallery-counter">
                {currentImageIndex + 1} / {property.images.length}
              </div>
            </>
          )}  
        </div>
        {property.images?.length > 1 && (
          <div className="gallery-thumbnails">
            {property.images.slice(0, 5).map((img, index) => (
              <button
                key={index}
                className={`thumbnail ${currentImageIndex === index ? "active" : ""}`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <img src={getImageUrl(img.url)} alt="" />
                {index === 4 && property.images.length > 5 && (
                  <span className="more-count">+{property.images.length - 5}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="property-content">
        {/* Main Content */}
        <main className="property-main">
          {/* Header */}
          <div className="property-header">
            <div className="header-info">
              <span className="property-type">
                {property.propertyType} for {property.listingType}
              </span>
              <h1>{property.title}</h1>
              <p className="location">
                <FiMapPin />
                {property.location?.address}, {property.location?.city}, {property.location?.state}
              </p>
            </div>
            <div className="header-actions">
              <button
                className={`action-btn ${isFavorite ? "active" : ""}`}
                onClick={handleFavoriteToggle}
              >
                <FiHeart />
              </button>
              
            </div>
          </div>

          {/* Price and Specs */}
          <div className="price-specs-card">
            <div className="price-section">
              <div className="price-info">
                <span className="price">{formatPrice(property.price, property.listingType)}</span>
                {property.priceBreakdown?.maintenanceCharges && (
                  <span className="maintenance">
                    + ₹{property.priceBreakdown.maintenanceCharges}/month maintenance
                  </span>
                )}
              </div>
              {property.listingType === "buy" && (
                <button className="emi-calc-btn" onClick={openEMICalculator}>
                  <FiTrendingUp /> EMI Calculator
                </button>
              )}
            </div>
            <div className="specs-row">
              {property.specifications?.bedrooms && (
                <div className="spec-item">
                  <FiHome />
                  <span>{property.specifications.bedrooms} BHK</span>
                </div>
              )}
              {property.specifications?.bathrooms && (
                <div className="spec-item">
                  <span>{property.specifications.bathrooms} Baths</span>
                </div>
              )}
              {property.specifications?.carpetArea && (
                <div className="spec-item">
                  <FiMaximize />
                  <span>{property.specifications.carpetArea} sq.ft</span>
                </div>
              )}
              {property.specifications?.floorNumber && (
                <div className="spec-item">
                  <FiLayers />
                  <span>Floor {property.specifications.floorNumber} of {property.specifications.totalFloors}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="property-tabs">
            <button
              className={activeTab === "overview" ? "active" : ""}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={activeTab === "amenities" ? "active" : ""}
              onClick={() => setActiveTab("amenities")}
            >
              Amenities
            </button>
            <button
              className={activeTab === "location" ? "active" : ""}
              onClick={() => setActiveTab("location")}
            >
              Location
            </button>
            <button
              className={activeTab === "reviews" ? "active" : ""}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "overview" && (
              <div className="overview-tab">
                <div className="section">
                  <h3>Description</h3>
                  <p>{property.description}</p>
                </div>

                <div className="section">
                  <h3>Property Details</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="label">Property Type</span>
                      <span className="value">{property.propertyType}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Furnishing</span>
                      <span className="value">{property.specifications?.furnishing || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Facing</span>
                      <span className="value">{property.specifications?.facing || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Age of Property</span>
                      <span className="value">{property.specifications?.ageOfProperty || "N/A"} years</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Possession Status</span>
                      <span className="value">{property.specifications?.possessionStatus || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Carpet Area</span>
                      <span className="value">{property.specifications?.carpetArea || "N/A"} sq.ft</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Built-up Area</span>
                      <span className="value">{property.specifications?.builtUpArea || "N/A"} sq.ft</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Balconies</span>
                      <span className="value">{property.specifications?.balconies || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {property.highlights?.length > 0 && (
                  <div className="section">
                    <h3>Highlights</h3>
                    <div className="highlights-list">
                      {property.highlights.map((highlight, index) => (
                        <span key={index} className="highlight-item">
                          <FiCheck /> {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "amenities" && (
              <div className="amenities-tab">
                {property.amenities?.length > 0 ? (
                  <div className="amenities-grid">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="amenity-item">
                        <FiCheck />
                        <span>{amenity.replace(/-/g, " ")}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No amenities listed</p>
                )}
              </div>
            )}

            {activeTab === "location" && (
              <div className="location-tab">
                <div className="location-address">
                  <FiMapPin />
                  <p>
                    {property.location?.address}<br />
                    {property.location?.city}, {property.location?.state} - {property.location?.pincode}
                  </p>
                </div>

                {property.nearbyPlaces?.length > 0 && (
                  <div className="nearby-places">
                    <h4>Nearby Places</h4>
                    <div className="places-list">
                      {property.nearbyPlaces.map((place, index) => (
                        <div key={index} className="place-item">
                          <span className="place-type">{place.type}</span>
                          <span className="place-name">{place.name}</span>
                          <span className="place-distance">{place.distance}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="map-container">
                  {activeTab === "location" && (
                    <MapContainer 
                      key={`map-${property._id}`}
                      center={[28.6139, 77.2090]} 
                      zoom={13}
                      scrollWheelZoom={false}
                      style={{ height: '400px', width: '100%', borderRadius: '12px' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[28.6139, 77.2090]}>
                        <Popup>
                          <strong>{property.title}</strong><br />
                          {property.location?.address}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  )}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="reviews-tab">
                {/* Review Submit Button */}
                {isAuthenticated && !userHasReviewed && (
                  <div className="review-submit-section">
                    <button 
                      className="btn-primary"
                      onClick={() => setShowReviewForm(!showReviewForm)}
                    >
                      <FiStar /> Write a Review
                    </button>
                  </div>
                )}

                {userHasReviewed && (
                  <div className="info-message">
                    <FiCheck /> You have already reviewed this property
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="info-message">
                    Please <Link to="/login">login</Link> to write a review
                  </div>
                )}

                {/* Review Form */}
                {showReviewForm && isAuthenticated && !userHasReviewed && (
                  <div className="review-form-container">
                    <h3>Write Your Review</h3>
                    <form onSubmit={handleReviewSubmit} className="review-form">
                      {/* Overall Rating */}
                      <div className="form-group">
                        <label>Overall Rating *</label>
                        <div className="star-rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className={`star-btn ${star <= reviewData.rating ? "active" : ""}`}
                              onClick={() => handleRatingChange("overall", star)}
                            >
                              ★
                            </button>
                          ))}
                          <span className="rating-text">{reviewData.rating} out of 5</span>
                        </div>
                      </div>

                      {/* Review Title */}
                      <div className="form-group">
                        <label>Review Title</label>
                        <input
                          type="text"
                          name="title"
                          value={reviewData.title}
                          onChange={handleReviewInputChange}
                          placeholder="Summarize your experience"
                          maxLength="100"
                        />
                      </div>

                      {/* Review Comment */}
                      <div className="form-group">
                        <label>Your Review *</label>
                        <textarea
                          name="comment"
                          value={reviewData.comment}
                          onChange={handleReviewInputChange}
                          placeholder="Share your experience with this property..."
                          required
                          rows="5"
                          maxLength="1000"
                        />
                        <small>{reviewData.comment.length}/1000 characters</small>
                      </div>

                      {/* Detailed Ratings */}
                      <div className="form-group">
                        <label>Detailed Ratings</label>
                        <div className="detailed-ratings">
                          {[
                            { key: "location", label: "Location" },
                            { key: "valueForMoney", label: "Value for Money" },
                            { key: "amenities", label: "Amenities" },
                            { key: "connectivity", label: "Connectivity" },
                            { key: "safety", label: "Safety" },
                          ].map((category) => (
                            <div key={category.key} className="rating-row">
                              <span className="rating-label">{category.label}</span>
                              <div className="star-rating small">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    className={`star-btn ${star <= reviewData.ratings[category.key] ? "active" : ""}`}
                                    onClick={() => handleRatingChange(category.key, star)}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pros */}
                      <div className="form-group">
                        <label>Pros</label>
                        <div className="pros-cons-list">
                          {reviewData.pros.map((pro, index) => (
                            <div key={index} className="list-item">
                              <span>✓ {pro}</span>
                              <button
                                type="button"
                                onClick={() => removeProCon("pro", index)}
                                className="remove-btn"
                              >
                                <FiX />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          className="btn-outline small"
                          onClick={() => addProCon("pro")}
                        >
                          + Add Pro
                        </button>
                      </div>

                      {/* Cons */}
                      <div className="form-group">
                        <label>Cons</label>
                        <div className="pros-cons-list">
                          {reviewData.cons.map((con, index) => (
                            <div key={index} className="list-item">
                              <span>✗ {con}</span>
                              <button
                                type="button"
                                onClick={() => removeProCon("con", index)}
                                className="remove-btn"
                              >
                                <FiX />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          className="btn-outline small"
                          onClick={() => addProCon("con")}
                        >
                          + Add Con
                        </button>
                      </div>

                      {/* Form Actions */}
                      <div className="form-actions">
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={() => setShowReviewForm(false)}
                          disabled={reviewSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-primary"
                          disabled={reviewSubmitting || !reviewData.comment.trim()}
                        >
                          {reviewSubmitting ? "Submitting..." : "Submit Review"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                {reviews.length > 0 ? (
                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <div key={review._id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer">
                            <div className="avatar">
                              {review.user?.name?.charAt(0)}
                            </div>
                            <div>
                              <span className="name">{review.user?.name}</span>
                              <span className="date">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>  
                          </div>
                          <div className="rating">
                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                          </div>
                        </div>
                        {review.title && <h4>{review.title}</h4>}
                        <p>{review.comment}</p>
                        
                        {/* Detailed Ratings */}
                        {review.ratings && (
                          <div className="review-detailed-ratings">
                            {Object.entries(review.ratings).map(([key, value]) => (
                              <div key={key} className="rating-badge">
                                <span className="badge-label">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </span>
                                <span className="badge-value">{"★".repeat(value)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Pros and Cons */}
                        {(review.pros?.length > 0 || review.cons?.length > 0) && (
                          <div className="review-pros-cons">
                            {review.pros?.length > 0 && (
                              <div className="pros">
                                <strong>Pros:</strong>
                                <ul>
                                  {review.pros.map((pro, idx) => (
                                    <li key={idx}>✓ {pro}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {review.cons?.length > 0 && (
                              <div className="cons">
                                <strong>Cons:</strong>
                                <ul>
                                  {review.cons.map((con, idx) => (
                                    <li key={idx}>✗ {con}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Helpful Votes */}
                        {review.helpfulVotes > 0 && (
                          <div className="helpful-votes">
                            <FiCheck /> {review.helpfulVotes} people found this helpful
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  !showReviewForm && <p className="no-data">No reviews yet. Be the first to review!</p>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="property-sidebar">
          {/* Agent Card */}
          <div className="agent-card">
            <div className="agent-header">
              <div className="agent-avatar">
                {property.owner?.avatar ? (
                  <img src={property.owner.avatar} alt={property.owner.name} />
                ) : (
                  <span>{property.owner?.name?.charAt(0)}</span>
                )}
              </div>
              <div className="agent-info">
                <h4>{property.owner?.name}</h4>
                <p>{property.owner?.companyName || "Property Owner"}</p>
              </div>
            </div>

            <div className="agent-stats">
              <div className="stat">
                <span className="value">{property.views}</span>
                <span className="label">Views</span>
              </div>
              <div className="stat">
                <span className="value">{property.inquiries}</span>
                <span className="label">Inquiries</span>
              </div>
            </div>

            <div className="contact-buttons">
              <button className="btn-primary" onClick={() => setShowInquiryForm(true)}>
                <FiMessageSquare /> Contact Owner
              </button>
              <button className="btn-primary" onClick={() => setShowBookingModal(true)}>
                <FiCheck /> Book Property
              </button>
              {property.owner?.phone && (
                <a href={`tel:${property.owner.phone}`} className="btn-outline">
                  <FiPhone /> Call Now
                </a>
              )}
            </div>
          </div>

          {/* Inquiry Form Modal */}
          {showInquiryForm && (
            <div className="inquiry-modal">
              <div className="modal-content">
                <h3>Contact Property Owner</h3>
                <form onSubmit={handleInquirySubmit}>
                  <div className="form-group">
                    <label>Inquiry Type</label>
                    <select
                      value={inquiryData.inquiryType}
                      onChange={(e) => setInquiryData({ ...inquiryData, inquiryType: e.target.value })}
                    >
                      <option value="general">General Inquiry</option>
                      <option value="schedule-visit">Schedule Visit</option>
                      <option value="price-negotiation">Price Negotiation</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={inquiryData.phone}
                      onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                      placeholder="Your phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      value={inquiryData.message}
                      onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                      placeholder="I'm interested in this property..."
                      rows={4}
                      required
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-outline" onClick={() => setShowInquiryForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Send Inquiry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* EMI Calculator Modal */}
          {showEMICalculator && (
            <div className="modal-overlay" onClick={() => setShowEMICalculator(false)}>
              <div className="modal-content emi-calculator-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3><FiTrendingUp /> EMI Calculator</h3>
                  <button className="close-btn" onClick={() => setShowEMICalculator(false)}>
                    <FiX />
                  </button>
                </div>
                
                <div className="emi-calculator-body">
                  <div className="emi-inputs">
                    <div className="form-group">
                      <label>Loan Amount (₹)</label>
                      <input
                        type="number"
                        name="loanAmount"
                        value={emiData.loanAmount}
                        onChange={handleEMIInputChange}
                        placeholder="Enter loan amount"
                      />
                      <small>Property Price: ₹{property.price.toLocaleString()}</small>
                    </div>

                    <div className="form-group">
                      <label>Interest Rate (% per annum)</label>
                      <input
                        type="number"
                        name="interestRate"
                        value={emiData.interestRate}
                        onChange={handleEMIInputChange}
                        step="0.1"
                        placeholder="Enter interest rate"
                      />
                      <div className="input-range">
                        <input
                          type="range"
                          name="interestRate"
                          min="6"
                          max="15"
                          step="0.1"
                          value={emiData.interestRate}
                          onChange={handleEMIInputChange}
                        />
                        <span>{emiData.interestRate}%</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Loan Tenure (Years)</label>
                      <input
                        type="number"
                        name="tenure"
                        value={emiData.tenure}
                        onChange={handleEMIInputChange}
                        placeholder="Enter tenure"
                      />
                      <div className="input-range">
                        <input
                          type="range"
                          name="tenure"
                          min="1"
                          max="30"
                          value={emiData.tenure}
                          onChange={handleEMIInputChange}
                        />
                        <span>{emiData.tenure} years</span>
                      </div>
                    </div>

                    <button className="btn-primary calculate-btn" onClick={calculateEMI}>
                      Calculate EMI
                    </button>
                  </div>

                  {emiResult && (
                    <div className="emi-results">
                      <div className="emi-result-card primary">
                        <label>Monthly EMI</label>
                        <h2>₹{emiResult.emi.toLocaleString()}</h2>
                      </div>

                      <div className="emi-breakdown">
                        <div className="breakdown-item">
                          <span>Principal Amount</span>
                          <strong>₹{emiResult.principal.toLocaleString()}</strong>
                        </div>
                        <div className="breakdown-item">
                          <span>Total Interest</span>
                          <strong>₹{emiResult.totalInterest.toLocaleString()}</strong>
                        </div>
                        <div className="breakdown-item">
                          <span>Total Amount</span>
                          <strong>₹{emiResult.totalAmount.toLocaleString()}</strong>
                        </div>
                      </div>

                      <div className="emi-chart">
                        <div className="chart-bar">
                          <div 
                            className="principal-bar" 
                            style={{ width: `${(emiResult.principal / emiResult.totalAmount) * 100}%` }}
                          >
                            <span>Principal</span>
                          </div>
                          <div 
                            className="interest-bar" 
                            style={{ width: `${(emiResult.totalInterest / emiResult.totalAmount) * 100}%` }}
                          >
                            <span>Interest</span>
                          </div>
                        </div>
                        <div className="chart-legend">
                          <div className="legend-item">
                            <span className="color-box principal"></span>
                            <span>Principal: {((emiResult.principal / emiResult.totalAmount) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="legend-item">
                            <span className="color-box interest"></span>
                            <span>Interest: {((emiResult.totalInterest / emiResult.totalAmount) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Booking Modal */}
          {showBookingModal && property && (
            <BookingConfirmation 
              property={property}
              isOpen={showBookingModal}
              onClose={() => setShowBookingModal(false)}
              onSuccess={() => {
                setShowBookingModal(false);
                // Optional: show success message
              }}
            />
          )}

          {/* Weather Widget */}
          {weather && (
            <div className="weather-card">
              <h4><FiCloud /> Weather in {property.location.city}</h4>
              <div className="weather-display">
                <div className="weather-icon">
                  <img 
                    src={`https://openweathermap.org/img/wn/${weather.weather?.[0]?.icon}@2x.png`}
                    alt={weather.weather?.[0]?.description}
                  />
                </div>
                <div className="weather-info">
                  <span className="temp">{Math.round(weather.main?.temp)}°C</span>
                  <span className="desc">{weather.weather?.[0]?.description}</span>
                  <div className="weather-details">
                    <span>Humidity: {weather.main?.humidity}%</span>
                    <span>Wind: {weather.wind?.speed} m/s</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EMI Calculator */}
          {property.listingType === "buy" && (
            <div className="emi-card">
              <h4>EMI Calculator</h4>
              <div className="emi-estimate">
                <span className="emi-value">
                  ₹{Math.round((property.price * 0.08) / 12).toLocaleString()}/month
                </span>
                <span className="emi-note">Estimated EMI at 8% for 20 years</span>
              </div>
              <button className="btn-outline full" onClick={openEMICalculator}>
                Calculate Custom EMI
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Similar Properties */}
      {similarProperties.length > 0 && (
        <section className="similar-properties">
          <h2>Similar Properties</h2>
          <div className="properties-grid">
            {similarProperties.slice(0, 4).map((prop) => (
              <PropertyCard key={prop._id} property={prop} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
export default PropertyDetails;
