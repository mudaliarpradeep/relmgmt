import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import NotificationService from '../services/api/v1/notificationService';
import type { Notification, NotificationFilters, PaginatedResponse } from '../services/api/sharedTypes';

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

interface NotificationsProviderProps {
  children: ReactNode;
  pollMs?: number;
  initialNotifications?: Notification[];
  initialLoading?: boolean;
  initialError?: string | null;
  disableInitialFetch?: boolean;
}

export function NotificationsProvider({ children, pollMs, initialNotifications, initialLoading, initialError, disableInitialFetch }: NotificationsProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications ?? []);
  const [loading, setLoading] = useState<boolean>(initialLoading ?? false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const pollRef = useRef<number | null>(null);
  const lastFiltersRef = useRef<NotificationFilters | undefined>(undefined);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const fetchNotifications = useCallback(async (filters?: NotificationFilters) => {
    setLoading(true);
    setError(null);
    try {
      const result: PaginatedResponse<Notification> = await NotificationService.getNotifications(filters);
      setNotifications(result.content);
      lastFiltersRef.current = filters;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load notifications';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    await NotificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await NotificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => (n.isRead ? n : { ...n, isRead: true, readAt: new Date().toISOString() })));
  }, []);

  const deleteNotification = useCallback(async (id: number) => {
    await NotificationService.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Initial load
  useEffect(() => {
    if (!disableInitialFetch) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disableInitialFetch]);

  // Polling (optional)
  useEffect(() => {
    if (!pollMs || pollMs <= 0) return;
    const start = () => {
      if (pollRef.current) return;
      pollRef.current = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchNotifications(lastFiltersRef.current);
        }
      }, pollMs);
    };
    const stop = () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    start();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') start();
      else stop();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchNotifications, pollMs]);

  const value: NotificationsContextValue = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider');
  return ctx;
}


