package com.polycoder.relmgmt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class PhaseRequest {

    @NotBlank(message = "Phase type is required")
    private String phaseType;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    // Default constructor
    public PhaseRequest() {}

    // Constructor with required fields
    public PhaseRequest(String phaseType, LocalDate startDate, LocalDate endDate) {
        this.phaseType = phaseType;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Getters and Setters
    public String getPhaseType() {
        return phaseType;
    }

    public void setPhaseType(String phaseType) {
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
} 