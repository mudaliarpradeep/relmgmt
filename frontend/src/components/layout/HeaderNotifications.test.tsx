import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import Header from './Header';
import { NotificationsProvider } from '../../hooks/useNotifications';

vi.mock('../../hooks/useAuth', () => {
  return {
    useAuth: () => ({
      user: { id: 1, username: 'tester', email: 't@t.com', roles: ['ADMIN'] },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      logout: vi.fn(),
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('../../services/api/v1/notificationService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/api/v1/notificationService')>();
  return {
    __esModule: true,
    default: {
      ...actual.default,
      getNotifications: vi.fn().mockResolvedValue({ content: [], totalElements: 0, totalPages: 1, number: 0, size: 20 }),
      markAsRead: vi.fn().mockResolvedValue({}),
      markAllAsRead: vi.fn().mockResolvedValue({}),
      deleteNotification: vi.fn().mockResolvedValue({}),
    },
  };
});

const makeNotif = (id: number, overrides?: Partial<import('../../types').Notification>): import('../../types').Notification => ({
  id,
  eventType: 'Allocation Conflict' as import('../../types').EventType,
  message: `n${id}`,
  isRead: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  entityType: 'resource' as import('../../types').EntityType,
  entityId: id,
  ...overrides,
});

const renderHeader = (initialNotifications: import('../../types').Notification[]) => {
  return render(
    <MemoryRouter>
      <NotificationsProvider
        pollMs={0}
        initialNotifications={initialNotifications}
        initialLoading={false}
        initialError={null}
        disableInitialFetch
      >
        <Header onMenuClick={() => {}} />
      </NotificationsProvider>
    </MemoryRouter>
  );
};

describe('Header notifications preview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('marks a single notification as read and decrements the unread badge', async () => {
    renderHeader([makeNotif(1, { isRead: false }), makeNotif(2, { isRead: true })]);

    const bell = await screen.findByLabelText('Notifications');
    // Unread badge shows 1
    expect(screen.getByTestId('unread-badge').textContent).toBe('1');
    fireEvent.click(bell);

    const markReadButtons = await screen.findAllByRole('button', { name: /mark read/i });
    fireEvent.click(markReadButtons[0]);

    // Badge disappears when count hits zero (wait for state update)
    await waitFor(() => expect(screen.queryByTestId('unread-badge')).toBeNull());
  });

  it('marks all as read and clears the unread badge', async () => {
    renderHeader([makeNotif(1, { isRead: false }), makeNotif(2, { isRead: false })]);

    const bell = await screen.findByLabelText('Notifications');
    fireEvent.click(bell);
    const markAll = await screen.findByRole('button', { name: /mark all as read/i });
    fireEvent.click(markAll);

    // Badge disappears
    await waitFor(() => expect(screen.queryByTestId('unread-badge')).toBeNull());
  });
});


