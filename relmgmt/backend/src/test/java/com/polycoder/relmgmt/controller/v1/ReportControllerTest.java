package com.polycoder.relmgmt.controller.v1;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polycoder.relmgmt.dto.AllocationConflictResponse;
import com.polycoder.relmgmt.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class ReportControllerTest {

    @Mock
    private ReportService reportService;

    @InjectMocks
    private ReportController reportController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(reportController).build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
    }

    @Test
    void testGetAllocationConflictsReport() throws Exception {
        AllocationConflictResponse.WeeklyConflict wc = new AllocationConflictResponse.WeeklyConflict(LocalDate.now().with(java.time.DayOfWeek.MONDAY), 6.0, 4.5, 1.5);
        AllocationConflictResponse conflict = new AllocationConflictResponse(7L, "John Doe", List.of(wc));
        when(reportService.generateAllocationConflictsReport()).thenReturn(List.of(conflict));

        mockMvc.perform(get("/api/v1/reports/allocation-conflicts"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].resourceId").value(7));
    }

    @Test
    void testGetResourceUtilizationReport() throws Exception {
        when(reportService.generateResourceUtilizationReport(any(), any(), any())).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/reports/resource-utilization")
                        .param("from", "2025-01-01")
                        .param("to", "2025-01-31")
                        .param("resourceIds", "1", "2"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void testGetResourceUtilizationReport_BadDateRange() throws Exception {
        mockMvc.perform(get("/api/v1/reports/resource-utilization")
                        .param("from", "2025-02-01")
                        .param("to", "2025-01-31"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetReleaseTimelineReport() throws Exception {
        when(reportService.generateReleaseTimelineReport(any())).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/reports/release-timeline")
                        .param("year", "2025"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void testGetReleaseTimelineReport_InvalidYear() throws Exception {
        mockMvc.perform(get("/api/v1/reports/release-timeline")
                        .param("year", "99999"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testExportReport() throws Exception {
        byte[] bytes = new byte[]{1, 2, 3};
        when(reportService.exportReport(eq("ALLOCATION_CONFLICTS"), any())).thenReturn(bytes);

        mockMvc.perform(get("/api/v1/reports/export")
                        .param("type", "ALLOCATION_CONFLICTS")
                        .param("year", "2025"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("attachment")))
                .andExpect(content().contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
    }

    @Test
    void testExportReport_InvalidType() throws Exception {
        mockMvc.perform(get("/api/v1/reports/export")
                        .param("type", "UNKNOWN"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetCapacityForecast() throws Exception {
        when(reportService.generateCapacityForecastReport(any(), any(), any(), any())).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/reports/capacity-forecast")
                        .param("from", "2025-01-01")
                        .param("to", "2025-01-31"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void testGetSkillCapacityForecast() throws Exception {
        when(reportService.generateSkillCapacityForecastReport(any(), any(), any(), any())).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/reports/skill-capacity-forecast")
                        .param("from", "2025-01-01")
                        .param("to", "2025-01-31"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void testExportResourceUtilizationReport() throws Exception {
        byte[] bytes = new byte[]{4, 5, 6};
        when(reportService.exportReport(eq("RESOURCE_UTILIZATION"), any())).thenReturn(bytes);

        mockMvc.perform(get("/api/v1/reports/export")
                        .param("type", "RESOURCE_UTILIZATION")
                        .param("from", "2025-01-01")
                        .param("to", "2025-01-31"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("attachment")))
                .andExpect(content().contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
    }

    @Test
    void testExportReleaseTimelineReportPathVariant() throws Exception {
        byte[] bytes = new byte[]{7, 8, 9};
        when(reportService.exportReport(eq("RELEASE_TIMELINE"), any())).thenReturn(bytes);

        mockMvc.perform(get("/api/v1/reports/RELEASE_TIMELINE/export")
                        .param("year", "2025"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("attachment")))
                .andExpect(content().contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
    }
}


