import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import DashboardPage from '../../pages/dashboard/DashboardPage';
import { LoginPage } from '../../pages/auth/LoginPage';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import ResourceListPage from '../../pages/resources/ResourceListPage';
import ResourceForm from '../../pages/resources/ResourceForm';
import ResourceDetailPage from '../../pages/resources/ResourceDetailPage';
import ReleaseListPage from '../../pages/releases/ReleaseListPage';
import ReleaseForm from '../../pages/releases/ReleaseForm';
import ReleaseDetailPage from '../../pages/releases/ReleaseDetailPage';
import ProjectListPage from '../../pages/projects/ProjectListPage';
import ScopeListPage from '../../pages/scope/ScopeListPage';
import ProjectForm from '../../pages/projects/ProjectForm';
import ProjectDetailPage from '../../pages/projects/ProjectDetailPage';
import ScopeItemForm from '../../pages/scope/ScopeItemForm';
import ScopeItemDetailPage from '../../pages/scope/ScopeItemDetailPage';
import EffortEstimationForm from '../../pages/scope/EffortEstimationForm';

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
        {/* Project & Scope Management */}
        <Route path="releases/:id/projects" element={<ProjectListPage />} />
        <Route path="releases/:releaseId/projects/new" element={<ProjectForm />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="projects/:id/edit" element={<ProjectForm />} />
        <Route path="projects/:id/scope" element={<ScopeListPage />} />
        <Route path="projects/:projectId/scope/new" element={<ScopeItemForm />} />
        <Route path="scope/:id" element={<ScopeItemDetailPage />} />
        <Route path="scope/:id/edit" element={<ScopeItemForm />} />
        <Route path="scope/:id/estimates/new" element={<EffortEstimationForm />} />
        
        {/* Placeholder routes for future features */}
      </Route>
    </Routes>
  );
};

export default AppRouter;