import { useQuery } from '@tanstack/react-query';
import api, { setSnackId } from '../services/api';

// Hook pour récupérer les ingrédients
export const useIngredients = (token, snackId) => {
  return useQuery({
    queryKey: ['ingredients', snackId],
    queryFn: async () => {
      if (!token || !snackId) return [];
      setSnackId(snackId);
      try {
        const response = await api.get('/api/ingredients', {
          headers: { 'X-Snack-ID': snackId.toString() }
        });
        return response.data || [];
      } catch (error) {
        // Si 403, l'utilisateur n'a pas accès (normal pour caissier)
        if (error.response?.status === 403) {
          return []; // Retourner un tableau vide silencieusement
        }
        throw error; // Propager les autres erreurs
      }
    },
    enabled: !!token && !!snackId && token !== 'SUPER_ADMIN',
    staleTime: 60000, // 1 minute
    retry: false, // Ne pas réessayer en cas d'erreur 403
  });
};










