import { render, screen } from '@testing-library/react';
import StatCard from './StatCard';

describe('StatCard', () => {
  it('renders with title and value', () => {
    render(<StatCard title="Active Releases" value={4} color="blue" />);
    expect(screen.getByText('Active Releases')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('applies color styles', () => {
    const { container } = render(<StatCard title="Test" value={1} color="green" />);
    expect(container.firstChild).toHaveClass('bg-green-50');
  });
}); 