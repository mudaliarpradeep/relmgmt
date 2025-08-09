package com.polycoder.relmgmt.service.impl;

import com.polycoder.relmgmt.dto.EffortEstimateRequest;
import com.polycoder.relmgmt.dto.EffortEstimateResponse;
import com.polycoder.relmgmt.dto.ScopeItemRequest;
import com.polycoder.relmgmt.dto.ScopeItemResponse;
import com.polycoder.relmgmt.entity.*;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.exception.ValidationException;
import com.polycoder.relmgmt.repository.EffortEstimateRepository;
import com.polycoder.relmgmt.repository.ProjectRepository;
import com.polycoder.relmgmt.repository.ScopeItemRepository;
import com.polycoder.relmgmt.service.ScopeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ScopeServiceImpl implements ScopeService {

    @Autowired
    private ScopeItemRepository scopeItemRepository;

    @Autowired
    private EffortEstimateRepository effortEstimateRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ScopeItemResponse> findByProjectId(Long projectId) {
        List<ScopeItem> scopeItems = scopeItemRepository.findByProjectId(projectId);
        return scopeItems.stream()
                .map(ScopeItemResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ScopeItemResponse> findByProjectId(Long projectId, Pageable pageable) {
        Page<ScopeItem> scopeItems = scopeItemRepository.findByProjectId(projectId, pageable);
        return scopeItems.map(ScopeItemResponse::new);
    }

    @Override
    @Transactional(readOnly = true)
    public ScopeItemResponse findById(Long id) {
        ScopeItem scopeItem = scopeItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scope item not found with id: " + id));
        return new ScopeItemResponse(scopeItem);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScopeItemResponse> findByProjectIdAndNameContaining(Long projectId, String name) {
        List<ScopeItem> scopeItems = scopeItemRepository.findByProjectIdAndNameContainingIgnoreCase(projectId, name);
        return scopeItems.stream()
                .map(ScopeItemResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScopeItemResponse> findByProjectIdAndDescriptionContaining(Long projectId, String description) {
        List<ScopeItem> scopeItems = scopeItemRepository.findByProjectIdAndDescriptionContainingIgnoreCase(projectId, description);
        return scopeItems.stream()
                .map(ScopeItemResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public ScopeItemResponse create(Long projectId, ScopeItemRequest scopeItemRequest) {
        // Validate project exists
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        // Validate scope item data
        validateScopeItem(scopeItemRequest, projectId);

        // Check if scope item with same name already exists for this project
        if (scopeItemRepository.existsByProjectIdAndName(projectId, scopeItemRequest.getName())) {
            throw new ValidationException("Scope item with name '" + scopeItemRequest.getName() + "' already exists for this project");
        }

        // Create new scope item
        ScopeItem scopeItem = new ScopeItem();
        scopeItem.setName(scopeItemRequest.getName());
        scopeItem.setDescription(scopeItemRequest.getDescription());
        scopeItem.setProject(project);

        ScopeItem savedScopeItem = scopeItemRepository.save(scopeItem);
        return new ScopeItemResponse(savedScopeItem);
    }

    @Override
    public ScopeItemResponse update(Long id, ScopeItemRequest scopeItemRequest) {
        // Find existing scope item
        ScopeItem scopeItem = scopeItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scope item not found with id: " + id));

        // Validate scope item data
        validateScopeItem(scopeItemRequest, scopeItem.getProject().getId());

        // Check if scope item with same name already exists for this project (excluding current scope item)
        if (!scopeItem.getName().equals(scopeItemRequest.getName()) &&
                scopeItemRepository.existsByProjectIdAndName(scopeItem.getProject().getId(), scopeItemRequest.getName())) {
            throw new ValidationException("Scope item with name '" + scopeItemRequest.getName() + "' already exists for this project");
        }

        // Update scope item
        scopeItem.setName(scopeItemRequest.getName());
        scopeItem.setDescription(scopeItemRequest.getDescription());

        ScopeItem savedScopeItem = scopeItemRepository.save(scopeItem);
        return new ScopeItemResponse(savedScopeItem);
    }

    @Override
    public void delete(Long id) {
        // Check if scope item exists
        ScopeItem scopeItem = scopeItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scope item not found with id: " + id));

        // Check if scope item can be deleted (no effort estimates)
        if (!canDeleteScopeItem(id)) {
            throw new ValidationException("Cannot delete scope item. Scope item has effort estimates that must be removed first.");
        }

        scopeItemRepository.delete(scopeItem);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByProjectIdAndName(Long projectId, String name) {
        return scopeItemRepository.existsByProjectIdAndName(projectId, name);
    }

    @Override
    @Transactional(readOnly = true)
    public ScopeItemResponse findByProjectIdAndName(Long projectId, String name) {
        ScopeItem scopeItem = scopeItemRepository.findByProjectIdAndName(projectId, name)
                .orElseThrow(() -> new ResourceNotFoundException("Scope item not found with name: " + name + " for project: " + projectId));
        return new ScopeItemResponse(scopeItem);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByProjectId(Long projectId) {
        return scopeItemRepository.countByProjectId(projectId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScopeItemResponse> findScopeItemsWithEffortEstimates(Long projectId) {
        List<ScopeItem> scopeItems = scopeItemRepository.findScopeItemsWithEffortEstimates(projectId);
        return scopeItems.stream()
                .map(ScopeItemResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScopeItemResponse> findScopeItemsWithoutEffortEstimates(Long projectId) {
        List<ScopeItem> scopeItems = scopeItemRepository.findScopeItemsWithoutEffortEstimates(projectId);
        return scopeItems.stream()
                .map(ScopeItemResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Object[]> findScopeItemsWithEffortEstimatesCount(Long projectId) {
        return scopeItemRepository.findScopeItemsWithEffortEstimatesCount(projectId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScopeItemResponse> findByProjectReleaseId(Long releaseId) {
        List<ScopeItem> scopeItems = scopeItemRepository.findByProjectReleaseId(releaseId);
        return scopeItems.stream()
                .map(ScopeItemResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ScopeItemResponse> findByProjectReleaseId(Long releaseId, Pageable pageable) {
        Page<ScopeItem> scopeItems = scopeItemRepository.findByProjectReleaseId(releaseId, pageable);
        return scopeItems.map(ScopeItemResponse::new);
    }

    @Override
    public List<EffortEstimateResponse> addEffortEstimates(Long scopeItemId, List<EffortEstimateRequest> effortEstimateRequests) {
        // Validate scope item exists
        ScopeItem scopeItem = scopeItemRepository.findById(scopeItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Scope item not found with id: " + scopeItemId));

        // Validate effort estimates
        for (EffortEstimateRequest request : effortEstimateRequests) {
            validateEffortEstimate(request);
        }

        // Create effort estimates
        List<EffortEstimate> effortEstimates = effortEstimateRequests.stream()
                .map(request -> {
                    EffortEstimate effortEstimate = new EffortEstimate();
                    effortEstimate.setSkillFunction(request.getSkillFunction());
                    effortEstimate.setSkillSubFunction(request.getSkillSubFunction());
                    effortEstimate.setPhase(request.getPhase());
                    effortEstimate.setEffortDays(request.getEffortDays());
                    effortEstimate.setScopeItem(scopeItem);
                    return effortEstimate;
                })
                .collect(Collectors.toList());

        List<EffortEstimate> savedEffortEstimates = effortEstimateRepository.saveAll(effortEstimates);
        return savedEffortEstimates.stream()
                .map(EffortEstimateResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EffortEstimateResponse> findEffortEstimatesByScopeItemId(Long scopeItemId) {
        List<EffortEstimate> effortEstimates = effortEstimateRepository.findByScopeItemId(scopeItemId);
        return effortEstimates.stream()
                .map(EffortEstimateResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EffortEstimateResponse> findEffortEstimatesByScopeItemId(Long scopeItemId, Pageable pageable) {
        Page<EffortEstimate> effortEstimates = effortEstimateRepository.findByScopeItemId(scopeItemId, pageable);
        return effortEstimates.map(EffortEstimateResponse::new);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EffortEstimateResponse> findEffortEstimatesByProjectId(Long projectId) {
        List<EffortEstimate> effortEstimates = effortEstimateRepository.findByProjectId(projectId);
        return effortEstimates.stream()
                .map(EffortEstimateResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EffortEstimateResponse> findEffortEstimatesByProjectId(Long projectId, Pageable pageable) {
        Page<EffortEstimate> effortEstimates = effortEstimateRepository.findByProjectId(projectId, pageable);
        return effortEstimates.map(EffortEstimateResponse::new);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EffortEstimateResponse> findEffortEstimatesByReleaseId(Long releaseId) {
        List<EffortEstimate> effortEstimates = effortEstimateRepository.findByReleaseId(releaseId);
        return effortEstimates.stream()
                .map(EffortEstimateResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EffortEstimateResponse> findEffortEstimatesByReleaseId(Long releaseId, Pageable pageable) {
        Page<EffortEstimate> effortEstimates = effortEstimateRepository.findByReleaseId(releaseId, pageable);
        return effortEstimates.map(EffortEstimateResponse::new);
    }

    @Override
    @Transactional(readOnly = true)
    public Double sumEffortDaysByScopeItemIdAndSkillFunction(Long scopeItemId, String skillFunction) {
        SkillFunctionEnum skillFunctionEnum = SkillFunctionEnum.valueOf(skillFunction);
        return effortEstimateRepository.sumEffortDaysByScopeItemIdAndSkillFunction(scopeItemId, skillFunctionEnum);
    }

    @Override
    @Transactional(readOnly = true)
    public Double sumEffortDaysByScopeItemIdAndSkillFunctionAndPhase(Long scopeItemId, String skillFunction, String phase) {
        SkillFunctionEnum skillFunctionEnum = SkillFunctionEnum.valueOf(skillFunction);
        PhaseTypeEnum phaseEnum = PhaseTypeEnum.valueOf(phase);
        return effortEstimateRepository.sumEffortDaysByScopeItemIdAndSkillFunctionAndPhase(scopeItemId, skillFunctionEnum, phaseEnum);
    }

    @Override
    @Transactional(readOnly = true)
    public Double sumEffortDaysByScopeItemIdAndSkillFunctionAndSkillSubFunction(Long scopeItemId, String skillFunction, String skillSubFunction) {
        SkillFunctionEnum skillFunctionEnum = SkillFunctionEnum.valueOf(skillFunction);
        SkillSubFunctionEnum skillSubFunctionEnum = SkillSubFunctionEnum.valueOf(skillSubFunction);
        return effortEstimateRepository.sumEffortDaysByScopeItemIdAndSkillFunctionAndSkillSubFunction(scopeItemId, skillFunctionEnum, skillSubFunctionEnum);
    }

    @Override
    @Transactional(readOnly = true)
    public Double sumEffortDaysByReleaseIdAndSkillFunction(Long releaseId, String skillFunction) {
        SkillFunctionEnum skillFunctionEnum = SkillFunctionEnum.valueOf(skillFunction);
        return effortEstimateRepository.sumEffortDaysByReleaseIdAndSkillFunction(releaseId, skillFunctionEnum);
    }

    @Override
    @Transactional(readOnly = true)
    public Double sumEffortDaysByReleaseIdAndSkillFunctionAndPhase(Long releaseId, String skillFunction, String phase) {
        SkillFunctionEnum skillFunctionEnum = SkillFunctionEnum.valueOf(skillFunction);
        PhaseTypeEnum phaseEnum = PhaseTypeEnum.valueOf(phase);
        return effortEstimateRepository.sumEffortDaysByReleaseIdAndSkillFunctionAndPhase(releaseId, skillFunctionEnum, phaseEnum);
    }

    @Override
    public void validateScopeItem(ScopeItemRequest scopeItemRequest, Long projectId) {
        if (scopeItemRequest.getName() == null || scopeItemRequest.getName().trim().isEmpty()) {
            throw new ValidationException("Scope item name is required");
        }

        if (scopeItemRequest.getName().length() > 100) {
            throw new ValidationException("Scope item name must not exceed 100 characters");
        }

        if (scopeItemRequest.getDescription() != null && scopeItemRequest.getDescription().length() > 500) {
            throw new ValidationException("Scope item description must not exceed 500 characters");
        }

        // Validate that project exists
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found with id: " + projectId);
        }
    }

    @Override
    public void validateEffortEstimate(EffortEstimateRequest effortEstimateRequest) {
        if (effortEstimateRequest.getSkillFunction() == null) {
            throw new ValidationException("Skill function is required");
        }

        if (effortEstimateRequest.getPhase() == null) {
            throw new ValidationException("Phase is required");
        }

        if (effortEstimateRequest.getEffortDays() == null || effortEstimateRequest.getEffortDays() <= 0) {
            throw new ValidationException("Effort days must be positive");
        }

        // Validate skill sub-function based on skill function
        if (effortEstimateRequest.getSkillSubFunction() != null) {
            SkillFunctionEnum skillFunction = effortEstimateRequest.getSkillFunction();
            SkillSubFunctionEnum skillSubFunction = effortEstimateRequest.getSkillSubFunction();

            boolean isValid = false;
            switch (skillFunction) {
                case TECHNICAL_DESIGN:
                case BUILD:
                    isValid = skillSubFunction == SkillSubFunctionEnum.TALEND ||
                            skillSubFunction == SkillSubFunctionEnum.FORGEROCK_IDM ||
                            skillSubFunction == SkillSubFunctionEnum.FORGEROCK_IG ||
                            skillSubFunction == SkillSubFunctionEnum.SAILPOINT ||
                            skillSubFunction == SkillSubFunctionEnum.FORGEROCK_UI;
                    break;
                case TEST:
                    isValid = skillSubFunction == SkillSubFunctionEnum.AUTOMATED ||
                            skillSubFunction == SkillSubFunctionEnum.MANUAL;
                    break;
                case FUNCTIONAL_DESIGN:
                case PLATFORM:
                case GOVERNANCE:
                    isValid = skillSubFunction == null;
                    break;
            }

            if (!isValid) {
                throw new ValidationException("Invalid skill sub-function for the selected skill function");
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canDeleteScopeItem(Long scopeItemId) {
        // Check if scope item has any effort estimates
        return scopeItemRepository.findById(scopeItemId)
                .map(scopeItem -> scopeItem.getEffortEstimates().isEmpty())
                .orElse(false);
    }
}

