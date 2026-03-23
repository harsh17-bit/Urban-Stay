import { useMemo, useState } from 'react';
import './AreaConverter.css';

const AREA_TO_SQM = {
  sqm: 1,
  sqft: 0.092903,
  sqyd: 0.836127,
  acre: 4046.8564224,
  hectare: 10000,
};

const UNIT_OPTIONS = [
  { value: 'sqm', label: 'Square Meter (sq.m)' },
  { value: 'sqft', label: 'Square Feet (sq.ft)' },
  { value: 'sqyd', label: 'Square Yard (sq.yd)' },
  { value: 'acre', label: 'Acre' },
  { value: 'hectare', label: 'Hectare' },
];

const formatArea = (num) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 4,
  }).format(num);

const AreaDonutChart = ({ inputArea, convertedArea }) => {
  const safeInput = Number.isFinite(inputArea) ? Math.max(inputArea, 0) : 0;
  const safeConverted = Number.isFinite(convertedArea)
    ? Math.max(convertedArea, 0)
    : 0;

  const total = safeInput + safeConverted;
  if (total <= 0) return null;

  const inputPct = (safeInput / total) * 100;
  const convertedPct = (safeConverted / total) * 100;

  const radius = 62;
  const cx = 85;
  const cy = 85;
  const circumference = 2 * Math.PI * radius;
  const inputDash = (inputPct / 100) * circumference;
  const convertedDash = (convertedPct / 100) * circumference;

  return (
    <svg viewBox="0 0 170 170" className="area-donut-chart">
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#d7ebf1"
        strokeWidth="22"
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#00a88e"
        strokeWidth="22"
        strokeDasharray={`${inputDash} ${circumference}`}
        strokeDashoffset={0}
        strokeLinecap="butt"
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: `${cx}px ${cy}px`,
        }}
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#ffc107"
        strokeWidth="22"
        strokeDasharray={`${convertedDash} ${circumference}`}
        strokeDashoffset={-inputDash}
        strokeLinecap="butt"
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: `${cx}px ${cy}px`,
        }}
      />
    </svg>
  );
};

export default function AreaConverter() {
  const [value, setValue] = useState('1200');
  const [from, setFrom] = useState('sqm');
  const [to, setTo] = useState('sqft');
  const [, setRecalculationTick] = useState(0);

  const num = Number.parseFloat(value) || 0;

  const conversion = useMemo(() => {
    const inSqm = num * AREA_TO_SQM[from];
    const converted = inSqm / AREA_TO_SQM[to];
    return {
      converted,
      inSqm,
      fromValueLabel: UNIT_OPTIONS.find((u) => u.value === from)?.label || from,
      toValueLabel: UNIT_OPTIONS.find((u) => u.value === to)?.label || to,
    };
  }, [num, from, to]);

  const handleRecalculate = () => {
    setRecalculationTick((prev) => prev + 1);
  };

  return (
    <div className="area-converter-page">
      <section className="area-calc-section">
        <div className="area-calc-container">
          <div className="area-input-panel">
            <div className="area-input-group">
              <label className="area-label">Area Value</label>
              <div className="area-input-field">
                <input
                  type="number"
                  value={value}
                  min="0"
                  onChange={(e) => setValue(e.target.value)}
                  className="area-text-input"
                  placeholder="Enter area"
                />
              </div>
            </div>

            <div className="area-input-row">
              <div className="area-input-group">
                <label className="area-label">From Unit</label>
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="area-select"
                >
                  {UNIT_OPTIONS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="area-input-group">
                <label className="area-label">To Unit</label>
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="area-select"
                >
                  {UNIT_OPTIONS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button className="area-calculate-btn" onClick={handleRecalculate}>
              Recalculate Conversion
            </button>
          </div>

          <div className="area-result-panel">
            <div className="area-result-header">
              <span className="area-result-text">Converted Area</span>
              <span className="area-result-value">
                {formatArea(conversion.converted)}
              </span>
            </div>

            <div className="area-chart-section">
              <div className="area-donut-wrapper">
                <AreaDonutChart
                  inputArea={num}
                  convertedArea={conversion.converted}
                />
              </div>
              <div className="area-chart-legend">
                <div className="area-legend-item">
                  <span className="area-legend-dot input"></span>
                  <div className="area-legend-info">
                    <span className="area-legend-label">Input Area</span>
                    <span className="area-legend-value">{formatArea(num)}</span>
                  </div>
                </div>

                <div className="area-legend-item">
                  <span className="area-legend-dot output"></span>
                  <div className="area-legend-info">
                    <span className="area-legend-label">Converted Area</span>
                    <span className="area-legend-value">
                      {formatArea(conversion.converted)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="area-result-grid">
              <div className="area-result-item">
                <span className="area-result-label">Input</span>
                <span className="area-result-number">
                  {formatArea(num)} {conversion.fromValueLabel}
                </span>
              </div>

              <div className="area-result-item">
                <span className="area-result-label">In Square Meter</span>
                <span className="area-result-number">
                  {formatArea(conversion.inSqm)} sq.m
                </span>
              </div>

              <div className="area-result-item">
                <span className="area-result-label">Final Conversion</span>
                <span className="area-result-number highlight">
                  {formatArea(conversion.converted)} {conversion.toValueLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="area-info-section">
        <div className="area-info-container">
          <h2>How Is Area Converted?</h2>
          <p className="area-info-subtitle">
            Standard formula used for accurate unit conversion
          </p>

          <div className="area-formula-box">
            <div className="formula-text">
              Converted Value = Input Value x (From Unit in sq.m / To Unit in
              sq.m)
            </div>
            <div className="formula-legend">
              <div>
                <strong>Input Value</strong> = Area entered by user
              </div>
              <div>
                <strong>From Unit in sq.m</strong> = Square meter factor of
                selected source unit
              </div>
              <div>
                <strong>To Unit in sq.m</strong> = Square meter factor of target
                unit
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
