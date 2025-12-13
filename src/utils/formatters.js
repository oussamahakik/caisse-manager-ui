/**
 * Utilitaires de formatage
 */

/**
 * Formate un montant en euros
 * @param {number} amount - Montant à formater
 * @param {boolean} showSymbol - Afficher le symbole €
 * @returns {string} Montant formaté
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '0,00 €' : '0,00';
  }
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return showSymbol ? `${formatted} €` : formatted;
};

/**
 * Formate une date
 * @param {Date|string} date - Date à formater
 * @param {string} format - Format de date ('short' | 'long' | 'time')
 * @returns {string} Date formatée
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const options = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: '2-digit', month: 'long', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  };

  return new Intl.DateTimeFormat('fr-FR', options[format] || options.short).format(dateObj);
};

/**
 * Formate un nombre avec séparateurs
 * @param {number} number - Nombre à formater
 * @returns {string} Nombre formaté
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  return new Intl.NumberFormat('fr-FR').format(number);
};

/**
 * Tronque un texte avec ellipsis
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Texte tronqué
 */
export const truncate = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

const formatters = {
  formatCurrency,
  formatDate,
  formatNumber,
  truncate,
};

export default formatters;






