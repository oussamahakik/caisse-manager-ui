import fr from './locales/fr.json';
import en from './locales/en.json';

const translations = {
  fr,
  en
};

let currentLanguage = localStorage.getItem('language') || 'fr';

export const setLanguage = (lang) => {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
  }
};

export const getLanguage = () => currentLanguage;

export const t = (key, params = {}) => {
  const keys = key.split('.');
  let value = translations[currentLanguage];
  
  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      return key; // Retourner la clé si la traduction n'existe pas
    }
  }
  
  // Remplacer les paramètres si présents
  if (typeof value === 'string' && params) {
    return Object.keys(params).reduce((str, param) => {
      return str.replace(`{{${param}}}`, params[param]);
    }, value);
  }
  
  return value || key;
};

const i18n = { setLanguage, getLanguage, t };
export default i18n;

