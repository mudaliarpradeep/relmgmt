import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getLinkClasses = (path: string) => {
    const baseClasses = "px-3 py-2 rounded-md transition-colors";
    return isActive(path)
      ? `${baseClasses} text-blue-600 font-medium bg-blue-50`
      : `${baseClasses} text-gray-700 hover:bg-gray-100`;
  };

  return (
    <aside
      data-testid="sidebar"
      className={`fixed md:relative z-50 flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen py-4 px-2 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
      aria-label="Sidebar navigation"
    >
      <nav className="flex flex-col space-y-2 mt-4">
        <Link to="/dashboard" className={getLinkClasses('/dashboard')}>
          Dashboard
        </Link>
        <Link to="/resources" className={getLinkClasses('/resources')}>
          Resources
        </Link>
        <Link to="/releases" className={getLinkClasses('/releases')}>
          Releases
        </Link>
        <Link to="/projects" className={getLinkClasses('/projects')}>
          Projects
        </Link>
        <Link to="/scope" className={getLinkClasses('/scope')}>
          Scope
        </Link>
        <Link to="/allocations" className={getLinkClasses('/allocations')}>
          Allocation
        </Link>
        <Link to="/reports" className={getLinkClasses('/reports')}>
          Reports
        </Link>
        <Link to="/audit" className={getLinkClasses('/audit')}>
          Audit
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar; 