package com.polycoder.relmgmt.dto;

import com.polycoder.relmgmt.entity.ScopeItem;

import java.time.LocalDateTime;

public class ScopeItemResponse {

    private Long id;
    private String name;
    private String description;
    private Long projectId;
    private String projectName;
    private Long releaseId;
    private String releaseName;
    private String releaseIdentifier;
    private int effortEstimatesCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public ScopeItemResponse() {}

    // Constructor from entity
    public ScopeItemResponse(ScopeItem scopeItem) {
        this.id = scopeItem.getId();
        this.name = scopeItem.getName();
        this.description = scopeItem.getDescription();
        this.projectId = scopeItem.getProject() != null ? scopeItem.getProject().getId() : null;
        this.projectName = scopeItem.getProject() != null ? scopeItem.getProject().getName() : null;
        this.releaseId = scopeItem.getProject() != null && scopeItem.getProject().getRelease() != null ? scopeItem.getProject().getRelease().getId() : null;
        this.releaseName = scopeItem.getProject() != null && scopeItem.getProject().getRelease() != null ? scopeItem.getProject().getRelease().getName() : null;
        this.releaseIdentifier = scopeItem.getProject() != null && scopeItem.getProject().getRelease() != null ? scopeItem.getProject().getRelease().getIdentifier() : null;
        this.effortEstimatesCount = scopeItem.getEffortEstimates() != null ? scopeItem.getEffortEstimates().size() : 0;
        this.createdAt = scopeItem.getCreatedAt();
        this.updatedAt = scopeItem.getUpdatedAt();
    }

    // Constructor with all fields
    public ScopeItemResponse(Long id, String name, String description, Long projectId, String projectName, Long releaseId, String releaseName, String releaseIdentifier, int effortEstimatesCount, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.projectId = projectId;
        this.projectName = projectName;
        this.releaseId = releaseId;
        this.releaseName = releaseName;
        this.releaseIdentifier = releaseIdentifier;
        this.effortEstimatesCount = effortEstimatesCount;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public Long getReleaseId() {
        return releaseId;
    }

    public void setReleaseId(Long releaseId) {
        this.releaseId = releaseId;
    }

    public String getReleaseName() {
        return releaseName;
    }

    public void setReleaseName(String releaseName) {
        this.releaseName = releaseName;
    }

    public String getReleaseIdentifier() {
        return releaseIdentifier;
    }

    public void setReleaseIdentifier(String releaseIdentifier) {
        this.releaseIdentifier = releaseIdentifier;
    }

    public int getEffortEstimatesCount() {
        return effortEstimatesCount;
    }

    public void setEffortEstimatesCount(int effortEstimatesCount) {
        this.effortEstimatesCount = effortEstimatesCount;
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

    @Override
    public String toString() {
        return "ScopeItemResponse{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", projectId=" + projectId +
                ", projectName='" + projectName + '\'' +
                ", releaseId=" + releaseId +
                ", releaseName='" + releaseName + '\'' +
                ", releaseIdentifier='" + releaseIdentifier + '\'' +
                ", effortEstimatesCount=" + effortEstimatesCount +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}


