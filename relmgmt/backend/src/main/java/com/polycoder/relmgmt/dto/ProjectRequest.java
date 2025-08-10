package com.polycoder.relmgmt.dto;

import com.polycoder.relmgmt.entity.ProjectTypeEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ProjectRequest {

    @NotBlank(message = "Project name is required")
    @Size(max = 100, message = "Project name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Project description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Project type is required")
    private ProjectTypeEnum type;

    // Default constructor
    public ProjectRequest() {}

    // Constructor with required fields
    public ProjectRequest(String name, ProjectTypeEnum type) {
        this.name = name;
        this.type = type;
    }

    // Constructor with all fields
    public ProjectRequest(String name, String description, ProjectTypeEnum type) {
        this.name = name;
        this.description = description;
        this.type = type;
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

    @Override
    public String toString() {
        return "ProjectRequest{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", type=" + type +
                '}';
    }
}


