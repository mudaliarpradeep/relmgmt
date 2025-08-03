package com.polycoder.relmgmt.entity;

public enum SkillFunctionEnum {
    FUNCTIONAL_DESIGN("Functional Design"),
    TECHNICAL_DESIGN("Technical Design"),
    BUILD("Build"),
    TEST("Test"),
    PLATFORM("Platform"),
    GOVERNANCE("Governance");
    
    private final String displayName;
    
    SkillFunctionEnum(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}