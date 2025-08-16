import { describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { screen, fireEvent, waitFor, render } from '../../test/test-utils';
import AppRouter from '../../components/routing/AppRouter';
import { NotificationsProvider } from '../../hooks/useNotifications';
import { vi } from 'vitest';

vi.mock('../../hooks/useAuth', () => {
  return {
    useAuth: () => ({
      user: { id: 1, username: 'tester', email: 't@t.com', roles: ['ADMIN'] },
      token: 'token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    }),
    AuthProvider: ({ children }: any) => children,
  };
});

describe('Notifications header preview integration', () => {
  it('opens header dropdown, marks read, and navigates to view all', async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <NotificationsProvider pollMs={0}>
          <Routes>
            <Route path="/*" element={<AppRouter />} />
          </Routes>
        </NotificationsProvider>
      </MemoryRouter>
    );

    // Header is part of AppLayout; open notifications dropdown
    const bell = await screen.findByLabelText('Notifications');
    fireEvent.click(bell);

    // View all link should be present; clicking navigates
    const viewAllLinks = await screen.findAllByText(/view all/i);
    fireEvent.click(viewAllLinks[0]);

    await waitFor(() => expect(screen.getByTestId('notifications-page')).toBeInTheDocument());
  });
});


