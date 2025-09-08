package com.polycoder.relmgmt.service.impl;

import com.polycoder.relmgmt.dto.AllocationConflictResponse;
import com.polycoder.relmgmt.dto.AllocationDto;
import com.polycoder.relmgmt.entity.*;
import com.polycoder.relmgmt.repository.AllocationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.polycoder.relmgmt.repository.EffortEstimateRepository;
import com.polycoder.relmgmt.repository.PhaseRepository;
import com.polycoder.relmgmt.repository.ResourceRepository;
import com.polycoder.relmgmt.repository.ScopeItemRepository;
import com.polycoder.relmgmt.repository.ReleaseRepository;
import com.polycoder.relmgmt.repository.ComponentRepository;
import com.polycoder.relmgmt.service.AllocationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AllocationServiceImpl implements AllocationService {

    private static final Logger log = LoggerFactory.getLogger(AllocationServiceImpl.class);

    private final AllocationRepository allocationRepository;
    private final EffortEstimateRepository effortEstimateRepository;
    private final ResourceRepository resourceRepository;
    private final PhaseRepository phaseRepository;
    private final ScopeItemRepository scopeItemRepository;
    private final ReleaseRepository releaseRepository;
    private final ComponentRepository componentRepository;

    public AllocationServiceImpl(AllocationRepository allocationRepository,
                                 EffortEstimateRepository effortEstimateRepository,
                                 ResourceRepository resourceRepository,
                                 PhaseRepository phaseRepository,
                                 ScopeItemRepository scopeItemRepository,
                                 ReleaseRepository releaseRepository,
                                 ComponentRepository componentRepository) {
        this.allocationRepository = allocationRepository;
        this.effortEstimateRepository = effortEstimateRepository;
        this.resourceRepository = resourceRepository;
        this.phaseRepository = phaseRepository;
        this.scopeItemRepository = scopeItemRepository;
        this.releaseRepository = releaseRepository;
        this.componentRepository = componentRepository;
    }

    @Override
    @Transactional
    public void generateAllocation(Long releaseId) {
        // Remove existing allocations for idempotency - use deleteInBatch for immediate execution
        List<Allocation> existing = allocationRepository.findByReleaseId(releaseId);
        log.info("Found {} existing allocations for release {}", existing.size(), releaseId);
        if (!existing.isEmpty()) {
            allocationRepository.deleteInBatch(existing);
            allocationRepository.flush(); // Force immediate execution
            log.info("Deleted {} existing allocations for release {}", existing.size(), releaseId);
        }

        List<Phase> phases = phaseRepository.findByReleaseId(releaseId);
        List<ScopeItem> scopeItems = scopeItemRepository.findByReleaseId(releaseId);
        
        if (phases == null || phases.isEmpty()) {
            log.warn("No phases found for release ID: {}. Cannot generate allocations.", releaseId);
            return;
        }
        
        // Fetch the release entity
        Release release = releaseRepository.findById(releaseId).orElse(null);
        if (release == null) {
            log.warn("Release not found for ID: {}. Cannot generate allocations.", releaseId);
            return;
        }
        
        // Calculate derived effort estimates from scope items
        Map<PhaseTypeEnum, Double> derivedEfforts = calculateDerivedEfforts(scopeItems);
        
        log.info("Derived efforts for release ID {}: {}", releaseId, derivedEfforts);
        
        if (derivedEfforts.isEmpty() || derivedEfforts.values().stream().allMatch(effort -> effort == 0.0)) {
            log.warn("No effort estimates derived from scope items for release ID: {}. Cannot generate allocations.", releaseId);
            return;
        }

        Map<PhaseTypeEnum, Phase> phaseByType = new EnumMap<>(PhaseTypeEnum.class);
        for (Phase p : phases) {
            phaseByType.put(p.getPhaseType(), p);
        }

        // Base allocations per explicit estimates by phase
        List<Allocation> toSave = new ArrayList<>();

        // FUNCTIONAL DESIGN estimates: match Functional Design resources
        Double functionalDesignEffort = derivedEfforts.get(PhaseTypeEnum.FUNCTIONAL_DESIGN);
        if (functionalDesignEffort != null && functionalDesignEffort > 0 && phaseByType.containsKey(PhaseTypeEnum.FUNCTIONAL_DESIGN)) {
            List<Resource> functionalDesignResources = resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.FUNCTIONAL_DESIGN, StatusEnum.ACTIVE);
            if (!functionalDesignResources.isEmpty()) {
                // Distribute effort across available Functional Design resources
                double perResourceEffort = functionalDesignEffort / functionalDesignResources.size();
                
                for (Resource r : functionalDesignResources) {
                    Allocation a = new Allocation();
                    a.setRelease(release);
                    a.setResource(r);
                    a.setPhase(PhaseTypeEnum.FUNCTIONAL_DESIGN);
                    a.setStartDate(phaseByType.get(PhaseTypeEnum.FUNCTIONAL_DESIGN).getStartDate());
                    a.setEndDate(phaseByType.get(PhaseTypeEnum.FUNCTIONAL_DESIGN).getEndDate());
                    a.setAllocationFactor(calculateAllocationFactor(perResourceEffort, phaseByType.get(PhaseTypeEnum.FUNCTIONAL_DESIGN)));
                    a.setAllocationDays(perResourceEffort);
                    toSave.add(a);
                    log.info("Created allocation for Functional Design resource: {} with {} days", r.getName(), perResourceEffort);
                }
            } else {
                log.warn("No active Functional Design resources found for effort estimate: {}", functionalDesignEffort);
            }
        }

        // TECHNICAL DESIGN estimates: match Technical Design resources by sub-function where provided
        Double technicalDesignEffort = derivedEfforts.get(PhaseTypeEnum.TECHNICAL_DESIGN);
        if (technicalDesignEffort != null && technicalDesignEffort > 0 && phaseByType.containsKey(PhaseTypeEnum.TECHNICAL_DESIGN)) {
            List<Resource> technicalDesignResources = resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.TECHNICAL_DESIGN, StatusEnum.ACTIVE);
            
            if (!technicalDesignResources.isEmpty()) {
                // For now, use first available resource (can be enhanced with sub-function matching later)
                Resource selected = technicalDesignResources.get(0);
                
                Allocation a = new Allocation();
                a.setRelease(release);
                a.setResource(selected);
                a.setPhase(PhaseTypeEnum.TECHNICAL_DESIGN);
                a.setStartDate(phaseByType.get(PhaseTypeEnum.TECHNICAL_DESIGN).getStartDate());
                a.setEndDate(phaseByType.get(PhaseTypeEnum.TECHNICAL_DESIGN).getEndDate());
                a.setAllocationFactor(calculateAllocationFactor(technicalDesignEffort, phaseByType.get(PhaseTypeEnum.TECHNICAL_DESIGN)));
                a.setAllocationDays(technicalDesignEffort);
                toSave.add(a);
                log.info("Created allocation for Technical Design resource: {} with {} days", selected.getName(), technicalDesignEffort);
            }
        }

        // BUILD estimates: match BUILD resources by sub-function where provided
        Double buildEffort = derivedEfforts.get(PhaseTypeEnum.BUILD);
        if (buildEffort != null && buildEffort > 0 && phaseByType.containsKey(PhaseTypeEnum.BUILD)) {
            List<Resource> buildResources = resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.BUILD, StatusEnum.ACTIVE);
            
            if (!buildResources.isEmpty()) {
                // For now, use first available resource (can be enhanced with sub-function matching later)
                Resource selected = buildResources.get(0);
                
                Allocation a = new Allocation();
                a.setRelease(release);
                a.setResource(selected);
                a.setPhase(PhaseTypeEnum.BUILD);
                a.setStartDate(phaseByType.get(PhaseTypeEnum.BUILD).getStartDate());
                a.setEndDate(phaseByType.get(PhaseTypeEnum.BUILD).getEndDate());
                a.setAllocationFactor(calculateAllocationFactor(buildEffort, phaseByType.get(PhaseTypeEnum.BUILD)));
                a.setAllocationDays(buildEffort);
                toSave.add(a);
                log.info("Created allocation for Build resource: {} with {} days", selected.getName(), buildEffort);
            }
        }

        // SIT estimates: match Test resources with Manual sub-function and Build resources (35% of build effort)
        Double sitEffort = derivedEfforts.get(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST);
        Double buildEffortForSit = derivedEfforts.get(PhaseTypeEnum.BUILD);
        if (sitEffort != null && sitEffort > 0 && phaseByType.containsKey(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST)) {
            List<Resource> testResources = resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.TEST, StatusEnum.ACTIVE);
            List<Resource> manualTestResources = testResources.stream()
                .filter(r -> r.getSkillSubFunction() == SkillSubFunctionEnum.MANUAL)
                .collect(Collectors.toList());
            
            if (!manualTestResources.isEmpty()) {
                // Distribute effort across available Manual Test resources
                double perResourceEffort = sitEffort / manualTestResources.size();
                
                for (Resource r : manualTestResources) {
                    Allocation a = new Allocation();
                    a.setRelease(release);
                    a.setResource(r);
                    a.setPhase(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST);
                    a.setStartDate(phaseByType.get(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST).getStartDate());
                    a.setEndDate(phaseByType.get(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST).getEndDate());
                    a.setAllocationFactor(calculateAllocationFactor(perResourceEffort, phaseByType.get(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST)));
                    a.setAllocationDays(perResourceEffort);
                    toSave.add(a);
                    log.info("Created allocation for SIT resource: {} with {} days", r.getName(), perResourceEffort);
                }
            }
            
            // Add build resources for SIT phase (35% of build effort)
            if (buildEffortForSit != null && buildEffortForSit > 0) {
                List<Resource> buildResources = resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.BUILD, StatusEnum.ACTIVE);
                if (!buildResources.isEmpty()) {
                    double buildEffortForSitPhase = buildEffortForSit * 0.35;
                    Resource selectedBuild = buildResources.get(0);
                    
                    Allocation a = new Allocation();
                    a.setRelease(release);
                    a.setResource(selectedBuild);
                    a.setPhase(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST);
                    a.setStartDate(phaseByType.get(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST).getStartDate());
                    a.setEndDate(phaseByType.get(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST).getEndDate());
                    a.setAllocationFactor(calculateAllocationFactor(buildEffortForSitPhase, phaseByType.get(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST)));
                    a.setAllocationDays(buildEffortForSitPhase);
                    toSave.add(a);
                    log.info("Created SIT build allocation for resource: {} with {} days (35% of build effort)", selectedBuild.getName(), buildEffortForSitPhase);
                }
            }
        }

        // Derived allocations for UAT (30% of SIT for Test, 25% of Build for Build)
        if (phaseByType.containsKey(PhaseTypeEnum.USER_ACCEPTANCE_TEST)) {
            Phase uat = phaseByType.get(PhaseTypeEnum.USER_ACCEPTANCE_TEST);
            Double sitTotal = derivedEfforts.get(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST);
            Double buildTotal = derivedEfforts.get(PhaseTypeEnum.BUILD);

            List<Resource> testResources = resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.TEST, StatusEnum.ACTIVE);
            if (sitTotal != null && sitTotal > 0 && !testResources.isEmpty()) {
                double totalUatTest = sitTotal * 0.3;
                double perResDays = totalUatTest / testResources.size();
                for (Resource r : testResources) {
                    Allocation a = new Allocation();
                    a.setRelease(release);
                    a.setResource(r);
                    a.setPhase(PhaseTypeEnum.USER_ACCEPTANCE_TEST);
                    a.setStartDate(uat.getStartDate());
                    a.setEndDate(uat.getEndDate());
                    a.setAllocationFactor(calculateAllocationFactor(perResDays, uat));
                    a.setAllocationDays(perResDays);
                    toSave.add(a);
                }
            }

            List<Resource> buildResources = resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.BUILD, StatusEnum.ACTIVE);
            if (buildTotal != null && buildTotal > 0 && !buildResources.isEmpty()) {
                double totalUatBuild = buildTotal * 0.25;
                // assign to the first available build resource to match tests
                Resource r = buildResources.get(0);
                Allocation a = new Allocation();
                a.setRelease(release);
                a.setResource(r);
                a.setPhase(PhaseTypeEnum.USER_ACCEPTANCE_TEST);
                a.setStartDate(uat.getStartDate());
                a.setEndDate(uat.getEndDate());
                a.setAllocationFactor(calculateAllocationFactor(totalUatBuild, uat));
                a.setAllocationDays(totalUatBuild);
                toSave.add(a);
            }
        }

        // Derived allocations for SMOKE (10% of SIT and Build) default to week after UAT if SMOKE phase missing
        Phase smoke = phaseByType.get(PhaseTypeEnum.SMOKE_TESTING);
        Phase uat = phaseByType.get(PhaseTypeEnum.USER_ACCEPTANCE_TEST);
        if (smoke == null && uat != null) {
            LocalDate start = uat.getEndDate().plusDays(1);
            LocalDate end = start.plusDays(6);
            smoke = new Phase(PhaseTypeEnum.SMOKE_TESTING, start, end);
        }
        if (smoke != null) {
            Double sitTotal = derivedEfforts.get(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST);
            Double buildTotal = derivedEfforts.get(PhaseTypeEnum.BUILD);

            List<Resource> testResources = resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.TEST, StatusEnum.ACTIVE);
            if (sitTotal != null && sitTotal > 0 && !testResources.isEmpty()) {
                double totalSmokeTest = sitTotal * 0.1;
                double perResDays = totalSmokeTest / testResources.size();
                for (Resource r : testResources) {
                    Allocation a = new Allocation();
                    a.setRelease(release);
                    a.setResource(r);
                    a.setPhase(PhaseTypeEnum.SMOKE_TESTING);
                    a.setStartDate(smoke.getStartDate());
                    a.setEndDate(smoke.getEndDate());
                    a.setAllocationFactor(calculateAllocationFactor(perResDays, smoke));
                    a.setAllocationDays(perResDays);
                    toSave.add(a);
                }
            }

            List<Resource> buildResources = resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.BUILD, StatusEnum.ACTIVE);
            if (buildTotal != null && buildTotal > 0 && !buildResources.isEmpty()) {
                double totalSmokeBuild = buildTotal * 0.1;
                Resource r = buildResources.get(0);
                Allocation a = new Allocation();
                a.setRelease(release);
                a.setResource(r);
                a.setPhase(PhaseTypeEnum.SMOKE_TESTING);
                a.setStartDate(smoke.getStartDate());
                a.setEndDate(smoke.getEndDate());
                a.setAllocationFactor(calculateAllocationFactor(totalSmokeBuild, smoke));
                a.setAllocationDays(totalSmokeBuild);
                toSave.add(a);
            }
        }

        if (!toSave.isEmpty()) {
            allocationRepository.saveAll(toSave);
        }
    }

    /**
     * Calculate derived effort estimates from scope items and their components
     */
    private Map<PhaseTypeEnum, Double> calculateDerivedEfforts(List<ScopeItem> scopeItems) {
        Map<PhaseTypeEnum, Double> efforts = new EnumMap<>(PhaseTypeEnum.class);
        
        if (scopeItems == null || scopeItems.isEmpty()) {
            return efforts;
        }
        
        double functionalDesignTotal = 0.0;
        double technicalDesignTotal = 0.0;
        double buildTotal = 0.0;
        double sitTotal = 0.0;
        double uatTotal = 0.0;
        
        for (ScopeItem scopeItem : scopeItems) {
            // Add scope item level efforts
            functionalDesignTotal += scopeItem.getFunctionalDesignDays() != null ? scopeItem.getFunctionalDesignDays() : 0.0;
            sitTotal += scopeItem.getSitDays() != null ? scopeItem.getSitDays() : 0.0;
            uatTotal += scopeItem.getUatDays() != null ? scopeItem.getUatDays() : 0.0;
            
            // Add component level efforts - fetch components using repository
            List<Component> components = componentRepository.findByScopeItemId(scopeItem.getId());
            for (Component component : components) {
                technicalDesignTotal += component.getTechnicalDesignDays() != null ? component.getTechnicalDesignDays() : 0.0;
                buildTotal += component.getBuildDays() != null ? component.getBuildDays() : 0.0;
            }
        }
        
        efforts.put(PhaseTypeEnum.FUNCTIONAL_DESIGN, functionalDesignTotal);
        efforts.put(PhaseTypeEnum.TECHNICAL_DESIGN, technicalDesignTotal);
        efforts.put(PhaseTypeEnum.BUILD, buildTotal);
        efforts.put(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST, sitTotal);
        efforts.put(PhaseTypeEnum.USER_ACCEPTANCE_TEST, uatTotal);
        
        return efforts;
    }

    /**
     * Calculate allocation factor based on effort days and phase duration
     * Ensures allocation factor stays within PRD limits (0.5-0.9 person-days per day)
     * Maximum 4.5 PD per week (0.9 × 5 working days)
     */
    private double calculateAllocationFactor(double effortDays, Phase phase) {
        int workingDays = countWorkingDays(phase.getStartDate(), phase.getEndDate());
        if (workingDays == 0) {
            return 0.5; // Minimum allocation factor
        }
        
        double calculatedFactor = effortDays / workingDays;
        
        // Enforce PRD limits: minimum 0.5, maximum 0.9 person-days per day
        // This ensures maximum 4.5 PD per week (0.9 × 5 working days)
        if (calculatedFactor < 0.5) {
            return 0.5;
        } else if (calculatedFactor > 0.9) {
            return 0.9;
        }
        
        return calculatedFactor;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Allocation> getAllocationsForRelease(Long releaseId) {
        return allocationRepository.findByReleaseId(releaseId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AllocationDto> getAllocationDtosForRelease(Long releaseId) {
        List<Allocation> allocations = allocationRepository.findByReleaseId(releaseId);
        return allocations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private AllocationDto convertToDto(Allocation allocation) {
        return new AllocationDto(
                allocation.getId(),
                allocation.getResource(),
                allocation.getPhase(),
                allocation.getStartDate(),
                allocation.getEndDate(),
                allocation.getAllocationDays(),
                allocation.getAllocationFactor()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Allocation> getAllocationsForResource(Long resourceId) {
        return allocationRepository.findByResourceId(resourceId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AllocationConflictResponse> getAllocationConflicts() {
        List<Allocation> all = allocationRepository.findAll();
        if (all.isEmpty()) {
            return List.of();
        }

        // Group by resource
        Map<Long, List<Allocation>> byResource = all.stream()
            .collect(Collectors.groupingBy(a -> a.getResource().getId(), LinkedHashMap::new, Collectors.toList()));

        List<AllocationConflictResponse> responses = new ArrayList<>();
        for (Map.Entry<Long, List<Allocation>> entry : byResource.entrySet()) {
            Long resourceId = entry.getKey();
            List<Allocation> allocations = entry.getValue();

            Map<LocalDate, Double> totalsByWeek = new HashMap<>();
            for (Allocation a : allocations) {
                accumulateWeeklyAllocation(totalsByWeek, a.getStartDate(), a.getEndDate(), a.getAllocationFactor());
            }

            List<AllocationConflictResponse.WeeklyConflict> weekly = new ArrayList<>();
            for (Map.Entry<LocalDate, Double> w : totalsByWeek.entrySet()) {
                double total = w.getValue();
                if (total > 4.5) {
                    weekly.add(new AllocationConflictResponse.WeeklyConflict(w.getKey(), total, 4.5, total - 4.5));
                }
            }

            if (!weekly.isEmpty()) {
                String name = allocations.get(0).getResource().getName();
                responses.add(new AllocationConflictResponse(resourceId, name, weekly.stream()
                    .sorted((a, b) -> a.getWeekStarting().compareTo(b.getWeekStarting()))
                    .collect(Collectors.toList())));
            }
        }

        return responses;
    }

    private void accumulateWeeklyAllocation(Map<LocalDate, Double> totalsByWeek,
                                            LocalDate start, LocalDate end, double dailyFactor) {
        LocalDate cursor = start;
        while (!cursor.isAfter(end)) {
            LocalDate weekStart = cursor.with(DayOfWeek.MONDAY);
            LocalDate weekEnd = weekStart.plusDays(6);
            LocalDate overlapStart = cursor.isAfter(weekStart) ? cursor : weekStart;
            LocalDate overlapEnd = end.isBefore(weekEnd) ? end : weekEnd;
            int workingDays = countWorkingDays(overlapStart, overlapEnd);
            if (workingDays > 0) {
                totalsByWeek.merge(weekStart, dailyFactor * workingDays, Double::sum);
            }
            cursor = weekEnd.plusDays(1);
        }
    }

    private int countWorkingDays(LocalDate start, LocalDate end) {
        int count = 0;
        LocalDate d = start;
        while (!d.isAfter(end)) {
            DayOfWeek dow = d.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                count++;
            }
            d = d.plusDays(1);
        }
        return count;
    }
}


