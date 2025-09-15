import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithAuth } from '../../test/test-utils';
import Header from './Header';

describe('Header', () => {
  const mockOnMenuToggle = vi.fn();

  it('renders without crashing', () => {
    renderWithAuth(<Header onMenuToggle={mockOnMenuToggle} />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders header element', () => {
    renderWithAuth(<Header onMenuToggle={mockOnMenuToggle} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders hamburger menu button on mobile', () => {
    renderWithAuth(<Header onMenuToggle={mockOnMenuToggle} />);
    expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
  });
}); 