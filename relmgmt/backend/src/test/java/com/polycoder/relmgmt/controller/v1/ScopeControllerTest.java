package com.polycoder.relmgmt.controller.v1;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polycoder.relmgmt.dto.ScopeItemRequest;
import com.polycoder.relmgmt.dto.ScopeItemResponse;
import com.polycoder.relmgmt.dto.ScopeItemWithComponentsResponse;
import com.polycoder.relmgmt.dto.ReleaseEffortSummaryResponse;
import com.polycoder.relmgmt.service.ScopeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;


import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.exception.GlobalExceptionHandler;

@ExtendWith(MockitoExtension.class)
class ScopeControllerTest {

    @Mock
    private ScopeService scopeService;

    @InjectMocks
    private ScopeController scopeController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private ScopeItemResponse testScopeItemResponse;
    private ScopeItemRequest testScopeItemRequest;
    private ScopeItemWithComponentsResponse testScopeItemWithComponentsResponse;
    private ReleaseEffortSummaryResponse testReleaseEffortSummaryResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(scopeController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        // Setup test scope item response
        testScopeItemResponse = new ScopeItemResponse();
        testScopeItemResponse.setId(1L);
        testScopeItemResponse.setName("Test Scope Item");
        testScopeItemResponse.setDescription("Test Description");
        testScopeItemResponse.setReleaseId(1L);
        testScopeItemResponse.setReleaseName("Test Release");
        testScopeItemResponse.setFunctionalDesignDays(5.0);
        testScopeItemResponse.setSitDays(3.0);
        testScopeItemResponse.setUatDays(2.0);
        testScopeItemResponse.setComponentsCount(2);
        testScopeItemResponse.setCreatedAt(LocalDateTime.now());
        testScopeItemResponse.setUpdatedAt(LocalDateTime.now());

        // Setup test scope item request
        testScopeItemRequest = new ScopeItemRequest();
        testScopeItemRequest.setName("Test Scope Item");
        testScopeItemRequest.setDescription("Test Description");
        testScopeItemRequest.setFunctionalDesignDays(5.0);
        testScopeItemRequest.setSitDays(3.0);
        testScopeItemRequest.setUatDays(2.0);

        // Setup test scope item with components response
        testScopeItemWithComponentsResponse = new ScopeItemWithComponentsResponse();
        testScopeItemWithComponentsResponse.setId(1L);
        testScopeItemWithComponentsResponse.setName("Test Scope Item");
        testScopeItemWithComponentsResponse.setDescription("Test Description");
        testScopeItemWithComponentsResponse.setReleaseId(1L);
        testScopeItemWithComponentsResponse.setReleaseName("Test Release");
        testScopeItemWithComponentsResponse.setFunctionalDesignDays(5.0);
        testScopeItemWithComponentsResponse.setSitDays(3.0);
        testScopeItemWithComponentsResponse.setUatDays(2.0);
        testScopeItemWithComponentsResponse.setTotalEffortDays(15.0);
        testScopeItemWithComponentsResponse.setCreatedAt(LocalDateTime.now());
        testScopeItemWithComponentsResponse.setUpdatedAt(LocalDateTime.now());

        // Setup test release effort summary response
        testReleaseEffortSummaryResponse = new ReleaseEffortSummaryResponse();
        testReleaseEffortSummaryResponse.setReleaseId(1L);

        testReleaseEffortSummaryResponse.setFunctionalDesignDays(10.0);
        testReleaseEffortSummaryResponse.setTechnicalDesignDays(15.0);
        testReleaseEffortSummaryResponse.setBuildDays(20.0);
        testReleaseEffortSummaryResponse.setSitDays(8.0);
        testReleaseEffortSummaryResponse.setUatDays(6.0);
        testReleaseEffortSummaryResponse.setRegressionTestingDays(5.0);
        testReleaseEffortSummaryResponse.setSmokeTestingDays(2.0);
        testReleaseEffortSummaryResponse.setGoLiveDays(1.0);
    }

    @Test
    void testGetScopeItemsByReleaseId_Success() throws Exception {
        List<ScopeItemResponse> scopeItems = Arrays.asList(testScopeItemResponse);
        Page<ScopeItemResponse> page = new PageImpl<>(scopeItems, PageRequest.of(0, 10), 1);
        when(scopeService.findByReleaseId(eq(1L), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/releases/1/scope-items")
                        .param("page", "0")
                        .param("size", "10")
                        .param("sort", "name")
                        .param("direction", "asc")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Test Scope Item"))
                .andExpect(jsonPath("$[0].description").value("Test Description"))
                .andExpect(jsonPath("$[0].releaseId").value(1))

                .andExpect(jsonPath("$[0].functionalDesignDays").value(5.0))
                .andExpect(jsonPath("$[0].sitDays").value(3.0))
                .andExpect(jsonPath("$[0].uatDays").value(2.0))
                .andExpect(jsonPath("$[0].componentsCount").value(2));

        verify(scopeService).findByReleaseId(eq(1L), any(Pageable.class));
    }

    @Test
    void testGetAllScopeItemsByReleaseId_Success() throws Exception {
        List<ScopeItemResponse> scopeItems = Arrays.asList(testScopeItemResponse);
        when(scopeService.findByReleaseId(1L)).thenReturn(scopeItems);

        mockMvc.perform(get("/api/v1/releases/1/scope-items/all")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Test Scope Item"))
                .andExpect(jsonPath("$[0].description").value("Test Description"));

        verify(scopeService).findByReleaseId(1L);
    }

    @Test
    void testGetScopeItemById_Success() throws Exception {
        when(scopeService.findById(1L)).thenReturn(testScopeItemResponse);

        mockMvc.perform(get("/api/v1/scope-items/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test Scope Item"))
                .andExpect(jsonPath("$.description").value("Test Description"))
                .andExpect(jsonPath("$.releaseId").value(1))
                .andExpect(jsonPath("$.releaseName").value("Test Release"));

        verify(scopeService).findById(1L);
    }

    @Test
    void testSearchScopeItemsByName_Success() throws Exception {
        List<ScopeItemResponse> scopeItems = Arrays.asList(testScopeItemResponse);
        when(scopeService.findByReleaseIdAndNameContaining(1L, "Test")).thenReturn(scopeItems);

        mockMvc.perform(get("/api/v1/releases/1/scope-items/search")
                        .param("name", "Test")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Test Scope Item"));

        verify(scopeService).findByReleaseIdAndNameContaining(1L, "Test");
    }

    @Test
    void testSearchScopeItemsByDescription_Success() throws Exception {
        List<ScopeItemResponse> scopeItems = Arrays.asList(testScopeItemResponse);
        when(scopeService.findByReleaseIdAndDescriptionContaining(1L, "Test")).thenReturn(scopeItems);

        mockMvc.perform(get("/api/v1/releases/1/scope-items/search/description")
                        .param("description", "Test")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].description").value("Test Description"));

        verify(scopeService).findByReleaseIdAndDescriptionContaining(1L, "Test");
    }

    @Test
    void testCreateScopeItem_Success() throws Exception {
        when(scopeService.create(eq(1L), any(ScopeItemRequest.class))).thenReturn(testScopeItemResponse);

        mockMvc.perform(post("/api/v1/releases/1/scope-items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testScopeItemRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test Scope Item"))
                .andExpect(jsonPath("$.description").value("Test Description"))
                .andExpect(jsonPath("$.releaseId").value(1))
                .andExpect(jsonPath("$.releaseName").value("Test Release"));

        verify(scopeService).create(eq(1L), any(ScopeItemRequest.class));
    }

    @Test
    void testCreateScopeItem_InvalidRequest() throws Exception {
        testScopeItemRequest.setName(""); // Invalid empty name

        mockMvc.perform(post("/api/v1/releases/1/scope-items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testScopeItemRequest)))
                .andExpect(status().isBadRequest());

        verify(scopeService, never()).create(any(), any());
    }

    @Test
    void testUpdateScopeItem_Success() throws Exception {
        when(scopeService.update(eq(1L), any(ScopeItemRequest.class))).thenReturn(testScopeItemResponse);

        mockMvc.perform(put("/api/v1/scope-items/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testScopeItemRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test Scope Item"))
                .andExpect(jsonPath("$.description").value("Test Description"));

        verify(scopeService).update(eq(1L), any(ScopeItemRequest.class));
    }

    @Test
    void testUpdateScopeItem_InvalidRequest() throws Exception {
        testScopeItemRequest.setFunctionalDesignDays(0.5); // Below minimum

        mockMvc.perform(put("/api/v1/scope-items/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testScopeItemRequest)))
                .andExpect(status().isBadRequest());

        verify(scopeService, never()).update(any(), any());
    }

    @Test
    void testDeleteScopeItem_Success() throws Exception {
        doNothing().when(scopeService).delete(1L);

        mockMvc.perform(delete("/api/v1/scope-items/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(scopeService).delete(1L);
    }

    @Test
    void testGetScopeItemsWithComponents_Success() throws Exception {
        List<ScopeItemResponse> scopeItems = Arrays.asList(testScopeItemResponse);
        when(scopeService.findScopeItemsWithComponents(1L)).thenReturn(scopeItems);

        mockMvc.perform(get("/api/v1/releases/1/scope-items/with-components")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Test Scope Item"))
                .andExpect(jsonPath("$[0].componentsCount").value(2));

        verify(scopeService).findScopeItemsWithComponents(1L);
    }

    @Test
    void testGetScopeItemsWithComponentsDetail_Success() throws Exception {
        List<ScopeItemWithComponentsResponse> scopeItems = Arrays.asList(testScopeItemWithComponentsResponse);
        when(scopeService.findByReleaseIdWithComponents(1L)).thenReturn(scopeItems);

        mockMvc.perform(get("/api/v1/releases/1/scope-items/with-components-detail")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Test Scope Item"))
                .andExpect(jsonPath("$[0].totalEffortDays").value(15.0));

        verify(scopeService).findByReleaseIdWithComponents(1L);
    }

    @Test
    void testGetScopeItemsWithoutComponents_Success() throws Exception {
        List<ScopeItemResponse> scopeItems = Arrays.asList(testScopeItemResponse);
        when(scopeService.findScopeItemsWithoutComponents(1L)).thenReturn(scopeItems);

        mockMvc.perform(get("/api/v1/releases/1/scope-items/without-components")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Test Scope Item"));

        verify(scopeService).findScopeItemsWithoutComponents(1L);
    }

    @Test
    void testGetReleaseEffortSummary_Success() throws Exception {
        when(scopeService.getReleaseEffortSummary(1L)).thenReturn(testReleaseEffortSummaryResponse);

        mockMvc.perform(get("/api/v1/releases/1/effort-summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.releaseId").value(1))
                .andExpect(jsonPath("$.functionalDesignDays").value(10.0))
                .andExpect(jsonPath("$.technicalDesignDays").value(15.0))
                .andExpect(jsonPath("$.buildDays").value(20.0))
                .andExpect(jsonPath("$.sitDays").value(8.0))
                .andExpect(jsonPath("$.uatDays").value(6.0))
                .andExpect(jsonPath("$.regressionTestingDays").value(5.0))
                .andExpect(jsonPath("$.smokeTestingDays").value(2.0))
                .andExpect(jsonPath("$.goLiveDays").value(1.0));

        verify(scopeService).getReleaseEffortSummary(1L);
    }

    @Test
    void testCanDeleteScopeItem_Success() throws Exception {
        when(scopeService.canDeleteScopeItem(1L)).thenReturn(true);

        mockMvc.perform(get("/api/v1/scope-items/1/can-delete")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));

        verify(scopeService).canDeleteScopeItem(1L);
    }

    @Test
    void testCanDeleteScopeItem_False() throws Exception {
        when(scopeService.canDeleteScopeItem(1L)).thenReturn(false);

        mockMvc.perform(get("/api/v1/scope-items/1/can-delete")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));

        verify(scopeService).canDeleteScopeItem(1L);
    }

    @Test
    void testCreateScopeItem_ValidationError() throws Exception {
        testScopeItemRequest.setSitDays(1500.0); // Above maximum

        mockMvc.perform(post("/api/v1/releases/1/scope-items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testScopeItemRequest)))
                .andExpect(status().isBadRequest());

        verify(scopeService, never()).create(any(), any());
    }

    @Test
    void testUpdateScopeItem_ValidationError() throws Exception {
        testScopeItemRequest.setUatDays(0.0); // Below minimum

        mockMvc.perform(put("/api/v1/scope-items/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testScopeItemRequest)))
                .andExpect(status().isBadRequest());

        verify(scopeService, never()).update(any(), any());
    }

    @Test
    void testCreateScopeItem_MissingRequiredFields() throws Exception {
        testScopeItemRequest.setName(null); // Missing required field

        mockMvc.perform(post("/api/v1/releases/1/scope-items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testScopeItemRequest)))
                .andExpect(status().isBadRequest());

        verify(scopeService, never()).create(any(), any());
    }

    @Test
    void testUpdateScopeItem_MissingRequiredFields() throws Exception {
        testScopeItemRequest.setFunctionalDesignDays(null); // Missing required field

        mockMvc.perform(put("/api/v1/scope-items/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testScopeItemRequest)))
                .andExpect(status().isBadRequest());

        verify(scopeService, never()).update(any(), any());
    }

    @Test
    void testGetScopeItemById_NotFound() throws Exception {
        when(scopeService.findById(999L)).thenThrow(new ResourceNotFoundException("Scope item not found"));

        mockMvc.perform(get("/api/v1/scope-items/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(scopeService).findById(999L);
    }

    @Test
    void testCreateScopeItem_ReleaseNotFound() throws Exception {
        when(scopeService.create(eq(999L), any(ScopeItemRequest.class)))
                .thenThrow(new ResourceNotFoundException("Release not found"));

        mockMvc.perform(post("/api/v1/releases/999/scope-items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testScopeItemRequest)))
                .andExpect(status().isNotFound());

        verify(scopeService).create(eq(999L), any(ScopeItemRequest.class));
    }

    @Test
    void testUpdateScopeItem_ScopeItemNotFound() throws Exception {
        when(scopeService.update(eq(999L), any(ScopeItemRequest.class)))
                .thenThrow(new ResourceNotFoundException("Scope item not found"));

        mockMvc.perform(put("/api/v1/scope-items/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testScopeItemRequest)))
                .andExpect(status().isNotFound());

        verify(scopeService).update(eq(999L), any(ScopeItemRequest.class));
    }

    @Test
    void testDeleteScopeItem_ScopeItemNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Scope item not found")).when(scopeService).delete(999L);

        mockMvc.perform(delete("/api/v1/scope-items/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(scopeService).delete(999L);
    }

    @Test
    void testGetReleaseEffortSummary_ReleaseNotFound() throws Exception {
        when(scopeService.getReleaseEffortSummary(999L))
                .thenThrow(new ResourceNotFoundException("Release not found"));

        mockMvc.perform(get("/api/v1/releases/999/effort-summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(scopeService).getReleaseEffortSummary(999L);
    }
}
