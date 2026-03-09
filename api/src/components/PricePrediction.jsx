import React, { useState } from 'react';
import mlservice from '../services/mlservice';
import './PricePrediction.css';

const PricePrediction = ({ propertyData, onPriceSelect }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);

    // Count amenities
    const amenitiesCount = Object.values(propertyData.amenities || {}).filter(
      Boolean
    ).length;

    const result = await mlservice.predictPrice({
      city: propertyData.city,
      area: propertyData.area,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      amenitiesCount: amenitiesCount,
    });

    setLoading(false);

    if (result.success) {
      setPrediction(result.data);
    } else {
      setError(result.error);
    }
  };

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="price-prediction-card">
      <div className="prediction-header">
        <h3>AI-Powered Price Prediction</h3>
        <p>Get an estimated price based on similar properties</p>
      </div>

      <button
        className="predict-btn"
        onClick={handlePredict}
        disabled={loading || !propertyData.area || !propertyData.bedrooms}
      >
        {loading ? 'Analyzing...' : 'Get Price Suggestion'}
      </button>

      {error && (
        <div className="prediction-error">
          <p>{error}</p>
          <small>Make sure ML service is running on port 5001</small>
        </div>
      )}

      {prediction && prediction.success && (
        <div className="prediction-result">
          <div className="predicted-price">
            <label>Suggested Price</label>
            <h2>{formatPrice(prediction.predictedPrice)}</h2>
            <p className="price-range">
              Range: {formatPrice(prediction.priceRange.min)} -{' '}
              {formatPrice(prediction.priceRange.max)}
            </p>
            <p className="price-sqft">
              ₹{prediction.pricePerSqft.toLocaleString('en-IN')}/sqft
            </p>
          </div>

          <button
            className="use-price-btn"
            onClick={() => onPriceSelect(prediction.predictedPrice)}
          >
            Use This Price
          </button>

          <div className="prediction-info">
            <small>✓ Based on {propertyData.city} market data</small>
            <small>
              ✓ Confidence: {(prediction.confidence * 100).toFixed(0)}%
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricePrediction;
