import React, { useState, useEffect } from 'react';
import mlservice from '../services/mlservice';
import { FiTrendingUp, FiPercent, FiAward, FiBarChart2 } from 'react-icons/fi';
import './F_Investment.css';

const FeaturedInvestmentProperties = () => {
  // Sample properties to showcase
  const sampleProperties = [
    {
      id: 1,
      title: '2BHK Apartment in Whitefield',
      image:
        'https://images.unsplash.com/photo-1545324418-cc1a9db4dae4?w=500&h=350&fit=crop',
      city: 'Bangalore',
      area: 1200,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['gym', 'pool', 'security', 'parking'],
      price: 7500000,
    },
    {
      id: 2,
      title: '3BHK Villa in Koramangala',
      image:
        'https://images.unsplash.com/photo-1512917774080-9b274c5843c9?w=500&h=350&fit=crop',
      city: 'Bangalore',
      area: 1800,
      bedrooms: 3,
      bathrooms: 3,
      amenities: ['gym', 'pool', 'garden', 'parking'],
      price: 12500000,
    },
    {
      id: 3,
      title: '2BHK Flat in Indiranagar',
      image:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=350&fit=crop',
      city: 'Bangalore',
      area: 1100,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['gym', 'security', 'parking'],
      price: 6200000,
    },
  ];

  const [properties] = useState(sampleProperties);
  const [analyses, setAnalyses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    analyzeAllProperties();
  }, []);

  const analyzeAllProperties = async () => {
    setLoading(true);
    const newAnalyses = {};

    for (const prop of sampleProperties) {
      const result = await mlservice.analyzeInvestment({
        city: prop.city,
        area: prop.area,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        amenities: prop.amenities,
        price: prop.price,
      });

      if (result.success) {
        newAnalyses[prop.id] = result.data;
      }
    }

    setAnalyses(newAnalyses);
    setLoading(false);
  };

  const getRoiBadgeColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    }
    return `₹${(price / 100000).toFixed(1)}L`;
  };

  return (
    <section className="featured-investment-section">
      <div className="featured-investment-container">
        <div className="featured-investment-header">
          <h2>Featured Investment Opportunities</h2>
          <p>
            Explore properties analyzed by our AI investment intelligence system
          </p>
        </div>

        {loading ? (
          <div className="featured-loading">
            <div className="spinner"></div>
            <p>Analyzing investment potential...</p>
          </div>
        ) : (
          <div className="featured-investment-grid">
            {properties.map((prop) => {
              const analysis = analyses[prop.id];
              return (
                <div key={prop.id} className="featured-investment-card">
                  {/* Image Section */}
                  <div className="fic-image-wrapper">
                    <img
                      src={prop.image}
                      alt={prop.title}
                      className="fic-image"
                    />
                    <div
                      className="fic-roi-badge"
                      style={{
                        backgroundColor: getRoiBadgeColor(
                          analysis?.roiScore || 0
                        ),
                      }}
                    >
                      <div className="fic-roi-score">
                        {analysis?.roiScore || '--'}
                      </div>
                      <div className="fic-roi-label">Score</div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="fic-content">
                    <h3>{prop.title}</h3>
                    <p className="fic-location">
                      {prop.city} • {prop.area} sqft
                    </p>

                    <div className="fic-specs">
                      <span className="fic-spec">🛏️ {prop.bedrooms} BHK</span>
                      <span className="fic-spec">🚿 {prop.bathrooms} Bath</span>
                    </div>

                    <div className="fic-price">
                      <span className="fic-price-label">Asking Price</span>
                      <span className="fic-price-value">
                        {formatPrice(prop.price)}
                      </span>
                    </div>

                    {/* Investment Metrics */}
                    {analysis && (
                      <div className="fic-metrics">
                        <div className="fic-metric-item">
                          <div className="fic-metric-icon">
                            <FiPercent size={18} />
                          </div>
                          <div className="fic-metric-text">
                            <label>Annual Yield</label>
                            <value>{analysis.rentalYield}%</value>
                          </div>
                        </div>

                        <div className="fic-metric-item">
                          <div className="fic-metric-icon">
                            <FiTrendingUp size={18} />
                          </div>
                          <div className="fic-metric-text">
                            <label>5-Yr Appreciation</label>
                            <value>
                              +{analysis.appreciation.fiveYearPercent}%
                            </value>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Category Badge */}
                    {analysis && (
                      <div className="fic-category">
                        <span
                          className={`fic-category-badge ${analysis.category.toLowerCase()}`}
                        >
                          {analysis.category}
                        </span>
                        <span className="fic-confidence">
                          ✓ {(analysis.confidence * 100).toFixed(0)}% confident
                        </span>
                      </div>
                    )}

                    {/* Recommendation */}
                    {analysis && (
                      <div className="fic-recommendation">
                        <p>{analysis.recommendation}</p>
                      </div>
                    )}

                    <button className="fic-view-btn">
                      View Full Analysis →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedInvestmentProperties;
