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
class ProjectRepositoryTest {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ReleaseRepository releaseRepository;

    @Autowired
    private ScopeItemRepository scopeItemRepository;

    private Release release;
    private Project day1Project;
    private Project day2Project;

    @BeforeEach
    void setUp() {
        release = new Release();
        release.setName("R1");
        release.setIdentifier("2025-001");
        release = releaseRepository.save(release);

        day1Project = new Project();
        day1Project.setName("Project A");
        day1Project.setDescription("Alpha");
        day1Project.setType(ProjectTypeEnum.DAY_1);
        day1Project.setRelease(release);
        day1Project = projectRepository.save(day1Project);

        day2Project = new Project();
        day2Project.setName("Project B");
        day2Project.setDescription("Beta");
        day2Project.setType(ProjectTypeEnum.DAY_2);
        day2Project.setRelease(release);
        day2Project = projectRepository.save(day2Project);

        // add a scope item to day1 to exercise queries that depend on SIZE(scopeItems)
        ScopeItem s = new ScopeItem();
        s.setName("Scope 1");
        s.setProject(day1Project);
        scopeItemRepository.save(s);
    }

    @Test
    void testFindByReleaseId() {
        List<Project> projects = projectRepository.findByReleaseId(release.getId());
        assertEquals(2, projects.size());
    }

    @Test
    void testFindByReleaseIdAndType() {
        List<Project> projects = projectRepository.findByReleaseIdAndType(release.getId(), ProjectTypeEnum.DAY_1);
        assertEquals(1, projects.size());
        assertEquals(ProjectTypeEnum.DAY_1, projects.get(0).getType());
    }

    @Test
    void testNameAndDescriptionSearch() {
        List<Project> byName = projectRepository.findByReleaseIdAndNameContainingIgnoreCase(release.getId(), "project");
        assertEquals(2, byName.size());

        List<Project> byDesc = projectRepository.findByReleaseIdAndDescriptionContainingIgnoreCase(release.getId(), "alpha");
        assertEquals(1, byDesc.size());
        assertEquals("Project A", byDesc.get(0).getName());
    }

    @Test
    void testExistsAndFindByName() {
        assertTrue(projectRepository.existsByReleaseIdAndName(release.getId(), "Project A"));
        assertFalse(projectRepository.existsByReleaseIdAndName(release.getId(), "Nope"));

        assertTrue(projectRepository.findByReleaseIdAndName(release.getId(), "Project A").isPresent());
    }

    @Test
    void testCountByType() {
        long day1Count = projectRepository.countByReleaseIdAndType(release.getId(), ProjectTypeEnum.DAY_1);
        long day2Count = projectRepository.countByReleaseIdAndType(release.getId(), ProjectTypeEnum.DAY_2);
        assertEquals(1, day1Count);
        assertEquals(1, day2Count);
    }

    @Test
    void testProjectsWithAndWithoutScopeItems() {
        List<Project> withScope = projectRepository.findProjectsWithScopeItems(release.getId());
        List<Project> withoutScope = projectRepository.findProjectsWithoutScopeItems(release.getId());

        assertEquals(1, withScope.size());
        assertEquals(day1Project.getId(), withScope.get(0).getId());
        assertEquals(1, withoutScope.size());
        assertEquals(day2Project.getId(), withoutScope.get(0).getId());
    }

    @Test
    void testProjectsByTypeWithScopeItemsCount() {
        List<Object[]> rows = projectRepository.findProjectsByTypeWithScopeItemsCount(release.getId(), ProjectTypeEnum.DAY_1);
        assertEquals(1, rows.size());
        Project p = (Project) rows.get(0)[0];
        Integer count = (Integer) rows.get(0)[1];
        assertEquals(day1Project.getId(), p.getId());
        assertEquals(1, count);
    }
}


