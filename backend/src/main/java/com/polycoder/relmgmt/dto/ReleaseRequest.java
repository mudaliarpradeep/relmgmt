package com.polycoder.relmgmt.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public class ReleaseRequest {

    @NotBlank(message = "Release name is required")
    @Size(max = 100, message = "Release name must not exceed 100 characters")
    private String name;

    @Size(max = 50, message = "Release identifier must not exceed 50 characters")
    private String identifier;

    private String status; // enum name from client

    @NotEmpty(message = "At least one phase is required")
    @Valid
    private List<PhaseRequest> phases;

    private List<BlockerRequest> blockers;

    // Default constructor
    public ReleaseRequest() {}

    // Constructor with required fields
    public ReleaseRequest(String name, String identifier, List<PhaseRequest> phases) {
        this.name = name;
        this.identifier = identifier;
        this.phases = phases;
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

    public List<PhaseRequest> getPhases() {
        return phases;
    }

    public void setPhases(List<PhaseRequest> phases) {
        this.phases = phases;
    }

     public String getStatus() {
         return status;
     }

     public void setStatus(String status) {
         this.status = status;
     }

    public List<BlockerRequest> getBlockers() {
        return blockers;
    }

    public void setBlockers(List<BlockerRequest> blockers) {
        this.blockers = blockers;
    }
} 