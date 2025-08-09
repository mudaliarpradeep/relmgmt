package com.polycoder.relmgmt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ScopeItemRequest {

    @NotBlank(message = "Scope item name is required")
    @Size(max = 100, message = "Scope item name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Scope item description must not exceed 500 characters")
    private String description;

    // Default constructor
    public ScopeItemRequest() {}

    // Constructor with required fields
    public ScopeItemRequest(String name) {
        this.name = name;
    }

    // Constructor with all fields
    public ScopeItemRequest(String name, String description) {
        this.name = name;
        this.description = description;
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

    @Override
    public String toString() {
        return "ScopeItemRequest{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}

