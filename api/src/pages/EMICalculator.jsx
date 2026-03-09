import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiExternalLink, FiPhone } from "react-icons/fi";
import "./EMICalculator.css";

/* ── helpers ── */
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

/* ── Donut Chart Component ── */
const DonutChart = ({ principal, interest }) => {
  const total = principal + interest;
  if (total === 0) return null;

  const principalPct = (principal / total) * 100;
  const interestPct = (interest / total) * 100;

  const R = 70;
  const cx = 90;
  const cy = 90;
  const circ = 2 * Math.PI * R;
  const principalDash = (principalPct / 100) * circ;
  const interestDash = (interestPct / 100) * circ;

  return (
    <svg viewBox="0 0 180 180" className="emi-donut-chart">
      {/* Background circle */}
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke="#e8f4f8"
        strokeWidth="24"
      />
      {/* Principal Arc (Green) */}
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke="#00a88e"
        strokeWidth="24"
        strokeDasharray={`${principalDash} ${circ}`}
        strokeDashoffset={0}
        strokeLinecap="butt"
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: `${cx}px ${cy}px`,
        }}
      />
      {/* Interest Arc (Yellow/Gold) */}
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke="#ffc107"
        strokeWidth="24"
        strokeDasharray={`${interestDash} ${circ}`}
        strokeDashoffset={-principalDash}
        strokeLinecap="butt"
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: `${cx}px ${cy}px`,
        }}
      />
    </svg>
  );
};

const EMICalculator = () => {
  const [loanAmount, setLoanAmount] = useState(800000);
  const [tenure, setTenure] = useState(10);
  const [interestRate, setInterestRate] = useState(4.1);

  const [showCallbackModal, setShowCallbackModal] = useState(false);

  const result = useMemo(() => {
    const r = interestRate / 12 / 100;
    const n = tenure * 12;
    if (r === 0 || n === 0 || loanAmount === 0) return null;
    const emi =
      (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - loanAmount;
    return {
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
    };
  }, [loanAmount, interestRate, tenure]);

  const handleLoanAmountChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    const numValue = parseInt(value) || 0;
    setLoanAmount(numValue);
  };

  const handleRecalculate = () => {
    // Trigger recalculation (already done via useMemo)
    console.log("Recalculating EMI...");
  };

  return (
    <div className="emi-calculator-page">
      {/* Main Calculator Section */}
      <section className="emi-calc-section">
        <div className="emi-calc-container">
          {/* Left Panel - Inputs */}
          <div className="emi-input-panel">
            {/* Loan Amount */}
            <div className="emi-input-group">
              <label className="emi-label">Loan Amount</label>
              <div className="emi-input-field">
                <span className="currency-symbol">₹</span>
                <input
                  type="text"
                  value={fmt(loanAmount)}
                  onChange={handleLoanAmountChange}
                  className="emi-text-input"
                />
              </div>
            </div>

            {/* Loan Tenure & Interest Rate Row */}
            <div className="emi-input-row">
              <div className="emi-input-group">
                <label className="emi-label">Loan Tenure</label>
                <div className="emi-select-wrapper">
                  <select
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="emi-select"
                  >
                    {[5, 7, 9, 10, 12, 15, 17, 20, 23, 25, 27, 30, 35].map(
                      (yr) => (
                        <option key={yr} value={yr}>
                          {yr} yrs
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              <div className="emi-input-group">
                <label className="emi-label">Interest Rate % (p.a.)</label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  step="0.1"
                  min="1"
                  max="20"
                  className="emi-rate-input"
                />
              </div>
            </div>
            {/* Recalculate Button */}
            <button className="emi-calculate-btn" onClick={handleRecalculate}>
              Recalculate Your EMI
            </button>
          </div>

          {/* Right Panel - Results */}
          <div className="emi-result-panel">
            {result && (
              <>
                {/* EMI Amount Header */}
                <div className="emi-result-header">
                  <span className="emi-eligible-text">
                    You are Eligible for EMI Amount
                  </span>
                  <span className="emi-amount">₹{fmt(result.emi)}</span>
                </div>

                {/* Donut Chart with Legend */}
                <div className="emi-chart-section">
                  <div className="emi-donut-wrapper">
                    <DonutChart
                      principal={loanAmount}
                      interest={result.totalInterest}
                    />
                  </div>
                  <div className="emi-chart-legend">
                    <div className="legend-item">
                      <span className="legend-dot principal"></span>
                      <div className="legend-info">
                        <span className="legend-label">Principal Amount</span>
                        <span className="legend-value">₹{fmt(loanAmount)}</span>
                      </div>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot interest"></span>
                      <div className="legend-info">
                        <span className="legend-label">Interest Amount</span>
                        <span className="legend-value">
                          ₹{fmt(result.totalInterest)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="emi-info-section">
        <div className="emi-info-container">
          <h2>How Is EMI Calculated?</h2>
          <p className="emi-info-subtitle">
            The standard formula used by all banks in India
          </p>

          <div className="emi-formula-box">
            <div className="formula-text">
              EMI = [P × R × (1+R)<sup>N</sup>] ÷ [(1+R)<sup>N</sup> − 1]
            </div>
            <div className="formula-legend">
              <div>
                <strong>P</strong> = Principal loan amount
              </div>
              <div>
                <strong>R</strong> = Monthly interest rate (Annual rate ÷ 12 ÷
                100)
              </div>
              <div>
                <strong>N</strong> = Total number of monthly instalments (Years
                × 12)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Callback Modal */}
      {showCallbackModal && (
        <div
          className="callback-modal-overlay"
          onClick={() => setShowCallbackModal(false)}
        >
          <div className="callback-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowCallbackModal(false)}
            >
              ×
            </button>
            <h3>Get Callback for Best Home Loan Offers</h3>
            <form
              className="callback-form"
              onSubmit={(e) => {
                e.preventDefault();
                setShowCallbackModal(false);
              }}
            >
              <input type="text" placeholder="Your Name" required />
              <input type="tel" placeholder="Phone Number" required />
              <input type="email" placeholder="Email Address" required />
              <select defaultValue="">
                <option value="" disabled>
                  Select City
                </option>
                <option value="mumbai">Mumbai</option>
                <option value="delhi">Delhi</option>
                <option value="bangalore">Bangalore</option>
                <option value="chennai">Chennai</option>
                <option value="hyderabad">Hyderabad</option>
                <option value="pune">Pune</option>
              </select>
              <button type="submit" className="callback-submit-btn">
                Request Callback
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EMICalculator;
