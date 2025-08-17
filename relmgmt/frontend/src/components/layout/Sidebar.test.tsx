import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import { renderWithRouter } from '../../test/test-utils';
import Sidebar from './Sidebar';

describe('Sidebar', () => {
  const mockOnClose = vi.fn();

  it('renders without crashing', () => {
    renderWithRouter(<Sidebar isOpen={false} onClose={mockOnClose} />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders navigation element', () => {
    renderWithRouter(<Sidebar isOpen={false} onClose={mockOnClose} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('applies correct classes when open', () => {
    renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('translate-x-0');
  });

  it('applies correct classes when closed', () => {
    renderWithRouter(<Sidebar isOpen={false} onClose={mockOnClose} />);
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('renders Reports button', () => {
    renderWithRouter(<Sidebar isOpen={false} onClose={mockOnClose} />);
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('shows reports submenu when Reports button is clicked', async () => {
    renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
    
    const reportsButton = screen.getByText('Reports').closest('button');
    expect(reportsButton).toBeInTheDocument();
    
    await userEvent.click(reportsButton!);
    
    expect(screen.getByText('Allocation Conflicts')).toBeInTheDocument();
    expect(screen.getByText('Resource Utilization')).toBeInTheDocument();
    expect(screen.getByText('Release Timeline')).toBeInTheDocument();
  });

  it('hides reports submenu when Reports button is clicked again', async () => {
    renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
    
    const reportsButton = screen.getByText('Reports').closest('button');
    expect(reportsButton).toBeInTheDocument();
    
    // First click to show submenu
    await userEvent.click(reportsButton!);
    expect(screen.getByText('Allocation Conflicts')).toBeInTheDocument();
    
    // Second click to hide submenu
    await userEvent.click(reportsButton!);
    expect(screen.queryByText('Allocation Conflicts')).not.toBeInTheDocument();
  });

  it('navigates to Allocation Conflicts report when link is clicked', async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <div>
          <Sidebar isOpen={true} onClose={mockOnClose} />
          <Routes>
            <Route
              path="/reports/allocation-conflicts"
              element={<div data-testid="route-allocation-conflicts">Allocation Conflicts Route</div>}
            />
          </Routes>
        </div>
      </MemoryRouter>
    );

    // Click Reports button to show submenu
    const reportsButton = screen.getByText('Reports').closest('button');
    await userEvent.click(reportsButton!);
    
    // Click Allocation Conflicts link
    await userEvent.click(screen.getByText('Allocation Conflicts'));
    expect(screen.getByTestId('route-allocation-conflicts')).toBeInTheDocument();
  });

  it('closes submenu when a report link is clicked', async () => {
    renderWithRouter(<Sidebar isOpen={true} onClose={mockOnClose} />);
    
    const reportsButton = screen.getByText('Reports').closest('button');
    await userEvent.click(reportsButton!);
    
    expect(screen.getByText('Allocation Conflicts')).toBeInTheDocument();
    
    await userEvent.click(screen.getByText('Allocation Conflicts'));
    
    expect(screen.queryByText('Allocation Conflicts')).not.toBeInTheDocument();
  });

  it('shows active state for Reports when on a reports page', () => {
    render(
      <MemoryRouter initialEntries={["/reports/allocation-conflicts"]}>
        <Sidebar isOpen={true} onClose={mockOnClose} />
      </MemoryRouter>
    );
    
    const reportsButton = screen.getByText('Reports').closest('button');
    expect(reportsButton).toHaveClass('bg-blue-100', 'text-blue-700');
  });
}); 