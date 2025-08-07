package com.polycoder.relmgmt.controller.v1;

import com.polycoder.relmgmt.dto.*;
import com.polycoder.relmgmt.service.ReleaseService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/releases")
@Tag(name = "Release Management", description = "Release management APIs")
public class ReleaseController {

    @Autowired
    private ReleaseService releaseService;

    @GetMapping
    @Operation(summary = "Get all releases", description = "Retrieve all releases with optional filtering and pagination")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Releases retrieved successfully",
            content = @Content(schema = @Schema(implementation = Page.class))),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "400", description = "Invalid request parameters")
    })
    public ResponseEntity<Page<ReleaseResponse>> getAllReleases(
            @Parameter(description = "Filter by name") @RequestParam(required = false) String name,
            @Parameter(description = "Filter by identifier") @RequestParam(required = false) String identifier,
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field and direction (e.g., name,asc)") @RequestParam(defaultValue = "name,asc") String sort) {
        
        // Parse sort parameter
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 && "desc".equalsIgnoreCase(sortParams[1]) 
            ? Sort.Direction.DESC : Sort.Direction.ASC;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        Page<ReleaseResponse> releases = releaseService.getAllReleases(name, identifier, pageable);
        return ResponseEntity.ok(releases);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get release by ID", description = "Retrieve a specific release by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Release found",
            content = @Content(schema = @Schema(implementation = ReleaseResponse.class))),
        @ApiResponse(responseCode = "404", description = "Release not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ReleaseResponse> getReleaseById(@PathVariable Long id) {
        ReleaseResponse release = releaseService.getReleaseById(id);
        return ResponseEntity.ok(release);
    }

    @GetMapping("/identifier/{identifier}")
    @Operation(summary = "Get release by identifier", description = "Retrieve a specific release by identifier")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Release found",
            content = @Content(schema = @Schema(implementation = ReleaseResponse.class))),
        @ApiResponse(responseCode = "404", description = "Release not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ReleaseResponse> getReleaseByIdentifier(@PathVariable String identifier) {
        ReleaseResponse release = releaseService.getReleaseByIdentifier(identifier);
        return ResponseEntity.ok(release);
    }

    @PostMapping
    @Operation(summary = "Create release", description = "Create a new release")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Release created successfully",
            content = @Content(schema = @Schema(implementation = ReleaseResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request data or validation error"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ReleaseResponse> createRelease(@Valid @RequestBody ReleaseRequest releaseRequest) {
        ReleaseResponse createdRelease = releaseService.createRelease(releaseRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRelease);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update release", description = "Update an existing release")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Release updated successfully",
            content = @Content(schema = @Schema(implementation = ReleaseResponse.class))),
        @ApiResponse(responseCode = "404", description = "Release not found"),
        @ApiResponse(responseCode = "400", description = "Invalid request data or validation error"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ReleaseResponse> updateRelease(@PathVariable Long id, 
                                                       @Valid @RequestBody ReleaseRequest releaseRequest) {
        ReleaseResponse updatedRelease = releaseService.updateRelease(id, releaseRequest);
        return ResponseEntity.ok(updatedRelease);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete release", description = "Delete a release by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Release deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Release not found"),
        @ApiResponse(responseCode = "409", description = "Cannot delete release - has active allocations"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> deleteRelease(@PathVariable Long id) {
        releaseService.deleteRelease(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/active")
    @Operation(summary = "Get active releases", description = "Retrieve all active releases (with production go-live date in the future)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Active releases retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ReleaseResponse>> getActiveReleases() {
        List<ReleaseResponse> releases = releaseService.getActiveReleases();
        return ResponseEntity.ok(releases);
    }

    @GetMapping("/completed")
    @Operation(summary = "Get completed releases", description = "Retrieve all completed releases (with production go-live date in the past)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Completed releases retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ReleaseResponse>> getCompletedReleases() {
        List<ReleaseResponse> releases = releaseService.getCompletedReleases();
        return ResponseEntity.ok(releases);
    }

    @GetMapping("/with-blockers")
    @Operation(summary = "Get releases with blockers", description = "Retrieve all releases that have at least one blocker")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Releases with blockers retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ReleaseResponse>> getReleasesWithBlockers() {
        List<ReleaseResponse> releases = releaseService.getReleasesWithBlockers();
        return ResponseEntity.ok(releases);
    }

    @GetMapping("/with-open-blockers")
    @Operation(summary = "Get releases with open blockers", description = "Retrieve all releases that have at least one open blocker")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Releases with open blockers retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ReleaseResponse>> getReleasesWithOpenBlockers() {
        List<ReleaseResponse> releases = releaseService.getReleasesWithOpenBlockers();
        return ResponseEntity.ok(releases);
    }

    // Phase management endpoints
    @GetMapping("/{releaseId}/phases")
    @Operation(summary = "Get phases for release", description = "Retrieve all phases for a specific release")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Phases retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Release not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<PhaseResponse>> getPhasesForRelease(@PathVariable Long releaseId) {
        List<PhaseResponse> phases = releaseService.getPhasesForRelease(releaseId);
        return ResponseEntity.ok(phases);
    }

    @PostMapping("/{releaseId}/phases")
    @Operation(summary = "Add phase to release", description = "Add a new phase to a release")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Phase added successfully",
            content = @Content(schema = @Schema(implementation = PhaseResponse.class))),
        @ApiResponse(responseCode = "404", description = "Release not found"),
        @ApiResponse(responseCode = "400", description = "Invalid request data or validation error"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<PhaseResponse> addPhaseToRelease(@PathVariable Long releaseId,
                                                          @Valid @RequestBody PhaseRequest phaseRequest) {
        PhaseResponse phase = releaseService.addPhaseToRelease(releaseId, phaseRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(phase);
    }

    @PutMapping("/{releaseId}/phases/{phaseId}")
    @Operation(summary = "Update phase", description = "Update an existing phase")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Phase updated successfully",
            content = @Content(schema = @Schema(implementation = PhaseResponse.class))),
        @ApiResponse(responseCode = "404", description = "Release or phase not found"),
        @ApiResponse(responseCode = "400", description = "Invalid request data or validation error"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<PhaseResponse> updatePhase(@PathVariable Long releaseId,
                                                    @PathVariable Long phaseId,
                                                    @Valid @RequestBody PhaseRequest phaseRequest) {
        PhaseResponse phase = releaseService.updatePhase(releaseId, phaseId, phaseRequest);
        return ResponseEntity.ok(phase);
    }

    @DeleteMapping("/{releaseId}/phases/{phaseId}")
    @Operation(summary = "Delete phase", description = "Delete a phase from a release")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Phase deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Release or phase not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> deletePhase(@PathVariable Long releaseId, @PathVariable Long phaseId) {
        releaseService.deletePhase(releaseId, phaseId);
        return ResponseEntity.noContent().build();
    }

    // Blocker management endpoints
    @GetMapping("/{releaseId}/blockers")
    @Operation(summary = "Get blockers for release", description = "Retrieve all blockers for a specific release")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Blockers retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Release not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<BlockerResponse>> getBlockersForRelease(@PathVariable Long releaseId) {
        List<BlockerResponse> blockers = releaseService.getBlockersForRelease(releaseId);
        return ResponseEntity.ok(blockers);
    }

    @PostMapping("/{releaseId}/blockers")
    @Operation(summary = "Add blocker to release", description = "Add a new blocker to a release")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Blocker added successfully",
            content = @Content(schema = @Schema(implementation = BlockerResponse.class))),
        @ApiResponse(responseCode = "404", description = "Release not found"),
        @ApiResponse(responseCode = "400", description = "Invalid request data or validation error"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<BlockerResponse> addBlockerToRelease(@PathVariable Long releaseId,
                                                              @Valid @RequestBody BlockerRequest blockerRequest) {
        BlockerResponse blocker = releaseService.addBlockerToRelease(releaseId, blockerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(blocker);
    }

    @PutMapping("/{releaseId}/blockers/{blockerId}")
    @Operation(summary = "Update blocker", description = "Update an existing blocker")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Blocker updated successfully",
            content = @Content(schema = @Schema(implementation = BlockerResponse.class))),
        @ApiResponse(responseCode = "404", description = "Release or blocker not found"),
        @ApiResponse(responseCode = "400", description = "Invalid request data or validation error"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<BlockerResponse> updateBlocker(@PathVariable Long releaseId,
                                                        @PathVariable Long blockerId,
                                                        @Valid @RequestBody BlockerRequest blockerRequest) {
        BlockerResponse blocker = releaseService.updateBlocker(releaseId, blockerId, blockerRequest);
        return ResponseEntity.ok(blocker);
    }

    @DeleteMapping("/{releaseId}/blockers/{blockerId}")
    @Operation(summary = "Delete blocker", description = "Delete a blocker from a release")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Blocker deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Release or blocker not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> deleteBlocker(@PathVariable Long releaseId, @PathVariable Long blockerId) {
        releaseService.deleteBlocker(releaseId, blockerId);
        return ResponseEntity.noContent().build();
    }
} 