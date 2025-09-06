package com.polycoder.relmgmt.service.impl;

import com.polycoder.relmgmt.dto.*;
import com.polycoder.relmgmt.entity.Allocation;
import com.polycoder.relmgmt.entity.Resource;
import com.polycoder.relmgmt.repository.AllocationRepository;
import com.polycoder.relmgmt.repository.ResourceRepository;
import com.polycoder.relmgmt.service.WeeklyAllocationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of WeeklyAllocationService
 */
@Service
@Transactional
public class WeeklyAllocationServiceImpl implements WeeklyAllocationService {

    private static final Logger log = LoggerFactory.getLogger(WeeklyAllocationServiceImpl.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final int WEEKS_BEFORE_CURRENT = 4;
    private static final int WEEKS_AFTER_CURRENT = 24;
    private static final int TOTAL_WEEKS = WEEKS_BEFORE_CURRENT + 1 + WEEKS_AFTER_CURRENT; // 29 weeks total

    private final AllocationRepository allocationRepository;
    private final ResourceRepository resourceRepository;

    public WeeklyAllocationServiceImpl(AllocationRepository allocationRepository, 
                                     ResourceRepository resourceRepository) {
        this.allocationRepository = allocationRepository;
        this.resourceRepository = resourceRepository;
    }

    @Override
    public WeeklyAllocationMatrixResponse getWeeklyAllocations(String currentWeekStart) {
        log.info("Getting weekly allocations for current week: {}", currentWeekStart);
        
        LocalDate currentWeek = LocalDate.parse(currentWeekStart, DATE_FORMATTER);
        LocalDate startWeek = currentWeek.minusWeeks(WEEKS_BEFORE_CURRENT);
        LocalDate endWeek = currentWeek.plusWeeks(WEEKS_AFTER_CURRENT);
        
        // Get all allocations within the time window
        List<Allocation> allocations = allocationRepository.findByDateRange(startWeek, endWeek);
        log.info("Found {} allocations in time window", allocations.size());
        
        // Get only resources that have allocations in the time window
        Set<Long> resourceIdsWithAllocations = allocations.stream()
            .map(allocation -> allocation.getResource().getId())
            .collect(Collectors.toSet());
        log.info("Found {} unique resources with allocations", resourceIdsWithAllocations.size());
        
        List<Resource> resourcesWithAllocations = resourceRepository.findByIdIn(resourceIdsWithAllocations);
        log.info("Retrieved {} resources with allocations", resourcesWithAllocations.size());
        
        // Build resource allocation responses for only allocated resources
        List<ResourceAllocationResponse> resourceAllocations = resourcesWithAllocations.stream()
            .map(resource -> buildResourceAllocationResponse(resource, allocations, startWeek, endWeek))
            .collect(Collectors.toList());
        
        // Build time window response
        TimeWindowResponse timeWindow = new TimeWindowResponse(
            startWeek.format(DATE_FORMATTER),
            endWeek.format(DATE_FORMATTER),
            TOTAL_WEEKS
        );
        
        return new WeeklyAllocationMatrixResponse(resourceAllocations, currentWeekStart, timeWindow);
    }

    @Override
    public void updateWeeklyAllocation(String resourceId, String weekStart, Double personDays) {
        log.info("Updating weekly allocation for resource {} on week {} to {} person days", 
                resourceId, weekStart, personDays);
        
        // This is a placeholder implementation
        // In a real implementation, you would:
        // 1. Find or create allocation records for the specific week
        // 2. Update the allocation factor based on person days
        // 3. Save the changes
        
        // For now, we'll just log the update
        log.info("Weekly allocation update requested - implementation pending");
    }

    @Override
    public ResourceProfileResponse getResourceProfile(String resourceId) {
        log.info("Getting resource profile for resource ID: {}", resourceId);
        
        Long id = Long.parseLong(resourceId);
        Resource resource = resourceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Resource not found with ID: " + resourceId));
        
        return new ResourceProfileResponse(
            resource.getId().toString(),
            resource.getName(),
            resource.getEmployeeGrade().getDisplayName(),
            resource.getSkillFunction().getDisplayName(),
            resource.getSkillSubFunction() != null ? resource.getSkillSubFunction().getDisplayName() : null,
            "/resources/" + resource.getId() // Profile URL
        );
    }

    @Override
    public List<WeeklyAllocationResponse> getResourceWeeklyAllocations(String resourceId, String startWeek, String endWeek) {
        log.info("Getting weekly allocations for resource {} from {} to {}", resourceId, startWeek, endWeek);
        
        Long id = Long.parseLong(resourceId);
        LocalDate start = LocalDate.parse(startWeek, DATE_FORMATTER);
        LocalDate end = LocalDate.parse(endWeek, DATE_FORMATTER);
        
        List<Allocation> allocations = allocationRepository.findByResourceIdAndDateRange(id, start, end);
        
        return buildWeeklyAllocationsForResource(allocations, start, end);
    }

    private ResourceAllocationResponse buildResourceAllocationResponse(Resource resource, 
                                                                     List<Allocation> allAllocations, 
                                                                     LocalDate startWeek, 
                                                                     LocalDate endWeek) {
        // Filter allocations for this resource
        List<Allocation> resourceAllocations = allAllocations.stream()
            .filter(allocation -> allocation.getResource().getId().equals(resource.getId()))
            .collect(Collectors.toList());
        
        // Build weekly allocations
        List<WeeklyAllocationResponse> weeklyAllocations = buildWeeklyAllocationsForResource(
            resourceAllocations, startWeek, endWeek);
        
        return new ResourceAllocationResponse(
            resource.getId().toString(),
            resource.getName(),
            resource.getEmployeeGrade().getDisplayName(),
            resource.getSkillFunction().getDisplayName(),
            resource.getSkillSubFunction() != null ? resource.getSkillSubFunction().getDisplayName() : null,
            "/resources/" + resource.getId(),
            weeklyAllocations
        );
    }

    private List<WeeklyAllocationResponse> buildWeeklyAllocationsForResource(List<Allocation> allocations, 
                                                                           LocalDate startWeek, 
                                                                           LocalDate endWeek) {
        List<WeeklyAllocationResponse> weeklyAllocations = new ArrayList<>();
        
        // Generate all weeks in the range
        LocalDate currentWeek = startWeek;
        while (!currentWeek.isAfter(endWeek)) {
            LocalDate weekStart = getMondayOfWeek(currentWeek);
            LocalDate weekEnd = weekStart.plusDays(6);
            
            // Calculate total person days for this week
            double totalPersonDays = 0.0;
            String projectName = null;
            String projectId = null;
            
            for (Allocation allocation : allocations) {
                if (isAllocationActiveInWeek(allocation, weekStart, weekEnd)) {
                    // Calculate the overlap between allocation and week
                    LocalDate overlapStart = allocation.getStartDate().isAfter(weekStart) ? 
                        allocation.getStartDate() : weekStart;
                    LocalDate overlapEnd = allocation.getEndDate().isBefore(weekEnd) ? 
                        allocation.getEndDate() : weekEnd;
                    
                    long overlapDays = overlapStart.until(overlapEnd).getDays() + 1;
                    double weeklyAllocation = (overlapDays * allocation.getAllocationFactor()) / 7.0;
                    totalPersonDays += weeklyAllocation;
                    
                    // Use the first project name found (in a real implementation, you might want to aggregate)
                    if (projectName == null && allocation.getRelease() != null) {
                        projectName = allocation.getRelease().getName();
                        projectId = allocation.getRelease().getId().toString();
                    }
                }
            }
            
            weeklyAllocations.add(new WeeklyAllocationResponse(
                weekStart.format(DATE_FORMATTER),
                totalPersonDays,
                projectName,
                projectId
            ));
            
            currentWeek = currentWeek.plusWeeks(1);
        }
        
        return weeklyAllocations;
    }

    private LocalDate getMondayOfWeek(LocalDate date) {
        return date.with(DayOfWeek.MONDAY);
    }

    private boolean isAllocationActiveInWeek(Allocation allocation, LocalDate weekStart, LocalDate weekEnd) {
        return !allocation.getStartDate().isAfter(weekEnd) && 
               !allocation.getEndDate().isBefore(weekStart);
    }
}
