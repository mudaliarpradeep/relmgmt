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
import ScopeListPage from '../../pages/scope/ScopeListPage';
import ScopeItemForm from '../../pages/scope/ScopeItemForm';
import ScopeItemDetailPage from '../../pages/scope/ScopeItemDetailPage';
import AllocationListPage from '../../pages/allocations/AllocationListPage';
import AllocationDetailPage from '../../pages/allocations/AllocationDetailPage';
// import AllocationConflictsReportPage from '../../pages/reports/AllocationConflictsReportPage';
import ResourceUtilizationReportPage from '../../pages/reports/ResourceUtilizationReportPage';
import ReleaseTimelineReportPage from '../../pages/reports/ReleaseTimelineReportPage';
import NotificationListPage from '../../pages/notifications/NotificationListPage';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
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
        
        {/* Scope Item Management */}
        <Route path="releases/:releaseId/scope-items" element={<ScopeListPage />} />
        <Route path="releases/:releaseId/scope-items/new" element={<ScopeItemForm />} />
        <Route path="scope-items/:id" element={<ScopeItemDetailPage />} />
        <Route path="scope-items/:id/edit" element={<ScopeItemForm />} />
        
        {/* Allocation Management */}
        <Route path="allocations" element={<AllocationListPage />} />
        <Route path="releases/:releaseId/allocations" element={<AllocationDetailPage />} />
        
        {/* Reports */}
        {/* <Route path="reports/allocation-conflicts" element={<AllocationConflictsReportPage />} /> */}
        <Route path="reports/resource-utilization" element={<ResourceUtilizationReportPage />} />
        <Route path="reports/release-timeline" element={<ReleaseTimelineReportPage />} />

        {/* Notifications */}
        <Route path="notifications" element={<NotificationListPage />} />
        
        {/* Placeholder routes for future features */}
      </Route>
    </Routes>
  );
};

export default AppRouter;