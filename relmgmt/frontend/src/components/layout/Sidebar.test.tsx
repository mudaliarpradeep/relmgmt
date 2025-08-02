import { render, screen } from '@testing-library/react';
import Sidebar from './Sidebar';

describe('Sidebar', () => {
  it('renders without crashing', () => {
    render(<Sidebar isOpen={false} />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders navigation element', () => {
    render(<Sidebar isOpen={false} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('applies correct classes when open', () => {
    render(<Sidebar isOpen={true} />);
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('translate-x-0');
  });

  it('applies correct classes when closed', () => {
    render(<Sidebar isOpen={false} />);
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('-translate-x-full');
  });
}); 