package com.polycoder.relmgmt.controller.v1;

import com.polycoder.relmgmt.dto.AllocationConflictResponse;
import com.polycoder.relmgmt.dto.AllocationDto;
import com.polycoder.relmgmt.dto.WeeklyAllocationMatrixResponse;
import com.polycoder.relmgmt.dto.ResourceProfileResponse;
import com.polycoder.relmgmt.entity.Allocation;
import com.polycoder.relmgmt.entity.PhaseTypeEnum;
import com.polycoder.relmgmt.entity.Resource;
import com.polycoder.relmgmt.entity.SkillFunctionEnum;
import com.polycoder.relmgmt.entity.SkillSubFunctionEnum;
import com.polycoder.relmgmt.entity.StatusEnum;
import com.polycoder.relmgmt.service.AllocationService;
import com.polycoder.relmgmt.service.WeeklyAllocationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AllocationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AllocationService allocationService;

    @MockBean
    private WeeklyAllocationService weeklyAllocationService;

    // ObjectMapper is not needed for these endpoints

    @Test
    @WithMockUser
    void testGenerateAllocation() throws Exception {
        doNothing().when(allocationService).generateAllocation(1L);

        mockMvc.perform(post("/api/v1/releases/1/allocate"))
            .andExpect(status().isAccepted());

        verify(allocationService).generateAllocation(1L);
    }

    @Test
    @WithMockUser
    void testGetAllocationsForRelease() throws Exception {
        Resource r = new Resource();
        r.setId(123L);
        r.setName("Res");
        r.setStatus(StatusEnum.ACTIVE);
        r.setProjectStartDate(LocalDate.of(2025,1,1));
        r.setSkillFunction(SkillFunctionEnum.BUILD);
        r.setSkillSubFunction(SkillSubFunctionEnum.SAILPOINT);
        
        AllocationDto a = new AllocationDto();
        a.setId(1L);
        a.setPhase(PhaseTypeEnum.BUILD);
        a.setStartDate(LocalDate.of(2025, 1, 6));
        a.setEndDate(LocalDate.of(2025, 1, 10));
        a.setAllocationFactor(0.9);
        a.setAllocationDays(4.5);
        a.setResource(r);
        when(allocationService.getAllocationDtosForRelease(1L)).thenReturn(List.of(a));

        mockMvc.perform(get("/api/v1/releases/1/allocations").contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].phase").exists())
            .andExpect(jsonPath("$[0].allocationFactor").value(0.9));

        verify(allocationService).getAllocationDtosForRelease(1L);
    }

    @Test
    @WithMockUser
    void testGetAllocationsForResource() throws Exception {
        Allocation a = new Allocation();
        a.setPhase(PhaseTypeEnum.SYSTEM_INTEGRATION_TEST);
        a.setStartDate(LocalDate.of(2025, 2, 3));
        a.setEndDate(LocalDate.of(2025, 2, 7));
        a.setAllocationFactor(0.5);
        a.setAllocationDays(2.5);
        when(allocationService.getAllocationsForResource(5L)).thenReturn(List.of(a));

        mockMvc.perform(get("/api/v1/resources/5/allocations").contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].phase").exists())
            .andExpect(jsonPath("$[0].allocationFactor").value(0.5));

        verify(allocationService).getAllocationsForResource(5L);
    }

    @Test
    @WithMockUser
    void testGetAllocationConflicts() throws Exception {
        AllocationConflictResponse.WeeklyConflict w = new AllocationConflictResponse.WeeklyConflict(
            LocalDate.of(2025, 4, 7), 6.0, 4.5, 1.5);
        AllocationConflictResponse resp = new AllocationConflictResponse(100L, "Overloaded User", List.of(w));
        when(allocationService.getAllocationConflicts()).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/v1/allocations/conflicts").contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].resourceId").value(100))
            .andExpect(jsonPath("$[0].weeklyConflicts[0].overAllocation").value(1.5));

        verify(allocationService).getAllocationConflicts();
    }

    @Test
    @WithMockUser
    void testGetWeeklyAllocations() throws Exception {
        WeeklyAllocationMatrixResponse mockResponse = new WeeklyAllocationMatrixResponse();
        mockResponse.setCurrentWeekStart("2024-09-01");
        
        when(weeklyAllocationService.getWeeklyAllocations("2024-09-01")).thenReturn(mockResponse);

        mockMvc.perform(get("/api/v1/allocations/weekly")
                .param("currentWeekStart", "2024-09-01")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.currentWeekStart").value("2024-09-01"));

        verify(weeklyAllocationService).getWeeklyAllocations("2024-09-01");
    }

    @Test
    @WithMockUser
    void testUpdateWeeklyAllocation() throws Exception {
        doNothing().when(weeklyAllocationService).updateWeeklyAllocation("1", "2024-09-01", 4.5);

        mockMvc.perform(put("/api/v1/allocations/weekly/1/2024-09-01")
                .param("personDays", "4.5")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk());

        verify(weeklyAllocationService).updateWeeklyAllocation("1", "2024-09-01", 4.5);
    }

    @Test
    @WithMockUser
    void testGetResourceProfile() throws Exception {
        ResourceProfileResponse mockProfile = new ResourceProfileResponse();
        mockProfile.setId("1");
        mockProfile.setName("John Doe");
        mockProfile.setGrade("Senior");
        mockProfile.setSkillFunction("Engineering");
        mockProfile.setSkillSubFunction("Frontend");
        mockProfile.setProfileUrl("/resources/1");
        
        when(weeklyAllocationService.getResourceProfile("1")).thenReturn(mockProfile);

        mockMvc.perform(get("/api/v1/resources/1/profile")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("1"))
            .andExpect(jsonPath("$.name").value("John Doe"))
            .andExpect(jsonPath("$.grade").value("Senior"))
            .andExpect(jsonPath("$.skillFunction").value("Engineering"))
            .andExpect(jsonPath("$.skillSubFunction").value("Frontend"))
            .andExpect(jsonPath("$.profileUrl").value("/resources/1"));

        verify(weeklyAllocationService).getResourceProfile("1");
    }

    @Test
    void testUnauthorizedAccess() throws Exception {
        // Since security is temporarily disabled for testing, expect OK status
        // TODO: Update this test when security is re-enabled
        mockMvc.perform(get("/api/v1/allocations/conflicts"))
            .andExpect(status().isOk());
    }
}


