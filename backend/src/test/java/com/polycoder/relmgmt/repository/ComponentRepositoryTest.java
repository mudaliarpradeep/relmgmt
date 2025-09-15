package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.Component;
import com.polycoder.relmgmt.entity.ComponentTypeEnum;
import com.polycoder.relmgmt.entity.Release;
import com.polycoder.relmgmt.entity.ReleaseStatusEnum;
import com.polycoder.relmgmt.entity.ScopeItem;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class ComponentRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ComponentRepository componentRepository;

    private Release release;
    private ScopeItem scopeItem;
    private Component component1;
    private Component component2;

    @BeforeEach
    void setUp() {
        // Create a release for testing
        release = new Release();
        release.setName("Test Release");
        release.setIdentifier("REL-001");
        release.setStatus(ReleaseStatusEnum.PLANNING);
        entityManager.persistAndFlush(release);

        // Create a scope item for testing
        scopeItem = new ScopeItem();
        scopeItem.setName("Test Scope Item");
        scopeItem.setDescription("Test Description");
        scopeItem.setRelease(release);
        scopeItem.setFunctionalDesignDays(5.0);
        scopeItem.setSitDays(3.0);
        scopeItem.setUatDays(2.0);
        entityManager.persistAndFlush(scopeItem);

        // Create test components
        component1 = new Component();
        component1.setName("Test Component 1");
        component1.setComponentType(ComponentTypeEnum.ETL);
        component1.setTechnicalDesignDays(5.0);
        component1.setBuildDays(10.0);
        component1.setScopeItem(scopeItem);
        entityManager.persistAndFlush(component1);

        component2 = new Component();
        component2.setName("Test Component 2");
        component2.setComponentType(ComponentTypeEnum.FORGEROCK_IGA);
        component2.setTechnicalDesignDays(3.0);
        component2.setBuildDays(7.0);
        component2.setScopeItem(scopeItem);
        entityManager.persistAndFlush(component2);

        entityManager.clear();
    }

    @Test
    void testFindByScopeItemId_Success() {
        List<Component> components = componentRepository.findByScopeItemId(scopeItem.getId());

        assertNotNull(components);
        assertEquals(2, components.size());
        assertTrue(components.stream().anyMatch(c -> c.getName().equals("Test Component 1")));
        assertTrue(components.stream().anyMatch(c -> c.getName().equals("Test Component 2")));
    }

    @Test
    void testFindByScopeItemId_EmptyResult() {
        List<Component> components = componentRepository.findByScopeItemId(999L);

        assertNotNull(components);
        assertTrue(components.isEmpty());
    }

    @Test
    void testFindByComponentType_Success() {
        List<Component> components = componentRepository.findByComponentType(ComponentTypeEnum.ETL);

        assertNotNull(components);
        assertEquals(1, components.size());
        assertEquals("Test Component 1", components.get(0).getName());
        assertEquals(ComponentTypeEnum.ETL, components.get(0).getComponentType());
    }

    @Test
    void testFindByComponentType_EmptyResult() {
        List<Component> components = componentRepository.findByComponentType(ComponentTypeEnum.SAILPOINT);

        assertNotNull(components);
        assertTrue(components.isEmpty());
    }

    @Test
    void testFindByScopeItemIdAndComponentType_Success() {
        List<Component> components = componentRepository.findByScopeItemIdAndComponentType(
                scopeItem.getId(), ComponentTypeEnum.ETL);

        assertNotNull(components);
        assertEquals(1, components.size());
        assertEquals("Test Component 1", components.get(0).getName());
        assertEquals(ComponentTypeEnum.ETL, components.get(0).getComponentType());
    }

    @Test
    void testFindByScopeItemIdAndComponentType_EmptyResult() {
        List<Component> components = componentRepository.findByScopeItemIdAndComponentType(
                scopeItem.getId(), ComponentTypeEnum.SAILPOINT);

        assertNotNull(components);
        assertTrue(components.isEmpty());
    }

    @Test
    void testCountByScopeItemId_Success() {
        long count = componentRepository.countByScopeItemId(scopeItem.getId());

        assertEquals(2, count);
    }

    @Test
    void testCountByScopeItemId_Zero() {
        long count = componentRepository.countByScopeItemId(999L);

        assertEquals(0, count);
    }

    @Test
    void testFindByScopeItemIdWithEffortEstimates_Success() {
        List<Component> components = componentRepository.findByScopeItemIdWithEffortEstimates(scopeItem.getId());

        assertNotNull(components);
        assertEquals(2, components.size());
        assertTrue(components.stream().anyMatch(c -> c.getName().equals("Test Component 1")));
        assertTrue(components.stream().anyMatch(c -> c.getName().equals("Test Component 2")));
    }

    @Test
    void testFindByReleaseId_Success() {
        List<Component> components = componentRepository.findByReleaseId(scopeItem.getRelease().getId());

        assertNotNull(components);
        assertEquals(2, components.size());
        assertTrue(components.stream().anyMatch(c -> c.getName().equals("Test Component 1")));
        assertTrue(components.stream().anyMatch(c -> c.getName().equals("Test Component 2")));
    }

    @Test
    void testFindByReleaseId_EmptyResult() {
        List<Component> components = componentRepository.findByReleaseId(999L);

        assertNotNull(components);
        assertTrue(components.isEmpty());
    }

    @Test
    void testFindByReleaseIdAndComponentType_Success() {
        List<Component> components = componentRepository.findByReleaseIdAndComponentType(
                scopeItem.getRelease().getId(), ComponentTypeEnum.ETL);

        assertNotNull(components);
        assertEquals(1, components.size());
        assertEquals("Test Component 1", components.get(0).getName());
        assertEquals(ComponentTypeEnum.ETL, components.get(0).getComponentType());
    }

    @Test
    void testFindByReleaseIdAndComponentType_EmptyResult() {
        List<Component> components = componentRepository.findByReleaseIdAndComponentType(
                scopeItem.getRelease().getId(), ComponentTypeEnum.SAILPOINT);

        assertNotNull(components);
        assertTrue(components.isEmpty());
    }

    @Test
    void testSumTechnicalDesignDaysByReleaseId_Success() {
        Double sum = componentRepository.sumTechnicalDesignDaysByReleaseId(scopeItem.getRelease().getId());

        assertNotNull(sum);
        assertEquals(8.0, sum); // 5.0 + 3.0
    }

    @Test
    void testSumTechnicalDesignDaysByReleaseId_Zero() {
        Double sum = componentRepository.sumTechnicalDesignDaysByReleaseId(999L);

        assertNotNull(sum);
        assertEquals(0.0, sum);
    }

    @Test
    void testSumBuildDaysByReleaseId_Success() {
        Double sum = componentRepository.sumBuildDaysByReleaseId(scopeItem.getRelease().getId());

        assertNotNull(sum);
        assertEquals(17.0, sum); // 10.0 + 7.0
    }

    @Test
    void testSumBuildDaysByReleaseId_Zero() {
        Double sum = componentRepository.sumBuildDaysByReleaseId(999L);

        assertNotNull(sum);
        assertEquals(0.0, sum);
    }

    @Test
    void testSaveAndFindById_Success() {
        Component newComponent = new Component();
        newComponent.setName("New Test Component");
        newComponent.setComponentType(ComponentTypeEnum.FORGEROCK_UI);
        newComponent.setTechnicalDesignDays(4.0);
        newComponent.setBuildDays(8.0);
        newComponent.setScopeItem(scopeItem);

        Component savedComponent = componentRepository.save(newComponent);
        entityManager.flush();

        Component foundComponent = componentRepository.findById(savedComponent.getId()).orElse(null);

        assertNotNull(foundComponent);
        assertEquals("New Test Component", foundComponent.getName());
        assertEquals(ComponentTypeEnum.FORGEROCK_UI, foundComponent.getComponentType());
        assertEquals(4.0, foundComponent.getTechnicalDesignDays());
        assertEquals(8.0, foundComponent.getBuildDays());
        assertEquals(scopeItem.getId(), foundComponent.getScopeItem().getId());
    }

    @Test
    void testUpdateComponent_Success() {
        component1.setName("Updated Component Name");
        component1.setTechnicalDesignDays(6.0);

        Component updatedComponent = componentRepository.save(component1);
        entityManager.flush();

        Component foundComponent = componentRepository.findById(updatedComponent.getId()).orElse(null);

        assertNotNull(foundComponent);
        assertEquals("Updated Component Name", foundComponent.getName());
        assertEquals(6.0, foundComponent.getTechnicalDesignDays());
    }

    @Test
    void testDeleteComponent_Success() {
        componentRepository.delete(component1);
        entityManager.flush();

        List<Component> remainingComponents = componentRepository.findByScopeItemId(scopeItem.getId());

        assertEquals(1, remainingComponents.size());
        assertEquals("Test Component 2", remainingComponents.get(0).getName());
    }

    @Test
    void testFindAll_Success() {
        List<Component> allComponents = componentRepository.findAll();

        assertNotNull(allComponents);
        assertTrue(allComponents.size() >= 2);
        assertTrue(allComponents.stream().anyMatch(c -> c.getName().equals("Test Component 1")));
        assertTrue(allComponents.stream().anyMatch(c -> c.getName().equals("Test Component 2")));
    }
}
