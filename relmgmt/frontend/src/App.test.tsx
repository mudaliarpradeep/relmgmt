import { render } from '@testing-library/react';
import { AuthProvider } from './hooks/useAuth';
import App from './App';

describe('App', () => {
  it.skip('renders without crashing', () => {
    expect(() => {
      render(
        <AuthProvider>
          <App />
        </AuthProvider>
      );
    }).not.toThrow();
  });
}); 