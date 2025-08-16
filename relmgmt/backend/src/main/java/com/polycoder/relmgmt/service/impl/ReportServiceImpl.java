package com.polycoder.relmgmt.service.impl;

import com.polycoder.relmgmt.dto.AllocationConflictResponse;
import com.polycoder.relmgmt.dto.CapacityForecastResponse;
import com.polycoder.relmgmt.dto.SkillCapacityForecastResponse;
import com.polycoder.relmgmt.dto.ResourceUtilizationRow;
import com.polycoder.relmgmt.dto.ReleaseTimelineRow;
import com.polycoder.relmgmt.entity.Allocation;
import com.polycoder.relmgmt.entity.Phase;
import com.polycoder.relmgmt.entity.Resource;
import com.polycoder.relmgmt.entity.SkillFunctionEnum;
import com.polycoder.relmgmt.entity.StatusEnum;
import com.polycoder.relmgmt.repository.AllocationRepository;
import com.polycoder.relmgmt.repository.PhaseRepository;
import com.polycoder.relmgmt.repository.ResourceRepository;
import com.polycoder.relmgmt.service.AllocationService;
import com.polycoder.relmgmt.service.ReportService;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.*;

@Service
public class ReportServiceImpl implements ReportService {

    private final AllocationService allocationService;
    private final AllocationRepository allocationRepository;
    private final PhaseRepository phaseRepository;
    private final ResourceRepository resourceRepository;
    public ReportServiceImpl(AllocationService allocationService,
                             AllocationRepository allocationRepository,
                             PhaseRepository phaseRepository,
                             ResourceRepository resourceRepository) {
        this.allocationService = allocationService;
        this.allocationRepository = allocationRepository;
        this.phaseRepository = phaseRepository;
        this.resourceRepository = resourceRepository;
    }

    @Override
    public List<AllocationConflictResponse> generateAllocationConflictsReport() {
        return allocationService.getAllocationConflicts();
    }

    @Override
    public List<ResourceUtilizationRow> generateResourceUtilizationReport(LocalDate from, LocalDate to, List<Long> resourceIds) {
        List<Allocation> allocations = allocationRepository.findOverlapping(from, to);
        if (allocations.isEmpty()) {
            return List.of();
        }

        Map<Long, String> resourceIdToName = new HashMap<>();
        Map<LocalDate, Map<Long, Double>> totalsByWeekThenResource = new HashMap<>();

        for (Allocation a : allocations) {
            Long resId = a.getResource().getId();
            if (resourceIds != null && !resourceIds.isEmpty() && !resourceIds.contains(resId)) {
                continue;
            }
            resourceIdToName.put(resId, a.getResource().getName());

            LocalDate cursor = a.getStartDate();
            while (!cursor.isAfter(a.getEndDate())) {
                LocalDate weekStart = cursor.with(java.time.DayOfWeek.MONDAY);
                LocalDate weekEnd = weekStart.plusDays(6);
                LocalDate overlapStart = cursor.isAfter(weekStart) ? cursor : weekStart;
                LocalDate overlapEnd = a.getEndDate().isBefore(weekEnd) ? a.getEndDate() : weekEnd;

                // Filter by global from/to range if provided
                if (from != null && weekEnd.isBefore(from)) {
                    cursor = weekEnd.plusDays(1);
                    continue;
                }
                if (to != null && weekStart.isAfter(to)) {
                    break;
                }

                int workingDays = countWorkingDays(overlapStart, overlapEnd);
                if (workingDays > 0) {
                    double days = a.getAllocationFactor() * workingDays;
                    totalsByWeekThenResource
                        .computeIfAbsent(weekStart, k -> new HashMap<>())
                        .merge(resId, days, Double::sum);
                }

                cursor = weekEnd.plusDays(1);
            }
        }

        if (totalsByWeekThenResource.isEmpty()) {
        return List.of();
        }

        List<ResourceUtilizationRow> rows = new ArrayList<>();
        for (Map.Entry<LocalDate, Map<Long, Double>> weekEntry : totalsByWeekThenResource.entrySet()) {
            LocalDate weekStarting = weekEntry.getKey();
            for (Map.Entry<Long, Double> resEntry : weekEntry.getValue().entrySet()) {
                Long resId = resEntry.getKey();
                double allocatedDays = resEntry.getValue();
                double capacity = 4.5; // per PRD weekly capacity
                double utilizationPercent = roundTwoDecimals((allocatedDays / capacity) * 100.0);
                rows.add(new ResourceUtilizationRow(resId, resourceIdToName.get(resId), weekStarting,
                        allocatedDays, capacity, utilizationPercent));
            }
        }

        // Sort by week then resource for stable output
        rows.sort((a, b) -> {
            LocalDate aw = a.getWeekStarting();
            LocalDate bw = b.getWeekStarting();
            int cmp = aw.compareTo(bw);
            if (cmp != 0) return cmp;
            Long ar = a.getResourceId();
            Long br = b.getResourceId();
            return ar.compareTo(br);
        });

        return rows;
    }

    @Override
    public List<ReleaseTimelineRow> generateReleaseTimelineReport(Integer year) {
        List<Phase> phases = phaseRepository.findAll();
        if (phases.isEmpty()) {
        return List.of();
        }

        // Group by release
        Map<Long, List<Phase>> byRelease = new LinkedHashMap<>();
        Map<Long, String> releaseIdToName = new HashMap<>();
        for (Phase p : phases) {
            if (p.getRelease() == null) continue;
            Long rid = p.getRelease().getId();
            byRelease.computeIfAbsent(rid, k -> new ArrayList<>()).add(p);
            releaseIdToName.put(rid, p.getRelease().getName());
        }

        List<ReleaseTimelineRow> rows = new ArrayList<>();
        for (Map.Entry<Long, List<Phase>> e : byRelease.entrySet()) {
            Long rid = e.getKey();
            List<Phase> list = e.getValue();
            LocalDate start = list.stream().map(Phase::getStartDate).filter(Objects::nonNull).min(LocalDate::compareTo).orElse(null);
            LocalDate end = list.stream().map(Phase::getEndDate).filter(Objects::nonNull).max(LocalDate::compareTo).orElse(null);
            if (start == null || end == null) continue;

            if (year != null) {
                boolean overlapsYear = (start.getYear() <= year && end.getYear() >= year);
                if (!overlapsYear) continue;
            }

            rows.add(new ReleaseTimelineRow(rid, releaseIdToName.get(rid), start, end));
        }

        rows.sort(Comparator.comparing(ReleaseTimelineRow::getStartDate));
        return rows;
    }

    @Override
    public byte[] exportReport(String type, Map<String, String> params) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            // Summary sheet
            Sheet summary = workbook.createSheet("Summary");
            int r = 0;
            Row t = summary.createRow(r++);
            t.createCell(0).setCellValue("Report Type");
            t.createCell(1).setCellValue(type);
            Row gen = summary.createRow(r++);
            gen.createCell(0).setCellValue("Generated At");
            gen.createCell(1).setCellValue(java.time.ZonedDateTime.now().toString());

            // Write filters
            if (params != null && !params.isEmpty()) {
                Row f = summary.createRow(r++);
                f.createCell(0).setCellValue("Filters");
                for (Map.Entry<String, String> e : params.entrySet()) {
                    Row fr = summary.createRow(r++);
                    fr.createCell(0).setCellValue(e.getKey());
                    fr.createCell(1).setCellValue(e.getValue());
                }
            }

            // Data sheet
            Sheet data = workbook.createSheet("Data");
            String upper = type == null ? "" : type.toUpperCase();
            switch (upper) {
                case "ALLOCATION_CONFLICTS": {
                    // headers
                    Row h = data.createRow(0);
                    h.createCell(0).setCellValue("resourceId");
                    h.createCell(1).setCellValue("resourceName");
                    h.createCell(2).setCellValue("weekStarting");
                    h.createCell(3).setCellValue("totalAllocation");
                    h.createCell(4).setCellValue("maxAllocation");
                    h.createCell(5).setCellValue("overAllocation");
                    int i = 1;
                    for (AllocationConflictResponse row : generateAllocationConflictsReport()) {
                        for (AllocationConflictResponse.WeeklyConflict wc : row.getWeeklyConflicts()) {
                            Row dr = data.createRow(i++);
                            dr.createCell(0).setCellValue(row.getResourceId());
                            dr.createCell(1).setCellValue(row.getResourceName());
                            dr.createCell(2).setCellValue(wc.getWeekStarting().toString());
                            dr.createCell(3).setCellValue(wc.getTotalAllocation());
                            dr.createCell(4).setCellValue(wc.getStandardLoad());
                            dr.createCell(5).setCellValue(wc.getOverAllocation());
                        }
                    }
                    break;
                }
                case "RESOURCE_UTILIZATION": {
                    LocalDate from = parseLocalDate(params == null ? null : params.get("from"));
                    LocalDate to = parseLocalDate(params == null ? null : params.get("to"));
                    List<Long> resourceIds = parseResourceIds(params == null ? null : params.get("resourceIds"));
                    Row h = data.createRow(0);
                    h.createCell(0).setCellValue("resourceId");
                    h.createCell(1).setCellValue("resourceName");
                    h.createCell(2).setCellValue("weekStarting");
                    h.createCell(3).setCellValue("allocatedDays");
                    h.createCell(4).setCellValue("capacity");
                    h.createCell(5).setCellValue("utilizationPercent");
                    int i = 1;
                    for (ResourceUtilizationRow row : generateResourceUtilizationReport(from, to, resourceIds)) {
                        Row dr = data.createRow(i++);
                        dr.createCell(0).setCellValue(row.getResourceId());
                        dr.createCell(1).setCellValue(row.getResourceName());
                        dr.createCell(2).setCellValue(row.getWeekStarting().toString());
                        dr.createCell(3).setCellValue(row.getAllocatedDays());
                        dr.createCell(4).setCellValue(row.getCapacity());
                        dr.createCell(5).setCellValue(row.getUtilizationPercent());
                    }
                    break;
                }
                case "RELEASE_TIMELINE": {
                    Integer year = parseInteger(params == null ? null : params.get("year"));
                    Row h = data.createRow(0);
                    h.createCell(0).setCellValue("releaseId");
                    h.createCell(1).setCellValue("name");
                    h.createCell(2).setCellValue("startDate");
                    h.createCell(3).setCellValue("endDate");
                    int i = 1;
                    for (ReleaseTimelineRow row : generateReleaseTimelineReport(year)) {
                        Row dr = data.createRow(i++);
                        dr.createCell(0).setCellValue(row.getReleaseId());
                        dr.createCell(1).setCellValue(row.getName());
                        dr.createCell(2).setCellValue(row.getStartDate().toString());
                        dr.createCell(3).setCellValue(row.getEndDate().toString());
                    }
                    break;
                }
                case "CAPACITY_FORECAST": {
                    LocalDate from = parseLocalDate(params == null ? null : params.get("from"));
                    LocalDate to = parseLocalDate(params == null ? null : params.get("to"));
                    Row h = data.createRow(0);
                    h.createCell(0).setCellValue("resourceId");
                    h.createCell(1).setCellValue("resourceName");
                    h.createCell(2).setCellValue("weekStarting");
                    h.createCell(3).setCellValue("allocatedDays");
                    h.createCell(4).setCellValue("capacity");
                    h.createCell(5).setCellValue("availableDays");
                    int i = 1;
                    for (CapacityForecastResponse row : generateCapacityForecastReport(from, to, null, null)) {
                        Row dr = data.createRow(i++);
                        dr.createCell(0).setCellValue(row.getResourceId());
                        dr.createCell(1).setCellValue(row.getResourceName());
                        dr.createCell(2).setCellValue(row.getWeekStarting().toString());
                        dr.createCell(3).setCellValue(row.getAllocatedDays());
                        dr.createCell(4).setCellValue(row.getCapacity());
                        dr.createCell(5).setCellValue(row.getAvailableDays());
                    }
                    break;
                }
                case "SKILL_CAPACITY_FORECAST": {
                    LocalDate from = parseLocalDate(params == null ? null : params.get("from"));
                    LocalDate to = parseLocalDate(params == null ? null : params.get("to"));
                    Row h = data.createRow(0);
                    h.createCell(0).setCellValue("skillFunction");
                    h.createCell(1).setCellValue("skillSubFunction");
                    h.createCell(2).setCellValue("weekStarting");
                    h.createCell(3).setCellValue("allocatedDays");
                    h.createCell(4).setCellValue("capacity");
                    h.createCell(5).setCellValue("availableDays");
                    int i = 1;
                    for (SkillCapacityForecastResponse row : generateSkillCapacityForecastReport(from, to, null, null)) {
                        Row dr = data.createRow(i++);
                        dr.createCell(0).setCellValue(row.getSkillFunction() == null ? "" : row.getSkillFunction().name());
                        dr.createCell(1).setCellValue(row.getSkillSubFunction() == null ? "" : row.getSkillSubFunction().name());
                        dr.createCell(2).setCellValue(row.getWeekStarting().toString());
                        dr.createCell(3).setCellValue(row.getAllocatedDays());
                        dr.createCell(4).setCellValue(row.getCapacity());
                        dr.createCell(5).setCellValue(row.getAvailableDays());
                    }
                    break;
                }
                default: {
                    // Unknown type, just write type
                    Row h = data.createRow(0);
                    h.createCell(0).setCellValue("message");
                    Row dr = data.createRow(1);
                    dr.createCell(0).setCellValue("Unknown report type: " + type);
                }
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            return new byte[0];
        }
    }

    @Override
    public List<CapacityForecastResponse> generateCapacityForecastReport(LocalDate from, LocalDate to,
                                                                         SkillFunctionEnum skillFunction,
                                                                         com.polycoder.relmgmt.entity.SkillSubFunctionEnum skillSubFunction) {
        List<Allocation> allocations = allocationRepository.findOverlapping(from, to);
        if (allocations.isEmpty()) {
            return List.of();
        }
        Map<LocalDate, Map<Long, Double>> totalsByWeekThenResource = new HashMap<>();
        Map<Long, String> resourceIdToName = new HashMap<>();
        for (Allocation a : allocations) {
            Resource resEntity = a.getResource();
            if (skillFunction != null && resEntity.getSkillFunction() != skillFunction) {
                continue;
            }
            if (skillSubFunction != null && resEntity.getSkillSubFunction() != skillSubFunction) {
                continue;
            }
            Long resId = resEntity.getId();
            resourceIdToName.put(resId, resEntity.getName());
            LocalDate cursor = a.getStartDate();
            while (!cursor.isAfter(a.getEndDate())) {
                LocalDate weekStart = cursor.with(java.time.DayOfWeek.MONDAY);
                LocalDate weekEnd = weekStart.plusDays(6);
                if (from != null && weekEnd.isBefore(from)) { cursor = weekEnd.plusDays(1); continue; }
                if (to != null && weekStart.isAfter(to)) { break; }
                LocalDate overlapStart = cursor.isAfter(weekStart) ? cursor : weekStart;
                LocalDate overlapEnd = a.getEndDate().isBefore(weekEnd) ? a.getEndDate() : weekEnd;
                int workingDays = countWorkingDays(overlapStart, overlapEnd);
                if (workingDays > 0) {
                    double days = a.getAllocationFactor() * workingDays;
                    totalsByWeekThenResource
                        .computeIfAbsent(weekStart, k -> new HashMap<>())
                        .merge(resId, days, Double::sum);
                }
                cursor = weekEnd.plusDays(1);
            }
        }
        List<CapacityForecastResponse> rows = new ArrayList<>();
        for (Map.Entry<LocalDate, Map<Long, Double>> e : totalsByWeekThenResource.entrySet()) {
            LocalDate week = e.getKey();
            for (Map.Entry<Long, Double> re : e.getValue().entrySet()) {
                double allocated = re.getValue();
                double capacity = 4.5;
                double available = roundTwoDecimals(capacity - allocated);
                if (available < 0) available = 0.0;
                rows.add(new CapacityForecastResponse(re.getKey(), resourceIdToName.get(re.getKey()), week,
                        allocated, capacity, available));
            }
        }
        rows.sort(Comparator.comparing(CapacityForecastResponse::getWeekStarting)
                .thenComparing(CapacityForecastResponse::getResourceId));
        return rows;
    }

    @Override
    public List<SkillCapacityForecastResponse> generateSkillCapacityForecastReport(LocalDate from, LocalDate to,
                                                                                   SkillFunctionEnum skillFunction,
                                                                                   com.polycoder.relmgmt.entity.SkillSubFunctionEnum skillSubFunction) {
        List<Allocation> allocations = allocationRepository.findOverlapping(from, to);
        if (allocations.isEmpty()) {
            return List.of();
        }
        // weekly skill totals
        Map<LocalDate, Map<String, Double>> allocatedByWeekSkillKey = new HashMap<>();
        for (Allocation a : allocations) {
            Resource res = a.getResource();
            if (skillFunction != null && res.getSkillFunction() != skillFunction) {
                continue;
            }
            if (skillSubFunction != null && res.getSkillSubFunction() != skillSubFunction) {
                continue;
            }
            SkillFunctionEnum fn = res.getSkillFunction();
            String key = buildSkillKey(fn, res.getSkillSubFunction());
            LocalDate cursor = a.getStartDate();
            while (!cursor.isAfter(a.getEndDate())) {
                LocalDate weekStart = cursor.with(java.time.DayOfWeek.MONDAY);
                LocalDate weekEnd = weekStart.plusDays(6);
                if (from != null && weekEnd.isBefore(from)) { cursor = weekEnd.plusDays(1); continue; }
                if (to != null && weekStart.isAfter(to)) { break; }
                LocalDate overlapStart = cursor.isAfter(weekStart) ? cursor : weekStart;
                LocalDate overlapEnd = a.getEndDate().isBefore(weekEnd) ? a.getEndDate() : weekEnd;
                int workingDays = countWorkingDays(overlapStart, overlapEnd);
                if (workingDays > 0) {
                    double days = a.getAllocationFactor() * workingDays;
                    allocatedByWeekSkillKey
                        .computeIfAbsent(weekStart, k -> new HashMap<>())
                        .merge(key, days, Double::sum);
                }
                cursor = weekEnd.plusDays(1);
            }
        }
        List<SkillCapacityForecastResponse> rows = new ArrayList<>();
        for (Map.Entry<LocalDate, Map<String, Double>> e : allocatedByWeekSkillKey.entrySet()) {
            LocalDate week = e.getKey();
            for (Map.Entry<String, Double> se : e.getValue().entrySet()) {
                SkillFunctionEnum fn = parseFunctionFromKey(se.getKey());
                com.polycoder.relmgmt.entity.SkillSubFunctionEnum sf = parseSubFunctionFromKey(se.getKey());
                // capacity = number of ACTIVE resources in that skill * 4.5
                int numResources = resourceRepository.findBySkillFunctionAndStatus(fn, StatusEnum.ACTIVE).size();
                double capacity = numResources * 4.5;
                double allocated = se.getValue();
                double available = roundTwoDecimals(Math.max(0.0, capacity - allocated));
                rows.add(new SkillCapacityForecastResponse(fn, sf, week, allocated, capacity, available));
            }
        }
        rows.sort(Comparator.comparing(SkillCapacityForecastResponse::getWeekStarting)
                .thenComparing(r -> r.getSkillFunction().name())
                .thenComparing(r -> r.getSkillSubFunction() == null ? "" : r.getSkillSubFunction().name()));
        return rows;
    }

    private String buildSkillKey(SkillFunctionEnum fn, com.polycoder.relmgmt.entity.SkillSubFunctionEnum sf) {
        return fn.name() + "::" + (sf == null ? "" : sf.name());
    }
    private SkillFunctionEnum parseFunctionFromKey(String key) {
        String fn = key.split("::")[0];
        return SkillFunctionEnum.valueOf(fn);
    }
    private com.polycoder.relmgmt.entity.SkillSubFunctionEnum parseSubFunctionFromKey(String key) {
        String[] parts = key.split("::");
        if (parts.length < 2 || parts[1].isEmpty()) return null;
        return com.polycoder.relmgmt.entity.SkillSubFunctionEnum.valueOf(parts[1]);
    }

    private int countWorkingDays(LocalDate start, LocalDate end) {
        int count = 0;
        LocalDate d = start;
        while (!d.isAfter(end)) {
            java.time.DayOfWeek dow = d.getDayOfWeek();
            if (dow != java.time.DayOfWeek.SATURDAY && dow != java.time.DayOfWeek.SUNDAY) {
                count++;
            }
            d = d.plusDays(1);
        }
        return count;
    }

    private double roundTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private LocalDate parseLocalDate(String v) {
        if (v == null || v.isEmpty()) return null;
        return LocalDate.parse(v);
    }

    private Integer parseInteger(String v) {
        if (v == null || v.isEmpty()) return null;
        return Integer.parseInt(v);
    }

    private List<Long> parseResourceIds(String v) {
        if (v == null || v.isEmpty()) return null;
        String[] parts = v.split(",");
        List<Long> ids = new ArrayList<>();
        for (String p : parts) {
            try { ids.add(Long.parseLong(p.trim())); } catch (Exception ignored) {}
        }
        return ids.isEmpty() ? null : ids;
    }
}


