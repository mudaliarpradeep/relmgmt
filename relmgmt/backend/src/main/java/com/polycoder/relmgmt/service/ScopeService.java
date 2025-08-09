package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.EffortEstimateRequest;
import com.polycoder.relmgmt.dto.EffortEstimateResponse;
import com.polycoder.relmgmt.dto.ScopeItemRequest;
import com.polycoder.relmgmt.dto.ScopeItemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ScopeService {

    /**
     * Find all scope items for a specific project
     */
    List<ScopeItemResponse> findByProjectId(Long projectId);

    /**
     * Find all scope items for a specific project with pagination
     */
    Page<ScopeItemResponse> findByProjectId(Long projectId, Pageable pageable);

    /**
     * Find scope item by ID
     */
    ScopeItemResponse findById(Long id);

    /**
     * Find scope items by name containing the given text for a specific project
     */
    List<ScopeItemResponse> findByProjectIdAndNameContaining(Long projectId, String name);

    /**
     * Find scope items by description containing the given text for a specific project
     */
    List<ScopeItemResponse> findByProjectIdAndDescriptionContaining(Long projectId, String description);

    /**
     * Create a new scope item for a project
     */
    ScopeItemResponse create(Long projectId, ScopeItemRequest scopeItemRequest);

    /**
     * Update an existing scope item
     */
    ScopeItemResponse update(Long id, ScopeItemRequest scopeItemRequest);

    /**
     * Delete a scope item
     */
    void delete(Long id);

    /**
     * Check if a scope item exists by name for a specific project
     */
    boolean existsByProjectIdAndName(Long projectId, String name);

    /**
     * Find scope item by name for a specific project
     */
    ScopeItemResponse findByProjectIdAndName(Long projectId, String name);

    /**
     * Count scope items for a specific project
     */
    long countByProjectId(Long projectId);

    /**
     * Find scope items with effort estimates for a specific project
     */
    List<ScopeItemResponse> findScopeItemsWithEffortEstimates(Long projectId);

    /**
     * Find scope items without effort estimates for a specific project
     */
    List<ScopeItemResponse> findScopeItemsWithoutEffortEstimates(Long projectId);

    /**
     * Find scope items with effort estimates count for a specific project
     */
    List<Object[]> findScopeItemsWithEffortEstimatesCount(Long projectId);

    /**
     * Find scope items by project release ID
     */
    List<ScopeItemResponse> findByProjectReleaseId(Long releaseId);

    /**
     * Find scope items by project release ID with pagination
     */
    Page<ScopeItemResponse> findByProjectReleaseId(Long releaseId, Pageable pageable);

    /**
     * Add effort estimates to a scope item
     */
    List<EffortEstimateResponse> addEffortEstimates(Long scopeItemId, List<EffortEstimateRequest> effortEstimateRequests);

    /**
     * Find effort estimates for a scope item
     */
    List<EffortEstimateResponse> findEffortEstimatesByScopeItemId(Long scopeItemId);

    /**
     * Find effort estimates for a scope item with pagination
     */
    Page<EffortEstimateResponse> findEffortEstimatesByScopeItemId(Long scopeItemId, Pageable pageable);

    /**
     * Find effort estimates by project ID
     */
    List<EffortEstimateResponse> findEffortEstimatesByProjectId(Long projectId);

    /**
     * Find effort estimates by project ID with pagination
     */
    Page<EffortEstimateResponse> findEffortEstimatesByProjectId(Long projectId, Pageable pageable);

    /**
     * Find effort estimates by release ID
     */
    List<EffortEstimateResponse> findEffortEstimatesByReleaseId(Long releaseId);

    /**
     * Find effort estimates by release ID with pagination
     */
    Page<EffortEstimateResponse> findEffortEstimatesByReleaseId(Long releaseId, Pageable pageable);

    /**
     * Sum effort days by skill function for a specific scope item
     */
    Double sumEffortDaysByScopeItemIdAndSkillFunction(Long scopeItemId, String skillFunction);

    /**
     * Sum effort days by skill function and phase for a specific scope item
     */
    Double sumEffortDaysByScopeItemIdAndSkillFunctionAndPhase(Long scopeItemId, String skillFunction, String phase);

    /**
     * Sum effort days by skill function and skill sub-function for a specific scope item
     */
    Double sumEffortDaysByScopeItemIdAndSkillFunctionAndSkillSubFunction(Long scopeItemId, String skillFunction, String skillSubFunction);

    /**
     * Sum effort days by skill function for a specific release
     */
    Double sumEffortDaysByReleaseIdAndSkillFunction(Long releaseId, String skillFunction);

    /**
     * Sum effort days by skill function and phase for a specific release
     */
    Double sumEffortDaysByReleaseIdAndSkillFunctionAndPhase(Long releaseId, String skillFunction, String phase);

    /**
     * Validate scope item data
     */
    void validateScopeItem(ScopeItemRequest scopeItemRequest, Long projectId);

    /**
     * Validate effort estimate data
     */
    void validateEffortEstimate(EffortEstimateRequest effortEstimateRequest);

    /**
     * Check if scope item can be deleted (no effort estimates)
     */
    boolean canDeleteScopeItem(Long scopeItemId);
}

