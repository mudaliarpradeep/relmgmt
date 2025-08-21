package com.polycoder.relmgmt.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a scope item within a release.
 * Each scope item has its own effort estimates for functional design, SIT, and UAT phases.
 */
@Entity
@Table(name = "scope_items")
public class ScopeItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "release_id", nullable = false)
    private Release release;

    @NotBlank(message = "Scope item name is required")
    @Size(max = 100, message = "Scope item name must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @Size(max = 500, message = "Scope item description must not exceed 500 characters")
    @Column(length = 500)
    private String description;

    @NotNull(message = "Functional design days is required")
    @Min(value = 1, message = "Functional design days must be at least 1")
    @Max(value = 1000, message = "Functional design days cannot exceed 1000")
    @Column(name = "functional_design_days", nullable = false)
    private Double functionalDesignDays = 0.0;

    @NotNull(message = "SIT days is required")
    @Min(value = 1, message = "SIT days must be at least 1")
    @Max(value = 1000, message = "SIT days cannot exceed 1000")
    @Column(name = "sit_days", nullable = false)
    private Double sitDays = 0.0;

    @NotNull(message = "UAT days is required")
    @Min(value = 1, message = "UAT days must be at least 1")
    @Max(value = 1000, message = "UAT days cannot exceed 1000")
    @Column(name = "uat_days", nullable = false)
    private Double uatDays = 0.0;

    @OneToMany(mappedBy = "scopeItem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Component> components = new ArrayList<>();

    // Default constructor
    public ScopeItem() {}

    // Constructor with required fields
    public ScopeItem(String name, Release release) {
        this.name = name;
        this.release = release;
    }

    // Getters and Setters
    public Release getRelease() {
        return release;
    }

    public void setRelease(Release release) {
        this.release = release;
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

    public List<Component> getComponents() {
        return components;
    }

    public void setComponents(List<Component> components) {
        this.components = components;
    }

    // Helper methods for managing relationships
    public void addComponent(Component component) {
        components.add(component);
        component.setScopeItem(this);
    }

    public void removeComponent(Component component) {
        components.remove(component);
        component.setScopeItem(null);
    }

    /**
     * Get the total effort days for this scope item (functional design + SIT + UAT).
     * 
     * @return the total effort days
     */
    public Double getTotalEffortDays() {
        return (functionalDesignDays != null ? functionalDesignDays : 0.0) + 
               (sitDays != null ? sitDays : 0.0) + 
               (uatDays != null ? uatDays : 0.0);
    }

    @Override
    public String toString() {
        return "ScopeItem{" +
                "id=" + getId() +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", functionalDesignDays=" + functionalDesignDays +
                ", sitDays=" + sitDays +
                ", uatDays=" + uatDays +
                ", releaseId=" + (release != null ? release.getId() : null) +
                ", componentsCount=" + components.size() +
                '}';
    }
}
