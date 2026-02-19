import { Link } from "react-router-dom";
import { FiLock, FiAlertCircle, FiCheckCircle, FiShield, FiEye } from "react-icons/fi";
import "./LegalPages.css";

const PrivacyPolicy = () => {
    return (
        <div className="legal-page">
            <div className="legal-hero">
                
            </div>

            <div className="legal-container">
                <div className="legal-content">
                    <section className="legal-section">
                        <h2><FiShield /> Your Privacy Matters</h2>
                        <p>
                            At Logic Wave Property, we are committed to protecting your privacy and personal information. 
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                            when you use our platform and services.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>1. Information We Collect</h2>
                        
                        <h3>1.1 Information You Provide</h3>
                        <ul>
                            <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
                            <li><strong>Profile Information:</strong> Profile picture, bio, preferences</li>
                            <li><strong>Property Listings:</strong> Property details, images, descriptions, location</li>
                            <li><strong>Communications:</strong> Messages, inquiries, reviews, and feedback</li>
                            <li><strong>Payment Information:</strong> Billing details for premium services (processed securely)</li>
                            <li><strong>Verification Documents:</strong> ID proofs, property documents (if you choose verification)</li>
                        </ul>

                        <h3>1.2 Automatically Collected Information</h3>
                        <ul>
                            <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
                            <li><strong>Usage Data:</strong> Pages viewed, time spent, click patterns, search queries</li>
                            <li><strong>Location Data:</strong> Approximate location based on IP address</li>
                            <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
                        </ul>

                        <h3>1.3 Information from Third Parties</h3>
                        <ul>
                            <li>Social media platforms (if you sign in via social login)</li>
                            <li>Payment processors and financial institutions</li>
                            <li>Analytics and advertising partners</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>2. How We Use Your Information</h2>
                        
                        <h3>2.1 Provide and Improve Services</h3>
                        <ul>
                            <li>Create and manage your account</li>
                            <li>Display your property listings to potential buyers/renters</li>
                            <li>Facilitate communication between buyers and sellers</li>
                            <li>Process payments and transactions</li>
                            <li>Provide customer support</li>
                            <li>Improve platform functionality and user experience</li>
                        </ul>

                        <h3>2.2 Personalization</h3>
                        <ul>
                            <li>Recommend properties based on your preferences</li>
                            <li>Customize search results and notifications</li>
                            <li>Show relevant advertisements</li>
                            <li>Send personalized emails and alerts</li>
                        </ul>

                        <h3>2.3 Communication</h3>
                        <ul>
                            <li>Send transactional emails (confirmations, updates)</li>
                            <li>Deliver marketing communications (with your consent)</li>
                            <li>Notify you about new features or changes</li>
                            <li>Respond to your inquiries and requests</li>
                        </ul>

                        <h3>2.4 Security and Fraud Prevention</h3>
                        <ul>
                            <li>Verify user identity and listings</li>
                            <li>Detect and prevent fraudulent activities</li>
                            <li>Monitor and analyze security threats</li>
                            <li>Enforce our Terms of Service</li>
                        </ul>

                        <h3>2.5 Legal Compliance</h3>
                        <ul>
                            <li>Comply with legal obligations and regulations</li>
                            <li>Respond to legal requests and court orders</li>
                            <li>Protect our rights and interests</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>3. How We Share Your Information</h2>
                        
                        <h3>3.1 Public Information</h3>
                        <p>The following information is visible to other users:</p>
                        <ul>
                            <li>Your name and profile picture (for sellers/agents)</li>
                            <li>Property listings you post</li>
                            <li>Reviews and ratings you provide</li>
                            <li>Contact information you choose to display</li>
                        </ul>

                        <h3>3.2 With Other Users</h3>
                        <p>
                            When you contact a seller or respond to an inquiry, we share necessary contact information 
                            to facilitate communication.
                        </p>

                        <h3>3.3 Service Providers</h3>
                        <p>We may share information with third-party service providers who help us:</p>
                        <ul>
                            <li>Host and maintain our platform</li>
                            <li>Process payments</li>
                            <li>Send emails and notifications</li>
                            <li>Provide customer support</li>
                            <li>Analyze usage and performance</li>
                            <li>Deliver advertisements</li>
                        </ul>

                        <h3>3.4 Business Transfers</h3>
                        <p>
                            In the event of a merger, acquisition, or sale of assets, your information may be 
                            transferred to the new owner.
                        </p>

                        <h3>3.5 Legal Requirements</h3>
                        <p>We may disclose information if required by law or in response to:</p>
                        <ul>
                            <li>Court orders or legal processes</li>
                            <li>Government or regulatory requests</li>
                            <li>Protection of our rights or safety</li>
                            <li>Investigation of fraud or illegal activities</li>
                        </ul>

                        <h3>3.6 With Your Consent</h3>
                        <p>We may share information for other purposes with your explicit consent.</p>
                    </section>

                    <section className="legal-section">
                        <h2>4. Cookies and Tracking Technologies</h2>
                        
                        <h3>4.1 Types of Cookies We Use</h3>
                        <ul>
                            <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
                            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
                            <li><strong>Advertising Cookies:</strong> Used to show relevant advertisements</li>
                        </ul>

                        <h3>4.2 Managing Cookies</h3>
                        <p>
                            You can control cookies through your browser settings. Note that disabling cookies may 
                            affect your ability to use certain features of our platform.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>5. Data Security</h2>
                        
                        <h3>5.1 Security Measures</h3>
                        <p>We implement industry-standard security measures including:</p>
                        <ul>
                            <li>SSL/TLS encryption for data transmission</li>
                            <li>Encrypted storage of sensitive information</li>
                            <li>Regular security audits and updates</li>
                            <li>Access controls and authentication</li>
                            <li>Employee training on data protection</li>
                        </ul>

                        <h3>5.2 Your Responsibility</h3>
                        <p>You are responsible for:</p>
                        <ul>
                            <li>Keeping your password secure</li>
                            <li>Not sharing your account credentials</li>
                            <li>Logging out of shared devices</li>
                            <li>Reporting suspicious activity</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>6. Your Rights and Choices</h2>
                        
                        <h3>6.1 Access and Update</h3>
                        <p>You have the right to:</p>
                        <ul>
                            <li>Access your personal information</li>
                            <li>Update or correct your data</li>
                            <li>Download your data</li>
                        </ul>

                        <h3>6.2 Delete Your Account</h3>
                        <p>
                            You can request account deletion at any time. We will delete your personal information, 
                            but may retain some data for legal or operational purposes.
                        </p>

                        <h3>6.3 Marketing Communications</h3>
                        <p>You can opt-out of marketing emails by:</p>
                        <ul>
                            <li>Clicking the unsubscribe link in emails</li>
                            <li>Updating your notification preferences</li>
                            <li>Contacting our support team</li>
                        </ul>

                        <h3>6.4 Data Portability</h3>
                        <p>You can request a copy of your data in a portable format.</p>

                        <h3>6.5 Object to Processing</h3>
                        <p>You can object to certain types of data processing, such as marketing or profiling.</p>
                    </section>

                    <section className="legal-section">
                        <h2>7. Data Retention</h2>
                        <p>We retain your information for as long as necessary to:</p>
                        <ul>
                            <li>Provide our services</li>
                            <li>Comply with legal obligations</li>
                            <li>Resolve disputes</li>
                            <li>Enforce our agreements</li>
                        </ul>
                        <p>
                            After account deletion, we may retain certain information for up to 90 days for backup 
                            purposes, and some data may be retained longer as required by law.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>8. Children's Privacy</h2>
                        <p>
                            Our Service is not intended for users under 18 years of age. We do not knowingly collect 
                            personal information from children. If you believe we have collected information from a 
                            child, please contact us immediately.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>9. International Data Transfers</h2>
                        <p>
                            Your information may be transferred to and processed in countries other than your own. 
                            We ensure appropriate safeguards are in place to protect your data in accordance with 
                            this Privacy Policy.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>10. Third-Party Links</h2>
                        <p>
                            Our platform may contain links to third-party websites. We are not responsible for the 
                            privacy practices of these sites. We encourage you to review their privacy policies.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>11. Changes to This Privacy Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of material changes 
                            via email or through our platform. The "Last Updated" date at the top indicates when the 
                            policy was last revised.
                        </p>
                        
                        <h3>11.1 Version History</h3>
                        <div className="version-history">
                            <div className="version-item">
                                <span className="version-badge current">Current</span>
                                <div className="version-details">
                                    <strong>Version 2.0 - February 4, 2026</strong>
                                    <ul>
                                        <li>Enhanced cookie consent management</li>
                                        <li>Updated data retention policies</li>
                                        <li>Added user rights section for GDPR compliance</li>
                                        <li>Clarified third-party data sharing practices</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="version-item">
                                <span className="version-badge">Previous</span>
                                <div className="version-details">
                                    <strong>Version 1.5 - December 1, 2025</strong>
                                    <ul>
                                        <li>Added payment processing information</li>
                                        <li>Updated security measures details</li>
                                        <li>Clarified location data usage</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="version-item">
                                <span className="version-badge">Previous</span>
                                <div className="version-details">
                                    <strong>Version 1.0 - September 15, 2025</strong>
                                    <ul>
                                        <li>Initial privacy policy release</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="legal-section">
                        <h2>12. Contact Us</h2>
                        <p>If you have questions about this Privacy Policy or our data practices, contact us:</p>
                        <div className="contact-info">
                            <p><strong>Email:</strong> privacy@logicwaveproperty.com</p>
                            <p><strong>Phone:</strong> +91 1800-XXX-XXXX</p>
                            <p><strong>Address:</strong> Data Protection Officer, Logic Wave Property, Mumbai, India</p>
                        </div>
                    </section>

                    <div className="legal-footer">
                        <FiCheckCircle className="check-icon" />
                        <p>We are committed to protecting your privacy and handling your data responsibly.</p>
                        <Link to="/" className="btn-primary">Back to Home</Link>
                    </div>
                </div>

                <aside className="legal-sidebar">
                   
                </aside>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
