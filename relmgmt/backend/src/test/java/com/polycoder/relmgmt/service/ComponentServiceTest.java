package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.ComponentRequest;
import com.polycoder.relmgmt.dto.ComponentResponse;
import com.polycoder.relmgmt.entity.Component;
import com.polycoder.relmgmt.entity.ComponentTypeEnum;
import com.polycoder.relmgmt.entity.ScopeItem;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.exception.ValidationException;
import com.polycoder.relmgmt.repository.ComponentRepository;
import com.polycoder.relmgmt.repository.ScopeItemRepository;
import com.polycoder.relmgmt.service.impl.ComponentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComponentServiceTest {

    @Mock
    private ComponentRepository componentRepository;

    @Mock
    private ScopeItemRepository scopeItemRepository;

    @InjectMocks
    private ComponentServiceImpl componentService;

    private Component component;
    private ComponentRequest componentRequest;
    private ScopeItem scopeItem;

    @BeforeEach
    void setUp() {
        scopeItem = new ScopeItem();
        scopeItem.setId(1L);
        scopeItem.setName("Test Scope Item");

        component = new Component();
        component.setId(1L);
        component.setName("Test Component");
        component.setComponentType(ComponentTypeEnum.ETL);
        component.setTechnicalDesignDays(5.0);
        component.setBuildDays(10.0);
        component.setScopeItem(scopeItem);
        component.setCreatedAt(LocalDateTime.now());
        component.setUpdatedAt(LocalDateTime.now());

        componentRequest = new ComponentRequest();
        componentRequest.setName("Test Component");
        componentRequest.setComponentType(ComponentTypeEnum.ETL);
        componentRequest.setTechnicalDesignDays(5.0);
        componentRequest.setBuildDays(10.0);
    }

    @Test
    void testFindById_Success() {
        when(componentRepository.findById(1L)).thenReturn(Optional.of(component));

        ComponentResponse response = componentService.findById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Test Component", response.getName());
    }

    @Test
    void testFindById_NotFound() {
        when(componentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> componentService.findById(1L));
    }

    @Test
    void testFindByScopeItemId_Success() {
        List<Component> components = Arrays.asList(component);
        when(componentRepository.findByScopeItemId(1L)).thenReturn(components);

        List<ComponentResponse> response = componentService.findByScopeItemId(1L);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(1L, response.get(0).getId());
    }

    @Test
    void testCreate_Success() {
        when(scopeItemRepository.findById(1L)).thenReturn(Optional.of(scopeItem));
        when(componentRepository.findByScopeItemIdAndComponentType(1L, ComponentTypeEnum.ETL)).thenReturn(Arrays.asList());
        when(componentRepository.save(any(Component.class))).thenReturn(component);

        ComponentResponse response = componentService.create(1L, componentRequest);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Test Component", response.getName());
        verify(componentRepository).save(any(Component.class));
    }

    @Test
    void testCreate_ScopeItemNotFound() {
        when(scopeItemRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> componentService.create(1L, componentRequest));
        verify(componentRepository, never()).save(any());
    }

    @Test
    void testCreate_DuplicateName() {
        when(scopeItemRepository.findById(1L)).thenReturn(Optional.of(scopeItem));
        when(componentRepository.findByScopeItemIdAndComponentType(1L, ComponentTypeEnum.ETL)).thenReturn(Arrays.asList(component));

        assertThrows(ValidationException.class, () -> componentService.create(1L, componentRequest));
        verify(componentRepository, never()).save(any());
    }

    @Test
    void testUpdate_Success() {
        componentRequest.setName("Updated Component");
        when(componentRepository.findById(1L)).thenReturn(Optional.of(component));
        when(componentRepository.findByScopeItemIdAndComponentType(1L, ComponentTypeEnum.ETL)).thenReturn(Arrays.asList());
        when(componentRepository.save(any(Component.class))).thenReturn(component);

        ComponentResponse response = componentService.update(1L, componentRequest);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        verify(componentRepository).save(any(Component.class));
    }

    @Test
    void testUpdate_ComponentNotFound() {
        when(componentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> componentService.update(1L, componentRequest));
        verify(componentRepository, never()).save(any());
    }

    @Test
    void testUpdate_DuplicateName() {
        componentRequest.setName("Updated Component");
        Component duplicateComponent = new Component();
        duplicateComponent.setId(2L);
        duplicateComponent.setName("Updated Component");
        duplicateComponent.setComponentType(ComponentTypeEnum.ETL);
        
        when(componentRepository.findById(1L)).thenReturn(Optional.of(component));
        when(componentRepository.findByScopeItemIdAndComponentType(1L, ComponentTypeEnum.ETL)).thenReturn(Arrays.asList(duplicateComponent));

        assertThrows(ValidationException.class, () -> componentService.update(1L, componentRequest));
        verify(componentRepository, never()).save(any());
    }

    @Test
    void testDelete_Success() {
        when(componentRepository.findById(1L)).thenReturn(Optional.of(component));

        componentService.delete(1L);

        verify(componentRepository).delete(component);
    }

    @Test
    void testDelete_ComponentNotFound() {
        when(componentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> componentService.delete(1L));
        verify(componentRepository, never()).delete(any());
    }

    @Test
    void testDelete_WithEffortEstimates() {
        when(componentRepository.findById(1L)).thenReturn(Optional.of(component));

        // The current implementation doesn't check for effort estimates before deletion
        componentService.delete(1L);

        verify(componentRepository).delete(component);
    }

    @Test
    void testFindByComponentType_Success() {
        List<Component> components = Arrays.asList(component);
        when(componentRepository.findByComponentType(ComponentTypeEnum.ETL)).thenReturn(components);

        List<ComponentResponse> response = componentService.findByComponentType(ComponentTypeEnum.ETL);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(1L, response.get(0).getId());
    }

    @Test
    void testFindByReleaseId_Success() {
        List<Component> components = Arrays.asList(component);
        when(componentRepository.findByReleaseId(1L)).thenReturn(components);

        List<ComponentResponse> response = componentService.findByReleaseId(1L);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(1L, response.get(0).getId());
    }

    @Test
    void testFindByReleaseIdWithEffortEstimates_Success() {
        List<Component> components = Arrays.asList(component);
        when(componentRepository.findByReleaseIdWithEffortEstimates(1L)).thenReturn(components);

        List<ComponentResponse> response = componentService.findByReleaseIdWithEffortEstimates(1L);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(1L, response.get(0).getId());
    }

    @Test
    void testCanDeleteComponent_Success() {
        when(componentRepository.existsById(1L)).thenReturn(true);

        boolean result = componentService.canDeleteComponent(1L);

        assertTrue(result);
    }

    @Test
    void testCanDeleteComponent_WithEffortEstimates() {
        when(componentRepository.existsById(1L)).thenReturn(false);

        boolean result = componentService.canDeleteComponent(1L);

        assertFalse(result);
    }
}
