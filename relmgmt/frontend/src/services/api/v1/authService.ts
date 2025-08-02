import apiClient from '../apiClient';
import type { LoginRequest, LoginResponse, AuthUser } from '../../../types';

/**
 * Authentication service for handling user login, logout, and token management
 */
class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly TOKEN_EXPIRY_KEY = 'tokenExpiry';

  /**
   * Login user with username and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/v1/auth/login', credentials);
      const loginData = response.data;

      // Store token and expiry in localStorage
      this.storeAuthData(loginData.token, loginData.expiresIn);

      return loginData;
    } catch (error: unknown) {
      // Handle API errors
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          throw new Error(apiError.response.data.message);
        }
      }
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/v1/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear stored auth data
      this.clearAuthData();
    }
  }

  /**
   * Get current authenticated user information
   */
  async getCurrentUser(): Promise<AuthUser> {
    try {
      const response = await apiClient.get<AuthUser>('/v1/auth/me');
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          throw new Error(apiError.response.data.message);
        }
      }
      throw error;
    }
  }

  /**
   * Get stored auth token if not expired
   */
  getStoredToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);

    if (!token || !expiry) {
      return null;
    }

    const expiryTime = parseInt(expiry, 10);
    if (Date.now() >= expiryTime) {
      // Token is expired, clear it
      this.clearAuthData();
      return null;
    }

    return token;
  }

  /**
   * Check if the stored token is expired
   */
  isTokenExpired(): boolean {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    
    if (!expiry) {
      return true;
    }

    const expiryTime = parseInt(expiry, 10);
    return Date.now() >= expiryTime;
  }

  /**
   * Clear all authentication data from localStorage
   */
  clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  /**
   * Store authentication data in localStorage
   */
  private storeAuthData(token: string, expiresIn: number): void {
    const expiryTime = Date.now() + expiresIn;
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, String(expiryTime));
  }
}

// Export singleton instance
export const authService = new AuthService();