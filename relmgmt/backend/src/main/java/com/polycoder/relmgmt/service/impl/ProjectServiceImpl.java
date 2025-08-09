package com.polycoder.relmgmt.service.impl;

import com.polycoder.relmgmt.dto.ProjectRequest;
import com.polycoder.relmgmt.dto.ProjectResponse;
import com.polycoder.relmgmt.entity.Project;
import com.polycoder.relmgmt.entity.ProjectTypeEnum;
import com.polycoder.relmgmt.entity.Release;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.exception.ValidationException;
import com.polycoder.relmgmt.repository.ProjectRepository;
import com.polycoder.relmgmt.repository.ReleaseRepository;
import com.polycoder.relmgmt.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProjectServiceImpl implements ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ReleaseRepository releaseRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> findByReleaseId(Long releaseId) {
        List<Project> projects = projectRepository.findByReleaseId(releaseId);
        return projects.stream()
                .map(ProjectResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProjectResponse> findByReleaseId(Long releaseId, Pageable pageable) {
        Page<Project> projects = projectRepository.findByReleaseId(releaseId, pageable);
        return projects.map(ProjectResponse::new);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse findById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        return new ProjectResponse(project);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> findByReleaseIdAndType(Long releaseId, ProjectTypeEnum type) {
        List<Project> projects = projectRepository.findByReleaseIdAndType(releaseId, type);
        return projects.stream()
                .map(ProjectResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> findByReleaseIdAndNameContaining(Long releaseId, String name) {
        List<Project> projects = projectRepository.findByReleaseIdAndNameContainingIgnoreCase(releaseId, name);
        return projects.stream()
                .map(ProjectResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> findByReleaseIdAndDescriptionContaining(Long releaseId, String description) {
        List<Project> projects = projectRepository.findByReleaseIdAndDescriptionContainingIgnoreCase(releaseId, description);
        return projects.stream()
                .map(ProjectResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectResponse create(Long releaseId, ProjectRequest projectRequest) {
        // Validate release exists
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Release not found with id: " + releaseId));

        // Validate project data
        validateProject(projectRequest, releaseId);

        // Check if project with same name already exists for this release
        if (projectRepository.existsByReleaseIdAndName(releaseId, projectRequest.getName())) {
            throw new ValidationException("Project with name '" + projectRequest.getName() + "' already exists for this release");
        }

        // Create new project
        Project project = new Project();
        project.setName(projectRequest.getName());
        project.setDescription(projectRequest.getDescription());
        project.setType(projectRequest.getType());
        project.setRelease(release);

        Project savedProject = projectRepository.save(project);
        return new ProjectResponse(savedProject);
    }

    @Override
    public ProjectResponse update(Long id, ProjectRequest projectRequest) {
        // Find existing project
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        // Validate project data
        validateProject(projectRequest, project.getRelease().getId());

        // Check if project with same name already exists for this release (excluding current project)
        if (!project.getName().equals(projectRequest.getName()) &&
                projectRepository.existsByReleaseIdAndName(project.getRelease().getId(), projectRequest.getName())) {
            throw new ValidationException("Project with name '" + projectRequest.getName() + "' already exists for this release");
        }

        // Update project
        project.setName(projectRequest.getName());
        project.setDescription(projectRequest.getDescription());
        project.setType(projectRequest.getType());

        Project savedProject = projectRepository.save(project);
        return new ProjectResponse(savedProject);
    }

    @Override
    public void delete(Long id) {
        // Check if project exists
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        // Check if project can be deleted (no scope items)
        if (!canDeleteProject(id)) {
            throw new ValidationException("Cannot delete project. Project has scope items that must be removed first.");
        }

        projectRepository.delete(project);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByReleaseIdAndName(Long releaseId, String name) {
        return projectRepository.existsByReleaseIdAndName(releaseId, name);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse findByReleaseIdAndName(Long releaseId, String name) {
        Project project = projectRepository.findByReleaseIdAndName(releaseId, name)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with name: " + name + " for release: " + releaseId));
        return new ProjectResponse(project);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByReleaseIdAndType(Long releaseId, ProjectTypeEnum type) {
        return projectRepository.countByReleaseIdAndType(releaseId, type);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> findProjectsWithScopeItems(Long releaseId) {
        List<Project> projects = projectRepository.findProjectsWithScopeItems(releaseId);
        return projects.stream()
                .map(ProjectResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> findProjectsWithoutScopeItems(Long releaseId) {
        List<Project> projects = projectRepository.findProjectsWithoutScopeItems(releaseId);
        return projects.stream()
                .map(ProjectResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Object[]> findProjectsByTypeWithScopeItemsCount(Long releaseId, ProjectTypeEnum type) {
        return projectRepository.findProjectsByTypeWithScopeItemsCount(releaseId, type);
    }

    @Override
    public void validateProject(ProjectRequest projectRequest, Long releaseId) {
        if (projectRequest.getName() == null || projectRequest.getName().trim().isEmpty()) {
            throw new ValidationException("Project name is required");
        }

        if (projectRequest.getName().length() > 100) {
            throw new ValidationException("Project name must not exceed 100 characters");
        }

        if (projectRequest.getDescription() != null && projectRequest.getDescription().length() > 500) {
            throw new ValidationException("Project description must not exceed 500 characters");
        }

        if (projectRequest.getType() == null) {
            throw new ValidationException("Project type is required");
        }

        // Validate that release exists
        if (!releaseRepository.existsById(releaseId)) {
            throw new ResourceNotFoundException("Release not found with id: " + releaseId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canDeleteProject(Long projectId) {
        // Check if project has any scope items
        return projectRepository.findById(projectId)
                .map(project -> project.getScopeItems().isEmpty())
                .orElse(false);
    }
}

