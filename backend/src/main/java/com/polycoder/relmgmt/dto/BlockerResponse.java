package com.polycoder.relmgmt.dto;

import java.time.LocalDateTime;

public class BlockerResponse {

    private Long id;
    private String description;
    private String status;
    private String statusDisplayName;
    private Long releaseId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public BlockerResponse() {}

    // Constructor with required fields
    public BlockerResponse(Long id, String description, String status, String statusDisplayName, Long releaseId) {
        this.id = id;
        this.description = description;
        this.status = status;
        this.statusDisplayName = statusDisplayName;
        this.releaseId = releaseId;
    }

    // Constructor with all fields
    public BlockerResponse(Long id, String description, String status, String statusDisplayName,
                          Long releaseId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.description = description;
        this.status = status;
        this.statusDisplayName = statusDisplayName;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStatusDisplayName() {
        return statusDisplayName;
    }

    public void setStatusDisplayName(String statusDisplayName) {
        this.statusDisplayName = statusDisplayName;
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