package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.ScopeItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScopeItemRepository extends JpaRepository<ScopeItem, Long> {

    /**
     * Find all scope items for a specific project
     */
    List<ScopeItem> findByProjectId(Long projectId);

    /**
     * Find all scope items for a specific project with pagination
     */
    Page<ScopeItem> findByProjectId(Long projectId, Pageable pageable);

    /**
     * Find scope items by name containing the given text for a specific project
     */
    List<ScopeItem> findByProjectIdAndNameContainingIgnoreCase(Long projectId, String name);

    /**
     * Find scope items by description containing the given text for a specific project
     */
    List<ScopeItem> findByProjectIdAndDescriptionContainingIgnoreCase(Long projectId, String description);

    /**
     * Check if a scope item exists by name for a specific project
     */
    boolean existsByProjectIdAndName(Long projectId, String name);

    /**
     * Find scope item by name for a specific project
     */
    Optional<ScopeItem> findByProjectIdAndName(Long projectId, String name);

    /**
     * Count scope items for a specific project
     */
    long countByProjectId(Long projectId);

    /**
     * Find scope items with effort estimates count greater than zero for a specific project
     */
    @Query("SELECT s FROM ScopeItem s WHERE s.project.id = :projectId AND SIZE(s.effortEstimates) > 0")
    List<ScopeItem> findScopeItemsWithEffortEstimates(@Param("projectId") Long projectId);

    /**
     * Find scope items without any effort estimates for a specific project
     */
    @Query("SELECT s FROM ScopeItem s WHERE s.project.id = :projectId AND SIZE(s.effortEstimates) = 0")
    List<ScopeItem> findScopeItemsWithoutEffortEstimates(@Param("projectId") Long projectId);

    /**
     * Find scope items with effort estimates count for a specific project
     */
    @Query("SELECT s, SIZE(s.effortEstimates) as effortEstimatesCount FROM ScopeItem s WHERE s.project.id = :projectId")
    List<Object[]> findScopeItemsWithEffortEstimatesCount(@Param("projectId") Long projectId);

    /**
     * Find scope items by project release ID
     */
    @Query("SELECT s FROM ScopeItem s WHERE s.project.release.id = :releaseId")
    List<ScopeItem> findByProjectReleaseId(@Param("releaseId") Long releaseId);

    /**
     * Find scope items by project release ID with pagination
     */
    @Query("SELECT s FROM ScopeItem s WHERE s.project.release.id = :releaseId")
    Page<ScopeItem> findByProjectReleaseId(@Param("releaseId") Long releaseId, Pageable pageable);
}

