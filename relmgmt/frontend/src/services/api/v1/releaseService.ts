import apiClient from '../apiClient';
import type {
  Release,
  ReleaseRequest,
  ReleasePhase,
  ReleaseBlocker,
  PaginatedResponse
} from '../../../types';
import { getPhaseEnumName } from '../../../types';

/**
 * Release service for handling release CRUD operations
 */
class ReleaseService {
  /**
   * Get paginated list of releases
   */
  async getReleases(page = 0, size = 10): Promise<PaginatedResponse<Release>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Release>>(
        `/v1/releases?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get release by ID
   */
  async getRelease(id: number): Promise<Release> {
    try {
      const response = await apiClient.get<Release>(`/v1/releases/${id}`);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Create new release
   */
  async createRelease(releaseData: ReleaseRequest): Promise<Release> {
    try {
      // Transform frontend payload to backend DTO shape
      const backendPayload: {
        name: string;
        identifier?: string;
        status?: string;
        phases: Array<{ phaseType: string; startDate: string; endDate: string }>;
      } = {
        name: releaseData.name,
        identifier: releaseData.identifier || undefined,
        status: this.getStatusEnumName?.(releaseData.status) ?? undefined,
        phases: (releaseData.phases || []).map((phase) => ({
          phaseType: getPhaseEnumName(phase.name),
          startDate: phase.startDate,
          endDate: phase.endDate,
        })),
      };

      const response = await apiClient.post<Release>('/v1/releases', backendPayload);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  // Helper to map display status to enum name expected by backend
  private getStatusEnumName(display: string): string | undefined {
    switch (display) {
      case 'Planning':
        return 'PLANNING';
      case 'In Progress':
        return 'IN_PROGRESS';
      case 'Completed':
        return 'COMPLETED';
      case 'On Hold':
        return 'ON_HOLD';
      case 'Cancelled':
        return 'CANCELLED';
      default:
        return undefined;
    }
  }

  /**
   * Update existing release
   */
  async updateRelease(id: number, releaseData: ReleaseRequest): Promise<Release> {
    try {
      // Transform frontend payload to backend DTO shape
      const backendPayload: {
        name: string;
        identifier?: string;
        status?: string;
        phases: Array<{ phaseType: string; startDate: string; endDate: string }>;
      } = {
        name: releaseData.name,
        identifier: releaseData.identifier || undefined,
        status: this.getStatusEnumName?.(releaseData.status) ?? undefined,
        phases: (releaseData.phases || []).map((phase) => ({
          phaseType: getPhaseEnumName(phase.name),
          startDate: phase.startDate,
          endDate: phase.endDate,
        })),
      };

      const response = await apiClient.put<Release>(`/v1/releases/${id}`, backendPayload);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Delete release
   */
  async deleteRelease(id: number): Promise<void> {
    try {
      await apiClient.delete(`/v1/releases/${id}`);
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get release phases
   */
  async getReleasePhases(releaseId: number): Promise<ReleasePhase[]> {
    try {
      const response = await apiClient.get<ReleasePhase[]>(`/v1/releases/${releaseId}/phases`);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Update release phase
   */
  async updateReleasePhase(releaseId: number, phaseId: number, phaseData: Partial<ReleasePhase>): Promise<ReleasePhase> {
    try {
      const response = await apiClient.put<ReleasePhase>(`/v1/releases/${releaseId}/phases/${phaseId}`, phaseData);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get release blockers
   */
  async getReleaseBlockers(releaseId: number): Promise<ReleaseBlocker[]> {
    try {
      const response = await apiClient.get<ReleaseBlocker[]>(`/v1/releases/${releaseId}/blockers`);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Create release blocker
   */
  async createReleaseBlocker(releaseId: number, blockerData: Omit<ReleaseBlocker, 'id' | 'releaseId' | 'createdAt' | 'updatedAt'>): Promise<ReleaseBlocker> {
    try {
      const response = await apiClient.post<ReleaseBlocker>(`/v1/releases/${releaseId}/blockers`, blockerData);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Update release blocker
   */
  async updateReleaseBlocker(releaseId: number, blockerId: number, blockerData: Partial<ReleaseBlocker>): Promise<ReleaseBlocker> {
    try {
      const response = await apiClient.put<ReleaseBlocker>(`/v1/releases/${releaseId}/blockers/${blockerId}`, blockerData);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Delete release blocker
   */
  async deleteReleaseBlocker(releaseId: number, blockerId: number): Promise<void> {
    try {
      await apiClient.delete(`/v1/releases/${releaseId}/blockers/${blockerId}`);
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get active releases (releases with status Planning or In Progress)
   */
  async getActiveReleases(): Promise<Release[]> {
    try {
      const response = await apiClient.get<Release[]>('/v1/releases/active');
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get releases by status
   */
  async getReleasesByStatus(status: string): Promise<Release[]> {
    try {
      const response = await apiClient.get<Release[]>(`/v1/releases/status/${status}`);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get next release identifier
   */
  async getNextReleaseIdentifier(): Promise<string> {
    try {
      const response = await apiClient.get<string>('/v1/releases/next-identifier');
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown): void {
    if (error instanceof Error) {
      console.error('Release service error:', error.message);
    } else {
      console.error('Release service error:', error);
    }
  }
}

export default new ReleaseService(); 