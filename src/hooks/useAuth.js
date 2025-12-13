import { useAuth as useAuthContext } from '../contexts/AuthContext';

/**
 * Hook pour accéder au contexte d'authentification
 * @returns {Object} Contexte d'authentification
 */
export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;




