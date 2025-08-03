import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

// Custom render function that includes Router context
const AllTheProviders = ({ children, initialEntries = ['/'] }: { children: React.ReactNode; initialEntries?: string[] }) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      {children}
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

// Custom render function for components that need BrowserRouter (for navigation testing)
export const renderWithBrowserRouter = (
  ui: React.ReactElement,
  options?: RenderOptions
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything from testing-library
export * from '@testing-library/react'; 