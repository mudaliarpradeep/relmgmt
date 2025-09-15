package com.polycoder.relmgmt.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class ResourceRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Employee number is required")
    @Size(min = 8, max = 8, message = "Employee number must be exactly 8 characters")
    private String employeeNumber;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @NotBlank(message = "Status is required")
    private String status;

    @NotNull(message = "Project start date is required")
    private LocalDate projectStartDate;

    private LocalDate projectEndDate;

    @NotBlank(message = "Employee grade is required")
    private String employeeGrade;

    @NotBlank(message = "Skill function is required")
    private String skillFunction;

    private String skillSubFunction;

    // Default constructor
    public ResourceRequest() {}

    // Constructor with required fields
    public ResourceRequest(String name, String employeeNumber, String email, String status,
                          LocalDate projectStartDate, String employeeGrade, String skillFunction) {
        this.name = name;
        this.employeeNumber = employeeNumber;
        this.email = email;
        this.status = status;
        this.projectStartDate = projectStartDate;
        this.employeeGrade = employeeGrade;
        this.skillFunction = skillFunction;
    }

    // Getters and Setters
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
}