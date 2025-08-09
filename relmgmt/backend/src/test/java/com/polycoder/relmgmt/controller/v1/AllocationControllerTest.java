package com.polycoder.relmgmt.controller.v1;

import com.polycoder.relmgmt.dto.AllocationConflictResponse;
import com.polycoder.relmgmt.entity.Allocation;
import com.polycoder.relmgmt.entity.PhaseTypeEnum;
import com.polycoder.relmgmt.entity.Resource;
import com.polycoder.relmgmt.entity.SkillFunctionEnum;
import com.polycoder.relmgmt.entity.SkillSubFunctionEnum;
import com.polycoder.relmgmt.entity.StatusEnum;
import com.polycoder.relmgmt.service.AllocationService;
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
        Allocation a = new Allocation();
        a.setPhase(PhaseTypeEnum.BUILD);
        a.setStartDate(LocalDate.of(2025, 1, 6));
        a.setEndDate(LocalDate.of(2025, 1, 10));
        a.setAllocationFactor(0.9);
        a.setAllocationDays(4.5);
        Resource r = new Resource();
        r.setId(123L);
        r.setName("Res");
        r.setStatus(StatusEnum.ACTIVE);
        r.setProjectStartDate(LocalDate.of(2025,1,1));
        r.setSkillFunction(SkillFunctionEnum.BUILD);
        r.setSkillSubFunction(SkillSubFunctionEnum.SAILPOINT);
        a.setResource(r);
        when(allocationService.getAllocationsForRelease(1L)).thenReturn(List.of(a));

        mockMvc.perform(get("/api/v1/releases/1/allocations").contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].phase").exists())
            .andExpect(jsonPath("$[0].allocationFactor").value(0.9));

        verify(allocationService).getAllocationsForRelease(1L);
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
    void testUnauthorizedAccess() throws Exception {
        mockMvc.perform(get("/api/v1/allocations/conflicts"))
            .andExpect(status().isForbidden());
    }
}


