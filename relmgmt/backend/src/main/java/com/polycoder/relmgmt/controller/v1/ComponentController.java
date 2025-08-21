package com.polycoder.relmgmt.controller.v1;

import com.polycoder.relmgmt.dto.ComponentRequest;
import com.polycoder.relmgmt.dto.ComponentResponse;
import com.polycoder.relmgmt.entity.ComponentTypeEnum;
import com.polycoder.relmgmt.service.ComponentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing components within scope items.
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Component Management", description = "APIs for managing components within scope items")
public class ComponentController {
    
    private final ComponentService componentService;
    
    @Autowired
    public ComponentController(ComponentService componentService) {
        this.componentService = componentService;
    }
    
    /**
     * GET /api/v1/scope-items/{scopeItemId}/components : Get all components for a scope item.
     *
     * @param scopeItemId the scope item ID
     * @return the ResponseEntity with status 200 (OK) and the list of components
     */
    @GetMapping("/scope-items/{scopeItemId}/components")
    @Operation(summary = "Get all components for a scope item", description = "Retrieves all components associated with a specific scope item")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved components",
                    content = @Content(schema = @Schema(implementation = ComponentResponse.class))),
        @ApiResponse(responseCode = "404", description = "Scope item not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ComponentResponse>> getComponentsByScopeItemId(
            @Parameter(description = "ID of the scope item", required = true)
            @PathVariable Long scopeItemId) {
        
        List<ComponentResponse> components = componentService.findByScopeItemId(scopeItemId);
        return ResponseEntity.ok(components);
    }
    
    /**
     * GET /api/v1/components/{id} : Get a component by ID.
     *
     * @param id the component ID
     * @return the ResponseEntity with status 200 (OK) and the component, or status 404 (Not Found)
     */
    @GetMapping("/components/{id}")
    @Operation(summary = "Get a component by ID", description = "Retrieves a specific component by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved component",
                    content = @Content(schema = @Schema(implementation = ComponentResponse.class))),
        @ApiResponse(responseCode = "404", description = "Component not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ComponentResponse> getComponent(
            @Parameter(description = "ID of the component", required = true)
            @PathVariable Long id) {
        
        ComponentResponse component = componentService.findById(id);
        return ResponseEntity.ok(component);
    }
    
    /**
     * POST /api/v1/scope-items/{scopeItemId}/components : Create a new component for a scope item.
     *
     * @param scopeItemId the scope item ID
     * @param request the component request
     * @return the ResponseEntity with status 201 (Created) and the created component
     */
    @PostMapping("/scope-items/{scopeItemId}/components")
    @Operation(summary = "Create a new component", description = "Creates a new component within a scope item")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Component created successfully",
                    content = @Content(schema = @Schema(implementation = ComponentResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Scope item not found"),
        @ApiResponse(responseCode = "409", description = "Component with same name already exists"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ComponentResponse> createComponent(
            @Parameter(description = "ID of the scope item", required = true)
            @PathVariable Long scopeItemId,
            @Parameter(description = "Component data", required = true)
            @Valid @RequestBody ComponentRequest request) {
        
        ComponentResponse createdComponent = componentService.create(scopeItemId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdComponent);
    }
    
    /**
     * PUT /api/v1/components/{id} : Update an existing component.
     *
     * @param id the component ID
     * @param request the component request
     * @return the ResponseEntity with status 200 (OK) and the updated component
     */
    @PutMapping("/components/{id}")
    @Operation(summary = "Update a component", description = "Updates an existing component")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Component updated successfully",
                    content = @Content(schema = @Schema(implementation = ComponentResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Component not found"),
        @ApiResponse(responseCode = "409", description = "Component with same name already exists"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ComponentResponse> updateComponent(
            @Parameter(description = "ID of the component", required = true)
            @PathVariable Long id,
            @Parameter(description = "Updated component data", required = true)
            @Valid @RequestBody ComponentRequest request) {
        
        ComponentResponse updatedComponent = componentService.update(id, request);
        return ResponseEntity.ok(updatedComponent);
    }
    
    /**
     * DELETE /api/v1/components/{id} : Delete a component.
     *
     * @param id the component ID
     * @return the ResponseEntity with status 204 (No Content)
     */
    @DeleteMapping("/components/{id}")
    @Operation(summary = "Delete a component", description = "Deletes a component")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Component deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Component not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> deleteComponent(
            @Parameter(description = "ID of the component", required = true)
            @PathVariable Long id) {
        
        componentService.delete(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * GET /api/v1/components/types : Get all available component types.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of component types
     */
    @GetMapping("/components/types")
    @Operation(summary = "Get component types", description = "Retrieves all available component types")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved component types"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ComponentTypeEnum[]> getComponentTypes() {
        return ResponseEntity.ok(ComponentTypeEnum.values());
    }
    
    /**
     * GET /api/v1/components/type/{componentType} : Get all components by type.
     *
     * @param componentType the component type
     * @return the ResponseEntity with status 200 (OK) and the list of components
     */
    @GetMapping("/components/type/{componentType}")
    @Operation(summary = "Get components by type", description = "Retrieves all components of a specific type")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved components",
                    content = @Content(schema = @Schema(implementation = ComponentResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid component type"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ComponentResponse>> getComponentsByType(
            @Parameter(description = "Component type", required = true)
            @PathVariable ComponentTypeEnum componentType) {
        
        List<ComponentResponse> components = componentService.findByComponentType(componentType);
        return ResponseEntity.ok(components);
    }
    
    /**
     * GET /api/v1/releases/{releaseId}/components : Get all components for a release.
     *
     * @param releaseId the release ID
     * @return the ResponseEntity with status 200 (OK) and the list of components
     */
    @GetMapping("/releases/{releaseId}/components")
    @Operation(summary = "Get components by release", description = "Retrieves all components within a specific release")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved components",
                    content = @Content(schema = @Schema(implementation = ComponentResponse.class))),
        @ApiResponse(responseCode = "404", description = "Release not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ComponentResponse>> getComponentsByReleaseId(
            @Parameter(description = "ID of the release", required = true)
            @PathVariable Long releaseId) {
        
        List<ComponentResponse> components = componentService.findByReleaseId(releaseId);
        return ResponseEntity.ok(components);
    }
    
    /**
     * GET /api/v1/releases/{releaseId}/components/type/{componentType} : Get components by release and type.
     *
     * @param releaseId the release ID
     * @param componentType the component type
     * @return the ResponseEntity with status 200 (OK) and the list of components
     */
    @GetMapping("/releases/{releaseId}/components/type/{componentType}")
    @Operation(summary = "Get components by release and type", description = "Retrieves all components of a specific type within a release")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved components",
                    content = @Content(schema = @Schema(implementation = ComponentResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid component type"),
        @ApiResponse(responseCode = "404", description = "Release not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<ComponentResponse>> getComponentsByReleaseIdAndType(
            @Parameter(description = "ID of the release", required = true)
            @PathVariable Long releaseId,
            @Parameter(description = "Component type", required = true)
            @PathVariable ComponentTypeEnum componentType) {
        
        List<ComponentResponse> components = componentService.findByReleaseIdAndComponentType(releaseId, componentType);
        return ResponseEntity.ok(components);
    }
}
