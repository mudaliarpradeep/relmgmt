import { apiClient } from '../apiClient';
import { 
  Component, 
  ComponentRequest, 
  ComponentResponse, 
  ComponentTypeEnum,
  ComponentType,
  PaginatedResponse 
} from '../../../types';

/**
 * Service for managing components within scope items
 */
export class ComponentService {
  private static readonly BASE_URL = '/components';
  private static readonly SCOPE_ITEMS_URL = '/scope-items';

  /**
   * Get all components for a scope item
   */
  static async getComponentsByScopeItemId(scopeItemId: number): Promise<ComponentResponse[]> {
    const response = await apiClient.get<ComponentResponse[]>(
      `${this.SCOPE_ITEMS_URL}/${scopeItemId}/components`
    );
    return response.data;
  }

  /**
   * Get a component by ID
   */
  static async getComponent(id: number): Promise<ComponentResponse> {
    const response = await apiClient.get<ComponentResponse>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create a new component for a scope item
   */
  static async createComponent(scopeItemId: number, component: ComponentRequest): Promise<ComponentResponse> {
    const response = await apiClient.post<ComponentResponse>(
      `${this.SCOPE_ITEMS_URL}/${scopeItemId}/components`,
      component
    );
    return response.data;
  }

  /**
   * Update an existing component
   */
  static async updateComponent(id: number, component: ComponentRequest): Promise<ComponentResponse> {
    const response = await apiClient.put<ComponentResponse>(`${this.BASE_URL}/${id}`, component);
    return response.data;
  }

  /**
   * Delete a component
   */
  static async deleteComponent(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${id}`);
  }

  /**
   * Get components by component type
   */
  static async getComponentsByType(componentType: ComponentTypeEnum): Promise<ComponentResponse[]> {
    const response = await apiClient.get<ComponentResponse[]>(
      `${this.BASE_URL}/type/${componentType}`
    );
    return response.data;
  }

  /**
   * Get components by scope item ID and component type
   */
  static async getComponentsByScopeItemAndType(
    scopeItemId: number, 
    componentType: ComponentTypeEnum
  ): Promise<ComponentResponse[]> {
    const response = await apiClient.get<ComponentResponse[]>(
      `${this.SCOPE_ITEMS_URL}/${scopeItemId}/components/type/${componentType}`
    );
    return response.data;
  }

  /**
   * Count components by scope item ID
   */
  static async countComponentsByScopeItemId(scopeItemId: number): Promise<number> {
    const response = await apiClient.get<number>(
      `${this.SCOPE_ITEMS_URL}/${scopeItemId}/components/count`
    );
    return response.data;
  }

  /**
   * Check if a component can be deleted
   */
  static async canDeleteComponent(id: number): Promise<boolean> {
    const response = await apiClient.get<boolean>(`${this.BASE_URL}/${id}/can-delete`);
    return response.data;
  }

  /**
   * Get components by release ID
   */
  static async getComponentsByReleaseId(releaseId: number): Promise<ComponentResponse[]> {
    const response = await apiClient.get<ComponentResponse[]>(
      `/releases/${releaseId}/components`
    );
    return response.data;
  }

  /**
   * Get components by release ID with effort estimates
   */
  static async getComponentsByReleaseIdWithEffortEstimates(releaseId: number): Promise<ComponentResponse[]> {
    const response = await apiClient.get<ComponentResponse[]>(
      `/releases/${releaseId}/components/with-effort-estimates`
    );
    return response.data;
  }

  /**
   * Get all components with pagination
   */
  static async getComponentsPaginated(
    page: number = 0,
    size: number = 20,
    sort?: string
  ): Promise<PaginatedResponse<ComponentResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    
    if (sort) {
      params.append('sort', sort);
    }

    const response = await apiClient.get<PaginatedResponse<ComponentResponse>>(
      `${this.BASE_URL}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Search components by name
   */
  static async searchComponentsByName(name: string): Promise<ComponentResponse[]> {
    const response = await apiClient.get<ComponentResponse[]>(
      `${this.BASE_URL}/search?name=${encodeURIComponent(name)}`
    );
    return response.data;
  }

  /**
   * Get component types (enum values)
   */
  static getComponentTypes(): { value: ComponentTypeEnum; label: string }[] {
    return [
      { value: ComponentType.ETL as ComponentTypeEnum, label: 'ETL' },
      { value: ComponentType.FORGEROCK_IGA as ComponentTypeEnum, label: 'ForgeRock IGA' },
      { value: ComponentType.FORGEROCK_UI as ComponentTypeEnum, label: 'ForgeRock UI' },
      { value: ComponentType.FORGEROCK_IG as ComponentTypeEnum, label: 'ForgeRock IG' },
      { value: ComponentType.FORGEROCK_IDM as ComponentTypeEnum, label: 'ForgeRock IDM' },
      { value: ComponentType.SAILPOINT as ComponentTypeEnum, label: 'SailPoint' },
      { value: ComponentType.FUNCTIONAL_TEST as ComponentTypeEnum, label: 'Functional Test' }
    ];
  }

  /**
   * Validate component data
   */
  static validateComponent(component: ComponentRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!component.name || component.name.trim().length === 0) {
      errors.push('Component name is required');
    } else if (component.name.length > 100) {
      errors.push('Component name must not exceed 100 characters');
    }

    if (!component.componentType) {
      errors.push('Component type is required');
    }

    if (component.technicalDesignDays < 1 || component.technicalDesignDays > 1000) {
      errors.push('Technical design days must be between 1 and 1000');
    }

    if (component.buildDays < 1 || component.buildDays > 1000) {
      errors.push('Build days must be between 1 and 1000');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate total effort days for a component
   */
  static calculateTotalEffortDays(component: Component | ComponentRequest): number {
    return component.technicalDesignDays + component.buildDays;
  }
}

// Export default instance for convenience
export default ComponentService;
