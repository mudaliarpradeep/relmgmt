package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.Resource;
import com.polycoder.relmgmt.entity.StatusEnum;
import com.polycoder.relmgmt.entity.EmployeeGradeEnum;
import com.polycoder.relmgmt.entity.SkillFunctionEnum;
import com.polycoder.relmgmt.entity.SkillSubFunctionEnum;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
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
class ResourceRepositoryTest {

    @Autowired
    private ResourceRepository resourceRepository;

    private Resource testResource;
    private Resource testResource2;

    @BeforeEach
    void setUp() {
        resourceRepository.deleteAll();
        
        testResource = new Resource();
        testResource.setName("John Doe");
        testResource.setEmployeeNumber("12345678");
        testResource.setEmail("john.doe@example.com");
        testResource.setStatus(StatusEnum.ACTIVE);
        testResource.setProjectStartDate(LocalDate.of(2024, 1, 15));
        testResource.setProjectEndDate(LocalDate.of(2024, 12, 31));
        testResource.setEmployeeGrade(EmployeeGradeEnum.LEVEL_8);
        testResource.setSkillFunction(SkillFunctionEnum.BUILD);
        testResource.setSkillSubFunction(SkillSubFunctionEnum.FORGEROCK_IDM);

        testResource2 = new Resource();
        testResource2.setName("Jane Smith");
        testResource2.setEmployeeNumber("87654321");
        testResource2.setEmail("jane.smith@example.com");
        testResource2.setStatus(StatusEnum.INACTIVE);
        testResource2.setProjectStartDate(LocalDate.of(2024, 2, 1));
        testResource2.setProjectEndDate(LocalDate.of(2024, 11, 30));
        testResource2.setEmployeeGrade(EmployeeGradeEnum.LEVEL_9);
        testResource2.setSkillFunction(SkillFunctionEnum.TEST);
        testResource2.setSkillSubFunction(SkillSubFunctionEnum.MANUAL);
    }

    @Test
    void testSaveResource() {
        Resource savedResource = resourceRepository.save(testResource);
        
        assertNotNull(savedResource.getId());
        assertEquals("John Doe", savedResource.getName());
        assertEquals("12345678", savedResource.getEmployeeNumber());
        assertEquals("john.doe@example.com", savedResource.getEmail());
        assertEquals(StatusEnum.ACTIVE, savedResource.getStatus());
        assertEquals(LocalDate.of(2024, 1, 15), savedResource.getProjectStartDate());
        assertEquals(LocalDate.of(2024, 12, 31), savedResource.getProjectEndDate());
        assertEquals(EmployeeGradeEnum.LEVEL_8, savedResource.getEmployeeGrade());
        assertEquals(SkillFunctionEnum.BUILD, savedResource.getSkillFunction());
        assertEquals(SkillSubFunctionEnum.FORGEROCK_IDM, savedResource.getSkillSubFunction());
        assertNotNull(savedResource.getCreatedAt());
        assertNotNull(savedResource.getUpdatedAt());
    }

    @Test
    void testFindByEmployeeNumber() {
        resourceRepository.save(testResource);
        
        Optional<Resource> foundResource = resourceRepository.findByEmployeeNumber("12345678");
        
        assertTrue(foundResource.isPresent());
        assertEquals("John Doe", foundResource.get().getName());
        assertEquals("john.doe@example.com", foundResource.get().getEmail());
    }

    @Test
    void testFindByEmployeeNumberNotFound() {
        Optional<Resource> foundResource = resourceRepository.findByEmployeeNumber("99999999");
        
        assertFalse(foundResource.isPresent());
    }

    @Test
    void testFindByEmail() {
        resourceRepository.save(testResource);
        
        Optional<Resource> foundResource = resourceRepository.findByEmail("john.doe@example.com");
        
        assertTrue(foundResource.isPresent());
        assertEquals("John Doe", foundResource.get().getName());
        assertEquals("12345678", foundResource.get().getEmployeeNumber());
    }

    @Test
    void testFindByEmailNotFound() {
        Optional<Resource> foundResource = resourceRepository.findByEmail("nonexistent@example.com");
        
        assertFalse(foundResource.isPresent());
    }

    @Test
    void testExistsByEmployeeNumber() {
        resourceRepository.save(testResource);
        
        assertTrue(resourceRepository.existsByEmployeeNumber("12345678"));
        assertFalse(resourceRepository.existsByEmployeeNumber("99999999"));
    }

    @Test
    void testExistsByEmail() {
        resourceRepository.save(testResource);
        
        assertTrue(resourceRepository.existsByEmail("john.doe@example.com"));
        assertFalse(resourceRepository.existsByEmail("nonexistent@example.com"));
    }

    @Test
    void testFindById() {
        Resource savedResource = resourceRepository.save(testResource);
        
        Optional<Resource> foundResource = resourceRepository.findById(savedResource.getId());
        
        assertTrue(foundResource.isPresent());
        assertEquals(savedResource.getId(), foundResource.get().getId());
        assertEquals("John Doe", foundResource.get().getName());
    }

    @Test
    void testUpdateResource() {
        Resource savedResource = resourceRepository.save(testResource);
        
        // Wait a bit to ensure timestamp difference
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        savedResource.setEmail("updated@example.com");
        savedResource.setStatus(StatusEnum.INACTIVE);
        Resource updatedResource = resourceRepository.save(savedResource);
        
        assertEquals("updated@example.com", updatedResource.getEmail());
        assertEquals(StatusEnum.INACTIVE, updatedResource.getStatus());
        assertEquals(savedResource.getId(), updatedResource.getId());
        assertTrue(updatedResource.getUpdatedAt().isAfter(updatedResource.getCreatedAt()) || 
                  updatedResource.getUpdatedAt().equals(updatedResource.getCreatedAt()));
    }

    @Test
    void testDeleteResource() {
        Resource savedResource = resourceRepository.save(testResource);
        
        resourceRepository.deleteById(savedResource.getId());
        
        assertFalse(resourceRepository.existsById(savedResource.getId()));
        assertFalse(resourceRepository.existsByEmployeeNumber("12345678"));
    }

    @Test
    void testUniqueEmployeeNumberConstraint() {
        resourceRepository.save(testResource);
        
        Resource duplicateResource = new Resource();
        duplicateResource.setName("Different Name");
        duplicateResource.setEmployeeNumber("12345678"); // Same employee number
        duplicateResource.setEmail("different@example.com");
        duplicateResource.setStatus(StatusEnum.ACTIVE);
        duplicateResource.setProjectStartDate(LocalDate.of(2024, 3, 1));
        duplicateResource.setEmployeeGrade(EmployeeGradeEnum.LEVEL_7);
        duplicateResource.setSkillFunction(SkillFunctionEnum.TEST);
        
        // This should throw an exception due to unique constraint
        assertThrows(Exception.class, () -> resourceRepository.save(duplicateResource));
    }

    @Test
    void testFindByStatus() {
        resourceRepository.save(testResource);
        resourceRepository.save(testResource2);
        
        Pageable pageable = PageRequest.of(0, 10);
        Page<Resource> activeResources = resourceRepository.findByStatus(StatusEnum.ACTIVE, pageable);
        Page<Resource> inactiveResources = resourceRepository.findByStatus(StatusEnum.INACTIVE, pageable);
        
        assertEquals(1, activeResources.getTotalElements());
        assertEquals(1, inactiveResources.getTotalElements());
        assertEquals("John Doe", activeResources.getContent().get(0).getName());
        assertEquals("Jane Smith", inactiveResources.getContent().get(0).getName());
    }

    @Test
    void testFindBySkillFunction() {
        resourceRepository.save(testResource);
        resourceRepository.save(testResource2);
        
        Pageable pageable = PageRequest.of(0, 10);
        Page<Resource> buildResources = resourceRepository.findBySkillFunction(SkillFunctionEnum.BUILD, pageable);
        Page<Resource> testResources = resourceRepository.findBySkillFunction(SkillFunctionEnum.TEST, pageable);
        
        assertEquals(1, buildResources.getTotalElements());
        assertEquals(1, testResources.getTotalElements());
        assertEquals("John Doe", buildResources.getContent().get(0).getName());
        assertEquals("Jane Smith", testResources.getContent().get(0).getName());
    }

    @Test
    void testFindByStatusAndSkillFunction() {
        resourceRepository.save(testResource);
        resourceRepository.save(testResource2);
        
        Pageable pageable = PageRequest.of(0, 10);
        Page<Resource> activeBuildResources = resourceRepository.findByStatusAndSkillFunction(
            StatusEnum.ACTIVE, SkillFunctionEnum.BUILD, pageable);
        Page<Resource> inactiveTestResources = resourceRepository.findByStatusAndSkillFunction(
            StatusEnum.INACTIVE, SkillFunctionEnum.TEST, pageable);
        
        assertEquals(1, activeBuildResources.getTotalElements());
        assertEquals(1, inactiveTestResources.getTotalElements());
        assertEquals("John Doe", activeBuildResources.getContent().get(0).getName());
        assertEquals("Jane Smith", inactiveTestResources.getContent().get(0).getName());
    }

    @Test
    void testFindByStatusList() {
        resourceRepository.save(testResource);
        resourceRepository.save(testResource2);
        
        List<Resource> activeResources = resourceRepository.findByStatus(StatusEnum.ACTIVE);
        List<Resource> inactiveResources = resourceRepository.findByStatus(StatusEnum.INACTIVE);
        
        assertEquals(1, activeResources.size());
        assertEquals(1, inactiveResources.size());
        assertEquals("John Doe", activeResources.get(0).getName());
        assertEquals("Jane Smith", inactiveResources.get(0).getName());
    }

    @Test
    void testFindBySkillFunctionAndStatus() {
        resourceRepository.save(testResource);
        resourceRepository.save(testResource2);
        
        List<Resource> activeBuildResources = resourceRepository.findBySkillFunctionAndStatus(
            SkillFunctionEnum.BUILD, StatusEnum.ACTIVE);
        List<Resource> inactiveTestResources = resourceRepository.findBySkillFunctionAndStatus(
            SkillFunctionEnum.TEST, StatusEnum.INACTIVE);
        
        assertEquals(1, activeBuildResources.size());
        assertEquals(1, inactiveTestResources.size());
        assertEquals("John Doe", activeBuildResources.get(0).getName());
        assertEquals("Jane Smith", inactiveTestResources.get(0).getName());
    }

    /*
    @Test
    void testFindResourcesAllocatedToActiveReleases() {
        Resource savedResource = resourceRepository.save(testResource);
        
        // This test will be enhanced when allocation entity is implemented
        // For now, we test that the query doesn't fail
        List<Long> allocatedResources = resourceRepository.findResourcesAllocatedToActiveReleases(
            savedResource.getId(), LocalDate.now());
        
        assertNotNull(allocatedResources);
        assertTrue(allocatedResources.isEmpty()); // No allocations exist yet
    }
    */

    @Test
    void testFindActiveResourcesWithPastEndDates() {
        // Create a resource with past end date
        Resource expiredResource = new Resource();
        expiredResource.setName("Expired Resource");
        expiredResource.setEmployeeNumber("11111111");
        expiredResource.setEmail("expired@example.com");
        expiredResource.setStatus(StatusEnum.ACTIVE);
        expiredResource.setProjectStartDate(LocalDate.of(2024, 1, 1));
        expiredResource.setProjectEndDate(LocalDate.now().minusDays(1)); // Past date
        expiredResource.setEmployeeGrade(EmployeeGradeEnum.LEVEL_8);
        expiredResource.setSkillFunction(SkillFunctionEnum.BUILD);
        
        // Create a resource with future end date
        Resource activeResource = new Resource();
        activeResource.setName("Active Resource");
        activeResource.setEmployeeNumber("22222222");
        activeResource.setEmail("active@example.com");
        activeResource.setStatus(StatusEnum.ACTIVE);
        activeResource.setProjectStartDate(LocalDate.of(2024, 1, 1));
        activeResource.setProjectEndDate(LocalDate.now().plusDays(30)); // Future date
        activeResource.setEmployeeGrade(EmployeeGradeEnum.LEVEL_8);
        activeResource.setSkillFunction(SkillFunctionEnum.BUILD);
        
        // Create a resource with no end date
        Resource noEndDateResource = new Resource();
        noEndDateResource.setName("No End Date Resource");
        noEndDateResource.setEmployeeNumber("33333333");
        noEndDateResource.setEmail("noenddate@example.com");
        noEndDateResource.setStatus(StatusEnum.ACTIVE);
        noEndDateResource.setProjectStartDate(LocalDate.of(2024, 1, 1));
        noEndDateResource.setProjectEndDate(null); // No end date
        noEndDateResource.setEmployeeGrade(EmployeeGradeEnum.LEVEL_8);
        noEndDateResource.setSkillFunction(SkillFunctionEnum.BUILD);
        
        resourceRepository.save(expiredResource);
        resourceRepository.save(activeResource);
        resourceRepository.save(noEndDateResource);
        
        // Test finding expired resources
        List<Resource> expiredResources = resourceRepository.findActiveResourcesWithPastEndDates(
            StatusEnum.ACTIVE, LocalDate.now());
        
        assertEquals(1, expiredResources.size());
        assertEquals("Expired Resource", expiredResources.get(0).getName());
        assertTrue(expiredResources.get(0).getProjectEndDate().isBefore(LocalDate.now()));
    }
}