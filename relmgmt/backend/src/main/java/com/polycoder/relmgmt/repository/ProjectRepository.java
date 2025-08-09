package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.Project;
import com.polycoder.relmgmt.entity.ProjectTypeEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    /**
     * Find all projects for a specific release
     */
    List<Project> findByReleaseId(Long releaseId);

    /**
     * Find all projects for a specific release with pagination
     */
    Page<Project> findByReleaseId(Long releaseId, Pageable pageable);

    /**
     * Find projects by type for a specific release
     */
    List<Project> findByReleaseIdAndType(Long releaseId, ProjectTypeEnum type);

    /**
     * Find projects by name containing the given text for a specific release
     */
    List<Project> findByReleaseIdAndNameContainingIgnoreCase(Long releaseId, String name);

    /**
     * Find projects by description containing the given text for a specific release
     */
    List<Project> findByReleaseIdAndDescriptionContainingIgnoreCase(Long releaseId, String description);

    /**
     * Check if a project exists by name for a specific release
     */
    boolean existsByReleaseIdAndName(Long releaseId, String name);

    /**
     * Find project by name for a specific release
     */
    Optional<Project> findByReleaseIdAndName(Long releaseId, String name);

    /**
     * Count projects by type for a specific release
     */
    long countByReleaseIdAndType(Long releaseId, ProjectTypeEnum type);

    /**
     * Find projects with scope items count greater than zero for a specific release
     */
    @Query("SELECT p FROM Project p WHERE p.release.id = :releaseId AND SIZE(p.scopeItems) > 0")
    List<Project> findProjectsWithScopeItems(@Param("releaseId") Long releaseId);

    /**
     * Find projects without any scope items for a specific release
     */
    @Query("SELECT p FROM Project p WHERE p.release.id = :releaseId AND SIZE(p.scopeItems) = 0")
    List<Project> findProjectsWithoutScopeItems(@Param("releaseId") Long releaseId);

    /**
     * Find projects by type with scope items count for a specific release
     */
    @Query("SELECT p, SIZE(p.scopeItems) as scopeItemsCount FROM Project p WHERE p.release.id = :releaseId AND p.type = :type")
    List<Object[]> findProjectsByTypeWithScopeItemsCount(@Param("releaseId") Long releaseId, @Param("type") ProjectTypeEnum type);
}

