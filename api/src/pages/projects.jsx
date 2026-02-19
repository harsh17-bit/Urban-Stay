import { useEffect, useState } from "react";
import { FiMapPin, FiStar, FiHome } from "react-icons/fi";
import { projectService } from "../services/projectservice";
import "./Projects.css";

const Projects = () => {
  const [ setProjects] = useState([]);
  const [setLoading] = useState(true);
  const [ setError] = useState("");
  const [filters] = useState({
    city: "",
    status: "",
    featured: "",
  });

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await projectService.getProjects(filters);
        setProjects(response.projects || []);
      } catch (err) {
        setError(err?.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [filters]);


  
  return (
    <div className="projects-page">
      <div className="projects-hero">
        <h1 className="projects-title">Coming Soon!</h1>
    </div>
    </div>
  );
};

export default Projects;
