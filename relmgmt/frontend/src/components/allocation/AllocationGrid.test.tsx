import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import AllocationGrid from './AllocationGrid';
import type { Allocation } from '../../services/api/v1/allocationService';

const makeAlloc = (overrides: Partial<Allocation>): Allocation => ({
  id: 1,
  releaseId: 10,
  resourceId: 7,
  resourceName: 'John Doe',
  phase: 'BUILD',
  phaseDisplayName: 'Build',
  startDate: '2025-01-06',
  endDate: '2025-01-10',
  allocationFactor: 1.0,
  allocationDays: 5.0,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('AllocationGrid', () => {
  it('renders weekly grid with resources as rows and weeks as columns', () => {
    const allocations: Allocation[] = [
      // John allocated week of 2025-01-06 (Mon-Fri) at 1.0 = 5.0 days
      makeAlloc({ resourceName: 'John Doe', startDate: '2025-01-06', endDate: '2025-01-10', allocationFactor: 1.0, id: 1, resourceId: 7 }),
      // Jane allocated week of 2025-01-13 at 0.5 = 2.5 days
      makeAlloc({ id: 2, resourceId: 8, resourceName: 'Jane Smith', startDate: '2025-01-13', endDate: '2025-01-17', allocationFactor: 0.5 }),
    ];

    render(<AllocationGrid allocations={allocations} />);

    const grid = screen.getByTestId('allocation-grid');
    expect(grid).toBeInTheDocument();

    // Expect week headers for 2025-01-06 and 2025-01-13
    const header = within(grid).getByTestId('allocation-grid-header');
    expect(header.querySelector('[data-week="2025-01-06"]')).toBeTruthy();
    expect(header.querySelector('[data-week="2025-01-13"]')).toBeTruthy();

    // Find John row and verify week allocations
    const johnRow = within(grid).getByTestId('row-John Doe');
    expect(within(johnRow).getByText('John Doe')).toBeInTheDocument();
    const johnW1 = johnRow.querySelector('[data-week="2025-01-06"]');
    const johnW2 = johnRow.querySelector('[data-week="2025-01-13"]');
    expect(johnW1?.textContent).toContain('5.0');
    expect(johnW2?.textContent).toContain('0.0');

    // Find Jane row and verify week allocations
    const janeRow = within(grid).getByTestId('row-Jane Smith');
    expect(within(janeRow).getByText('Jane Smith')).toBeInTheDocument();
    const janeW1 = janeRow.querySelector('[data-week="2025-01-06"]');
    const janeW2 = janeRow.querySelector('[data-week="2025-01-13"]');
    expect(janeW1?.textContent).toContain('0.0');
    expect(janeW2?.textContent).toContain('2.5');
  });

  it('handles non-array allocations gracefully', () => {
    // Test with null
    const { unmount: unmount1 } = render(<AllocationGrid allocations={null as any} />);
    expect(screen.getByTestId('allocation-grid')).toBeInTheDocument();
    unmount1();

    // Test with undefined
    const { unmount: unmount2 } = render(<AllocationGrid allocations={undefined as any} />);
    expect(screen.getByTestId('allocation-grid')).toBeInTheDocument();
    unmount2();

    // Test with non-array value
    const { unmount: unmount3 } = render(<AllocationGrid allocations={'invalid' as any} />);
    expect(screen.getByTestId('allocation-grid')).toBeInTheDocument();
    unmount3();
  });
});


