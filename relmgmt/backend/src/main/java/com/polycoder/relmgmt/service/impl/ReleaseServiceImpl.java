package com.polycoder.relmgmt.service.impl;

import com.polycoder.relmgmt.dto.*;
import com.polycoder.relmgmt.entity.*;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.exception.ValidationException;
import com.polycoder.relmgmt.repository.ReleaseRepository;
import com.polycoder.relmgmt.repository.PhaseRepository;
import com.polycoder.relmgmt.repository.BlockerRepository;
import com.polycoder.relmgmt.repository.AllocationRepository;
import com.polycoder.relmgmt.service.ReleaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import com.polycoder.relmgmt.entity.ReleaseStatusEnum;

@Service
@Transactional
public class ReleaseServiceImpl implements ReleaseService {

    @Autowired
    private ReleaseRepository releaseRepository;

    @Autowired
    private PhaseRepository phaseRepository;

    @Autowired
    private BlockerRepository blockerRepository;

    @Autowired
    private AllocationRepository allocationRepository;

    @Override
    public Page<ReleaseResponse> getAllReleases(String name, String identifier, Pageable pageable) {
        Page<Release> releases;
        
        if (name != null && !name.trim().isEmpty()) {
            releases = releaseRepository.findByNameContainingIgnoreCase(name.trim(), pageable);
        } else if (identifier != null && !identifier.trim().isEmpty()) {
            releases = releaseRepository.findByIdentifierContainingIgnoreCase(identifier.trim(), pageable);
        } else {
            releases = releaseRepository.findAll(pageable);
        }
        
        return releases.map(this::convertToReleaseResponse);
    }

    @Override
    public ReleaseResponse getReleaseById(Long id) {
        Release release = findById(id);
        return convertToReleaseResponse(release);
    }

    @Override
    public ReleaseResponse getReleaseByIdentifier(String identifier) {
        Release release = releaseRepository.findByIdentifier(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("Release not found with identifier: " + identifier));
        return convertToReleaseResponse(release);
    }

    @Override
    public ReleaseResponse createRelease(ReleaseRequest releaseRequest) {
        // Auto-generate identifier if not provided
        String identifier = releaseRequest.getIdentifier();
        if (identifier == null || identifier.trim().isEmpty()) {
            identifier = generateNextReleaseIdentifier();
        }

        // Validate unique identifier
        if (releaseRepository.existsByIdentifier(identifier)) {
            throw new ValidationException("Release with identifier '" + identifier + "' already exists");
        }

        // Validate production go-live rule
        validateProductionGoLivePhases(releaseRequest.getPhases(), null);

        Release release = new Release();
        release.setName(releaseRequest.getName());
        release.setIdentifier(identifier);
        // Map status if provided
        if (releaseRequest.getStatus() != null && !releaseRequest.getStatus().trim().isEmpty()) {
            try {
                release.setStatus(ReleaseStatusEnum.valueOf(releaseRequest.getStatus()));
            } catch (IllegalArgumentException ex) {
                throw new ValidationException("Invalid release status: " + releaseRequest.getStatus());
            }
        }

        Release savedRelease = releaseRepository.save(release);

        // Add phases
        if (releaseRequest.getPhases() != null) {
            for (PhaseRequest phaseRequest : releaseRequest.getPhases()) {
                addPhaseToRelease(savedRelease.getId(), phaseRequest);
            }
        }

        // Add blockers
        if (releaseRequest.getBlockers() != null) {
            for (BlockerRequest blockerRequest : releaseRequest.getBlockers()) {
                addBlockerToRelease(savedRelease.getId(), blockerRequest);
            }
        }

        return convertToReleaseResponse(savedRelease);
    }

    @Override
    public ReleaseResponse updateRelease(Long id, ReleaseRequest releaseRequest) {
        Release release = findById(id);

        // Check if identifier is being changed and if it's unique
        if (!release.getIdentifier().equals(releaseRequest.getIdentifier()) &&
            releaseRepository.existsByIdentifier(releaseRequest.getIdentifier())) {
            throw new ValidationException("Release with identifier '" + releaseRequest.getIdentifier() + "' already exists");
        }

        // Validate production go-live rule
        validateProductionGoLivePhases(releaseRequest.getPhases(), id);

        release.setName(releaseRequest.getName());
        release.setIdentifier(releaseRequest.getIdentifier());
        if (releaseRequest.getStatus() != null && !releaseRequest.getStatus().trim().isEmpty()) {
            try {
                release.setStatus(ReleaseStatusEnum.valueOf(releaseRequest.getStatus()));
            } catch (IllegalArgumentException ex) {
                throw new ValidationException("Invalid release status: " + releaseRequest.getStatus());
            }
        }

        // Persist basic release fields first
        Release savedRelease = releaseRepository.save(release);

        // Reconcile phases with incoming request
        if (releaseRequest.getPhases() != null) {
            // Ensure no duplicate phase types in the incoming payload
            java.util.Set<String> incomingTypesSet = new java.util.HashSet<>();
            for (PhaseRequest pr : releaseRequest.getPhases()) {
                String type = pr.getPhaseType();
                if (!incomingTypesSet.add(type)) {
                    throw new ValidationException("Duplicate phase type '" + type + "' in request");
                }
            }

            // Load existing phases for this release
            java.util.List<Phase> existingPhases = phaseRepository.findByReleaseId(savedRelease.getId());

            // Build lookup maps by type
            java.util.Map<PhaseTypeEnum, Phase> existingByType = new java.util.HashMap<>();
            for (Phase p : existingPhases) {
                existingByType.put(p.getPhaseType(), p);
            }

            java.util.Map<PhaseTypeEnum, PhaseRequest> incomingByType = new java.util.HashMap<>();
            for (PhaseRequest pr : releaseRequest.getPhases()) {
                PhaseTypeEnum typeEnum = PhaseTypeEnum.valueOf(pr.getPhaseType());
                incomingByType.put(typeEnum, pr);
            }

            // Delete phases that are no longer present
            for (PhaseTypeEnum existingType : existingByType.keySet()) {
                if (!incomingByType.containsKey(existingType)) {
                    Phase toDelete = existingByType.get(existingType);
                    phaseRepository.delete(toDelete);
                }
            }

            // Add new phases or update existing ones
            for (java.util.Map.Entry<PhaseTypeEnum, PhaseRequest> entry : incomingByType.entrySet()) {
                PhaseTypeEnum type = entry.getKey();
                PhaseRequest pr = entry.getValue();

                Phase existing = existingByType.get(type);
                if (existing == null) {
                    // Add new phase
                    Phase newPhase = new Phase();
                    newPhase.setPhaseType(type);
                    newPhase.setStartDate(pr.getStartDate());
                    newPhase.setEndDate(pr.getEndDate());
                    newPhase.setRelease(savedRelease);
                    phaseRepository.save(newPhase);
                } else {
                    // Update dates of existing phase
                    existing.setStartDate(pr.getStartDate());
                    existing.setEndDate(pr.getEndDate());
                    phaseRepository.save(existing);
                }
            }
        }

        return convertToReleaseResponse(savedRelease);
    }

    @Override
    public void deleteRelease(Long id) {
        Release release = findById(id);
        
        if (!canDeleteRelease(id)) {
            throw new ValidationException("Cannot delete release - it has active allocations");
        }
        
        releaseRepository.delete(release);
    }

    @Override
    public List<ReleaseResponse> getActiveReleases() {
        List<Release> releases = releaseRepository.findActiveReleases(LocalDate.now());
        return releases.stream()
                .map(this::convertToReleaseResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReleaseResponse> getCompletedReleases() {
        List<Release> releases = releaseRepository.findCompletedReleases(LocalDate.now());
        return releases.stream()
                .map(this::convertToReleaseResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReleaseResponse> getReleasesWithBlockers() {
        List<Release> releases = releaseRepository.findReleasesWithBlockers();
        return releases.stream()
                .map(this::convertToReleaseResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReleaseResponse> getReleasesWithOpenBlockers() {
        List<Release> releases = releaseRepository.findReleasesWithOpenBlockers();
        return releases.stream()
                .map(this::convertToReleaseResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PhaseResponse addPhaseToRelease(Long releaseId, PhaseRequest phaseRequest) {
        Release release = findById(releaseId);
        
        PhaseTypeEnum phaseType = PhaseTypeEnum.valueOf(phaseRequest.getPhaseType());
        
        // Check if phase type already exists for this release
        if (phaseRepository.existsByReleaseIdAndPhaseType(releaseId, phaseType)) {
            throw new ValidationException("Phase type '" + phaseType.getDisplayName() + "' already exists for this release");
        }

        Phase phase = new Phase();
        phase.setPhaseType(phaseType);
        phase.setStartDate(phaseRequest.getStartDate());
        phase.setEndDate(phaseRequest.getEndDate());
        phase.setRelease(release);

        Phase savedPhase = phaseRepository.save(phase);
        return convertToPhaseResponse(savedPhase);
    }

    @Override
    public PhaseResponse updatePhase(Long releaseId, Long phaseId, PhaseRequest phaseRequest) {
        Release release = findById(releaseId);
        Phase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Phase not found with ID: " + phaseId));

        if (!phase.getRelease().getId().equals(releaseId)) {
            throw new ValidationException("Phase does not belong to the specified release");
        }

        PhaseTypeEnum phaseType = PhaseTypeEnum.valueOf(phaseRequest.getPhaseType());
        
        // Check if phase type already exists for this release (excluding current phase)
        if (!phase.getPhaseType().equals(phaseType) && 
            phaseRepository.existsByReleaseIdAndPhaseType(releaseId, phaseType)) {
            throw new ValidationException("Phase type '" + phaseType.getDisplayName() + "' already exists for this release");
        }

        phase.setPhaseType(phaseType);
        phase.setStartDate(phaseRequest.getStartDate());
        phase.setEndDate(phaseRequest.getEndDate());

        Phase savedPhase = phaseRepository.save(phase);
        return convertToPhaseResponse(savedPhase);
    }

    @Override
    public void deletePhase(Long releaseId, Long phaseId) {
        Release release = findById(releaseId);
        Phase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Phase not found with ID: " + phaseId));

        if (!phase.getRelease().getId().equals(releaseId)) {
            throw new ValidationException("Phase does not belong to the specified release");
        }

        phaseRepository.delete(phase);
    }

    @Override
    public List<PhaseResponse> getPhasesForRelease(Long releaseId) {
        findById(releaseId); // Validate release exists
        List<Phase> phases = phaseRepository.findByReleaseId(releaseId);
        return phases.stream()
                .map(this::convertToPhaseResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BlockerResponse addBlockerToRelease(Long releaseId, BlockerRequest blockerRequest) {
        Release release = findById(releaseId);
        
        BlockerStatusEnum status = BlockerStatusEnum.valueOf(blockerRequest.getStatus());

        Blocker blocker = new Blocker();
        blocker.setDescription(blockerRequest.getDescription());
        blocker.setStatus(status);
        blocker.setRelease(release);

        Blocker savedBlocker = blockerRepository.save(blocker);
        return convertToBlockerResponse(savedBlocker);
    }

    @Override
    public BlockerResponse updateBlocker(Long releaseId, Long blockerId, BlockerRequest blockerRequest) {
        Release release = findById(releaseId);
        Blocker blocker = blockerRepository.findById(blockerId)
                .orElseThrow(() -> new ResourceNotFoundException("Blocker not found with ID: " + blockerId));

        if (!blocker.getRelease().getId().equals(releaseId)) {
            throw new ValidationException("Blocker does not belong to the specified release");
        }

        BlockerStatusEnum status = BlockerStatusEnum.valueOf(blockerRequest.getStatus());

        blocker.setDescription(blockerRequest.getDescription());
        blocker.setStatus(status);

        Blocker savedBlocker = blockerRepository.save(blocker);
        return convertToBlockerResponse(savedBlocker);
    }

    @Override
    public void deleteBlocker(Long releaseId, Long blockerId) {
        Release release = findById(releaseId);
        Blocker blocker = blockerRepository.findById(blockerId)
                .orElseThrow(() -> new ResourceNotFoundException("Blocker not found with ID: " + blockerId));

        if (!blocker.getRelease().getId().equals(releaseId)) {
            throw new ValidationException("Blocker does not belong to the specified release");
        }

        blockerRepository.delete(blocker);
    }

    @Override
    public List<BlockerResponse> getBlockersForRelease(Long releaseId) {
        findById(releaseId); // Validate release exists
        List<Blocker> blockers = blockerRepository.findByReleaseId(releaseId);
        return blockers.stream()
                .map(this::convertToBlockerResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Release findById(Long id) {
        return releaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Release not found with ID: " + id));
    }

    @Override
    public boolean canDeleteRelease(Long releaseId) {
        // Check if release has any active allocations
        List<Allocation> allocations = allocationRepository.findByReleaseId(releaseId);
        return allocations.isEmpty();
    }

    @Override
    public boolean validateProductionGoLiveRule(LocalDate startDate, LocalDate endDate, Long excludeReleaseId) {
        List<Phase> existingPhases = phaseRepository.findProductionGoLivePhasesInDateRange(startDate, endDate);
        
        if (excludeReleaseId != null) {
            existingPhases = existingPhases.stream()
                    .filter(phase -> !phase.getRelease().getId().equals(excludeReleaseId))
                    .collect(Collectors.toList());
        }
        
        return existingPhases.isEmpty();
    }

    @Override
    public String generateNextReleaseIdentifier() {
        int currentYear = LocalDate.now().getYear();
        String yearStr = String.valueOf(currentYear);
        
        Optional<Integer> maxNumber = releaseRepository.findHighestIdentifierNumberForYear(yearStr);
        
        int nextNumber = maxNumber.orElse(0) + 1;
        
        return String.format("%s-%03d", yearStr, nextNumber);
    }

    // Helper methods for validation
    private void validateProductionGoLivePhases(List<PhaseRequest> phases, Long excludeReleaseId) {
        if (phases == null) return;
        
        for (PhaseRequest phaseRequest : phases) {
            if ("PRODUCTION_GO_LIVE".equals(phaseRequest.getPhaseType())) {
                if (!validateProductionGoLiveRule(phaseRequest.getStartDate(), phaseRequest.getEndDate(), excludeReleaseId)) {
                    throw new ValidationException("Cannot have more than one production go-live in the same calendar month");
                }
            }
        }
    }

    // Conversion methods
    private ReleaseResponse convertToReleaseResponse(Release release) {
        List<PhaseResponse> phases = phaseRepository.findByReleaseId(release.getId())
                .stream()
                .map(this::convertToPhaseResponse)
                .collect(Collectors.toList());

        List<BlockerResponse> blockers = blockerRepository.findByReleaseId(release.getId())
                .stream()
                .map(this::convertToBlockerResponse)
                .collect(Collectors.toList());

        return new ReleaseResponse(
                release.getId(),
                release.getName(),
                release.getIdentifier(),
                release.getStatus() != null ? release.getStatus().name() : null,
                phases,
                blockers,
                release.getCreatedAt(),
                release.getUpdatedAt()
        );
    }

    private PhaseResponse convertToPhaseResponse(Phase phase) {
        return new PhaseResponse(
                phase.getId(),
                phase.getPhaseType().name(),
                phase.getPhaseType().getDisplayName(),
                phase.getStartDate(),
                phase.getEndDate(),
                phase.getRelease().getId(),
                phase.getCreatedAt(),
                phase.getUpdatedAt()
        );
    }

    private BlockerResponse convertToBlockerResponse(Blocker blocker) {
        return new BlockerResponse(
                blocker.getId(),
                blocker.getDescription(),
                blocker.getStatus().name(),
                blocker.getStatus().getDisplayName(),
                blocker.getRelease().getId(),
                blocker.getCreatedAt(),
                blocker.getUpdatedAt()
        );
    }
} 