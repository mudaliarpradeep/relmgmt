package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.WeeklyAllocationMatrixResponse;
import com.polycoder.relmgmt.dto.ResourceProfileResponse;
import com.polycoder.relmgmt.dto.WeeklyAllocationResponse;

import java.util.List;

/**
 * Service interface for managing weekly resource allocations
 */
public interface WeeklyAllocationService {
    
    /**
     * Get weekly allocation matrix for a given time window
     * @param currentWeekStart The start of the current week (YYYY-MM-DD format)
     * @return Weekly allocation matrix with resources and their weekly allocations
     */
    WeeklyAllocationMatrixResponse getWeeklyAllocations(String currentWeekStart);
    
    /**
     * Update weekly allocation for a specific resource and week
     * @param resourceId The resource ID
     * @param weekStart The start of the week (YYYY-MM-DD format)
     * @param personDays The number of person days to allocate
     */
    void updateWeeklyAllocation(String resourceId, String weekStart, Double personDays);
    
    /**
     * Get resource profile information
     * @param resourceId The resource ID
     * @return Resource profile information
     */
    ResourceProfileResponse getResourceProfile(String resourceId);
    
    /**
     * Get weekly allocations for a specific resource within a time range
     * @param resourceId The resource ID
     * @param startWeek The start week (YYYY-MM-DD format)
     * @param endWeek The end week (YYYY-MM-DD format)
     * @return List of weekly allocations for the resource
     */
    List<WeeklyAllocationResponse> getResourceWeeklyAllocations(String resourceId, String startWeek, String endWeek);
}
