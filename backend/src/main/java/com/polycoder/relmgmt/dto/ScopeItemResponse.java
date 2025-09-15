package com.polycoder.relmgmt.dto;

import com.polycoder.relmgmt.entity.ScopeItem;

import java.time.LocalDateTime;

public class ScopeItemResponse {

    private Long id;
    private String name;
    private String description;
    private Long releaseId;
    private String releaseName;
    private String releaseIdentifier;
    private Double functionalDesignDays;
    private Double sitDays;
    private Double uatDays;
    private int componentsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public ScopeItemResponse() {}

    // Constructor from entity
    public ScopeItemResponse(ScopeItem scopeItem) {
        this.id = scopeItem.getId();
        this.name = scopeItem.getName();
        this.description = scopeItem.getDescription();
        this.releaseId = scopeItem.getRelease() != null ? scopeItem.getRelease().getId() : null;
        this.releaseName = scopeItem.getRelease() != null ? scopeItem.getRelease().getName() : null;
        this.releaseIdentifier = scopeItem.getRelease() != null ? scopeItem.getRelease().getIdentifier() : null;
        this.functionalDesignDays = scopeItem.getFunctionalDesignDays();
        this.sitDays = scopeItem.getSitDays();
        this.uatDays = scopeItem.getUatDays();
        this.componentsCount = scopeItem.getComponents() != null ? scopeItem.getComponents().size() : 0;
        this.createdAt = scopeItem.getCreatedAt();
        this.updatedAt = scopeItem.getUpdatedAt();
    }

    // Constructor with all fields
    public ScopeItemResponse(Long id, String name, String description, Long releaseId, String releaseName, String releaseIdentifier, 
                           Double functionalDesignDays, Double sitDays, Double uatDays, int componentsCount, 
                           LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.releaseId = releaseId;
        this.releaseName = releaseName;
        this.releaseIdentifier = releaseIdentifier;
        this.functionalDesignDays = functionalDesignDays;
        this.sitDays = sitDays;
        this.uatDays = uatDays;
        this.componentsCount = componentsCount;
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

    public Double getFunctionalDesignDays() {
        return functionalDesignDays;
    }

    public void setFunctionalDesignDays(Double functionalDesignDays) {
        this.functionalDesignDays = functionalDesignDays;
    }

    public Double getSitDays() {
        return sitDays;
    }

    public void setSitDays(Double sitDays) {
        this.sitDays = sitDays;
    }

    public Double getUatDays() {
        return uatDays;
    }

    public void setUatDays(Double uatDays) {
        this.uatDays = uatDays;
    }

    public int getComponentsCount() {
        return componentsCount;
    }

    public void setComponentsCount(int componentsCount) {
        this.componentsCount = componentsCount;
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
                ", releaseId=" + releaseId +
                ", releaseName='" + releaseName + '\'' +
                ", releaseIdentifier='" + releaseIdentifier + '\'' +
                ", functionalDesignDays=" + functionalDesignDays +
                ", sitDays=" + sitDays +
                ", uatDays=" + uatDays +
                ", componentsCount=" + componentsCount +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}


