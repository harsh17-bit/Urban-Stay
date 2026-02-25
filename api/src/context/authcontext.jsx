import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authservice";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = sessionStorage.getItem("token");
            const savedUser = sessionStorage.getItem("user");

            if (token && savedUser) {
                try {
                    // Verify token is still valid
                    const response = await authService.getMe();
                    setUser(response.user);
                } catch {
                    // Token invalid - clear storage
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("user");
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);
    const register = async (userData) => {
        try {
            setError(null);
            const response = await authService.register(userData);
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
            throw err;
        }
    };

    const login = async (credentials) => {
        try {
            setError(null);
            const response = await authService.login(credentials);
            sessionStorage.setItem("token", response.token);
            sessionStorage.setItem("user", JSON.stringify(response.user));
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
            throw err;
        }
    };

    const logout = () => {
        authService.logout();
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setUser(null);
    };

    const updateProfile = async (data) => {
        try {
            setError(null);
            const response = await authService.updateProfile(data);
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.response?.data?.message || "Update failed");
            throw err;
        }
    };

    const toggleFavorite = async (propertyId) => {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await authService.toggleFavorite(propertyId);
            // Update user favorites in state
            const updatedUser = await authService.getMe();
            setUser(updatedUser.user);
            return response;
        } catch 
        {
            throw new Error("Failed to update favorites");
        }
    };

    const isAuthenticated = !!user;
    const isAdmin = user?.role === "admin";
    const isSeller = user?.role === "seller" || user?.role === "admin";

    const value = {
        user,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        isSeller,
        register,
        login,
        logout,
        updateProfile,
        toggleFavorite,
        setError,
    };

    console.log('AuthProvider rendering, loading:', loading);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;
