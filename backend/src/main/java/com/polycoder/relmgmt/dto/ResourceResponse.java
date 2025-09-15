package com.polycoder.relmgmt.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ResourceResponse {

    private Long id;
    private String name;
    private String employeeNumber;
    private String email;
    private String status;
    private LocalDate projectStartDate;
    private LocalDate projectEndDate;
    private String employeeGrade;
    private String skillFunction;
    private String skillSubFunction;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public ResourceResponse() {}

    // Constructor with all fields
    public ResourceResponse(Long id, String name, String employeeNumber, String email, String status,
                           LocalDate projectStartDate, LocalDate projectEndDate, String employeeGrade,
                           String skillFunction, String skillSubFunction, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.employeeNumber = employeeNumber;
        this.email = email;
        this.status = status;
        this.projectStartDate = projectStartDate;
        this.projectEndDate = projectEndDate;
        this.employeeGrade = employeeGrade;
        this.skillFunction = skillFunction;
        this.skillSubFunction = skillSubFunction;
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

    public String getEmployeeNumber() {
        return employeeNumber;
    }

    public void setEmployeeNumber(String employeeNumber) {
        this.employeeNumber = employeeNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getProjectStartDate() {
        return projectStartDate;
    }

    public void setProjectStartDate(LocalDate projectStartDate) {
        this.projectStartDate = projectStartDate;
    }

    public LocalDate getProjectEndDate() {
        return projectEndDate;
    }

    public void setProjectEndDate(LocalDate projectEndDate) {
        this.projectEndDate = projectEndDate;
    }

    public String getEmployeeGrade() {
        return employeeGrade;
    }

    public void setEmployeeGrade(String employeeGrade) {
        this.employeeGrade = employeeGrade;
    }

    public String getSkillFunction() {
        return skillFunction;
    }

    public void setSkillFunction(String skillFunction) {
        this.skillFunction = skillFunction;
    }

    public String getSkillSubFunction() {
        return skillSubFunction;
    }

    public void setSkillSubFunction(String skillSubFunction) {
        this.skillSubFunction = skillSubFunction;
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