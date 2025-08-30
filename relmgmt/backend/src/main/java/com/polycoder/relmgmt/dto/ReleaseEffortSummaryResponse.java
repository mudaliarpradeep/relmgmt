package com.polycoder.relmgmt.dto;

import com.polycoder.relmgmt.entity.ComponentTypeEnum;

/**
 * DTO for effort summary response containing aggregated effort data
 * across all scope items for a release, broken down by component type and phase.
 */
public class ReleaseEffortSummaryResponse {

    private ComponentTypeEnum componentType;
    private EffortPhase phase;
    private Double totalEffort;

    // Default constructor
    public ReleaseEffortSummaryResponse() {}

    // Constructor with all fields
    public ReleaseEffortSummaryResponse(ComponentTypeEnum componentType, EffortPhase phase, Double totalEffort) {
        this.componentType = componentType;
        this.phase = phase;
        this.totalEffort = totalEffort;
    }

    // Getters and Setters
    public ComponentTypeEnum getComponentType() {
        return componentType;
    }

    public void setComponentType(ComponentTypeEnum componentType) {
        this.componentType = componentType;
    }

    public EffortPhase getPhase() {
        return phase;
    }

    public void setPhase(EffortPhase phase) {
        this.phase = phase;
    }

    public Double getTotalEffort() {
        return totalEffort;
    }

    public void setTotalEffort(Double totalEffort) {
        this.totalEffort = totalEffort;
    }

    @Override
    public String toString() {
        return "ReleaseEffortSummaryResponse{" +
                "componentType=" + componentType +
                ", phase=" + phase +
                ", totalEffort=" + totalEffort +
                '}';
    }
}