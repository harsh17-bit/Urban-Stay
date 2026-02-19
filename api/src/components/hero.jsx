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
      {/* Left Side House Illustration */}
      <div className="hero-house hero-house-left">
        <svg viewBox="0 0 500 350" xmlns="http://www.w3.org/2000/svg" className="house-svg">
          {/* Left Tree */}
          <g className="tree">
            <ellipse cx="50" cy="120" rx="25" ry="35" fill="#d4a574" opacity="0.8"/>
            <line x1="55" y1="155" x2="55" y2="185" stroke="#8b6f47" strokeWidth="3"/>
          </g>

          {/* Left small tree */}
          <g className="tree">
            <ellipse cx="100" cy="100" rx="18" ry="28" fill="#d4a574" opacity="0.9"/>
            <line x1="103" y1="128" x2="103" y2="155" stroke="#8b6f47" strokeWidth="2.5"/>
          </g>

          {/* Fence */}
          <g className="fence">
            <line x1="130" y1="170" x2="280" y2="170" stroke="#999" strokeWidth="2"/>
            <line x1="145" y1="165" x2="145" y2="180" stroke="#999" strokeWidth="1.5"/>
            <line x1="165" y1="165" x2="165" y2="180" stroke="#999" strokeWidth="1.5"/>
            <line x1="185" y1="165" x2="185" y2="180" stroke="#999" strokeWidth="1.5"/>
            <line x1="205" y1="165" x2="205" y2="180" stroke="#999" strokeWidth="1.5"/>
            <line x1="225" y1="165" x2="225" y2="180" stroke="#999" strokeWidth="1.5"/>
            <line x1="245" y1="165" x2="245" y2="180" stroke="#999" strokeWidth="1.5"/>
            <line x1="265" y1="165" x2="265" y2="180" stroke="#999" strokeWidth="1.5"/>
          </g>

          {/* Bush/Landscaping left */}
          <ellipse cx="130" cy="175" rx="20" ry="15" fill="#d4a574" opacity="0.7"/>

          {/* Main House */}
          <g className="main-house">
            {/* Roof left section */}
            <polygon points="220,50 140,140 300,140" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            
            {/* Roof right section (for depth) */}
            <polygon points="300,140 380,140 300,50" fill="none" stroke="#333" strokeWidth="2" opacity="0.5" strokeLinecap="round" strokeLinejoin="round"/>
            
            {/* Chimney */}
            <rect x="350" y="30" width="25" height="60" fill="none" stroke="#333" strokeWidth="2"/>
            
            {/* Main walls */}
            <rect x="140" y="140" width="240" height="100" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            
            {/* Front section highlight */}
            <line x1="220" y1="140" x2="220" y2="240" stroke="#999" strokeWidth="1.5" opacity="0.6"/>
            
            {/* Door */}
            <rect x="200" y="190" width="40" height="50" fill="none" stroke="#87b1d4" strokeWidth="2.5"/>
            <circle cx="235" cy="215" r="3" fill="#87b1d4"/>
            
            {/* Left window upper */}
            <rect x="155" y="155" width="30" height="30" fill="none" stroke="#333" strokeWidth="2"/>
            <line x1="170" y1="155" x2="170" y2="185" stroke="#333" strokeWidth="1"/>
            <line x1="155" y1="170" x2="185" y2="170" stroke="#333" strokeWidth="1"/>
            
            {/* Left window lower */}
            <rect x="155" y="200" width="30" height="30" fill="none" stroke="#333" strokeWidth="2"/>
            <line x1="170" y1="200" x2="170" y2="230" stroke="#333" strokeWidth="1"/>
            <line x1="155" y1="215" x2="185" y2="215" stroke="#333" strokeWidth="1"/>
            
            {/* Right window upper left */}
            <rect x="255" y="155" width="30" height="30" fill="none" stroke="#333" strokeWidth="2"/>
            <line x1="270" y1="155" x2="270" y2="185" stroke="#333" strokeWidth="1"/>
            <line x1="255" y1="170" x2="285" y2="170" stroke="#333" strokeWidth="1"/>
            
            {/* Right window upper right */}
            <rect x="295" y="155" width="30" height="30" fill="none" stroke="#333" strokeWidth="2"/>
            <line x1="310" y1="155" x2="310" y2="185" stroke="#333" strokeWidth="1"/>
            <line x1="295" y1="170" x2="325" y2="170" stroke="#333" strokeWidth="1"/>
            
            {/* Right side windows */}
            <rect x="320" y="200" width="25" height="25" fill="none" stroke="#333" strokeWidth="1.5"/>
            <line x1="332.5" y1="200" x2="332.5" y2="225" stroke="#333" strokeWidth="1"/>
            <line x1="320" y1="212.5" x2="345" y2="212.5" stroke="#333" strokeWidth="1"/>
            
            {/* Upper window in roof */}
            <rect x="270" y="70" width="25" height="25" fill="none" stroke="#999" strokeWidth="1.5"/>
            <line x1="282.5" y1="70" x2="282.5" y2="95" stroke="#999" strokeWidth="0.8"/>
            <line x1="270" y1="82.5" x2="295" y2="82.5" stroke="#999" strokeWidth="0.8"/>
          </g>

          {/* FOR SALE Badge */}
          <g className="badge">
            <rect x="145" y="195" width="50" height="25" rx="3" fill="#ef4444" opacity="0.95"/>
            <text x="170" y="213" fontSize="12" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">FOR SALE</text>
          </g>

          {/* Landscaping - bushes below */}
          <ellipse cx="280" cy="245" rx="25" ry="18" fill="#d4a574" opacity="0.6"/>
          
          {/* Right decorative trees */}
          <g className="tree">
            <ellipse cx="400" cy="125" rx="30" ry="40" fill="#d4a574" opacity="0.85"/>
            <line x1="405" y1="165" x2="405" y2="200" stroke="#8b6f47" strokeWidth="3"/>
          </g>
        </svg>
      </div>

      <div className="hero-container">
        {/* Top Badge */}
        <div className="hero-badge">
          <span>LET US GUIDE YOUR HOME</span>
        </div>
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
