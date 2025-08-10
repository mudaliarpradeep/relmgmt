package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.ProjectRequest;
import com.polycoder.relmgmt.dto.ProjectResponse;
import com.polycoder.relmgmt.entity.Project;
import com.polycoder.relmgmt.entity.ProjectTypeEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProjectService {

    /**
     * Find all projects for a specific release
     */
    List<ProjectResponse> findByReleaseId(Long releaseId);

    /**
     * Find all projects for a specific release with pagination
     */
    Page<ProjectResponse> findByReleaseId(Long releaseId, Pageable pageable);

    /**
     * Find project by ID
     */
    ProjectResponse findById(Long id);

    /**
     * Find projects by type for a specific release
     */
    List<ProjectResponse> findByReleaseIdAndType(Long releaseId, ProjectTypeEnum type);

    /**
     * Find projects by name containing the given text for a specific release
     */
    List<ProjectResponse> findByReleaseIdAndNameContaining(Long releaseId, String name);

    /**
     * Find projects by description containing the given text for a specific release
     */
    List<ProjectResponse> findByReleaseIdAndDescriptionContaining(Long releaseId, String description);

    /**
     * Create a new project for a release
     */
    ProjectResponse create(Long releaseId, ProjectRequest projectRequest);

    /**
     * Update an existing project
     */
    ProjectResponse update(Long id, ProjectRequest projectRequest);

    /**
     * Delete a project
     */
    void delete(Long id);

    /**
     * Check if a project exists by name for a specific release
     */
    boolean existsByReleaseIdAndName(Long releaseId, String name);

    /**
     * Find project by name for a specific release
     */
    ProjectResponse findByReleaseIdAndName(Long releaseId, String name);

    /**
     * Count projects by type for a specific release
     */
    long countByReleaseIdAndType(Long releaseId, ProjectTypeEnum type);

    /**
     * Find projects with scope items for a specific release
     */
    List<ProjectResponse> findProjectsWithScopeItems(Long releaseId);

    /**
     * Find projects without scope items for a specific release
     */
    List<ProjectResponse> findProjectsWithoutScopeItems(Long releaseId);

    /**
     * Find projects by type with scope items count for a specific release
     */
    List<Object[]> findProjectsByTypeWithScopeItemsCount(Long releaseId, ProjectTypeEnum type);

    /**
     * Validate project data
     */
    void validateProject(ProjectRequest projectRequest, Long releaseId);

    /**
     * Check if project can be deleted (no scope items)
     */
    boolean canDeleteProject(Long projectId);
}


