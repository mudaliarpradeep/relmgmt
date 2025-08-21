package com.polycoder.relmgmt.controller.v1;

import com.polycoder.relmgmt.dto.ScopeItemRequest;
import com.polycoder.relmgmt.dto.ScopeItemResponse;
import com.polycoder.relmgmt.dto.ScopeItemWithComponentsResponse;
import com.polycoder.relmgmt.dto.ReleaseEffortSummaryResponse;
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

/**
 * REST controller for managing scope items within releases.
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Scope Management", description = "APIs for managing scope items and components within releases")
public class ScopeController {

    @Autowired
    private ScopeService scopeService;

    /**
     * GET /api/v1/releases/{releaseId}/scope-items : Get all scope items for a release.
     *
     * @param releaseId the release ID
     * @param page page number (0-based)
     * @param size page size
     * @param sort sort field
     * @param direction sort direction
     * @return the ResponseEntity with status 200 (OK) and the list of scope items
     */
    @GetMapping("/releases/{releaseId}/scope-items")
    @Operation(summary = "Get all scope items for a release", description = "Retrieve all scope items associated with a specific release")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved scope items",
                    content = @Content(schema = @Schema(implementation = ScopeItemResponse.class))),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ScopeItemResponse>> getScopeItemsByReleaseId(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "name") String sort,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "asc") String direction) {

        Sort.Direction sortDirection = Sort.Direction.fromString(direction.toUpperCase());
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        Page<ScopeItemResponse> scopeItems = scopeService.findByReleaseId(releaseId, pageable);
        return ResponseEntity.ok(scopeItems.getContent());
    }

    /**
     * GET /api/v1/releases/{releaseId}/scope-items/all : Get all scope items for a release without pagination.
     *
     * @param releaseId the release ID
     * @return the ResponseEntity with status 200 (OK) and the list of scope items
     */
    @GetMapping("/releases/{releaseId}/scope-items/all")
    @Operation(summary = "Get all scope items for a release without pagination", description = "Retrieve all scope items associated with a specific release without pagination")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved scope items",
                    content = @Content(schema = @Schema(implementation = ScopeItemResponse.class))),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ScopeItemResponse>> getAllScopeItemsByReleaseId(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId) {

        List<ScopeItemResponse> scopeItems = scopeService.findByReleaseId(releaseId);
        return ResponseEntity.ok(scopeItems);
    }

    /**
     * GET /api/v1/scope-items/{id} : Get scope item by ID.
     *
     * @param id the scope item ID
     * @return the ResponseEntity with status 200 (OK) and the scope item
     */
    @GetMapping("/scope-items/{id}")
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

    /**
     * GET /api/v1/releases/{releaseId}/scope-items/search : Search scope items by name.
     *
     * @param releaseId the release ID
     * @param name the name to search for
     * @return the ResponseEntity with status 200 (OK) and the list of scope items
     */
    @GetMapping("/releases/{releaseId}/scope-items/search")
    @Operation(summary = "Search scope items by name", description = "Search scope items by name containing the given text")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved scope items",
                    content = @Content(schema = @Schema(implementation = ScopeItemResponse.class))),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ScopeItemResponse>> searchScopeItemsByName(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId,
            @Parameter(description = "Name to search for") @RequestParam String name) {

        List<ScopeItemResponse> scopeItems = scopeService.findByReleaseIdAndNameContaining(releaseId, name);
        return ResponseEntity.ok(scopeItems);
    }

    /**
     * GET /api/v1/releases/{releaseId}/scope-items/search/description : Search scope items by description.
     *
     * @param releaseId the release ID
     * @param description the description to search for
     * @return the ResponseEntity with status 200 (OK) and the list of scope items
     */
    @GetMapping("/releases/{releaseId}/scope-items/search/description")
    @Operation(summary = "Search scope items by description", description = "Search scope items by description containing the given text")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved scope items",
                    content = @Content(schema = @Schema(implementation = ScopeItemResponse.class))),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ScopeItemResponse>> searchScopeItemsByDescription(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId,
            @Parameter(description = "Description to search for") @RequestParam String description) {

        List<ScopeItemResponse> scopeItems = scopeService.findByReleaseIdAndDescriptionContaining(releaseId, description);
        return ResponseEntity.ok(scopeItems);
    }

    /**
     * POST /api/v1/releases/{releaseId}/scope-items : Create a new scope item for a release.
     *
     * @param releaseId the release ID
     * @param scopeItemRequest the scope item request
     * @return the ResponseEntity with status 201 (Created) and the created scope item
     */
    @PostMapping("/releases/{releaseId}/scope-items")
    @Operation(summary = "Create a new scope item", description = "Create a new scope item for a specific release")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Scope item created successfully",
                    content = @Content(schema = @Schema(implementation = ScopeItemResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "409", description = "Scope item with same name already exists"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ScopeItemResponse> createScopeItem(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId,
            @Parameter(description = "Scope item data") @Valid @RequestBody ScopeItemRequest scopeItemRequest) {

        ScopeItemResponse createdScopeItem = scopeService.create(releaseId, scopeItemRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdScopeItem);
    }

    /**
     * PUT /api/v1/scope-items/{id} : Update a scope item.
     *
     * @param id the scope item ID
     * @param scopeItemRequest the updated scope item data
     * @return the ResponseEntity with status 200 (OK) and the updated scope item
     */
    @PutMapping("/scope-items/{id}")
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

    /**
     * DELETE /api/v1/scope-items/{id} : Delete a scope item.
     *
     * @param id the scope item ID
     * @return the ResponseEntity with status 204 (No Content)
     */
    @DeleteMapping("/scope-items/{id}")
    @Operation(summary = "Delete a scope item", description = "Delete a scope item if it has no components")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Scope item deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Scope item not found"),
            @ApiResponse(responseCode = "409", description = "Cannot delete scope item with components"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> deleteScopeItem(
            @Parameter(description = "ID of the scope item") @PathVariable Long id) {

        scopeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/v1/releases/{releaseId}/scope-items/with-components : Get scope items with components.
     *
     * @param releaseId the release ID
     * @return the ResponseEntity with status 200 (OK) and the list of scope items with components
     */
    @GetMapping("/releases/{releaseId}/scope-items/with-components")
    @Operation(summary = "Get scope items with components", description = "Retrieve scope items that have components")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved scope items",
                    content = @Content(schema = @Schema(implementation = ScopeItemResponse.class))),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ScopeItemResponse>> getScopeItemsWithComponents(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId) {

        List<ScopeItemResponse> scopeItems = scopeService.findScopeItemsWithComponents(releaseId);
        return ResponseEntity.ok(scopeItems);
    }

    /**
     * GET /api/v1/releases/{releaseId}/scope-items/with-components-detail : Get scope items with detailed component information.
     *
     * @param releaseId the release ID
     * @return the ResponseEntity with status 200 (OK) and the list of scope items with detailed component information
     */
    @GetMapping("/releases/{releaseId}/scope-items/with-components-detail")
    @Operation(summary = "Get scope items with detailed component information", description = "Retrieve scope items with detailed component information including effort estimates")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved scope items with components",
                    content = @Content(schema = @Schema(implementation = ScopeItemWithComponentsResponse.class))),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ScopeItemWithComponentsResponse>> getScopeItemsWithComponentsDetail(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId) {

        List<ScopeItemWithComponentsResponse> scopeItems = scopeService.findByReleaseIdWithComponents(releaseId);
        return ResponseEntity.ok(scopeItems);
    }

    /**
     * GET /api/v1/releases/{releaseId}/scope-items/without-components : Get scope items without components.
     *
     * @param releaseId the release ID
     * @return the ResponseEntity with status 200 (OK) and the list of scope items without components
     */
    @GetMapping("/releases/{releaseId}/scope-items/without-components")
    @Operation(summary = "Get scope items without components", description = "Retrieve scope items that have no components")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved scope items",
                    content = @Content(schema = @Schema(implementation = ScopeItemResponse.class))),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ScopeItemResponse>> getScopeItemsWithoutComponents(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId) {

        List<ScopeItemResponse> scopeItems = scopeService.findScopeItemsWithoutComponents(releaseId);
        return ResponseEntity.ok(scopeItems);
    }

    /**
     * GET /api/v1/releases/{releaseId}/effort-summary : Get release effort summary.
     *
     * @param releaseId the release ID
     * @return the ResponseEntity with status 200 (OK) and the release effort summary
     */
    @GetMapping("/releases/{releaseId}/effort-summary")
    @Operation(summary = "Get release effort summary", description = "Retrieve effort summary for a release including calculated and manual effort estimates")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved effort summary",
                    content = @Content(schema = @Schema(implementation = ReleaseEffortSummaryResponse.class))),
            @ApiResponse(responseCode = "404", description = "Release not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ReleaseEffortSummaryResponse> getReleaseEffortSummary(
            @Parameter(description = "ID of the release") @PathVariable Long releaseId) {

        ReleaseEffortSummaryResponse effortSummary = scopeService.getReleaseEffortSummary(releaseId);
        return ResponseEntity.ok(effortSummary);
    }

    /**
     * GET /api/v1/scope-items/{id}/can-delete : Check if scope item can be deleted.
     *
     * @param id the scope item ID
     * @return the ResponseEntity with status 200 (OK) and the deletion possibility
     */
    @GetMapping("/scope-items/{id}/can-delete")
    @Operation(summary = "Check if scope item can be deleted", description = "Check if a scope item can be deleted (no components)")
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


