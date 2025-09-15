import apiClient from '../apiClient';
import type { Notification, NotificationFilters, PaginatedResponse } from '../sharedTypes';
import { getEventTypeEnumName } from '../sharedTypes';

const buildQuery = (filters?: NotificationFilters): string => {
  const params = new URLSearchParams();
  if (!filters) return '?';
  if (filters.eventType) params.set('eventType', getEventTypeEnumName(filters.eventType));
  if (typeof filters.isRead === 'boolean') params.set('isRead', String(filters.isRead));
  if (typeof filters.page === 'number') params.set('page', String(filters.page));
  if (typeof filters.size === 'number') params.set('size', String(filters.size));
  if (filters.sort) params.set('sort', filters.sort);
  const qs = params.toString();
  return `?${qs}`;
};

const NotificationService = {
  async getNotifications(filters?: NotificationFilters): Promise<PaginatedResponse<Notification>> {
    const query = buildQuery(filters);
    const { data } = await apiClient.get(`/v1/notifications${query}`);
    return data as PaginatedResponse<Notification>;
  },

  async markAsRead(id: number): Promise<void> {
    await apiClient.put(`/v1/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put(`/v1/notifications/read-all`);
  },

  async deleteNotification(id: number): Promise<void> {
    await apiClient.delete(`/v1/notifications/${id}`);
  },
};

export default NotificationService;


