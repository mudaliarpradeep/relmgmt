package com.polycoder.relmgmt.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ReleaseResponse {

    private Long id;
    private String name;
    private String identifier;
    private List<PhaseResponse> phases;
    private List<BlockerResponse> blockers;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public ReleaseResponse() {}

    // Constructor with required fields
    public ReleaseResponse(Long id, String name, String identifier) {
        this.id = id;
        this.name = name;
        this.identifier = identifier;
    }

    // Constructor with all fields
    public ReleaseResponse(Long id, String name, String identifier, 
                          List<PhaseResponse> phases, List<BlockerResponse> blockers,
                          LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.identifier = identifier;
        this.phases = phases;
        this.blockers = blockers;
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

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public List<PhaseResponse> getPhases() {
        return phases;
    }

    public void setPhases(List<PhaseResponse> phases) {
        this.phases = phases;
    }

    public List<BlockerResponse> getBlockers() {
        return blockers;
    }

    public void setBlockers(List<BlockerResponse> blockers) {
        this.blockers = blockers;
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
} 