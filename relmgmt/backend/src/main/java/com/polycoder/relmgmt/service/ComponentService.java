package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.ComponentRequest;
import com.polycoder.relmgmt.dto.ComponentResponse;
import com.polycoder.relmgmt.entity.ComponentTypeEnum;

import java.util.List;

/**
 * Service interface for Component business logic operations.
 */
public interface ComponentService {
    
    /**
     * Find all components for a scope item.
     * 
     * @param scopeItemId the scope item ID
     * @return list of component responses
     */
    List<ComponentResponse> findByScopeItemId(Long scopeItemId);
    
    /**
     * Find a component by ID.
     * 
     * @param id the component ID
     * @return component response
     * @throws com.polycoder.relmgmt.exception.ResourceNotFoundException if component not found
     */
    ComponentResponse findById(Long id);
    
    /**
     * Create a new component for a scope item.
     * 
     * @param scopeItemId the scope item ID
     * @param request the component request
     * @return created component response
     * @throws com.polycoder.relmgmt.exception.ResourceNotFoundException if scope item not found
     * @throws com.polycoder.relmgmt.exception.ValidationException if validation fails
     */
    ComponentResponse create(Long scopeItemId, ComponentRequest request);
    
    /**
     * Update an existing component.
     * 
     * @param id the component ID
     * @param request the component request
     * @return updated component response
     * @throws com.polycoder.relmgmt.exception.ResourceNotFoundException if component not found
     * @throws com.polycoder.relmgmt.exception.ValidationException if validation fails
     */
    ComponentResponse update(Long id, ComponentRequest request);
    
    /**
     * Delete a component.
     * 
     * @param id the component ID
     * @throws com.polycoder.relmgmt.exception.ResourceNotFoundException if component not found
     */
    void delete(Long id);
    
    /**
     * Check if a component can be deleted (no dependencies).
     * 
     * @param id the component ID
     * @return true if component can be deleted
     */
    boolean canDeleteComponent(Long id);
    
    /**
     * Find components by component type.
     * 
     * @param componentType the component type
     * @return list of component responses
     */
    List<ComponentResponse> findByComponentType(ComponentTypeEnum componentType);
    
    /**
     * Find components by scope item ID and component type.
     * 
     * @param scopeItemId the scope item ID
     * @param componentType the component type
     * @return list of component responses
     */
    List<ComponentResponse> findByScopeItemIdAndComponentType(Long scopeItemId, ComponentTypeEnum componentType);
    
    /**
     * Count components by scope item ID.
     * 
     * @param scopeItemId the scope item ID
     * @return the count
     */
    long countByScopeItemId(Long scopeItemId);
    
    /**
     * Find components by release ID.
     * 
     * @param releaseId the release ID
     * @return list of component responses
     */
    List<ComponentResponse> findByReleaseId(Long releaseId);
    
    /**
     * Find components by release ID and component type.
     * 
     * @param releaseId the release ID
     * @param componentType the component type
     * @return list of component responses
     */
    List<ComponentResponse> findByReleaseIdAndComponentType(Long releaseId, ComponentTypeEnum componentType);

    /**
     * Find components by release ID with effort estimates.
     * 
     * @param releaseId the release ID
     * @return list of component responses with effort estimates
     */
    List<ComponentResponse> findByReleaseIdWithEffortEstimates(Long releaseId);
}
