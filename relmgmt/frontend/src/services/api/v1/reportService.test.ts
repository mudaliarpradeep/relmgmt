import { describe, it, expect, vi, beforeEach } from 'vitest';
import reportService, { ReportType } from './reportService';
import apiClient from '../apiClient';
import type { AllocationConflictResponse } from './allocationService';

vi.mock('../apiClient');
const mockedApi = vi.mocked(apiClient);

describe('ReportService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getAllocationConflictsReport should fetch conflicts', async () => {
    const data: AllocationConflictResponse[] = [
      {
        resourceId: 7,
        resourceName: 'John Doe',
        weeklyConflicts: [
          { weekStarting: '2025-01-06', totalAllocation: 6.0, maxAllocation: 4.5, overAllocation: 1.5 },
        ],
      },
    ];
    mockedApi.get.mockResolvedValueOnce({ data } as any);

    const result = await reportService.getAllocationConflictsReport();
    expect(result).toEqual(data);
    expect(mockedApi.get).toHaveBeenCalledWith('/v1/reports/allocation-conflicts');
  });

  it('getResourceUtilizationReport should pass params', async () => {
    const mock = [{ resourceId: 1, weeks: [] }];
    mockedApi.get.mockResolvedValueOnce({ data: mock } as any);
    const params = { from: '2025-01-01', to: '2025-01-31' };
    const result = await reportService.getResourceUtilizationReport(params);
    expect(result).toEqual(mock);
    expect(mockedApi.get).toHaveBeenCalledWith('/v1/reports/resource-utilization?from=2025-01-01&to=2025-01-31');
  });

  it('exportReport should return Blob', async () => {
    const bytes = new Uint8Array([1, 2, 3]);
    mockedApi.get.mockResolvedValueOnce({ data: bytes } as any);
    const blob = await reportService.exportReport(ReportType.ALLOCATION_CONFLICTS, { year: '2025' });
    expect(blob).toBeInstanceOf(Blob);
    expect(mockedApi.get).toHaveBeenCalledWith('/v1/reports/export?type=ALLOCATION_CONFLICTS&year=2025', { responseType: 'blob' });
  });
});


