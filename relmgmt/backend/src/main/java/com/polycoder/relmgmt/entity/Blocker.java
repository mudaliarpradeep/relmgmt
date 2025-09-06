package com.polycoder.relmgmt.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "blockers")
public class Blocker extends BaseEntity {

    @NotBlank(message = "Blocker description is required")
    @Size(max = 500, message = "Blocker description must not exceed 500 characters")
    @Column(nullable = false, length = 500)
    private String description;

    @NotNull(message = "Blocker status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BlockerStatusEnum status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "release_id", nullable = false)
    @JsonIgnore
    private Release release;

    // Default constructor
    public Blocker() {}

    // Constructor with required fields
    public Blocker(String description, BlockerStatusEnum status) {
        this.description = description;
        this.status = status;
    }

    // Getters and Setters
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BlockerStatusEnum getStatus() {
        return status;
    }

    public void setStatus(BlockerStatusEnum status) {
        this.status = status;
    }

    public Release getRelease() {
        return release;
    }

    public void setRelease(Release release) {
        this.release = release;
    }

    @Override
    public String toString() {
        return "Blocker{" +
                "id=" + getId() +
                ", description='" + description + '\'' +
                ", status=" + status +
                ", releaseId=" + (release != null ? release.getId() : null) +
                ", createdAt=" + getCreatedAt() +
                ", updatedAt=" + getUpdatedAt() +
                '}';
    }
} 