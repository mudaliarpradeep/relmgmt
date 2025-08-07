package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.*;
import com.polycoder.relmgmt.entity.*;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.exception.ValidationException;
import com.polycoder.relmgmt.repository.ReleaseRepository;
import com.polycoder.relmgmt.repository.PhaseRepository;
import com.polycoder.relmgmt.repository.BlockerRepository;
import com.polycoder.relmgmt.service.impl.ReleaseServiceImpl;
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

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReleaseServiceTest {

    @Mock
    private ReleaseRepository releaseRepository;

    @Mock
    private PhaseRepository phaseRepository;

    @Mock
    private BlockerRepository blockerRepository;

    @InjectMocks
    private ReleaseServiceImpl releaseService;

    private Release testRelease;
    private Phase testPhase;
    private Blocker testBlocker;
    private ReleaseRequest releaseRequest;
    private PhaseRequest phaseRequest;
    private BlockerRequest blockerRequest;

    @BeforeEach
    void setUp() {
        // Setup test release
        testRelease = new Release();
        testRelease.setId(1L);
        testRelease.setName("Test Release");
        testRelease.setIdentifier("REL-001");

        // Setup test phase
        testPhase = new Phase();
        testPhase.setId(1L);
        testPhase.setPhaseType(PhaseTypeEnum.FUNCTIONAL_DESIGN);
        testPhase.setStartDate(LocalDate.now().plusDays(10));
        testPhase.setEndDate(LocalDate.now().plusDays(20));
        testPhase.setRelease(testRelease);

        // Setup test blocker
        testBlocker = new Blocker();
        testBlocker.setId(1L);
        testBlocker.setDescription("Test blocker");
        testBlocker.setStatus(BlockerStatusEnum.OPEN);
        testBlocker.setRelease(testRelease);

        // Setup DTOs
        releaseRequest = new ReleaseRequest();
        releaseRequest.setName("Test Release");
        releaseRequest.setIdentifier("REL-001");
        releaseRequest.setPhases(Arrays.asList(
            new PhaseRequest("FUNCTIONAL_DESIGN", LocalDate.now().plusDays(10), LocalDate.now().plusDays(20))
        ));

        phaseRequest = new PhaseRequest();
        phaseRequest.setPhaseType("FUNCTIONAL_DESIGN");
        phaseRequest.setStartDate(LocalDate.now().plusDays(10));
        phaseRequest.setEndDate(LocalDate.now().plusDays(20));

        blockerRequest = new BlockerRequest();
        blockerRequest.setDescription("Test blocker");
        blockerRequest.setStatus("OPEN");
    }

    @Test
    void testGetAllReleases() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Release> releasePage = new PageImpl<>(Arrays.asList(testRelease), pageable, 1);
        
        when(releaseRepository.findAll(pageable)).thenReturn(releasePage);
        when(phaseRepository.findByReleaseId(anyLong())).thenReturn(Arrays.asList(testPhase));
        when(blockerRepository.findByReleaseId(anyLong())).thenReturn(Arrays.asList(testBlocker));

        Page<ReleaseResponse> result = releaseService.getAllReleases(null, null, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("REL-001", result.getContent().get(0).getIdentifier());
    }

    @Test
    void testGetReleaseById() {
        when(releaseRepository.findById(1L)).thenReturn(Optional.of(testRelease));
        when(phaseRepository.findByReleaseId(1L)).thenReturn(Arrays.asList(testPhase));
        when(blockerRepository.findByReleaseId(1L)).thenReturn(Arrays.asList(testBlocker));

        ReleaseResponse result = releaseService.getReleaseById(1L);

        assertEquals("REL-001", result.getIdentifier());
        assertEquals("Test Release", result.getName());
        assertEquals(1, result.getPhases().size());
        assertEquals(1, result.getBlockers().size());
    }

    @Test
    void testGetReleaseByIdNotFound() {
        when(releaseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            releaseService.getReleaseById(1L);
        });
    }

    @Test
    void testGetReleaseByIdentifier() {
        when(releaseRepository.findByIdentifier("REL-001")).thenReturn(Optional.of(testRelease));
        when(phaseRepository.findByReleaseId(1L)).thenReturn(Arrays.asList(testPhase));
        when(blockerRepository.findByReleaseId(1L)).thenReturn(Arrays.asList(testBlocker));

        ReleaseResponse result = releaseService.getReleaseByIdentifier("REL-001");

        assertEquals("REL-001", result.getIdentifier());
    }

    @Test
    void testCreateRelease() {
        when(releaseRepository.existsByIdentifier("REL-001")).thenReturn(false);
        when(releaseRepository.save(any(Release.class))).thenReturn(testRelease);
        when(releaseRepository.findById(1L)).thenReturn(Optional.of(testRelease));
        when(phaseRepository.existsByReleaseIdAndPhaseType(anyLong(), any(PhaseTypeEnum.class))).thenReturn(false);
        when(phaseRepository.save(any(Phase.class))).thenReturn(testPhase);
        when(phaseRepository.findByReleaseId(anyLong())).thenReturn(Arrays.asList(testPhase));
        when(blockerRepository.findByReleaseId(anyLong())).thenReturn(Arrays.asList());

        ReleaseResponse result = releaseService.createRelease(releaseRequest);

        assertEquals("REL-001", result.getIdentifier());
        verify(releaseRepository).save(any(Release.class));
    }

    @Test
    void testCreateReleaseWithDuplicateIdentifier() {
        when(releaseRepository.existsByIdentifier("REL-001")).thenReturn(true);

        assertThrows(ValidationException.class, () -> {
            releaseService.createRelease(releaseRequest);
        });
    }

    @Test
    void testUpdateRelease() {
        lenient().when(releaseRepository.findById(1L)).thenReturn(Optional.of(testRelease));
        lenient().when(releaseRepository.existsByIdentifier("REL-001")).thenReturn(false);
        lenient().when(releaseRepository.save(any(Release.class))).thenReturn(testRelease);

        ReleaseResponse result = releaseService.updateRelease(1L, releaseRequest);

        assertEquals("REL-001", result.getIdentifier());
        verify(releaseRepository).save(any(Release.class));
    }

    @Test
    void testUpdateReleaseNotFound() {
        when(releaseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            releaseService.updateRelease(1L, releaseRequest);
        });
    }

    @Test
    void testDeleteRelease() {
        when(releaseRepository.findById(1L)).thenReturn(Optional.of(testRelease));
        doNothing().when(releaseRepository).delete(testRelease);

        assertDoesNotThrow(() -> {
            releaseService.deleteRelease(1L);
        });

        verify(releaseRepository).delete(testRelease);
    }

    @Test
    void testGetActiveReleases() {
        when(releaseRepository.findActiveReleases(any(LocalDate.class)))
                .thenReturn(Arrays.asList(testRelease));
        when(phaseRepository.findByReleaseId(anyLong())).thenReturn(Arrays.asList(testPhase));
        when(blockerRepository.findByReleaseId(anyLong())).thenReturn(Arrays.asList(testBlocker));

        List<ReleaseResponse> result = releaseService.getActiveReleases();

        assertEquals(1, result.size());
        assertEquals("REL-001", result.get(0).getIdentifier());
    }

    @Test
    void testGetCompletedReleases() {
        when(releaseRepository.findCompletedReleases(any(LocalDate.class)))
                .thenReturn(Arrays.asList(testRelease));
        when(phaseRepository.findByReleaseId(anyLong())).thenReturn(Arrays.asList(testPhase));
        when(blockerRepository.findByReleaseId(anyLong())).thenReturn(Arrays.asList(testBlocker));

        List<ReleaseResponse> result = releaseService.getCompletedReleases();

        assertEquals(1, result.size());
        assertEquals("REL-001", result.get(0).getIdentifier());
    }

    @Test
    void testAddPhaseToRelease() {
        when(releaseRepository.findById(1L)).thenReturn(Optional.of(testRelease));
        when(phaseRepository.existsByReleaseIdAndPhaseType(1L, PhaseTypeEnum.FUNCTIONAL_DESIGN))
                .thenReturn(false);
        when(phaseRepository.save(any(Phase.class))).thenReturn(testPhase);

        PhaseResponse result = releaseService.addPhaseToRelease(1L, phaseRequest);

        assertEquals("FUNCTIONAL_DESIGN", result.getPhaseType());
        verify(phaseRepository).save(any(Phase.class));
    }

    @Test
    void testAddPhaseToReleaseDuplicatePhaseType() {
        when(releaseRepository.findById(1L)).thenReturn(Optional.of(testRelease));
        when(phaseRepository.existsByReleaseIdAndPhaseType(1L, PhaseTypeEnum.FUNCTIONAL_DESIGN))
                .thenReturn(true);

        assertThrows(ValidationException.class, () -> {
            releaseService.addPhaseToRelease(1L, phaseRequest);
        });
    }

    @Test
    void testUpdatePhase() {
        when(releaseRepository.findById(1L)).thenReturn(Optional.of(testRelease));
        when(phaseRepository.findById(1L)).thenReturn(Optional.of(testPhase));
        when(phaseRepository.existsByReleaseIdAndPhaseType(1L, PhaseTypeEnum.TECHNICAL_DESIGN))
                .thenReturn(false);
        when(phaseRepository.save(any(Phase.class))).thenReturn(testPhase);

        PhaseRequest updateRequest = new PhaseRequest();
        updateRequest.setPhaseType("TECHNICAL_DESIGN");
        updateRequest.setStartDate(LocalDate.now().plusDays(15));
        updateRequest.setEndDate(LocalDate.now().plusDays(25));

        PhaseResponse result = releaseService.updatePhase(1L, 1L, updateRequest);

        assertEquals("TECHNICAL_DESIGN", result.getPhaseType());
        verify(phaseRepository).save(any(Phase.class));
    }

    @Test
    void testDeletePhase() {
        when(releaseRepository.findById(1L)).thenReturn(Optional.of(testRelease));
        when(phaseRepository.findById(1L)).thenReturn(Optional.of(testPhase));
        doNothing().when(phaseRepository).delete(testPhase);

        assertDoesNotThrow(() -> {
            releaseService.deletePhase(1L, 1L);
        });

        verify(phaseRepository).delete(testPhase);
    }

    @Test
    void testAddBlockerToRelease() {
        when(releaseRepository.findById(1L)).thenReturn(Optional.of(testRelease));
        when(blockerRepository.save(any(Blocker.class))).thenReturn(testBlocker);

        BlockerResponse result = releaseService.addBlockerToRelease(1L, blockerRequest);

        assertEquals("OPEN", result.getStatus());
        assertEquals("Test blocker", result.getDescription());
        verify(blockerRepository).save(any(Blocker.class));
    }

    @Test
    void testUpdateBlocker() {
        when(releaseRepository.findById(1L)).thenReturn(Optional.of(testRelease));
        when(blockerRepository.findById(1L)).thenReturn(Optional.of(testBlocker));
        when(blockerRepository.save(any(Blocker.class))).thenReturn(testBlocker);

        BlockerRequest updateRequest = new BlockerRequest();
        updateRequest.setDescription("Updated blocker");
        updateRequest.setStatus("IN_PROGRESS");

        BlockerResponse result = releaseService.updateBlocker(1L, 1L, updateRequest);

        assertEquals("IN_PROGRESS", result.getStatus());
        assertEquals("Updated blocker", result.getDescription());
        verify(blockerRepository).save(any(Blocker.class));
    }

    @Test
    void testDeleteBlocker() {
        when(releaseRepository.findById(1L)).thenReturn(Optional.of(testRelease));
        when(blockerRepository.findById(1L)).thenReturn(Optional.of(testBlocker));
        doNothing().when(blockerRepository).delete(testBlocker);

        assertDoesNotThrow(() -> {
            releaseService.deleteBlocker(1L, 1L);
        });

        verify(blockerRepository).delete(testBlocker);
    }

    @Test
    void testGetPhasesForRelease() {
        when(releaseRepository.findById(1L)).thenReturn(Optional.of(testRelease));
        when(phaseRepository.findByReleaseId(1L)).thenReturn(Arrays.asList(testPhase));

        List<PhaseResponse> result = releaseService.getPhasesForRelease(1L);

        assertEquals(1, result.size());
        assertEquals("FUNCTIONAL_DESIGN", result.get(0).getPhaseType());
    }

    @Test
    void testGetBlockersForRelease() {
        when(releaseRepository.findById(1L)).thenReturn(Optional.of(testRelease));
        when(blockerRepository.findByReleaseId(1L)).thenReturn(Arrays.asList(testBlocker));

        List<BlockerResponse> result = releaseService.getBlockersForRelease(1L);

        assertEquals(1, result.size());
        assertEquals("OPEN", result.get(0).getStatus());
    }

    @Test
    void testFindById() {
        when(releaseRepository.findById(1L)).thenReturn(Optional.of(testRelease));

        Release result = releaseService.findById(1L);

        assertEquals(testRelease, result);
    }

    @Test
    void testFindByIdNotFound() {
        when(releaseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            releaseService.findById(1L);
        });
    }

    @Test
    void testCanDeleteRelease() {
        boolean result = releaseService.canDeleteRelease(1L);
        assertTrue(result); // Currently always returns true
    }

    @Test
    void testValidateProductionGoLiveRule() {
        when(phaseRepository.findProductionGoLivePhasesInDateRange(any(), any()))
                .thenReturn(Arrays.asList(testPhase));

        boolean result = releaseService.validateProductionGoLiveRule(
                LocalDate.now(), LocalDate.now().plusDays(30), null);

        assertFalse(result); // Should return false when there are existing phases
    }
} 