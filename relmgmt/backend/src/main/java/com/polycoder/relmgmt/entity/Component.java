package com.polycoder.relmgmt.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a component within a scope item.
 * Each component has its own effort estimates for technical design and build phases.
 */
@Entity
@Table(name = "components")
@EntityListeners(AuditingEntityListener.class)
public class Component extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scope_item_id", nullable = false)
    private ScopeItem scopeItem;
    
    @NotBlank(message = "Component name is required")
    @Size(max = 100, message = "Component name must not exceed 100 characters")
    @Column(nullable = false)
    private String name;
    
    @NotNull(message = "Component type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "component_type", nullable = false)
    private ComponentTypeEnum componentType;
    
    @NotNull(message = "Technical design days is required")
    @Min(value = 1, message = "Technical design days must be at least 1")
    @Max(value = 1000, message = "Technical design days cannot exceed 1000")
    @Column(name = "technical_design_days", nullable = false)
    private Double technicalDesignDays = 0.0;
    
    @NotNull(message = "Build days is required")
    @Min(value = 1, message = "Build days must be at least 1")
    @Max(value = 1000, message = "Build days cannot exceed 1000")
    @Column(name = "build_days", nullable = false)
    private Double buildDays = 0.0;
    
    @OneToMany(mappedBy = "component", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EffortEstimate> effortEstimates = new ArrayList<>();
    
    // Constructors
    public Component() {}
    
    public Component(String name, ComponentTypeEnum componentType, Double technicalDesignDays, Double buildDays) {
        this.name = name;
        this.componentType = componentType;
        this.technicalDesignDays = technicalDesignDays;
        this.buildDays = buildDays;
    }
    
    // Getters and Setters
    public ScopeItem getScopeItem() {
        return scopeItem;
    }
    
    public void setScopeItem(ScopeItem scopeItem) {
        this.scopeItem = scopeItem;
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
    
    public List<EffortEstimate> getEffortEstimates() {
        return effortEstimates;
    }
    
    public void setEffortEstimates(List<EffortEstimate> effortEstimates) {
        this.effortEstimates = effortEstimates;
    }
    
    /**
     * Add an effort estimate to this component.
     * 
     * @param effortEstimate the effort estimate to add
     */
    public void addEffortEstimate(EffortEstimate effortEstimate) {
        effortEstimates.add(effortEstimate);
        effortEstimate.setComponent(this);
    }
    
    /**
     * Remove an effort estimate from this component.
     * 
     * @param effortEstimate the effort estimate to remove
     */
    public void removeEffortEstimate(EffortEstimate effortEstimate) {
        effortEstimates.remove(effortEstimate);
        effortEstimate.setComponent(null);
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
        return "Component{" +
                "id=" + getId() +
                ", name='" + name + '\'' +
                ", componentType=" + componentType +
                ", technicalDesignDays=" + technicalDesignDays +
                ", buildDays=" + buildDays +
                ", scopeItemId=" + (scopeItem != null ? scopeItem.getId() : null) +
                '}';
    }
}
