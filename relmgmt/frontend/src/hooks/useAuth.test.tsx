import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from './useAuth';
import { authService } from '../services/api/v1/authService';
import type { LoginRequest, LoginResponse, AuthUser } from '../types';

// Mock the auth service
vi.mock('../services/api/v1/authService');
const mockedAuthService = vi.mocked(authService);

// Helper wrapper component for testing hooks with context
const createWrapper = () => {
  return ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset all mocked methods
    mockedAuthService.getStoredToken.mockReturnValue(null);
    mockedAuthService.isTokenExpired.mockReturnValue(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should initialize with unauthenticated state when no token stored', () => {
      // Arrange
      mockedAuthService.getStoredToken.mockReturnValue(null);

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      // Assert
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should initialize with authenticated state when valid token is stored', async () => {
      // Arrange
      const mockToken = 'valid-token';
      const mockUser: AuthUser = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      };

      mockedAuthService.getStoredToken.mockReturnValue(mockToken);
      mockedAuthService.isTokenExpired.mockReturnValue(false);
      mockedAuthService.getCurrentUser.mockResolvedValue(mockUser);

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      // Wait for async initialization
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should handle initialization error gracefully', async () => {
      // Arrange
      const mockToken = 'valid-token';
      mockedAuthService.getStoredToken.mockReturnValue(mockToken);
      mockedAuthService.isTokenExpired.mockReturnValue(false);
      mockedAuthService.getCurrentUser.mockRejectedValue(new Error('Failed to get user'));

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      // Wait for async initialization
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Failed to get user');
    });
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      // Arrange
      const loginRequest: LoginRequest = {
        username: 'admin',
        password: 'Release2024!'
      };

      const mockLoginResponse: LoginResponse = {
        token: 'new-token',
        expiresIn: 3600000,
        username: 'admin',
        email: 'admin@example.com'
      };

      const mockUser: AuthUser = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      };

      mockedAuthService.login.mockResolvedValue(mockLoginResponse);
      mockedAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      // Act
      await act(async () => {
        await result.current.login(loginRequest);
      });

      // Assert
      expect(mockedAuthService.login).toHaveBeenCalledWith(loginRequest);
      expect(mockedAuthService.getCurrentUser).toHaveBeenCalled();
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockLoginResponse.token);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should handle login failure', async () => {
      // Arrange
      const loginRequest: LoginRequest = {
        username: 'invalid',
        password: 'invalid'
      };

      mockedAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      // Act
      await act(async () => {
        await result.current.login(loginRequest);
      });

      // Assert
      expect(mockedAuthService.login).toHaveBeenCalledWith(loginRequest);
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
    });

    it('should handle getCurrentUser failure after successful login', async () => {
      // Arrange
      const loginRequest: LoginRequest = {
        username: 'admin',
        password: 'Release2024!'
      };

      const mockLoginResponse: LoginResponse = {
        token: 'new-token',
        expiresIn: 3600000,
        username: 'admin',
        email: 'admin@example.com'
      };

      mockedAuthService.login.mockResolvedValue(mockLoginResponse);
      mockedAuthService.getCurrentUser.mockRejectedValue(new Error('Failed to get user'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      // Act
      await act(async () => {
        await result.current.login(loginRequest);
      });

      // Assert
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Failed to get user');
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      // Arrange
      const mockUser: AuthUser = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      };

      // Set up initial authenticated state
      mockedAuthService.getStoredToken.mockReturnValue('existing-token');
      mockedAuthService.isTokenExpired.mockReturnValue(false);
      mockedAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockedAuthService.logout.mockResolvedValue();

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Act
      await act(async () => {
        await result.current.logout();
      });

      // Assert
      expect(mockedAuthService.logout).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle logout failure', async () => {
      // Arrange
      const mockUser: AuthUser = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      };

      // Set up initial authenticated state
      mockedAuthService.getStoredToken.mockReturnValue('existing-token');
      mockedAuthService.isTokenExpired.mockReturnValue(false);
      mockedAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockedAuthService.logout.mockRejectedValue(new Error('Logout failed'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Act
      await act(async () => {
        await result.current.logout();
      });

      // Assert
      expect(mockedAuthService.logout).toHaveBeenCalled();
      // Should still clear auth state even if logout fails
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Logout failed');
    });
  });

  describe('Clear Error', () => {
    it('should clear error state', async () => {
      // Arrange
      const loginRequest: LoginRequest = {
        username: 'invalid',
        password: 'invalid'
      };

      mockedAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      // Set error state
      await act(async () => {
        await result.current.login(loginRequest);
      });

      expect(result.current.error).toBe('Invalid credentials');

      // Act
      act(() => {
        result.current.clearError();
      });

      // Assert
      expect(result.current.error).toBeNull();
    });
  });

  describe('Hook outside provider', () => {
    it('should throw error when useAuth is used outside AuthProvider', () => {
      // Arrange & Act & Assert
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });
  });
});