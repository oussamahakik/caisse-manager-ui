import { toast } from 'sonner';

/**
 * Gère les erreurs de manière centralisée
 */
export const handleError = (error, customMessage = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }

  if (customMessage) {
    toast.error(customMessage);
    return;
  }

  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        toast.error(data?.message || 'Requête invalide');
        break;
      case 401:
        toast.error('Session expirée. Veuillez vous reconnecter.');
        break;
      case 403:
        toast.error('Accès refusé');
        break;
      case 404:
        toast.error('Ressource introuvable');
        break;
      case 500:
        toast.error('Erreur serveur. Veuillez réessayer plus tard.');
        break;
      default:
        toast.error(data?.message || 'Une erreur est survenue');
    }
  } else if (error.request) {
    toast.error('Erreur de connexion. Vérifiez votre connexion internet.');
  } else {
    toast.error('Une erreur inattendue est survenue');
  }
};

/**
 * Retry logic avec exponential backoff
 */
export const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

