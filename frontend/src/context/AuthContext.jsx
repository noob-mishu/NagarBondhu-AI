/**
 * ============================================================================
 *  AuthContext — Global Authentication State for NagarBondhu AI
 * ============================================================================
 *
 * This provides a React Context that wraps the entire app, making the
 * current user's data and auth functions (login, logout, register)
 * available to any component via the useAuth() hook.
 *
 * USAGE:
 *   import { useAuth } from '../context/AuthContext';
 *   const { user, login, logout } = useAuth();
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // On mount (or when token changes), fetch the user profile
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const userData = await api.getMyProfile();
          setUser(userData);
        } catch (error) {
          console.error('Failed to load user:', error.message);
          // Token is invalid — clear it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data);
    return data;
  };

  // Register function
  const register = async (userData) => {
    const data = await api.register(userData);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data);
    return data;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  // Update user data in context (after profile edit)
  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
