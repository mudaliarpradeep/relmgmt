package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.AllocationConflictResponse;
import com.polycoder.relmgmt.entity.*;
import com.polycoder.relmgmt.repository.AllocationRepository;
import com.polycoder.relmgmt.repository.PhaseRepository;
import com.polycoder.relmgmt.repository.ReleaseRepository;
import com.polycoder.relmgmt.service.impl.ReportServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private AllocationService allocationService;

    @Mock
    private AllocationRepository allocationRepository;

    @Mock
    private ReleaseRepository releaseRepository;

    @Mock
    private PhaseRepository phaseRepository;

    @InjectMocks
    private ReportServiceImpl reportService;

    private Resource resource;

    @BeforeEach
    void setUp() {
        resource = new Resource();
        resource.setId(7L);
        resource.setName("John Doe");
    }

    @Test
    void generateAllocationConflictsReport_delegatesToAllocationService() {
        AllocationConflictResponse.WeeklyConflict wc = new AllocationConflictResponse.WeeklyConflict(LocalDate.now().with(DayOfWeek.MONDAY), 6.0, 4.5, 1.5);
        AllocationConflictResponse conflict = new AllocationConflictResponse(7L, "John Doe", List.of(wc));
        when(allocationService.getAllocationConflicts()).thenReturn(List.of(conflict));

        List<AllocationConflictResponse> result = reportService.generateAllocationConflictsReport();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getResourceId()).isEqualTo(7L);
        assertThat(result.get(0).getWeeklyConflicts()).hasSize(1);
    }

    @Test
    void generateResourceUtilizationReport_accumulatesWeeklyDaysAndPercent() {
        // Given an allocation from Mon-Fri with 1.0 factor, and another overlapping next week at 0.5
        LocalDate week1Mon = LocalDate.of(2025, 1, 6); // Monday
        LocalDate week1Fri = week1Mon.plusDays(4);
        LocalDate week2Mon = week1Mon.plusWeeks(1);
        LocalDate week2Fri = week2Mon.plusDays(4);

        Allocation a1 = new Allocation();
        a1.setResource(resource);
        a1.setStartDate(week1Mon);
        a1.setEndDate(week1Fri);
        a1.setAllocationFactor(1.0);
        a1.setAllocationDays(5.0);

        Allocation a2 = new Allocation();
        a2.setResource(resource);
        a2.setStartDate(week2Mon);
        a2.setEndDate(week2Fri);
        a2.setAllocationFactor(0.5);
        a2.setAllocationDays(2.5);

        when(allocationRepository.findOverlapping(any(), any())).thenReturn(List.of(a1, a2));

        LocalDate from = week1Mon;
        LocalDate to = week2Fri;
        List<com.polycoder.relmgmt.dto.ResourceUtilizationRow> rows = reportService.generateResourceUtilizationReport(from, to, null);

        // Expect two rows: one for each week with allocatedDays 5.0 and 2.5, capacity 4.5, utilization 111.11% and 55.55%
        assertThat(rows).hasSize(2);

        com.polycoder.relmgmt.dto.ResourceUtilizationRow rowWeek1 = rows.stream()
                .filter(r -> week1Mon.equals(r.getWeekStarting()))
                .findFirst().orElseThrow();
        assertThat(rowWeek1.getResourceId()).isEqualTo(7L);
        assertThat(rowWeek1.getResourceName()).isEqualTo("John Doe");
        assertThat(rowWeek1.getAllocatedDays()).isEqualTo(5.0);
        assertThat(rowWeek1.getCapacity()).isEqualTo(4.5);
        assertThat(rowWeek1.getUtilizationPercent()).isCloseTo(111.11, within(0.01));

        com.polycoder.relmgmt.dto.ResourceUtilizationRow rowWeek2 = rows.stream()
                .filter(r -> week2Mon.equals(r.getWeekStarting()))
                .findFirst().orElseThrow();
        assertThat(rowWeek2.getAllocatedDays()).isEqualTo(2.5);
        assertThat(rowWeek2.getUtilizationPercent()).isCloseTo(55.55, within(0.01));
    }

    @Test
    void generateReleaseTimelineReport_returnsMinMaxDatesPerReleaseFilteredByYear() {
        Release rel1 = new Release();
        rel1.setId(1L);
        rel1.setIdentifier("2025-001");
        rel1.setName("Alpha");

        Release rel2 = new Release();
        rel2.setId(2L);
        rel2.setIdentifier("2024-002");
        rel2.setName("Beta");

        Phase r1p1 = new Phase();
        r1p1.setPhaseType(PhaseTypeEnum.FUNCTIONAL_DESIGN);
        r1p1.setStartDate(LocalDate.of(2025, 1, 5));
        r1p1.setEndDate(LocalDate.of(2025, 1, 20));
        r1p1.setRelease(rel1);

        Phase r1p2 = new Phase();
        r1p2.setPhaseType(PhaseTypeEnum.PRODUCTION_GO_LIVE);
        r1p2.setStartDate(LocalDate.of(2025, 3, 1));
        r1p2.setEndDate(LocalDate.of(2025, 3, 5));
        r1p2.setRelease(rel1);

        Phase r2p = new Phase();
        r2p.setPhaseType(PhaseTypeEnum.FUNCTIONAL_DESIGN);
        r2p.setStartDate(LocalDate.of(2024, 2, 1));
        r2p.setEndDate(LocalDate.of(2024, 2, 10));
        r2p.setRelease(rel2);

        when(phaseRepository.findAll()).thenReturn(List.of(r1p1, r1p2, r2p));

        List<com.polycoder.relmgmt.dto.ReleaseTimelineRow> rows = reportService.generateReleaseTimelineReport(2025);

        assertThat(rows).hasSize(1);
        com.polycoder.relmgmt.dto.ReleaseTimelineRow row = rows.get(0);
        assertThat(row.getReleaseId()).isEqualTo(1L);
        assertThat(row.getName()).isEqualTo("Alpha");
        assertThat(row.getStartDate()).isEqualTo(LocalDate.of(2025, 1, 5));
        assertThat(row.getEndDate()).isEqualTo(LocalDate.of(2025, 3, 5));
    }

    @Test
    void exportReport_returnsNonEmptyExcelBytes() {
        byte[] bytes = reportService.exportReport("ALLOCATION_CONFLICTS", Map.of("year", "2025"));
        assertThat(bytes).isNotNull();
        assertThat(bytes.length).isGreaterThan(0);
    }

    @Test
    void generateCapacityForecastReport_returnsAvailableDays() {
        LocalDate mon = LocalDate.of(2025, 1, 6);
        LocalDate fri = mon.plusDays(4);
        Allocation a1 = new Allocation();
        a1.setResource(resource);
        a1.setStartDate(mon);
        a1.setEndDate(fri);
        a1.setAllocationFactor(1.0);
        a1.setAllocationDays(5.0);
        when(allocationRepository.findOverlapping(any(), any())).thenReturn(List.of(a1));

        var rows = reportService.generateCapacityForecastReport(mon, fri, null, null);
        assertThat(rows).hasSize(1);
        assertThat(rows.get(0).getAllocatedDays()).isEqualTo(5.0);
        assertThat(rows.get(0).getCapacity()).isEqualTo(4.5);
        assertThat(rows.get(0).getAvailableDays()).isEqualTo(0.0);
    }

}


