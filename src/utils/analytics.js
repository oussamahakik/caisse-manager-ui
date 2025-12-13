import { ENABLE_ANALYTICS } from '../config/api';

/**
 * Track un événement analytics
 * @param {string} eventName - Nom de l'événement
 * @param {Object} properties - Propriétés de l'événement
 */
export const trackEvent = (eventName, properties = {}) => {
  if (ENABLE_ANALYTICS && window.gtag) {
    window.gtag('event', eventName, properties);
  }
  // Log en développement
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', eventName, properties);
  }
};

/**
 * Track une page view
 * @param {string} path - Chemin de la page
 */
export const trackPageView = (path) => {
  if (ENABLE_ANALYTICS && window.gtag) {
    window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
      page_path: path,
    });
  }
  // Log en développement
  if (process.env.NODE_ENV === 'development') {
    console.log('Page View:', path);
  }
};

export default {
  trackEvent,
  trackPageView,
};






