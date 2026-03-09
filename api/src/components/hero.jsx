import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import "./Hero.css";

const Hero = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("all"); // all, buy, rent
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchTerm) {
      params.append("search", searchTerm);
    }

    if (propertyFilter === "buy") {
      params.append("listingType", "buy");
    } else if (propertyFilter === "rent") {
      params.append("listingType", "rent");
    }

    navigate(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="hero">
      <div className="hero-container">
        {/* Main Heading */}
        <h1 className="hero-title">Find Your Perfect Home</h1>

        <div className="hero-search-section">
          <div className="hero-search-bar">
            <input
              type="text"
              className="hero-search-input"
              placeholder="Search by city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="hero-search-btn" onClick={handleSearch}>
              <FiSearch />
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="hero-filters">
            <p className="hero-filter-label">Explore all things property</p>
            <div className="hero-filter-buttons">
              <button
                className={`filter-btn ${propertyFilter === "all" ? "active" : ""}`}
                onClick={() => setPropertyFilter("all")}
              >
                All Properties
              </button>
              <button
                className={`filter-btn ${propertyFilter === "buy" ? "active" : ""}`}
                onClick={() => setPropertyFilter("buy")}
              >
                For Sale
              </button>
              <button
                className={`filter-btn ${propertyFilter === "rent" ? "active" : ""}`}
                onClick={() => setPropertyFilter("rent")}
              >
                For Rent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
