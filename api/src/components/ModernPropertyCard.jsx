import React from "react";
import {
  FiHeart,
  FiMapPin,
  FiStar,
  FiEdit,
  FiHome,
  FiMaximize,
} from "react-icons/fi";
import { LuBath } from "react-icons/lu";
import { getImageUrl } from "../utils/imageUtils";
import "./ModernPropertyCard.css";

const ModernPropertyCard = ({ property, onReserve }) => {
  if (!property) return null;

  const {
    _id,
    title = "Lakeshore Blvd West",
    location = "2464 Royal Ln. Mesa, New Jersey",
    price = 250,
    specifications = { bedrooms: 3, bathrooms: 4, carpetArea: 3210 },
    rating = 4.8,
    reviewsCount = 20,
    images = [],
  } = property;

  const image =
    getImageUrl(images?.[0]?.url || images?.[0]) ||
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800";

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Logic for favorite (can be passed via props or context)
  };

  return (
    <div className="modern-property-card">
      <div className="modern-card-image-container">
        <img src={image} alt={title} className="modern-card-image" />

        <div className="modern-card-price-tag">${price} Night</div>

        <button className="modern-card-favorite" onClick={handleFavoriteClick}>
          <FiHeart />
        </button>

        <div className="modern-card-pagination">
          <span className="pagination-dot active"></span>
          <span className="pagination-dot"></span>
          <span className="pagination-dot"></span>
          <span className="pagination-dot"></span>
          <span className="pagination-dot"></span>
        </div>

        <div className="modern-card-content">
          <div className="modern-card-header">
            <h3 className="modern-card-title">{title}</h3>
            <div className="modern-card-rating">
              <FiStar className="star-icon" />
              <span>
                {rating} <span className="rating-count">({reviewsCount})</span>
              </span>
            </div>
          </div>

          <div className="modern-card-location">
            <FiMapPin />
            <span>
              {typeof location === "string"
                ? location
                : `${location.address || ""} ${location.city || ""}`}
            </span>
          </div>

          <div className="modern-card-specs">
            <div className="spec-item">
              <FiHome />
              <span>{specifications.bedrooms} Bedrooms</span>
            </div>
            <div className="spec-item">
              <LuBath />
              <span>{specifications.bathrooms} Bathrooms</span>
            </div>
            <div className="spec-item">
              <FiMaximize />
              <span>{specifications.carpetArea} Sqft</span>
            </div>
          </div>

          <div className="modern-card-footer">
            <button
              className="reserve-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onReserve && onReserve(_id);
              }}
            >
              <FiEdit />
              Reserve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernPropertyCard;
