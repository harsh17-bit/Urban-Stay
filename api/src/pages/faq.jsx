import { useState } from "react";
import { FiChevronDown, FiHelpCircle, FiHome, FiShield, FiDollarSign, FiLock, FiBriefcase } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./FAQ.css";

const FAQ = () => {
    const [expandedCategory, setExpandedCategory] = useState(0);
    const [expandedFAQ, setExpandedFAQ] = useState(null);

    const faqCategories = [
        {
            title: "General Questions",
            icon: FiHelpCircle,
            faqs: [
                {
                    question: "What is Logic Wave Property?",
                    answer: "Logic Wave Property is an online platform that connects property buyers, sellers, and renters. We provide a seamless experience for buying, selling, and renting properties across India with advanced search tools and verification features."
                },
                {
                    question: "Is Logic Wave Property a registered real estate broker?",
                    answer: "No, Logic Wave Property is a technology platform, not a real estate broker. We facilitate connections between users but do not participate in transactions or manage funds. You are responsible for conducting your own due diligence."
                },
                {
                    question: "Is it free to use Logic Wave Property?",
                    answer: "Yes, creating an account and browsing properties is completely free. We offer optional premium services like featured listings and verified status for a fee."
                },
                {
                    question: "How do I contact support?",
                    answer: "You can contact our support team via email at support@logicwaveproperty.com or call +91 1800-XXX-XXXX. We typically respond within 24 hours."
                }
            ]
        },
        {
            title: "For Buyers & Renters",
            icon: FiHome,
            faqs: [
                {
                    question: "How do I search for properties?",
                    answer: "Use our search bar to find properties by location, price range, property type, and amenities. You can also apply multiple filters to narrow down your options."
                },
                {
                    question: "Can I save properties to my favorites?",
                    answer: "Yes! Click the heart icon on any property to save it. You can view all your saved properties in your dashboard."
                },
                {
                    question: "How do I contact a seller or landlord?",
                    answer: "Click on the property listing and use the 'Contact Seller' button to send an inquiry. The seller will respond directly to you with more information."
                },
                {
                    question: "Are the property listings verified?",
                    answer: "Some listings are verified by our team and will have a verification badge. However, we recommend conducting your own verification and property inspection before making a decision."
                }
            ]
        },
        {
            title: "For Sellers & Landlords",
            icon: FiBriefcase,
            faqs: [
                {
                    question: "How do I list a property?",
                    answer: "Log in to your account, click 'Post Property', and fill in the property details including location, specifications, price, and images. Your listing will be live within 24 hours of verification."
                },
                {
                    question: "What information should I include in my listing?",
                    answer: "Include accurate property details, clear photos, price, amenities, availability date, and contact information. Detailed listings receive more inquiries."
                },
                {
                    question: "How much does it cost to list a property?",
                    answer: "Basic listings are free. We offer premium features like featured placement (₹999-2999) for 30 days to get more visibility."
                },
                {
                    question: "Can I edit my listing after posting?",
                    answer: "Yes, you can edit your listing anytime from your dashboard. Changes will be reflected immediately on your property page."
                }
            ]
        },
        {
            title: "Security & Privacy",
            icon: FiShield,
            faqs: [
                {
                    question: "How is my personal data protected?",
                    answer: "We use industry-standard SSL encryption and secure servers to protect your data. Read our Privacy Policy for complete information about data handling."
                },
                {
                    question: "Who can see my contact information?",
                    answer: "Your contact information is only visible to users when you choose to share it through property inquiries or direct messages. You can control what information is public in your profile settings."
                },
                {
                    question: "Is my payment information secure?",
                    answer: "Yes, all payment processing is handled by secure, PCI-compliant payment gateways. We never store your full credit card information."
                },
                {
                    question: "What cookies does Logic Wave Property use?",
                    answer: "We use essential cookies (required for functionality), analytics cookies (to improve experience), and marketing cookies (for personalized ads). You can manage your cookie preferences anytime."
                }
            ]
        },
        {
            title: "Payments & Pricing",
            icon: FiDollarSign,
            faqs: [
                {
                    question: "What payment methods do you accept?",
                    answer: "We accept credit/debit cards, UPI, net banking, and digital wallets. All payments are processed securely through authorized payment gateways."
                },
                {
                    question: "Can I get a refund for premium services?",
                    answer: "Yes, refunds for premium services are provided within 7 days of purchase. Contact support@logicwaveproperty.com with your request."
                },
                {
                    question: "How does the EMI calculator work?",
                    answer: "The EMI calculator helps you estimate monthly loan payments. Enter the loan amount, interest rate (6-15%), and tenure (1-30 years). The calculator shows monthly EMI and total interest payable."
                },
                {
                    question: "Is the EMI calculator accurate?",
                    answer: "The calculator provides estimates based on standard EMI formulas. For exact EMI details, consult your bank or financial advisor."
                }
            ]
        }
    ];

    const toggleCategory = (index) => {
        setExpandedCategory(expandedCategory === index ? -1 : index);
        setExpandedFAQ(null);
    };

    const toggleFAQ = (index) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    return (
        <div className="faq-page">
            {/* Hero Section */}
            <div className="faq-hero">
                
            </div>

            {/* FAQ Content */}
            <div className="faq-container">
                <div className="faq-content">
                    <div className="faq-categories">
                        {faqCategories.map((category, categoryIndex) => {
                            const Icon = category.icon;
                            const isExpanded = expandedCategory === categoryIndex;

                            return (
                                <div key={categoryIndex} className="faq-category">
                                    <button
                                        className={`category-header ${isExpanded ? "expanded" : ""}`}
                                        onClick={() => toggleCategory(categoryIndex)}
                                    >
                                        <div className="category-title">
                                            <Icon className="category-icon" />
                                            <h2>{category.title}</h2>
                                        </div>
                                        <FiChevronDown className="chevron-icon" />
                                    </button>

                                    {isExpanded && (
                                        <div className="category-content">
                                            {category.faqs.map((faq, faqIndex) => (
                                                <div key={faqIndex} className="faq-item">
                                                    <button
                                                        className={`faq-question ${expandedFAQ === `${categoryIndex}-${faqIndex}` ? "expanded" : ""}`}
                                                        onClick={() => toggleFAQ(`${categoryIndex}-${faqIndex}`)}
                                                    >
                                                        <span>{faq.question}</span>
                                                        <FiChevronDown className="faq-chevron" />
                                                    </button>

                                                    {expandedFAQ === `${categoryIndex}-${faqIndex}` && (
                                                        <div className="faq-answer">
                                                            {faq.answer}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="faq-sidebar">
                </aside>
            </div>
        </div>
    );
};

export default FAQ;
