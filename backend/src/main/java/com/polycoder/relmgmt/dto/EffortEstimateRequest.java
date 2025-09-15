package com.polycoder.relmgmt.dto;

import com.polycoder.relmgmt.entity.PhaseTypeEnum;
import com.polycoder.relmgmt.entity.SkillFunctionEnum;
import com.polycoder.relmgmt.entity.SkillSubFunctionEnum;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class EffortEstimateRequest {

    @NotNull(message = "Skill function is required")
    private SkillFunctionEnum skillFunction;

    private SkillSubFunctionEnum skillSubFunction;

    @NotNull(message = "Phase is required")
    private PhaseTypeEnum phase;

    @NotNull(message = "Effort days is required")
    @Positive(message = "Effort days must be positive")
    private Double effortDays;

    // Default constructor
    public EffortEstimateRequest() {}

    // Constructor with required fields
    public EffortEstimateRequest(SkillFunctionEnum skillFunction, PhaseTypeEnum phase, Double effortDays) {
        this.skillFunction = skillFunction;
        this.phase = phase;
        this.effortDays = effortDays;
    }

    // Constructor with all fields
    public EffortEstimateRequest(SkillFunctionEnum skillFunction, SkillSubFunctionEnum skillSubFunction, PhaseTypeEnum phase, Double effortDays) {
        this.skillFunction = skillFunction;
        this.skillSubFunction = skillSubFunction;
        this.phase = phase;
        this.effortDays = effortDays;
    }

    // Getters and Setters
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

    public PhaseTypeEnum getPhase() {
        return phase;
    }

    public void setPhase(PhaseTypeEnum phase) {
        this.phase = phase;
    }

    public Double getEffortDays() {
        return effortDays;
    }

    public void setEffortDays(Double effortDays) {
        this.effortDays = effortDays;
    }

    @Override
    public String toString() {
        return "EffortEstimateRequest{" +
                "skillFunction=" + skillFunction +
                ", skillSubFunction=" + skillSubFunction +
                ", phase=" + phase +
                ", effortDays=" + effortDays +
                '}';
    }
}


