import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { setSnackId } from '../services/api';
import { toast } from 'sonner';

// Hook pour récupérer les produits
export const useProducts = (token, snackId) => {
  return useQuery({
    queryKey: ['products', snackId],
    queryFn: async () => {
      if (!token || !snackId) return [];
      setSnackId(snackId);
      const response = await api.get('/api/produits', {
        headers: { 'X-Snack-ID': snackId.toString() }
      });
      return response.data || [];
    },
    enabled: !!token && !!snackId && token !== 'SUPER_ADMIN',
    staleTime: 60000, // 1 minute - Augmenté pour réduire les requêtes
    cacheTime: 300000, // 5 minutes - Garder en cache plus longtemps
    refetchOnWindowFocus: false, // Désactivé pour améliorer les performances
    refetchOnMount: false, // Utiliser le cache si disponible
  });
};

// Hook pour récupérer les ingrédients
export const useIngredients = (token, snackId) => {
  return useQuery({
    queryKey: ['ingredients', snackId],
    queryFn: async () => {
      if (!token || !snackId) return [];
      setSnackId(snackId);
      const response = await api.get('/api/ingredients', {
        headers: { 'X-Snack-ID': snackId.toString() }
      });
      return response.data || [];
    },
    enabled: !!token && !!snackId && token !== 'SUPER_ADMIN',
    staleTime: 60000, // 1 minute
  });
};

// Hook pour créer une commande
export const useCreateOrder = (token, snackId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData) => {
      setSnackId(snackId);
      const response = await api.post('/api/commandes', orderData, {
        headers: { 'X-Snack-ID': snackId.toString() }
      });
      return response.data;
    },
    onSuccess: (data) => {
      const message = typeof data === 'string' ? data : 'Commande enregistrée avec succès';
      toast.success(message);
      // Invalider les queries liées aux commandes
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
    },
    onError: (error) => {
      // L'erreur est déjà gérée par l'intercepteur Axios
    },
  });
};

