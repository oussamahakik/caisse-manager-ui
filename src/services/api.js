import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { toast } from 'sonner';

const isValidSnackId = (value) =>
  value !== null && value !== undefined && value !== '' && value !== 'null' && value !== 'undefined';

// Créer une instance Axios avec configuration de base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token et le snackId à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ajouter le header X-Snack-ID si disponible et non déjà défini
    const snackId = localStorage.getItem('snackId');
    if (isValidSnackId(snackId) && !config.headers['X-Snack-ID']) {
      config.headers['X-Snack-ID'] = snackId.toString();
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ne pas gérer les erreurs de login (route publique)
    if (error.config?.url?.includes('/api/auth/login')) {
      return Promise.reject(error);
    }

    if (error.response) {
      const { status, data } = error.response;
      
      // 401 Unauthorized - Déconnexion automatique
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('snackId');
        localStorage.removeItem('role');
        toast.error('Session expirée. Veuillez vous reconnecter.');
        window.location.href = '/';
        return Promise.reject(error);
      }
      
      // 403 Forbidden
      if (status === 403) {
        const errorMessage = data?.message || data?.error || 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        toast.error(errorMessage);
        return Promise.reject(error);
      }
      
      // 404 Not Found
      if (status === 404) {
        const errorMessage = data?.message || data?.error || 'Ressource non trouvée.';
        toast.error(errorMessage);
        return Promise.reject(error);
      }
      
      // 500 Server Error
      if (status >= 500) {
        // Vérifier si la réponse est du HTML (erreur Tomcat)
        const contentType = error.response.headers['content-type'] || '';
        if (contentType.includes('text/html')) {
          // Extraire le message d'erreur du HTML si possible
          let errorMessage = 'Erreur serveur interne.';
          if (typeof data === 'string' && data.includes('HTTP Status 500')) {
            errorMessage = 'Erreur serveur interne (500). Vérifiez les logs du serveur ou contactez l\'administrateur.';
          }
          toast.error(errorMessage);
        } else {
          // Réponse JSON normale
          const errorMessage = data?.message || data?.error || 'Erreur serveur. Veuillez réessayer plus tard.';
          toast.error(errorMessage);
        }
        return Promise.reject(error);
      }
      
      // Autres erreurs avec message personnalisé
      const errorMessage = data?.message || data?.error || 'Une erreur est survenue';
      toast.error(errorMessage);
    } else if (error.request) {
      // Erreur réseau
      toast.error('Erreur de connexion. Vérifiez votre connexion internet.');
    } else {
      // Erreur de configuration
      toast.error('Erreur de configuration. Contactez le support.');
    }
    
    return Promise.reject(error);
  }
);

// Fonction helper pour ajouter le header X-Snack-ID
export const setSnackId = (snackId) => {
  if (isValidSnackId(snackId)) {
    api.defaults.headers.common['X-Snack-ID'] = snackId.toString();
  } else {
    delete api.defaults.headers.common['X-Snack-ID'];
  }
};

export default api;
