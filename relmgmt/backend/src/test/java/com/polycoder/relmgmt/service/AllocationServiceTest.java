package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.AllocationConflictResponse;
import com.polycoder.relmgmt.entity.Allocation;
import com.polycoder.relmgmt.entity.EffortEstimate;
import com.polycoder.relmgmt.entity.Phase;
import com.polycoder.relmgmt.entity.PhaseTypeEnum;
import com.polycoder.relmgmt.entity.Resource;
import com.polycoder.relmgmt.entity.SkillFunctionEnum;
import com.polycoder.relmgmt.entity.SkillSubFunctionEnum;
import com.polycoder.relmgmt.entity.StatusEnum;
import com.polycoder.relmgmt.repository.AllocationRepository;
import com.polycoder.relmgmt.repository.EffortEstimateRepository;
import com.polycoder.relmgmt.repository.PhaseRepository;
import com.polycoder.relmgmt.repository.ResourceRepository;
import com.polycoder.relmgmt.service.impl.AllocationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.Mockito.*;

class AllocationServiceTest {

    private AllocationRepository allocationRepository;
    private EffortEstimateRepository effortEstimateRepository;
    private ResourceRepository resourceRepository;
    private PhaseRepository phaseRepository;
    private AllocationService allocationService;

    @BeforeEach
    void setup() {
        allocationRepository = Mockito.mock(AllocationRepository.class);
        effortEstimateRepository = Mockito.mock(EffortEstimateRepository.class);
        resourceRepository = Mockito.mock(ResourceRepository.class);
        phaseRepository = Mockito.mock(PhaseRepository.class);
        allocationService = new AllocationServiceImpl(
            allocationRepository,
            effortEstimateRepository,
            resourceRepository,
            phaseRepository
        );
    }

    @Test
    void testGetAllocationsForReleaseReturnsEmptyListWhenNone() {
        when(allocationRepository.findByReleaseId(1L)).thenReturn(Collections.emptyList());
        List<Allocation> result = allocationService.getAllocationsForRelease(1L);
        assertThat(result).isEmpty();
    }

    @Test
    void testGetAllocationsForResourceReturnsEmptyListWhenNone() {
        when(allocationRepository.findByResourceId(5L)).thenReturn(Collections.emptyList());
        List<Allocation> result = allocationService.getAllocationsForResource(5L);
        assertThat(result).isEmpty();
    }

    @Test
    void testGenerateAllocation_NoEstimates_NoSaves() {
        Long releaseId = 100L;
        when(allocationRepository.findByReleaseId(releaseId)).thenReturn(Collections.emptyList());
        when(effortEstimateRepository.findByReleaseId(releaseId)).thenReturn(Collections.emptyList());
        when(phaseRepository.findByReleaseId(releaseId)).thenReturn(Collections.emptyList());

        allocationService.generateAllocation(releaseId);

        verify(allocationRepository, never()).saveAll(anyList());
    }

    @Test
    void testGenerateAllocation_BuildPhase_UsesSubFunctionAndRespectsFactors() {
        Long releaseId = 200L;
        when(allocationRepository.findByReleaseId(releaseId)).thenReturn(Collections.emptyList());

        LocalDate start = LocalDate.of(2025, 1, 6);
        LocalDate end = LocalDate.of(2025, 1, 17);
        Phase build = new Phase(PhaseTypeEnum.BUILD, start, end);
        when(phaseRepository.findByReleaseId(releaseId)).thenReturn(List.of(build));

        EffortEstimate e1 = new EffortEstimate();
        e1.setPhase(PhaseTypeEnum.BUILD);
        e1.setSkillFunction(SkillFunctionEnum.BUILD);
        e1.setSkillSubFunction(SkillSubFunctionEnum.FORGEROCK_IDM);
        e1.setEffortDays(9.0);
        when(effortEstimateRepository.findByReleaseId(releaseId)).thenReturn(List.of(e1));

        for (SkillFunctionEnum fn : SkillFunctionEnum.values()) {
            when(resourceRepository.findBySkillFunctionAndStatus(fn, StatusEnum.ACTIVE)).thenReturn(Collections.emptyList());
        }
        Resource r1 = createResource(1L, "B-1", SkillFunctionEnum.BUILD, SkillSubFunctionEnum.FORGEROCK_IDM);
        Resource r2 = createResource(2L, "B-2", SkillFunctionEnum.BUILD, SkillSubFunctionEnum.SAILPOINT);
        when(resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.BUILD, StatusEnum.ACTIVE))
            .thenReturn(List.of(r1, r2));

        List<Allocation> saved = new ArrayList<>();
        doAnswer(inv -> { List<Allocation> list = inv.getArgument(0); saved.addAll(list); return null; })
            .when(allocationRepository).saveAll(anyList());
        allocationService.generateAllocation(releaseId);
        verify(allocationRepository, atLeastOnce()).saveAll(anyList());
        assertThat(saved).hasSize(1);
        Allocation a = saved.get(0);
        assertThat(a.getResource().getId()).isEqualTo(1L);
        assertThat(a.getPhase()).isEqualTo(PhaseTypeEnum.BUILD);
        assertThat(a.getStartDate()).isEqualTo(start);
        assertThat(a.getEndDate()).isEqualTo(end);
        assertThat(a.getAllocationFactor()).isCloseTo(0.9, within(1e-9));
        assertThat(a.getAllocationDays()).isCloseTo(9.0, within(1e-9));
    }

    @Test
    void testGenerateAllocation_Derived_UAT_FromSITAndBuild() {
        Long releaseId = 300L;
        when(allocationRepository.findByReleaseId(releaseId)).thenReturn(Collections.emptyList());

        Phase sit = new Phase(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST, LocalDate.of(2025, 2, 3), LocalDate.of(2025, 2, 14));
        Phase uat = new Phase(PhaseTypeEnum.USER_ACCEPTANCE_TEST, LocalDate.of(2025, 2, 17), LocalDate.of(2025, 2, 21));
        when(phaseRepository.findByReleaseId(releaseId)).thenReturn(List.of(sit, uat));

        EffortEstimate s1 = new EffortEstimate();
        s1.setPhase(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST);
        s1.setSkillFunction(SkillFunctionEnum.TEST);
        s1.setSkillSubFunction(SkillSubFunctionEnum.MANUAL);
        s1.setEffortDays(20.0);
        EffortEstimate b1 = new EffortEstimate();
        b1.setPhase(PhaseTypeEnum.BUILD);
        b1.setSkillFunction(SkillFunctionEnum.BUILD);
        b1.setSkillSubFunction(SkillSubFunctionEnum.FORGEROCK_IDM);
        b1.setEffortDays(10.0);
        when(effortEstimateRepository.findByReleaseId(releaseId)).thenReturn(List.of(s1, b1));

        for (SkillFunctionEnum fn : SkillFunctionEnum.values()) {
            when(resourceRepository.findBySkillFunctionAndStatus(fn, StatusEnum.ACTIVE)).thenReturn(Collections.emptyList());
        }
        Resource t1 = createResource(10L, "T-1", SkillFunctionEnum.TEST, SkillSubFunctionEnum.MANUAL);
        Resource t2 = createResource(11L, "T-2", SkillFunctionEnum.TEST, SkillSubFunctionEnum.MANUAL);
        Resource b = createResource(12L, "B-1", SkillFunctionEnum.BUILD, SkillSubFunctionEnum.FORGEROCK_IDM);
        when(resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.TEST, StatusEnum.ACTIVE)).thenReturn(List.of(t1, t2));
        when(resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.BUILD, StatusEnum.ACTIVE)).thenReturn(List.of(b));

        List<Allocation> saved = new ArrayList<>();
        doAnswer(inv -> { List<Allocation> list = inv.getArgument(0); saved.addAll(list); return null; })
            .when(allocationRepository).saveAll(anyList());
        allocationService.generateAllocation(releaseId);
        verify(allocationRepository, atLeastOnce()).saveAll(anyList());

        Map<PhaseTypeEnum, List<Allocation>> byPhase = saved.stream().collect(java.util.stream.Collectors.groupingBy(Allocation::getPhase));
        List<Allocation> uatAllocs = byPhase.get(PhaseTypeEnum.USER_ACCEPTANCE_TEST);
        assertThat(uatAllocs).isNotNull();
        assertThat(uatAllocs).hasSize(3);
        for (Allocation a : uatAllocs) {
            assertThat(a.getAllocationFactor()).isBetween(0.5, 0.61);
        }
    }

    @Test
    void testDerived_Smoke_DefaultsToWeekAfterUAT_WhenNotDefined() {
        Long releaseId = 400L;
        when(allocationRepository.findByReleaseId(releaseId)).thenReturn(Collections.emptyList());

        Phase uat = new Phase(PhaseTypeEnum.USER_ACCEPTANCE_TEST, LocalDate.of(2025, 3, 10), LocalDate.of(2025, 3, 14));
        when(phaseRepository.findByReleaseId(releaseId)).thenReturn(List.of(uat));

        EffortEstimate s1 = new EffortEstimate();
        s1.setPhase(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST);
        s1.setSkillFunction(SkillFunctionEnum.TEST);
        s1.setSkillSubFunction(SkillSubFunctionEnum.MANUAL);
        s1.setEffortDays(10.0);
        EffortEstimate b1 = new EffortEstimate();
        b1.setPhase(PhaseTypeEnum.BUILD);
        b1.setSkillFunction(SkillFunctionEnum.BUILD);
        b1.setEffortDays(10.0);
        when(effortEstimateRepository.findByReleaseId(releaseId)).thenReturn(List.of(s1, b1));

        for (SkillFunctionEnum fn : SkillFunctionEnum.values()) {
            when(resourceRepository.findBySkillFunctionAndStatus(fn, StatusEnum.ACTIVE)).thenReturn(Collections.emptyList());
        }
        Resource t = createResource(21L, "T-1", SkillFunctionEnum.TEST, SkillSubFunctionEnum.MANUAL);
        Resource b = createResource(22L, "B-1", SkillFunctionEnum.BUILD, SkillSubFunctionEnum.TALEND);
        when(resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.TEST, StatusEnum.ACTIVE)).thenReturn(List.of(t));
        when(resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.BUILD, StatusEnum.ACTIVE)).thenReturn(List.of(b));

        List<Allocation> saved = new ArrayList<>();
        doAnswer(inv -> { List<Allocation> list = inv.getArgument(0); saved.addAll(list); return null; })
            .when(allocationRepository).saveAll(anyList());
        allocationService.generateAllocation(releaseId);
        verify(allocationRepository, atLeastOnce()).saveAll(anyList());

        LocalDate expectedSmokeStart = uat.getEndDate().plusDays(1);
        LocalDate expectedSmokeEnd = expectedSmokeStart.plusDays(6);
        List<Allocation> smoke = new ArrayList<>();
        for (Allocation a : saved) {
            if (a.getPhase() == PhaseTypeEnum.SMOKE_TESTING) {
                smoke.add(a);
            }
        }
        assertThat(smoke).isNotEmpty();
        for (Allocation a : smoke) {
            assertThat(a.getStartDate()).isEqualTo(expectedSmokeStart);
            assertThat(a.getEndDate()).isEqualTo(expectedSmokeEnd);
            assertThat(a.getAllocationFactor()).isGreaterThanOrEqualTo(0.5);
        }
    }

    @Test
    void testAllocationConflicts_FlagsOverloadedWeeks() {
        Resource r = createResource(100L, "R-Conf", SkillFunctionEnum.BUILD, SkillSubFunctionEnum.SAILPOINT);
        Allocation a1 = new Allocation();
        a1.setResource(r);
        a1.setStartDate(LocalDate.of(2025, 4, 7));
        a1.setEndDate(LocalDate.of(2025, 4, 11));
        a1.setAllocationFactor(0.9);
        a1.setAllocationDays(4.5);
        Allocation a2 = new Allocation();
        a2.setResource(r);
        a2.setStartDate(LocalDate.of(2025, 4, 7));
        a2.setEndDate(LocalDate.of(2025, 4, 11));
        a2.setAllocationFactor(0.9);
        a2.setAllocationDays(4.5);
        when(allocationRepository.findAll()).thenReturn(List.of(a1, a2));

        List<AllocationConflictResponse> conflicts = allocationService.getAllocationConflicts();
        assertThat(conflicts).hasSize(1);
        AllocationConflictResponse c = conflicts.get(0);
        assertThat(c.getResourceId()).isEqualTo(100L);
        assertThat(c.getWeeklyConflicts()).isNotEmpty();
        AllocationConflictResponse.WeeklyConflict w = c.getWeeklyConflicts().get(0);
        assertThat(w.getTotalAllocation()).isGreaterThan(4.5);
        assertThat(w.getWeekStarting().getDayOfWeek().getValue()).isEqualTo(1);
    }

    private static Resource createResource(Long id, String name, SkillFunctionEnum function, SkillSubFunctionEnum subFn) {
        Resource r = new Resource();
        r.setId(id);
        r.setName(name);
        r.setEmployeeNumber(String.format("%08d", id));
        r.setEmail("r" + id + "@example.com");
        r.setStatus(StatusEnum.ACTIVE);
        r.setProjectStartDate(LocalDate.of(2025, 1, 1));
        r.setEmployeeGrade(com.polycoder.relmgmt.entity.EmployeeGradeEnum.LEVEL_8);
        r.setSkillFunction(function);
        r.setSkillSubFunction(subFn);
        return r;
    }
}