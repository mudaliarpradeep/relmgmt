package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.Release;
import com.polycoder.relmgmt.entity.Phase;
import com.polycoder.relmgmt.entity.PhaseTypeEnum;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
public class ReleaseRepositoryTest {

    @Autowired
    private ReleaseRepository releaseRepository;

    @Autowired
    private PhaseRepository phaseRepository;

    private Release testRelease1;
    private Release testRelease2;
    private Phase productionPhase1;
    private Phase productionPhase2;

    @BeforeEach
    void setUp() {
        // Create test releases
        testRelease1 = new Release();
        testRelease1.setName("Test Release 1");
        testRelease1.setIdentifier("REL-001");
        testRelease1 = releaseRepository.save(testRelease1);

        testRelease2 = new Release();
        testRelease2.setName("Test Release 2");
        testRelease2.setIdentifier("REL-002");
        testRelease2 = releaseRepository.save(testRelease2);

        // Create production go-live phases
        productionPhase1 = new Phase();
        productionPhase1.setPhaseType(PhaseTypeEnum.PRODUCTION_GO_LIVE);
        productionPhase1.setStartDate(LocalDate.now().plusDays(30));
        productionPhase1.setEndDate(LocalDate.now().plusDays(30));
        productionPhase1.setRelease(testRelease1);
        productionPhase1 = phaseRepository.save(productionPhase1);

        productionPhase2 = new Phase();
        productionPhase2.setPhaseType(PhaseTypeEnum.PRODUCTION_GO_LIVE);
        productionPhase2.setStartDate(LocalDate.now().minusDays(30));
        productionPhase2.setEndDate(LocalDate.now().minusDays(30));
        productionPhase2.setRelease(testRelease2);
        productionPhase2 = phaseRepository.save(productionPhase2);
    }

    @Test
    void testFindByIdentifier() {
        Optional<Release> found = releaseRepository.findByIdentifier("REL-001");
        assertTrue(found.isPresent());
        assertEquals("REL-001", found.get().getIdentifier());
        assertEquals("Test Release 1", found.get().getName());
    }

    @Test
    void testFindByIdentifierNotFound() {
        Optional<Release> found = releaseRepository.findByIdentifier("NON-EXISTENT");
        assertFalse(found.isPresent());
    }

    @Test
    void testExistsByIdentifier() {
        assertTrue(releaseRepository.existsByIdentifier("REL-001"));
        assertFalse(releaseRepository.existsByIdentifier("NON-EXISTENT"));
    }

    @Test
    void testFindByNameContainingIgnoreCase() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Release> releases = releaseRepository.findByNameContainingIgnoreCase("test", pageable);
        
        assertEquals(2, releases.getTotalElements());
        assertTrue(releases.getContent().stream()
                .anyMatch(r -> r.getName().equals("Test Release 1")));
        assertTrue(releases.getContent().stream()
                .anyMatch(r -> r.getName().equals("Test Release 2")));
    }

    @Test
    void testFindByNameContainingIgnoreCaseCaseInsensitive() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Release> releases = releaseRepository.findByNameContainingIgnoreCase("RELEASE", pageable);
        
        assertEquals(2, releases.getTotalElements());
    }

    @Test
    void testFindByIdentifierContainingIgnoreCase() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Release> releases = releaseRepository.findByIdentifierContainingIgnoreCase("REL", pageable);
        
        assertEquals(2, releases.getTotalElements());
        assertTrue(releases.getContent().stream()
                .anyMatch(r -> r.getIdentifier().equals("REL-001")));
        assertTrue(releases.getContent().stream()
                .anyMatch(r -> r.getIdentifier().equals("REL-002")));
    }

    @Test
    void testFindActiveReleases() {
        List<Release> activeReleases = releaseRepository.findActiveReleases(LocalDate.now());
        
        assertEquals(1, activeReleases.size());
        assertEquals("REL-001", activeReleases.get(0).getIdentifier());
    }

    @Test
    void testFindCompletedReleases() {
        List<Release> completedReleases = releaseRepository.findCompletedReleases(LocalDate.now());
        
        assertEquals(1, completedReleases.size());
        assertEquals("REL-002", completedReleases.get(0).getIdentifier());
    }

    @Test
    void testFindReleasesWithBlockers() {
        // This test will be empty until we add blockers
        List<Release> releasesWithBlockers = releaseRepository.findReleasesWithBlockers();
        assertEquals(0, releasesWithBlockers.size());
    }

    @Test
    void testFindReleasesWithOpenBlockers() {
        // This test will be empty until we add blockers
        List<Release> releasesWithOpenBlockers = releaseRepository.findReleasesWithOpenBlockers();
        assertEquals(0, releasesWithOpenBlockers.size());
    }

    @Test
    void testSaveAndFindById() {
        Release newRelease = new Release();
        newRelease.setName("New Test Release");
        newRelease.setIdentifier("REL-003");
        
        Release saved = releaseRepository.save(newRelease);
        assertNotNull(saved.getId());
        
        Optional<Release> found = releaseRepository.findById(saved.getId());
        assertTrue(found.isPresent());
        assertEquals("REL-003", found.get().getIdentifier());
    }

    @Test
    void testUpdateRelease() {
        testRelease1.setName("Updated Release Name");
        Release updated = releaseRepository.save(testRelease1);
        
        assertEquals("Updated Release Name", updated.getName());
        assertEquals("REL-001", updated.getIdentifier());
    }

    @Test
    void testDeleteRelease() {
        Long releaseId = testRelease1.getId();
        releaseRepository.delete(testRelease1);
        
        Optional<Release> found = releaseRepository.findById(releaseId);
        assertFalse(found.isPresent());
    }
} 