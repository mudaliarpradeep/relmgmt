package com.polycoder.relmgmt.controller.v1;

import com.polycoder.relmgmt.dto.AllocationConflictResponse;
import com.polycoder.relmgmt.service.ReportService;
import com.polycoder.relmgmt.dto.CapacityForecastResponse;
import com.polycoder.relmgmt.dto.SkillCapacityForecastResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Reporting", description = "APIs for generating reports and exporting data")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/allocation-conflicts")
    @Operation(summary = "Get allocation conflicts report",
            responses = @ApiResponse(responseCode = "200", description = "OK",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = com.polycoder.relmgmt.dto.AllocationConflictResponse.class)))))
    public ResponseEntity<List<AllocationConflictResponse>> getAllocationConflicts() {
        return ResponseEntity.ok(reportService.generateAllocationConflictsReport());
    }

    @GetMapping("/resource-utilization")
    @Operation(summary = "Get resource utilization report",
            parameters = {
                    @Parameter(name = "from", description = "Start date (yyyy-MM-dd)"),
                    @Parameter(name = "to", description = "End date (yyyy-MM-dd)"),
                    @Parameter(name = "resourceIds", description = "Filter by resource IDs (repeat param)")
            },
            responses = @ApiResponse(responseCode = "200", description = "OK",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = com.polycoder.relmgmt.dto.ResourceUtilizationRow.class)))))
    public ResponseEntity<List<com.polycoder.relmgmt.dto.ResourceUtilizationRow>> getResourceUtilization(
            @RequestParam(value = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(value = "resourceIds", required = false) List<Long> resourceIds) {
        if (from != null && to != null && to.isBefore(from)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(reportService.generateResourceUtilizationReport(from, to, resourceIds));
    }

    @GetMapping("/release-timeline")
    @Operation(summary = "Get release timeline report",
            parameters = @Parameter(name = "year", description = "Filter by year"),
            responses = @ApiResponse(responseCode = "200", description = "OK",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = com.polycoder.relmgmt.dto.ReleaseTimelineRow.class)))))
    public ResponseEntity<List<com.polycoder.relmgmt.dto.ReleaseTimelineRow>> getReleaseTimeline(
            @RequestParam(value = "year", required = false) Integer year) {
        if (year != null && (year < 1900 || year > 3000)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(reportService.generateReleaseTimelineReport(year));
    }

    @GetMapping("/capacity-forecast")
    @Operation(summary = "Get capacity forecast report")
    public ResponseEntity<List<CapacityForecastResponse>> getCapacityForecast(
            @RequestParam(value = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(value = "skillFunction", required = false) com.polycoder.relmgmt.entity.SkillFunctionEnum skillFunction,
            @RequestParam(value = "skillSubFunction", required = false) com.polycoder.relmgmt.entity.SkillSubFunctionEnum skillSubFunction) {
        if (from != null && to != null && to.isBefore(from)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(reportService.generateCapacityForecastReport(from, to, skillFunction, skillSubFunction));
    }

    @GetMapping("/skill-capacity-forecast")
    @Operation(summary = "Get skill-based capacity forecast report")
    public ResponseEntity<List<SkillCapacityForecastResponse>> getSkillCapacityForecast(
            @RequestParam(value = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(value = "skillFunction", required = false) com.polycoder.relmgmt.entity.SkillFunctionEnum skillFunction,
            @RequestParam(value = "skillSubFunction", required = false) com.polycoder.relmgmt.entity.SkillSubFunctionEnum skillSubFunction) {
        if (from != null && to != null && to.isBefore(from)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(reportService.generateSkillCapacityForecastReport(from, to, skillFunction, skillSubFunction));
    }

    @GetMapping(value = "/export", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    @Operation(summary = "Export report to Excel",
            parameters = @Parameter(name = "type", description = "Report type"),
            responses = @ApiResponse(responseCode = "200", description = "OK",
                    content = @Content(mediaType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")))
    public ResponseEntity<byte[]> export(
            @RequestParam("type") String type,
            @RequestParam Map<String, String> params) {
        if (!isValidType(type)) {
            return ResponseEntity.badRequest().build();
        }
        byte[] data = reportService.exportReport(type, params);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header("Content-Disposition", "attachment; filename=report.xlsx")
                .body(data);
    }

    @GetMapping(value = "/{type}/export", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    @Operation(summary = "Export report to Excel (path variant)")
    public ResponseEntity<byte[]> exportPath(@RequestParam Map<String, String> params,
                                             @org.springframework.web.bind.annotation.PathVariable("type") String type) {
        if (!isValidType(type)) {
            return ResponseEntity.badRequest().build();
        }
        byte[] data = reportService.exportReport(type, params);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header("Content-Disposition", "attachment; filename=report.xlsx")
                .body(data);
    }

    private boolean isValidType(String type) {
        if (type == null) return false;
        String t = type.toUpperCase();
        return t.equals("ALLOCATION_CONFLICTS") || t.equals("RESOURCE_UTILIZATION") || t.equals("RELEASE_TIMELINE")
                || t.equals("CAPACITY_FORECAST") || t.equals("SKILL_CAPACITY_FORECAST");
    }
}


