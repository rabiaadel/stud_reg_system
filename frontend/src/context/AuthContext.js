// ============================================================================
// AuthContext — Global authentication state
// Provides: currentUser, token, role, login, logout, isAuthenticated
// Consumer: useAuth() hook
// ============================================================================

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        const decoded = jwtDecode(savedToken);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } else {
          // Token expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error('Failed to decode token:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login user
   * @param {string} token - JWT token from backend
   * @param {Object} userData - User object { id, email, role, name }
   */
  const login = useCallback((token, userData) => {
    setToken(token);
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setError(null);
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  /**
   * Update user profile
   */
  const updateUser = useCallback((updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  }, [user]);

  /**
   * Check if user has a permission
   */
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    // Permission check logic based on role
    // This would typically come from backend
    return true; // Replace with actual permission check
  }, [user]);

  /**
   * Check if user has a role
   */
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!user && !!token;

  const value = {
    // State
    user,
    token,
    loading,
    error,
    isAuthenticated,

    // User info shortcuts
    userId: user?.id,
    userEmail: user?.email,
    userRole: user?.role,
    userName: user?.name || user?.full_name,

    // Methods
    login,
    logout,
    updateUser,
    hasPermission,
    hasRole,

    // Role checks
    isAdmin: user?.role === 'admin',
    isDoctor: user?.role === 'doctor',
    isStudent: user?.role === 'student'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
