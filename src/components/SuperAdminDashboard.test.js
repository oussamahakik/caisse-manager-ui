import { render, screen, waitFor } from '@testing-library/react';
import SuperAdminDashboard from './SuperAdminDashboard';
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

describe('SuperAdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === '/api/super-admin/snacks') return Promise.resolve({ data: [] });
      if (url === '/api/plans') return Promise.resolve({ data: [] });
      if (url === '/api/super-admin/users/count') return Promise.resolve({ data: { count: 5 } });
      if (url === '/api/logs') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
  });

  test('charge le compteur utilisateurs sans ouvrir l’onglet users', async () => {
    render(<SuperAdminDashboard token="token" onLogout={jest.fn()} />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/super-admin/users/count');
    });

    expect(screen.getByRole('button', { name: /Utilisateurs/i })).toBeInTheDocument();
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
  });
});
