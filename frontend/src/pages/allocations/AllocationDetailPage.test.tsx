import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithRouter, waitFor, screen, within, act } from '../../test/test-utils';
import AllocationDetailPage from './AllocationDetailPage';
import releaseService from '../../services/api/v1/releaseService';
import { allocationService } from '../../services/api/v1/allocationService';
import { ScopeService } from '../../services/api/v1/scopeService';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ releaseId: '10' }),
  };
});

vi.mock('../../services/api/v1/releaseService');
vi.mock('../../services/api/v1/scopeService', async () => {
  return {
    ScopeService: {
      canGenerateAllocations: vi.fn(),
    },
  };
});
vi.mock('../../services/api/v1/allocationService', async () => {
  const actual = await vi.importActual<typeof import('../../services/api/v1/allocationService')>(
    '../../services/api/v1/allocationService'
  );
  return {
    ...actual,
    allocationService: {
      getAllocationsForRelease: vi.fn(),
      generateAllocation: vi.fn(),
    },
  };
});

const mockedReleaseService = vi.mocked(releaseService);
const mockedAllocationService = vi.mocked(allocationService);
const mockedScopeService = vi.mocked(ScopeService);

describe('AllocationDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays release info and allocations', async () => {
    mockedReleaseService.getRelease.mockResolvedValueOnce({
      id: 10,
      name: 'R25Q1 - Core Uplift',
      identifier: '2025-001',
      phases: [],
      blockers: [],
      createdAt: '',
      updatedAt: '',
    } as import('../../services/api/sharedTypes').Release);

    mockedAllocationService.getAllocationsForRelease.mockResolvedValueOnce([
      {
        id: 1,
        releaseId: 10,
        resourceId: 7,
        resourceName: 'John Doe',
        phase: 'BUILD',
        phaseDisplayName: 'Build',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        allocationFactor: 0.9,
        allocationDays: 18.0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ]);
    mockedScopeService.canGenerateAllocations.mockResolvedValueOnce(true);

    renderWithRouter(<AllocationDetailPage />, { initialEntries: ['/releases/10/allocations'] });

    await waitFor(() => {
      expect(screen.getByText(/Allocations for R25Q1 - Core Uplift/)).toBeInTheDocument();
      const tables = screen.getAllByRole('table');
      const detailTable = tables[tables.length - 1];
      expect(within(detailTable).getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('shows Capacity Load chart when allocations are present', async () => {
    mockedReleaseService.getRelease.mockResolvedValueOnce({
      id: 10,
      name: 'R25Q1 - Core Uplift',
      identifier: '2025-001',
      phases: [],
      blockers: [],
      createdAt: '',
      updatedAt: '',
    } as import('../../services/api/sharedTypes').Release);

    mockedAllocationService.getAllocationsForRelease.mockResolvedValueOnce([
      {
        id: 1,
        releaseId: 10,
        resourceId: 7,
        resourceName: 'John Doe',
        phase: 'BUILD',
        phaseDisplayName: 'Build',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        allocationFactor: 0.9,
        allocationDays: 18.0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 2,
        releaseId: 10,
        resourceId: 8,
        resourceName: 'Jane Smith',
        phase: 'TECHNICAL_DESIGN',
        phaseDisplayName: 'Technical Design',
        startDate: '2025-02-01',
        endDate: '2025-02-28',
        allocationFactor: 0.8,
        allocationDays: 16.0,
        createdAt: '2025-02-01T00:00:00Z',
        updatedAt: '2025-02-01T00:00:00Z',
      },
    ]);

    renderWithRouter(<AllocationDetailPage />, { initialEntries: ['/releases/10/allocations'] });

    await waitFor(() => {
      expect(screen.getByText(/Weekly Capacity Overview/)).toBeInTheDocument();
      expect(screen.getByTestId('weekly-capacity-chart')).toBeInTheDocument();
    });
  });

  it('generates allocations when button clicked', async () => {
    mockedReleaseService.getRelease.mockResolvedValue({
      id: 10,
      name: 'R25Q1 - Core Uplift',
      identifier: '2025-001',
      phases: [],
      blockers: [],
      createdAt: '',
      updatedAt: '',
    } as import('../../services/api/sharedTypes').Release);
    mockedAllocationService.getAllocationsForRelease.mockResolvedValueOnce([]);
    mockedAllocationService.generateAllocation.mockResolvedValueOnce();
    mockedScopeService.canGenerateAllocations.mockResolvedValueOnce(true);
    // After generate, reload returns one allocation
    mockedAllocationService.getAllocationsForRelease.mockResolvedValueOnce([
      {
        id: 2,
        releaseId: 10,
        resourceId: 8,
        resourceName: 'Jane Smith',
        phase: 'TECHNICAL_DESIGN',
        phaseDisplayName: 'Technical Design',
        startDate: '2025-02-01',
        endDate: '2025-02-28',
        allocationFactor: 0.8,
        allocationDays: 16.0,
        createdAt: '2025-02-01T00:00:00Z',
        updatedAt: '2025-02-01T00:00:00Z',
      },
    ]);

    renderWithRouter(<AllocationDetailPage />, { initialEntries: ['/releases/10/allocations'] });

    await waitFor(() => {
      expect(screen.getByText(/No allocations found/)).toBeInTheDocument();
    });

    const genBtn = screen.getAllByText(/Generate Allocations/)[0];
    
    await act(async () => {
      genBtn.click();
    });

    await waitFor(() => {
      expect(mockedAllocationService.generateAllocation).toHaveBeenCalledWith(10);
      expect(screen.getAllByText('Technical Design')[0]).toBeInTheDocument();
      const tables = screen.getAllByRole('table');
      const detailTable = tables[tables.length - 1];
      expect(within(detailTable).getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('shows error on load failure', async () => {
    mockedReleaseService.getRelease.mockRejectedValueOnce(new Error('fail'));
    mockedAllocationService.getAllocationsForRelease.mockRejectedValueOnce(new Error('fail'));

    renderWithRouter(<AllocationDetailPage />, { initialEntries: ['/releases/10/allocations'] });

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load release and allocation data')).toBeInTheDocument();
    });
  });

  it('disables generate button when no scope items exist', async () => {
    mockedReleaseService.getRelease.mockResolvedValue({
      id: 10,
      name: 'R25Q1 - Core Uplift',
      identifier: '2025-001',
      phases: [],
      blockers: [],
      createdAt: '',
      updatedAt: '',
    } as import('../../services/api/sharedTypes').Release);
    mockedAllocationService.getAllocationsForRelease.mockResolvedValueOnce([]);
    mockedScopeService.canGenerateAllocations.mockResolvedValueOnce(false);

    renderWithRouter(<AllocationDetailPage />, { initialEntries: ['/releases/10/allocations'] });

    await waitFor(() => {
      expect(screen.getByText(/No allocations found/)).toBeInTheDocument();
    });

    const genBtn = screen.getAllByText(/Generate Allocations/)[0];
    expect(genBtn).toBeDisabled();
    expect(screen.getAllByText(/Cannot generate allocations: No scope items with effort estimates found/)).toHaveLength(2);
  });

  it('handles invalid allocation data gracefully', async () => {
    mockedReleaseService.getRelease.mockResolvedValue({
      id: 10,
      name: 'R25Q1 - Core Uplift',
      identifier: '2025-001',
      phases: [],
      blockers: [],
      createdAt: '',
      updatedAt: '',
    } as import('../../services/api/sharedTypes').Release);
    // Mock the allocation service to return non-array data (simulating API error)
    mockedAllocationService.getAllocationsForRelease.mockResolvedValueOnce(null as unknown as import('../../services/api/v1/allocationService').Allocation[]);
    mockedScopeService.canGenerateAllocations.mockResolvedValueOnce(false);

    renderWithRouter(<AllocationDetailPage />, { initialEntries: ['/releases/10/allocations'] });

    await waitFor(() => {
      expect(screen.getByText(/Allocations for R25Q1 - Core Uplift/)).toBeInTheDocument();
      expect(screen.getByText(/0 allocations/)).toBeInTheDocument();
      expect(screen.getByText(/No allocations found/)).toBeInTheDocument();
    });
  });
});


