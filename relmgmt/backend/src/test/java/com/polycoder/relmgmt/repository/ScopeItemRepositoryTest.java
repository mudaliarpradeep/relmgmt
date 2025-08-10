package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class ScopeItemRepositoryTest {

    @Autowired
    private ScopeItemRepository scopeItemRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ReleaseRepository releaseRepository;

    private Release release;
    private Project project;
    private ScopeItem s1;
    private ScopeItem s2;

    @BeforeEach
    void setUp() {
        release = new Release();
        release.setName("R1");
        release.setIdentifier("2025-002");
        release = releaseRepository.save(release);

        project = new Project();
        project.setName("Project X");
        project.setType(ProjectTypeEnum.DAY_1);
        project.setRelease(release);
        project = projectRepository.save(project);

        s1 = new ScopeItem();
        s1.setName("Login");
        s1.setProject(project);
        s1 = scopeItemRepository.save(s1);

        s2 = new ScopeItem();
        s2.setName("Dashboard");
        s2.setDescription("Main page");
        s2.setProject(project);
        s2 = scopeItemRepository.save(s2);
    }

    @Test
    void testFindByProjectId() {
        List<ScopeItem> items = scopeItemRepository.findByProjectId(project.getId());
        assertEquals(2, items.size());
    }

    @Test
    void testSearchByNameAndDescription() {
        List<ScopeItem> byName = scopeItemRepository.findByProjectIdAndNameContainingIgnoreCase(project.getId(), "log");
        assertEquals(1, byName.size());
        assertEquals("Login", byName.get(0).getName());

        List<ScopeItem> byDesc = scopeItemRepository.findByProjectIdAndDescriptionContainingIgnoreCase(project.getId(), "main");
        assertEquals(1, byDesc.size());
        assertEquals("Dashboard", byDesc.get(0).getName());
    }

    @Test
    void testExistsAndFindByName() {
        assertTrue(scopeItemRepository.existsByProjectIdAndName(project.getId(), "Login"));
        assertFalse(scopeItemRepository.existsByProjectIdAndName(project.getId(), "Nope"));

        assertTrue(scopeItemRepository.findByProjectIdAndName(project.getId(), "Login").isPresent());
    }

    @Test
    void testCountByProjectId() {
        assertEquals(2, scopeItemRepository.countByProjectId(project.getId()));
    }
}


