import { render, screen } from '@testing-library/react';
import QuickActions from './QuickActions';

describe('QuickActions', () => {
  it('renders section title', () => {
    render(<QuickActions />);
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('renders all action buttons', () => {
    render(<QuickActions />);
    expect(screen.getByText('Create New Release')).toBeInTheDocument();
    expect(screen.getByText('Import Resources')).toBeInTheDocument();
    expect(screen.getByText('View Conflicts')).toBeInTheDocument();
    expect(screen.getByText('Generate Reports')).toBeInTheDocument();
  });
}); 