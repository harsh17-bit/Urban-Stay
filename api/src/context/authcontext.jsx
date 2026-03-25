import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authservice';

const defaultAuthContext = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isAdmin: false,
  isSeller: false,
  register: async () => {
    throw new Error('AuthProvider is not available');
  },
  login: async () => {
    throw new Error('AuthProvider is not available');
  },
  logout: () => {},
  updateProfile: async () => {
    throw new Error('AuthProvider is not available');
  },
  toggleFavorite: async () => {
    throw new Error('AuthProvider is not available');
  },
  setError: () => {},
};

const AuthContext = createContext(defaultAuthContext);
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const readStoredUser = () => {
  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);

      if (token && savedUser) {
        try {
          // Verify token is still valid
          const response = await authService.getMe();
          setUser(response.user);
        } catch {
          // Token invalid - clear storage
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Keep auth state synchronized across all tabs/windows.
  useEffect(() => {
    const onStorageChange = (event) => {
      if (event.key && event.key !== TOKEN_KEY && event.key !== USER_KEY)
        return;

      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setUser(null);
        return;
      }

      const storedUser = readStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
    };

    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authService.login(credentials);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const updateProfile = async (data) => {
    try {
      setError(null);
      const response = await authService.updateProfile(data);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      throw err;
    }
  };

  const toggleFavorite = async (propertyId) => {
    try {
      const response = await authService.toggleFavorite(propertyId);
      // Update user favorites in state
      const updatedUser = await authService.getMe();
      setUser(updatedUser.user);
      return response;
    } catch (err) {
      throw new Error(
        err?.response?.data?.message || 'Failed to update favorites'
      );
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller' || user?.role === 'admin';

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn(
      'useAuth called outside AuthProvider. Falling back to defaults.'
    );
    return defaultAuthContext;
  }
  return context;
};
