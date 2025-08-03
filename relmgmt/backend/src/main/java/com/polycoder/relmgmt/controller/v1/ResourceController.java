package com.polycoder.relmgmt.controller.v1;

import com.polycoder.relmgmt.dto.ResourceRequest;
import com.polycoder.relmgmt.dto.ResourceResponse;
import com.polycoder.relmgmt.dto.ResourceImportResponse;
import com.polycoder.relmgmt.entity.StatusEnum;
import com.polycoder.relmgmt.entity.SkillFunctionEnum;
import com.polycoder.relmgmt.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/resources")
@Tag(name = "Resource Management", description = "Resource roster management APIs")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @GetMapping
    @Operation(summary = "Get all resources", description = "Retrieve all resources with optional filtering and pagination")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Resources retrieved successfully",
            content = @Content(schema = @Schema(implementation = Page.class))),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "400", description = "Invalid request parameters")
    })
    public ResponseEntity<Page<ResourceResponse>> getAllResources(
            @Parameter(description = "Filter by status") @RequestParam(required = false) StatusEnum status,
            @Parameter(description = "Filter by skill function") @RequestParam(required = false) SkillFunctionEnum skillFunction,
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field and direction (e.g., name,asc)") @RequestParam(defaultValue = "name,asc") String sort) {
        
        // Parse sort parameter
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 && "desc".equalsIgnoreCase(sortParams[1]) 
            ? Sort.Direction.DESC : Sort.Direction.ASC;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        Page<ResourceResponse> resources = resourceService.getAllResources(status, skillFunction, pageable);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resource by ID", description = "Retrieve a specific resource by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Resource found",
            content = @Content(schema = @Schema(implementation = ResourceResponse.class))),
        @ApiResponse(responseCode = "404", description = "Resource not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable Long id) {
        ResourceResponse resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(resource);
    }

    @PostMapping
    @Operation(summary = "Create resource", description = "Create a new resource")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Resource created successfully",
            content = @Content(schema = @Schema(implementation = ResourceResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request data or validation error"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ResourceResponse> createResource(@Valid @RequestBody ResourceRequest resourceRequest) {
        ResourceResponse createdResource = resourceService.createResource(resourceRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdResource);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update resource", description = "Update an existing resource")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Resource updated successfully",
            content = @Content(schema = @Schema(implementation = ResourceResponse.class))),
        @ApiResponse(responseCode = "404", description = "Resource not found"),
        @ApiResponse(responseCode = "400", description = "Invalid request data or validation error"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ResourceResponse> updateResource(@PathVariable Long id, 
                                                          @Valid @RequestBody ResourceRequest resourceRequest) {
        ResourceResponse updatedResource = resourceService.updateResource(id, resourceRequest);
        return ResponseEntity.ok(updatedResource);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete resource", description = "Delete a resource by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Resource deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Resource not found"),
        @ApiResponse(responseCode = "409", description = "Cannot delete resource - allocated to active releases"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import")
    @Operation(summary = "Import resources", description = "Import resources from Excel file")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Import completed",
            content = @Content(schema = @Schema(implementation = ResourceImportResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid file or file format"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ResourceImportResponse> importResources(
            @Parameter(description = "Excel file containing resource data") 
            @RequestParam("file") MultipartFile file) {
        ResourceImportResponse importResponse = resourceService.importResourcesFromExcel(file);
        return ResponseEntity.ok(importResponse);
    }

    @GetMapping("/export")
    @Operation(summary = "Export resources", description = "Export all resources to Excel file")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Excel file generated successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<byte[]> exportResources() {
        byte[] excelData = resourceService.exportResourcesToExcel();
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .header("Content-Disposition", "attachment; filename=resources.xlsx")
            .body(excelData);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active resources", description = "Retrieve all resources with active status")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Active resources retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ResourceResponse>> getActiveResources() {
        List<ResourceResponse> activeResources = resourceService.getActiveResources();
        return ResponseEntity.ok(activeResources);
    }

    @GetMapping("/by-skill")
    @Operation(summary = "Get resources by skill and status", description = "Retrieve resources by skill function and status")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Resources retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "400", description = "Invalid skill function or status")
    })
    public ResponseEntity<List<ResourceResponse>> getResourcesBySkillAndStatus(
            @Parameter(description = "Skill function", required = true) @RequestParam SkillFunctionEnum skillFunction,
            @Parameter(description = "Status", required = true) @RequestParam StatusEnum status) {
        List<ResourceResponse> resources = resourceService.getResourcesBySkillFunctionAndStatus(skillFunction, status);
        return ResponseEntity.ok(resources);
    }

    @PostMapping("/update-expired-status")
    @Operation(summary = "Manually trigger expired resources status update", 
               description = "Manually trigger the process to mark resources with past project end dates as inactive")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status update completed successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> manuallyUpdateExpiredResourcesStatus() {
        int updatedCount = resourceService.updateExpiredResourcesStatus();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Expired resources status update completed");
        response.put("updatedCount", updatedCount);
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(response);
    }
}