import { Link } from 'react-router-dom';
import {
  FiShield,
  FiTrendingUp,
  FiHeart,
  FiTarget,
  FiZap,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCheckCircle,
} from 'react-icons/fi';
import './AboutUs.css';

/* ─────────────────── data ─────────────────── */

const VALUES = [
  {
    icon: FiShield,
    title: 'Trust & Transparency',
    desc: 'Every property is verified. We believe honest information builds lasting relationships.',
  },
  {
    icon: FiTarget,
    title: 'Customer First',
    desc: 'Your dream matters most. We work to match you with the perfect property.',
  },
  {
    icon: FiZap,
    title: 'Innovation',
    desc: 'We use modern technology to make your property search faster and smarter.',
  },
  {
    icon: FiHeart,
    title: 'Community',
    desc: "We don't just sell homes — we help build thriving neighbourhoods across India.",
  },
  {
    icon: FiTrendingUp,
    title: 'Growth',
    desc: 'Continuously expanding our reach to serve more cities and more families every year.',
  },
];

const TEAM = [
  {
    name: 'Arjun Mehta',
    role: 'Founder & CEO',
    initials: 'AM',
    bio: '15 years in real estate, passionate about making home ownership accessible to every family.',
  },
  {
    name: 'Priya Sharma',
    role: 'Chief Technology Officer',
    initials: 'PS',
    bio: "Built UrbanStay's property matching platform from the ground up.",
  },
  {
    name: 'Ravi Kumar',
    role: 'Head of Operations',
    initials: 'RK',
    bio: 'Ensures every listing is verified and every customer experience is smooth.',
  },
  {
    name: 'Sneha Patel',
    role: 'Head of Customer Success',
    initials: 'SP',
    bio: 'Makes sure that buying a home is exciting, not stressful.',
  },
];

const WHY_US = [
  '10,000+ new properties added every day',
  'Physical verification of photos, videos & documents',
  'Dedicated relationship managers for premium buyers',
  'Zero brokerage on select listings',
  'Secure and transparent transactions',
  '24*7 customer support',
];

const AboutUs = () => {
  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <h1>About UrbanStay</h1>
        <p>
          Since 2014, UrbanStay has helped over 2 million families find their
          perfect home — with verified listings, transparent pricing and a team
          that genuinely cares.
        </p>
        <Link to="/post-property" className="about-cta-btn">
          List Your Property
        </Link>
      </section>

      {/* Mission & Vision */}
      <section className="about-section">
        <div className="about-mv-grid">
          <div className="about-mv-card">
            <h2>Our Mission</h2>
            <p>
              To make real estate in India simple, transparent and accessible
              for every family — whether they are first-time buyers in a tier-2
              city or experienced investors in a metro.
            </p>
          </div>
          <div className="about-mv-card">
            <h2>Our Vision</h2>
            <p>
              A future where finding, buying or renting a home is
              straightforward — powered by verified data and a network you can
              trust.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-section about-section-alt">
        <div className="about-section-header">
          <h2>Our Core Values</h2>
          <p>The principles that guide every decision at UrbanStay</p>
        </div>
        <div className="about-values-grid">
          {VALUES.map((v) => (
            <div key={v.title} className="about-value-card">
              <v.icon size={24} className="about-value-icon" />
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us */}
      <section className="about-section">
        <div className="about-section-header">
          <h2>Why Choose UrbanStay</h2>
          <p>What sets us apart from other property platforms</p>
        </div>
        <ul className="about-why-list">
          {WHY_US.map((item) => (
            <li key={item}>
              <FiCheckCircle size={17} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Team */}
      <section className="about-section about-section-alt">
        <div className="about-section-header">
          <h2>Meet Our Team</h2>
          <p>The people behind UrbanStay</p>
        </div>
        <div className="about-team-grid">
          {TEAM.map((m) => (
            <div key={m.name} className="about-team-card">
              <div className="about-team-avatar">{m.initials}</div>
              <h3>{m.name}</h3>
              <span className="about-team-role">{m.role}</span>
              <p>{m.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="about-section">
        <div className="about-section-header">
          <h2>Get In Touch</h2>
          <p>Our team is here to help you find your perfect property</p>
        </div>
        <div className="about-contact-grid">
          <div className="about-contact-item">
            <FiPhone size={20} />
            <div>
              <strong>Call Us</strong>
              <span>+91 98765 43210</span>
            </div>
          </div>
          <div className="about-contact-item">
            <FiMail size={20} />
            <div>
              <strong>Email Us</strong>
              <span>hello@urbanstay.in</span>
            </div>
          </div>
          <div className="about-contact-item">
            <FiMapPin size={20} />
            <div>
              <strong>Visit Us</strong>
              <span>12th Floor, Tech Park, Bengaluru</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
