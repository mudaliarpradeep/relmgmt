package com.polycoder.relmgmt.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "effort_estimates")
public class EffortEstimate extends BaseEntity {

    @NotNull(message = "Skill function is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SkillFunctionEnum skillFunction;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private SkillSubFunctionEnum skillSubFunction;

    @NotNull(message = "Phase is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PhaseTypeEnum phase;

    @NotNull(message = "Effort days is required")
    @Positive(message = "Effort days must be positive")
    @Column(nullable = false)
    private Double effortDays;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scope_item_id", nullable = false)
    private ScopeItem scopeItem;

    // Default constructor
    public EffortEstimate() {}

    // Constructor with required fields
    public EffortEstimate(SkillFunctionEnum skillFunction, PhaseTypeEnum phase, Double effortDays, ScopeItem scopeItem) {
        this.skillFunction = skillFunction;
        this.phase = phase;
        this.effortDays = effortDays;
        this.scopeItem = scopeItem;
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

    public ScopeItem getScopeItem() {
        return scopeItem;
    }

    public void setScopeItem(ScopeItem scopeItem) {
        this.scopeItem = scopeItem;
    }

    @Override
    public String toString() {
        return "EffortEstimate{" +
                "id=" + getId() +
                ", skillFunction=" + skillFunction +
                ", skillSubFunction=" + skillSubFunction +
                ", phase=" + phase +
                ", effortDays=" + effortDays +
                ", scopeItemId=" + (scopeItem != null ? scopeItem.getId() : null) +
                '}';
    }
}
