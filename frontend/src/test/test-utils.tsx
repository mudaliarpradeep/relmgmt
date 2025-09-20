import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';
import { NotificationsProvider } from '../hooks/useNotifications';

// Custom render function that includes Router context
// eslint-disable-next-line react-refresh/only-export-components
const AllTheProviders = ({ children, initialEntries = ['/'] }: { children: React.ReactNode; initialEntries?: string[] }) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="*" element={children} />
      </Routes>
    </MemoryRouter>
  );
};

// Custom render function for components that need Router context
export const renderWithRouter = (
  ui: React.ReactElement,
  { initialEntries = ['/'], ...renderOptions }: RenderOptions & { initialEntries?: string[] } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders initialEntries={initialEntries}>{children}</AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Custom render function for components that need AuthProvider context
export const renderWithAuth = (
  ui: React.ReactElement,
  { initialEntries = ['/'], ...renderOptions }: RenderOptions & { initialEntries?: string[] } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <NotificationsProvider>
          <Routes>
            <Route path="*" element={children} />
          </Routes>
        </NotificationsProvider>
      </AuthProvider>
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Custom render function for components that need BrowserRouter (for navigation testing)
export const renderWithBrowserRouter = (
  ui: React.ReactElement,
  options?: RenderOptions
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={children} />
      </Routes>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything from testing-library
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';