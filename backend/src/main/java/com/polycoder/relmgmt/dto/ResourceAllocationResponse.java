package com.polycoder.relmgmt.dto;

import java.util.List;

/**
 * DTO for resource allocation data with weekly allocations
 */
public class ResourceAllocationResponse {
    private String id;
    private String name;
    private String grade;
    private String skillFunction;
    private String skillSubFunction;
    private String profileUrl;
    private List<WeeklyAllocationResponse> weeklyAllocations;

    // Constructors
    public ResourceAllocationResponse() {}

    public ResourceAllocationResponse(String id, String name, String grade, String skillFunction, 
                                    String skillSubFunction, String profileUrl, 
                                    List<WeeklyAllocationResponse> weeklyAllocations) {
        this.id = id;
        this.name = name;
        this.grade = grade;
        this.skillFunction = skillFunction;
        this.skillSubFunction = skillSubFunction;
        this.profileUrl = profileUrl;
        this.weeklyAllocations = weeklyAllocations;
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
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

    public String getProfileUrl() {
        return profileUrl;
    }

    public void setProfileUrl(String profileUrl) {
        this.profileUrl = profileUrl;
    }

    public List<WeeklyAllocationResponse> getWeeklyAllocations() {
        return weeklyAllocations;
    }

    public void setWeeklyAllocations(List<WeeklyAllocationResponse> weeklyAllocations) {
        this.weeklyAllocations = weeklyAllocations;
    }
}
