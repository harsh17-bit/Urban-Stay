import { useState } from 'react';
import { FiX, FiStar, FiCheck, FiCreditCard, FiShield } from 'react-icons/fi';
import api from '../services/api';
import './FeaturedUpgradeModal.css';

const FEATURE_PRICE = 499;

/**
 * FeaturedUpgradeModal
 * Props:
 *   property  — the property object to feature
 *   onClose   — called when the user closes/cancels
 *   onSuccess — called with the updated property when payment succeeds
 */
const FeaturedUpgradeModal = ({ property, onClose, onSuccess }) => {
  const [step, setStep] = useState('idle'); // "idle" | "processing" | "success"
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState('');

  // Fake card form state (display-only)
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handlePay = async () => {
    if (!cardNumber || !cardName || !expiry || !cvv) {
      setError('Please fill in all card details.');
      return;
    }
    setError('');
    setStep('processing');

    // Simulate network / processing delay
    await new Promise((resolve) => setTimeout(resolve, 2200));

    try {
      const response = await api.post(`/payments/feature/${property._id}`);
      const data = response.data;
      setTransaction(data.transaction);
      setStep('success');
      onSuccess(data.property, data.transaction?.id);
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Payment failed. Please try again.';
      setError(msg);
      setStep('idle');
    }
  };

  return (
    <div
      className="fum-overlay"
      onClick={(e) =>
        e.target === e.currentTarget && step !== 'processing' && onClose()
      }
    >
      <div className="fum-modal">
        {/* Header */}
        <div className="fum-header">
          <div className="fum-header-title">
            <FiStar className="fum-star-icon" />
            <span>Feature Your Listing</span>
          </div>
          {step !== 'processing' && (
            <button className="fum-close" onClick={onClose} aria-label="Close">
              <FiX />
            </button>
          )}
        </div>

        {/* ── IDLE STEP ── */}
        {step === 'idle' && (
          <>
            <div className="fum-property-preview">
              <p className="fum-label">Featuring</p>
              <p className="fum-property-name">{property.title}</p>
            </div>
            <div className="fum-price-row">
              <span className="fum-price">₹{FEATURE_PRICE}</span>
              <span className="fum-price-label">one-time · 30 days</span>
            </div>

            <p className="fum-card-heading">
              <FiCreditCard /> Card Details
            </p>

            <div className="fum-form">
              <div className="fum-field full">
                <label>Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  maxLength={19}
                  onChange={(e) =>
                    setCardNumber(formatCardNumber(e.target.value))
                  }
                />
              </div>
              <div className="fum-field full">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  placeholder="Name on card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              <div className="fum-field half">
                <label>Expiry</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  maxLength={5}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                />
              </div>
              <div className="fum-field half">
                <label>CVV</label>
                <input
                  type="password"
                  placeholder="•••"
                  value={cvv}
                  maxLength={4}
                  onChange={(e) =>
                    setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                  }
                />
              </div>
            </div>

            {error && <p className="fum-error">{error}</p>}

            <div className="fum-secure-note">
              <FiShield /> Demo mode — no real charge is made
            </div>

            <div className="fum-actions">
              <button className="fum-btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button className="fum-btn-pay" onClick={handlePay}>
                Pay ₹{FEATURE_PRICE}
              </button>
            </div>
          </>
        )}

        {/* ── PROCESSING STEP ── */}
        {step === 'processing' && (
          <div className="fum-processing">
            <div className="fum-spinner" />
            <p className="fum-processing-title">Processing Payment…</p>
            <p className="fum-processing-sub">
              Please do not close this window.
            </p>
          </div>
        )}

        {/* ── SUCCESS STEP ── */}
        {step === 'success' && (
          <div className="fum-success">
            <div className="fum-success-icon">
              <FiCheck />
            </div>
            <h3>Payment Successful!</h3>
            <p>
              <strong>{property.title}</strong> is now featured for{' '}
              <strong>30 days</strong>.
            </p>
            {transaction && <p className="fum-txn-id">Ref: {transaction.id}</p>}
            <button className="fum-btn-pay" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedUpgradeModal;
