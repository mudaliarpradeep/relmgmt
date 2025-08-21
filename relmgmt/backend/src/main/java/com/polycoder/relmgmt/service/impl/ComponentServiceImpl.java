package com.polycoder.relmgmt.service.impl;

import com.polycoder.relmgmt.dto.ComponentRequest;
import com.polycoder.relmgmt.dto.ComponentResponse;
import com.polycoder.relmgmt.dto.EffortEstimateResponse;
import com.polycoder.relmgmt.entity.Component;
import com.polycoder.relmgmt.entity.ComponentTypeEnum;
import com.polycoder.relmgmt.entity.ScopeItem;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.exception.ValidationException;
import com.polycoder.relmgmt.repository.ComponentRepository;
import com.polycoder.relmgmt.repository.ScopeItemRepository;
import com.polycoder.relmgmt.service.ComponentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of ComponentService interface.
 */
@Service
@Transactional
public class ComponentServiceImpl implements ComponentService {
    
    private final ComponentRepository componentRepository;
    private final ScopeItemRepository scopeItemRepository;
    
    @Autowired
    public ComponentServiceImpl(ComponentRepository componentRepository, ScopeItemRepository scopeItemRepository) {
        this.componentRepository = componentRepository;
        this.scopeItemRepository = scopeItemRepository;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ComponentResponse> findByScopeItemId(Long scopeItemId) {
        List<Component> components = componentRepository.findByScopeItemId(scopeItemId);
        return components.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public ComponentResponse findById(Long id) {
        Component component = componentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Component not found with id: " + id));
        return convertToResponse(component);
    }
    
    @Override
    public ComponentResponse create(Long scopeItemId, ComponentRequest request) {
        // Validate scope item exists
        ScopeItem scopeItem = scopeItemRepository.findById(scopeItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Scope item not found with id: " + scopeItemId));
        
        // Validate component name uniqueness within scope item
        if (componentRepository.findByScopeItemIdAndComponentType(scopeItemId, request.getComponentType())
                .stream().anyMatch(c -> c.getName().equals(request.getName()))) {
            throw new ValidationException("Component with name '" + request.getName() + "' already exists in this scope item");
        }
        
        // Create component
        Component component = new Component();
        component.setName(request.getName());
        component.setComponentType(request.getComponentType());
        component.setTechnicalDesignDays(request.getTechnicalDesignDays());
        component.setBuildDays(request.getBuildDays());
        component.setScopeItem(scopeItem);
        
        Component savedComponent = componentRepository.save(component);
        return convertToResponse(savedComponent);
    }
    
    @Override
    public ComponentResponse update(Long id, ComponentRequest request) {
        Component component = componentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Component not found with id: " + id));
        
        // Validate component name uniqueness within scope item (excluding current component)
        Long scopeItemId = component.getScopeItem().getId();
        if (componentRepository.findByScopeItemIdAndComponentType(scopeItemId, request.getComponentType())
                .stream()
                .filter(c -> !c.getId().equals(id))
                .anyMatch(c -> c.getName().equals(request.getName()))) {
            throw new ValidationException("Component with name '" + request.getName() + "' already exists in this scope item");
        }
        
        // Update component
        component.setName(request.getName());
        component.setComponentType(request.getComponentType());
        component.setTechnicalDesignDays(request.getTechnicalDesignDays());
        component.setBuildDays(request.getBuildDays());
        
        Component updatedComponent = componentRepository.save(component);
        return convertToResponse(updatedComponent);
    }
    
    @Override
    public void delete(Long id) {
        Component component = componentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Component not found with id: " + id));
        
        componentRepository.delete(component);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean canDeleteComponent(Long id) {
        return componentRepository.existsById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ComponentResponse> findByComponentType(ComponentTypeEnum componentType) {
        List<Component> components = componentRepository.findByComponentType(componentType);
        return components.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ComponentResponse> findByScopeItemIdAndComponentType(Long scopeItemId, ComponentTypeEnum componentType) {
        List<Component> components = componentRepository.findByScopeItemIdAndComponentType(scopeItemId, componentType);
        return components.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countByScopeItemId(Long scopeItemId) {
        return componentRepository.countByScopeItemId(scopeItemId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ComponentResponse> findByReleaseId(Long releaseId) {
        List<Component> components = componentRepository.findByReleaseId(releaseId);
        return components.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ComponentResponse> findByReleaseIdAndComponentType(Long releaseId, ComponentTypeEnum componentType) {
        List<Component> components = componentRepository.findByReleaseIdAndComponentType(releaseId, componentType);
        return components.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComponentResponse> findByReleaseIdWithEffortEstimates(Long releaseId) {
        List<Component> components = componentRepository.findByReleaseIdWithEffortEstimates(releaseId);
        return components.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert Component entity to ComponentResponse DTO.
     * 
     * @param component the component entity
     * @return component response
     */
    private ComponentResponse convertToResponse(Component component) {
        return new ComponentResponse(component);
    }
}
