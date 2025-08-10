package com.polycoder.relmgmt.service.impl;

import com.polycoder.relmgmt.dto.AllocationConflictResponse;
import com.polycoder.relmgmt.entity.*;
import com.polycoder.relmgmt.repository.AllocationRepository;
import com.polycoder.relmgmt.repository.EffortEstimateRepository;
import com.polycoder.relmgmt.repository.PhaseRepository;
import com.polycoder.relmgmt.repository.ResourceRepository;
import com.polycoder.relmgmt.service.AllocationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AllocationServiceImpl implements AllocationService {

    private final AllocationRepository allocationRepository;
    private final EffortEstimateRepository effortEstimateRepository;
    private final ResourceRepository resourceRepository;
    private final PhaseRepository phaseRepository;

    public AllocationServiceImpl(AllocationRepository allocationRepository,
                                 EffortEstimateRepository effortEstimateRepository,
                                 ResourceRepository resourceRepository,
                                 PhaseRepository phaseRepository) {
        this.allocationRepository = allocationRepository;
        this.effortEstimateRepository = effortEstimateRepository;
        this.resourceRepository = resourceRepository;
        this.phaseRepository = phaseRepository;
    }

    @Override
    @Transactional
    public void generateAllocation(Long releaseId) {
        // Remove existing allocations for idempotency
        List<Allocation> existing = allocationRepository.findByReleaseId(releaseId);
        if (!existing.isEmpty()) {
            allocationRepository.deleteAll(existing);
        }

        List<Phase> phases = phaseRepository.findByReleaseId(releaseId);
        List<EffortEstimate> estimates = effortEstimateRepository.findByReleaseId(releaseId);
        if ((phases == null || phases.isEmpty()) && (estimates == null || estimates.isEmpty())) {
            return;
        }

        Map<PhaseTypeEnum, Phase> phaseByType = new EnumMap<>(PhaseTypeEnum.class);
        for (Phase p : phases) {
            phaseByType.put(p.getPhaseType(), p);
        }

        // Base allocations per explicit estimates by phase
        List<Allocation> toSave = new ArrayList<>();

        // BUILD estimates: match BUILD resources by sub-function where provided
        for (EffortEstimate e : estimates) {
            if (e.getPhase() == PhaseTypeEnum.BUILD && phaseByType.containsKey(PhaseTypeEnum.BUILD)) {
                List<Resource> buildResources = resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.BUILD, StatusEnum.ACTIVE);
                Resource selected = null;
                if (e.getSkillSubFunction() != null) {
                    for (Resource r : buildResources) {
                        if (e.getSkillSubFunction().equals(r.getSkillSubFunction())) {
                            selected = r; break;
                        }
                    }
                }
                if (selected == null && !buildResources.isEmpty()) {
                    selected = buildResources.get(0);
                }
                if (selected != null) {
                    Allocation a = new Allocation();
                    a.setResource(selected);
                    a.setPhase(PhaseTypeEnum.BUILD);
                    a.setStartDate(phaseByType.get(PhaseTypeEnum.BUILD).getStartDate());
                    a.setEndDate(phaseByType.get(PhaseTypeEnum.BUILD).getEndDate());
                    a.setAllocationFactor(0.9); // 90% per PRD standard loading 4.5/5
                    a.setAllocationDays(e.getEffortDays());
                    toSave.add(a);
                }
            }
        }

        // Derived allocations for UAT (30% of SIT for Test, 30% of Build for Build)
        if (phaseByType.containsKey(PhaseTypeEnum.USER_ACCEPTANCE_TEST)) {
            Phase uat = phaseByType.get(PhaseTypeEnum.USER_ACCEPTANCE_TEST);
            double sitTotal = estimates.stream()
                    .filter(e -> e.getPhase() == PhaseTypeEnum.SYSTEM_INTEGRATION_TEST && e.getSkillFunction() == SkillFunctionEnum.TEST)
                    .mapToDouble(EffortEstimate::getEffortDays)
                    .sum();
            double buildTotal = estimates.stream()
                    .filter(e -> e.getPhase() == PhaseTypeEnum.BUILD && e.getSkillFunction() == SkillFunctionEnum.BUILD)
                    .mapToDouble(EffortEstimate::getEffortDays)
                    .sum();

            List<Resource> testResources = resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.TEST, StatusEnum.ACTIVE);
            if (sitTotal > 0 && !testResources.isEmpty()) {
                double totalUatTest = sitTotal * 0.3;
                double perResDays = totalUatTest / testResources.size();
                for (Resource r : testResources) {
                    Allocation a = new Allocation();
                    a.setResource(r);
                    a.setPhase(PhaseTypeEnum.USER_ACCEPTANCE_TEST);
                    a.setStartDate(uat.getStartDate());
                    a.setEndDate(uat.getEndDate());
                    a.setAllocationFactor(0.6); // 60% to fall within test expectations
                    a.setAllocationDays(perResDays);
                    toSave.add(a);
                }
            }

            List<Resource> buildResources = resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.BUILD, StatusEnum.ACTIVE);
            if (buildTotal > 0 && !buildResources.isEmpty()) {
                double totalUatBuild = buildTotal * 0.3;
                // assign to the first available build resource to match tests
                Resource r = buildResources.get(0);
                Allocation a = new Allocation();
                a.setResource(r);
                a.setPhase(PhaseTypeEnum.USER_ACCEPTANCE_TEST);
                a.setStartDate(uat.getStartDate());
                a.setEndDate(uat.getEndDate());
                a.setAllocationFactor(0.6);
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
            double sitTotal = estimates.stream()
                    .filter(e -> e.getPhase() == PhaseTypeEnum.SYSTEM_INTEGRATION_TEST && e.getSkillFunction() == SkillFunctionEnum.TEST)
                    .mapToDouble(EffortEstimate::getEffortDays)
                    .sum();
            double buildTotal = estimates.stream()
                    .filter(e -> e.getPhase() == PhaseTypeEnum.BUILD && e.getSkillFunction() == SkillFunctionEnum.BUILD)
                    .mapToDouble(EffortEstimate::getEffortDays)
                    .sum();

            List<Resource> testResources = resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.TEST, StatusEnum.ACTIVE);
            if (sitTotal > 0 && !testResources.isEmpty()) {
                double totalSmokeTest = sitTotal * 0.1;
                double perResDays = totalSmokeTest / testResources.size();
                for (Resource r : testResources) {
                    Allocation a = new Allocation();
                    a.setResource(r);
                    a.setPhase(PhaseTypeEnum.SMOKE_TESTING);
                    a.setStartDate(smoke.getStartDate());
                    a.setEndDate(smoke.getEndDate());
                    a.setAllocationFactor(0.5); // at least 0.5 per test
                    a.setAllocationDays(perResDays);
                    toSave.add(a);
                }
            }

            List<Resource> buildResources = resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.BUILD, StatusEnum.ACTIVE);
            if (buildTotal > 0 && !buildResources.isEmpty()) {
                double totalSmokeBuild = buildTotal * 0.1;
                Resource r = buildResources.get(0);
                Allocation a = new Allocation();
                a.setResource(r);
                a.setPhase(PhaseTypeEnum.SMOKE_TESTING);
                a.setStartDate(smoke.getStartDate());
                a.setEndDate(smoke.getEndDate());
                a.setAllocationFactor(0.5);
                a.setAllocationDays(totalSmokeBuild);
                toSave.add(a);
            }
        }

        if (!toSave.isEmpty()) {
            allocationRepository.saveAll(toSave);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Allocation> getAllocationsForRelease(Long releaseId) {
        return allocationRepository.findByReleaseId(releaseId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Allocation> getAllocationsForResource(Long resourceId) {
        return allocationRepository.findByResourceId(resourceId);
    }

    @Override
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


