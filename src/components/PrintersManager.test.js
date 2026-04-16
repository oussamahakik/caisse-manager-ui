import { render, screen, waitFor } from '@testing-library/react';
import PrintersManager from './PrintersManager';
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

describe('PrintersManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ne charge pas les imprimantes quand snackId est absent', async () => {
    render(<PrintersManager token="token" snackId={null} />);

    await waitFor(() => {
      expect(api.get).not.toHaveBeenCalled();
    });
  });

  test('charge et affiche les imprimantes du restaurant', async () => {
    api.get.mockResolvedValue({
      data: [{ id: 1, nom: 'HP Kitchen', type: 'USB', chemin: 'HP-USB', actif: true, typeTicket: 'COMMANDE' }]
    });

    render(<PrintersManager token="token" snackId={12} />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/imprimantes', {
        headers: { 'X-Snack-ID': '12' }
      });
    });

    expect(await screen.findByText('HP Kitchen')).toBeInTheDocument();
  });
});
