import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from './authService';
import apiClient from '../apiClient';
import type { LoginRequest, LoginResponse, AuthUser } from '../sharedTypes';

// Mock the API client
vi.mock('../apiClient');
const mockedApiClient = vi.mocked(apiClient);

describe('AuthService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      // Arrange
      const mockNow = 1640995200000; // Fixed timestamp
      vi.spyOn(Date, 'now').mockReturnValue(mockNow);

      const loginRequest: LoginRequest = {
        username: 'admin',
        password: 'admin123'
      };

      const mockResponse: LoginResponse = {
        token: 'mock-jwt-token',
        expiresIn: 3600000,
        username: 'admin',
        email: 'admin@example.com'
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      });

      // Act
      const result = await authService.login(loginRequest);

      // Assert
      expect(mockedApiClient.post).toHaveBeenCalledWith('/v1/auth/login', loginRequest);
      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('authToken')).toBe('mock-jwt-token');
      expect(localStorage.getItem('tokenExpiry')).toBe(
        String(mockNow + mockResponse.expiresIn)
      );

      // Restore Date.now
      vi.restoreAllMocks();
    });

    it('should throw error for invalid credentials', async () => {
      // Arrange
      const loginRequest: LoginRequest = {
        username: 'invalid',
        password: 'invalid'
      };

      mockedApiClient.post.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { message: 'Invalid credentials' }
        }
      });

      // Act & Assert
      await expect(authService.login(loginRequest)).rejects.toThrow('Invalid credentials');
      expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('should handle network errors', async () => {
      // Arrange
      const loginRequest: LoginRequest = {
        username: 'admin',
        password: 'admin123'
      };

      mockedApiClient.post.mockRejectedValueOnce(new Error('Network Error'));

      // Act & Assert
      await expect(authService.login(loginRequest)).rejects.toThrow('Network Error');
      expect(localStorage.getItem('authToken')).toBeNull();
    });
  });

  describe('logout', () => {
    it('should logout successfully and clear stored data', async () => {
      // Arrange
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('tokenExpiry', String(Date.now() + 3600000));

      mockedApiClient.post.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      });

      // Act
      await authService.logout();

      // Assert
      expect(mockedApiClient.post).toHaveBeenCalledWith('/v1/auth/logout');
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('tokenExpiry')).toBeNull();
    });

    it('should clear stored data even if API call fails', async () => {
      // Arrange
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('tokenExpiry', String(Date.now() + 3600000));

      mockedApiClient.post.mockRejectedValueOnce(new Error('Network Error'));

      // Act
      await authService.logout();

      // Assert
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('tokenExpiry')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      // Arrange
      const mockUser: AuthUser = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      };

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockUser,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      });

      // Act
      const result = await authService.getCurrentUser();

      // Assert
      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/auth/me');
      expect(result).toEqual(mockUser);
    });

    it('should throw error when unauthorized', async () => {
      // Arrange
      mockedApiClient.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      });

      // Act & Assert
      await expect(authService.getCurrentUser()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getStoredToken', () => {
    it('should return stored token if not expired', () => {
      // Arrange
      const token = 'mock-token';
      const futureExpiry = Date.now() + 3600000; // 1 hour from now
      localStorage.setItem('authToken', token);
      localStorage.setItem('tokenExpiry', String(futureExpiry));

      // Act
      const result = authService.getStoredToken();

      // Assert
      expect(result).toBe(token);
    });

    it('should return null if token is expired', () => {
      // Arrange
      const token = 'mock-token';
      const pastExpiry = Date.now() - 3600000; // 1 hour ago
      localStorage.setItem('authToken', token);
      localStorage.setItem('tokenExpiry', String(pastExpiry));

      // Act
      const result = authService.getStoredToken();

      // Assert
      expect(result).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('tokenExpiry')).toBeNull();
    });

    it('should return null if no token stored', () => {
      // Act
      const result = authService.getStoredToken();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      // Arrange
      const futureExpiry = Date.now() + 3600000; // 1 hour from now
      localStorage.setItem('tokenExpiry', String(futureExpiry));

      // Act
      const result = authService.isTokenExpired();

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for expired token', () => {
      // Arrange
      const pastExpiry = Date.now() - 3600000; // 1 hour ago
      localStorage.setItem('tokenExpiry', String(pastExpiry));

      // Act
      const result = authService.isTokenExpired();

      // Assert
      expect(result).toBe(true);
    });

    it('should return true if no expiry stored', () => {
      // Act
      const result = authService.isTokenExpired();

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('clearAuthData', () => {
    it('should clear all authentication data from localStorage', () => {
      // Arrange
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('tokenExpiry', String(Date.now() + 3600000));

      // Act
      authService.clearAuthData();

      // Assert
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('tokenExpiry')).toBeNull();
    });
  });
});