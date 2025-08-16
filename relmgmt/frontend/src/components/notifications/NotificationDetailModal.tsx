import React from 'react';
import type { Notification } from '../../types';

interface NotificationDetailModalProps {
  isOpen: boolean;
  notification: Notification | null;
  onClose: () => void;
  onMarkRead?: (id: number) => void;
  onDismiss?: (id: number) => void;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({ isOpen, notification, onClose, onMarkRead, onDismiss }) => {
  if (!isOpen || !notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-md shadow-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Notification Detail</h3>
          <button aria-label="Close" className="p-1 rounded hover:bg-gray-100" onClick={onClose}>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
          </button>
        </div>
        <div className="px-4 py-4 space-y-2">
          <div className="text-sm text-gray-500">Event</div>
          <div className="text-sm text-gray-900">{notification.eventType}</div>
          <div className="text-sm text-gray-500 mt-3">Message</div>
          <div className="text-sm text-gray-900 whitespace-pre-wrap break-words">{notification.message}</div>
          <div className="text-sm text-gray-500 mt-3">Timestamp</div>
          <div className="text-sm text-gray-900">{new Date(notification.createdAt).toLocaleString()}</div>
          {notification.entityType && notification.entityId && (
            <div className="mt-3">
              <a href={`/${String(notification.entityType).toLowerCase()}s/${notification.entityId}`} className="text-blue-600 hover:underline text-sm">Open related entity</a>
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
          {!notification.isRead && (
            <button className="px-3 py-1.5 text-sm border rounded" onClick={() => onMarkRead && onMarkRead(notification.id)}>Mark read</button>
          )}
          <button className="px-3 py-1.5 text-sm border rounded" onClick={() => onDismiss && onDismiss(notification.id)}>Dismiss</button>
          <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailModal;


