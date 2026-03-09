import React from 'react';
import { FiDatabase, FiCpu, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import './I_How-it-Works.css';

const InvestmentHowItWorks = () => {
  const steps = [
    {
      num: '1',
      title: 'Data Collection',
      description:
        'AI analyzes property details: location, area, bedrooms, amenities, and market data',
      icon: <FiDatabase size={32} />,
      color: '#3b82f6',
    },
    {
      num: '2',
      title: 'ML Processing',
      description:
        'Machine learning models process features to calculate investment metrics',
      icon: <FiCpu size={32} />,
      color: '#8b5cf6',
    },
    {
      num: '3',
      title: 'Score Calculation',
      description:
        'Generates ROI score, rental yield, and appreciation forecasts',
      icon: <FiBarChart2 size={32} />,
      color: '#10b981',
    },
    {
      num: '4',
      title: 'Investment Insight',
      description: 'Provides actionable recommendations and confidence metrics',
      icon: <FiTrendingUp size={32} />,
      color: '#f59e0b',
    },
  ];

  return (
    <section className="hiw-section">
      <div className="hiw-container">
        <div className="hiw-header">
          <h2>How Investment Analysis Works</h2>
          <p>
            Urban-Stay's AI analyzes every property to give you data-driven
            investment insights
          </p>
        </div>

        <div className="hiw-steps">
          {steps.map((step, index) => (
            <div key={index} className="hiw-step">
              <div
                className="hiw-step-number"
                style={{ backgroundColor: step.color }}
              >
                {step.num}
              </div>
              <div className="hiw-step-icon" style={{ color: step.color }}>
                {step.icon}
              </div>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          ))}
        </div>

        {/* Connection Lines */}
        <svg className="hiw-lines" viewBox="0 0 1000 200">
          <line
            x1="150"
            y1="100"
            x2="320"
            y2="100"
            stroke="#e5e7eb"
            strokeWidth="2"
          />
          <line
            x1="430"
            y1="100"
            x2="600"
            y2="100"
            stroke="#e5e7eb"
            strokeWidth="2"
          />
          <line
            x1="710"
            y1="100"
            x2="880"
            y2="100"
            stroke="#e5e7eb"
            strokeWidth="2"
          />
        </svg>

        {/* Key Metrics Explained */}
        <div className="hiw-metrics">
          <h3>Key Investment Metrics Explained</h3>
          <div className="hiw-metrics-grid">
            <div className="hiw-metric-card">
              <div className="hiw-metric-label">ROI Score (0-100)</div>
              <div className="hiw-metric-desc">
                Overall investment potential combining rental yield, location
                quality, and amenities
              </div>
              <div className="hiw-metric-example">
                <strong>Example:</strong> Score 85 = Excellent investment
              </div>
            </div>

            <div className="hiw-metric-card">
              <div className="hiw-metric-label">Rental Yield (%)</div>
              <div className="hiw-metric-desc">
                Annual rental income as percentage of property price
              </div>
              <div className="hiw-metric-example">
                <strong>Example:</strong> 4.2% yield = ₹42,000 annual return per
                ₹10L property
              </div>
            </div>

            <div className="hiw-metric-card">
              <div className="hiw-metric-label">5 & 10 Year Appreciation</div>
              <div className="hiw-metric-desc">
                Projected capital appreciation based on location trends
              </div>
              <div className="hiw-metric-example">
                <strong>Example:</strong> +18% in 5yr = ₹10L becomes ₹11.8L
              </div>
            </div>

            <div className="hiw-metric-card">
              <div className="hiw-metric-label">Confidence Score</div>
              <div className="hiw-metric-desc">
                Accuracy of the prediction based on available data
              </div>
              <div className="hiw-metric-example">
                <strong>Example:</strong> 88% confidence = Highly reliable
              </div>
            </div>
          </div>
        </div>

        {/* Investment Categories */}
        <div className="hiw-categories">
          <h3>Investment Categories</h3>
          <div className="hiw-categories-list">
            <div className="hiw-category excellent">
              <span className="hiw-cat-badge">Excellent</span>
              <span className="hiw-cat-score">80-100</span>
              <p>Strong ROI potential, excellent location, high demand</p>
            </div>
            <div className="hiw-category very-good">
              <span className="hiw-cat-badge">Very Good</span>
              <span className="hiw-cat-score">70-79</span>
              <p>Good investment opportunity, solid fundamentals</p>
            </div>
            <div className="hiw-category good">
              <span className="hiw-cat-badge">Good</span>
              <span className="hiw-cat-score">60-69</span>
              <p>Moderate potential, compare with alternatives</p>
            </div>
            <div className="hiw-category average">
              <span className="hiw-cat-badge">Average</span>
              <span className="hiw-cat-score">50-59</span>
              <p>Limited growth potential, lower priority</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvestmentHowItWorks;
