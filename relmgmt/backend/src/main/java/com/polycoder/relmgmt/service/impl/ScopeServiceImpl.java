package com.polycoder.relmgmt.service.impl;

import com.polycoder.relmgmt.dto.*;
import com.polycoder.relmgmt.entity.*;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.exception.ValidationException;
import com.polycoder.relmgmt.repository.ComponentRepository;
import com.polycoder.relmgmt.repository.ReleaseRepository;
import com.polycoder.relmgmt.repository.ScopeItemRepository;
import com.polycoder.relmgmt.service.ScopeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ScopeServiceImpl implements ScopeService {

    @Autowired
    private ScopeItemRepository scopeItemRepository;

    @Autowired
    private ComponentRepository componentRepository;

    @Autowired
    private ReleaseRepository releaseRepository;

    @Override
    public List<ScopeItemResponse> findByReleaseId(Long releaseId) {
        return scopeItemRepository.findByReleaseId(releaseId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ScopeItemResponse> findByReleaseId(Long releaseId, Pageable pageable) {
        return scopeItemRepository.findByReleaseId(releaseId, pageable)
                .map(this::convertToResponse);
    }

    @Override
    public ScopeItemResponse findById(Long id) {
        ScopeItem scopeItem = scopeItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scope item not found with id: " + id));
        return convertToResponse(scopeItem);
    }

    @Override
    public List<ScopeItemResponse> findByReleaseIdAndNameContaining(Long releaseId, String name) {
        return scopeItemRepository.findByReleaseIdAndNameContaining(releaseId, name)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ScopeItemResponse> findByReleaseIdAndDescriptionContaining(Long releaseId, String description) {
        return scopeItemRepository.findByReleaseIdAndDescriptionContaining(releaseId, description)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ScopeItemResponse create(Long releaseId, ScopeItemRequest request) {
        validateScopeItem(request, releaseId);
        
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Release not found with id: " + releaseId));

        ScopeItem scopeItem = new ScopeItem();
        scopeItem.setName(request.getName());
        scopeItem.setDescription(request.getDescription());
        scopeItem.setFunctionalDesignDays(request.getFunctionalDesignDays());
        scopeItem.setSitDays(request.getSitDays());
        scopeItem.setUatDays(request.getUatDays());
        scopeItem.setRelease(release);

        ScopeItem savedScopeItem = scopeItemRepository.save(scopeItem);

        // Create components if provided
        if (request.getComponents() != null && !request.getComponents().isEmpty()) {
            for (ComponentRequest componentRequest : request.getComponents()) {
                Component component = new Component();
                component.setName(componentRequest.getName());
                component.setComponentType(componentRequest.getComponentType());
                component.setTechnicalDesignDays(componentRequest.getTechnicalDesignDays());
                component.setBuildDays(componentRequest.getBuildDays());
                component.setScopeItem(savedScopeItem);
                componentRepository.save(component);
            }
        }

        return convertToResponse(savedScopeItem);
    }

    @Override
    public ScopeItemResponse update(Long id, ScopeItemRequest request) {
        ScopeItem scopeItem = scopeItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scope item not found with id: " + id));

        validateScopeItem(request, scopeItem.getRelease().getId());

        scopeItem.setName(request.getName());
        scopeItem.setDescription(request.getDescription());
        scopeItem.setFunctionalDesignDays(request.getFunctionalDesignDays());
        scopeItem.setSitDays(request.getSitDays());
        scopeItem.setUatDays(request.getUatDays());

        ScopeItem updatedScopeItem = scopeItemRepository.save(scopeItem);
        return convertToResponse(updatedScopeItem);
    }

    @Override
    public void delete(Long id) {
        if (!canDeleteScopeItem(id)) {
            throw new ValidationException("Cannot delete scope item with existing components");
        }
        
        ScopeItem scopeItem = scopeItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scope item not found with id: " + id));
        
        scopeItemRepository.delete(scopeItem);
    }

    @Override
    public boolean existsByReleaseIdAndName(Long releaseId, String name) {
        return scopeItemRepository.existsByReleaseIdAndName(releaseId, name);
    }

    @Override
    public ScopeItemResponse findByReleaseIdAndName(Long releaseId, String name) {
        return scopeItemRepository.findByReleaseIdAndName(releaseId, name)
                .map(this::convertToResponse)
                .orElse(null);
    }

    @Override
    public long countByReleaseId(Long releaseId) {
        return scopeItemRepository.countByReleaseId(releaseId);
    }

    @Override
    public List<ScopeItemResponse> findScopeItemsWithComponents(Long releaseId) {
        return scopeItemRepository.findScopeItemsWithComponents(releaseId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ScopeItemResponse> findScopeItemsWithoutComponents(Long releaseId) {
        return scopeItemRepository.findScopeItemsWithoutComponents(releaseId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<Object[]> findScopeItemsWithComponentsCount(Long releaseId) {
        return scopeItemRepository.findScopeItemsWithComponentsCount(releaseId);
    }

    @Override
    public List<ScopeItemWithComponentsResponse> findByReleaseIdWithComponents(Long releaseId) {
        return scopeItemRepository.findByReleaseIdWithComponents(releaseId)
                .stream()
                .map(this::convertToResponseWithComponents)
                .collect(Collectors.toList());
    }

    @Override
    public boolean canDeleteScopeItem(Long id) {
        return componentRepository.countByScopeItemId(id) == 0;
    }

    @Override
    public ReleaseEffortSummaryResponse getReleaseEffortSummary(Long releaseId) {
        if (!releaseRepository.existsById(releaseId)) {
            throw new ResourceNotFoundException("Release not found with id: " + releaseId);
        }

        Double totalFunctionalDesignDays = calculateTotalFunctionalDesignDays(releaseId);
        Double totalTechnicalDesignDays = calculateTotalTechnicalDesignDays(releaseId);
        Double totalBuildDays = calculateTotalBuildDays(releaseId);
        Double totalSitDays = calculateTotalSitDays(releaseId);
        Double totalUatDays = calculateTotalUatDays(releaseId);

        Release release = releaseRepository.findById(releaseId).orElse(null);
        Double regressionTestingDays = release != null ? release.getRegressionTestingDays() : 0.0;
        Double smokeTestingDays = release != null ? release.getSmokeTestingDays() : 0.0;
        Double goLiveDays = release != null ? release.getGoLiveDays() : 0.0;

        return new ReleaseEffortSummaryResponse(
                releaseId,
                totalFunctionalDesignDays,
                totalTechnicalDesignDays,
                totalBuildDays,
                totalSitDays,
                totalUatDays,
                regressionTestingDays,
                smokeTestingDays,
                goLiveDays
        );
    }

    @Override
    public Double calculateTotalFunctionalDesignDays(Long releaseId) {
        return scopeItemRepository.sumFunctionalDesignDaysByReleaseId(releaseId);
    }

    @Override
    public Double calculateTotalTechnicalDesignDays(Long releaseId) {
        return componentRepository.sumTechnicalDesignDaysByReleaseId(releaseId);
    }

    @Override
    public Double calculateTotalBuildDays(Long releaseId) {
        return componentRepository.sumBuildDaysByReleaseId(releaseId);
    }

    @Override
    public Double calculateTotalSitDays(Long releaseId) {
        return scopeItemRepository.sumSitDaysByReleaseId(releaseId);
    }

    @Override
    public Double calculateTotalUatDays(Long releaseId) {
        return scopeItemRepository.sumUatDaysByReleaseId(releaseId);
    }

    @Override
    public void validateScopeItem(ScopeItemRequest request, Long releaseId) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ValidationException("Scope item name is required");
        }

        if (request.getName().length() > 100) {
            throw new ValidationException("Scope item name must not exceed 100 characters");
        }

        if (request.getDescription() != null && request.getDescription().length() > 500) {
            throw new ValidationException("Scope item description must not exceed 500 characters");
        }

        // Check for duplicate names within the same release
        if (scopeItemRepository.existsByReleaseIdAndName(releaseId, request.getName())) {
            throw new ValidationException("Scope item with this name already exists in the release");
        }

        // Validate effort estimates are within bounds
        if (request.getFunctionalDesignDays() != null) {
            if (request.getFunctionalDesignDays() < 1.0 || 
                    request.getFunctionalDesignDays() > 1000.0) {
                throw new ValidationException("Functional design days must be between 1 and 1000");
            }
        }

        if (request.getSitDays() != null) {
            if (request.getSitDays() < 1.0 || 
                    request.getSitDays() > 1000.0) {
                throw new ValidationException("SIT days must be between 1 and 1000");
            }
        }

        if (request.getUatDays() != null) {
            if (request.getUatDays() < 1.0 || 
                    request.getUatDays() > 1000.0) {
                throw new ValidationException("UAT days must be between 1 and 1000");
            }
        }

        // Validate components if provided
        if (request.getComponents() != null) {
            for (var componentRequest : request.getComponents()) {
                if (componentRequest.getTechnicalDesignDays() != null) {
                    if (componentRequest.getTechnicalDesignDays() < 1.0 || 
                            componentRequest.getTechnicalDesignDays() > 1000.0) {
                        throw new ValidationException("Technical design days must be between 1 and 1000");
                    }
                }

                if (componentRequest.getBuildDays() != null) {
                    if (componentRequest.getBuildDays() < 1.0 || 
                            componentRequest.getBuildDays() > 1000.0) {
                        throw new ValidationException("Build days must be between 1 and 1000");
                    }
                }
            }
        }
    }

    private ScopeItemResponse convertToResponse(ScopeItem scopeItem) {
        return new ScopeItemResponse(scopeItem);
    }

    private ScopeItemWithComponentsResponse convertToResponseWithComponents(ScopeItem scopeItem) {
        List<ComponentResponse> components = componentRepository.findByScopeItemId(scopeItem.getId())
                .stream()
                .map(component -> new ComponentResponse(component))
                .collect(Collectors.toList());

        return new ScopeItemWithComponentsResponse(
                scopeItem.getId(),
                scopeItem.getName(),
                scopeItem.getDescription(),
                scopeItem.getRelease().getId(),
                scopeItem.getFunctionalDesignDays(),
                scopeItem.getSitDays(),
                scopeItem.getUatDays(),
                components,
                scopeItem.getCreatedAt(),
                scopeItem.getUpdatedAt()
        );
    }
}


