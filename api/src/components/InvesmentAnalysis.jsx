import React, { usestate } from 'react';
import mlservice from '../services/mlservice';
import './InvestmentAnalysis.css';

const InvestmentAnalysis = ({ propertyData, propertyPrice }) => {
  const [analysis, setanalysis] = usestate(null);
  const [loading, setloading] = usestate(false);
  const [error, seterror] = usestate(null);

  const handleAnalyze = async () => {
    setloading(true);
    seterror(null);
    const result = await mlservice.analyzeInvestment({
      city: propertyData.city,
      area: propertyData.area,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      amenities: propertyData.amenities || [],
      price: propertyPrice,
    });
    setloading(false);
    if (result.success) {
      setanalysis(result.data);
    } else {
      seterror(result.error);
    }
  };
  const getRoiBadgecolor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 70) return 'yellow';
    if (score >= 60) return 'orange';
    if (score >= 50) return 'red';
    return 'gray';
  };
  // give recommendation based on catedory
  const getRecommendation = (category) => {
    if (category === 'Excellent')
      return 'This property has a high potential for rental income and appreciation. Consider investing!';
    if (category === 'Good')
      return 'This property has a good potential for rental income and appreciation. Worth considering!';
    if (category === 'Average')
      return 'This property has an average potential for rental income and appreciation. Do more research before investing.';
    if (category === 'Below Average')
      return 'This property has a below average potential for rental income and appreciation. Be cautious before investing.';
    if (category === 'Poor')
      return 'This property has a poor potential for rental income and appreciation. It may not be a good investment.';
    return 'No recommendation available.';
  };
  return (
    <div className="investment-analysis-card">
      <div className="ia-header">
        <div className="ia-icon">
          <FiBarChart2 size={28} />
        </div>
        <div>
          <h3>Investment Analysis</h3>
          <p>AI-powered ROI prediction & market insights</p>
        </div>
      </div>

      <button
        className="ia-analyze-btn"
        onClick={handleAnalyze}
        disabled={loading || !propertyData.area || !propertyData.bedrooms}
      >
        {loading ? 'Analyzing...' : 'Analyze Investment Potential'}
      </button>

      {error && (
        <div className="ia-error">
          <p>{error}</p>
          <small>Make sure ML service is running on port 5001</small>
        </div>
      )}

      {analysis && (
        <div className="ia-results">
          {/* ROI Score Card */}
          <div
            className="ia-roi-card"
            style={{ borderLeftColor: getRoiBadgeColor(analysis.roiScore) }}
          >
            <div
              className="ia-roi-circle"
              style={{ backgroundColor: getRoiBadgeColor(analysis.roiScore) }}
            >
              <span className="ia-roi-value">{analysis.roiScore}</span>
              <span className="ia-roi-label">/ 100</span>
            </div>
            <div className="ia-roi-info">
              <h4>{analysis.category}</h4>
              <p>{analysis.recommendation}</p>
              <small>
                ✓ {(analysis.confidence * 100).toFixed(0)}% confidence
              </small>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="ia-metrics-grid">
            {/* Rental Yield */}
            <div className="ia-metric">
              <div className="ia-metric-icon">
                <FiPercent color="#3b82f6" size={24} />
              </div>
              <div className="ia-metric-content">
                <label>Annual Rental Yield</label>
                <h4>{analysis.rentalYield}%</h4>
                <small>Estimated annual return</small>
              </div>
            </div>

            {/* 5-Year Appreciation */}
            <div className="ia-metric">
              <div className="ia-metric-icon">
                <FiTrendingUp color="#10b981" size={24} />
              </div>
              <div className="ia-metric-content">
                <label>5-Year Appreciation</label>
                <h4>+{analysis.appreciation.fiveYearPercent}%</h4>
                <small>
                  ₹{(analysis.appreciation.fiveYear / 100000).toFixed(2)}L gain
                </small>
              </div>
            </div>

            {/* 10-Year Appreciation */}
            <div className="ia-metric">
              <div className="ia-metric-icon">
                <FiAward color="#f59e0b" size={24} />
              </div>
              <div className="ia-metric-content">
                <label>10-Year Appreciation</label>
                <h4>+{analysis.appreciation.tenYearPercent}%</h4>
                <small>
                  ₹{(analysis.appreciation.tenYear / 100000).toFixed(2)}L gain
                </small>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="ia-breakdown">
            <h5>Investment Factor Scores</h5>

            <div className="ia-factor">
              <label>Location Quality</label>
              <div className="ia-progress-bar">
                <div
                  className="ia-progress-fill"
                  style={{
                    width: `${analysis.scores.location}%`,
                    backgroundColor: '#3b82f6',
                  }}
                />
              </div>
              <span>{analysis.scores.location}/100</span>
            </div>

            <div className="ia-factor">
              <label>Amenity Score</label>
              <div className="ia-progress-bar">
                <div
                  className="ia-progress-fill"
                  style={{
                    width: `${analysis.scores.amenity}%`,
                    backgroundColor: '#10b981',
                  }}
                />
              </div>
              <span>{Math.round(analysis.scores.amenity)}/100</span>
            </div>

            <div className="ia-factor">
              <label>Possession Status</label>
              <div className="ia-progress-bar">
                <div
                  className="ia-progress-fill"
                  style={{
                    width: `${analysis.scores.possession}%`,
                    backgroundColor: '#f59e0b',
                  }}
                />
              </div>
              <span>{analysis.scores.possession}/100</span>
            </div>
          </div>

          {/* Recommendation Box */}
          <div className="ia-recommendation">
            <div className="ia-rec-icon">
              {getRecommendationIcon(analysis.category) === '✓' ? (
                <span style={{ fontSize: '24px', color: '#10b981' }}>💡</span>
              ) : (
                <span style={{ fontSize: '24px' }}>ℹ️</span>
              )}
            </div>
            <div className="ia-rec-text">
              <strong>Investment Insight</strong>
              <p>
                {analysis.roiScore >= 75
                  ? `This property shows strong investment potential with ${analysis.rentalYield}% annual yield and ${analysis.appreciation.fiveYearPercent}% estimated appreciation in 5 years.`
                  : analysis.roiScore >= 60
                    ? `Moderate investment opportunity. Consider comparing with nearby properties in the same area.`
                    : `This property may require further evaluation. Explore other options in different locations.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
