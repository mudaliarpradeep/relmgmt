/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { authService } from '../services/api/v1/authService';
import type { AuthState, LoginRequest, AuthUser } from '../types';

// Auth context actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: AuthUser; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: { error: string } }
  | { type: 'LOGOUT_START' }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'LOGOUT_FAILURE'; payload: { error: string } }
  | { type: 'INITIALIZE_START' }
  | { type: 'INITIALIZE_SUCCESS'; payload: { user: AuthUser; token: string } }
  | { type: 'INITIALIZE_FAILURE'; payload: { error: string } }
  | { type: 'CLEAR_ERROR' };

// Auth context value
interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'LOGOUT_START':
    case 'INITIALIZE_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOGIN_SUCCESS':
    case 'INITIALIZE_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGIN_FAILURE':
    case 'LOGOUT_FAILURE':
    case 'INITIALIZE_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case 'LOGOUT_SUCCESS':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Create auth context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state from stored token
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'INITIALIZE_START' });

      try {
        const storedToken = authService.getStoredToken();
        
        if (!storedToken || authService.isTokenExpired()) {
          // No token or expired token is not an error, just unauthenticated state
          dispatch({ type: 'LOGOUT_SUCCESS' });
          return;
        }

        // Get current user with the stored token
        const user = await authService.getCurrentUser();
        dispatch({ 
          type: 'INITIALIZE_SUCCESS', 
          payload: { user, token: storedToken } 
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Initialization failed';
        dispatch({ type: 'INITIALIZE_FAILURE', payload: { error: errorMessage } });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const loginResponse = await authService.login(credentials);
      const user = await authService.getCurrentUser();
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user, token: loginResponse.token } 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: { error: errorMessage } });
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    dispatch({ type: 'LOGOUT_START' });

    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT_SUCCESS' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      // Still clear auth state even if logout API call fails
      dispatch({ type: 'LOGOUT_SUCCESS' });
      // Set error but keep logged out state
      dispatch({ type: 'LOGOUT_FAILURE', payload: { error: errorMessage } });
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextValue = {
    ...state,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}