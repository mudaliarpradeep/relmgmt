package com.polycoder.relmgmt.dto;

import com.polycoder.relmgmt.entity.ComponentTypeEnum;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for returning scope item data with components.
 */
public class ScopeItemWithComponentsResponse extends ScopeItemResponse {
    
    private List<ComponentResponse> components;
    private String primaryComponent;
    private Double totalEffortDays;
    
    // Default constructor
    public ScopeItemWithComponentsResponse() {
        super();
    }
    
    // Constructor with all fields
    public ScopeItemWithComponentsResponse(Long id, String name, String description, 
                                         Long releaseId, Double functionalDesignDays, 
                                         Double sitDays, Double uatDays,
                                         List<ComponentResponse> components,
                                         LocalDateTime createdAt, LocalDateTime updatedAt) {
        super(id, name, description, releaseId, null, null, functionalDesignDays, sitDays, uatDays, 
              components != null ? components.size() : 0, createdAt, updatedAt);
        this.components = components;
        this.primaryComponent = determinePrimaryComponent(components);
        this.totalEffortDays = calculateTotalEffortDays(functionalDesignDays, sitDays, uatDays, components);
    }
    
    // Getters and Setters
    public List<ComponentResponse> getComponents() {
        return components;
    }
    
    public void setComponents(List<ComponentResponse> components) {
        this.components = components;
        this.primaryComponent = determinePrimaryComponent(components);
        this.totalEffortDays = calculateTotalEffortDays(getFunctionalDesignDays(), getSitDays(), getUatDays(), components);
    }
    
    public String getPrimaryComponent() {
        return primaryComponent;
    }
    
    public void setPrimaryComponent(String primaryComponent) {
        this.primaryComponent = primaryComponent;
    }
    
    public Double getTotalEffortDays() {
        return totalEffortDays;
    }
    
    public void setTotalEffortDays(Double totalEffortDays) {
        this.totalEffortDays = totalEffortDays;
    }
    
    /**
     * Determine the primary component based on component types and effort.
     * 
     * @param components list of components
     * @return primary component name or null if no components
     */
    private String determinePrimaryComponent(List<ComponentResponse> components) {
        if (components == null || components.isEmpty()) {
            return null;
        }
        
        // Find the component with the highest total effort
        ComponentResponse primaryComponent = components.stream()
                .max((c1, c2) -> Double.compare(
                        c1.getTotalEffortDays() != null ? c1.getTotalEffortDays() : 0.0,
                        c2.getTotalEffortDays() != null ? c2.getTotalEffortDays() : 0.0
                ))
                .orElse(null);
        
        return primaryComponent != null ? primaryComponent.getComponentType().getDisplayName() : null;
    }
    
    /**
     * Calculate total effort days including scope item and component efforts.
     * 
     * @param functionalDesignDays scope item functional design days
     * @param sitDays scope item SIT days
     * @param uatDays scope item UAT days
     * @param components list of components
     * @return total effort days
     */
    private Double calculateTotalEffortDays(Double functionalDesignDays, Double sitDays, Double uatDays, List<ComponentResponse> components) {
        double scopeItemTotal = (functionalDesignDays != null ? functionalDesignDays : 0.0) +
                               (sitDays != null ? sitDays : 0.0) +
                               (uatDays != null ? uatDays : 0.0);
        
        double componentsTotal = components != null ? components.stream()
                .mapToDouble(c -> c.getTotalEffortDays() != null ? c.getTotalEffortDays() : 0.0)
                .sum() : 0.0;
        
        return scopeItemTotal + componentsTotal;
    }
    
    @Override
    public String toString() {
        return "ScopeItemWithComponentsResponse{" +
                "id=" + getId() +
                ", name='" + getName() + '\'' +
                ", description='" + getDescription() + '\'' +
                ", releaseId=" + getReleaseId() +
                ", functionalDesignDays=" + getFunctionalDesignDays() +
                ", sitDays=" + getSitDays() +
                ", uatDays=" + getUatDays() +
                ", primaryComponent='" + primaryComponent + '\'' +
                ", totalEffortDays=" + totalEffortDays +
                ", componentsCount=" + (components != null ? components.size() : 0) +
                ", createdAt=" + getCreatedAt() +
                ", updatedAt=" + getUpdatedAt() +
                '}';
    }
}
