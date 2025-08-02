package com.polycoder.relmgmt.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Entity
@Table(name = "resources", uniqueConstraints = {
    @UniqueConstraint(columnNames = "employeeNumber")
})
public class Resource extends BaseEntity {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Employee number is required")
    @Size(min = 8, max = 8, message = "Employee number must be exactly 8 characters")
    @Column(name = "employee_number", nullable = false, unique = true, length = 8)
    private String employeeNumber;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String email;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusEnum status;

    @NotNull(message = "Project start date is required")
    @Column(name = "project_start_date", nullable = false)
    private LocalDate projectStartDate;

    @Column(name = "project_end_date")
    private LocalDate projectEndDate;

    @NotNull(message = "Employee grade is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "employee_grade", nullable = false, length = 20)
    private EmployeeGradeEnum employeeGrade;

    @NotNull(message = "Skill function is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "skill_function", nullable = false, length = 50)
    private SkillFunctionEnum skillFunction;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_sub_function", length = 50)
    private SkillSubFunctionEnum skillSubFunction;

    // Default constructor
    public Resource() {}

    // Constructor with required fields
    public Resource(String name, String employeeNumber, String email, StatusEnum status, 
                   LocalDate projectStartDate, EmployeeGradeEnum employeeGrade, 
                   SkillFunctionEnum skillFunction) {
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

    public StatusEnum getStatus() {
        return status;
    }

    public void setStatus(StatusEnum status) {
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

    public EmployeeGradeEnum getEmployeeGrade() {
        return employeeGrade;
    }

    public void setEmployeeGrade(EmployeeGradeEnum employeeGrade) {
        this.employeeGrade = employeeGrade;
    }

    public SkillFunctionEnum getSkillFunction() {
        return skillFunction;
    }

    public void setSkillFunction(SkillFunctionEnum skillFunction) {
        this.skillFunction = skillFunction;
    }

    public SkillSubFunctionEnum getSkillSubFunction() {
        return skillSubFunction;
    }

    public void setSkillSubFunction(SkillSubFunctionEnum skillSubFunction) {
        this.skillSubFunction = skillSubFunction;
    }

    @Override
    public String toString() {
        return "Resource{" +
                "id=" + getId() +
                ", name='" + name + '\'' +
                ", employeeNumber='" + employeeNumber + '\'' +
                ", email='" + email + '\'' +
                ", status=" + status +
                ", projectStartDate=" + projectStartDate +
                ", projectEndDate=" + projectEndDate +
                ", employeeGrade=" + employeeGrade +
                ", skillFunction=" + skillFunction +
                ", skillSubFunction=" + skillSubFunction +
                ", createdAt=" + getCreatedAt() +
                ", updatedAt=" + getUpdatedAt() +
                '}';
    }
}