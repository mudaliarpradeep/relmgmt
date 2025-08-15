import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor, screen } from '../../test/test-utils';
import { renderWithRouter } from '../../test/test-utils';
import AllocationListPage from './AllocationListPage';
import { allocationService } from '../../services/api/v1/allocationService';

vi.mock('../../services/api/v1/allocationService', async () => {
  const actual = await vi.importActual<typeof import('../../services/api/v1/allocationService')>(
    '../../services/api/v1/allocationService'
  );
  return {
    ...actual,
    allocationService: {
      getAllocationConflicts: vi.fn(),
    },
  };
});

const mockedAllocationService = vi.mocked(allocationService);

describe('AllocationListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and shows "Allocation Management" and empty state', async () => {
    mockedAllocationService.getAllocationConflicts.mockResolvedValueOnce([]);

    renderWithRouter(<AllocationListPage />);

    await waitFor(() => {
      expect(screen.getByText('Allocation Management')).toBeInTheDocument();
      expect(screen.getByText('No conflicts found')).toBeInTheDocument();
    });
  });

  it('renders conflicts table when data returned', async () => {
    mockedAllocationService.getAllocationConflicts.mockResolvedValueOnce([
      {
        resourceId: 7,
        resourceName: 'John Doe',
        weeklyConflicts: [
          { weekStarting: '2025-01-06', totalAllocation: 6.0, maxAllocation: 4.5, overAllocation: 1.5 },
        ],
      },
    ]);

    renderWithRouter(<AllocationListPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('+1.5 days')).toBeInTheDocument();
      expect(screen.getByTestId('conflicts-chart')).toBeInTheDocument();
    });
  });

  it('shows error banner on failure', async () => {
    mockedAllocationService.getAllocationConflicts.mockRejectedValueOnce(new Error('boom'));

    renderWithRouter(<AllocationListPage />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load allocation conflicts')).toBeInTheDocument();
    });
  });
});


