package com.polycoder.relmgmt.dto;

import jakarta.validation.constraints.*;
import java.util.ArrayList;
import java.util.List;

public class ScopeItemRequest {

    @NotBlank(message = "Scope item name is required")
    @Size(max = 100, message = "Scope item name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Scope item description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Functional design days is required")
    @Min(value = 0, message = "Functional design days must be at least 0")
    @Max(value = 1000, message = "Functional design days cannot exceed 1000")
    private Double functionalDesignDays;

    @NotNull(message = "SIT days is required")
    @Min(value = 0, message = "SIT days must be at least 0")
    @Max(value = 1000, message = "SIT days cannot exceed 1000")
    private Double sitDays;

    @NotNull(message = "UAT days is required")
    @Min(value = 0, message = "UAT days must be at least 0")
    @Max(value = 1000, message = "UAT days cannot exceed 1000")
    private Double uatDays;

    private List<ComponentRequest> components = new ArrayList<>();

    // Default constructor
    public ScopeItemRequest() {}

    // Constructor with required fields
    public ScopeItemRequest(String name) {
        this.name = name;
    }

    // Constructor with all fields
    public ScopeItemRequest(String name, String description, Double functionalDesignDays, Double sitDays, Double uatDays, List<ComponentRequest> components) {
        this.name = name;
        this.description = description;
        this.functionalDesignDays = functionalDesignDays;
        this.sitDays = sitDays;
        this.uatDays = uatDays;
        this.components = components;
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

    public List<ComponentRequest> getComponents() {
        return components;
    }

    public void setComponents(List<ComponentRequest> components) {
        this.components = components;
    }

    @Override
    public String toString() {
        return "ScopeItemRequest{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", functionalDesignDays=" + functionalDesignDays +
                ", sitDays=" + sitDays +
                ", uatDays=" + uatDays +
                ", componentsCount=" + (components != null ? components.size() : 0) +
                '}';
    }
}


