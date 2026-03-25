import { FiStar } from 'react-icons/fi';
import './TestimonialsSection.css';

const TESTIMONIALS = [
  {
    quote:
      'You get an exclusive RM from our team who tracks your property closely. The verification process is thorough and trustworthy.',
    name: 'Srikanth Malleboina',
    role: 'Property Owner, Hyderabad',
    rating: 5,
    image: 'SM',
  },
  {
    quote:
      'Better response rate compared to any of their competitors. Found my dream home within 2 weeks!',
    name: 'Prateek Sengar',
    role: 'Home Buyer, Delhi',
    rating: 4,
    image: 'PS',
  },
  {
    quote:
      'Platform to meet customers & generate revenues with lowest cost of acquisition. Highly professional team.',
    name: 'SOBHA Developers',
    role: 'Real Estate Builder',
    rating: 4,
    image: 'SD',
  },
  {
    quote:
      'Transparent process, verified listings, and excellent customer support. Sold my property in record time!',
    name: 'Anjali Sharma',
    role: 'Property Seller, Mumbai',
    rating: 5,
    image: 'AS',
  },
  {
    quote:
      'Transparent process, verified listings, and excellent customer support. Sold my property in record time!',
    name: 'Anjali Sharma',
    role: 'Property Seller, Mumbai',
    rating: 5,
    image: 'AS',
  },
  {
    quote:
      'Transparent process, verified listings, and excellent customer support. Sold my property in record time!',
    name: 'Anjali Sharma',
    role: 'Property Seller, Mumbai',
    rating: 5,
    image: 'AS',
  },
];

const TestimonialsSection = () => {
  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <h2 className="testimonials-title">What our customers are saying</h2>
        <p className="testimonials-subtitle">
          Hear from our satisfied buyers, tenants, owners and dealers
        </p>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((item, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(item.rating)].map((_, index) => (
                  <FiStar key={index} className="star-filled" />
                ))}
              </div>
              {/* <p className="testimonial-quote">"{item.quote}"</p> */}
              <div className="testimonial-author">
                <div className="testimonial-avatar">{item.image}</div>
                <div>
                  {/* <p className="testimonial-name">{item.name}</p>
                  <p className="testimonial-role">{item.role}</p> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
