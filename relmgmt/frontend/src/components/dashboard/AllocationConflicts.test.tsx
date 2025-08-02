import { render, screen } from '@testing-library/react';
import AllocationConflicts from './AllocationConflicts';

describe('AllocationConflicts', () => {
  it('renders section title', () => {
    render(<AllocationConflicts />);
    expect(screen.getByText('Allocation Conflicts')).toBeInTheDocument();
  });

  it('renders at least one conflict item', () => {
    render(<AllocationConflicts />);
    expect(screen.getAllByTestId('conflict-item').length).toBeGreaterThan(0);
  });
}); 