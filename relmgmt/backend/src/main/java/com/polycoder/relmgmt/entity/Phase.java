package com.polycoder.relmgmt.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Entity
@Table(name = "phases")
public class Phase extends BaseEntity {

    @NotNull(message = "Phase type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "phase_type", nullable = false, length = 50)
    private PhaseTypeEnum phaseType;

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "release_id", nullable = false)
    private Release release;

    // Default constructor
    public Phase() {}

    // Constructor with required fields
    public Phase(PhaseTypeEnum phaseType, LocalDate startDate, LocalDate endDate) {
        this.phaseType = phaseType;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Getters and Setters
    public PhaseTypeEnum getPhaseType() {
        return phaseType;
    }

    public void setPhaseType(PhaseTypeEnum phaseType) {
        this.phaseType = phaseType;
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

    public Release getRelease() {
        return release;
    }

    public void setRelease(Release release) {
        this.release = release;
    }

    @Override
    public String toString() {
        return "Phase{" +
                "id=" + getId() +
                ", phaseType=" + phaseType +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", releaseId=" + (release != null ? release.getId() : null) +
                ", createdAt=" + getCreatedAt() +
                ", updatedAt=" + getUpdatedAt() +
                '}';
    }
} 