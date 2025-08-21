package com.polycoder.relmgmt.controller.v1;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polycoder.relmgmt.dto.ComponentRequest;
import com.polycoder.relmgmt.dto.ComponentResponse;
import com.polycoder.relmgmt.entity.ComponentTypeEnum;
import com.polycoder.relmgmt.service.ComponentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.exception.ValidationException;
import com.polycoder.relmgmt.exception.GlobalExceptionHandler;

@ExtendWith(MockitoExtension.class)
class ComponentControllerTest {

    @Mock
    private ComponentService componentService;

    @InjectMocks
    private ComponentController componentController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private ComponentResponse testComponentResponse;
    private ComponentRequest testComponentRequest;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(componentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        // Setup test response
        testComponentResponse = new ComponentResponse();
        testComponentResponse.setId(1L);
        testComponentResponse.setName("Test Component");
        testComponentResponse.setComponentType(ComponentTypeEnum.ETL);
        testComponentResponse.setTechnicalDesignDays(5.0);
        testComponentResponse.setBuildDays(10.0);
        testComponentResponse.setScopeItemId(1L);
        testComponentResponse.setCreatedAt(LocalDateTime.now());
        testComponentResponse.setUpdatedAt(LocalDateTime.now());

        // Setup test request
        testComponentRequest = new ComponentRequest();
        testComponentRequest.setName("Test Component");
        testComponentRequest.setComponentType(ComponentTypeEnum.ETL);
        testComponentRequest.setTechnicalDesignDays(5.0);
        testComponentRequest.setBuildDays(10.0);
    }

    @Test
    void testGetComponentsByScopeItemId_Success() throws Exception {
        List<ComponentResponse> components = Arrays.asList(testComponentResponse);
        when(componentService.findByScopeItemId(1L)).thenReturn(components);

        mockMvc.perform(get("/api/v1/scope-items/1/components")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Test Component"))
                .andExpect(jsonPath("$[0].componentType").value("ETL"))
                .andExpect(jsonPath("$[0].technicalDesignDays").value(5.0))
                .andExpect(jsonPath("$[0].buildDays").value(10.0))
                .andExpect(jsonPath("$[0].scopeItemId").value(1))
                .andExpect(jsonPath("$[0].totalEffortDays").value(15.0));

        verify(componentService).findByScopeItemId(1L);
    }

    @Test
    void testGetComponentById_Success() throws Exception {
        when(componentService.findById(1L)).thenReturn(testComponentResponse);

        mockMvc.perform(get("/api/v1/components/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test Component"))
                .andExpect(jsonPath("$.componentType").value("ETL"))
                .andExpect(jsonPath("$.technicalDesignDays").value(5.0))
                .andExpect(jsonPath("$.buildDays").value(10.0));

        verify(componentService).findById(1L);
    }

    @Test
    void testCreateComponent_Success() throws Exception {
        when(componentService.create(eq(1L), any(ComponentRequest.class))).thenReturn(testComponentResponse);

        mockMvc.perform(post("/api/v1/scope-items/1/components")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testComponentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test Component"))
                .andExpect(jsonPath("$.componentType").value("ETL"));

        verify(componentService).create(eq(1L), any(ComponentRequest.class));
    }

    @Test
    void testCreateComponent_InvalidRequest() throws Exception {
        testComponentRequest.setName(""); // Invalid empty name

        mockMvc.perform(post("/api/v1/scope-items/1/components")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testComponentRequest)))
                .andExpect(status().isBadRequest());

        verify(componentService, never()).create(any(), any());
    }

    @Test
    void testUpdateComponent_Success() throws Exception {
        when(componentService.update(eq(1L), any(ComponentRequest.class))).thenReturn(testComponentResponse);

        mockMvc.perform(put("/api/v1/components/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testComponentRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test Component"))
                .andExpect(jsonPath("$.componentType").value("ETL"));

        verify(componentService).update(eq(1L), any(ComponentRequest.class));
    }

    @Test
    void testUpdateComponent_InvalidRequest() throws Exception {
        testComponentRequest.setTechnicalDesignDays(0.5); // Below minimum

        mockMvc.perform(put("/api/v1/components/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testComponentRequest)))
                .andExpect(status().isBadRequest());

        verify(componentService, never()).update(any(), any());
    }

    @Test
    void testDeleteComponent_Success() throws Exception {
        doNothing().when(componentService).delete(1L);

        mockMvc.perform(delete("/api/v1/components/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(componentService).delete(1L);
    }

    @Test
    void testGetComponentTypes_Success() throws Exception {
        mockMvc.perform(get("/api/v1/components/types")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0]").value("ETL"))
                .andExpect(jsonPath("$[1]").value("FORGEROCK_IGA"))
                .andExpect(jsonPath("$[2]").value("FORGEROCK_UI"))
                .andExpect(jsonPath("$[3]").value("FORGEROCK_IG"))
                .andExpect(jsonPath("$[4]").value("FORGEROCK_IDM"))
                .andExpect(jsonPath("$[5]").value("SAILPOINT"))
                .andExpect(jsonPath("$[6]").value("FUNCTIONAL_TEST"));
    }

    @Test
    void testGetComponentsByType_Success() throws Exception {
        List<ComponentResponse> components = Arrays.asList(testComponentResponse);
        when(componentService.findByComponentType(ComponentTypeEnum.ETL)).thenReturn(components);

        mockMvc.perform(get("/api/v1/components/type/ETL")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Test Component"))
                .andExpect(jsonPath("$[0].componentType").value("ETL"));

        verify(componentService).findByComponentType(ComponentTypeEnum.ETL);
    }

    @Test
    void testGetComponentsByReleaseId_Success() throws Exception {
        List<ComponentResponse> components = Arrays.asList(testComponentResponse);
        when(componentService.findByReleaseId(1L)).thenReturn(components);

        mockMvc.perform(get("/api/v1/releases/1/components")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Test Component"))
                .andExpect(jsonPath("$[0].componentType").value("ETL"));

        verify(componentService).findByReleaseId(1L);
    }

    @Test
    void testGetComponentsByReleaseIdAndType_Success() throws Exception {
        List<ComponentResponse> components = Arrays.asList(testComponentResponse);
        when(componentService.findByReleaseIdAndComponentType(1L, ComponentTypeEnum.ETL)).thenReturn(components);

        mockMvc.perform(get("/api/v1/releases/1/components/type/ETL")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Test Component"))
                .andExpect(jsonPath("$[0].componentType").value("ETL"));

        verify(componentService).findByReleaseIdAndComponentType(1L, ComponentTypeEnum.ETL);
    }

    @Test
    void testCreateComponent_ValidationError() throws Exception {
        testComponentRequest.setBuildDays(1500.0); // Above maximum

        mockMvc.perform(post("/api/v1/scope-items/1/components")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testComponentRequest)))
                .andExpect(status().isBadRequest());

        verify(componentService, never()).create(any(), any());
    }

    @Test
    void testUpdateComponent_ValidationError() throws Exception {
        testComponentRequest.setTechnicalDesignDays(0.0); // Below minimum

        mockMvc.perform(put("/api/v1/components/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testComponentRequest)))
                .andExpect(status().isBadRequest());

        verify(componentService, never()).update(any(), any());
    }

    @Test
    void testCreateComponent_MissingRequiredFields() throws Exception {
        testComponentRequest.setName(null); // Missing required field

        mockMvc.perform(post("/api/v1/scope-items/1/components")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testComponentRequest)))
                .andExpect(status().isBadRequest());

        verify(componentService, never()).create(any(), any());
    }

    @Test
    void testUpdateComponent_MissingRequiredFields() throws Exception {
        testComponentRequest.setComponentType(null); // Missing required field

        mockMvc.perform(put("/api/v1/components/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testComponentRequest)))
                .andExpect(status().isBadRequest());

        verify(componentService, never()).update(any(), any());
    }

    @Test
    void testGetComponentById_NotFound() throws Exception {
        when(componentService.findById(999L)).thenThrow(new ResourceNotFoundException("Component not found"));

        mockMvc.perform(get("/api/v1/components/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(componentService).findById(999L);
    }

    @Test
    void testCreateComponent_ScopeItemNotFound() throws Exception {
        when(componentService.create(eq(999L), any(ComponentRequest.class)))
                .thenThrow(new ResourceNotFoundException("Scope item not found"));

        mockMvc.perform(post("/api/v1/scope-items/999/components")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testComponentRequest)))
                .andExpect(status().isNotFound());

        verify(componentService).create(eq(999L), any(ComponentRequest.class));
    }

    @Test
    void testUpdateComponent_ComponentNotFound() throws Exception {
        when(componentService.update(eq(999L), any(ComponentRequest.class)))
                .thenThrow(new ResourceNotFoundException("Component not found"));

        mockMvc.perform(put("/api/v1/components/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testComponentRequest)))
                .andExpect(status().isNotFound());

        verify(componentService).update(eq(999L), any(ComponentRequest.class));
    }

    @Test
    void testDeleteComponent_ComponentNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Component not found")).when(componentService).delete(999L);

        mockMvc.perform(delete("/api/v1/components/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(componentService).delete(999L);
    }
}
