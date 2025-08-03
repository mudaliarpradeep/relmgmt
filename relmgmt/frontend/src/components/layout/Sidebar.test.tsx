import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../test/test-utils';
import Sidebar from './Sidebar';

describe('Sidebar', () => {
  it('renders without crashing', () => {
    renderWithRouter(<Sidebar isOpen={false} />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders navigation element', () => {
    renderWithRouter(<Sidebar isOpen={false} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('applies correct classes when open', () => {
    renderWithRouter(<Sidebar isOpen={true} />);
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('translate-x-0');
  });

  it('applies correct classes when closed', () => {
    renderWithRouter(<Sidebar isOpen={false} />);
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('-translate-x-full');
  });
}); 