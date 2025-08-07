package com.polycoder.relmgmt.service.impl;

import com.polycoder.relmgmt.dto.*;
import com.polycoder.relmgmt.entity.*;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.exception.ValidationException;
import com.polycoder.relmgmt.repository.ReleaseRepository;
import com.polycoder.relmgmt.repository.PhaseRepository;
import com.polycoder.relmgmt.repository.BlockerRepository;
import com.polycoder.relmgmt.service.ReleaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReleaseServiceImpl implements ReleaseService {

    @Autowired
    private ReleaseRepository releaseRepository;

    @Autowired
    private PhaseRepository phaseRepository;

    @Autowired
    private BlockerRepository blockerRepository;

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
        // Validate unique identifier
        if (releaseRepository.existsByIdentifier(releaseRequest.getIdentifier())) {
            throw new ValidationException("Release with identifier '" + releaseRequest.getIdentifier() + "' already exists");
        }

        // Validate production go-live rule
        validateProductionGoLivePhases(releaseRequest.getPhases(), null);

        Release release = new Release();
        release.setName(releaseRequest.getName());
        release.setIdentifier(releaseRequest.getIdentifier());

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

        Release savedRelease = releaseRepository.save(release);
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
        // For now, always allow deletion since allocation entities are not yet implemented
        // This will be updated when allocation functionality is added
        return true;
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