package com.polycoder.relmgmt.entity;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public enum SkillSubFunctionEnum {
    ETL("ETL", Arrays.asList(SkillFunctionEnum.FUNCTIONAL_DESIGN, SkillFunctionEnum.TECHNICAL_DESIGN, SkillFunctionEnum.BUILD)),
    TALEND("Talend", Arrays.asList(SkillFunctionEnum.TECHNICAL_DESIGN, SkillFunctionEnum.BUILD)),
    FORGEROCK_IGA("ForgeRock IGA", Arrays.asList(SkillFunctionEnum.FUNCTIONAL_DESIGN, SkillFunctionEnum.TECHNICAL_DESIGN, SkillFunctionEnum.BUILD)),
    FORGEROCK_IDM("ForgeRock IDM", Arrays.asList(SkillFunctionEnum.TECHNICAL_DESIGN, SkillFunctionEnum.BUILD)),
    FORGEROCK_IG("ForgeRock IG", Arrays.asList(SkillFunctionEnum.FUNCTIONAL_DESIGN, SkillFunctionEnum.TECHNICAL_DESIGN, SkillFunctionEnum.BUILD)),
    SAILPOINT("SailPoint", Arrays.asList(SkillFunctionEnum.FUNCTIONAL_DESIGN, SkillFunctionEnum.TECHNICAL_DESIGN, SkillFunctionEnum.BUILD)),
    FORGEROCK_UI("ForgeRock UI", Arrays.asList(SkillFunctionEnum.FUNCTIONAL_DESIGN, SkillFunctionEnum.TECHNICAL_DESIGN, SkillFunctionEnum.BUILD)),
    FUNCTIONAL_TEST("Functional Test", Arrays.asList(SkillFunctionEnum.FUNCTIONAL_DESIGN, SkillFunctionEnum.TECHNICAL_DESIGN, SkillFunctionEnum.BUILD)),
    AUTOMATED("Automated", Arrays.asList(SkillFunctionEnum.TEST)),
    MANUAL("Manual", Arrays.asList(SkillFunctionEnum.TEST));
    
    private final String displayName;
    private final List<SkillFunctionEnum> applicableFunctions;
    
    SkillSubFunctionEnum(String displayName, List<SkillFunctionEnum> applicableFunctions) {
        this.displayName = displayName;
        this.applicableFunctions = applicableFunctions;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public List<SkillFunctionEnum> getApplicableFunctions() {
        return applicableFunctions;
    }
    
    public static List<SkillSubFunctionEnum> getByFunction(SkillFunctionEnum function) {
        return Arrays.stream(SkillSubFunctionEnum.values())
                .filter(subFunction -> subFunction.getApplicableFunctions().contains(function))
                .collect(Collectors.toList());
    }
}