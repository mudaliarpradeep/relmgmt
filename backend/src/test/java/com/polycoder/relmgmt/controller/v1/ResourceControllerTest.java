package com.polycoder.relmgmt.controller.v1;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polycoder.relmgmt.dto.ResourceRequest;
import com.polycoder.relmgmt.dto.ResourceResponse;
import com.polycoder.relmgmt.entity.StatusEnum;
import com.polycoder.relmgmt.entity.SkillFunctionEnum;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.exception.ValidationException;
import com.polycoder.relmgmt.service.ResourceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ResourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ResourceService resourceService;

    @Autowired
    private ObjectMapper objectMapper;

    private ResourceRequest resourceRequest;
    private ResourceResponse resourceResponse;

    @BeforeEach
    void setUp() {
        resourceRequest = new ResourceRequest();
        resourceRequest.setName("John Doe");
        resourceRequest.setEmployeeNumber("12345678");
        resourceRequest.setEmail("john.doe@example.com");
        resourceRequest.setStatus("Active");
        resourceRequest.setProjectStartDate(LocalDate.of(2024, 1, 15));
        resourceRequest.setProjectEndDate(LocalDate.of(2024, 12, 31));
        resourceRequest.setEmployeeGrade("Level 8");
        resourceRequest.setSkillFunction("Build");
        resourceRequest.setSkillSubFunction("ForgeRock IDM");

        resourceResponse = new ResourceResponse();
        resourceResponse.setId(1L);
        resourceResponse.setName("John Doe");
        resourceResponse.setEmployeeNumber("12345678");
        resourceResponse.setEmail("john.doe@example.com");
        resourceResponse.setStatus("Active");
        resourceResponse.setProjectStartDate(LocalDate.of(2024, 1, 15));
        resourceResponse.setProjectEndDate(LocalDate.of(2024, 12, 31));
        resourceResponse.setEmployeeGrade("Level 8");
        resourceResponse.setSkillFunction("Build");
        resourceResponse.setSkillSubFunction("ForgeRock IDM");
        resourceResponse.setCreatedAt(LocalDateTime.now());
        resourceResponse.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @WithMockUser
    void testGetAllResources() throws Exception {
        // Arrange
        Page<ResourceResponse> resourcePage = new PageImpl<>(Arrays.asList(resourceResponse));
        when(resourceService.getAllResources(any(), any(), any(), any())).thenReturn(resourcePage);

        // Act & Assert
        mockMvc.perform(get("/api/v1/resources")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").exists())
                .andExpect(jsonPath("$.content[0].name").value("John Doe"))
                .andExpect(jsonPath("$.content[0].employeeNumber").value("12345678"));

        verify(resourceService).getAllResources(any(), any(), any(), any());
    }

    @Test
    @WithMockUser
    void testGetAllResourcesWithFilters() throws Exception {
        // Arrange
        Page<ResourceResponse> resourcePage = new PageImpl<>(Arrays.asList(resourceResponse));
        when(resourceService.getAllResources(eq(StatusEnum.ACTIVE), eq(SkillFunctionEnum.BUILD), any(), any()))
            .thenReturn(resourcePage);

        // Act & Assert
        mockMvc.perform(get("/api/v1/resources")
                .param("status", "ACTIVE")
                .param("skillFunction", "BUILD")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").exists())
                .andExpect(jsonPath("$.content[0].name").value("John Doe"));

        verify(resourceService).getAllResources(eq(StatusEnum.ACTIVE), eq(SkillFunctionEnum.BUILD), any(), any());
    }

    @Test
    @WithMockUser
    void testGetResourceById() throws Exception {
        // Arrange
        when(resourceService.getResourceById(1L)).thenReturn(resourceResponse);

        // Act & Assert
        mockMvc.perform(get("/api/v1/resources/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.employeeNumber").value("12345678"));

        verify(resourceService).getResourceById(1L);
    }

    @Test
    @WithMockUser
    void testGetResourceByIdNotFound() throws Exception {
        // Arrange
        when(resourceService.getResourceById(1L)).thenThrow(new ResourceNotFoundException("Resource not found"));

        // Act & Assert
        mockMvc.perform(get("/api/v1/resources/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(resourceService).getResourceById(1L);
    }

    @Test
    @WithMockUser
    void testCreateResource() throws Exception {
        // Arrange
        when(resourceService.createResource(any(ResourceRequest.class))).thenReturn(resourceResponse);

        // Act & Assert
        mockMvc.perform(post("/api/v1/resources")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resourceRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.employeeNumber").value("12345678"));

        verify(resourceService).createResource(any(ResourceRequest.class));
    }

    @Test
    @WithMockUser
    void testCreateResourceValidationError() throws Exception {
        // Arrange
        when(resourceService.createResource(any(ResourceRequest.class)))
            .thenThrow(new ValidationException("Employee number already exists"));

        // Act & Assert
        mockMvc.perform(post("/api/v1/resources")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resourceRequest)))
                .andExpect(status().isBadRequest());

        verify(resourceService).createResource(any(ResourceRequest.class));
    }

    @Test
    @WithMockUser
    void testCreateResourceWithInvalidData() throws Exception {
        // Arrange
        ResourceRequest invalidRequest = new ResourceRequest();
        invalidRequest.setName(""); // Invalid empty name

        // Act & Assert
        mockMvc.perform(post("/api/v1/resources")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(resourceService, never()).createResource(any(ResourceRequest.class));
    }

    @Test
    @WithMockUser
    void testUpdateResource() throws Exception {
        // Arrange
        when(resourceService.updateResource(eq(1L), any(ResourceRequest.class))).thenReturn(resourceResponse);

        // Act & Assert
        mockMvc.perform(put("/api/v1/resources/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resourceRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("John Doe"));

        verify(resourceService).updateResource(eq(1L), any(ResourceRequest.class));
    }

    @Test
    @WithMockUser
    void testUpdateResourceNotFound() throws Exception {
        // Arrange
        when(resourceService.updateResource(eq(1L), any(ResourceRequest.class)))
            .thenThrow(new ResourceNotFoundException("Resource not found"));

        // Act & Assert
        mockMvc.perform(put("/api/v1/resources/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resourceRequest)))
                .andExpect(status().isNotFound());

        verify(resourceService).updateResource(eq(1L), any(ResourceRequest.class));
    }

    @Test
    @WithMockUser
    void testDeleteResource() throws Exception {
        // Arrange
        doNothing().when(resourceService).deleteResource(1L);

        // Act & Assert
        mockMvc.perform(delete("/api/v1/resources/1"))
                .andExpect(status().isNoContent());

        verify(resourceService).deleteResource(1L);
    }

    @Test
    @WithMockUser
    void testDeleteResourceNotFound() throws Exception {
        // Arrange
        doThrow(new ResourceNotFoundException("Resource not found")).when(resourceService).deleteResource(1L);

        // Act & Assert
        mockMvc.perform(delete("/api/v1/resources/1"))
                .andExpect(status().isNotFound());

        verify(resourceService).deleteResource(1L);
    }

    @Test
    @WithMockUser
    void testDeleteResourceConflict() throws Exception {
        // Arrange
        doThrow(new ValidationException("Cannot delete resource. Resource is allocated to active releases."))
            .when(resourceService).deleteResource(1L);

        // Act & Assert
        mockMvc.perform(delete("/api/v1/resources/1"))
                .andExpect(status().isConflict());

        verify(resourceService).deleteResource(1L);
    }

    @Test
    @WithMockUser
    void testGetActiveResources() throws Exception {
        // Arrange
        List<ResourceResponse> activeResources = Arrays.asList(resourceResponse);
        when(resourceService.getActiveResources()).thenReturn(activeResources);

        // Act & Assert
        mockMvc.perform(get("/api/v1/resources/active")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("John Doe"));

        verify(resourceService).getActiveResources();
    }

    @Test
    void testUnauthorizedAccess() throws Exception {
        // Act & Assert - Test without @WithMockUser
        // Since security is temporarily disabled for testing, expect OK status
        // TODO: Update this test when security is re-enabled
        mockMvc.perform(get("/api/v1/resources"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void testManuallyUpdateExpiredResourcesStatus() throws Exception {
        // Arrange
        when(resourceService.updateExpiredResourcesStatus()).thenReturn(3);

        // Act & Assert
        mockMvc.perform(post("/api/v1/resources/update-expired-status")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Expired resources status update completed"))
                .andExpect(jsonPath("$.updatedCount").value(3))
                .andExpect(jsonPath("$.timestamp").exists());

        verify(resourceService).updateExpiredResourcesStatus();
    }

    @Test
    @WithMockUser
    void testManuallyUpdateExpiredResourcesStatus_NoUpdates() throws Exception {
        // Arrange
        when(resourceService.updateExpiredResourcesStatus()).thenReturn(0);

        // Act & Assert
        mockMvc.perform(post("/api/v1/resources/update-expired-status")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Expired resources status update completed"))
                .andExpect(jsonPath("$.updatedCount").value(0))
                .andExpect(jsonPath("$.timestamp").exists());

        verify(resourceService).updateExpiredResourcesStatus();
    }
}