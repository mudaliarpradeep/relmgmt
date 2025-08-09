package com.polycoder.relmgmt.controller.v1;

import com.polycoder.relmgmt.dto.ProjectRequest;
import com.polycoder.relmgmt.dto.ProjectResponse;
import com.polycoder.relmgmt.entity.ProjectTypeEnum;
import com.polycoder.relmgmt.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Project Management", description = "APIs for managing projects within releases")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping("/releases/{releaseId}/projects")
    @Operation(summary = "Get all projects for a release", description = "Retrieve all projects associated with a specific release")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved projects",
                    content = @Content(schema = @Schema(implementation = ProjectResponse.class))),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ProjectResponse>> getProjectsByReleaseId(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "name") String sort,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "asc") String direction) {

        Sort.Direction sortDirection = Sort.Direction.fromString(direction.toUpperCase());
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        Page<ProjectResponse> projects = projectService.findByReleaseId(releaseId, pageable);
        return ResponseEntity.ok(projects.getContent());
    }

    @GetMapping("/releases/{releaseId}/projects/all")
    @Operation(summary = "Get all projects for a release without pagination", description = "Retrieve all projects associated with a specific release without pagination")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved projects",
                    content = @Content(schema = @Schema(implementation = ProjectResponse.class))),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ProjectResponse>> getAllProjectsByReleaseId(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId) {

        List<ProjectResponse> projects = projectService.findByReleaseId(releaseId);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/projects/{id}")
    @Operation(summary = "Get project by ID", description = "Retrieve a specific project by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved project",
                    content = @Content(schema = @Schema(implementation = ProjectResponse.class))),
            @ApiResponse(responseCode = "404", description = "Project not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ProjectResponse> getProjectById(
            @Parameter(description = "ID of the project") @PathVariable Long id) {

        ProjectResponse project = projectService.findById(id);
        return ResponseEntity.ok(project);
    }

    @GetMapping("/releases/{releaseId}/projects/type/{type}")
    @Operation(summary = "Get projects by type for a release", description = "Retrieve projects of a specific type for a release")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved projects",
                    content = @Content(schema = @Schema(implementation = ProjectResponse.class))),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ProjectResponse>> getProjectsByType(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId,
            @Parameter(description = "Type of the project") @PathVariable ProjectTypeEnum type) {

        List<ProjectResponse> projects = projectService.findByReleaseIdAndType(releaseId, type);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/releases/{releaseId}/projects/search")
    @Operation(summary = "Search projects by name", description = "Search projects by name containing the given text")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved projects",
                    content = @Content(schema = @Schema(implementation = ProjectResponse.class))),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ProjectResponse>> searchProjectsByName(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId,
            @Parameter(description = "Name to search for") @RequestParam String name) {

        List<ProjectResponse> projects = projectService.findByReleaseIdAndNameContaining(releaseId, name);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/releases/{releaseId}/projects/search/description")
    @Operation(summary = "Search projects by description", description = "Search projects by description containing the given text")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved projects",
                    content = @Content(schema = @Schema(implementation = ProjectResponse.class))),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ProjectResponse>> searchProjectsByDescription(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId,
            @Parameter(description = "Description to search for") @RequestParam String description) {

        List<ProjectResponse> projects = projectService.findByReleaseIdAndDescriptionContaining(releaseId, description);
        return ResponseEntity.ok(projects);
    }

    @PostMapping("/releases/{releaseId}/projects")
    @Operation(summary = "Create a new project", description = "Create a new project for a specific release")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Project created successfully",
                    content = @Content(schema = @Schema(implementation = ProjectResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "409", description = "Project with same name already exists"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ProjectResponse> createProject(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId,
            @Parameter(description = "Project data") @Valid @RequestBody ProjectRequest projectRequest) {

        ProjectResponse createdProject = projectService.create(releaseId, projectRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProject);
    }

    @PutMapping("/projects/{id}")
    @Operation(summary = "Update a project", description = "Update an existing project")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Project updated successfully",
                    content = @Content(schema = @Schema(implementation = ProjectResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "404", description = "Project not found"),
            @ApiResponse(responseCode = "409", description = "Project with same name already exists"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ProjectResponse> updateProject(
            @Parameter(description = "ID of the project") @PathVariable Long id,
            @Parameter(description = "Updated project data") @Valid @RequestBody ProjectRequest projectRequest) {

        ProjectResponse updatedProject = projectService.update(id, projectRequest);
        return ResponseEntity.ok(updatedProject);
    }

    @DeleteMapping("/projects/{id}")
    @Operation(summary = "Delete a project", description = "Delete a project if it has no scope items")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Project deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Project not found"),
            @ApiResponse(responseCode = "409", description = "Cannot delete project with scope items"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> deleteProject(
            @Parameter(description = "ID of the project") @PathVariable Long id) {

        projectService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/releases/{releaseId}/projects/with-scope-items")
    @Operation(summary = "Get projects with scope items", description = "Retrieve projects that have scope items")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved projects",
                    content = @Content(schema = @Schema(implementation = ProjectResponse.class))),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ProjectResponse>> getProjectsWithScopeItems(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId) {

        List<ProjectResponse> projects = projectService.findProjectsWithScopeItems(releaseId);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/releases/{releaseId}/projects/without-scope-items")
    @Operation(summary = "Get projects without scope items", description = "Retrieve projects that have no scope items")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved projects",
                    content = @Content(schema = @Schema(implementation = ProjectResponse.class))),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ProjectResponse>> getProjectsWithoutScopeItems(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId) {

        List<ProjectResponse> projects = projectService.findProjectsWithoutScopeItems(releaseId);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/releases/{releaseId}/projects/count/type/{type}")
    @Operation(summary = "Count projects by type", description = "Count projects of a specific type for a release")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved count"),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Long> countProjectsByType(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId,
            @Parameter(description = "Type of the project") @PathVariable ProjectTypeEnum type) {

        long count = projectService.countByReleaseIdAndType(releaseId, type);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/projects/{id}/can-delete")
    @Operation(summary = "Check if project can be deleted", description = "Check if a project can be deleted (no scope items)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully checked deletion possibility"),
            @ApiResponse(responseCode = "404", description = "Project not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Boolean> canDeleteProject(
            @Parameter(description = "ID of the project") @PathVariable Long id) {

        boolean canDelete = projectService.canDeleteProject(id);
        return ResponseEntity.ok(canDelete);
    }
}

