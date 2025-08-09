package com.polycoder.relmgmt.service.impl;

import com.polycoder.relmgmt.dto.AllocationConflictResponse;
import com.polycoder.relmgmt.entity.Allocation;
import com.polycoder.relmgmt.entity.EffortEstimate;
import com.polycoder.relmgmt.entity.Phase;
import com.polycoder.relmgmt.entity.PhaseTypeEnum;
import com.polycoder.relmgmt.entity.Release;
import com.polycoder.relmgmt.entity.Resource;
import com.polycoder.relmgmt.entity.SkillFunctionEnum;
import com.polycoder.relmgmt.entity.SkillSubFunctionEnum;
import com.polycoder.relmgmt.entity.StatusEnum;
import com.polycoder.relmgmt.repository.AllocationRepository;
import com.polycoder.relmgmt.repository.EffortEstimateRepository;
import com.polycoder.relmgmt.repository.PhaseRepository;
import com.polycoder.relmgmt.repository.ResourceRepository;
import com.polycoder.relmgmt.service.AllocationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AllocationServiceImpl implements AllocationService {

    private static final double FULL_TIME_DAILY_FACTOR = 0.9; // 4.5 days / 5-day week
    private static final double MIN_DAILY_FACTOR = 0.5;

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
        // Remove existing allocations for this release to allow regeneration
        List<Allocation> existing = allocationRepository.findByReleaseId(releaseId);
        if (!existing.isEmpty()) {
            allocationRepository.deleteAll(existing);
        }

        // Load all effort estimates for the release
        List<EffortEstimate> estimates = effortEstimateRepository.findByReleaseId(releaseId);
        if (estimates.isEmpty()) {
            return;
        }

        // Load active resources by function
        Map<SkillFunctionEnum, List<Resource>> activeResourcesByFunction = new HashMap<>();
        for (SkillFunctionEnum fn : SkillFunctionEnum.values()) {
            activeResourcesByFunction.put(fn, resourceRepository.findBySkillFunctionAndStatus(fn, StatusEnum.ACTIVE));
        }

        // Build a quick lookup for phase dates
        Map<PhaseTypeEnum, Phase> phases = phaseRepository.findByReleaseId(releaseId).stream()
            .collect(Collectors.toMap(Phase::getPhaseType, p -> p, (a, b) -> a));

        List<Allocation> toSave = new ArrayList<>();

        // Core phases: distribute based on effort estimates
        allocateForPhase(estimates, phases, PhaseTypeEnum.FUNCTIONAL_DESIGN,
                SkillFunctionEnum.FUNCTIONAL_DESIGN, activeResourcesByFunction, toSave, releaseId);

        allocateForPhase(estimates, phases, PhaseTypeEnum.TECHNICAL_DESIGN,
                SkillFunctionEnum.TECHNICAL_DESIGN, activeResourcesByFunction, toSave, releaseId);

        allocateForPhase(estimates, phases, PhaseTypeEnum.BUILD,
                SkillFunctionEnum.BUILD, activeResourcesByFunction, toSave, releaseId);

        allocateForPhase(estimates, phases, PhaseTypeEnum.SYSTEM_INTEGRATION_TEST,
                SkillFunctionEnum.TEST, activeResourcesByFunction, toSave, releaseId);

        // Derived phases: UAT and Smoke
        deriveAndAllocateUAT(estimates, phases, activeResourcesByFunction, toSave, releaseId);
        deriveAndAllocateSmoke(estimates, phases, activeResourcesByFunction, toSave, releaseId);

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

    private void allocateForPhase(List<EffortEstimate> estimates,
                                  Map<PhaseTypeEnum, Phase> phases,
                                  PhaseTypeEnum phaseType,
                                  SkillFunctionEnum requiredFunction,
                                  Map<SkillFunctionEnum, List<Resource>> activeResourcesByFunction,
                                  List<Allocation> out,
                                  Long releaseId) {
        Phase phase = phases.get(phaseType);
        if (phase == null) {
            return;
        }

        LocalDate phaseStart = phase.getStartDate();
        LocalDate phaseEnd = phase.getEndDate();
        int workingDays = countWorkingDays(phaseStart, phaseEnd);
        if (workingDays <= 0) {
            return;
        }

        // Filter estimates for this phase and function
        List<EffortEstimate> filtered = estimates.stream()
            .filter(e -> e.getPhase() == phaseType && e.getSkillFunction() == requiredFunction)
            .collect(Collectors.toList());
        if (filtered.isEmpty()) {
            return;
        }

        // Group by sub-function (can be null)
        Map<SkillSubFunctionEnum, Double> effortBySubFn = new HashMap<>();
        for (EffortEstimate e : filtered) {
            effortBySubFn.merge(e.getSkillSubFunction(), e.getEffortDays(), Double::sum);
        }

        List<Resource> candidates = activeResourcesByFunction.getOrDefault(requiredFunction, List.of()).stream()
            .sorted(Comparator.comparing(Resource::getId))
            .toList();
        if (candidates.isEmpty()) {
            return;
        }

        for (Map.Entry<SkillSubFunctionEnum, Double> entry : effortBySubFn.entrySet()) {
            SkillSubFunctionEnum subFn = entry.getKey();
            double totalEffortDays = Optional.ofNullable(entry.getValue()).orElse(0.0);
            if (totalEffortDays <= 0.0) {
                continue;
            }

            // Filter candidates by sub-function when applicable (for TECHNICAL_DESIGN and BUILD and TEST-MANUAL for SIT)
            List<Resource> bucket = candidates;
            if (subFn != null) {
                bucket = candidates.stream()
                    .filter(r -> Objects.equals(r.getSkillSubFunction(), subFn))
                    .toList();
            }
            // For SIT, default to Manual sub-function if not specified
            if (phaseType == PhaseTypeEnum.SYSTEM_INTEGRATION_TEST) {
                bucket = bucket.stream()
                    .filter(r -> r.getSkillSubFunction() == SkillSubFunctionEnum.MANUAL)
                    .toList();
            }
            if (bucket.isEmpty()) {
                continue;
            }

            int requiredHeads = Math.max(1, (int) Math.ceil(totalEffortDays / (FULL_TIME_DAILY_FACTOR * workingDays)));
            requiredHeads = Math.min(requiredHeads, bucket.size());

            // Recompute factor to meet demand with selected heads
            double dailyFactor = Math.min(FULL_TIME_DAILY_FACTOR, totalEffortDays / (workingDays * requiredHeads));
            if (dailyFactor < MIN_DAILY_FACTOR) {
                // Reduce heads to increase factor up to minimum
                requiredHeads = Math.max(1, (int) Math.ceil(totalEffortDays / (MIN_DAILY_FACTOR * workingDays)));
                requiredHeads = Math.min(requiredHeads, bucket.size());
                dailyFactor = Math.max(MIN_DAILY_FACTOR, Math.min(FULL_TIME_DAILY_FACTOR, totalEffortDays / (workingDays * requiredHeads)));
            }

            for (int i = 0; i < requiredHeads; i++) {
                Resource r = bucket.get(i);
                Allocation a = new Allocation();
                Release rel = new Release();
                rel.setId(releaseId);
                a.setRelease(rel);
                a.setResource(r);
                a.setPhase(phaseType);
                a.setStartDate(phaseStart);
                a.setEndDate(phaseEnd);
                a.setAllocationFactor(dailyFactor);
                a.setAllocationDays(dailyFactor * workingDays);
                out.add(a);
            }
        }
    }

    private void deriveAndAllocateUAT(List<EffortEstimate> estimates,
                                      Map<PhaseTypeEnum, Phase> phases,
                                      Map<SkillFunctionEnum, List<Resource>> activeResourcesByFunction,
                                      List<Allocation> out,
                                      Long releaseId) {
        Phase uat = phases.get(PhaseTypeEnum.USER_ACCEPTANCE_TEST);
        if (uat == null) return;
        int workingDays = countWorkingDays(uat.getStartDate(), uat.getEndDate());
        if (workingDays <= 0) return;

        double sitEffort = estimates.stream()
            .filter(e -> e.getPhase() == PhaseTypeEnum.SYSTEM_INTEGRATION_TEST)
            .mapToDouble(EffortEstimate::getEffortDays).sum();
        double buildEffort = estimates.stream()
            .filter(e -> e.getPhase() == PhaseTypeEnum.BUILD)
            .mapToDouble(EffortEstimate::getEffortDays).sum();

        double uatTestEffort = sitEffort * 0.30;
        double uatBuildEffort = buildEffort * 0.30;

        allocateDerivedPhase(PhaseTypeEnum.USER_ACCEPTANCE_TEST, SkillFunctionEnum.TEST,
                SkillSubFunctionEnum.MANUAL, activeResourcesByFunction, out, releaseId, uat.getStartDate(), uat.getEndDate(), workingDays, uatTestEffort);

        allocateDerivedPhase(PhaseTypeEnum.USER_ACCEPTANCE_TEST, SkillFunctionEnum.BUILD,
                null, activeResourcesByFunction, out, releaseId, uat.getStartDate(), uat.getEndDate(), workingDays, uatBuildEffort);
    }

    private void deriveAndAllocateSmoke(List<EffortEstimate> estimates,
                                        Map<PhaseTypeEnum, Phase> phases,
                                        Map<SkillFunctionEnum, List<Resource>> activeResourcesByFunction,
                                        List<Allocation> out,
                                        Long releaseId) {
        Phase uat = phases.get(PhaseTypeEnum.USER_ACCEPTANCE_TEST);
        if (uat == null) return;
        Phase smoke = phases.get(PhaseTypeEnum.SMOKE_TESTING);
        // If smoke phase not explicitly defined, assume 1 week immediately after UAT
        LocalDate smokeStart;
        LocalDate smokeEnd;
        if (smoke != null) {
            smokeStart = smoke.getStartDate();
            smokeEnd = smoke.getEndDate();
        } else {
            smokeStart = uat.getEndDate().plusDays(1);
            smokeEnd = smokeStart.plusDays(6);
        }
        int workingDays = countWorkingDays(smokeStart, smokeEnd);
        if (workingDays <= 0) return;

        double sitEffort = estimates.stream()
            .filter(e -> e.getPhase() == PhaseTypeEnum.SYSTEM_INTEGRATION_TEST)
            .mapToDouble(EffortEstimate::getEffortDays).sum();
        double buildEffort = estimates.stream()
            .filter(e -> e.getPhase() == PhaseTypeEnum.BUILD)
            .mapToDouble(EffortEstimate::getEffortDays).sum();

        double smokeTestEffort = sitEffort * 0.10;
        double smokeBuildEffort = buildEffort * 0.10;

        allocateDerivedPhase(PhaseTypeEnum.SMOKE_TESTING, SkillFunctionEnum.TEST,
                SkillSubFunctionEnum.MANUAL, activeResourcesByFunction, out, releaseId, smokeStart, smokeEnd, workingDays, smokeTestEffort);

        allocateDerivedPhase(PhaseTypeEnum.SMOKE_TESTING, SkillFunctionEnum.BUILD,
                null, activeResourcesByFunction, out, releaseId, smokeStart, smokeEnd, workingDays, smokeBuildEffort);
    }

    private void allocateDerivedPhase(PhaseTypeEnum phaseType,
                                      SkillFunctionEnum function,
                                      SkillSubFunctionEnum requiredSubFnOrNull,
                                      Map<SkillFunctionEnum, List<Resource>> activeResourcesByFunction,
                                      List<Allocation> out,
                                      Long releaseId,
                                      LocalDate start,
                                      LocalDate end,
                                      int workingDays,
                                      double totalEffortDays) {
        if (totalEffortDays <= 0) return;
        List<Resource> candidates = activeResourcesByFunction.getOrDefault(function, List.of());
        if (requiredSubFnOrNull != null) {
            candidates = candidates.stream().filter(r -> r.getSkillSubFunction() == requiredSubFnOrNull).toList();
        }
        if (candidates.isEmpty()) return;

        int heads = Math.max(1, (int) Math.ceil(totalEffortDays / (FULL_TIME_DAILY_FACTOR * workingDays)));
        heads = Math.min(heads, candidates.size());
        double dailyFactor = Math.min(FULL_TIME_DAILY_FACTOR, totalEffortDays / (workingDays * heads));
        if (dailyFactor < MIN_DAILY_FACTOR) {
            heads = Math.max(1, (int) Math.ceil(totalEffortDays / (MIN_DAILY_FACTOR * workingDays)));
            heads = Math.min(heads, candidates.size());
            dailyFactor = Math.max(MIN_DAILY_FACTOR, Math.min(FULL_TIME_DAILY_FACTOR, totalEffortDays / (workingDays * heads)));
        }
        for (int i = 0; i < heads; i++) {
            Resource r = candidates.get(i);
            Allocation a = new Allocation();
            Release rel = new Release();
            rel.setId(releaseId);
            a.setRelease(rel);
            a.setResource(r);
            a.setPhase(phaseType);
            a.setStartDate(start);
            a.setEndDate(end);
            a.setAllocationFactor(dailyFactor);
            a.setAllocationDays(dailyFactor * workingDays);
            out.add(a);
        }
    }
}


