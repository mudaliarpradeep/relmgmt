import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Header from './Header';

describe('Header', () => {
  const mockOnMenuToggle = vi.fn();

  it('renders without crashing', () => {
    render(<Header onMenuToggle={mockOnMenuToggle} />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders header element', () => {
    render(<Header onMenuToggle={mockOnMenuToggle} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders hamburger menu button on mobile', () => {
    render(<Header onMenuToggle={mockOnMenuToggle} />);
    expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
  });
}); 