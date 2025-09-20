import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CapacityChart from './CapacityChart';
import type { CapacityDatum } from '../../lib/capacityUtils';
import { getCapacityBarColor } from '../../lib/capacityUtils';

describe('CapacityChart', () => {
  it('renders without crashing and shows container', () => {
    const data: CapacityDatum[] = [
      { resourceName: 'John Doe', week: '2025-W01', allocated: 4.0, capacity: 4.5 },
      { resourceName: 'Jane Smith', week: '2025-W01', allocated: 5.2, capacity: 4.5 },
    ];

    render(<CapacityChart data={data} />);

    expect(screen.getByTestId('capacity-chart')).toBeInTheDocument();
  });

  it('applies color coding per PRD 4.4.2 (green=4.5, yellow<4.5, red>4.5)', () => {
    expect(getCapacityBarColor(4.5, 4.5)).toBe('#16a34a');
    expect(getCapacityBarColor(4.49, 4.5)).toBe('#f59e0b');
    expect(getCapacityBarColor(4.0, 4.5)).toBe('#f59e0b');
    expect(getCapacityBarColor(4.51, 4.5)).toBe('#ef4444');
    expect(getCapacityBarColor(5.0, 4.5)).toBe('#ef4444');
  });

  it('shows loading state', () => {
    render(<CapacityChart data={[]} loading />);
    expect(screen.getByTestId('capacity-chart-loading')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<CapacityChart data={[]} error="Failed to load" />);
    expect(screen.getByTestId('capacity-chart-error')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<CapacityChart data={[]} />);
    expect(screen.getByTestId('capacity-chart-empty')).toBeInTheDocument();
  });
});


