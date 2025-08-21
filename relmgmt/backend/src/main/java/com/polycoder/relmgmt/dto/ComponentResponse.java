package com.polycoder.relmgmt.dto;

import com.polycoder.relmgmt.entity.ComponentTypeEnum;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for returning component data.
 */
public class ComponentResponse {
    
    private Long id;
    private String name;
    private ComponentTypeEnum componentType;
    private Double technicalDesignDays;
    private Double buildDays;
    private Long scopeItemId;
    private List<EffortEstimateResponse> effortEstimates;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Default constructor
    public ComponentResponse() {}
    
    // Constructor from entity
    public ComponentResponse(com.polycoder.relmgmt.entity.Component component) {
        this.id = component.getId();
        this.name = component.getName();
        this.componentType = component.getComponentType();
        this.technicalDesignDays = component.getTechnicalDesignDays();
        this.buildDays = component.getBuildDays();
        this.scopeItemId = component.getScopeItem() != null ? component.getScopeItem().getId() : null;
        this.effortEstimates = component.getEffortEstimates() != null ? 
            component.getEffortEstimates().stream()
                .map(effortEstimate -> new EffortEstimateResponse(effortEstimate))
                .collect(java.util.stream.Collectors.toList()) : null;
        this.createdAt = component.getCreatedAt();
        this.updatedAt = component.getUpdatedAt();
    }
    
    // Constructor with all fields
    public ComponentResponse(Long id, String name, ComponentTypeEnum componentType, 
                           Double technicalDesignDays, Double buildDays, Long scopeItemId,
                           List<EffortEstimateResponse> effortEstimates, 
                           LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.componentType = componentType;
        this.technicalDesignDays = technicalDesignDays;
        this.buildDays = buildDays;
        this.scopeItemId = scopeItemId;
        this.effortEstimates = effortEstimates;
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
    
    public ComponentTypeEnum getComponentType() {
        return componentType;
    }
    
    public void setComponentType(ComponentTypeEnum componentType) {
        this.componentType = componentType;
    }
    
    public Double getTechnicalDesignDays() {
        return technicalDesignDays;
    }
    
    public void setTechnicalDesignDays(Double technicalDesignDays) {
        this.technicalDesignDays = technicalDesignDays;
    }
    
    public Double getBuildDays() {
        return buildDays;
    }
    
    public void setBuildDays(Double buildDays) {
        this.buildDays = buildDays;
    }
    
    public Long getScopeItemId() {
        return scopeItemId;
    }
    
    public void setScopeItemId(Long scopeItemId) {
        this.scopeItemId = scopeItemId;
    }
    
    public List<EffortEstimateResponse> getEffortEstimates() {
        return effortEstimates;
    }
    
    public void setEffortEstimates(List<EffortEstimateResponse> effortEstimates) {
        this.effortEstimates = effortEstimates;
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
    
    /**
     * Get the total effort days for this component (technical design + build).
     * 
     * @return the total effort days
     */
    public Double getTotalEffortDays() {
        return (technicalDesignDays != null ? technicalDesignDays : 0.0) + 
               (buildDays != null ? buildDays : 0.0);
    }
    
    @Override
    public String toString() {
        return "ComponentResponse{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", componentType=" + componentType +
                ", technicalDesignDays=" + technicalDesignDays +
                ", buildDays=" + buildDays +
                ", scopeItemId=" + scopeItemId +
                ", effortEstimatesCount=" + (effortEstimates != null ? effortEstimates.size() : 0) +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
