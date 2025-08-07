import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import DashboardPage from '../../pages/dashboard/DashboardPage';
import LoginPage from '../../pages/auth/LoginPage';
import ProtectedRoute from '../auth/ProtectedRoute';
import ResourceListPage from '../../pages/resources/ResourceListPage';
import ResourceForm from '../../pages/resources/ResourceForm';
import ResourceDetailPage from '../../pages/resources/ResourceDetailPage';
import ReleaseListPage from '../../pages/releases/ReleaseListPage';
import ReleaseForm from '../../pages/releases/ReleaseForm';
import ReleaseDetailPage from '../../pages/releases/ReleaseDetailPage';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        
        {/* Resource Management */}
        <Route path="resources" element={<ResourceListPage />} />
        <Route path="resources/new" element={<ResourceForm />} />
        <Route path="resources/:id" element={<ResourceDetailPage />} />
        <Route path="resources/:id/edit" element={<ResourceForm />} />
        
        {/* Release Management */}
        <Route path="releases" element={<ReleaseListPage />} />
        <Route path="releases/new" element={<ReleaseForm />} />
        <Route path="releases/:id" element={<ReleaseDetailPage />} />
        <Route path="releases/:id/edit" element={<ReleaseForm />} />
        
        {/* Placeholder routes for future features */}
        <Route path="scope" element={<div className="p-6">Scope Management - Coming Soon</div>} />
      </Route>
    </Routes>
  );
};

export default AppRouter;