import { describe, it, expect, vi, beforeEach } from 'vitest';
import { allocationService } from './allocationService';
import apiClient from '../apiClient';

vi.mock('../apiClient');
const mockedApiClient = vi.mocked(apiClient);

describe('AllocationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generateAllocation should POST to allocation endpoint', async () => {
    mockedApiClient.post.mockResolvedValueOnce({ status: 202, data: null } as any);

    await expect(allocationService.generateAllocation(42)).resolves.not.toThrow();
    expect(mockedApiClient.post).toHaveBeenCalledWith('/v1/releases/42/allocate');
  });

  it('getAllocationsForRelease should GET and return list', async () => {
    const mockAllocations = [
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
    ];
    mockedApiClient.get.mockResolvedValueOnce({ data: mockAllocations } as any);

    const result = await allocationService.getAllocationsForRelease(10);
    expect(result).toHaveLength(1);
    expect(result[0].resourceName).toBe('John Doe');
    expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/releases/10/allocations');
  });

  it('getAllocationsForResource should GET and return list', async () => {
    const mockAllocations = [
      {
        id: 2,
        releaseId: 11,
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
    ];
    mockedApiClient.get.mockResolvedValueOnce({ data: mockAllocations } as any);

    const result = await allocationService.getAllocationsForResource(8);
    expect(result).toHaveLength(1);
    expect(result[0].phase).toBe('TECHNICAL_DESIGN');
    expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/resources/8/allocations');
  });

  it('getAllocationConflicts should GET and return conflicts', async () => {
    const mockConflicts = [
      {
        resourceId: 7,
        resourceName: 'John Doe',
        weeklyConflicts: [
          { weekStarting: '2025-01-06', totalAllocation: 6.0, standardLoad: 4.5, overAllocation: 1.5 },
        ],
      },
    ];
    mockedApiClient.get.mockResolvedValueOnce({ data: mockConflicts } as any);

    const result = await allocationService.getAllocationConflicts();
    expect(result).toHaveLength(1);
    expect(result[0].weeklyConflicts[0].overAllocation).toBe(1.5);
    expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/allocations/conflicts');
  });

  it('getWeeklyAllocations should GET and return weekly allocation matrix', async () => {
    const mockMatrix = {
      resources: [
        {
          id: '1',
          name: 'John Doe',
          grade: 'Senior',
          skillFunction: 'Engineering',
          skillSubFunction: 'Frontend',
          profileUrl: '/resources/1',
          weeklyAllocations: [
            {
              weekStart: '2024-09-01',
              personDays: 4.5,
              projectName: 'Project Alpha',
              projectId: '1'
            }
          ]
        }
      ],
      currentWeekStart: '2024-09-01',
      timeWindow: {
        startWeek: '2024-08-04',
        endWeek: '2024-10-27',
        totalWeeks: 29
      }
    };
    mockedApiClient.get.mockResolvedValueOnce({ data: mockMatrix } as any);

    const result = await allocationService.getWeeklyAllocations('2024-09-01');
    expect(result.resources).toHaveLength(1);
    expect(result.resources[0].name).toBe('John Doe');
    expect(result.timeWindow.totalWeeks).toBe(29);
    expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/allocations/weekly', {
      params: { currentWeekStart: '2024-09-01' }
    });
  });

  it('updateWeeklyAllocation should PUT to update endpoint', async () => {
    mockedApiClient.put.mockResolvedValueOnce({ status: 200, data: null } as any);

    await expect(allocationService.updateWeeklyAllocation('1', '2024-09-01', 4.5)).resolves.not.toThrow();
    expect(mockedApiClient.put).toHaveBeenCalledWith('/v1/allocations/weekly/1/2024-09-01', null, {
      params: { personDays: 4.5 }
    });
  });

  it('getResourceProfile should GET and return resource profile', async () => {
    const mockProfile = {
      id: '1',
      name: 'John Doe',
      grade: 'Senior',
      skillFunction: 'Engineering',
      skillSubFunction: 'Frontend',
      profileUrl: '/resources/1'
    };
    mockedApiClient.get.mockResolvedValueOnce({ data: mockProfile } as any);

    const result = await allocationService.getResourceProfile('1');
    expect(result.name).toBe('John Doe');
    expect(result.grade).toBe('Senior');
    expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/resources/1/profile');
  });

  it('should propagate API errors', async () => {
    mockedApiClient.get.mockRejectedValueOnce(new Error('Network error'));
    await expect(allocationService.getAllocationsForRelease(99)).rejects.toThrow('Network error');
  });
});


