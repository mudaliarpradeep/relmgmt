package com.polycoder.relmgmt.dto;

import com.polycoder.relmgmt.entity.PhaseTypeEnum;

import java.time.LocalDate;

/**
 * DTO for Allocation to avoid circular references in JSON serialization
 */
public class AllocationDto {
    private Long id;
    private Long releaseId;
    private Long resourceId;
    private String resourceName;
    private PhaseTypeEnum phase;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double allocationDays;
    private Double allocationFactor;

    // Constructors
    public AllocationDto() {}

    public AllocationDto(Long id, Long releaseId, Long resourceId, String resourceName, 
                        PhaseTypeEnum phase, LocalDate startDate, 
                        LocalDate endDate, Double allocationDays, Double allocationFactor) {
        this.id = id;
        this.releaseId = releaseId;
        this.resourceId = resourceId;
        this.resourceName = resourceName;
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

    public Long getReleaseId() {
        return releaseId;
    }

    public void setReleaseId(Long releaseId) {
        this.releaseId = releaseId;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
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




