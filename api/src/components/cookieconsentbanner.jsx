import { useState, useEffect } from "react";
import { FiX, FiInfo } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./CookieConsentBanner.css";

const CookieConsentBanner = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [preferences, setPreferences] = useState({
        essential: true,
        analytics: false,
        marketing: false,
    });

    useEffect(() => {
        // Check if user has already consented
        const cookieConsent = localStorage.getItem("cookieConsent");
        if (!cookieConsent) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowBanner(true);
        } else {
            const stored = JSON.parse(cookieConsent);
            setPreferences(stored);
        }
    }, []);

    const handleAcceptAll = () => {
        const allAccepted = {
            essential: true,
            analytics: true,
            marketing: true,
        };
        localStorage.setItem("cookieConsent", JSON.stringify(allAccepted));
        setPreferences(allAccepted);
        setShowBanner(false);
    };

    const handleAcceptSelected = () => {
        localStorage.setItem("cookieConsent", JSON.stringify(preferences));
        setShowBanner(false);
    };

    const handleRejectAll = () => {
        const rejected = {
            essential: true,
            analytics: false,
            marketing: false,
        };
        localStorage.setItem("cookieConsent", JSON.stringify(rejected));
        setPreferences(rejected);
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="cookie-consent-banner">
            <div className="cookie-banner-content">
                <div className="cookie-banner-header">
                    <div className="cookie-banner-title">
                        <FiInfo className="cookie-icon" />
                        <h3>Cookie Preferences</h3>
                    </div>
                    <button 
                        className="cookie-close-btn" 
                        onClick={() => setShowBanner(false)}
                        aria-label="Close cookie banner"
                    >
                        <FiX />
                    </button>
                </div>

                <p className="cookie-banner-description">
                    We use cookies to enhance your experience on Logic Wave Property. Some cookies are essential 
                    for the site to function, while others help us improve your experience and deliver personalized content.
                </p>

                <div className="cookie-preferences">
                    <div className="cookie-preference-item">
                        <div className="preference-header">
                            <label htmlFor="essential-cookies">
                                <input
                                    type="checkbox"
                                    id="essential-cookies"
                                    checked={preferences.essential}
                                    disabled
                                    onChange={(e) => setPreferences({ ...preferences, essential: e.target.checked })}
                                />
                                <span className="checkbox-label">Essential Cookies</span>
                            </label>
                            <span className="badge required">Required</span>
                        </div>
                        <p className="preference-description">
                            Essential for basic site functionality. These cookies cannot be disabled.
                        </p>
                    </div>

                    <div className="cookie-preference-item">
                        <label htmlFor="analytics-cookies" className="preference-header">
                            <input
                                type="checkbox"
                                id="analytics-cookies"
                                checked={preferences.analytics}
                                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                            />
                            <span className="checkbox-label">Analytics Cookies</span>
                        </label>
                        <p className="preference-description">
                            Help us understand how you use the site to improve your experience.
                        </p>
                    </div>

                    <div className="cookie-preference-item">
                        <label htmlFor="marketing-cookies" className="preference-header">
                            <input
                                type="checkbox"
                                id="marketing-cookies"
                                checked={preferences.marketing}
                                onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                            />
                            <span className="checkbox-label">Marketing Cookies</span>
                        </label>
                        <p className="preference-description">
                            Used to deliver personalized advertisements and track marketing effectiveness.
                        </p>
                    </div>
                </div>

                <p className="cookie-banner-learn-more">
                    Learn more in our <Link to="/privacy-policy">Privacy Policy</Link> and 
                    <Link to="/terms-of-service"> Terms of Service</Link>.
                </p>

                <div className="cookie-banner-buttons">
                    <button 
                        className="cookie-btn reject" 
                        onClick={handleRejectAll}
                    >
                        Reject All
                    </button>
                    <button 
                        className="cookie-btn customize" 
                        onClick={handleAcceptSelected}
                    >
                        Save Preferences
                    </button>
                    <button 
                        className="cookie-btn accept" 
                        onClick={handleAcceptAll}
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsentBanner;
