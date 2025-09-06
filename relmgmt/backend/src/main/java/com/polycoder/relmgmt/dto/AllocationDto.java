package com.polycoder.relmgmt.dto;

import com.polycoder.relmgmt.entity.PhaseTypeEnum;
import com.polycoder.relmgmt.entity.Resource;

import java.time.LocalDate;

/**
 * DTO for Allocation to avoid circular references in JSON serialization
 */
public class AllocationDto {
    private Long id;
    private Resource resource;
    private PhaseTypeEnum phase;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double allocationDays;
    private Double allocationFactor;

    // Constructors
    public AllocationDto() {}

    public AllocationDto(Long id, Resource resource, PhaseTypeEnum phase, LocalDate startDate, 
                        LocalDate endDate, Double allocationDays, Double allocationFactor) {
        this.id = id;
        this.resource = resource;
        this.phase = phase;
        this.startDate = startDate;
        this.endDate = endDate;
        this.allocationDays = allocationDays;
        this.allocationFactor = allocationFactor;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Resource getResource() {
        return resource;
    }

    public void setResource(Resource resource) {
        this.resource = resource;
    }

    public PhaseTypeEnum getPhase() {
        return phase;
    }

    public void setPhase(PhaseTypeEnum phase) {
        this.phase = phase;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Double getAllocationDays() {
        return allocationDays;
    }

    public void setAllocationDays(Double allocationDays) {
        this.allocationDays = allocationDays;
    }

    public Double getAllocationFactor() {
        return allocationFactor;
    }

    public void setAllocationFactor(Double allocationFactor) {
        this.allocationFactor = allocationFactor;
    }
}



