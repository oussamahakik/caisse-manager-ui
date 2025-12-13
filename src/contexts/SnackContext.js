import React, { createContext, useContext, useState, useCallback } from 'react';

const SnackContext = createContext(null);

export const useSnack = () => {
  const context = useContext(SnackContext);
  if (!context) {
    throw new Error('useSnack must be used within a SnackProvider');
  }
  return context;
};

export const SnackProvider = ({ children }) => {
  const [restaurantName, setRestaurantName] = useState('Mon Snack');
  const [snackConfig, setSnackConfig] = useState(null);

  const updateRestaurantName = useCallback((name) => {
    setRestaurantName(name);
  }, []);

  const updateSnackConfig = useCallback((config) => {
    setSnackConfig(config);
  }, []);

  const value = {
    restaurantName,
    snackConfig,
    updateRestaurantName,
    updateSnackConfig,
  };

  return <SnackContext.Provider value={value}>{children}</SnackContext.Provider>;
};

export default SnackContext;




