import { useEffect } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import './PaymentToast.css';

/**
 * PaymentToast - Minimal success/error toast for payments
 * @param {boolean} show - Show/hide the toast
 * @param {string} type - "success" | "error"
 * @param {string} message - Message to display
 * @param {string} txnId - Optional transaction ID
 * @param {function} onClose - Called when toast closes
 * @param {number} duration - Auto-close duration in ms (default: 4000, 0 = no auto-close)
 */
const PaymentToast = ({
  show,
  type = 'success',
  message,
  txnId,
  onClose,
  duration = 10000,
}) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className={`pt-toast pt-${type}`}>
      <div className="pt-icon">
        {type === 'success' ? <FiCheck /> : <FiX />}
      </div>
      <div className="pt-content">
        <p className="pt-message">{message}</p>
        {txnId && <p className="pt-txn">Ref: {txnId}</p>}
      </div>
      <button className="pt-close" onClick={onClose} aria-label="Close">
        <FiX />
      </button>
    </div>
  );
};

export default PaymentToast;
