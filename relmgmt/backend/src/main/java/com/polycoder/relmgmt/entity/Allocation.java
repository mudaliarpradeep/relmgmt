package com.polycoder.relmgmt.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "allocations")
public class Allocation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "release_id", nullable = false)
    @JsonIgnore
    private Release release;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Enumerated(EnumType.STRING)
    @Column(name = "phase", nullable = false, length = 50)
    private PhaseTypeEnum phase;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    // Allocation factor in days per day (e.g., 1.0 == full day, 0.5 == half-day)
    @Column(name = "allocation_factor", nullable = false)
    private Double allocationFactor;

    // Total allocation days across the period
    @Column(name = "allocation_days", nullable = false)
    private Double allocationDays;

    public Release getRelease() { return release; }
    public void setRelease(Release release) { this.release = release; }

    public Resource getResource() { return resource; }
    public void setResource(Resource resource) { this.resource = resource; }

    public PhaseTypeEnum getPhase() { return phase; }
    public void setPhase(PhaseTypeEnum phase) { this.phase = phase; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Double getAllocationFactor() { return allocationFactor; }
    public void setAllocationFactor(Double allocationFactor) { this.allocationFactor = allocationFactor; }

    public Double getAllocationDays() { return allocationDays; }
    public void setAllocationDays(Double allocationDays) { this.allocationDays = allocationDays; }
}


