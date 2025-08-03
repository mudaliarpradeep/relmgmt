import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../../hooks/useAuth';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { LoginPage } from '../../pages/auth/LoginPage';
import DashboardPage from '../../pages/dashboard/DashboardPage';
import ResourceListPage from '../../pages/resources/ResourceListPage';
import ResourceForm from '../../pages/resources/ResourceForm';
import ResourceDetailPage from '../../pages/resources/ResourceDetailPage';
import AppLayout from '../layout/AppLayout';

/**
 * Main application router component
 * Handles all routing configuration with authentication protection
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes with Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Resource Management Routes */}
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ResourceListPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/resources/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ResourceForm />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/resources/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ResourceDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/resources/:id/edit"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ResourceForm />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Protected Routes - Future phases */}
          
          <Route
            path="/releases"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Release Management</h1>
                    <p className="text-gray-600 mt-2">Coming in Phase 5</p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
                    <p className="text-gray-600 mt-2">Coming in Phase 6</p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/scope"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Scope Management</h1>
                    <p className="text-gray-600 mt-2">Coming in Phase 6</p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/allocations"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Resource Allocation</h1>
                    <p className="text-gray-600 mt-2">Coming in Phase 7</p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                    <p className="text-gray-600 mt-2">Coming in Phase 8</p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600 mt-2">Coming in Phase 9</p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/audit"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
                    <p className="text-gray-600 mt-2">Coming in Phase 10</p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 route */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
                    <p className="text-gray-600 mt-2">The page you're looking for doesn't exist.</p>
                    <a 
                      href="/dashboard" 
                      className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                    >
                      Go back to Dashboard
                    </a>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}