package com.polycoder.relmgmt.controller.v1;

import com.polycoder.relmgmt.entity.Allocation;
import com.polycoder.relmgmt.dto.AllocationConflictResponse;
import com.polycoder.relmgmt.service.AllocationService;
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

    public AllocationController(AllocationService allocationService) {
        this.allocationService = allocationService;
    }

    @PostMapping("/releases/{id}/allocate")
    @Operation(summary = "Generate allocation for a release")
    public ResponseEntity<Void> generate(@PathVariable("id") Long releaseId) {
        allocationService.generateAllocation(releaseId);
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/releases/{id}/allocations")
    @Operation(summary = "Get allocations for a release")
    public ResponseEntity<List<Allocation>> getForRelease(@PathVariable("id") Long releaseId) {
        return ResponseEntity.ok(allocationService.getAllocationsForRelease(releaseId));
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
}


