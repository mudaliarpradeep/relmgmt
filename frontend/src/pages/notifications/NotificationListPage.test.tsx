import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, act } from '../../test/test-utils';
import NotificationListPage from './NotificationListPage';
import { renderWithAuth } from '../../test/test-utils';
import NotificationService from '../../services/api/v1/notificationService';
import { EventType, type Notification } from '../../services/api/sharedTypes';

vi.mock('../../services/api/v1/notificationService');
const mockedService = vi.mocked(NotificationService);

const makeNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: overrides.id ?? 1,
  eventType: overrides.eventType ?? EventType.ALLOCATION_CONFLICT,
  message: overrides.message ?? 'Conflicting allocation detected',
  isRead: overrides.isRead ?? false,
  createdAt: overrides.createdAt ?? '2025-01-01T00:00:00.000Z',
});

const makePage = (content: Notification[] = []) => ({
  content,
  pageable: { pageNumber: 0, pageSize: 20, sort: { sorted: true, unsorted: false, empty: false }, offset: 0, paged: true, unpaged: false },
  totalElements: content.length,
  totalPages: 1,
  last: true,
  size: 20,
  number: 0,
  sort: { sorted: true, unsorted: false, empty: false },
  numberOfElements: content.length,
  first: true,
  empty: content.length === 0,
});

describe('NotificationListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when there are no notifications', async () => {
    mockedService.getNotifications.mockResolvedValueOnce(makePage([]) as import('../../services/api/sharedTypes').PaginatedResponse<import('../../types').Notification>);

    renderWithAuth(<NotificationListPage />);

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('loads and displays notifications with actions', async () => {
    mockedService.getNotifications.mockResolvedValueOnce(makePage([makeNotification({ id: 1 }), makeNotification({ id: 2, isRead: true, message: 'Read item' })]) as import('../../services/api/sharedTypes').PaginatedResponse<import('../../types').Notification>);
    mockedService.markAsRead.mockResolvedValue(undefined);
    mockedService.deleteNotification.mockResolvedValue(undefined);

    renderWithAuth(<NotificationListPage />);

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    // Two items rendered
    expect(screen.getByText('Conflicting allocation detected')).toBeInTheDocument();
    expect(screen.getByText('Read item')).toBeInTheDocument();

    // Mark one as read
    await act(async () => {
      await fireEvent.click(screen.getByRole('button', { name: /mark read/i }));
    });
    expect(mockedService.markAsRead).toHaveBeenCalledWith(1);

    // Dismiss a notification
    const dismissButtons = screen.getAllByRole('button', { name: /dismiss/i });
    await act(async () => {
      await fireEvent.click(dismissButtons[0]);
    });
    expect(mockedService.deleteNotification).toHaveBeenCalled();
  });

  it('applies filters when clicking Apply', async () => {
    mockedService.getNotifications
      .mockResolvedValueOnce(makePage([makeNotification()]) as import('../../services/api/sharedTypes').PaginatedResponse<import('../../types').Notification>) // initial load
      .mockResolvedValueOnce(makePage([]) as import('../../services/api/sharedTypes').PaginatedResponse<import('../../types').Notification>); // after filter

    renderWithAuth(<NotificationListPage />);

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    // Set filters
    fireEvent.change(screen.getByLabelText(/event type/i), { target: { value: EventType.BLOCKER_ADDED } });
    fireEvent.change(screen.getByLabelText(/^read$/i), { target: { value: 'true' } });

    await act(async () => {
      await fireEvent.click(screen.getByRole('button', { name: /apply/i }));
    });

    // Initial load + filter apply; some environments double-invoke effects in dev
    expect(mockedService.getNotifications.mock.calls.length).toBeGreaterThanOrEqual(2);
    const lastCall = mockedService.getNotifications.mock.calls.at(-1)!;
    expect(lastCall[0]).toMatchObject({ eventType: EventType.BLOCKER_ADDED, isRead: true });
  });

  it('marks all as read', async () => {
    mockedService.getNotifications.mockResolvedValueOnce(makePage([makeNotification({ id: 1 }), makeNotification({ id: 2 })]) as import('../../services/api/sharedTypes').PaginatedResponse<import('../../types').Notification>);
    mockedService.markAllAsRead.mockResolvedValue(undefined);

    renderWithAuth(<NotificationListPage />);

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    await act(async () => {
      await fireEvent.click(screen.getByRole('button', { name: /mark all as read/i }));
    });
    expect(mockedService.markAllAsRead).toHaveBeenCalled();
  });
});


