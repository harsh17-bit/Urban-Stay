import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { propertyService } from "../services/propertyservice";
import "./TopCities.css";

const FALLBACK_CITIES = [
  { name: "Delhi", count: 0 },
  { name: "Mumbai", count: 0 },
  { name: "Bangalore", count: 0 },
  { name: "Hyderabad", count: 0 },
  { name: "Pune", count: 0 },
  { name: "Kolkata", count: 0 },
  { name: "Chennai", count: 0 },
  { name: "Ahmedabad", count: 0 },
];

/** Builds the search URL — change routing logic here only. */
const cityUrl = ({ name }) =>
  `/properties?city=${encodeURIComponent(name)}`;

/** Single card — isolated, easy to test and style independently. */
const CityCard = ({ city }) => (
  <Link to={cityUrl(city)} className="top-cities-card">
    <span className="top-cities-name">{city.name}</span>
    <span className="top-cities-count">{city.count}+ Properties</span>
  </Link>
);

const TopCities = () => {
  const [cities, setCities] = useState(FALLBACK_CITIES);

  useEffect(() => {
    const loadCityStats = async () => {
      try {
        const response = await propertyService.getCityStats();
        const dynamicCities = (response?.cities || [])
          .filter((city) => city?._id)
          .map((city) => ({
            name: city._id,
            count: Number(city.count) || 0,
          }));

        if (dynamicCities.length > 0) {
          setCities(dynamicCities);
        }
      } catch (error) {
        console.error("Failed to load city stats:", error);
      }
    };

    loadCityStats();
  }, []);

  return (
    <section className="top-cities">
      <div className="top-cities-container">
        <h2 className="top-cities-title">
          Explore Real Estate in Popular Indian Cities
        </h2>
        <p className="top-cities-subtitle">TOP CITIES</p>
        <div className="top-cities-grid">
          {cities.map((city) => (
            <CityCard key={city.name} city={city} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopCities;
