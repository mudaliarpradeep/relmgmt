package com.polycoder.relmgmt.entity;

public enum PhaseTypeEnum {
    FUNCTIONAL_DESIGN("Functional Design"),
    TECHNICAL_DESIGN("Technical Design"),
    BUILD("Build"),
    SYSTEM_INTEGRATION_TEST("System Integration Test (SIT)"),
    USER_ACCEPTANCE_TEST("User Acceptance Test (UAT)"),
    SMOKE_TESTING("Smoke Testing"),
    PRODUCTION_GO_LIVE("Production Go-Live");

    private final String displayName;

    PhaseTypeEnum(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
} 