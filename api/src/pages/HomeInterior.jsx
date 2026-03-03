import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  FaCouch,
  FaBed,
  FaUtensils,
  FaBath,
  FaDoorOpen,
  FaChild,
  FaCheckCircle,
  FaStar,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaHome,
  FaRuler,
  FaPaintRoller,
  FaTools,
  FaClock,
  FaShieldAlt,
  FaAward,
} from 'react-icons/fa';
import { MdDesignServices, MdStyle } from 'react-icons/md';
import './HomeInterior.css';

// Room Categories
const ROOM_CATEGORIES = [
  {
    id: 'living',
    name: 'Living Room',
    icon: FaCouch,
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400',
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    icon: FaBed,
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400',
  },
  {
    id: 'kitchen',
    name: 'Modular Kitchen',
    icon: FaUtensils,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    icon: FaBath,
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400',
  },
  {
    id: 'wardrobe',
    name: 'Wardrobe',
    icon: FaDoorOpen,
    image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400',
  },
  {
    id: 'kids',
    name: 'Kids Room',
    icon: FaChild,
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400',
  },
];

// Design Styles
const DESIGN_STYLES = [
  { id: 'modern', name: 'Modern', desc: 'Clean lines, minimalist approach' },
  {
    id: 'contemporary',
    name: 'Contemporary',
    desc: 'Current trends, flexible design',
  },
  {
    id: 'traditional',
    name: 'Traditional',
    desc: 'Classic elegance, timeless appeal',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    desc: 'Less is more, functional beauty',
  },
  {
    id: 'industrial',
    name: 'Industrial',
    desc: 'Raw materials, urban aesthetic',
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    desc: 'Light, airy, natural elements',
  },
];

// Design Packages
const DESIGN_PACKAGES = [
  {
    id: 'essential',
    name: 'Essential',
    price: '₹5.5 Lakh',
    priceNote: 'Starting price for 2BHK',
    features: [
      'Basic modular kitchen',
      '2 wardrobes',
      'Living room setup',
      'Basic lighting',
      '5-year warranty',
      '45-day delivery',
    ],
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹8.5 Lakh',
    priceNote: 'Starting price for 2BHK',
    features: [
      'Premium modular kitchen',
      '3 wardrobes with loft',
      'Complete living room',
      'Designer lighting',
      'False ceiling',
      '8-year warranty',
      '60-day delivery',
    ],
    popular: true,
  },
  {
    id: 'luxe',
    name: 'Luxe',
    price: '₹12 Lakh',
    priceNote: 'Starting price for 2BHK',
    features: [
      'Luxury modular kitchen',
      'Walk-in wardrobes',
      'Complete home interiors',
      'Premium lighting & fixtures',
      'Designer false ceiling',
      'Smart home integration',
      '10-year warranty',
      'Priority delivery',
    ],
    popular: false,
  },
];

// Why Choose Us
const WHY_CHOOSE_US = [
  {
    icon: FaPaintRoller,
    title: 'Expert Designers',
    desc: '150+ experienced interior designers',
  },
  {
    icon: FaTools,
    title: 'Quality Materials',
    desc: 'Premium materials with warranty',
  },
  {
    icon: FaClock,
    title: 'On-time Delivery',
    desc: 'Guaranteed timely completion',
  },
  {
    icon: FaShieldAlt,
    title: 'Price Assurance',
    desc: 'No hidden costs, transparent pricing',
  },
  {
    icon: FaAward,
    title: '10 Year Warranty',
    desc: 'Industry-leading warranty coverage',
  },
  {
    icon: MdDesignServices,
    title: 'Free Consultation',
    desc: 'Complimentary design consultation',
  },
];

// Testimonials
const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    comment:
      'Amazing transformation of my 3BHK! The team was professional and delivered on time.',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    name: 'Rahul Verma',
    location: 'Delhi',
    rating: 5,
    comment:
      'Excellent service and quality. My modular kitchen looks stunning!',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Anita Desai',
    location: 'Bangalore',
    rating: 5,
    comment:
      'Professional team, great designs, and value for money. Highly recommend!',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
];

const HomeInterior = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyType: '2bhk',
    city: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simulate form submission
    setFormStatus({ submitted: true, error: null });
    // In production, you would send this to your backend
    console.log('Interior consultation request:', formData);
  };

  return (
    <div className="home-interior">
      {/* Hero Section */}
      <section className="interior-hero">
        <div className="interior-hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Transform Your Home with <span>Expert Interior Design</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            End-to-end home interior solutions with modular designs, premium
            materials, and 10-year warranty
          </motion.p>
          <motion.div
            className="interior-hero-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="stat-item">
              <span className="stat-number">5000+</span>
              <span className="stat-label">Happy Homes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">150+</span>
              <span className="stat-label">Expert Designers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">45</span>
              <span className="stat-label">Days Delivery</span>
            </div>
          </motion.div>
          <motion.a
            href="#consultation-form"
            className="interior-hero-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Get Free Consultation
          </motion.a>
        </div>
        <div className="interior-hero-image">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800"
            alt="Modern Interior Design"
          />
        </div>
      </section>

      {/* Room Categories */}
      <section className="interior-section">
        <div className="interior-container">
          <h2 className="section-title">Design Every Space</h2>
          <p className="section-subtitle">
            Explore interior solutions for every room in your home
          </p>
          <div className="room-grid">
            {ROOM_CATEGORIES.map((room) => (
              <motion.div
                key={room.id}
                className={`room-card ${selectedRoom === room.id ? 'active' : ''}`}
                onClick={() => setSelectedRoom(room.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="room-image">
                  <img src={room.image} alt={room.name} />
                  <div className="room-overlay">
                    <room.icon className="room-icon" />
                  </div>
                </div>
                <h3>{room.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Design Styles */}
      <section className="interior-section bg-light">
        <div className="interior-container">
          <h2 className="section-title">Choose Your Style</h2>
          <p className="section-subtitle">
            Find the perfect design aesthetic for your home
          </p>
          <div className="styles-grid">
            {DESIGN_STYLES.map((style) => (
              <motion.div
                key={style.id}
                className="style-card"
                whileHover={{ y: -5 }}
              >
                <MdStyle className="style-icon" />
                <h3>{style.name}</h3>
                <p>{style.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Design Packages */}
      <section className="interior-section">
        <div className="interior-container">
          <h2 className="section-title">Interior Design Packages</h2>
          <p className="section-subtitle">
            All-inclusive packages with transparent pricing
          </p>
          <div className="packages-grid">
            {DESIGN_PACKAGES.map((pkg) => (
              <motion.div
                key={pkg.id}
                className={`package-card ${pkg.popular ? 'popular' : ''}`}
                whileHover={{ y: -5 }}
              >
                {pkg.popular && (
                  <span className="popular-badge">Most Popular</span>
                )}
                <h3>{pkg.name}</h3>
                <div className="package-price">
                  <span className="price">{pkg.price}</span>
                  <span className="price-note">{pkg.priceNote}</span>
                </div>
                <ul className="package-features">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx}>
                      <FaCheckCircle className="check-icon" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a href="#consultation-form" className="package-btn">
                  Get Quote
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="interior-section bg-light">
        <div className="interior-container">
          <h2 className="section-title">Why Choose UrbanStay Interiors</h2>
          <p className="section-subtitle">
            Trusted by thousands of homeowners across India
          </p>
          <div className="features-grid">
            {WHY_CHOOSE_US.map((feature, idx) => (
              <motion.div
                key={idx}
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <feature.icon className="feature-icon" />
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="interior-section">
        <div className="interior-container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Simple 4-step process to your dream home
          </p>
          <div className="process-grid">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3>Book Consultation</h3>
              <p>Schedule a free consultation with our design experts</p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h3>Get Design</h3>
              <p>Receive personalized 3D designs for your space</p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h3>Approve & Pay</h3>
              <p>Review designs, make changes, and confirm</p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h3>Installation</h3>
              <p>Sit back while we transform your home</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="interior-section bg-light">
        <div className="interior-container">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Real stories from happy homeowners</p>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((testimonial, idx) => (
              <motion.div
                key={idx}
                className="testimonial-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="testimonial-header">
                  <img src={testimonial.image} alt={testimonial.name} />
                  <div>
                    <h4>{testimonial.name}</h4>
                    <span>{testimonial.location}</span>
                  </div>
                </div>
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="star-icon" />
                  ))}
                </div>
                <p>{testimonial.comment}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Form */}
      <section
        id="consultation-form"
        className="interior-section consultation-section"
      >
        <div className="interior-container">
          <div className="consultation-wrapper">
            <div className="consultation-info">
              <h2>Get Free Interior Design Consultation</h2>
              <p>
                Let our experts help you design your perfect home. Fill in your
                details and we'll get in touch within 24 hours.
              </p>
              <ul className="consultation-benefits">
                <li>
                  <FaCheckCircle /> Free 3D design consultation
                </li>
                <li>
                  <FaCheckCircle /> Transparent pricing with no hidden costs
                </li>
                <li>
                  <FaCheckCircle /> 10-year warranty on all products
                </li>
                <li>
                  <FaCheckCircle /> 45-day installation guarantee
                </li>
              </ul>
            </div>
            <div className="consultation-form-wrapper">
              {formStatus.submitted ? (
                <motion.div
                  className="form-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <FaCheckCircle className="success-icon" />
                  <h3>Thank You!</h3>
                  <p>Our design expert will contact you within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="consultation-form">
                  <div className="form-group">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <FaPhone className="input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <FaHome className="input-icon" />
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Property Type</option>
                      <option value="1bhk">1 BHK</option>
                      <option value="2bhk">2 BHK</option>
                      <option value="3bhk">3 BHK</option>
                      <option value="4bhk">4 BHK+</option>
                      <option value="villa">Villa</option>
                      <option value="penthouse">Penthouse</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <FaRuler className="input-icon" />
                    <input
                      type="text"
                      name="city"
                      placeholder="Your City"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <textarea
                      name="message"
                      placeholder="Tell us about your requirements (optional)"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>
                  <button type="submit" className="submit-btn">
                    Get Free Consultation
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeInterior;
