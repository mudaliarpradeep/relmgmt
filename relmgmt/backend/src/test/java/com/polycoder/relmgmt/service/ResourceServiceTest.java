package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.ResourceRequest;
import com.polycoder.relmgmt.dto.ResourceResponse;
import com.polycoder.relmgmt.entity.Resource;
import com.polycoder.relmgmt.entity.StatusEnum;
import com.polycoder.relmgmt.entity.EmployeeGradeEnum;
import com.polycoder.relmgmt.entity.SkillFunctionEnum;
import com.polycoder.relmgmt.entity.SkillSubFunctionEnum;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.exception.ValidationException;
import com.polycoder.relmgmt.repository.ResourceRepository;
import com.polycoder.relmgmt.service.impl.ResourceServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceServiceImpl resourceService;

    private Resource testResource;
    private ResourceRequest testResourceRequest;
    private ResourceResponse testResourceResponse;

    @BeforeEach
    void setUp() {
        testResource = new Resource();
        testResource.setId(1L);
        testResource.setName("John Doe");
        testResource.setEmployeeNumber("12345678");
        testResource.setEmail("john.doe@example.com");
        testResource.setStatus(StatusEnum.ACTIVE);
        testResource.setProjectStartDate(LocalDate.of(2024, 1, 15));
        testResource.setProjectEndDate(LocalDate.of(2024, 12, 31));
        testResource.setEmployeeGrade(EmployeeGradeEnum.LEVEL_8);
        testResource.setSkillFunction(SkillFunctionEnum.BUILD);
        testResource.setSkillSubFunction(SkillSubFunctionEnum.FORGEROCK_IDM);
        testResource.setCreatedAt(LocalDateTime.now());
        testResource.setUpdatedAt(LocalDateTime.now());

        testResourceRequest = new ResourceRequest();
        testResourceRequest.setName("John Doe");
        testResourceRequest.setEmployeeNumber("12345678");
        testResourceRequest.setEmail("john.doe@example.com");
        testResourceRequest.setStatus("Active");
        testResourceRequest.setProjectStartDate(LocalDate.of(2024, 1, 15));
        testResourceRequest.setProjectEndDate(LocalDate.of(2024, 12, 31));
        testResourceRequest.setEmployeeGrade("Level 8");
        testResourceRequest.setSkillFunction("Build");
        testResourceRequest.setSkillSubFunction("ForgeRock IDM");

        testResourceResponse = new ResourceResponse();
        testResourceResponse.setId(1L);
        testResourceResponse.setName("John Doe");
        testResourceResponse.setEmployeeNumber("12345678");
        testResourceResponse.setEmail("john.doe@example.com");
        testResourceResponse.setStatus("Active");
        testResourceResponse.setProjectStartDate(LocalDate.of(2024, 1, 15));
        testResourceResponse.setProjectEndDate(LocalDate.of(2024, 12, 31));
        testResourceResponse.setEmployeeGrade("Level 8");
        testResourceResponse.setSkillFunction("Build");
        testResourceResponse.setSkillSubFunction("ForgeRock IDM");
        testResourceResponse.setCreatedAt(LocalDateTime.now());
        testResourceResponse.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void testGetAllResourcesWithoutFilters() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Resource> resourcePage = new PageImpl<>(Arrays.asList(testResource));
        
        when(resourceRepository.findAll(pageable)).thenReturn(resourcePage);
        
        Page<ResourceResponse> result = resourceService.getAllResources(null, null, pageable);
        
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("John Doe", result.getContent().get(0).getName());
        verify(resourceRepository).findAll(pageable);
    }

    @Test
    void testGetAllResourcesWithStatusFilter() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Resource> resourcePage = new PageImpl<>(Arrays.asList(testResource));
        
        when(resourceRepository.findByStatus(StatusEnum.ACTIVE, pageable)).thenReturn(resourcePage);
        
        Page<ResourceResponse> result = resourceService.getAllResources(StatusEnum.ACTIVE, null, pageable);
        
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("John Doe", result.getContent().get(0).getName());
        verify(resourceRepository).findByStatus(StatusEnum.ACTIVE, pageable);
    }

    @Test
    void testGetAllResourcesWithSkillFunctionFilter() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Resource> resourcePage = new PageImpl<>(Arrays.asList(testResource));
        
        when(resourceRepository.findBySkillFunction(SkillFunctionEnum.BUILD, pageable)).thenReturn(resourcePage);
        
        Page<ResourceResponse> result = resourceService.getAllResources(null, SkillFunctionEnum.BUILD, pageable);
        
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("John Doe", result.getContent().get(0).getName());
        verify(resourceRepository).findBySkillFunction(SkillFunctionEnum.BUILD, pageable);
    }

    @Test
    void testGetAllResourcesWithBothFilters() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Resource> resourcePage = new PageImpl<>(Arrays.asList(testResource));
        
        when(resourceRepository.findByStatusAndSkillFunction(StatusEnum.ACTIVE, SkillFunctionEnum.BUILD, pageable))
            .thenReturn(resourcePage);
        
        Page<ResourceResponse> result = resourceService.getAllResources(StatusEnum.ACTIVE, SkillFunctionEnum.BUILD, pageable);
        
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("John Doe", result.getContent().get(0).getName());
        verify(resourceRepository).findByStatusAndSkillFunction(StatusEnum.ACTIVE, SkillFunctionEnum.BUILD, pageable);
    }

    @Test
    void testGetResourceById() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        
        ResourceResponse result = resourceService.getResourceById(1L);
        
        assertNotNull(result);
        assertEquals("John Doe", result.getName());
        assertEquals("12345678", result.getEmployeeNumber());
        verify(resourceRepository).findById(1L);
    }

    @Test
    void testGetResourceByIdNotFound() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.empty());
        
        assertThrows(ResourceNotFoundException.class, () -> resourceService.getResourceById(1L));
        verify(resourceRepository).findById(1L);
    }

    @Test
    void testCreateResource() {
        when(resourceRepository.existsByEmployeeNumber("12345678")).thenReturn(false);
        when(resourceRepository.existsByEmail("john.doe@example.com")).thenReturn(false);
        when(resourceRepository.save(any(Resource.class))).thenReturn(testResource);
        
        ResourceResponse result = resourceService.createResource(testResourceRequest);
        
        assertNotNull(result);
        assertEquals("John Doe", result.getName());
        assertEquals("12345678", result.getEmployeeNumber());
        verify(resourceRepository).existsByEmployeeNumber("12345678");
        verify(resourceRepository).existsByEmail("john.doe@example.com");
        verify(resourceRepository).save(any(Resource.class));
    }

    @Test
    void testCreateResourceWithDuplicateEmployeeNumber() {
        when(resourceRepository.existsByEmployeeNumber("12345678")).thenReturn(true);
        
        assertThrows(ValidationException.class, () -> resourceService.createResource(testResourceRequest));
        verify(resourceRepository).existsByEmployeeNumber("12345678");
        verify(resourceRepository, never()).save(any(Resource.class));
    }

    @Test
    void testCreateResourceWithDuplicateEmail() {
        when(resourceRepository.existsByEmployeeNumber("12345678")).thenReturn(false);
        when(resourceRepository.existsByEmail("john.doe@example.com")).thenReturn(true);
        
        assertThrows(ValidationException.class, () -> resourceService.createResource(testResourceRequest));
        verify(resourceRepository).existsByEmployeeNumber("12345678");
        verify(resourceRepository).existsByEmail("john.doe@example.com");
        verify(resourceRepository, never()).save(any(Resource.class));
    }

    @Test
    void testUpdateResource() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        when(resourceRepository.save(any(Resource.class))).thenReturn(testResource);
        
        ResourceResponse result = resourceService.updateResource(1L, testResourceRequest);
        
        assertNotNull(result);
        assertEquals("John Doe", result.getName());
        verify(resourceRepository).findById(1L);
        verify(resourceRepository).save(any(Resource.class));
    }

    @Test
    void testUpdateResourceNotFound() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.empty());
        
        assertThrows(ResourceNotFoundException.class, () -> resourceService.updateResource(1L, testResourceRequest));
        verify(resourceRepository).findById(1L);
        verify(resourceRepository, never()).save(any(Resource.class));
    }

    @Test
    void testDeleteResource() {
        when(resourceRepository.existsById(1L)).thenReturn(true);
        
        resourceService.deleteResource(1L);
        
        verify(resourceRepository).existsById(1L);
        verify(resourceRepository).deleteById(1L);
    }

    @Test
    void testDeleteResourceNotFound() {
        when(resourceRepository.existsById(1L)).thenReturn(false);
        
        assertThrows(ResourceNotFoundException.class, () -> resourceService.deleteResource(1L));
        verify(resourceRepository).existsById(1L);
        verify(resourceRepository, never()).deleteById(1L);
    }

    @Test
    void testFindById() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        
        Resource result = resourceService.findById(1L);
        
        assertNotNull(result);
        assertEquals("John Doe", result.getName());
        verify(resourceRepository).findById(1L);
    }

    @Test
    void testFindByIdNotFound() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.empty());
        
        assertThrows(ResourceNotFoundException.class, () -> resourceService.findById(1L));
        verify(resourceRepository).findById(1L);
    }

    @Test
    void testFindByEmployeeNumber() {
        when(resourceRepository.findByEmployeeNumber("12345678")).thenReturn(Optional.of(testResource));
        
        Resource result = resourceService.findByEmployeeNumber("12345678");
        
        assertNotNull(result);
        assertEquals("John Doe", result.getName());
        verify(resourceRepository).findByEmployeeNumber("12345678");
    }

    @Test
    void testFindByEmployeeNumberNotFound() {
        when(resourceRepository.findByEmployeeNumber("12345678")).thenReturn(Optional.empty());
        
        assertThrows(ResourceNotFoundException.class, () -> resourceService.findByEmployeeNumber("12345678"));
        verify(resourceRepository).findByEmployeeNumber("12345678");
    }

    @Test
    void testGetActiveResources() {
        when(resourceRepository.findByStatus(StatusEnum.ACTIVE)).thenReturn(Arrays.asList(testResource));
        
        List<ResourceResponse> result = resourceService.getActiveResources();
        
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).getName());
        verify(resourceRepository).findByStatus(StatusEnum.ACTIVE);
    }

    @Test
    void testGetResourcesBySkillFunctionAndStatus() {
        when(resourceRepository.findBySkillFunctionAndStatus(SkillFunctionEnum.BUILD, StatusEnum.ACTIVE))
            .thenReturn(Arrays.asList(testResource));
        
        List<ResourceResponse> result = resourceService.getResourcesBySkillFunctionAndStatus(SkillFunctionEnum.BUILD, StatusEnum.ACTIVE);
        
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).getName());
        verify(resourceRepository).findBySkillFunctionAndStatus(SkillFunctionEnum.BUILD, StatusEnum.ACTIVE);
    }

    @Test
    void testCanDeleteResource() {
        // This test will be enhanced when allocation functionality is implemented
        boolean result = resourceService.canDeleteResource(1L);
        
        assertTrue(result); // Currently returns true as allocation check is not implemented
    }

    @Test
    void testUpdateExpiredResourcesStatus() {
        // Create test resources with past end dates
        Resource expiredResource1 = new Resource();
        expiredResource1.setId(2L);
        expiredResource1.setName("Expired Resource 1");
        expiredResource1.setEmployeeNumber("11111111");
        expiredResource1.setEmail("expired1@example.com");
        expiredResource1.setStatus(StatusEnum.ACTIVE);
        expiredResource1.setProjectStartDate(LocalDate.of(2024, 1, 1));
        expiredResource1.setProjectEndDate(LocalDate.now().minusDays(1));
        expiredResource1.setEmployeeGrade(EmployeeGradeEnum.LEVEL_8);
        expiredResource1.setSkillFunction(SkillFunctionEnum.BUILD);

        Resource expiredResource2 = new Resource();
        expiredResource2.setId(3L);
        expiredResource2.setName("Expired Resource 2");
        expiredResource2.setEmployeeNumber("22222222");
        expiredResource2.setEmail("expired2@example.com");
        expiredResource2.setStatus(StatusEnum.ACTIVE);
        expiredResource2.setProjectStartDate(LocalDate.of(2024, 1, 1));
        expiredResource2.setProjectEndDate(LocalDate.now().minusDays(5));
        expiredResource2.setEmployeeGrade(EmployeeGradeEnum.LEVEL_8);
        expiredResource2.setSkillFunction(SkillFunctionEnum.BUILD);

        when(resourceRepository.findActiveResourcesWithPastEndDates(StatusEnum.ACTIVE, LocalDate.now()))
            .thenReturn(Arrays.asList(expiredResource1, expiredResource2));
        when(resourceRepository.save(any(Resource.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        int updatedCount = resourceService.updateExpiredResourcesStatus();

        assertEquals(2, updatedCount);
        verify(resourceRepository).findActiveResourcesWithPastEndDates(StatusEnum.ACTIVE, LocalDate.now());
        verify(resourceRepository, times(2)).save(any(Resource.class));
        
        // Verify that the resources were updated to inactive
        assertEquals(StatusEnum.INACTIVE, expiredResource1.getStatus());
        assertEquals(StatusEnum.INACTIVE, expiredResource2.getStatus());
    }

    @Test
    void testUpdateExpiredResourcesStatus_NoExpiredResources() {
        when(resourceRepository.findActiveResourcesWithPastEndDates(StatusEnum.ACTIVE, LocalDate.now()))
            .thenReturn(Arrays.asList());

        int updatedCount = resourceService.updateExpiredResourcesStatus();

        assertEquals(0, updatedCount);
        verify(resourceRepository).findActiveResourcesWithPastEndDates(StatusEnum.ACTIVE, LocalDate.now());
        verify(resourceRepository, never()).save(any(Resource.class));
    }
}