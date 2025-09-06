package com.polycoder.relmgmt.controller.v1;

import com.polycoder.relmgmt.entity.Allocation;
import com.polycoder.relmgmt.dto.AllocationConflictResponse;
import com.polycoder.relmgmt.dto.AllocationDto;
import com.polycoder.relmgmt.dto.WeeklyAllocationMatrixResponse;
import com.polycoder.relmgmt.dto.ResourceProfileResponse;
import com.polycoder.relmgmt.repository.AllocationRepository;
import com.polycoder.relmgmt.service.AllocationService;
import com.polycoder.relmgmt.service.WeeklyAllocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Allocation Management", description = "APIs for resource allocations")
public class AllocationController {

    private final AllocationService allocationService;
    private final AllocationRepository allocationRepository;
    private final WeeklyAllocationService weeklyAllocationService;

    public AllocationController(AllocationService allocationService, 
                              AllocationRepository allocationRepository,
                              WeeklyAllocationService weeklyAllocationService) {
        this.allocationService = allocationService;
        this.allocationRepository = allocationRepository;
        this.weeklyAllocationService = weeklyAllocationService;
    }

    @PostMapping("/releases/{id}/allocate")
    @Operation(summary = "Generate allocation for a release")
    public ResponseEntity<Void> generate(@PathVariable("id") Long releaseId) {
        allocationService.generateAllocation(releaseId);
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/releases/{id}/allocations")
    @Operation(summary = "Get allocations for a release")
    public ResponseEntity<List<AllocationDto>> getForRelease(@PathVariable("id") Long releaseId) {
        try {
            List<AllocationDto> allocationDtos = allocationService.getAllocationDtosForRelease(releaseId);
            return ResponseEntity.ok(allocationDtos);
        } catch (Exception e) {
            // Fallback: return empty list if there's an error
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/resources/{id}/allocations")
    @Operation(summary = "Get allocations for a resource")
    public ResponseEntity<List<Allocation>> getForResource(@PathVariable("id") Long resourceId) {
        return ResponseEntity.ok(allocationService.getAllocationsForResource(resourceId));
    }

    @GetMapping("/allocations/conflicts")
    @Operation(summary = "Get allocation conflicts")
    public ResponseEntity<List<AllocationConflictResponse>> getConflicts() {
        return ResponseEntity.ok(allocationService.getAllocationConflicts());
    }

    @DeleteMapping("/releases/{id}/allocations")
    @Operation(summary = "Delete all allocations for a release")
    public ResponseEntity<Void> deleteAllocationsForRelease(@PathVariable("id") Long releaseId) {
        List<Allocation> existing = allocationService.getAllocationsForRelease(releaseId);
        if (!existing.isEmpty()) {
            allocationRepository.deleteInBatch(existing);
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/allocations/weekly")
    @Operation(summary = "Get weekly allocation matrix with time window")
    public ResponseEntity<WeeklyAllocationMatrixResponse> getWeeklyAllocations(
            @RequestParam String currentWeekStart) {
        WeeklyAllocationMatrixResponse matrix = weeklyAllocationService.getWeeklyAllocations(currentWeekStart);
        return ResponseEntity.ok(matrix);
    }

    @PutMapping("/allocations/weekly/{resourceId}/{weekStart}")
    @Operation(summary = "Update weekly allocation for a resource")
    public ResponseEntity<Void> updateWeeklyAllocation(
            @PathVariable String resourceId,
            @PathVariable String weekStart,
            @RequestParam Double personDays) {
        weeklyAllocationService.updateWeeklyAllocation(resourceId, weekStart, personDays);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/resources/{resourceId}/profile")
    @Operation(summary = "Get resource profile information")
    public ResponseEntity<ResourceProfileResponse> getResourceProfile(
            @PathVariable String resourceId) {
        ResourceProfileResponse profile = weeklyAllocationService.getResourceProfile(resourceId);
        return ResponseEntity.ok(profile);
    }

}


