import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiMapPin, FiGrid, FiList, FiX } from 'react-icons/fi';
import { propertyService } from '../services/propertyservice';
import PropertyCard from '../components/propertycard';
import './SearchResults.css';

const getFiltersFromParams = (params) => ({
  search: params.get('search') || '',
  listingType: params.get('listingType') || params.get('listingtype') || '',
  propertyType: params.get('propertyType') || '',
  city: params.get('city') || '',
  minPrice: params.get('minPrice') || '',
  maxPrice: params.get('maxPrice') || '',
  bedrooms: params.get('bedrooms') || '',
  sort: params.get('sort') || 'newest',
});

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode] = useState('grid');
  const [filters, setFilters] = useState(() =>
    getFiltersFromParams(searchParams)
  );

  const cities = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Pune',
    'Ahmedabad',
    'Jaipur',
    'Lucknow',
  ];

  useEffect(() => {
    setFilters(getFiltersFromParams(searchParams));
  }, [searchParams]);

  const fetchProperties = useCallback(async () => {
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
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, currentPage]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = (nextFilters = filters) => {
    const normalizedFilters = { ...nextFilters };
    normalizedFilters.search = (normalizedFilters.search || '').trim();
    const min = Number(normalizedFilters.minPrice);
    const max = Number(normalizedFilters.maxPrice);

    // Treat ranges like "1 to infinity" as no price constraint.
    if (
      normalizedFilters.minPrice !== '' &&
      normalizedFilters.maxPrice === '' &&
      Number.isFinite(min) &&
      min <= 1
    ) {
      normalizedFilters.minPrice = '';
    }

    if (
      normalizedFilters.minPrice !== '' &&
      normalizedFilters.maxPrice !== '' &&
      Number.isFinite(min) &&
      Number.isFinite(max) &&
      min > max
    ) {
      normalizedFilters.minPrice = String(max);
      normalizedFilters.maxPrice = String(min);
      setFilters(normalizedFilters);
    }

    const params = new URLSearchParams();
    Object.entries(normalizedFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
    setCurrentPage(1);
  };

  const updateFilterAndApply = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    applyFilters(nextFilters);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      listingType: '',
      propertyType: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      sort: 'newest',
    });
    setSearchParams(new URLSearchParams());
    setCurrentPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => (typeof v === 'string' ? v.trim() : v) && v !== 'newest'
  ).length;

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
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          <div className="quick-filters">
            <select
              value={filters.listingType}
              onChange={(e) => {
                updateFilterAndApply('listingType', e.target.value);
              }}
            >
              <option value="">Buy/Rent</option>
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
            </select>

            <select
              value={filters.city}
              onChange={(e) => {
                updateFilterAndApply('city', e.target.value);
              }}
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="search-results-container">
        <div className="results-header">
          <div className="results-info">
            <h2>
              {loading ? 'Searching...' : `${totalResults} Properties Found`}
            </h2>
            {filters.city && (
              <span className="location-tag">
                <FiMapPin /> {filters.city}
              </span>
            )}
          </div>

          <div className="results-controls">
            <select
              value={filters.sort}
              onChange={(e) => {
                updateFilterAndApply('sort', e.target.value);
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
              {/* <button
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid />
              </button> */}
              {/* <button
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
              >
                <FiList />
              </button> */}
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="active-filters">
            {filters.search?.trim() && (
              <span className="filter-tag">
                Search: {filters.search.trim()}
                <button
                  onClick={() => {
                    updateFilterAndApply('search', '');
                  }}
                >
                  <FiX />
                </button>
              </span>
            )}
            {filters.listingType && (
              <span className="filter-tag">
                For {filters.listingType}
                <button
                  onClick={() => {
                    updateFilterAndApply('listingType', '');
                  }}
                >
                  <FiX />
                </button>
              </span>
            )}
            {filters.propertyType && (
              <span className="filter-tag">
                {filters.propertyType}
                <button
                  onClick={() => {
                    updateFilterAndApply('propertyType', '');
                  }}
                >
                  <FiX />
                </button>
              </span>
            )}
            {filters.bedrooms && (
              <span className="filter-tag">
                {filters.bedrooms} BHK
                <button
                  onClick={() => {
                    updateFilterAndApply('bedrooms', '');
                  }}
                >
                  <FiX />
                </button>
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="filter-tag">
                ₹{filters.minPrice || '0'} - ₹{filters.maxPrice || '∞'}
                <button
                  onClick={() => {
                    const nextFilters = {
                      ...filters,
                      minPrice: '',
                      maxPrice: '',
                    };
                    setFilters(nextFilters);
                    applyFilters(nextFilters);
                  }}
                >
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
                <PropertyCard
                  key={property._id}
                  property={property}
                  viewMode={viewMode}
                />
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
                        className={currentPage === page ? 'active' : ''}
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
            <h3>Sorry, no properties matched your search</h3>
            <p>
              We regret the inconvenience. Please try a different filter or
              city.
            </p>
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
