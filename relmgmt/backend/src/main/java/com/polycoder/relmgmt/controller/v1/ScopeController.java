package com.polycoder.relmgmt.controller.v1;

import com.polycoder.relmgmt.dto.EffortEstimateRequest;
import com.polycoder.relmgmt.dto.EffortEstimateResponse;
import com.polycoder.relmgmt.dto.ScopeItemRequest;
import com.polycoder.relmgmt.dto.ScopeItemResponse;
import com.polycoder.relmgmt.service.ScopeService;
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
@Tag(name = "Scope Management", description = "APIs for managing scope items and effort estimates")
public class ScopeController {

    @Autowired
    private ScopeService scopeService;

    @GetMapping("/projects/{projectId}/scope")
    @Operation(summary = "Get all scope items for a project", description = "Retrieve all scope items associated with a specific project")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved scope items",
                    content = @Content(schema = @Schema(implementation = ScopeItemResponse.class))),
            @ApiResponse(responseCode = "404", description = "Project not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ScopeItemResponse>> getScopeItemsByProjectId(
            @Parameter(description = "ID of the project") @PathVariable Long projectId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "name") String sort,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "asc") String direction) {

        Sort.Direction sortDirection = Sort.Direction.fromString(direction.toUpperCase());
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        Page<ScopeItemResponse> scopeItems = scopeService.findByProjectId(projectId, pageable);
        return ResponseEntity.ok(scopeItems.getContent());
    }

    @GetMapping("/projects/{projectId}/scope/all")
    @Operation(summary = "Get all scope items for a project without pagination", description = "Retrieve all scope items associated with a specific project without pagination")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved scope items",
                    content = @Content(schema = @Schema(implementation = ScopeItemResponse.class))),
            @ApiResponse(responseCode = "404", description = "Project not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ScopeItemResponse>> getAllScopeItemsByProjectId(
            @Parameter(description = "ID of the project") @PathVariable Long projectId) {

        List<ScopeItemResponse> scopeItems = scopeService.findByProjectId(projectId);
        return ResponseEntity.ok(scopeItems);
    }

    @GetMapping("/scope/{id}")
    @Operation(summary = "Get scope item by ID", description = "Retrieve a specific scope item by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved scope item",
                    content = @Content(schema = @Schema(implementation = ScopeItemResponse.class))),
            @ApiResponse(responseCode = "404", description = "Scope item not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ScopeItemResponse> getScopeItemById(
            @Parameter(description = "ID of the scope item") @PathVariable Long id) {

        ScopeItemResponse scopeItem = scopeService.findById(id);
        return ResponseEntity.ok(scopeItem);
    }

    @GetMapping("/projects/{projectId}/scope/search")
    @Operation(summary = "Search scope items by name", description = "Search scope items by name containing the given text")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved scope items",
                    content = @Content(schema = @Schema(implementation = ScopeItemResponse.class))),
            @ApiResponse(responseCode = "404", description = "Project not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ScopeItemResponse>> searchScopeItemsByName(
            @Parameter(description = "ID of the project") @PathVariable Long projectId,
            @Parameter(description = "Name to search for") @RequestParam String name) {

        List<ScopeItemResponse> scopeItems = scopeService.findByProjectIdAndNameContaining(projectId, name);
        return ResponseEntity.ok(scopeItems);
    }

    @GetMapping("/projects/{projectId}/scope/search/description")
    @Operation(summary = "Search scope items by description", description = "Search scope items by description containing the given text")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved scope items",
                    content = @Content(schema = @Schema(implementation = ScopeItemResponse.class))),
            @ApiResponse(responseCode = "404", description = "Project not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ScopeItemResponse>> searchScopeItemsByDescription(
            @Parameter(description = "ID of the project") @PathVariable Long projectId,
            @Parameter(description = "Description to search for") @RequestParam String description) {

        List<ScopeItemResponse> scopeItems = scopeService.findByProjectIdAndDescriptionContaining(projectId, description);
        return ResponseEntity.ok(scopeItems);
    }

    @PostMapping("/projects/{projectId}/scope")
    @Operation(summary = "Create a new scope item", description = "Create a new scope item for a specific project")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Scope item created successfully",
                    content = @Content(schema = @Schema(implementation = ScopeItemResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "404", description = "Project not found"),
            @ApiResponse(responseCode = "409", description = "Scope item with same name already exists"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ScopeItemResponse> createScopeItem(
            @Parameter(description = "ID of the project") @PathVariable Long projectId,
            @Parameter(description = "Scope item data") @Valid @RequestBody ScopeItemRequest scopeItemRequest) {

        ScopeItemResponse createdScopeItem = scopeService.create(projectId, scopeItemRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdScopeItem);
    }

    @PutMapping("/scope/{id}")
    @Operation(summary = "Update a scope item", description = "Update an existing scope item")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Scope item updated successfully",
                    content = @Content(schema = @Schema(implementation = ScopeItemResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "404", description = "Scope item not found"),
            @ApiResponse(responseCode = "409", description = "Scope item with same name already exists"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ScopeItemResponse> updateScopeItem(
            @Parameter(description = "ID of the scope item") @PathVariable Long id,
            @Parameter(description = "Updated scope item data") @Valid @RequestBody ScopeItemRequest scopeItemRequest) {

        ScopeItemResponse updatedScopeItem = scopeService.update(id, scopeItemRequest);
        return ResponseEntity.ok(updatedScopeItem);
    }

    @DeleteMapping("/scope/{id}")
    @Operation(summary = "Delete a scope item", description = "Delete a scope item if it has no effort estimates")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Scope item deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Scope item not found"),
            @ApiResponse(responseCode = "409", description = "Cannot delete scope item with effort estimates"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> deleteScopeItem(
            @Parameter(description = "ID of the scope item") @PathVariable Long id) {

        scopeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/scope/{scopeItemId}/effort-estimates")
    @Operation(summary = "Get effort estimates for a scope item", description = "Retrieve all effort estimates for a specific scope item")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved effort estimates",
                    content = @Content(schema = @Schema(implementation = EffortEstimateResponse.class))),
            @ApiResponse(responseCode = "404", description = "Scope item not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<EffortEstimateResponse>> getEffortEstimatesByScopeItemId(
            @Parameter(description = "ID of the scope item") @PathVariable Long scopeItemId) {

        List<EffortEstimateResponse> effortEstimates = scopeService.findEffortEstimatesByScopeItemId(scopeItemId);
        return ResponseEntity.ok(effortEstimates);
    }

    @PostMapping("/scope/{scopeItemId}/effort-estimates")
    @Operation(summary = "Add effort estimates to a scope item", description = "Add effort estimates to a specific scope item")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Effort estimates added successfully",
                    content = @Content(schema = @Schema(implementation = EffortEstimateResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "404", description = "Scope item not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<EffortEstimateResponse>> addEffortEstimates(
            @Parameter(description = "ID of the scope item") @PathVariable Long scopeItemId,
            @Parameter(description = "List of effort estimates") @Valid @RequestBody List<EffortEstimateRequest> effortEstimateRequests) {

        List<EffortEstimateResponse> createdEffortEstimates = scopeService.addEffortEstimates(scopeItemId, effortEstimateRequests);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEffortEstimates);
    }

    @GetMapping("/projects/{projectId}/scope/with-effort-estimates")
    @Operation(summary = "Get scope items with effort estimates", description = "Retrieve scope items that have effort estimates")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved scope items",
                    content = @Content(schema = @Schema(implementation = ScopeItemResponse.class))),
            @ApiResponse(responseCode = "404", description = "Project not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ScopeItemResponse>> getScopeItemsWithEffortEstimates(
            @Parameter(description = "ID of the project") @PathVariable Long projectId) {

        List<ScopeItemResponse> scopeItems = scopeService.findScopeItemsWithEffortEstimates(projectId);
        return ResponseEntity.ok(scopeItems);
    }

    @GetMapping("/projects/{projectId}/scope/without-effort-estimates")
    @Operation(summary = "Get scope items without effort estimates", description = "Retrieve scope items that have no effort estimates")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved scope items",
                    content = @Content(schema = @Schema(implementation = ScopeItemResponse.class))),
            @ApiResponse(responseCode = "404", description = "Project not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ScopeItemResponse>> getScopeItemsWithoutEffortEstimates(
            @Parameter(description = "ID of the project") @PathVariable Long projectId) {

        List<ScopeItemResponse> scopeItems = scopeService.findScopeItemsWithoutEffortEstimates(projectId);
        return ResponseEntity.ok(scopeItems);
    }

    @GetMapping("/releases/{releaseId}/scope")
    @Operation(summary = "Get scope items by release ID", description = "Retrieve all scope items for projects in a specific release")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved scope items",
                    content = @Content(schema = @Schema(implementation = ScopeItemResponse.class))),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ScopeItemResponse>> getScopeItemsByReleaseId(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId) {

        List<ScopeItemResponse> scopeItems = scopeService.findByProjectReleaseId(releaseId);
        return ResponseEntity.ok(scopeItems);
    }

    @GetMapping("/releases/{releaseId}/effort-estimates")
    @Operation(summary = "Get effort estimates by release ID", description = "Retrieve all effort estimates for scope items in projects of a specific release")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved effort estimates",
                    content = @Content(schema = @Schema(implementation = EffortEstimateResponse.class))),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<EffortEstimateResponse>> getEffortEstimatesByReleaseId(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId) {

        List<EffortEstimateResponse> effortEstimates = scopeService.findEffortEstimatesByReleaseId(releaseId);
        return ResponseEntity.ok(effortEstimates);
    }

    @GetMapping("/scope/{scopeItemId}/effort-estimates/sum/skill-function/{skillFunction}")
    @Operation(summary = "Sum effort days by skill function", description = "Sum effort days for a scope item by skill function")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully calculated sum"),
            @ApiResponse(responseCode = "404", description = "Scope item not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Double> sumEffortDaysBySkillFunction(
            @Parameter(description = "ID of the scope item") @PathVariable Long scopeItemId,
            @Parameter(description = "Skill function") @PathVariable String skillFunction) {

        Double sum = scopeService.sumEffortDaysByScopeItemIdAndSkillFunction(scopeItemId, skillFunction);
        return ResponseEntity.ok(sum != null ? sum : 0.0);
    }

    @GetMapping("/scope/{scopeItemId}/effort-estimates/sum/skill-function/{skillFunction}/phase/{phase}")
    @Operation(summary = "Sum effort days by skill function and phase", description = "Sum effort days for a scope item by skill function and phase")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully calculated sum"),
            @ApiResponse(responseCode = "404", description = "Scope item not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Double> sumEffortDaysBySkillFunctionAndPhase(
            @Parameter(description = "ID of the scope item") @PathVariable Long scopeItemId,
            @Parameter(description = "Skill function") @PathVariable String skillFunction,
            @Parameter(description = "Phase") @PathVariable String phase) {

        Double sum = scopeService.sumEffortDaysByScopeItemIdAndSkillFunctionAndPhase(scopeItemId, skillFunction, phase);
        return ResponseEntity.ok(sum != null ? sum : 0.0);
    }

    @GetMapping("/releases/{releaseId}/effort-estimates/sum/skill-function/{skillFunction}")
    @Operation(summary = "Sum effort days by skill function for release", description = "Sum effort days for all scope items in a release by skill function")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully calculated sum"),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Double> sumEffortDaysByReleaseIdAndSkillFunction(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId,
            @Parameter(description = "Skill function") @PathVariable String skillFunction) {

        Double sum = scopeService.sumEffortDaysByReleaseIdAndSkillFunction(releaseId, skillFunction);
        return ResponseEntity.ok(sum != null ? sum : 0.0);
    }

    @GetMapping("/scope/{id}/can-delete")
    @Operation(summary = "Check if scope item can be deleted", description = "Check if a scope item can be deleted (no effort estimates)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully checked deletion possibility"),
            @ApiResponse(responseCode = "404", description = "Scope item not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Boolean> canDeleteScopeItem(
            @Parameter(description = "ID of the scope item") @PathVariable Long id) {

        boolean canDelete = scopeService.canDeleteScopeItem(id);
        return ResponseEntity.ok(canDelete);
    }
}


