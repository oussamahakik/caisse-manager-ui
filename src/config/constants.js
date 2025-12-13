/**
 * Constantes de l'application
 */

// Rôles utilisateurs
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ROLE_SUPER_ADMIN: 'ROLE_SUPER_ADMIN',
  MANAGER: 'MANAGER',
  ROLE_MANAGER: 'ROLE_MANAGER',
  CAISSIER: 'CAISSIER',
  ROLE_CAISSIER: 'ROLE_CAISSIER',
};

// Types de paiement
export const PAYMENT_TYPES = {
  CARTE: 'CARTE',
  ESPECES: 'ESPECES',
  CHEQUE: 'CHEQUE',
};

// Statuts de commande
export const ORDER_STATUS = {
  EN_ATTENTE: 'EN_ATTENTE',
  EN_PREPARATION: 'EN_PREPARATION',
  PRETE: 'PRETE',
  SERVIE: 'SERVIE',
  ANNULEE: 'ANNULEE',
};

// Breakpoints responsive
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Durées d'animation (ms)
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 200,
  slow: 300,
};

// Limites de pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

export default {
  ROLES,
  PAYMENT_TYPES,
  ORDER_STATUS,
  BREAKPOINTS,
  ANIMATION_DURATION,
  PAGINATION,
};




