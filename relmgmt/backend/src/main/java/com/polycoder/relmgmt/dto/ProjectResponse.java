package com.polycoder.relmgmt.dto;

import com.polycoder.relmgmt.entity.Project;
import com.polycoder.relmgmt.entity.ProjectTypeEnum;

import java.time.LocalDateTime;

public class ProjectResponse {

    private Long id;
    private String name;
    private String description;
    private ProjectTypeEnum type;
    private Long releaseId;
    private String releaseName;
    private String releaseIdentifier;
    private int scopeItemsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public ProjectResponse() {}

    // Constructor from entity
    public ProjectResponse(Project project) {
        this.id = project.getId();
        this.name = project.getName();
        this.description = project.getDescription();
        this.type = project.getType();
        this.releaseId = project.getRelease() != null ? project.getRelease().getId() : null;
        this.releaseName = project.getRelease() != null ? project.getRelease().getName() : null;
        this.releaseIdentifier = project.getRelease() != null ? project.getRelease().getIdentifier() : null;
        this.scopeItemsCount = project.getScopeItems() != null ? project.getScopeItems().size() : 0;
        this.createdAt = project.getCreatedAt();
        this.updatedAt = project.getUpdatedAt();
    }

    // Constructor with all fields
    public ProjectResponse(Long id, String name, String description, ProjectTypeEnum type, Long releaseId, String releaseName, String releaseIdentifier, int scopeItemsCount, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.releaseId = releaseId;
        this.releaseName = releaseName;
        this.releaseIdentifier = releaseIdentifier;
        this.scopeItemsCount = scopeItemsCount;
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

    public ProjectTypeEnum getType() {
        return type;
    }

    public void setType(ProjectTypeEnum type) {
        this.type = type;
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

    public int getScopeItemsCount() {
        return scopeItemsCount;
    }

    public void setScopeItemsCount(int scopeItemsCount) {
        this.scopeItemsCount = scopeItemsCount;
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
        return "ProjectResponse{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", type=" + type +
                ", releaseId=" + releaseId +
                ", releaseName='" + releaseName + '\'' +
                ", releaseIdentifier='" + releaseIdentifier + '\'' +
                ", scopeItemsCount=" + scopeItemsCount +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}


