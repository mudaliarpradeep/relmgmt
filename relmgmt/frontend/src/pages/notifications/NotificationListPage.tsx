import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { EventType, type EventTypeEnum } from '../../types';

const NotificationListPage: React.FC = () => {
  const { notifications, loading, error, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [eventType, setEventType] = useState<EventTypeEnum | ''>('');
  const [isRead, setIsRead] = useState<string>('');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onFilter = () => {
    fetchNotifications({ eventType: eventType || undefined, isRead: isRead === '' ? undefined : isRead === 'true' });
  };

  return (
    <div className="p-4" data-testid="notifications-page">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded" onClick={markAllAsRead} disabled={loading}>
          Mark all as read
        </button>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <div>
          <label className="block text-sm text-gray-700">Event Type</label>
          <select className="border rounded px-2 py-1" value={eventType} onChange={(e) => setEventType(e.target.value as EventTypeEnum | '')}>
            <option value="">All</option>
            {Object.values(EventType).map((et) => (
              <option key={et} value={et}>{et}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Read</label>
          <select className="border rounded px-2 py-1" value={isRead} onChange={(e) => setIsRead(e.target.value)}>
            <option value="">All</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>
        </div>
        <button className="px-3 py-2 text-sm border rounded" onClick={onFilter} disabled={loading}>Apply</button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && notifications.length === 0 && <div>No notifications</div>}

      <ul className="divide-y">
        {notifications.map((n) => (
          <li key={n.id} className="py-3 flex items-start justify-between gap-3">
            <div>
              <div className="text-sm {n.isRead ? 'text-gray-500' : 'text-gray-900'}">{n.message}</div>
              <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              {!n.isRead && (
                <button className="px-2 py-1 text-xs border rounded" onClick={() => markAsRead(n.id)}>
                  Mark read
                </button>
              )}
              <button className="px-2 py-1 text-xs border rounded" onClick={() => deleteNotification(n.id)}>
                Dismiss
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationListPage;


