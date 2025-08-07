package com.polycoder.relmgmt.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PhaseResponse {

    private Long id;
    private String phaseType;
    private String phaseTypeDisplayName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long releaseId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public PhaseResponse() {}

    // Constructor with required fields
    public PhaseResponse(Long id, String phaseType, String phaseTypeDisplayName, 
                        LocalDate startDate, LocalDate endDate, Long releaseId) {
        this.id = id;
        this.phaseType = phaseType;
        this.phaseTypeDisplayName = phaseTypeDisplayName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.releaseId = releaseId;
    }

    // Constructor with all fields
    public PhaseResponse(Long id, String phaseType, String phaseTypeDisplayName,
                        LocalDate startDate, LocalDate endDate, Long releaseId,
                        LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.phaseType = phaseType;
        this.phaseTypeDisplayName = phaseTypeDisplayName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.releaseId = releaseId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPhaseType() {
        return phaseType;
    }

    public void setPhaseType(String phaseType) {
        this.phaseType = phaseType;
    }

    public String getPhaseTypeDisplayName() {
        return phaseTypeDisplayName;
    }

    public void setPhaseTypeDisplayName(String phaseTypeDisplayName) {
        this.phaseTypeDisplayName = phaseTypeDisplayName;
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

    public Long getReleaseId() {
        return releaseId;
    }

    public void setReleaseId(Long releaseId) {
        this.releaseId = releaseId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
} 