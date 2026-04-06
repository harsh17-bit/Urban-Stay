import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiMapPin, FiMaximize, FiHome } from 'react-icons/fi';
import { getImageUrl } from '../utils/imageUtils';
import { useAuth } from '../context/authcontext.jsx';
import PaymentToast from './PaymentToast.jsx';
import './PropertyCard.css';

const PropertyCard = ({ property, viewMode = 'grid', onWishlistToast }) => {
  const { user, isAuthenticated, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const [wishlistToast, setWishlistToast] = useState({
    show: false,
    type: 'success',
    message: '',
  });
  const guestFavoriteClickTimer = useRef(null);
  const [guestFavoriteClickCount, setGuestFavoriteClickCount] = useState(0);

  if (!property) return null;

  const {
    _id,
    title = 'Property',
    location = {},
    price = 0,
    specifications = {},
    propertyType = 'Apartment',
    listingType = 'buy',
    images = [],
    status = 'available',
  } = property;

  const isSold = status === 'sold';
  const isRented = status === 'rented';
  const isUnavailable = isSold || isRented;

  // Check if this property is in the user's favorites
  const isFavorited = user?.favorites?.some(
    (fav) =>
      (typeof fav === 'object' ? fav._id : fav)?.toString() === _id?.toString()
  );

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const showWishlistToast = (type, message) => {
      if (typeof onWishlistToast === 'function') {
        onWishlistToast(type, message);
        return;
      }

      // Reset first so repeated clicks always retrigger toast animation/timer.
      setWishlistToast({ show: false, type, message: '' });
      setTimeout(() => {
        setWishlistToast({ show: true, type, message });
      }, 0);
    };

    if (!isAuthenticated) {
      if (guestFavoriteClickCount === 0) {
        showWishlistToast(
          'error',
          'Please login/register for wishlist this property.'
        );
        setGuestFavoriteClickCount(1);

        if (guestFavoriteClickTimer.current) {
          clearTimeout(guestFavoriteClickTimer.current);
        }

        guestFavoriteClickTimer.current = setTimeout(() => {
          setGuestFavoriteClickCount(0);
        }, 1800);
        return;
      }

      if (guestFavoriteClickTimer.current) {
        clearTimeout(guestFavoriteClickTimer.current);
      }
      setGuestFavoriteClickCount(0);
      showWishlistToast(
        'error',
        'Please login/register for wishlist this property.'
      );
      navigate('/register', {
        state: {
          message: 'Please login/register for wishlist this property.',
        },
      });
      return;
    }

    if (user?.role === 'admin') {
      showWishlistToast('error', 'Admin cannot do any property wishlist.');
      return;
    }

    try {
      const response = await toggleFavorite(_id);
      const added = !!response?.isFavorite;

      showWishlistToast(
        'success',
        added
          ? 'Property added to wishlist.'
          : 'Property removed from wishlist.'
      );
    } catch (err) {
      showWishlistToast(
        'error',
        err?.message || 'Failed to update wishlist. Please try again.'
      );
    }
  };

  const image = getImageUrl(images?.[0]?.url || images?.[0]);

  const formatPrice = (price, type) => {
    if (type === 'rent') {
      return `₹${price?.toLocaleString('en-IN')}/mo`;
    }
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lac`;
    }
    return `₹${price?.toLocaleString('en-IN')}`;
  };

  const cityName = location?.city || location || 'Location';
  const bhk = specifications?.bedrooms || property.bhk || 0;
  const area = specifications?.carpetArea || property.area || 0;

  const Wrapper = _id ? Link : 'div';
  const wrapperProps = _id
    ? {
        to: `/property/${_id}`,
        className: isUnavailable ? 'property-card--unavailable' : '',
      }
    : { role: 'article', 'aria-disabled': true };

  if (viewMode === 'list') {
    return (
      <div className="property-card-shell">
        <PaymentToast
          show={wishlistToast.show}
          type={wishlistToast.type}
          message={wishlistToast.message}
          duration={2500}
          onClose={() => setWishlistToast((prev) => ({ ...prev, show: false }))}
        />
        <Wrapper {...wrapperProps} className="property-card list-view">
          <div className="property-image-wrap">
            <img
              src={image}
              alt={title}
              className="property-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400';
              }}
              loading="lazy"
            />

            <span className="listing-type-badge">
              {listingType === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
            {isUnavailable && (
              <div className="sold-overlay">
                <span>{isSold ? 'SOLD' : 'RENTED'}</span>
              </div>
            )}
          </div>

          <div className="property-body">
            <div className="property-main-info">
              <span className="property-type-tag">{propertyType}</span>
              <h3 className="property-title">{title}</h3>
              <p className="property-location">
                <FiMapPin />
                {cityName}
              </p>
            </div>

            <div className="property-specs">
              {bhk > 0 && (
                <div className="spec">
                  <FiHome />
                  <span>{bhk} BHK</span>
                </div>
              )}
              {area > 0 && (
                <div className="spec">
                  <FiMaximize />
                  <span>{area} sq.ft</span>
                </div>
              )}
            </div>

            <div className="property-footer">
              <p className="property-price">
                {formatPrice(price, listingType)}
              </p>
              <button
                className={`favorite-btn${isFavorited ? ' active' : ''}`}
                onClick={handleFavoriteClick}
                title={
                  isFavorited ? 'Remove from favorites' : 'Add to favorites'
                }
              >
                <FiHeart />
              </button>
            </div>
          </div>
        </Wrapper>
      </div>
    );
  }

  return (
    <div className="property-card-shell">
      <PaymentToast
        show={wishlistToast.show}
        type={wishlistToast.type}
        message={wishlistToast.message}
        duration={2500}
        onClose={() => setWishlistToast((prev) => ({ ...prev, show: false }))}
      />
      <Wrapper {...wrapperProps} className="property-card">
        {/* Image */}
        <div className="property-image-wrap">
          <img
            src={image}
            alt={title}
            className="property-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400';
            }}
            loading="lazy"
          />
          <span className="listing-type-badge">
            {listingType === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
          {isUnavailable && (
            <div className="sold-overlay">
              <span>{isSold ? 'SOLD' : 'RENTED'}</span>
            </div>
          )}
          {!isUnavailable && (
            <button
              className={`favorite-btn${isFavorited ? ' active' : ''}`}
              onClick={handleFavoriteClick}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FiHeart />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="property-body">
          <span className="property-type-tag">{propertyType}</span>
          <h3 className="property-title">{title}</h3>
          <p className="property-location">
            <FiMapPin />
            {cityName}
          </p>

          {(bhk > 0 || area > 0) && (
            <div className="property-meta">
              {bhk > 0 && (
                <span>
                  <FiHome /> {bhk} BHK
                </span>
              )}
              {area > 0 && (
                <span>
                  <FiMaximize /> {area} sq.ft
                </span>
              )}
            </div>
          )}

          <div className="property-footer">
            <p className="property-price">{formatPrice(price, listingType)}</p>
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default PropertyCard;
