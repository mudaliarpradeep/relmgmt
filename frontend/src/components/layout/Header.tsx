import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { unreadCount, notifications, markAsRead, markAllAsRead, loading: notifLoading, error: notifError } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200" data-testid="header">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo - hidden on mobile */}
        <div className="hidden lg:flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">Release Management System</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Notifications"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full" data-testid="unread-badge">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100 flex items-center justify-between">
                    <div className="font-medium">Notifications</div>
                    <Link to="/notifications" className="text-blue-600 hover:underline text-xs">View all</Link>
                  </div>
                  <div className="max-h-80 overflow-auto">
                    {notifLoading && (
                      <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
                    )}
                    {notifError && (
                      <div className="px-4 py-3 text-sm text-red-600">{notifError}</div>
                    )}
                    {!notifLoading && !notifError && notifications.length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500">No notifications</div>
                    )}
                    {!notifLoading && !notifError && notifications.length > 0 && (
                      <ul className="divide-y">
                        {notifications.slice(0, 5).map((n) => (
                          <li key={n.id} className="px-4 py-3 text-sm flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className={`truncate ${n.isRead ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>{n.message}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{new Date(n.createdAt).toLocaleString()}</div>
                            </div>
                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                              {!n.isRead && (
                                <button
                                  className="px-2 py-0.5 text-xs border rounded"
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAsRead(n.id); }}
                                >
                                  Mark read
                                </button>
                              )}
                              <Link
                                to={n.entityType && n.entityId ? `/${String(n.entityType).toLowerCase()}s/${n.entityId}` : '/notifications'}
                                className="text-blue-600 hover:underline text-xs"
                              >
                                Open
                              </Link>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-end">
                    <button
                      className="px-3 py-1 text-xs border rounded disabled:opacity-50"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAllAsRead(); }}
                      disabled={notifLoading || unreadCount === 0}
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-gray-900">{user?.username}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 