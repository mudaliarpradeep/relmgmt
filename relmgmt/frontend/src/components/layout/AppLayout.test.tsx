import { screen } from '@testing-library/react';
import { renderWithAuth } from '../../test/test-utils';
import AppLayout from './AppLayout';

describe('AppLayout', () => {
  it('renders without crashing', () => {
    renderWithAuth(<AppLayout />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders Sidebar and Header', () => {
    renderWithAuth(<AppLayout />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders main content area', () => {
    renderWithAuth(<AppLayout />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
}); 