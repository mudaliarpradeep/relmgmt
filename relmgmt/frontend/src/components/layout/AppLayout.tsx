import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header onMenuToggle={toggleSidebar} />
        <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 bg-gray-50 overflow-auto" data-testid="main-content">
          {children}
        </main>
      </div>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AppLayout; 