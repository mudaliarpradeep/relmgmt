package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.ScopeItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for ScopeItem entity operations.
 */
@Repository
public interface ScopeItemRepository extends JpaRepository<ScopeItem, Long> {

    /**
     * Find all scope items for a specific release
     */
    List<ScopeItem> findByReleaseId(Long releaseId);

    /**
     * Find all scope items for a specific release with pagination
     */
    Page<ScopeItem> findByReleaseId(Long releaseId, Pageable pageable);

    /**
     * Find scope items by name containing the given text for a specific release
     */
    List<ScopeItem> findByReleaseIdAndNameContainingIgnoreCase(Long releaseId, String name);

    /**
     * Find scope items by name containing the given text for a specific release
     */
    List<ScopeItem> findByReleaseIdAndNameContaining(Long releaseId, String name);

    /**
     * Find scope items by description containing the given text for a specific release
     */
    List<ScopeItem> findByReleaseIdAndDescriptionContainingIgnoreCase(Long releaseId, String description);

    /**
     * Find scope items by description containing the given text for a specific release
     */
    List<ScopeItem> findByReleaseIdAndDescriptionContaining(Long releaseId, String description);

    /**
     * Check if a scope item exists by name for a specific release
     */
    boolean existsByReleaseIdAndName(Long releaseId, String name);

    /**
     * Check if a scope item exists by name for a specific release, excluding a specific ID
     */
    boolean existsByReleaseIdAndNameAndIdNot(Long releaseId, String name, Long id);

    /**
     * Find scope item by name for a specific release
     */
    Optional<ScopeItem> findByReleaseIdAndName(Long releaseId, String name);

    /**
     * Count scope items for a specific release
     */
    long countByReleaseId(Long releaseId);

    /**
     * Count components for a specific scope item
     */
    @Query("SELECT COUNT(c) FROM Component c WHERE c.scopeItem.id = :scopeItemId")
    long countComponentsByScopeItemId(@Param("scopeItemId") Long scopeItemId);

    /**
     * Find scope items with components count greater than zero for a specific release
     */
    @Query("SELECT s FROM ScopeItem s WHERE s.release.id = :releaseId AND SIZE(s.components) > 0")
    List<ScopeItem> findScopeItemsWithComponents(@Param("releaseId") Long releaseId);

    /**
     * Find scope items without any components for a specific release
     */
    @Query("SELECT s FROM ScopeItem s WHERE s.release.id = :releaseId AND SIZE(s.components) = 0")
    List<ScopeItem> findScopeItemsWithoutComponents(@Param("releaseId") Long releaseId);

    /**
     * Find scope items with components count for a specific release
     */
    @Query("SELECT s, SIZE(s.components) as componentsCount FROM ScopeItem s WHERE s.release.id = :releaseId")
    List<Object[]> findScopeItemsWithComponentsCount(@Param("releaseId") Long releaseId);

    /**
     * Find scope items with components by release ID
     */
    @Query("SELECT DISTINCT s FROM ScopeItem s LEFT JOIN FETCH s.components WHERE s.release.id = :releaseId")
    List<ScopeItem> findByReleaseIdWithComponents(@Param("releaseId") Long releaseId);

    /**
     * Find scope items with components and effort estimates by release ID
     */
    @Query("SELECT DISTINCT s FROM ScopeItem s LEFT JOIN FETCH s.components c LEFT JOIN FETCH c.effortEstimates WHERE s.release.id = :releaseId")
    List<ScopeItem> findByReleaseIdWithComponentsAndEffortEstimates(@Param("releaseId") Long releaseId);

    /**
     * Sum functional design days for a specific release
     */
    @Query("SELECT COALESCE(SUM(s.functionalDesignDays), 0) FROM ScopeItem s WHERE s.release.id = :releaseId")
    Double sumFunctionalDesignDaysByReleaseId(@Param("releaseId") Long releaseId);

    /**
     * Sum SIT days for a specific release
     */
    @Query("SELECT COALESCE(SUM(s.sitDays), 0) FROM ScopeItem s WHERE s.release.id = :releaseId")
    Double sumSitDaysByReleaseId(@Param("releaseId") Long releaseId);

    /**
     * Sum UAT days for a specific release
     */
    @Query("SELECT COALESCE(SUM(s.uatDays), 0) FROM ScopeItem s WHERE s.release.id = :releaseId")
    Double sumUatDaysByReleaseId(@Param("releaseId") Long releaseId);
}


