package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.*;
import com.polycoder.relmgmt.entity.*;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.exception.ValidationException;
import com.polycoder.relmgmt.repository.ComponentRepository;
import com.polycoder.relmgmt.repository.ReleaseRepository;
import com.polycoder.relmgmt.repository.ScopeItemRepository;
import com.polycoder.relmgmt.service.impl.ScopeServiceImpl;
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

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScopeServiceTest {

    @Mock
    private ScopeItemRepository scopeItemRepository;

    @Mock
    private ReleaseRepository releaseRepository;

    @Mock
    private ComponentRepository componentRepository;

    @InjectMocks
    private ScopeServiceImpl scopeService;

    private Release release;
    private ScopeItem scopeItem;
    private Component component;

    @BeforeEach
    void setUp() {
        release = new Release();
        release.setId(1L);
        release.setName("Test Release");
        release.setIdentifier("REL-001");
        release.setRegressionTestingDays(5.0);
        release.setSmokeTestingDays(2.0);
        release.setGoLiveDays(1.0);

        scopeItem = new ScopeItem();
        scopeItem.setId(1L);
        scopeItem.setName("Test Scope Item");
        scopeItem.setDescription("Test Description");
        scopeItem.setRelease(release);
        scopeItem.setFunctionalDesignDays(3.0);
        scopeItem.setSitDays(4.0);
        scopeItem.setUatDays(2.0);
        scopeItem.setCreatedAt(LocalDateTime.now());
        scopeItem.setUpdatedAt(LocalDateTime.now());

        component = new Component();
        component.setId(1L);
        component.setName("Test Component");
        component.setComponentType(ComponentTypeEnum.ETL);
        component.setTechnicalDesignDays(5.0);
        component.setBuildDays(10.0);
        component.setScopeItem(scopeItem);
    }

    @Test
    void testFindById_Success() {
        when(scopeItemRepository.findById(1L)).thenReturn(Optional.of(scopeItem));

        ScopeItemResponse response = scopeService.findById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Test Scope Item", response.getName());
    }

    @Test
    void testFindById_NotFound() {
        when(scopeItemRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> scopeService.findById(1L));
    }

    @Test
    void testFindByReleaseId_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<ScopeItem> page = new PageImpl<>(Arrays.asList(scopeItem));
        
        when(scopeItemRepository.findByReleaseId(1L, pageable)).thenReturn(page);

        Page<ScopeItemResponse> response = scopeService.findByReleaseId(1L, pageable);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals(1L, response.getContent().get(0).getId());
    }

    @Test
    void testCreate_Success() {
        ScopeItemRequest request = new ScopeItemRequest();
        request.setName("New Scope Item");
        request.setDescription("New Description");
        request.setFunctionalDesignDays(5.0);
        request.setSitDays(3.0);
        request.setUatDays(2.0);

        when(releaseRepository.findById(1L)).thenReturn(Optional.of(release));
        when(scopeItemRepository.save(any(ScopeItem.class))).thenReturn(scopeItem);

        ScopeItemResponse response = scopeService.create(1L, request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Test Scope Item", response.getName());
        verify(scopeItemRepository).save(any(ScopeItem.class));
    }

    @Test
    void testCreate_ReleaseNotFound() {
        ScopeItemRequest request = new ScopeItemRequest();
        request.setName("New Scope Item");

        when(releaseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> scopeService.create(1L, request));
        verify(scopeItemRepository, never()).save(any());
    }

    @Test
    void testCreate_DuplicateName() {
        ScopeItemRequest request = new ScopeItemRequest();
        request.setName("Test Scope Item");

        when(scopeItemRepository.existsByReleaseIdAndName(1L, "Test Scope Item")).thenReturn(true);

        assertThrows(ValidationException.class, () -> scopeService.create(1L, request));
        verify(scopeItemRepository, never()).save(any());
    }

    @Test
    void testCreate_WithComponents() {
        ScopeItemRequest request = new ScopeItemRequest();
        request.setName("New Scope Item");
        request.setDescription("New Description");
        request.setFunctionalDesignDays(5.0);
        request.setSitDays(3.0);
        request.setUatDays(2.0);

        ComponentRequest componentRequest = new ComponentRequest();
        componentRequest.setName("New Component");
        componentRequest.setComponentType(ComponentTypeEnum.ETL);
        componentRequest.setTechnicalDesignDays(3.0);
        componentRequest.setBuildDays(7.0);
        request.setComponents(Arrays.asList(componentRequest));

        when(releaseRepository.findById(1L)).thenReturn(Optional.of(release));
        when(scopeItemRepository.existsByReleaseIdAndName(1L, "New Scope Item")).thenReturn(false);
        when(scopeItemRepository.save(any(ScopeItem.class))).thenReturn(scopeItem);
        when(componentRepository.save(any(Component.class))).thenReturn(component);

        ScopeItemResponse response = scopeService.create(1L, request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        verify(scopeItemRepository).save(any(ScopeItem.class));
        verify(componentRepository).save(any(Component.class));
    }

    @Test
    void testUpdate_Success() {
        ScopeItemRequest request = new ScopeItemRequest();
        request.setName("Updated Scope Item");
        request.setDescription("Updated Description");
        request.setFunctionalDesignDays(6.0);
        request.setSitDays(4.0);
        request.setUatDays(3.0);

        when(scopeItemRepository.findById(1L)).thenReturn(Optional.of(scopeItem));
        when(scopeItemRepository.save(any(ScopeItem.class))).thenReturn(scopeItem);

        ScopeItemResponse response = scopeService.update(1L, request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        verify(scopeItemRepository).save(any(ScopeItem.class));
    }

    @Test
    void testUpdate_ScopeItemNotFound() {
        ScopeItemRequest request = new ScopeItemRequest();
        request.setName("Updated Scope Item");

        when(scopeItemRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> scopeService.update(1L, request));
        verify(scopeItemRepository, never()).save(any());
    }

    @Test
    void testDelete_Success() {
        when(scopeItemRepository.findById(1L)).thenReturn(Optional.of(scopeItem));
        when(componentRepository.countByScopeItemId(1L)).thenReturn(0L);

        scopeService.delete(1L);

        verify(scopeItemRepository).delete(scopeItem);
    }

    @Test
    void testDelete_ScopeItemNotFound() {
        when(scopeItemRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> scopeService.delete(1L));
        verify(scopeItemRepository, never()).delete(any());
    }

    @Test
    void testDelete_WithComponents() {
        when(componentRepository.countByScopeItemId(1L)).thenReturn(1L);

        assertThrows(ValidationException.class, () -> scopeService.delete(1L));
        verify(scopeItemRepository, never()).delete(any());
    }

    @Test
    void testFindByReleaseIdAndName_Success() {
        when(scopeItemRepository.findByReleaseIdAndName(1L, "Test Scope Item"))
                .thenReturn(Optional.of(scopeItem));

        ScopeItemResponse response = scopeService.findByReleaseIdAndName(1L, "Test Scope Item");

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Test Scope Item", response.getName());
    }

    @Test
    void testFindByReleaseIdAndName_NotFound() {
        when(scopeItemRepository.findByReleaseIdAndName(1L, "Non-existent"))
                .thenReturn(Optional.empty());

        ScopeItemResponse response = scopeService.findByReleaseIdAndName(1L, "Non-existent");

        assertNull(response);
    }

    @Test
    void testFindByReleaseIdAndNameContaining_Success() {
        List<ScopeItem> scopeItems = Arrays.asList(scopeItem);
        when(scopeItemRepository.findByReleaseIdAndNameContaining(1L, "Test"))
                .thenReturn(scopeItems);

        List<ScopeItemResponse> response = scopeService.findByReleaseIdAndNameContaining(1L, "Test");

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(1L, response.get(0).getId());
    }

    @Test
    void testFindByReleaseIdAndDescriptionContaining_Success() {
        List<ScopeItem> scopeItems = Arrays.asList(scopeItem);
        when(scopeItemRepository.findByReleaseIdAndDescriptionContaining(1L, "Test"))
                .thenReturn(scopeItems);

        List<ScopeItemResponse> response = scopeService.findByReleaseIdAndDescriptionContaining(1L, "Test");

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(1L, response.get(0).getId());
    }

    @Test
    void testFindScopeItemsWithComponents_Success() {
        List<ScopeItem> scopeItems = Arrays.asList(scopeItem);
        when(scopeItemRepository.findScopeItemsWithComponents(1L)).thenReturn(scopeItems);

        List<ScopeItemResponse> response = scopeService.findScopeItemsWithComponents(1L);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(1L, response.get(0).getId());
    }

    @Test
    void testFindScopeItemsWithoutComponents_Success() {
        List<ScopeItem> scopeItems = Arrays.asList(scopeItem);
        when(scopeItemRepository.findScopeItemsWithoutComponents(1L)).thenReturn(scopeItems);

        List<ScopeItemResponse> response = scopeService.findScopeItemsWithoutComponents(1L);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(1L, response.get(0).getId());
    }

    @Test
    void testFindScopeItemsWithComponentsCount_Success() {
        Object[] result = new Object[]{1L, "Test Scope Item", 2L};
        List<Object[]> results = Arrays.asList(new Object[][]{result});
        when(scopeItemRepository.findScopeItemsWithComponentsCount(1L)).thenReturn(results);

        List<Object[]> response = scopeService.findScopeItemsWithComponentsCount(1L);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(1L, response.get(0)[0]);
    }

    @Test
    void testGetReleaseEffortSummary_Success() {
        when(releaseRepository.existsById(1L)).thenReturn(true);
        when(releaseRepository.findById(1L)).thenReturn(Optional.of(release));
        when(scopeItemRepository.sumFunctionalDesignDaysByReleaseId(1L)).thenReturn(10.0);
        when(componentRepository.sumTechnicalDesignDaysByReleaseId(1L)).thenReturn(15.0);
        when(componentRepository.sumBuildDaysByReleaseId(1L)).thenReturn(20.0);
        when(scopeItemRepository.sumSitDaysByReleaseId(1L)).thenReturn(8.0);
        when(scopeItemRepository.sumUatDaysByReleaseId(1L)).thenReturn(6.0);

        ReleaseEffortSummaryResponse response = scopeService.getReleaseEffortSummary(1L);

        assertNotNull(response);
        assertEquals(1L, response.getReleaseId());
        assertEquals(10.0, response.getFunctionalDesignDays());
        assertEquals(15.0, response.getTechnicalDesignDays());
        assertEquals(20.0, response.getBuildDays());
        assertEquals(8.0, response.getSitDays());
        assertEquals(6.0, response.getUatDays());
        assertEquals(5.0, response.getRegressionTestingDays());
        assertEquals(2.0, response.getSmokeTestingDays());
        assertEquals(1.0, response.getGoLiveDays());
    }

    @Test
    void testCalculateTotalFunctionalDesignDays_Success() {
        when(scopeItemRepository.sumFunctionalDesignDaysByReleaseId(1L)).thenReturn(10.0);

        Double result = scopeService.calculateTotalFunctionalDesignDays(1L);

        assertEquals(10.0, result);
    }

    @Test
    void testCalculateTotalTechnicalDesignDays_Success() {
        when(componentRepository.sumTechnicalDesignDaysByReleaseId(1L)).thenReturn(15.0);

        Double result = scopeService.calculateTotalTechnicalDesignDays(1L);

        assertEquals(15.0, result);
    }

    @Test
    void testCalculateTotalBuildDays_Success() {
        when(componentRepository.sumBuildDaysByReleaseId(1L)).thenReturn(20.0);

        Double result = scopeService.calculateTotalBuildDays(1L);

        assertEquals(20.0, result);
    }

    @Test
    void testCalculateTotalSitDays_Success() {
        when(scopeItemRepository.sumSitDaysByReleaseId(1L)).thenReturn(8.0);

        Double result = scopeService.calculateTotalSitDays(1L);

        assertEquals(8.0, result);
    }

    @Test
    void testCalculateTotalUatDays_Success() {
        when(scopeItemRepository.sumUatDaysByReleaseId(1L)).thenReturn(6.0);

        Double result = scopeService.calculateTotalUatDays(1L);

        assertEquals(6.0, result);
    }

    @Test
    void testValidateScopeItem_Success() {
        ScopeItemRequest request = new ScopeItemRequest();
        request.setName("Test Scope Item");
        request.setFunctionalDesignDays(5.0);
        request.setSitDays(3.0);
        request.setUatDays(2.0);

        when(scopeItemRepository.existsByReleaseIdAndName(1L, "Test Scope Item")).thenReturn(false);

        assertDoesNotThrow(() -> scopeService.validateScopeItem(request, 1L));
    }

    @Test
    void testValidateScopeItem_DuplicateName() {
        ScopeItemRequest request = new ScopeItemRequest();
        request.setName("Test Scope Item");

        when(scopeItemRepository.existsByReleaseIdAndName(1L, "Test Scope Item")).thenReturn(true);

        assertThrows(ValidationException.class, () -> scopeService.validateScopeItem(request, 1L));
    }

    @Test
    void testValidateScopeItem_InvalidEffort() {
        ScopeItemRequest request = new ScopeItemRequest();
        request.setName("Test Scope Item");
        request.setFunctionalDesignDays(0.5); // Below minimum

        when(scopeItemRepository.existsByReleaseIdAndName(1L, "Test Scope Item")).thenReturn(false);

        assertThrows(ValidationException.class, () -> scopeService.validateScopeItem(request, 1L));
    }

    @Test
    void testCanDeleteScopeItem_Success() {
        when(componentRepository.countByScopeItemId(1L)).thenReturn(0L);

        boolean result = scopeService.canDeleteScopeItem(1L);

        assertTrue(result);
    }

    @Test
    void testCanDeleteScopeItem_WithComponents() {
        when(componentRepository.countByScopeItemId(1L)).thenReturn(1L);

        boolean result = scopeService.canDeleteScopeItem(1L);

        assertFalse(result);
    }
}
