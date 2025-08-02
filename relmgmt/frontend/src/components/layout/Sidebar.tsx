import React from 'react';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <aside
      data-testid="sidebar"
      className={`fixed md:relative z-50 flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen py-4 px-2 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
      aria-label="Sidebar navigation"
    >
      <nav className="flex flex-col space-y-2 mt-4">
        <a href="#" className="text-blue-600 font-medium px-3 py-2 rounded-md bg-blue-50">Dashboard</a>
        <a href="#" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md">Resources</a>
        <a href="#" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md">Releases</a>
        <a href="#" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md">Projects</a>
        <a href="#" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md">Scope</a>
        <a href="#" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md">Allocation</a>
        <a href="#" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md">Reports</a>
        <a href="#" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md">Audit</a>
      </nav>
    </aside>
  );
};

export default Sidebar; 