import apiClient from '../apiClient';
import type {
  PaginatedResponse,
  Project,
  ProjectRequest,
  ProjectTypeEnum,
} from '../../../types';

import { getProjectTypeEnumName } from '../../../types';

class ProjectService {
  async getProjects(
    releaseId: number,
    params?: { page?: number; size?: number; sort?: string; direction?: 'asc' | 'desc' }
  ): Promise<PaginatedResponse<Project> | { content: Project[]; totalElements: number; totalPages: number }> {
    try {
      const search = new URLSearchParams();
      if (params?.page !== undefined) search.append('page', String(params.page));
      if (params?.size !== undefined) search.append('size', String(params.size));
      if (params?.sort) search.append('sort', params.sort);
      if (params?.direction) search.append('direction', params.direction);

      const response = await apiClient.get(`/v1/releases/${releaseId}/projects?${search.toString()}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getAllProjects(releaseId: number): Promise<Project[]> {
    try {
      const response = await apiClient.get<Project[]>(`/v1/releases/${releaseId}/projects/all`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getProjectsByType(releaseId: number, type: ProjectTypeEnum): Promise<Project[]> {
    try {
      const response = await apiClient.get<Project[]>(
        `/v1/releases/${releaseId}/projects/type/${getProjectTypeEnumName(type)}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async searchProjects(releaseId: number, name: string): Promise<Project[]> {
    try {
      const response = await apiClient.get<Project[]>(
        `/v1/releases/${releaseId}/projects/search?name=${encodeURIComponent(name)}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getProject(id: number): Promise<Project> {
    try {
      const response = await apiClient.get<Project>(`/v1/projects/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async createProject(releaseId: number, data: ProjectRequest): Promise<Project> {
    try {
      const response = await apiClient.post<Project>(`/v1/releases/${releaseId}/projects`, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async updateProject(id: number, data: ProjectRequest): Promise<Project> {
    try {
      const response = await apiClient.put<Project>(`/v1/projects/${id}`, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async deleteProject(id: number): Promise<void> {
    try {
      await apiClient.delete(`/v1/projects/${id}`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async canDeleteProject(id: number): Promise<boolean> {
    try {
      const response = await apiClient.get<boolean>(`/v1/projects/${id}/can-delete`);
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
          throw new Error('Project not found');
        case 409:
          throw new Error('Conflict while processing project');
        case 400:
          throw new Error('Invalid project data provided');
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

export default new ProjectService();


