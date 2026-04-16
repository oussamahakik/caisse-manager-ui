import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import UserManagement from './UserManagement';
import api, { setSnackId } from '../services/api';
import { toast } from 'sonner';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  },
  setSnackId: jest.fn()
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('UserManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('charge les utilisateurs avec le header snack', async () => {
    api.get.mockResolvedValue({
      data: [{ id: 1, username: 'cashier_1', role: 'ROLE_CAISSIER', actif: true }]
    });

    render(<UserManagement token="token" snackId={8} />);

    await waitFor(() => {
      expect(setSnackId).toHaveBeenCalledWith(8);
      expect(api.get).toHaveBeenCalledWith('/api/utilisateurs', {
        headers: { 'X-Snack-ID': '8' }
      });
    });

    expect(await screen.findByText('cashier_1')).toBeInTheDocument();
  });

  test('affiche le message d’erreur backend pendant la création utilisateur', async () => {
    api.get.mockResolvedValue({ data: [] });
    api.post.mockRejectedValue({
      response: { data: 'Ce nom d\'utilisateur existe déjà dans ce restaurant' }
    });

    render(<UserManagement token="token" snackId={5} />);
    await waitFor(() => expect(api.get).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /Nouvel Utilisateur/i }));
    fireEvent.change(screen.getByLabelText(/Nom d'utilisateur/i), { target: { value: 'cashier_dup' } });
    fireEvent.change(screen.getByLabelText(/^Mot de passe/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /^Créer$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Ce nom d\'utilisateur existe déjà dans ce restaurant');
    });
  });
});
