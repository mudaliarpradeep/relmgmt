package com.polycoder.relmgmt.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "scope_items")
public class ScopeItem extends BaseEntity {

    @NotBlank(message = "Scope item name is required")
    @Size(max = 100, message = "Scope item name must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @Size(max = 500, message = "Scope item description must not exceed 500 characters")
    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @OneToMany(mappedBy = "scopeItem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<EffortEstimate> effortEstimates = new ArrayList<>();

    // Default constructor
    public ScopeItem() {}

    // Constructor with required fields
    public ScopeItem(String name, Project project) {
        this.name = name;
        this.project = project;
    }

    // Getters and Setters
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

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public List<EffortEstimate> getEffortEstimates() {
        return effortEstimates;
    }

    public void setEffortEstimates(List<EffortEstimate> effortEstimates) {
        this.effortEstimates = effortEstimates;
    }

    // Helper methods for managing relationships
    public void addEffortEstimate(EffortEstimate effortEstimate) {
        effortEstimates.add(effortEstimate);
        effortEstimate.setScopeItem(this);
    }

    public void removeEffortEstimate(EffortEstimate effortEstimate) {
        effortEstimates.remove(effortEstimate);
        effortEstimate.setScopeItem(null);
    }

    @Override
    public String toString() {
        return "ScopeItem{" +
                "id=" + getId() +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", projectId=" + (project != null ? project.getId() : null) +
                ", effortEstimatesCount=" + effortEstimates.size() +
                '}';
    }
}
