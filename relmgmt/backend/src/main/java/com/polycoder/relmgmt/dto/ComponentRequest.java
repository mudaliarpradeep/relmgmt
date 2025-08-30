package com.polycoder.relmgmt.dto;

import com.polycoder.relmgmt.entity.ComponentTypeEnum;
import jakarta.validation.constraints.*;

/**
 * DTO for creating and updating components.
 */
public class ComponentRequest {
    
    @NotBlank(message = "Component name is required")
    @Size(max = 100, message = "Component name must not exceed 100 characters")
    private String name;
    
    @NotNull(message = "Component type is required")
    private ComponentTypeEnum componentType;
    
    @NotNull(message = "Technical design days is required")
    @Min(value = 0, message = "Technical design days must be at least 0")
    @Max(value = 1000, message = "Technical design days cannot exceed 1000")
    private Double technicalDesignDays;
    
    @NotNull(message = "Build days is required")
    @Min(value = 0, message = "Build days must be at least 0")
    @Max(value = 1000, message = "Build days cannot exceed 1000")
    private Double buildDays;
    
    // Default constructor
    public ComponentRequest() {}
    
    // Constructor with all fields
    public ComponentRequest(String name, ComponentTypeEnum componentType, Double technicalDesignDays, Double buildDays) {
        this.name = name;
        this.componentType = componentType;
        this.technicalDesignDays = technicalDesignDays;
        this.buildDays = buildDays;
    }
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public ComponentTypeEnum getComponentType() {
        return componentType;
    }
    
    public void setComponentType(ComponentTypeEnum componentType) {
        this.componentType = componentType;
    }
    
    public Double getTechnicalDesignDays() {
        return technicalDesignDays;
    }
    
    public void setTechnicalDesignDays(Double technicalDesignDays) {
        this.technicalDesignDays = technicalDesignDays;
    }
    
    public Double getBuildDays() {
        return buildDays;
    }
    
    public void setBuildDays(Double buildDays) {
        this.buildDays = buildDays;
    }
    
    @Override
    public String toString() {
        return "ComponentRequest{" +
                "name='" + name + '\'' +
                ", componentType=" + componentType +
                ", technicalDesignDays=" + technicalDesignDays +
                ", buildDays=" + buildDays +
                '}';
    }
}
