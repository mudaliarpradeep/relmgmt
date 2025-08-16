package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.AllocationConflictResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ReportService {
    List<AllocationConflictResponse> generateAllocationConflictsReport();
    List<com.polycoder.relmgmt.dto.ResourceUtilizationRow> generateResourceUtilizationReport(LocalDate from, LocalDate to, List<Long> resourceIds);
    List<com.polycoder.relmgmt.dto.ReleaseTimelineRow> generateReleaseTimelineReport(Integer year);
    byte[] exportReport(String type, Map<String, String> params);
    List<com.polycoder.relmgmt.dto.CapacityForecastResponse> generateCapacityForecastReport(LocalDate from, LocalDate to,
                                                                                             com.polycoder.relmgmt.entity.SkillFunctionEnum skillFunction,
                                                                                             com.polycoder.relmgmt.entity.SkillSubFunctionEnum skillSubFunction);
    List<com.polycoder.relmgmt.dto.SkillCapacityForecastResponse> generateSkillCapacityForecastReport(LocalDate from, LocalDate to,
                                                                                                      com.polycoder.relmgmt.entity.SkillFunctionEnum skillFunction,
                                                                                                      com.polycoder.relmgmt.entity.SkillSubFunctionEnum skillSubFunction);
}


