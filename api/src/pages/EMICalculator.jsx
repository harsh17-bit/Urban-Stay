import { useState, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiPercent, FiCalendar, FiDollarSign, FiTrendingDown,
  FiInfo, FiChevronDown, FiChevronUp, FiExternalLink,
} from "react-icons/fi";
import "./EMICalculator.css";

/* ── helpers ── */
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

const fmtCr = (n) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return `₹${fmt(n)}`;
};

/* ── bank comparison data ── */
const BANKS = [
  { name: "SBI",           rate: 8.40, logo: "SBI" },
  { name: "HDFC Bank",     rate: 8.55, logo: "HDFC" },
  { name: "ICICI Bank",    rate: 8.60, logo: "ICICI" },
  { name: "Axis Bank",     rate: 8.75, logo: "AXIS" },
  { name: "Kotak Mahindra",rate: 8.70, logo: "KMB" },
  { name: "LIC HFL",       rate: 8.50, logo: "LIC" },
];


/* ── donut chart ── */
const Donut = ({ principal, interest }) => {
  const total = principal + interest;
  const pPct = (principal / total) * 100;

  const R = 80;
  const cx = 100;
  const cy = 100;
  const circ = 2 * Math.PI * R;
  const pDash = (pPct / 100) * circ;
  const iDash = circ - pDash;

  return (
    <svg viewBox="0 0 200 200" className="emi-donut">
      {/* background ring */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f1f5f9" strokeWidth="28" />
      {/* interest arc */}
      <circle
        cx={cx} cy={cy} r={R} fill="none"
        stroke="#F4A261"
        strokeWidth="28"
        strokeDasharray={`${iDash} ${pDash}`}
        strokeDashoffset={0}
        strokeLinecap="butt"
        style={{ transform: "rotate(-90deg)", transformOrigin: "100px 100px" }}
      />
      {/* principal arc */}
      <circle
        cx={cx} cy={cy} r={R} fill="none"
        stroke="#8B4513"
        strokeWidth="28"
        strokeDasharray={`${pDash} ${iDash}`}
        strokeDashoffset={0}
        strokeLinecap="butt"
        style={{ transform: "rotate(-90deg)", transformOrigin: "100px 100px" }}
      />
      
      
    </svg>
  );
};
const EMICalculator = () => {
  const [searchParams] = useSearchParams();

  const defaultLoan = searchParams.get("amount")
    ? Math.round(parseFloat(searchParams.get("amount")) * 0.8)
    : 5000000;

  const [loanAmount, setLoanAmount]   = useState(defaultLoan);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure]           = useState(20);
  
  const result = useMemo(() => {
    const r = interestRate / 12 / 100;
    const n = tenure * 12;
    if (r === 0 || n === 0 || loanAmount === 0) return null;
    const emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - loanAmount;
    return {
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
      principalPct: Math.round((loanAmount / totalAmount) * 100),
      interestPct:  Math.round((totalInterest / totalAmount) * 100),
    };
  }, [loanAmount, interestRate, tenure]);


 
  const handleLoan = useCallback((v) => setLoanAmount(Number(v)), []);
  const handleRate = useCallback((v) => {
    const val = Math.min(20, Math.max(1, Number(v)));
    setInterestRate(val);
  }, []);
  const handleTenure = useCallback((v) => setTenure(Number(v)), []);

  return (
    <div className="emi-page">

      {/* ── HERO ── */}
      <section className="emi-hero">
        <div className="emi-hero-bg c1" />
        <div className="emi-hero-bg c2" />
        <div className="emi-hero-inner">
          <h1>Home Loan <span className="brand-gradient">EMI Calculator</span></h1>
          <p>Quickly estimate your monthly payments and total interest for any home loan scenario.</p>
        </div>
      </section>

      {/* ── MAIN CALCULATOR ── */}
      <section className="emi-main">
        <div className="emi-grid">

          {/* ── INPUTS ── */}
          <div className="emi-inputs-panel">
            {/* Loan Amount */}
            <div className="emi-field">
              <div className="emi-field-header">
                <label><FiDollarSign size={15} /> Loan Amount</label>
                <div className="emi-input-box">
                  <span>₹</span>
                  <input
                    type="number"
                    value={loanAmount}
                    min={100000}
                    max={100000000}
                    step={100000}
                    onChange={(e) => handleLoan(e.target.value)}
                  />
                </div>
              </div>
              <input
                type="range"
                className="emi-range primary"
                min={100000}
                max={100000000}
                step={100000}
                value={loanAmount}
                onChange={(e) => handleLoan(e.target.value)}
              />
              <div className="emi-range-labels">
                <span>₹1 Lakh</span>
                <span className="emi-badge">{fmtCr(loanAmount)}</span>
                <span>₹10 Cr</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="emi-field">
              <div className="emi-field-header">
                <label><FiPercent size={15} /> Annual Interest Rate</label>
                <div className="emi-input-box">
                  <input
                    type="number"
                    value={interestRate}
                    min={1}
                    max={20}
                    step={0.05}
                    onChange={(e) => handleRate(e.target.value)}
                  />
                  <span>%</span>
                </div>
              </div>
              <input
                type="range"
                className="emi-range accent"
                min={1}
                max={20}
                step={0.05}
                value={interestRate}
                onChange={(e) => handleRate(e.target.value)}
              />
              <div className="emi-range-labels">
                <span>1%</span>
                <span className="emi-badge accent">{interestRate}% p.a.</span>
                <span>20%</span>
              </div>
            </div>

            {/* Tenure */}
            <div className="emi-field">
              <div className="emi-field-header">
                <label><FiCalendar size={15} /> Loan Tenure</label>
                <div className="emi-input-box">
                  <input
                    type="number"
                    value={tenure}
                    min={1}
                    max={30}
                    step={1}
                    onChange={(e) => handleTenure(Math.min(30, Math.max(1, Number(e.target.value))))}
                  />
                  <span>yrs</span>
                </div>
              </div>
              <input
                type="range"
                className="emi-range highlight"
                min={1}
                max={30}
                step={1}
                value={tenure}
                onChange={(e) => handleTenure(e.target.value)}
              />
              <div className="emi-range-labels">
                <span>1 yr</span>
                <span className="emi-badge highlight">{tenure} years</span>
                <span>30 yrs</span>
              </div>
            </div>

            {/* Tip */}
            <div className="emi-tip">
              <FiInfo size={14} />
              <span>
                These calculations are indicative. Final loan terms depend on your credit profile and lender policies.
              </span>
            </div>
          </div>

          {/* ── RESULT ── */}
          <div className="emi-result-panel">
            {result ? (
              <>
                {/* Donut + EMI */}
                <div className="emi-donut-wrap">
                  <Donut principal={loanAmount} interest={result.totalInterest} />
                  <div className="emi-donut-center">
                    <span className="emi-donut-label">Monthly EMI</span>
                    <span className="emi-donut-value">₹{fmt(result.emi)}</span>
                  </div>
                </div>

                {/* Summary cards */}
                <div className="emi-summary-grid">
                  <div className="emi-summary-card principal">
                    <span className="emi-summary-dot" />
                    <div>
                      <p className="emi-summary-label">Principal Amount</p>
                      <p className="emi-summary-value">{fmtCr(loanAmount)}</p>
                    </div>
                    <span className="emi-summary-pct">{result.principalPct}%</span>
                  </div>
                  <div className="emi-summary-card interest">
                    <span className="emi-summary-dot interest-dot" />
                    <div>
                      <p className="emi-summary-label">Total Interest</p>
                      <p className="emi-summary-value">{fmtCr(result.totalInterest)}</p>
                    </div>
                    <span className="emi-summary-pct interest-pct">{result.interestPct}%</span>
                  </div>
                  <div className="emi-summary-card total">
                    <FiTrendingDown size={18} style={{ color: "#1976D2" }} />
                    <div>
                      <p className="emi-summary-label">Total Payable</p>
                      <p className="emi-summary-value total-value">{fmtCr(result.totalAmount)}</p>
                    </div>
                  </div>
                </div>

                {/* Visual bar */}
                <div className="emi-bar-wrap">
                  <div className="emi-bar">
                    <div className="emi-bar-fill principal-fill" style={{ width: `${result.principalPct}%` }} />
                    <div className="emi-bar-fill interest-fill" style={{ width: `${result.interestPct}%` }} />
                  </div>
                  <div className="emi-bar-legend">
                    <span><em className="dot-p" />Principal</span>
                    <span><em className="dot-i" />Interest</span>
                  </div>
                </div>

                {/* CTA */}
                <Link to="/properties?listingType=buy" className="emi-cta-btn">
                  Find Properties Within Budget <FiExternalLink size={14} />
                </Link>
              </>
            ) : (
              <div className="emi-empty">
                <FiDollarSign size={40} />
                <p>Adjust the sliders to calculate your EMI</p>
              </div>
            )}
          </div>
        </div>
      </section>  
      {/* ── HOW IT WORKS ── */}
      <section className="emi-how-section">
        <div className="emi-section-header">
          <h2>How Is EMI Calculated?</h2>
          <p>The standard formula used by all banks in India</p>
        </div>
        <div className="emi-formula-card">
          <div className="emi-formula">
            <span className="emi-formula-text">
              EMI = [P × R × (1+R)<sup>N</sup>] ÷ [(1+R)<sup>N</sup> − 1]
            </span>
          </div>
          <div className="emi-formula-legend">
            <div><strong>P</strong> = Principal loan amount</div>
            <div><strong>R</strong> = Monthly interest rate (Annual rate ÷ 12 ÷ 100)</div>
            <div><strong>N</strong> = Total number of monthly instalments (Years × 12)</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EMICalculator;
