import { useEffect, useState } from "react";
import "./FeaturedProjects.css";
import PropertyCard from "./propertycard";
import { propertyService } from "../services/propertyservice";

const FeaturedProjects = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await propertyService.getFeatured();
        setFeatured(response?.properties || []);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Failed to load featured properties");
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <section className="featured-projects">
      <div className="featured-container">
        <h2 className="featured-title">Handpicked Residential Projects</h2>
        <p className="featured-subtitle">Featured Residential projects across India</p>
        <div className="featured-grid">
          {loading && <p>Loading featured properties...</p>}
          {!loading && error && <p>{error}</p>}
          {!loading && !error && featured.length === 0 && (
            <p>No featured properties yet.</p>
          )}
          {!loading && !error && featured.length > 0 &&
            featured.map((item) => (
              <PropertyCard key={item._id} property={item} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
