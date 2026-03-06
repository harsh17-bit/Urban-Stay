import { useNavigate, Link } from 'react-router-dom';
import { FiHeart, FiMapPin, FiMaximize, FiHome } from 'react-icons/fi';
import { getImageUrl } from '../utils/imageUtils';
import { useAuth } from '../context/authcontext.jsx';
import './PropertyCard.css';

const PropertyCard = ({ property, viewMode = 'grid' }) => {
  const { user, isAuthenticated, toggleFavorite } = useAuth();
  const navigate = useNavigate();

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
    if (!isAuthenticated) {
      alert('Please Register or Login to manage Favourites.');
      navigate('/register');
      return;
    }
    try {
      await toggleFavorite(_id);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
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
            <p className="property-price">{formatPrice(price, listingType)}</p>
            <button
              className={`favorite-btn${isFavorited ? ' active' : ''}`}
              onClick={handleFavoriteClick}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FiHeart />
            </button>
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
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
  );
};

export default PropertyCard;
