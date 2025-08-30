package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.ScopeItemRequest;
import com.polycoder.relmgmt.dto.ScopeItemResponse;
import com.polycoder.relmgmt.dto.ScopeItemWithComponentsResponse;
import com.polycoder.relmgmt.dto.ReleaseEffortSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for Scope Item business logic operations.
 */
public interface ScopeService {

    /**
     * Find all scope items for a specific release
     */
    List<ScopeItemResponse> findByReleaseId(Long releaseId);

    /**
     * Find all scope items for a specific release with pagination
     */
    Page<ScopeItemResponse> findByReleaseId(Long releaseId, Pageable pageable);

    /**
     * Find scope item by ID
     */
    ScopeItemResponse findById(Long id);

    /**
     * Find scope items by name containing the given text for a specific release
     */
    List<ScopeItemResponse> findByReleaseIdAndNameContaining(Long releaseId, String name);

    /**
     * Find scope items by description containing the given text for a specific release
     */
    List<ScopeItemResponse> findByReleaseIdAndDescriptionContaining(Long releaseId, String description);

    /**
     * Create a new scope item for a release
     */
    ScopeItemResponse create(Long releaseId, ScopeItemRequest scopeItemRequest);

    /**
     * Update an existing scope item
     */
    ScopeItemResponse update(Long id, ScopeItemRequest scopeItemRequest);

    /**
     * Delete a scope item
     */
    void delete(Long id);

    /**
     * Check if a scope item exists by name for a specific release
     */
    boolean existsByReleaseIdAndName(Long releaseId, String name);

    /**
     * Find scope item by name for a specific release
     */
    ScopeItemResponse findByReleaseIdAndName(Long releaseId, String name);

    /**
     * Count scope items for a specific release
     */
    long countByReleaseId(Long releaseId);

    /**
     * Find scope items with components for a specific release
     */
    List<ScopeItemResponse> findScopeItemsWithComponents(Long releaseId);

    /**
     * Find scope items without components for a specific release
     */
    List<ScopeItemResponse> findScopeItemsWithoutComponents(Long releaseId);

    /**
     * Find scope items with components count for a specific release
     */
    List<Object[]> findScopeItemsWithComponentsCount(Long releaseId);

    /**
     * Find scope items with components by release ID
     */
    List<ScopeItemWithComponentsResponse> findByReleaseIdWithComponents(Long releaseId);

    /**
     * Validate scope item data
     */
    void validateScopeItem(ScopeItemRequest scopeItemRequest, Long releaseId);

    /**
     * Check if scope item can be deleted (no components)
     */
    boolean canDeleteScopeItem(Long scopeItemId);

    /**
     * Get release effort summary (calculated from scope items)
     * Returns aggregated effort data across all scope items for a release,
     * broken down by component type and phase.
     */
    List<ReleaseEffortSummaryResponse> getReleaseEffortSummary(Long releaseId);

    /**
     * Calculate total functional design days for a release
     */
    Double calculateTotalFunctionalDesignDays(Long releaseId);

    /**
     * Calculate total technical design days for a release
     */
    Double calculateTotalTechnicalDesignDays(Long releaseId);

    /**
     * Calculate total build days for a release
     */
    Double calculateTotalBuildDays(Long releaseId);

    /**
     * Calculate total SIT days for a release
     */
    Double calculateTotalSitDays(Long releaseId);

    /**
     * Calculate total UAT days for a release
     */
    Double calculateTotalUatDays(Long releaseId);
}


