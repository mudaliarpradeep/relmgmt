import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { NotificationsProvider, useNotifications } from './useNotifications';
import NotificationService from '../services/api/v1/notificationService';
import { EventType } from '../services/api/sharedTypes';

vi.mock('../services/api/v1/notificationService');
const mockedService = vi.mocked(NotificationService);

const createWrapper = (pollMs?: number) =>
  ({ children }: { children: ReactNode }) => (
    <NotificationsProvider pollMs={pollMs}>{children}</NotificationsProvider>
  );

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedService.getNotifications.mockResolvedValue({
      content: [
        {
          id: 1,
          eventType: EventType.ALLOCATION_CONFLICT,
          message: 'Conflicting allocation',
          isRead: false,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      pageable: { pageNumber: 0, pageSize: 20, sort: { sorted: true, unsorted: false, empty: false }, offset: 0, paged: true, unpaged: false },
      totalElements: 1,
      totalPages: 1,
      last: true,
      size: 20,
      number: 0,
      sort: { sorted: true, unsorted: false, empty: false },
      numberOfElements: 1,
      first: true,
      empty: false,
    } as import('../services/api/sharedTypes').PaginatedResponse<import('../types').Notification>);
  });

  it('loads notifications on mount and computes unreadCount', async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper(0) });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('marks one notification as read and updates unreadCount', async () => {
    mockedService.markAsRead.mockResolvedValueOnce();
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper(0) });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAsRead(1);
    });

    expect(mockedService.markAsRead).toHaveBeenCalledWith(1);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications[0].isRead).toBe(true);
  });

  it('marks all as read', async () => {
    mockedService.markAllAsRead.mockResolvedValueOnce();
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper(0) });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(mockedService.markAllAsRead).toHaveBeenCalled();
    expect(result.current.unreadCount).toBe(0);
  });

  it('deletes a notification', async () => {
    mockedService.deleteNotification.mockResolvedValueOnce();
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper(0) });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteNotification(1);
    });

    expect(mockedService.deleteNotification).toHaveBeenCalledWith(1);
    expect(result.current.notifications).toHaveLength(0);
  });
});


