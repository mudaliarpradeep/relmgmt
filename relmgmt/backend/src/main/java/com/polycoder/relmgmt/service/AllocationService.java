package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.entity.Allocation;
import com.polycoder.relmgmt.dto.AllocationConflictResponse;
import com.polycoder.relmgmt.dto.AllocationDto;

import java.util.List;

public interface AllocationService {
    void generateAllocation(Long releaseId);
    List<Allocation> getAllocationsForRelease(Long releaseId);
    List<AllocationDto> getAllocationDtosForRelease(Long releaseId);
    List<Allocation> getAllocationsForResource(Long resourceId);
    List<AllocationConflictResponse> getAllocationConflicts();
}


