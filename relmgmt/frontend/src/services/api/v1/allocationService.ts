import { apiClient } from '../apiClient';

export interface Allocation {
  id: number;
  releaseId: number;
  resourceId: number;
  resourceName: string;
  phase: string;
  phaseDisplayName: string;
  startDate: string;
  endDate: string;
  allocationFactor: number;
  allocationDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface AllocationConflictResponse {
  resourceId: number;
  resourceName: string;
  weeklyConflicts: WeeklyConflict[];
}

export interface WeeklyConflict {
  weekStarting: string;
  totalAllocation: number;
  maxAllocation: number;
  overAllocation: number;
}

export interface AllocationRequest {
  releaseId: number;
}

class AllocationService {
  /**
   * Generate allocations for a release
   */
  async generateAllocation(releaseId: number): Promise<void> {
    await apiClient.post(`/v1/releases/${releaseId}/allocate`);
  }

  /**
   * Get all allocations for a release
   */
  async getAllocationsForRelease(releaseId: number): Promise<Allocation[]> {
    const response = await apiClient.get(`/v1/releases/${releaseId}/allocations`);
    return response.data;
  }

  /**
   * Get all allocations for a resource
   */
  async getAllocationsForResource(resourceId: number): Promise<Allocation[]> {
    const response = await apiClient.get(`/v1/resources/${resourceId}/allocations`);
    return response.data;
  }

  /**
   * Get allocation conflicts
   */
  async getAllocationConflicts(): Promise<AllocationConflictResponse[]> {
    const response = await apiClient.get('/v1/allocations/conflicts');
    return response.data;
  }
}

export const allocationService = new AllocationService();
