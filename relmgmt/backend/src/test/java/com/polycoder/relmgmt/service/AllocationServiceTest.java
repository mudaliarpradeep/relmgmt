package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.AllocationConflictResponse;
import com.polycoder.relmgmt.entity.Allocation;
import com.polycoder.relmgmt.entity.Component;
import com.polycoder.relmgmt.entity.EffortEstimate;
import com.polycoder.relmgmt.entity.Phase;
import com.polycoder.relmgmt.entity.PhaseTypeEnum;
import com.polycoder.relmgmt.entity.Release;
import com.polycoder.relmgmt.entity.Resource;
import com.polycoder.relmgmt.entity.ScopeItem;
import com.polycoder.relmgmt.entity.SkillFunctionEnum;
import com.polycoder.relmgmt.entity.SkillSubFunctionEnum;
import com.polycoder.relmgmt.entity.StatusEnum;
import com.polycoder.relmgmt.repository.AllocationRepository;
import com.polycoder.relmgmt.repository.ComponentRepository;
import com.polycoder.relmgmt.repository.EffortEstimateRepository;
import com.polycoder.relmgmt.repository.PhaseRepository;
import com.polycoder.relmgmt.repository.ResourceRepository;
import com.polycoder.relmgmt.repository.ScopeItemRepository;
import com.polycoder.relmgmt.repository.ReleaseRepository;
import com.polycoder.relmgmt.service.impl.AllocationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.Mockito.*;
import com.polycoder.relmgmt.entity.EmployeeGradeEnum;

class AllocationServiceTest {

    private AllocationRepository allocationRepository;
    private EffortEstimateRepository effortEstimateRepository;
    private ResourceRepository resourceRepository;
    private PhaseRepository phaseRepository;
    private ScopeItemRepository scopeItemRepository;
    private ReleaseRepository releaseRepository;
    private ComponentRepository componentRepository;
    private AllocationService allocationService;

    @BeforeEach
    void setup() {
        allocationRepository = Mockito.mock(AllocationRepository.class);
        effortEstimateRepository = Mockito.mock(EffortEstimateRepository.class);
        resourceRepository = Mockito.mock(ResourceRepository.class);
        phaseRepository = Mockito.mock(PhaseRepository.class);
        scopeItemRepository = Mockito.mock(ScopeItemRepository.class);
        releaseRepository = Mockito.mock(ReleaseRepository.class);
        componentRepository = Mockito.mock(ComponentRepository.class);
        allocationService = new AllocationServiceImpl(
            allocationRepository,
            effortEstimateRepository,
            resourceRepository,
            phaseRepository,
            scopeItemRepository,
            releaseRepository,
            componentRepository
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
        when(scopeItemRepository.findByReleaseId(releaseId)).thenReturn(Collections.emptyList());
        when(phaseRepository.findByReleaseId(releaseId)).thenReturn(Collections.emptyList());

        allocationService.generateAllocation(releaseId);

        verify(allocationRepository, never()).saveAll(anyList());
    }

    @Test
    void testGenerateAllocation_FunctionalDesignPhase_DistributesAcrossResources() {
        Long releaseId = 300L;
        when(allocationRepository.findByReleaseId(releaseId)).thenReturn(Collections.emptyList());

        // Mock release
        Release release = new Release();
        release.setId(releaseId);
        release.setName("Test Release");
        when(releaseRepository.findById(releaseId)).thenReturn(Optional.of(release));

        LocalDate start = LocalDate.of(2025, 1, 6);
        LocalDate end = LocalDate.of(2025, 1, 17);
        Phase functionalDesign = new Phase(PhaseTypeEnum.FUNCTIONAL_DESIGN, start, end);
        when(phaseRepository.findByReleaseId(releaseId)).thenReturn(List.of(functionalDesign));

        // Mock scope items with effort estimates
        ScopeItem scopeItem = new ScopeItem();
        scopeItem.setId(1L);
        scopeItem.setName("Test Scope Item");
        scopeItem.setFunctionalDesignDays(10.0);
        scopeItem.setSitDays(0.0);
        scopeItem.setUatDays(0.0);
        when(scopeItemRepository.findByReleaseId(releaseId)).thenReturn(List.of(scopeItem));
        
        // Mock components (empty for this test)
        when(componentRepository.findByScopeItemId(1L)).thenReturn(Collections.emptyList());

        Resource r1 = createResource(1L, "FD-1", SkillFunctionEnum.FUNCTIONAL_DESIGN, null);
        Resource r2 = createResource(2L, "FD-2", SkillFunctionEnum.FUNCTIONAL_DESIGN, null);
        when(resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.FUNCTIONAL_DESIGN, StatusEnum.ACTIVE))
            .thenReturn(List.of(r1, r2));

        // Mock other skill functions to return empty lists
        for (SkillFunctionEnum fn : SkillFunctionEnum.values()) {
            if (fn != SkillFunctionEnum.FUNCTIONAL_DESIGN) {
                when(resourceRepository.findBySkillFunctionAndStatus(fn, StatusEnum.ACTIVE)).thenReturn(Collections.emptyList());
            }
        }

        allocationService.generateAllocation(releaseId);

        verify(allocationRepository).saveAll(argThat(allocations -> {
            List<Allocation> allocationList = (List<Allocation>) allocations;
            assertThat(allocationList).hasSize(2);
            Allocation a1 = allocationList.get(0);
            Allocation a2 = allocationList.get(1);
            
            assertThat(a1.getPhase()).isEqualTo(PhaseTypeEnum.FUNCTIONAL_DESIGN);
            assertThat(a2.getPhase()).isEqualTo(PhaseTypeEnum.FUNCTIONAL_DESIGN);
            assertThat(a1.getAllocationDays()).isEqualTo(5.0); // 10.0 / 2 resources
            assertThat(a2.getAllocationDays()).isEqualTo(5.0);
            assertThat(a1.getAllocationFactor()).isCloseTo(0.5, within(0.1)); // Minimum allocation factor
            assertThat(a2.getAllocationFactor()).isCloseTo(0.5, within(0.1));
            return true;
        }));
    }

    @Test
    void testGenerateAllocation_TechnicalDesignPhase_MatchesSubFunction() {
        Long releaseId = 400L;
        when(allocationRepository.findByReleaseId(releaseId)).thenReturn(Collections.emptyList());

        LocalDate start = LocalDate.of(2025, 2, 3);
        LocalDate end = LocalDate.of(2025, 2, 14);
        Phase technicalDesign = new Phase(PhaseTypeEnum.TECHNICAL_DESIGN, start, end);
        when(phaseRepository.findByReleaseId(releaseId)).thenReturn(List.of(technicalDesign));

        // Mock release
        Release release = new Release();
        release.setId(releaseId);
        release.setName("Test Release");
        when(releaseRepository.findById(releaseId)).thenReturn(Optional.of(release));

        // Create scope items that will generate Technical Design effort
        ScopeItem scopeItem = new ScopeItem();
        scopeItem.setId(1L);
        scopeItem.setName("Test Scope Item");
        scopeItem.setRelease(release);
        when(scopeItemRepository.findByReleaseId(releaseId)).thenReturn(List.of(scopeItem));

        // Create components that will generate Technical Design effort
        Component component = new Component();
        component.setId(1L);
        component.setName("Test Component");
        component.setTechnicalDesignDays(8.0);
        component.setScopeItem(scopeItem);
        when(componentRepository.findByScopeItemId(1L)).thenReturn(List.of(component));

        Resource r1 = createResource(1L, "TD-1", SkillFunctionEnum.TECHNICAL_DESIGN, SkillSubFunctionEnum.FORGEROCK_IDM);
        Resource r2 = createResource(2L, "TD-2", SkillFunctionEnum.TECHNICAL_DESIGN, SkillSubFunctionEnum.SAILPOINT);
        when(resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.TECHNICAL_DESIGN, StatusEnum.ACTIVE))
            .thenReturn(List.of(r1, r2));

        // Mock other skill functions to return empty lists
        for (SkillFunctionEnum fn : SkillFunctionEnum.values()) {
            if (fn != SkillFunctionEnum.TECHNICAL_DESIGN) {
                when(resourceRepository.findBySkillFunctionAndStatus(fn, StatusEnum.ACTIVE)).thenReturn(Collections.emptyList());
            }
        }

        allocationService.generateAllocation(releaseId);

        verify(allocationRepository).saveAll(argThat(allocations -> {
            List<Allocation> allocationList = (List<Allocation>) allocations;
            assertThat(allocationList).hasSize(1);
            Allocation a = allocationList.get(0);
            
            assertThat(a.getPhase()).isEqualTo(PhaseTypeEnum.TECHNICAL_DESIGN);
            assertThat(a.getResource().getSkillSubFunction()).isEqualTo(SkillSubFunctionEnum.FORGEROCK_IDM);
            assertThat(a.getAllocationDays()).isEqualTo(8.0);
            assertThat(a.getAllocationFactor()).isCloseTo(0.8, within(0.1)); // 8.0 / 10 working days
            return true;
        }));
    }

    @Test
    void testGenerateAllocation_SITPhase_MatchesManualTestResources() {
        Long releaseId = 500L;
        when(allocationRepository.findByReleaseId(releaseId)).thenReturn(Collections.emptyList());

        LocalDate start = LocalDate.of(2025, 3, 10);
        LocalDate end = LocalDate.of(2025, 3, 21);
        Phase sit = new Phase(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST, start, end);
        when(phaseRepository.findByReleaseId(releaseId)).thenReturn(List.of(sit));

        // Mock release
        Release release = new Release();
        release.setId(releaseId);
        release.setName("Test Release");
        when(releaseRepository.findById(releaseId)).thenReturn(Optional.of(release));

        // Create scope items that will generate SIT effort
        ScopeItem scopeItem = new ScopeItem();
        scopeItem.setId(1L);
        scopeItem.setName("Test Scope Item");
        scopeItem.setSitDays(12.0);
        scopeItem.setRelease(release);
        when(scopeItemRepository.findByReleaseId(releaseId)).thenReturn(List.of(scopeItem));

        Resource r1 = createResource(1L, "TEST-1", SkillFunctionEnum.TEST, SkillSubFunctionEnum.MANUAL);
        Resource r2 = createResource(2L, "TEST-2", SkillFunctionEnum.TEST, SkillSubFunctionEnum.AUTOMATED);
        Resource r3 = createResource(3L, "TEST-3", SkillFunctionEnum.TEST, SkillSubFunctionEnum.MANUAL);
        when(resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.TEST, StatusEnum.ACTIVE))
            .thenReturn(List.of(r1, r2, r3));

        // Mock other skill functions to return empty lists
        for (SkillFunctionEnum fn : SkillFunctionEnum.values()) {
            if (fn != SkillFunctionEnum.TEST) {
                when(resourceRepository.findBySkillFunctionAndStatus(fn, StatusEnum.ACTIVE)).thenReturn(Collections.emptyList());
            }
        }

        allocationService.generateAllocation(releaseId);

        verify(allocationRepository).saveAll(argThat(allocations -> {
            List<Allocation> allocationList = (List<Allocation>) allocations;
            assertThat(allocationList).hasSize(2); // Only Manual test resources
            Allocation a1 = allocationList.get(0);
            Allocation a2 = allocationList.get(1);
            
            assertThat(a1.getPhase()).isEqualTo(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST);
            assertThat(a2.getPhase()).isEqualTo(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST);
            assertThat(a1.getResource().getSkillSubFunction()).isEqualTo(SkillSubFunctionEnum.MANUAL);
            assertThat(a2.getResource().getSkillSubFunction()).isEqualTo(SkillSubFunctionEnum.MANUAL);
            assertThat(a1.getAllocationDays()).isEqualTo(6.0); // 12.0 / 2 manual resources
            assertThat(a2.getAllocationDays()).isEqualTo(6.0);
            return true;
        }));
    }

    @Test
    void testGenerateAllocation_BuildPhase_UsesSubFunctionAndRespectsFactors() {
        Long releaseId = 200L;
        when(allocationRepository.findByReleaseId(releaseId)).thenReturn(Collections.emptyList());

        LocalDate start = LocalDate.of(2025, 1, 6);
        LocalDate end = LocalDate.of(2025, 1, 17);
        Phase build = new Phase(PhaseTypeEnum.BUILD, start, end);
        when(phaseRepository.findByReleaseId(releaseId)).thenReturn(List.of(build));

        // Mock release
        Release release = new Release();
        release.setId(releaseId);
        release.setName("Test Release");
        when(releaseRepository.findById(releaseId)).thenReturn(Optional.of(release));

        // Create scope items that will generate Build effort
        ScopeItem scopeItem = new ScopeItem();
        scopeItem.setId(1L);
        scopeItem.setName("Test Scope Item");
        scopeItem.setRelease(release);
        when(scopeItemRepository.findByReleaseId(releaseId)).thenReturn(List.of(scopeItem));

        // Create components that will generate Build effort
        Component component = new Component();
        component.setId(1L);
        component.setName("Test Component");
        component.setBuildDays(9.0);
        component.setScopeItem(scopeItem);
        when(componentRepository.findByScopeItemId(1L)).thenReturn(List.of(component));

        for (SkillFunctionEnum fn : SkillFunctionEnum.values()) {
            when(resourceRepository.findBySkillFunctionAndStatus(fn, StatusEnum.ACTIVE)).thenReturn(Collections.emptyList());
        }
        Resource r1 = createResource(1L, "B-1", SkillFunctionEnum.BUILD, SkillSubFunctionEnum.FORGEROCK_IDM);
        Resource r2 = createResource(2L, "B-2", SkillFunctionEnum.BUILD, SkillSubFunctionEnum.SAILPOINT);
        when(resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.BUILD, StatusEnum.ACTIVE))
            .thenReturn(List.of(r1, r2));

        allocationService.generateAllocation(releaseId);

        verify(allocationRepository).saveAll(argThat(allocations -> {
            List<Allocation> allocationList = (List<Allocation>) allocations;
            assertThat(allocationList).hasSize(1);
            Allocation a = allocationList.get(0);
            assertThat(a.getPhase()).isEqualTo(PhaseTypeEnum.BUILD);
            assertThat(a.getResource().getSkillSubFunction()).isEqualTo(SkillSubFunctionEnum.FORGEROCK_IDM);
            assertThat(a.getAllocationDays()).isEqualTo(9.0);
            assertThat(a.getAllocationFactor()).isCloseTo(0.9, within(0.1)); // 9.0 / 10 working days
            return true;
        }));
    }

    @Test
    void testGenerateAllocation_AllocationFactorValidation_EnforcesLimits() {
        Long releaseId = 600L;
        when(allocationRepository.findByReleaseId(releaseId)).thenReturn(Collections.emptyList());

        // Short phase with high effort to test maximum allocation factor
        LocalDate start = LocalDate.of(2025, 1, 6);
        LocalDate end = LocalDate.of(2025, 1, 8); // Only 3 working days
        Phase shortPhase = new Phase(PhaseTypeEnum.BUILD, start, end);
        when(phaseRepository.findByReleaseId(releaseId)).thenReturn(List.of(shortPhase));

        // Mock release
        Release release = new Release();
        release.setId(releaseId);
        release.setName("Test Release");
        when(releaseRepository.findById(releaseId)).thenReturn(Optional.of(release));

        // Create scope items that will generate Build effort
        ScopeItem scopeItem = new ScopeItem();
        scopeItem.setId(1L);
        scopeItem.setName("Test Scope Item");
        scopeItem.setRelease(release);
        when(scopeItemRepository.findByReleaseId(releaseId)).thenReturn(List.of(scopeItem));

        // Create components that will generate Build effort
        Component component = new Component();
        component.setId(1L);
        component.setName("Test Component");
        component.setBuildDays(5.0); // More effort than working days
        component.setScopeItem(scopeItem);
        when(componentRepository.findByScopeItemId(1L)).thenReturn(List.of(component));

        Resource r1 = createResource(1L, "B-1", SkillFunctionEnum.BUILD, SkillSubFunctionEnum.FORGEROCK_IDM);
        when(resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.BUILD, StatusEnum.ACTIVE))
            .thenReturn(List.of(r1));

        // Mock other skill functions to return empty lists
        for (SkillFunctionEnum fn : SkillFunctionEnum.values()) {
            if (fn != SkillFunctionEnum.BUILD) {
                when(resourceRepository.findBySkillFunctionAndStatus(fn, StatusEnum.ACTIVE)).thenReturn(Collections.emptyList());
            }
        }

        allocationService.generateAllocation(releaseId);

        verify(allocationRepository).saveAll(argThat(allocations -> {
            List<Allocation> allocationList = (List<Allocation>) allocations;
            assertThat(allocationList).hasSize(1);
            Allocation a = allocationList.get(0);
            assertThat(a.getAllocationFactor()).isEqualTo(1.0); // Should be capped at maximum
            return true;
        }));
    }

    @Test
    void testGenerateAllocation_UATDerivation_CalculatesCorrectly() {
        Long releaseId = 700L;
        when(allocationRepository.findByReleaseId(releaseId)).thenReturn(Collections.emptyList());

        LocalDate buildStart = LocalDate.of(2025, 1, 6);
        LocalDate buildEnd = LocalDate.of(2025, 1, 17);
        Phase build = new Phase(PhaseTypeEnum.BUILD, buildStart, buildEnd);
        
        LocalDate sitStart = LocalDate.of(2025, 1, 20);
        LocalDate sitEnd = LocalDate.of(2025, 1, 31);
        Phase sit = new Phase(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST, sitStart, sitEnd);
        
        LocalDate uatStart = LocalDate.of(2025, 2, 3);
        LocalDate uatEnd = LocalDate.of(2025, 2, 14);
        Phase uat = new Phase(PhaseTypeEnum.USER_ACCEPTANCE_TEST, uatStart, uatEnd);
        
        when(phaseRepository.findByReleaseId(releaseId)).thenReturn(List.of(build, sit, uat));

        // Setup Release and ScopeItem
        Release release = new Release();
        release.setId(releaseId);
        when(releaseRepository.findById(releaseId)).thenReturn(Optional.of(release));
        
        ScopeItem scopeItem = new ScopeItem();
        scopeItem.setId(1L);
        scopeItem.setRelease(release);
        scopeItem.setSitDays(8.0);    // SIT effort
        when(scopeItemRepository.findByReleaseId(releaseId)).thenReturn(List.of(scopeItem));
        
        // Setup Component with effort data
        Component component = new Component();
        component.setId(1L);
        component.setBuildDays(10.0); // Build effort
        // SIT effort is set on ScopeItem, not Component
        component.setScopeItem(scopeItem);
        when(componentRepository.findByScopeItemId(1L)).thenReturn(List.of(component));

        Resource buildResource = createResource(1L, "B-1", SkillFunctionEnum.BUILD, SkillSubFunctionEnum.FORGEROCK_IDM);
        Resource testResource = createResource(2L, "T-1", SkillFunctionEnum.TEST, SkillSubFunctionEnum.MANUAL);
        
        when(resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.BUILD, StatusEnum.ACTIVE))
            .thenReturn(List.of(buildResource));
        when(resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.TEST, StatusEnum.ACTIVE))
            .thenReturn(List.of(testResource));

        // Mock other skill functions to return empty lists
        for (SkillFunctionEnum fn : SkillFunctionEnum.values()) {
            if (fn != SkillFunctionEnum.BUILD && fn != SkillFunctionEnum.TEST) {
                when(resourceRepository.findBySkillFunctionAndStatus(fn, StatusEnum.ACTIVE)).thenReturn(Collections.emptyList());
            }
        }

        allocationService.generateAllocation(releaseId);

        verify(allocationRepository).saveAll(argThat(allocations -> {
            List<Allocation> allocationList = (List<Allocation>) allocations;
            assertThat(allocationList).hasSize(7); // BUILD + SIT + SIT build allocation + UAT (Build) + UAT (Test) + SMOKE (Build) + SMOKE (Test)
            
            // Find UAT allocations
            List<Allocation> uatAllocations = allocationList.stream()
                .filter(a -> a.getPhase() == PhaseTypeEnum.USER_ACCEPTANCE_TEST)
                .collect(Collectors.toList());
            
            assertThat(uatAllocations).hasSize(2);
            
            // Check UAT Build allocation (25% of Build effort)
            Allocation uatBuild = uatAllocations.stream()
                .filter(a -> a.getResource().getSkillFunction() == SkillFunctionEnum.BUILD)
                .findFirst().orElse(null);
            assertThat(uatBuild).isNotNull();
            assertThat(uatBuild.getAllocationDays()).isEqualTo(2.5); // 10.0 * 0.25
            
            // Check UAT Test allocation (30% of SIT effort)
            Allocation uatTest = uatAllocations.stream()
                .filter(a -> a.getResource().getSkillFunction() == SkillFunctionEnum.TEST)
                .findFirst().orElse(null);
            assertThat(uatTest).isNotNull();
            assertThat(uatTest.getAllocationDays()).isEqualTo(2.4); // 8.0 * 0.3
            
            return true;
        }));
    }

    @Test
    void testGenerateAllocation_SmokeDerivation_CalculatesCorrectly() {
        Long releaseId = 800L;
        when(allocationRepository.findByReleaseId(releaseId)).thenReturn(Collections.emptyList());

        LocalDate buildStart = LocalDate.of(2025, 1, 6);
        LocalDate buildEnd = LocalDate.of(2025, 1, 17);
        Phase build = new Phase(PhaseTypeEnum.BUILD, buildStart, buildEnd);
        
        LocalDate sitStart = LocalDate.of(2025, 1, 20);
        LocalDate sitEnd = LocalDate.of(2025, 1, 31);
        Phase sit = new Phase(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST, sitStart, sitEnd);
        
        LocalDate uatStart = LocalDate.of(2025, 2, 3);
        LocalDate uatEnd = LocalDate.of(2025, 2, 14);
        Phase uat = new Phase(PhaseTypeEnum.USER_ACCEPTANCE_TEST, uatStart, uatEnd);
        
        // Smoke phase will be auto-generated after UAT
        when(phaseRepository.findByReleaseId(releaseId)).thenReturn(List.of(build, sit, uat));

        // Setup Release and ScopeItem
        Release release = new Release();
        release.setId(releaseId);
        when(releaseRepository.findById(releaseId)).thenReturn(Optional.of(release));
        
        ScopeItem scopeItem = new ScopeItem();
        scopeItem.setId(1L);
        scopeItem.setRelease(release);
        scopeItem.setSitDays(8.0);    // SIT effort
        when(scopeItemRepository.findByReleaseId(releaseId)).thenReturn(List.of(scopeItem));
        
        // Setup Component with effort data
        Component component = new Component();
        component.setId(1L);
        component.setBuildDays(10.0); // Build effort
        // SIT effort is set on ScopeItem, not Component
        component.setScopeItem(scopeItem);
        when(componentRepository.findByScopeItemId(1L)).thenReturn(List.of(component));

        Resource buildResource = createResource(1L, "B-1", SkillFunctionEnum.BUILD, SkillSubFunctionEnum.FORGEROCK_IDM);
        Resource testResource = createResource(2L, "T-1", SkillFunctionEnum.TEST, SkillSubFunctionEnum.MANUAL);
        
        when(resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.BUILD, StatusEnum.ACTIVE))
            .thenReturn(List.of(buildResource));
        when(resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.TEST, StatusEnum.ACTIVE))
            .thenReturn(List.of(testResource));

        // Mock other skill functions to return empty lists
        for (SkillFunctionEnum fn : SkillFunctionEnum.values()) {
            if (fn != SkillFunctionEnum.BUILD && fn != SkillFunctionEnum.TEST) {
                when(resourceRepository.findBySkillFunctionAndStatus(fn, StatusEnum.ACTIVE)).thenReturn(Collections.emptyList());
            }
        }

        allocationService.generateAllocation(releaseId);

        verify(allocationRepository).saveAll(argThat(allocations -> {
            List<Allocation> allocationList = (List<Allocation>) allocations;
            assertThat(allocationList).hasSize(7); // BUILD + SIT + SIT build allocation + UAT (Build) + UAT (Test) + SMOKE (Build) + SMOKE (Test)
            
            // Find Smoke allocations
            List<Allocation> smokeAllocations = allocationList.stream()
                .filter(a -> a.getPhase() == PhaseTypeEnum.SMOKE_TESTING)
                .collect(Collectors.toList());
            
            assertThat(smokeAllocations).hasSize(2);
            
            // Check Smoke Build allocation (10% of Build effort)
            Allocation smokeBuild = smokeAllocations.stream()
                .filter(a -> a.getResource().getSkillFunction() == SkillFunctionEnum.BUILD)
                .findFirst().orElse(null);
            assertThat(smokeBuild).isNotNull();
            assertThat(smokeBuild.getAllocationDays()).isEqualTo(1.0); // 10.0 * 0.1
            
            // Check Smoke Test allocation (10% of SIT effort)
            Allocation smokeTest = smokeAllocations.stream()
                .filter(a -> a.getResource().getSkillFunction() == SkillFunctionEnum.TEST)
                .findFirst().orElse(null);
            assertThat(smokeTest).isNotNull();
            assertThat(smokeTest.getAllocationDays()).isEqualTo(0.8); // 8.0 * 0.1
            
            return true;
        }));
    }

    @Test
    void testGetAllocationConflicts_DetectsOverAllocation() {
        Resource r1 = createResource(1L, "Overloaded", SkillFunctionEnum.BUILD, SkillSubFunctionEnum.FORGEROCK_IDM);
        
        Allocation a1 = new Allocation();
        a1.setResource(r1);
        a1.setPhase(PhaseTypeEnum.BUILD);
        a1.setStartDate(LocalDate.of(2025, 1, 6));
        a1.setEndDate(LocalDate.of(2025, 1, 10));
        a1.setAllocationFactor(3.0); // Over-allocated
        
        Allocation a2 = new Allocation();
        a2.setResource(r1);
        a2.setPhase(PhaseTypeEnum.TECHNICAL_DESIGN);
        a2.setStartDate(LocalDate.of(2025, 1, 6));
        a2.setEndDate(LocalDate.of(2025, 1, 10));
        a2.setAllocationFactor(2.0); // Also over-allocated
        
        when(allocationRepository.findAll()).thenReturn(List.of(a1, a2));
        
        List<AllocationConflictResponse> conflicts = allocationService.getAllocationConflicts();
        
        assertThat(conflicts).hasSize(1);
        assertThat(conflicts.get(0).getResourceId()).isEqualTo(1L);
        assertThat(conflicts.get(0).getResourceName()).isEqualTo("Overloaded");
        assertThat(conflicts.get(0).getWeeklyConflicts()).hasSize(1);
        assertThat(conflicts.get(0).getWeeklyConflicts().get(0).getOverAllocation()).isGreaterThan(0);
    }

    private Resource createResource(Long id, String name, SkillFunctionEnum skillFunction, SkillSubFunctionEnum skillSubFunction) {
        Resource r = new Resource();
        r.setId(id);
        r.setName(name);
        r.setEmployeeNumber("12345678");
        r.setEmail("test@example.com");
        r.setStatus(StatusEnum.ACTIVE);
        r.setProjectStartDate(LocalDate.of(2025, 1, 1));
        r.setEmployeeGrade(EmployeeGradeEnum.LEVEL_8);
        r.setSkillFunction(skillFunction);
        r.setSkillSubFunction(skillSubFunction);
        return r;
    }
}