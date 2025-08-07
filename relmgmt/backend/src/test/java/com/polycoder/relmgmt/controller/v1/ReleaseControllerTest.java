package com.polycoder.relmgmt.controller.v1;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polycoder.relmgmt.dto.*;
import com.polycoder.relmgmt.service.ReleaseService;
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

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class ReleaseControllerTest {

    @Mock
    private ReleaseService releaseService;

    @InjectMocks
    private ReleaseController releaseController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private ReleaseResponse testReleaseResponse;
    private ReleaseRequest testReleaseRequest;
    private PhaseResponse testPhaseResponse;
    private PhaseRequest testPhaseRequest;
    private BlockerResponse testBlockerResponse;
    private BlockerRequest testBlockerRequest;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(releaseController).build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules(); // Register JavaTimeModule for LocalDate serialization

        // Setup test responses
        testReleaseResponse = new ReleaseResponse();
        testReleaseResponse.setId(1L);
        testReleaseResponse.setName("Test Release");
        testReleaseResponse.setIdentifier("REL-001");
        testReleaseResponse.setPhases(Arrays.asList(
            new PhaseResponse(1L, "FUNCTIONAL_DESIGN", "Functional Design", 
                            LocalDate.now().plusDays(10), LocalDate.now().plusDays(20), 1L)
        ));
        testReleaseResponse.setBlockers(Arrays.asList(
            new BlockerResponse(1L, "Test blocker", "OPEN", "Open", 1L)
        ));

        testReleaseRequest = new ReleaseRequest();
        testReleaseRequest.setName("Test Release");
        testReleaseRequest.setIdentifier("REL-001");
        testReleaseRequest.setPhases(Arrays.asList(
            new PhaseRequest("FUNCTIONAL_DESIGN", LocalDate.now().plusDays(10), LocalDate.now().plusDays(20))
        ));

        testPhaseResponse = new PhaseResponse();
        testPhaseResponse.setId(1L);
        testPhaseResponse.setPhaseType("FUNCTIONAL_DESIGN");
        testPhaseResponse.setPhaseTypeDisplayName("Functional Design");
        testPhaseResponse.setStartDate(LocalDate.now().plusDays(10));
        testPhaseResponse.setEndDate(LocalDate.now().plusDays(20));
        testPhaseResponse.setReleaseId(1L);

        testPhaseRequest = new PhaseRequest();
        testPhaseRequest.setPhaseType("FUNCTIONAL_DESIGN");
        testPhaseRequest.setStartDate(LocalDate.now().plusDays(10));
        testPhaseRequest.setEndDate(LocalDate.now().plusDays(20));

        testBlockerResponse = new BlockerResponse();
        testBlockerResponse.setId(1L);
        testBlockerResponse.setDescription("Test blocker");
        testBlockerResponse.setStatus("OPEN");
        testBlockerResponse.setStatusDisplayName("Open");
        testBlockerResponse.setReleaseId(1L);

        testBlockerRequest = new BlockerRequest();
        testBlockerRequest.setDescription("Test blocker");
        testBlockerRequest.setStatus("OPEN");
    }

    @Test
    void testGetAllReleases() throws Exception {
        Pageable pageable = PageRequest.of(0, 20);
        Page<ReleaseResponse> releasePage = new PageImpl<>(Arrays.asList(testReleaseResponse), pageable, 1);
        
        when(releaseService.getAllReleases(isNull(), isNull(), any(Pageable.class)))
                .thenReturn(releasePage);

        mockMvc.perform(get("/api/v1/releases")
                .param("page", "0")
                .param("size", "20")
                .param("sort", "name,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].identifier").value("REL-001"))
                .andExpect(jsonPath("$.content[0].name").value("Test Release"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void testGetReleaseById() throws Exception {
        when(releaseService.getReleaseById(1L)).thenReturn(testReleaseResponse);

        mockMvc.perform(get("/api/v1/releases/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.identifier").value("REL-001"))
                .andExpect(jsonPath("$.name").value("Test Release"));
    }

    @Test
    void testGetReleaseByIdentifier() throws Exception {
        when(releaseService.getReleaseByIdentifier("REL-001")).thenReturn(testReleaseResponse);

        mockMvc.perform(get("/api/v1/releases/identifier/REL-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.identifier").value("REL-001"));
    }

    @Test
    void testCreateRelease() throws Exception {
        when(releaseService.createRelease(any(ReleaseRequest.class))).thenReturn(testReleaseResponse);

        mockMvc.perform(post("/api/v1/releases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testReleaseRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.identifier").value("REL-001"));
    }

    @Test
    void testUpdateRelease() throws Exception {
        when(releaseService.updateRelease(eq(1L), any(ReleaseRequest.class))).thenReturn(testReleaseResponse);

        mockMvc.perform(put("/api/v1/releases/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testReleaseRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.identifier").value("REL-001"));
    }

    @Test
    void testDeleteRelease() throws Exception {
        doNothing().when(releaseService).deleteRelease(1L);

        mockMvc.perform(delete("/api/v1/releases/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void testGetActiveReleases() throws Exception {
        List<ReleaseResponse> activeReleases = Arrays.asList(testReleaseResponse);
        when(releaseService.getActiveReleases()).thenReturn(activeReleases);

        mockMvc.perform(get("/api/v1/releases/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].identifier").value("REL-001"));
    }

    @Test
    void testGetCompletedReleases() throws Exception {
        List<ReleaseResponse> completedReleases = Arrays.asList(testReleaseResponse);
        when(releaseService.getCompletedReleases()).thenReturn(completedReleases);

        mockMvc.perform(get("/api/v1/releases/completed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].identifier").value("REL-001"));
    }

    @Test
    void testGetReleasesWithBlockers() throws Exception {
        List<ReleaseResponse> releasesWithBlockers = Arrays.asList(testReleaseResponse);
        when(releaseService.getReleasesWithBlockers()).thenReturn(releasesWithBlockers);

        mockMvc.perform(get("/api/v1/releases/with-blockers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].identifier").value("REL-001"));
    }

    @Test
    void testGetReleasesWithOpenBlockers() throws Exception {
        List<ReleaseResponse> releasesWithOpenBlockers = Arrays.asList(testReleaseResponse);
        when(releaseService.getReleasesWithOpenBlockers()).thenReturn(releasesWithOpenBlockers);

        mockMvc.perform(get("/api/v1/releases/with-open-blockers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].identifier").value("REL-001"));
    }

    @Test
    void testGetPhasesForRelease() throws Exception {
        List<PhaseResponse> phases = Arrays.asList(testPhaseResponse);
        when(releaseService.getPhasesForRelease(1L)).thenReturn(phases);

        mockMvc.perform(get("/api/v1/releases/1/phases"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].phaseType").value("FUNCTIONAL_DESIGN"));
    }

    @Test
    void testAddPhaseToRelease() throws Exception {
        when(releaseService.addPhaseToRelease(eq(1L), any(PhaseRequest.class))).thenReturn(testPhaseResponse);

        mockMvc.perform(post("/api/v1/releases/1/phases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPhaseRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.phaseType").value("FUNCTIONAL_DESIGN"));
    }

    @Test
    void testUpdatePhase() throws Exception {
        when(releaseService.updatePhase(eq(1L), eq(1L), any(PhaseRequest.class))).thenReturn(testPhaseResponse);

        mockMvc.perform(put("/api/v1/releases/1/phases/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPhaseRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phaseType").value("FUNCTIONAL_DESIGN"));
    }

    @Test
    void testDeletePhase() throws Exception {
        doNothing().when(releaseService).deletePhase(1L, 1L);

        mockMvc.perform(delete("/api/v1/releases/1/phases/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void testGetBlockersForRelease() throws Exception {
        List<BlockerResponse> blockers = Arrays.asList(testBlockerResponse);
        when(releaseService.getBlockersForRelease(1L)).thenReturn(blockers);

        mockMvc.perform(get("/api/v1/releases/1/blockers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("OPEN"));
    }

    @Test
    void testAddBlockerToRelease() throws Exception {
        when(releaseService.addBlockerToRelease(eq(1L), any(BlockerRequest.class))).thenReturn(testBlockerResponse);

        mockMvc.perform(post("/api/v1/releases/1/blockers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBlockerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    void testUpdateBlocker() throws Exception {
        when(releaseService.updateBlocker(eq(1L), eq(1L), any(BlockerRequest.class))).thenReturn(testBlockerResponse);

        mockMvc.perform(put("/api/v1/releases/1/blockers/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBlockerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    void testDeleteBlocker() throws Exception {
        doNothing().when(releaseService).deleteBlocker(1L, 1L);

        mockMvc.perform(delete("/api/v1/releases/1/blockers/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void testGetAllReleasesWithFilters() throws Exception {
        Pageable pageable = PageRequest.of(0, 20);
        Page<ReleaseResponse> releasePage = new PageImpl<>(Arrays.asList(testReleaseResponse), pageable, 1);
        
        when(releaseService.getAllReleases(eq("test"), eq("REL"), any(Pageable.class)))
                .thenReturn(releasePage);

        mockMvc.perform(get("/api/v1/releases")
                .param("name", "test")
                .param("identifier", "REL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].identifier").value("REL-001"));
    }
} 