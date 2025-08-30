import React from 'react';
import { type Notification } from '../../services/api/sharedTypes';

interface NotificationDetailModalProps {
  isOpen: boolean;
  notification: Notification | null;
  onClose: () => void;
  onMarkRead?: (id: number) => void;
  onDismiss?: (id: number) => void;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  isOpen,
  notification,
  onClose,
  onMarkRead,
  onDismiss,
}) => {
  if (!isOpen || !notification) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" role="dialog">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Notification Detail</h2>
        </div>
        
        <div className="px-6 py-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Event Type</label>
              <p className="mt-1 text-sm text-gray-900">{notification.eventType}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <p className="mt-1 text-sm text-gray-900">{notification.message}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Created</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="mt-1 text-sm text-gray-900">
                {notification.isRead ? 'Read' : 'Unread'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <div className="flex space-x-2">
            {!notification.isRead && onMarkRead && (
              <button
                onClick={() => onMarkRead(notification.id)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Mark Read
              </button>
            )}
            {onDismiss && (
              <button
                onClick={() => onDismiss(notification.id)}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Dismiss
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailModal;
