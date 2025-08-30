import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [showReportsSubmenu, setShowReportsSubmenu] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isReportsActive = () => {
    return location.pathname.startsWith('/reports');
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/resources', label: 'Resource Management', icon: '👥' },
    { path: '/releases', label: 'Release Management', icon: '🚀' },
    { path: '/allocations', label: 'Allocation Management', icon: '⚖️' },
    { path: '/notifications', label: 'Notifications', icon: '🔔' },
  ];

  const reportItems = [
    { path: '/reports/allocation-conflicts', label: 'Allocation Conflicts', icon: '❗' },
    { path: '/reports/resource-utilization', label: 'Resource Utilization', icon: '📈' },
    { path: '/reports/release-timeline', label: 'Release Timeline', icon: '🗓️' },
  ];

  const handleReportsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowReportsSubmenu(!showReportsSubmenu);
  };

  const handleReportItemClick = () => {
    setShowReportsSubmenu(false);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        data-testid="sidebar"
        className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
        lg:relative lg:translate-x-0 lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Release Planner</h1>
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          <div className="px-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-lg transition-colors
                  ${isActive(item.path)
                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            {/* Reports Menu Item */}
            <div className="relative">
              <button
                onClick={handleReportsClick}
                className={`
                  w-full flex items-center justify-between px-4 py-3 mb-2 text-sm font-medium rounded-lg transition-colors
                  ${isReportsActive()
                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <div className="flex items-center">
                  <span className="mr-3 text-lg">📊</span>
                  <span>Reports</span>
                </div>
                <span className={`transform transition-transform duration-200 ${showReportsSubmenu ? 'rotate-90' : ''}`}>
                  ▶
                </span>
              </button>

              {/* Reports Submenu Overlay */}
              {showReportsSubmenu && (
                <div className="absolute left-full top-0 ml-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    {reportItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={handleReportItemClick}
                        className={`
                          flex items-center px-4 py-3 text-sm font-medium transition-colors
                          ${isActive(item.path)
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <span className="mr-3 text-lg">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Release Management System
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 