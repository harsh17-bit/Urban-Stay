import { Link } from "react-router-dom";
import "./TopCities.css";

/** Add/remove cities here — no other code needs to change. */
const CITIES = [
  { name: "Delhi", count: "22+", listingType: "buy" },
  { name: "Mumbai", count: "64+", listingType: "buy" },
  { name: "Bangalore", count: "62+", listingType: "buy" },
  { name: "Hyderabad", count: "29+", listingType: "buy" },
  { name: "Pune", count: "64+", listingType: "buy" },
  { name: "Kolkata", count: "41+", listingType: "buy" },
  { name: "Chennai", count: "42+", listingType: "buy" },
  { name: "Ahmedabad", count: "29+", listingType: "buy" },
];

/** Builds the search URL — change routing logic here only. */
const cityUrl = ({ name, listingType }) =>
  `/properties?city=${encodeURIComponent(name)}${listingType ? `&listingType=${listingType}` : ""}`;

/** Single card — isolated, easy to test and style independently. */
const CityCard = ({ city }) => (
  <Link to={cityUrl(city)} className="top-cities-card">
    <span className="top-cities-name">{city.name}</span>
    <span className="top-cities-count">{city.count} Properties</span>
  </Link>
);

const TopCities = () => (
  <section className="top-cities">
    <div className="top-cities-container">
      <h2 className="top-cities-title">
        Explore Real Estate in Popular Indian Cities
      </h2>
      <p className="top-cities-subtitle">TOP CITIES</p>
      <div className="top-cities-grid">
        {CITIES.map((city) => (
          <CityCard key={city.name} city={city} />
        ))}
      </div>
    </div>
  </section>
);

export default TopCities;
