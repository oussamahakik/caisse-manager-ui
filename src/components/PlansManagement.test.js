import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import PlansManagement from './PlansManagement';
import api from '../services/api';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('PlansManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: [] });
    api.post.mockResolvedValue({ data: { id: 1 } });
  });

  test('envoie un payload valide à la création d’un plan', async () => {
    render(<PlansManagement token="token" />);

    await screen.findByText(/Aucun plan créé/i);
    fireEvent.click(screen.getAllByRole('button', { name: /Créer un plan/i })[0]);

    const dialog = screen.getByRole('dialog');
    const textboxes = within(dialog).getAllByRole('textbox');
    const numbers = within(dialog).getAllByRole('spinbutton');

    fireEvent.change(textboxes[0], { target: { value: 'Premium' } });
    fireEvent.change(numbers[0], { target: { value: '29.99' } });
    fireEvent.change(textboxes[1], { target: { value: 'Plan complet' } });
    fireEvent.change(numbers[1], { target: { value: '10' } });
    fireEvent.change(numbers[2], { target: { value: '25' } });

    fireEvent.click(within(dialog).getByRole('button', { name: /Enregistrer/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/plans', {
        nom: 'Premium',
        prixMensuel: 29.99,
        description: 'Plan complet',
        nombreRestaurantsMax: 10,
        nombreUtilisateursMax: 25,
        actif: true
      });
    });
  });
});
