import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ReactNode } from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthProvider, useAuth } from '../../hooks/useAuth';

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', async () => {
  const actual = await vi.importActual('../../hooks/useAuth');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

const mockedUseAuth = vi.mocked(useAuth);

// Test components
const ProtectedComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;

// Wrapper component for testing with routing and auth
const TestWrapper = ({ 
  children, 
  initialEntries = ['/protected'] 
}: { 
  children: ReactNode; 
  initialEntries?: string[] 
}) => (
  <MemoryRouter initialEntries={initialEntries}>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/protected" element={children} />
      </Routes>
    </AuthProvider>
  </MemoryRouter>
);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authenticated User', () => {
    beforeEach(() => {
      mockedUseAuth.mockReturnValue({
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        },
        token: 'valid-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        clearError: vi.fn(),
      });
    });

    it('should render protected content when user is authenticated', () => {
      // Act
      render(
        <TestWrapper>
          <ProtectedRoute>
            <ProtectedComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Assert
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('should render protected content with custom redirect path when authenticated', () => {
      // Act
      render(
        <TestWrapper>
          <ProtectedRoute redirectTo="/custom-login">
            <ProtectedComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Assert
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated User', () => {
    beforeEach(() => {
      mockedUseAuth.mockReturnValue({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        clearError: vi.fn(),
      });
    });

    it('should redirect to login when user is not authenticated', () => {
      // Act
      render(
        <TestWrapper>
          <ProtectedRoute>
            <ProtectedComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Assert
      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should redirect to custom path when user is not authenticated', () => {
      // Arrange
      const CustomLoginComponent = () => <div>Custom Login Page</div>;
      
      // Act
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider>
            <Routes>
              <Route path="/custom-login" element={<CustomLoginComponent />} />
              <Route 
                path="/protected" 
                element={
                  <ProtectedRoute redirectTo="/custom-login">
                    <ProtectedComponent />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      // Assert
      expect(screen.getByText('Custom Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should preserve intended location for redirect after login', () => {
      // Arrange
      const IntendedComponent = () => <div>Intended Page</div>;
      
      // Act
      render(
        <MemoryRouter initialEntries={['/intended-page']}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginComponent />} />
              <Route 
                path="/intended-page" 
                element={
                  <ProtectedRoute>
                    <IntendedComponent />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      // Assert
      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Intended Page')).not.toBeInTheDocument();
      
      // The state should be preserved for post-login redirect
      // This would be tested in integration tests with actual navigation
    });
  });

  describe('Loading State', () => {
    beforeEach(() => {
      mockedUseAuth.mockReturnValue({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        clearError: vi.fn(),
      });
    });

    it('should show loading indicator when authentication is loading', () => {
      // Act
      render(
        <TestWrapper>
          <ProtectedRoute>
            <ProtectedComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Assert
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('should show custom loading component when provided', () => {
      // Arrange
      const CustomLoader = () => <div>Custom Loading...</div>;

      // Act
      render(
        <TestWrapper>
          <ProtectedRoute loadingComponent={<CustomLoader />}>
            <ProtectedComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Assert
      expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    beforeEach(() => {
      mockedUseAuth.mockReturnValue({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Authentication failed',
        login: vi.fn(),
        logout: vi.fn(),
        clearError: vi.fn(),
      });
    });

    it('should redirect to login when there is an authentication error', () => {
      // Act
      render(
        <TestWrapper>
          <ProtectedRoute>
            <ProtectedComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Assert
      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Role-based Protection', () => {
    beforeEach(() => {
      mockedUseAuth.mockReturnValue({
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        },
        token: 'valid-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        clearError: vi.fn(),
      });
    });

    it('should render content when requiredRole is provided and user has access', () => {
      // Note: Since MVP has simplified auth with single user, role check always passes
      // This test is for future extensibility
      
      // Act
      render(
        <TestWrapper>
          <ProtectedRoute requiredRole="admin">
            <ProtectedComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Assert
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should render content when no requiredRole is specified', () => {
      // Act
      render(
        <TestWrapper>
          <ProtectedRoute>
            <ProtectedComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Assert
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});