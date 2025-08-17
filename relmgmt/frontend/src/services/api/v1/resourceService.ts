import apiClient from '../apiClient';
import type { 
  Resource, 
  ResourceRequest, 
  ResourceFilters, 
  PaginatedResponse, 
  ResourceImportResponse 
} from '../../../types';
import { getStatusEnumName, getSkillFunctionEnumName, getSkillSubFunctionEnumName } from '../../../types';

/**
 * Resource service for handling resource CRUD operations, Excel import/export
 */
class ResourceService {
  /**
   * Get paginated list of resources with optional filters
   */
  async getResources(filters?: ResourceFilters): Promise<PaginatedResponse<Resource>> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.status) params.append('status', getStatusEnumName(filters.status));
        if (filters.skillFunction) params.append('skillFunction', getSkillFunctionEnumName(filters.skillFunction));
        if (filters.skillSubFunction) params.append('skillSubFunction', getSkillSubFunctionEnumName(filters.skillSubFunction));
        if (filters.page !== undefined) params.append('page', filters.page.toString());
        if (filters.size !== undefined) params.append('size', filters.size.toString());
        if (filters.sort) params.append('sort', filters.sort);
      }

      const response = await apiClient.get<PaginatedResponse<Resource>>(
        `/v1/resources?${params.toString()}`
      );
      
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get resource by ID
   */
  async getResource(id: number): Promise<Resource> {
    try {
      const response = await apiClient.get<Resource>(`/v1/resources/${id}`);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Create new resource
   */
  async createResource(resourceData: ResourceRequest): Promise<Resource> {
    try {
      const response = await apiClient.post<Resource>('/v1/resources', resourceData);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Update existing resource
   */
  async updateResource(id: number, resourceData: ResourceRequest): Promise<Resource> {
    try {
      const response = await apiClient.put<Resource>(`/v1/resources/${id}`, resourceData);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Delete resource
   * @throws Error if resource is allocated to active releases (409 Conflict)
   */
  async deleteResource(id: number): Promise<void> {
    try {
      await apiClient.delete(`/v1/resources/${id}`);
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Import resources from Excel file
   */
  async importResources(file: File): Promise<ResourceImportResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<ResourceImportResponse>(
        '/v1/resources/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Export resources to Excel file
   */
  async exportResources(): Promise<Blob> {
    try {
      const response = await apiClient.get('/v1/resources/export', {
        responseType: 'blob',
      });

      return new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Check if resource is allocated to any active release
   * This can be used by UI to show warning before attempting deletion
   */
  async checkResourceAllocation(id: number): Promise<boolean> {
    try {
      // This would be a custom endpoint to check allocation status
      // For now, we can catch the 409 error during delete attempt
      await this.deleteResource(id);
      return false; // Not allocated if delete succeeds
    } catch (error: unknown) {
      if (this.isConflictError(error)) {
        return true; // Allocated if we get 409 conflict
      }
      throw error; // Re-throw other errors
    }
  }

  /**
   * Handle API errors and convert them to meaningful error messages
   */
  private handleError(error: unknown): void {
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { 
        response?: { 
          status?: number;
          data?: { 
            message?: string;
            details?: string[];
          } 
        } 
      };
      
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
      
      // Handle specific status codes
      switch (apiError.response?.status) {
        case 404:
          throw new Error('Resource not found');
        case 409:
          throw new Error(
            apiError.response.data?.message || 
            'Cannot delete resource. Resource is allocated to active releases.'
          );
        case 400:
          throw new Error('Invalid resource data provided');
        case 500:
          throw new Error('Internal server error. Please try again later.');
        default:
          throw new Error('An unexpected error occurred');
      }
    }
  }

  /**
   * Check if error is a conflict error (409)
   */
  private isConflictError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { status?: number } };
      return apiError.response?.status === 409;
    }
    return false;
  }
}

// Export singleton instance
export default new ResourceService();