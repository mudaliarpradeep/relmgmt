import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
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

  it('renders Reports links', () => {
    renderWithRouter(<Sidebar isOpen={false} />);
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Allocation Conflicts')).toHaveAttribute('href', '/reports/allocation-conflicts');
    expect(screen.getByText('Resource Utilization')).toHaveAttribute('href', '/reports/resource-utilization');
    expect(screen.getByText('Release Timeline')).toHaveAttribute('href', '/reports/release-timeline');
  });

  it('navigates to Allocation Conflicts report when link is clicked', async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <div>
          <Sidebar isOpen={true} onClose={() => {}} />
          <Routes>
            <Route
              path="/reports/allocation-conflicts"
              element={<div data-testid="route-allocation-conflicts">Allocation Conflicts Route</div>}
            />
          </Routes>
        </div>
      </MemoryRouter>
    );

    await userEvent.click(screen.getByText('Allocation Conflicts'));
    expect(screen.getByTestId('route-allocation-conflicts')).toBeInTheDocument();
  });
}); 