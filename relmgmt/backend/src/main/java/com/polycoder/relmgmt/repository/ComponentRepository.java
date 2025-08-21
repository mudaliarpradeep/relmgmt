package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.Component;
import com.polycoder.relmgmt.entity.ComponentTypeEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository interface for Component entity operations.
 */
@Repository
public interface ComponentRepository extends JpaRepository<Component, Long> {
    
    /**
     * Find all components by scope item ID.
     * 
     * @param scopeItemId the scope item ID
     * @return list of components
     */
    List<Component> findByScopeItemId(Long scopeItemId);
    
    /**
     * Find all components by component type.
     * 
     * @param componentType the component type
     * @return list of components
     */
    List<Component> findByComponentType(ComponentTypeEnum componentType);
    
    /**
     * Find all components by scope item ID and component type.
     * 
     * @param scopeItemId the scope item ID
     * @param componentType the component type
     * @return list of components
     */
    List<Component> findByScopeItemIdAndComponentType(Long scopeItemId, ComponentTypeEnum componentType);
    
    /**
     * Count components by scope item ID.
     * 
     * @param scopeItemId the scope item ID
     * @return the count
     */
    long countByScopeItemId(Long scopeItemId);
    
    /**
     * Find components with effort estimates by scope item ID.
     * 
     * @param scopeItemId the scope item ID
     * @return list of components with effort estimates
     */
    @Query("SELECT DISTINCT c FROM Component c LEFT JOIN FETCH c.effortEstimates WHERE c.scopeItem.id = :scopeItemId")
    List<Component> findByScopeItemIdWithEffortEstimates(@Param("scopeItemId") Long scopeItemId);
    
    /**
     * Find components by release ID.
     * 
     * @param releaseId the release ID
     * @return list of components
     */
    @Query("SELECT c FROM Component c WHERE c.scopeItem.release.id = :releaseId")
    List<Component> findByReleaseId(@Param("releaseId") Long releaseId);
    
    /**
     * Find components by release ID and component type.
     * 
     * @param releaseId the release ID
     * @param componentType the component type
     * @return list of components
     */
    @Query("SELECT c FROM Component c WHERE c.scopeItem.release.id = :releaseId AND c.componentType = :componentType")
    List<Component> findByReleaseIdAndComponentType(@Param("releaseId") Long releaseId, @Param("componentType") ComponentTypeEnum componentType);

    /**
     * Sum technical design days for a specific release.
     * 
     * @param releaseId the release ID
     * @return sum of technical design days
     */
    @Query("SELECT COALESCE(SUM(c.technicalDesignDays), 0) FROM Component c WHERE c.scopeItem.release.id = :releaseId")
    Double sumTechnicalDesignDaysByReleaseId(@Param("releaseId") Long releaseId);

    /**
     * Sum build days for a specific release.
     * 
     * @param releaseId the release ID
     * @return sum of build days
     */
    @Query("SELECT COALESCE(SUM(c.buildDays), 0) FROM Component c WHERE c.scopeItem.release.id = :releaseId")
    Double sumBuildDaysByReleaseId(@Param("releaseId") Long releaseId);

    /**
     * Check if a component exists by name within a scope item.
     * 
     * @param scopeItemId the scope item ID
     * @param name the component name
     * @return true if component exists, false otherwise
     */
    boolean existsByScopeItemIdAndName(Long scopeItemId, String name);

    /**
     * Check if a component exists by name within a scope item, excluding a specific component.
     * 
     * @param scopeItemId the scope item ID
     * @param name the component name
     * @param componentId the component ID to exclude
     * @return true if component exists, false otherwise
     */
    boolean existsByScopeItemIdAndNameAndIdNot(Long scopeItemId, String name, Long componentId);

    /**
     * Count effort estimates for a specific component.
     * 
     * @param componentId the component ID
     * @return count of effort estimates
     */
    @Query("SELECT COUNT(e) FROM EffortEstimate e WHERE e.component.id = :componentId")
    Long countEffortEstimatesByComponentId(@Param("componentId") Long componentId);

    /**
     * Find components by release ID with effort estimates fetched.
     * 
     * @param releaseId the release ID
     * @return list of components with effort estimates
     */
    @Query("SELECT DISTINCT c FROM Component c LEFT JOIN FETCH c.effortEstimates WHERE c.scopeItem.release.id = :releaseId")
    List<Component> findByReleaseIdWithEffortEstimates(@Param("releaseId") Long releaseId);
}
