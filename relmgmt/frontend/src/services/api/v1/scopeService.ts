import { apiClient } from '../apiClient';
import type {
  PaginatedResponse,
  Component,
  ComponentRequest,
  ScopeItem,
  ScopeItemRequest,
  ScopeItemWithComponents,
  ReleaseEffortSummary
} from '../sharedTypes';

/**
 * Service for managing scope items within releases
 */
export class ScopeService {
  private static readonly BASE_URL = '/v1/scope-items';
  private static readonly RELEASES_URL = '/v1/releases';

  /**
   * Get all scope items for a release with pagination
   */
  static async getScopeItemsByReleaseId(
    releaseId: number,
    page: number = 0,
    size: number = 20,
    sort?: string
  ): Promise<PaginatedResponse<ScopeItem>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    
    if (sort) {
      params.append('sort', sort);
    }

    const response = await apiClient.get<PaginatedResponse<ScopeItem>>(
      `${this.RELEASES_URL}/${releaseId}/scope-items?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get all scope items for a release (without pagination)
   */
  static async getAllScopeItemsByReleaseId(releaseId: number): Promise<ScopeItem[]> {
    const response = await apiClient.get<ScopeItem[]>(
      `${this.RELEASES_URL}/${releaseId}/scope-items/all`
    );
    return response.data;
  }

  /**
   * Get a scope item by ID
   */
  static async getScopeItem(id: number): Promise<ScopeItem> {
    const response = await apiClient.get<ScopeItem>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create a new scope item for a release
   */
  static async createScopeItem(releaseId: number, data: ScopeItemRequest): Promise<ScopeItem> {
    const response = await apiClient.post<ScopeItem>(
      `${this.RELEASES_URL}/${releaseId}/scope-items`,
      data
    );
    return response.data;
  }

  /**
   * Update an existing scope item
   */
  static async updateScopeItem(id: number, data: ScopeItemRequest): Promise<ScopeItem> {
    const response = await apiClient.put<ScopeItem>(`${this.BASE_URL}/${id}`, data);
    return response.data;
  }

  /**
   * Delete a scope item
   */
  static async deleteScopeItem(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${id}`);
  }

  /**
   * Search scope items by name within a release
   */
  static async searchScopeItemsByName(releaseId: number, name: string): Promise<ScopeItem[]> {
    const response = await apiClient.get<ScopeItem[]>(
      `${this.RELEASES_URL}/${releaseId}/scope-items/search?name=${encodeURIComponent(name)}`
    );
    return response.data;
  }

  /**
   * Search scope items by description within a release
   */
  static async searchScopeItemsByDescription(releaseId: number, description: string): Promise<ScopeItem[]> {
    const response = await apiClient.get<ScopeItem[]>(
      `${this.RELEASES_URL}/${releaseId}/scope-items/search?description=${encodeURIComponent(description)}`
    );
    return response.data;
  }

  /**
   * Get scope items with components for a release
   */
  static async getScopeItemsWithComponents(releaseId: number): Promise<ScopeItemWithComponents[]> {
    const response = await apiClient.get<ScopeItemWithComponents[]>(
      `${this.RELEASES_URL}/${releaseId}/scope-items/with-components-detail`
    );
    return response.data;
  }

  /**
   * Get scope items without components for a release
   */
  static async getScopeItemsWithoutComponents(releaseId: number): Promise<ScopeItem[]> {
    const response = await apiClient.get<ScopeItem[]>(
      `${this.RELEASES_URL}/${releaseId}/scope-items/without-components`
    );
    return response.data;
  }

  /**
   * Get scope items with component counts for a release
   */
  static async getScopeItemsWithComponentCounts(releaseId: number): Promise<ScopeItem[]> {
    const response = await apiClient.get<ScopeItem[]>(
      `${this.RELEASES_URL}/${releaseId}/scope-items/with-component-counts`
    );
    return response.data;
  }

  /**
   * Get scope item by name within a release
   */
  static async getScopeItemByName(releaseId: number, name: string): Promise<ScopeItem | null> {
    const response = await apiClient.get<ScopeItem>(
      `${this.RELEASES_URL}/${releaseId}/scope-items/by-name?name=${encodeURIComponent(name)}`
    );
    return response.data;
  }

  /**
   * Check if a scope item can be deleted
   */
  static async canDeleteScopeItem(id: number): Promise<boolean> {
    const response = await apiClient.get<boolean>(`${this.BASE_URL}/${id}/can-delete`);
    return response.data;
  }

  // This method was removed as it conflicted with the correct implementation below
  // The correct method returns ReleaseEffortSummary[] (array) not ReleaseEffortSummary (single object)

  /**
   * Calculate total functional design days for a release
   */
  static async calculateTotalFunctionalDesignDays(releaseId: number): Promise<number> {
    const response = await apiClient.get<number>(
      `${this.RELEASES_URL}/${releaseId}/effort-summary/functional-design-days`
    );
    return response.data;
  }

  /**
   * Calculate total technical design days for a release
   */
  static async calculateTotalTechnicalDesignDays(releaseId: number): Promise<number> {
    const response = await apiClient.get<number>(
      `${this.RELEASES_URL}/${releaseId}/effort-summary/technical-design-days`
    );
    return response.data;
  }

  /**
   * Calculate total build days for a release
   */
  static async calculateTotalBuildDays(releaseId: number): Promise<number> {
    const response = await apiClient.get<number>(
      `${this.RELEASES_URL}/${releaseId}/effort-summary/build-days`
    );
    return response.data;
  }

  /**
   * Calculate total SIT days for a release
   */
  static async calculateTotalSitDays(releaseId: number): Promise<number> {
    const response = await apiClient.get<number>(
      `${this.RELEASES_URL}/${releaseId}/effort-summary/sit-days`
    );
    return response.data;
  }

  /**
   * Calculate total UAT days for a release
   */
  static async calculateTotalUatDays(releaseId: number): Promise<number> {
    const response = await apiClient.get<number>(
      `${this.RELEASES_URL}/${releaseId}/effort-summary/uat-days`
    );
    return response.data;
  }

  /**
   * Validate scope item data
   */
  static validateScopeItem(data: ScopeItemRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Scope item name is required');
    } else if (data.name.length > 100) {
      errors.push('Scope item name must not exceed 100 characters');
    }

    if (data.description && data.description.length > 500) {
      errors.push('Description must not exceed 500 characters');
    }

    if (data.functionalDesignDays < 1 || data.functionalDesignDays > 1000) {
      errors.push('Functional design days must be between 1 and 1000');
    }

    if (data.sitDays < 1 || data.sitDays > 1000) {
      errors.push('SIT days must be between 1 and 1000');
    }

    if (data.uatDays < 1 || data.uatDays > 1000) {
      errors.push('UAT days must be between 1 and 1000');
    }

    if (!data.components || data.components.length === 0) {
      errors.push('At least one component is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate total effort days for a scope item
   */
  static calculateTotalEffortDays(scopeItem: ScopeItem | ScopeItemRequest): number {
    const scopeItemEffort = scopeItem.functionalDesignDays + scopeItem.sitDays + scopeItem.uatDays;
    
    if ('components' in scopeItem && scopeItem.components) {
      const componentEffort = scopeItem.components.reduce((total, component) => {
        return total + component.technicalDesignDays + component.buildDays;
      }, 0);
      return scopeItemEffort + componentEffort;
    }
    
    return scopeItemEffort;
  }

  /**
   * Get scope item by ID with components
   */
  static async getScopeItemWithComponents(id: number): Promise<ScopeItemWithComponents> {
    // First get the basic scope item to find its release ID
    const basicItem = await this.getScopeItem(id);

    // Then get all scope items with components for that release
    const response = await apiClient.get<ScopeItemWithComponents[]>(
      `${this.RELEASES_URL}/${basicItem.releaseId}/scope-items/with-components-detail`
    );

    // Find the specific scope item
    const scopeItem = response.data.find(item => item.id === id);
    if (!scopeItem) {
      throw new Error(`Scope item with id ${id} not found`);
    }

    return scopeItem;
  }

  /**
   * Get release effort summary
   * Retrieves aggregated effort data across all scope items for a release,
   * broken down by component type and phase
   */
  static async getReleaseEffortSummary(releaseId: number): Promise<ReleaseEffortSummary[]> {
    const response = await apiClient.get<ReleaseEffortSummary[]>(
      `${this.RELEASES_URL}/${releaseId}/effort-summary`
    );
    return response.data;
  }
}

// Export default instance for convenience
export default ScopeService;


