/**
 * Utilitaires de validation
 */

/**
 * Valide un email
 * @param {string} email - Email à valider
 * @returns {boolean} True si valide
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un mot de passe (minimum 4 caractères)
 * @param {string} password - Mot de passe à valider
 * @returns {boolean} True si valide
 */
export const isValidPassword = (password) => {
  if (!password) return false;
  return password.length >= 4;
};

/**
 * Valide un montant
 * @param {number|string} amount - Montant à valider
 * @returns {boolean} True si valide
 */
export const isValidAmount = (amount) => {
  if (amount === null || amount === undefined || amount === '') return false;
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num >= 0;
};

/**
 * Valide un nombre positif
 * @param {number|string} number - Nombre à valider
 * @returns {boolean} True si valide
 */
export const isValidPositiveNumber = (number) => {
  if (number === null || number === undefined || number === '') return false;
  const num = typeof number === 'string' ? parseFloat(number) : number;
  return !isNaN(num) && num > 0;
};

/**
 * Valide un champ requis
 * @param {any} value - Valeur à valider
 * @returns {boolean} True si valide
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

const validators = {
  isValidEmail,
  isValidPassword,
  isValidAmount,
  isValidPositiveNumber,
  isRequired,
};

export default validators;






