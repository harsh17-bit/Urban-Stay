import { useState, useEffect } from "react";
import { useSearchParams} from "react-router-dom";
import {
    FiSearch, FiFilter, FiMapPin, FiGrid, FiList, FiX, FiChevronDown
} from "react-icons/fi";
import { propertyService } from "../services/propertyservice";
import PropertyCard from "../components/propertycard";
import "./SearchResults.css";

const SearchResults = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalResults, setTotalResults] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState("grid");
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        search: searchParams.get("search") || "",
        listingType: searchParams.get("listingType") || "",
        propertyType: searchParams.get("propertyType") || "",
        city: searchParams.get("city") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        bedrooms: searchParams.get("bedrooms") || "",
        minArea: searchParams.get("minArea") || "",
        maxArea: searchParams.get("maxArea") || "",
        furnishing: searchParams.get("furnishing") || "",
        sort: searchParams.get("sort") || "newest",
    });

    const propertyTypes = [
        "apartment", "house", "villa", "plot", "commercial", "office", "shop"
    ];

    const cities = [
        "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata",
        "Pune", "Ahmedabad", "Jaipur", "Lucknow"
    ];

    useEffect(() => {
        fetchProperties();
    }, [searchParams, currentPage]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params = Object.fromEntries(searchParams.entries());
            params.page = currentPage;
            params.limit = 12;

            const response = await propertyService.getProperties(params);
            setProperties(response.properties || []);
            setTotalResults(response.total || 0);
            setTotalPages(response.pages || 1);
        } catch (error) {
            console.error("Error fetching properties:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        setSearchParams(params);
        setCurrentPage(1);
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({
            search: "",
            listingType: "",
            propertyType: "",
            city: "",
            minPrice: "",
            maxPrice: "",
            bedrooms: "",
            minArea: "",
            maxArea: "",
            furnishing: "",
            sort: "newest",
        });
        setSearchParams(new URLSearchParams());
        setCurrentPage(1);
    };

    const activeFilterCount = Object.values(filters).filter(v => v && v !== "newest").length;

    return (
        <div className="search-page">
            {/* Search Header */}
            <div className="search-header">
                <div className="search-header-content">
                    <div className="search-input-wrapper">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Search by location, project, or keyword..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange("search", e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && applyFilters()}
                        />
                    </div>

                    <div className="quick-filters">
                        <select
                            value={filters.listingType}
                            onChange={(e) => {
                                handleFilterChange("listingType", e.target.value);
                                setTimeout(applyFilters, 0);
                            }}
                        >
                            <option value="">Buy/Rent</option>
                            <option value="buy">Buy</option>
                            <option value="rent">Rent</option>
                        </select>

                        <select
                            value={filters.city}
                            onChange={(e) => {
                                handleFilterChange("city", e.target.value);
                                setTimeout(applyFilters, 0);
                            }}
                        >
                            <option value="">All Cities</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>

                        <button
                            className={`filter-btn ${showFilters ? "active" : ""}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FiFilter />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="filter-count">{activeFilterCount}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            <div className={`filter-panel ${showFilters ? "open" : ""}`}>
                <div className="filter-panel-content">
                    <div className="filter-header">
                        <h3>Filters</h3>
                        <button className="clear-btn" onClick={clearFilters}>Clear All</button>
                    </div>

                    <div className="filter-grid">
                        <div className="filter-group">
                            <label>Property Type</label>
                            <select
                                value={filters.propertyType}
                                onChange={(e) => handleFilterChange("propertyType", e.target.value)}
                            >
                                <option value="">All Types</option>
                                {propertyTypes.map(type => (
                                    <option key={type} value={type} className="capitalize">{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Price Range</label>
                            <div className="range-inputs">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice}
                                    onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                                />
                                <span>to</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="filter-group">
                            <label>Bedrooms</label>
                            <div className="bedroom-buttons">
                                {["", "1", "2", "3", "4", "5+"].map(num => (
                                    <button
                                        key={num}
                                        className={filters.bedrooms === num ? "active" : ""}
                                        onClick={() => handleFilterChange("bedrooms", num)}
                                    >
                                        {num || "Any"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <label>Area (sq ft)</label>
                            <div className="range-inputs">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minArea}
                                    onChange={(e) => handleFilterChange("minArea", e.target.value)}
                                />
                                <span>to</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxArea}
                                    onChange={(e) => handleFilterChange("maxArea", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="filter-group">
                            <label>Furnishing</label>
                            <select
                                value={filters.furnishing}
                                onChange={(e) => handleFilterChange("furnishing", e.target.value)}
                            >
                                <option value="">Any</option>
                                <option value="unfurnished">Unfurnished</option>
                                <option value="semi-furnished">Semi-Furnished</option>
                                <option value="fully-furnished">Fully Furnished</option>
                            </select>
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button className="btn-outline" onClick={() => setShowFilters(false)}>
                            Cancel
                        </button>
                        <button className="btn-primary" onClick={applyFilters}>
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="search-results-container">
                <div className="results-header">
                    <div className="results-info">
                        <h2>
                            {loading ? "Searching..." : `${totalResults} Properties Found`}
                        </h2>
                        {filters.city && <span className="location-tag"><FiMapPin /> {filters.city}</span>}
                    </div>

                    <div className="results-controls">
                        <select
                            value={filters.sort}
                            onChange={(e) => {
                                handleFilterChange("sort", e.target.value);
                                setTimeout(applyFilters, 0);
                            }}
                            className="sort-select"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="popular">Most Popular</option>
                        </select>

                        <div className="view-toggle">
                            <button
                                className={viewMode === "grid" ? "active" : ""}
                                onClick={() => setViewMode("grid")}
                            >
                                <FiGrid />
                            </button>
                            <button
                                className={viewMode === "list" ? "active" : ""}
                                onClick={() => setViewMode("list")}
                            >
                                <FiList />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Active Filters */}
                {activeFilterCount > 0 && (
                    <div className="active-filters">
                        {filters.listingType && (
                            <span className="filter-tag">
                                For {filters.listingType}
                                <button onClick={() => { handleFilterChange("listingType", ""); applyFilters(); }}>
                                    <FiX />
                                </button>
                            </span>
                        )}
                        {filters.propertyType && (
                            <span className="filter-tag">
                                {filters.propertyType}
                                <button onClick={() => { handleFilterChange("propertyType", ""); applyFilters(); }}>
                                    <FiX />
                                </button>
                            </span>
                        )}
                        {filters.bedrooms && (
                            <span className="filter-tag">
                                {filters.bedrooms} BHK
                                <button onClick={() => { handleFilterChange("bedrooms", ""); applyFilters(); }}>
                                    <FiX />
                                </button>
                            </span>
                        )}
                        {(filters.minPrice || filters.maxPrice) && (
                            <span className="filter-tag">
                                ₹{filters.minPrice || "0"} - ₹{filters.maxPrice || "∞"}
                                <button onClick={() => { handleFilterChange("minPrice", ""); handleFilterChange("maxPrice", ""); applyFilters(); }}>
                                    <FiX />
                                </button>
                            </span>
                        )}
                    </div>
                )}

                {/* Property Grid */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Finding the best properties for you...</p>
                    </div>
                ) : properties.length > 0 ? (
                    <>
                        <div className={`properties-grid ${viewMode}`}>
                            {properties.map((property) => (
                                <PropertyCard key={property._id} property={property} viewMode={viewMode} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    Previous
                                </button>
                                <div className="page-numbers">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const page = i + 1;
                                        return (
                                            <button
                                                key={page}
                                                className={currentPage === page ? "active" : ""}
                                                onClick={() => setCurrentPage(page)}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                    {totalPages > 5 && <span>...</span>}
                                </div>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <FiSearch />
                        <h3>No properties found</h3>
                        <p>Try adjusting your filters or search in a different area</p>
                        <button className="btn-primary" onClick={clearFilters}>
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
