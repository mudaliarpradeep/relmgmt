package com.polycoder.relmgmt.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "releases", uniqueConstraints = {
    @UniqueConstraint(columnNames = "identifier")
})
public class Release extends BaseEntity {

    @NotBlank(message = "Release name is required")
    @Size(max = 100, message = "Release name must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Release identifier is required")
    @Size(max = 50, message = "Release identifier must not exceed 50 characters")
    @Column(nullable = false, unique = true, length = 50)
    private String identifier;

    @OneToMany(mappedBy = "release", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Phase> phases = new ArrayList<>();

    @OneToMany(mappedBy = "release", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Blocker> blockers = new ArrayList<>();

    // Default constructor
    public Release() {}

    // Constructor with required fields
    public Release(String name, String identifier) {
        this.name = name;
        this.identifier = identifier;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public List<Phase> getPhases() {
        return phases;
    }

    public void setPhases(List<Phase> phases) {
        this.phases = phases;
    }

    public List<Blocker> getBlockers() {
        return blockers;
    }

    public void setBlockers(List<Blocker> blockers) {
        this.blockers = blockers;
    }

    // Helper methods for managing relationships
    public void addPhase(Phase phase) {
        phases.add(phase);
        phase.setRelease(this);
    }

    public void removePhase(Phase phase) {
        phases.remove(phase);
        phase.setRelease(null);
    }

    public void addBlocker(Blocker blocker) {
        blockers.add(blocker);
        blocker.setRelease(this);
    }

    public void removeBlocker(Blocker blocker) {
        blockers.remove(blocker);
        blocker.setRelease(null);
    }

    @Override
    public String toString() {
        return "Release{" +
                "id=" + getId() +
                ", name='" + name + '\'' +
                ", identifier='" + identifier + '\'' +
                ", phases=" + phases.size() +
                ", blockers=" + blockers.size() +
                ", createdAt=" + getCreatedAt() +
                ", updatedAt=" + getUpdatedAt() +
                '}';
    }
} 