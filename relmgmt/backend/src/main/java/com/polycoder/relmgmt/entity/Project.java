package com.polycoder.relmgmt.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project extends BaseEntity {

    @NotBlank(message = "Project name is required")
    @Size(max = 100, message = "Project name must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @Size(max = 500, message = "Project description must not exceed 500 characters")
    @Column(length = 500)
    private String description;

    @NotNull(message = "Project type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProjectTypeEnum type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "release_id", nullable = false)
    private Release release;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ScopeItem> scopeItems = new ArrayList<>();

    // Default constructor
    public Project() {}

    // Constructor with required fields
    public Project(String name, ProjectTypeEnum type, Release release) {
        this.name = name;
        this.type = type;
        this.release = release;
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

    public ProjectTypeEnum getType() {
        return type;
    }

    public void setType(ProjectTypeEnum type) {
        this.type = type;
    }

    public Release getRelease() {
        return release;
    }

    public void setRelease(Release release) {
        this.release = release;
    }

    public List<ScopeItem> getScopeItems() {
        return scopeItems;
    }

    public void setScopeItems(List<ScopeItem> scopeItems) {
        this.scopeItems = scopeItems;
    }

    // Helper methods for managing relationships
    public void addScopeItem(ScopeItem scopeItem) {
        scopeItems.add(scopeItem);
        scopeItem.setProject(this);
    }

    public void removeScopeItem(ScopeItem scopeItem) {
        scopeItems.remove(scopeItem);
        scopeItem.setProject(null);
    }

    @Override
    public String toString() {
        return "Project{" +
                "id=" + getId() +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", type=" + type +
                ", releaseId=" + (release != null ? release.getId() : null) +
                ", scopeItemsCount=" + scopeItems.size() +
                '}';
    }
}
