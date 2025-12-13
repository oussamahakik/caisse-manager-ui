export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';
export const APP_NAME = process.env.REACT_APP_APP_NAME || 'CaisseManager';
export const APP_VERSION = process.env.REACT_APP_VERSION || '1.0.0';
export const APP_ENV = process.env.REACT_APP_ENV || 'development';
export const ENABLE_ANALYTICS = process.env.REACT_APP_ENABLE_ANALYTICS === 'true';

const config = {
  API_BASE_URL,
  APP_NAME,
  APP_VERSION,
  APP_ENV,
  ENABLE_ANALYTICS,
};

export default config;

