import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConflictsChart from './ConflictsChart';

describe('ConflictsChart', () => {
  it('shows loading state', () => {
    render(<ConflictsChart conflicts={[]} loading />);
    expect(screen.getByTestId('conflicts-chart-loading')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<ConflictsChart conflicts={[]} error="Failed" />);
    expect(screen.getByTestId('conflicts-chart-error')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<ConflictsChart conflicts={[]} />);
    expect(screen.getByTestId('conflicts-chart-empty')).toBeInTheDocument();
  });
});


