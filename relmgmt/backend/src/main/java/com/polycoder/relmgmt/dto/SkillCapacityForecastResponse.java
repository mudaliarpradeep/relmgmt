package com.polycoder.relmgmt.dto;

import com.polycoder.relmgmt.entity.SkillFunctionEnum;
import com.polycoder.relmgmt.entity.SkillSubFunctionEnum;

import java.time.LocalDate;

public class SkillCapacityForecastResponse {
    private SkillFunctionEnum skillFunction;
    private SkillSubFunctionEnum skillSubFunction;
    private LocalDate weekStarting;
    private Double allocatedDays;
    private Double capacity;
    private Double availableDays;

    public SkillCapacityForecastResponse() {}

    public SkillCapacityForecastResponse(SkillFunctionEnum skillFunction,
                                         SkillSubFunctionEnum skillSubFunction,
                                         LocalDate weekStarting,
                                         Double allocatedDays,
                                         Double capacity,
                                         Double availableDays) {
        this.skillFunction = skillFunction;
        this.skillSubFunction = skillSubFunction;
        this.weekStarting = weekStarting;
        this.allocatedDays = allocatedDays;
        this.capacity = capacity;
        this.availableDays = availableDays;
    }

    public SkillFunctionEnum getSkillFunction() { return skillFunction; }
    public void setSkillFunction(SkillFunctionEnum skillFunction) { this.skillFunction = skillFunction; }
    public SkillSubFunctionEnum getSkillSubFunction() { return skillSubFunction; }
    public void setSkillSubFunction(SkillSubFunctionEnum skillSubFunction) { this.skillSubFunction = skillSubFunction; }
    public LocalDate getWeekStarting() { return weekStarting; }
    public void setWeekStarting(LocalDate weekStarting) { this.weekStarting = weekStarting; }
    public Double getAllocatedDays() { return allocatedDays; }
    public void setAllocatedDays(Double allocatedDays) { this.allocatedDays = allocatedDays; }
    public Double getCapacity() { return capacity; }
    public void setCapacity(Double capacity) { this.capacity = capacity; }
    public Double getAvailableDays() { return availableDays; }
    public void setAvailableDays(Double availableDays) { this.availableDays = availableDays; }
}





