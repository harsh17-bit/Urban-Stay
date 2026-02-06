import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiHome, FiMapPin, FiDollarSign } from "react-icons/fi";
import "./Hero.css";

const Hero = () => {
  const [listingType, setListingType] = useState("buy"); // buy or rent
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    // Construct query parameters
    const params = new URLSearchParams();
    if (listingType) params.append("listingType", listingType);
    if (searchTerm) params.append("search", searchTerm);
    if (propertyType) params.append("propertyType", propertyType);
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      if (min) params.append("minPrice", min);
      if (max) params.append("maxPrice", max);
    }

    // Navigate to search results page
    navigate(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="hero">
      {/* Animated floating orbs background */}
      <div className="hero-bg-animation">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
        <div className="orb orb-5"></div>
      </div>

      <div className="hero-container">
        <h1>
          Find Your <span>Dream Home</span>
        </h1>
        <p>Buy, Rent or Sell properties across top cities in India</p>

        <div className="search-card">
          {/* Tabs for Buy/Rent */}
          <div className="search-tabs">
            <button
              className={`search-tab ${listingType === "buy" ? "active" : ""}`}
              onClick={() => setListingType("buy")}
            >
              Buy
            </button>
            <button
              className={`search-tab ${listingType === "rent" ? "active" : ""}`}
              onClick={() => setListingType("rent")}
            >
              Rent
            </button>
          </div>

          {/* Search Inputs Grid */}
          <div className="search-inputs">
            {/* Location Search */}
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search city"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Property Type */}
            <div className="search-input-wrapper">
            
              <select
                className="search-input"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="">Property Type</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="house">House</option>
                <option value="plot">Plot</option>
                <option value="office">Commercial</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="search-input-wrapper">
             
              <select
                className="search-input"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="">Budget</option>
                {listingType === "buy" ? (
                  <>
                    <option value="0-5000000">Under ₹50 Lac</option>
                    <option value="5000000-10000000">₹50 Lac - ₹1 Cr</option>
                    <option value="10000000-20000000">₹1 Cr - ₹2 Cr</option>
                    <option value="20000000-50000000">₹2 Cr - ₹5 Cr</option>
                    <option value="50000000-999999999">Above ₹5 Cr</option>
                  </>
                ) : (
                  <>
                    <option value="0-10000">Under ₹10,000</option>
                    <option value="10000-25000">₹10,000 - ₹25,000</option>
                    <option value="25000-50000">₹25,000 - ₹50,000</option>
                    <option value="50000-100000">₹50,000 - ₹1 Lac</option>
                    <option value="100000-999999999">Above ₹1 Lac</option>
                  </>
                )}
              </select>
            </div>

            {/* Search Button */}
            <button className="search-btn" onClick={handleSearch}>
              <FiSearch className="btn-icon" />
            
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
