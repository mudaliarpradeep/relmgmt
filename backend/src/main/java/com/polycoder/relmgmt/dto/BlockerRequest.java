package com.polycoder.relmgmt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BlockerRequest {

    @NotBlank(message = "Blocker description is required")
    @Size(max = 500, message = "Blocker description must not exceed 500 characters")
    private String description;

    private String status = "OPEN"; // Default status

    // Default constructor
    public BlockerRequest() {}

    // Constructor with required fields
    public BlockerRequest(String description) {
        this.description = description;
    }

    // Constructor with all fields
    public BlockerRequest(String description, String status) {
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
} 