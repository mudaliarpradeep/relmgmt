import apiClient from '../apiClient';
import type {
  ScopeItem,
  ScopeItemRequest,
  EffortEstimate,
  EffortEstimateRequest,
  SkillFunctionEnum,
} from '../../../types';
import { getSkillFunctionEnumName, getPhaseEnumName } from '../../../types';

class ScopeService {
  async getScopeItems(
    projectId: number,
    params?: { page?: number; size?: number; sort?: string; direction?: 'asc' | 'desc' }
  ): Promise<{ content: ScopeItem[]; totalElements: number; totalPages: number }> {
    try {
      const search = new URLSearchParams();
      if (params?.page !== undefined) search.append('page', String(params.page));
      if (params?.size !== undefined) search.append('size', String(params.size));
      if (params?.sort) search.append('sort', params.sort);
      if (params?.direction) search.append('direction', params.direction);

      const response = await apiClient.get(`/v1/projects/${projectId}/scope?${search.toString()}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getAllScopeItems(projectId: number): Promise<ScopeItem[]> {
    try {
      const response = await apiClient.get<ScopeItem[]>(`/v1/projects/${projectId}/scope/all`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getScopeItem(id: number): Promise<ScopeItem> {
    try {
      const response = await apiClient.get<ScopeItem>(`/v1/scope/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async searchScopeItems(projectId: number, name: string): Promise<ScopeItem[]> {
    try {
      const response = await apiClient.get<ScopeItem[]>(
        `/v1/projects/${projectId}/scope/search?name=${encodeURIComponent(name)}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async createScopeItem(projectId: number, data: ScopeItemRequest): Promise<ScopeItem> {
    try {
      const response = await apiClient.post<ScopeItem>(`/v1/projects/${projectId}/scope`, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async updateScopeItem(id: number, data: ScopeItemRequest): Promise<ScopeItem> {
    try {
      const response = await apiClient.put<ScopeItem>(`/v1/scope/${id}`, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async deleteScopeItem(id: number): Promise<void> {
    try {
      await apiClient.delete(`/v1/scope/${id}`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async canDeleteScopeItem(id: number): Promise<boolean> {
    try {
      const response = await apiClient.get<boolean>(`/v1/scope/${id}/can-delete`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getEffortEstimates(scopeItemId: number): Promise<EffortEstimate[]> {
    try {
      const response = await apiClient.get<EffortEstimate[]>(`/v1/scope/${scopeItemId}/effort-estimates`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async addEffortEstimates(scopeItemId: number, data: EffortEstimateRequest[]): Promise<EffortEstimate[]> {
    try {
      // Convert display names to enum names for API parameters if needed in backend
      const payload = data.map((e) => ({
        ...e,
        skillFunction: getSkillFunctionEnumName(e.skillFunction),
        phase: getPhaseEnumName(e.phase),
      }));
      const response = await apiClient.post<EffortEstimate[]>(
        `/v1/scope/${scopeItemId}/effort-estimates`,
        payload
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getScopeItemsWithEffort(projectId: number): Promise<ScopeItem[]> {
    try {
      const response = await apiClient.get<ScopeItem[]>(
        `/v1/projects/${projectId}/scope/with-effort-estimates`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getScopeItemsWithoutEffort(projectId: number): Promise<ScopeItem[]> {
    try {
      const response = await apiClient.get<ScopeItem[]>(
        `/v1/projects/${projectId}/scope/without-effort-estimates`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getScopeByRelease(releaseId: number): Promise<ScopeItem[]> {
    try {
      const response = await apiClient.get<ScopeItem[]>(`/v1/releases/${releaseId}/scope`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getEffortByRelease(releaseId: number): Promise<EffortEstimate[]> {
    try {
      const response = await apiClient.get<EffortEstimate[]>(
        `/v1/releases/${releaseId}/effort-estimates`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async sumEffortBySkillFunction(scopeItemId: number, skillFunction: SkillFunctionEnum): Promise<number> {
    try {
      const response = await apiClient.get<number>(
        `/v1/scope/${scopeItemId}/effort-estimates/sum/skill-function/${getSkillFunctionEnumName(
          skillFunction
        )}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async sumEffortBySkillFunctionAndPhase(
    scopeItemId: number,
    skillFunction: SkillFunctionEnum,
    phase: string
  ): Promise<number> {
    try {
      const response = await apiClient.get<number>(
        `/v1/scope/${scopeItemId}/effort-estimates/sum/skill-function/${getSkillFunctionEnumName(
          skillFunction
        )}/phase/${getPhaseEnumName(phase)}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async sumEffortByReleaseAndSkillFunction(releaseId: number, skillFunction: SkillFunctionEnum): Promise<number> {
    try {
      const response = await apiClient.get<number>(
        `/v1/releases/${releaseId}/effort-estimates/sum/skill-function/${getSkillFunctionEnumName(
          skillFunction
        )}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: unknown): void {
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { status?: number; data?: { message?: string } } };
      const message = apiError.response?.data?.message;
      if (message) throw new Error(message);
      switch (apiError.response?.status) {
        case 404:
          throw new Error('Scope item not found');
        case 409:
          throw new Error('Conflict while processing scope');
        case 400:
          throw new Error('Invalid data provided');
        case 500:
          throw new Error('Internal server error. Please try again later.');
        default:
          throw new Error('An unexpected error occurred');
      }
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unknown error');
    }
  }
}

export default new ScopeService();


