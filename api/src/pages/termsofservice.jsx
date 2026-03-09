import { Link } from "react-router-dom";
import { FiHome, FiAlertCircle, FiCheckCircle, FiShield } from "react-icons/fi";
import "./LegalPages.css";

const TermsOfService = () => {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <div className="legal-hero-content">
          <FiShield className="legal-icon" />
          <h1>Terms of Service</h1>
          <p className="legal-subtitle">Last Updated: Jan 19, 2026</p>
        </div>
      </div>

      <div className="legal-container">
        <div className="legal-content">
          <section className="legal-section">
            <h2>
              <FiHome /> Welcome to Logic Wave Property
            </h2>
            <p>
              These Terms of Service ("Terms") govern your access to and use of
              Logic Wave Property's website, services, and applications
              (collectively, the "Service"). By accessing or using our Service,
              you agree to be bound by these Terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By creating an account, listing properties, or using any part of
              our Service, you acknowledge that you have read, understood, and
              agree to be bound by these Terms and our Privacy Policy. If you do
              not agree to these Terms, please do not use our Service.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. User Accounts</h2>
            <h3>2.1 Account Creation</h3>
            <ul>
              <li>You must be at least 18 years old to create an account</li>
              <li>
                You must provide accurate, current, and complete information
              </li>
              <li>
                You are responsible for maintaining the security of your account
              </li>
              <li>You are responsible for all activities under your account</li>
            </ul>

            <h3>2.2 Account Types</h3>
            <ul>
              <li>
                <strong>Buyers/Renters:</strong> Browse and search for
                properties, save favorites, contact sellers
              </li>
              <li>
                <strong>Sellers/Landlords:</strong> List properties, manage
                listings, receive inquiries
              </li>
              <li>
                <strong>Agents:</strong> Represent clients, manage multiple
                listings, access advanced tools
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Property Listings</h2>
            <h3>3.1 Seller Responsibilities</h3>
            <ul>
              <li>
                Provide accurate and truthful information about properties
              </li>
              <li>Upload genuine photographs of the property</li>
              <li>Ensure you have the legal right to list the property</li>
              <li>
                Update or remove listings when properties are no longer
                available
              </li>
              <li>Respond to inquiries in a timely and professional manner</li>
            </ul>

            <h3>3.2 Prohibited Listings</h3>
            <p>You may not list properties that:</p>
            <ul>
              <li>You do not own or have authorization to list</li>
              <li>Contain false, misleading, or deceptive information</li>
              <li>Violate any local, state, or federal laws</li>
              <li>
                Discriminate based on race, religion, gender, or other protected
                classes
              </li>
              <li>Are part of fraudulent schemes or scams</li>
            </ul>

            <h3>3.3 Verification</h3>
            <p>
              Logic Wave Property may verify property listings and seller
              information. Verified properties receive a verification badge, but
              this does not constitute a guarantee or endorsement by Logic Wave
              Property.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Fees and Payments</h2>
            <h3>4.1 Basic Services</h3>
            <p>
              Creating an account and browsing properties is free for all users.
            </p>

            <h3>4.2 Premium Services</h3>
            <ul>
              <li>
                <strong>Featured Listings:</strong> Fees apply for premium
                placement
              </li>
              <li>
                <strong>Verification Services:</strong> Optional paid
                verification available
              </li>
              <li>
                <strong>Professional Tools:</strong> Advanced analytics and
                tools for agents
              </li>
            </ul>

            <h3>4.3 Refund Policy</h3>
            <p>
              Refunds for premium services are provided on a case-by-case basis.
              Please contact our support team within 7 days of purchase for
              refund requests.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. User Conduct</h2>
            <h3>You agree NOT to:</h3>
            <ul>
              <li>
                Use the Service for any illegal purpose or in violation of any
                laws
              </li>
              <li>Post false, inaccurate, misleading, or fraudulent content</li>
              <li>Impersonate any person or entity</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Scrape, copy, or download data without authorization</li>
              <li>Upload viruses or malicious code</li>
              <li>Interfere with the proper functioning of the Service</li>
              <li>Create multiple accounts to manipulate reviews or ratings</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Intellectual Property</h2>
            <h3>6.1 Our Content</h3>
            <p>
              All content on the Service, including text, graphics, logos,
              icons, images, and software, is the property of Logic Wave
              Property and is protected by copyright, trademark, and other
              intellectual property laws.
            </p>

            <h3>6.2 User Content</h3>
            <p>
              By uploading content (property listings, photos, descriptions),
              you grant Logic Wave Property a worldwide, non-exclusive,
              royalty-free license to use, display, reproduce, and distribute
              your content on our platform.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Privacy and Data Protection</h2>
            <p>
              Your privacy is important to us. Please review our{" "}
              <Link to="/privacy-policy">Privacy Policy</Link> to understand how
              we collect, use, and protect your personal information.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Third-Party Services</h2>
            <p>
              Our Service may contain links to third-party websites or services.
              We are not responsible for the content, privacy policies, or
              practices of third-party sites. You access them at your own risk.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Disclaimers and Limitations</h2>
            <h3>9.1 No Warranty</h3>
            <p>
              The Service is provided "AS IS" and "AS AVAILABLE" without
              warranties of any kind. We do not guarantee the accuracy,
              completeness, or reliability of property listings or user content.
            </p>

            <h3>9.2 Not a Real Estate Broker</h3>
            <p>
              Logic Wave Property is a technology platform connecting buyers and
              sellers. We are not a real estate broker, agent, or dealer. We do
              not participate in transactions or take custody of funds.
            </p>

            <h3>9.3 User Responsibility</h3>
            <p>
              Users are responsible for conducting their own due diligence,
              property inspections, legal reviews, and financial assessments
              before entering into any real estate transaction.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Logic Wave Property shall
              not be liable for any indirect, incidental, special,
              consequential, or punitive damages, including loss of profits,
              data, or goodwill, arising from your use of the Service.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Logic Wave Property and
              its officers, directors, employees, and agents from any claims,
              damages, losses, liabilities, and expenses arising from your use
              of the Service or violation of these Terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Termination</h2>
            <h3>12.1 By You</h3>
            <p>
              You may terminate your account at any time by contacting our
              support team.
            </p>

            <h3>12.2 By Us</h3>
            <p>
              We reserve the right to suspend or terminate your account if you
              violate these Terms, engage in fraudulent activity, or for any
              other reason at our sole discretion.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Dispute Resolution</h2>
            <h3>13.1 Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of India, without regard to its conflict of law
              provisions.
            </p>

            <h3>13.2 Arbitration</h3>
            <p>
              Any disputes arising from these Terms or your use of the Service
              shall be resolved through binding arbitration in accordance with
              Indian arbitration laws.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will
              notify users of material changes via email or through the Service.
              Continued use of the Service after changes constitutes acceptance
              of the modified Terms.
            </p>

            <h3>14.1 Version History</h3>
            <div className="version-history">
              <div className="version-item">
                <span className="version-badge current">Current</span>
                <div className="version-details">
                  <strong>Version 2.0 - February 4, 2026</strong>
                  <ul>
                    <li>Updated fee structure for premium services</li>
                    <li>Enhanced seller verification requirements</li>
                    <li>Added dispute resolution procedures</li>
                    <li>Clarified intellectual property rights</li>
                  </ul>
                </div>
              </div>
              <div className="version-item">
                <span className="version-badge">Previous</span>
                <div className="version-details">
                  <strong>Version 1.5 - December 1, 2025</strong>
                  <ul>
                    <li>Added prohibited listing guidelines</li>
                    <li>Updated refund policy details</li>
                    <li>Enhanced user conduct rules</li>
                  </ul>
                </div>
              </div>
              <div className="version-item">
                <span className="version-badge">Previous</span>
                <div className="version-details">
                  <strong>Version 1.0 - September 15, 2025</strong>
                  <ul>
                    <li>Initial terms of service release</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>15. Contact Information</h2>
            <p>If you have questions about these Terms, please contact us:</p>
            <div className="contact-info">
              <p>
                <strong>Email:</strong> legal@logicwaveproperty.com
              </p>
              <p>
                <strong>Phone:</strong> +91 1800-XXX-XXXX
              </p>
              <p>
                <strong>Address:</strong> Logic Wave Property, Mumbai, India
              </p>
            </div>
          </section>

          <div className="legal-footer">
            <FiCheckCircle className="check-icon" />
            <p>
              By using Logic Wave Property, you acknowledge that you have read
              and understood these Terms of Service.
            </p>
            <Link to="/" className="btn-primary">
              Back to Home
            </Link>
          </div>
        </div>

        <aside className="legal-sidebar">
          <div className="sidebar-card">
            <h3>
              <FiAlertCircle /> Quick Links
            </h3>
            <ul className="sidebar-links">
              <li>
                <a href="#acceptance">Acceptance of Terms</a>
              </li>
              <li>
                <a href="#accounts">User Accounts</a>
              </li>
              <li>
                <a href="#listings">Property Listings</a>
              </li>
              <li>
                <a href="#fees">Fees and Payments</a>
              </li>
              <li>
                <a href="#conduct">User Conduct</a>
              </li>
              <li>
                <a href="#privacy">Privacy</a>
              </li>
              <li>
                <a href="#disclaimers">Disclaimers</a>
              </li>
              <li>
                <a href="#contact">Contact Us</a>
              </li>
            </ul>
          </div>

          <div className="sidebar-card">
            <h3>Need Help?</h3>
            <p>Have questions about our terms?</p>
            <Link to="/contact" className="btn-outline">
              Contact Support
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TermsOfService;
