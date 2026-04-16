import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../services/api';

const AuthContext = createContext(null);
const sanitizeSnackId = (value) => {
  if (value === null || value === undefined || value === '' || value === 'null' || value === 'undefined') {
    return null;
  }
  return value;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token');
    return storedToken && storedToken.trim() !== '' ? storedToken : null;
  });
  const [snackId, setSnackId] = useState(() => sanitizeSnackId(localStorage.getItem('snackId')));
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(() => {
    setToken(null);
    setSnackId(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('snackId');
    localStorage.removeItem('role');
  }, []);

  // Valider le token au démarrage
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken || storedToken.trim() === '') {
        clearAuth();
        setIsLoading(false);
        return;
      }

      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
        const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          clearAuth();
        }
      } catch (error) {
        console.log('Erreur de validation du token, on garde la session');
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [clearAuth]);

  const login = useCallback((receivedToken, receivedSnackId, receivedRole) => {
    if (!receivedToken || receivedToken.trim() === '') {
      toast.error('Token invalide');
      return;
    }

    setToken(receivedToken);
    const safeSnackId = sanitizeSnackId(receivedSnackId);
    setSnackId(safeSnackId);
    setRole(receivedRole);

    localStorage.setItem('token', receivedToken);
    if (safeSnackId) {
      localStorage.setItem('snackId', safeSnackId);
    } else {
      localStorage.removeItem('snackId');
    }
    localStorage.setItem('role', receivedRole);

    toast.success('Connexion réussie');
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    toast.success('Déconnexion réussie');
  }, [clearAuth]);

  const isAuthenticated = !!token;
  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'ROLE_SUPER_ADMIN';
  const isManager = role === 'MANAGER' || role === 'ROLE_MANAGER';

  const value = {
    token,
    snackId,
    role,
    isAuthenticated,
    isSuperAdmin,
    isManager,
    isLoading,
    login,
    logout,
    setSnackId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
