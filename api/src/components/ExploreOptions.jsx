import "./ExploreOptions.css";
import {
  FaHome,
  FaKey,
  FaClipboardList,
} from "react-icons/fa";

const OPTIONS = [
  { label: "Buying a home", icon: FaHome, href:"properties?listingtype=buy" },
  { label: "Renting a home", icon: FaKey, href: "properties?listingtype=rent" },
  { label: "Sell your property", icon: FaClipboardList, href: "post-property" },
];


const ExploreOptions = () => {
  return (
    <section className="explore-options">
      <div className="explore-container">
        <h2 className="explore-title">Get started with exploring real estate options</h2>
        <div className="explore-grid">
          {OPTIONS.map((item) => (
            <a key={item.label} href={item.href} className="explore-card">
              {item.badge && <span className="explore-badge">{item.badge}</span>}
              <span className="explore-icon"><item.icon size={32} /></span>
              <span className="explore-label">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreOptions;
