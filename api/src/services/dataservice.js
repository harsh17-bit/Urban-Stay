
import api from "./api";

// Payment Services
export const paymentService = {
    getMy: async () => {
        const response = await api.get("/payments/my");
        return response.data;
    },
};

// Inquiry Services
export const inquiryService = {
    create: async (data) => {
        const response = await api.post("/inquiries", data);
        return response.data;
    },

    getReceived: async (params = {}) => {
        const response = await api.get("/inquiries/received", { params });
        return response.data;
    },

    getSent: async (params = {}) => {
        const response = await api.get("/inquiries/sent", { params });
        return response.data;
    },

    getOne: async (id) => {
        const response = await api.get(`/inquiries/${id}`);
        return response.data;
    },

    respond: async (id, message) => {
        const response = await api.post(`/inquiries/${id}/respond`, { message });
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.put(`/inquiries/${id}/status`, { status });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/inquiries/${id}`);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get("/inquiries/stats");
        return response.data;
    },
};
// Review Services
export const reviewService = {
    createReview: async (data) => {
        const response = await api.post("/reviews", data);
        return response.data;
    },

    getPropertyReviews: async (propertyId, params = {}) => {
        const response = await api.get(`/reviews/property/${propertyId}`, { params });
        return response.data;
    },

    getMyReviews: async () => {
        const response = await api.get("/reviews/my");
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/reviews/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/reviews/${id}`);
        return response.data;
    },

    vote: async (id, isHelpful) => {
        const response = await api.put(`/reviews/${id}/vote`, { isHelpful });
        return response.data;
    },

    respond: async (id, message) => {
        const response = await api.post(`/reviews/${id}/respond`, { message });
        return response.data;
    },

    // Admin
    getPending: async () => {
        const response = await api.get("/reviews/pending");
        return response.data;
    },

    moderate: async (id, status, rejectionReason) => {
        const response = await api.put(`/reviews/${id}/moderate`, { status, rejectionReason });
        return response.data;
    },
};

// Alert Services
export const alertService = {
    create: async (data) => {
        const response = await api.post("/alerts", data);
        return response.data;
    },

    getAll: async () => {
        const response = await api.get("/alerts");
        return response.data;
    },

    getOne: async (id) => {
        const response = await api.get(`/alerts/${id}`);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/alerts/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/alerts/${id}`);
        return response.data;
    },

    toggle: async (id) => {
        const response = await api.put(`/alerts/${id}/toggle`);
        return response.data;
    },

    getMatches: async (id) => {
        const response = await api.get(`/alerts/${id}/matches`);
        return response.data;
    },
};


