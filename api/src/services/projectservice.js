/**
 * Project Service
 * Handles project-related API calls
 *
 * @module services/projectService
 */

import axios from "axios";

export const projectService = {
  /**
   * Get all projects with optional filters
   *
   * @param {Object} [params={}] - Query parameters for filtering
   * @param {string} [params.city] - Filter by city name
   * @param {string} [params.status] - Filter by status
   * @param {string} [params.featured] - Filter by featured flag ("true"/"false")
   * @returns {Promise<Object>} Project list
   */
  getProjects: async (params = {}) => {
    const response = await axios.get("/projects", { params });
    return response.data;
  },

  /**
   * Get a single project by ID or slug
   *
   * @param {string} id - Project ID or slug
   * @returns {Promise<Object>} Project details
   */
  getProject: async (id) => {
    const response = await axios.get(`/projects/${id}`);
    return response.data;
  },
};

export default projectService;
