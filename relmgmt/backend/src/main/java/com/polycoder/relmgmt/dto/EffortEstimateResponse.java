package com.polycoder.relmgmt.dto;

import com.polycoder.relmgmt.entity.EffortEstimate;
import com.polycoder.relmgmt.entity.PhaseTypeEnum;
import com.polycoder.relmgmt.entity.SkillFunctionEnum;
import com.polycoder.relmgmt.entity.SkillSubFunctionEnum;

import java.time.LocalDateTime;

public class EffortEstimateResponse {

    private Long id;
    private SkillFunctionEnum skillFunction;
    private SkillSubFunctionEnum skillSubFunction;
    private PhaseTypeEnum phase;
    private Double effortDays;
    private Long scopeItemId;
    private String scopeItemName;
    private Long projectId;
    private String projectName;
    private Long releaseId;
    private String releaseName;
    private String releaseIdentifier;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public EffortEstimateResponse() {}

    // Constructor from entity
    public EffortEstimateResponse(EffortEstimate effortEstimate) {
        this.id = effortEstimate.getId();
        this.skillFunction = effortEstimate.getSkillFunction();
        this.skillSubFunction = effortEstimate.getSkillSubFunction();
        this.phase = effortEstimate.getPhase();
        this.effortDays = effortEstimate.getEffortDays();
        this.scopeItemId = effortEstimate.getScopeItem() != null ? effortEstimate.getScopeItem().getId() : null;
        this.scopeItemName = effortEstimate.getScopeItem() != null ? effortEstimate.getScopeItem().getName() : null;
        this.projectId = effortEstimate.getScopeItem() != null && effortEstimate.getScopeItem().getProject() != null ? effortEstimate.getScopeItem().getProject().getId() : null;
        this.projectName = effortEstimate.getScopeItem() != null && effortEstimate.getScopeItem().getProject() != null ? effortEstimate.getScopeItem().getProject().getName() : null;
        this.releaseId = effortEstimate.getScopeItem() != null && effortEstimate.getScopeItem().getProject() != null && effortEstimate.getScopeItem().getProject().getRelease() != null ? effortEstimate.getScopeItem().getProject().getRelease().getId() : null;
        this.releaseName = effortEstimate.getScopeItem() != null && effortEstimate.getScopeItem().getProject() != null && effortEstimate.getScopeItem().getProject().getRelease() != null ? effortEstimate.getScopeItem().getProject().getRelease().getName() : null;
        this.releaseIdentifier = effortEstimate.getScopeItem() != null && effortEstimate.getScopeItem().getProject() != null && effortEstimate.getScopeItem().getProject().getRelease() != null ? effortEstimate.getScopeItem().getProject().getRelease().getIdentifier() : null;
        this.createdAt = effortEstimate.getCreatedAt();
        this.updatedAt = effortEstimate.getUpdatedAt();
    }

    // Constructor with all fields
    public EffortEstimateResponse(Long id, SkillFunctionEnum skillFunction, SkillSubFunctionEnum skillSubFunction, PhaseTypeEnum phase, Double effortDays, Long scopeItemId, String scopeItemName, Long projectId, String projectName, Long releaseId, String releaseName, String releaseIdentifier, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.skillFunction = skillFunction;
        this.skillSubFunction = skillSubFunction;
        this.phase = phase;
        this.effortDays = effortDays;
        this.scopeItemId = scopeItemId;
        this.scopeItemName = scopeItemName;
        this.projectId = projectId;
        this.projectName = projectName;
        this.releaseId = releaseId;
        this.releaseName = releaseName;
        this.releaseIdentifier = releaseIdentifier;
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

    public SkillFunctionEnum getSkillFunction() {
        return skillFunction;
    }

    public void setSkillFunction(SkillFunctionEnum skillFunction) {
        this.skillFunction = skillFunction;
    }

    public SkillSubFunctionEnum getSkillSubFunction() {
        return skillSubFunction;
    }

    public void setSkillSubFunction(SkillSubFunctionEnum skillSubFunction) {
        this.skillSubFunction = skillSubFunction;
    }

    public PhaseTypeEnum getPhase() {
        return phase;
    }

    public void setPhase(PhaseTypeEnum phase) {
        this.phase = phase;
    }

    public Double getEffortDays() {
        return effortDays;
    }

    public void setEffortDays(Double effortDays) {
        this.effortDays = effortDays;
    }

    public Long getScopeItemId() {
        return scopeItemId;
    }

    public void setScopeItemId(Long scopeItemId) {
        this.scopeItemId = scopeItemId;
    }

    public String getScopeItemName() {
        return scopeItemName;
    }

    public void setScopeItemName(String scopeItemName) {
        this.scopeItemName = scopeItemName;
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
        return "EffortEstimateResponse{" +
                "id=" + id +
                ", skillFunction=" + skillFunction +
                ", skillSubFunction=" + skillSubFunction +
                ", phase=" + phase +
                ", effortDays=" + effortDays +
                ", scopeItemId=" + scopeItemId +
                ", scopeItemName='" + scopeItemName + '\'' +
                ", projectId=" + projectId +
                ", projectName='" + projectName + '\'' +
                ", releaseId=" + releaseId +
                ", releaseName='" + releaseName + '\'' +
                ", releaseIdentifier='" + releaseIdentifier + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}


