import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AllocationConflicts from './AllocationConflicts';

describe('AllocationConflicts', () => {
  it('renders section title', () => {
    render(
      <BrowserRouter>
        <AllocationConflicts />
      </BrowserRouter>
    );
    expect(screen.getByText('Allocation Conflicts')).toBeInTheDocument();
  });

  it('renders at least one conflict item', () => {
    render(
      <BrowserRouter>
        <AllocationConflicts />
      </BrowserRouter>
    );
    expect(screen.getAllByTestId('conflict-item').length).toBeGreaterThan(0);
  });
}); 