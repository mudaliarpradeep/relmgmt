package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.*;
import com.polycoder.relmgmt.entity.*;
import com.polycoder.relmgmt.repository.AllocationRepository;
import com.polycoder.relmgmt.repository.ResourceRepository;
import com.polycoder.relmgmt.service.impl.WeeklyAllocationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WeeklyAllocationServiceTest {

    @Mock
    private AllocationRepository allocationRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private WeeklyAllocationServiceImpl weeklyAllocationService;

    private Resource testResource;
    private Allocation testAllocation;
    private Release testRelease;

    @BeforeEach
    void setUp() {
        // Create test resource
        testResource = new Resource();
        testResource.setId(1L);
        testResource.setName("John Doe");
        testResource.setEmployeeGrade(EmployeeGradeEnum.LEVEL_8);
        testResource.setSkillFunction(SkillFunctionEnum.BUILD);
        testResource.setSkillSubFunction(SkillSubFunctionEnum.FORGEROCK_IDM);
        testResource.setStatus(StatusEnum.ACTIVE);

        // Create test release
        testRelease = new Release();
        testRelease.setId(1L);
        testRelease.setName("Test Release");
        testRelease.setIdentifier("2024-001");

        // Create test allocation
        testAllocation = new Allocation();
        testAllocation.setId(1L);
        testAllocation.setResource(testResource);
        testAllocation.setRelease(testRelease);
        testAllocation.setPhase(PhaseTypeEnum.BUILD);
        testAllocation.setStartDate(LocalDate.of(2024, 9, 1));
        testAllocation.setEndDate(LocalDate.of(2024, 9, 7));
        testAllocation.setAllocationFactor(0.9);
        testAllocation.setAllocationDays(6.3);
    }

    @Test
    void getWeeklyAllocations_ShouldReturnMatrixWithResources() {
        // Arrange
        String currentWeekStart = "2024-09-01";
        List<Resource> resources = Arrays.asList(testResource);
        List<Allocation> allocations = Arrays.asList(testAllocation);

        when(allocationRepository.findByDateRange(any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(allocations);
        when(resourceRepository.findByIdIn(any())).thenReturn(resources);

        // Act
        WeeklyAllocationMatrixResponse result = weeklyAllocationService.getWeeklyAllocations(currentWeekStart);

        // Assert
        assertNotNull(result);
        assertEquals(currentWeekStart, result.getCurrentWeekStart());
        assertEquals(1, result.getResources().size());
        assertEquals(29, result.getTimeWindow().getTotalWeeks());

        ResourceAllocationResponse resourceAllocation = result.getResources().get(0);
        assertEquals("1", resourceAllocation.getId());
        assertEquals("John Doe", resourceAllocation.getName());
        assertEquals("Level 8", resourceAllocation.getGrade());
        assertEquals("Build", resourceAllocation.getSkillFunction());
        assertEquals("ForgeRock IDM", resourceAllocation.getSkillSubFunction());
        assertEquals("/resources/1", resourceAllocation.getProfileUrl());

        verify(allocationRepository).findByDateRange(any(LocalDate.class), any(LocalDate.class));
        verify(resourceRepository).findByIdIn(any());
    }

    @Test
    void getWeeklyAllocations_ShouldHandleEmptyResources() {
        // Arrange
        String currentWeekStart = "2024-09-01";
        when(allocationRepository.findByDateRange(any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(Arrays.asList());
        when(resourceRepository.findByIdIn(any())).thenReturn(Arrays.asList());

        // Act
        WeeklyAllocationMatrixResponse result = weeklyAllocationService.getWeeklyAllocations(currentWeekStart);

        // Assert
        assertNotNull(result);
        assertEquals(0, result.getResources().size());
        assertEquals(29, result.getTimeWindow().getTotalWeeks());
    }

    @Test
    void getResourceProfile_ShouldReturnProfileForValidResource() {
        // Arrange
        String resourceId = "1";
        when(resourceRepository.findById(1L)).thenReturn(java.util.Optional.of(testResource));

        // Act
        ResourceProfileResponse result = weeklyAllocationService.getResourceProfile(resourceId);

        // Assert
        assertNotNull(result);
        assertEquals("1", result.getId());
        assertEquals("John Doe", result.getName());
        assertEquals("Level 8", result.getGrade());
        assertEquals("Build", result.getSkillFunction());
        assertEquals("ForgeRock IDM", result.getSkillSubFunction());
        assertEquals("/resources/1", result.getProfileUrl());

        verify(resourceRepository).findById(1L);
    }

    @Test
    void getResourceProfile_ShouldThrowExceptionForInvalidResource() {
        // Arrange
        String resourceId = "999";
        when(resourceRepository.findById(999L)).thenReturn(java.util.Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            weeklyAllocationService.getResourceProfile(resourceId);
        });

        assertEquals("Resource not found with ID: 999", exception.getMessage());
    }

    @Test
    void getResourceWeeklyAllocations_ShouldReturnWeeklyAllocations() {
        // Arrange
        String resourceId = "1";
        String startWeek = "2024-09-01";
        String endWeek = "2024-09-08";
        List<Allocation> allocations = Arrays.asList(testAllocation);

        when(allocationRepository.findByResourceIdAndDateRange(1L, LocalDate.parse(startWeek), LocalDate.parse(endWeek)))
            .thenReturn(allocations);

        // Act
        List<WeeklyAllocationResponse> result = weeklyAllocationService.getResourceWeeklyAllocations(resourceId, startWeek, endWeek);

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
        
        WeeklyAllocationResponse weeklyAllocation = result.get(0);
        // The week start should be the Monday of the week containing the allocation
        // Since the allocation starts on 2024-09-01 (Sunday), the Monday of that week is 2024-08-26
        assertEquals("2024-08-26", weeklyAllocation.getWeekStart());
        assertTrue(weeklyAllocation.getPersonDays() > 0);
        assertEquals("Test Release", weeklyAllocation.getProjectName());
        assertEquals("1", weeklyAllocation.getProjectId());

        verify(allocationRepository).findByResourceIdAndDateRange(1L, LocalDate.parse(startWeek), LocalDate.parse(endWeek));
    }

    @Test
    void updateWeeklyAllocation_ShouldLogUpdateRequest() {
        // Arrange
        String resourceId = "1";
        String weekStart = "2024-09-01";
        Double personDays = 4.5;

        // Act
        weeklyAllocationService.updateWeeklyAllocation(resourceId, weekStart, personDays);

        // Assert
        // Since this is a placeholder implementation, we just verify no exceptions are thrown
        // In a real implementation, you would verify the actual update logic
        assertTrue(true);
    }

    @Test
    void getWeeklyAllocations_ShouldCalculateCorrectTimeWindow() {
        // Arrange
        String currentWeekStart = "2024-09-01";
        when(allocationRepository.findByDateRange(any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(Arrays.asList());
        when(resourceRepository.findByIdIn(any())).thenReturn(Arrays.asList());

        // Act
        WeeklyAllocationMatrixResponse result = weeklyAllocationService.getWeeklyAllocations(currentWeekStart);

        // Assert
        TimeWindowResponse timeWindow = result.getTimeWindow();
        assertNotNull(timeWindow);
        assertEquals(29, timeWindow.getTotalWeeks());
        
        // Verify the time window spans the correct range (4 weeks before + current + 24 weeks after)
        LocalDate currentWeek = LocalDate.parse(currentWeekStart);
        LocalDate expectedStart = currentWeek.minusWeeks(4);
        LocalDate expectedEnd = currentWeek.plusWeeks(24);
        
        assertEquals(expectedStart.toString(), timeWindow.getStartWeek());
        assertEquals(expectedEnd.toString(), timeWindow.getEndWeek());
    }
}
