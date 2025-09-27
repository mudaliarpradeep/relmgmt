import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationService from './notificationService';
import apiClient from '../apiClient';
import type { Notification, PaginatedResponse, NotificationFilters } from '../sharedTypes';
import { EventType } from '../sharedTypes';

vi.mock('../apiClient');
const mockedApiClient = vi.mocked(apiClient);

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockNotification = (id: number = 1): Notification => ({
    id,
    eventType: EventType.ALLOCATION_CONFLICT,
    message: 'Resource Alice is over-allocated in week 2025-01-06',
    isRead: false,
    createdAt: '2025-01-06T10:00:00Z',
  });

  const createMockPaginatedResponse = (items: Notification[]): PaginatedResponse<Notification> => ({
    content: items,
    pageable: {
      pageNumber: 0,
      pageSize: 20,
      sort: { sorted: true, unsorted: false, empty: false },
      offset: 0,
      paged: true,
      unpaged: false,
    },
    totalElements: items.length,
    totalPages: 1,
    last: true,
    size: 20,
    number: 0,
    sort: { sorted: true, unsorted: false, empty: false },
    numberOfElements: items.length,
    first: true,
    empty: items.length === 0,
  });

  describe('getNotifications', () => {
    it('fetches notifications without filters', async () => {
      const mock = createMockPaginatedResponse([createMockNotification()]);
      mockedApiClient.get.mockResolvedValueOnce({ data: mock });

      const result = await NotificationService.getNotifications();

      expect(result.content).toHaveLength(1);
      expect(result.content[0].message).toContain('over-allocated');
      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/notifications?');
    });

    it('applies filters and pagination', async () => {
      const mock = createMockPaginatedResponse([]);
      mockedApiClient.get.mockResolvedValueOnce({ data: mock });

      const filters: NotificationFilters = { eventType: EventType.BLOCKER_ADDED, isRead: false, page: 2, size: 10, sort: 'createdAt,desc' };
      const result = await NotificationService.getNotifications(filters);

      expect(result.totalElements).toBe(0);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/v1/notifications?eventType=BLOCKER_ADDED&isRead=false&page=2&size=10&sort=createdAt%2Cdesc'
      );
    });
  });

  describe('markAsRead', () => {
    it('marks a notification as read', async () => {
      mockedApiClient.put.mockResolvedValueOnce({ data: {} });
      await expect(NotificationService.markAsRead(1)).resolves.not.toThrow();
      expect(mockedApiClient.put).toHaveBeenCalledWith('/v1/notifications/1/read');
    });
  });

  describe('markAllAsRead', () => {
    it('marks all notifications as read', async () => {
      mockedApiClient.put.mockResolvedValueOnce({ data: {} });
      await expect(NotificationService.markAllAsRead()).resolves.not.toThrow();
      expect(mockedApiClient.put).toHaveBeenCalledWith('/v1/notifications/read-all');
    });
  });

  describe('deleteNotification', () => {
    it('deletes a notification', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({ data: {} });
      await expect(NotificationService.deleteNotification(5)).resolves.not.toThrow();
      expect(mockedApiClient.delete).toHaveBeenCalledWith('/v1/notifications/5');
    });
  });
});


