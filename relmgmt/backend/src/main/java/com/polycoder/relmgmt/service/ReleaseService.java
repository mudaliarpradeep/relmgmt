package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.ReleaseRequest;
import com.polycoder.relmgmt.dto.ReleaseResponse;
import com.polycoder.relmgmt.dto.PhaseRequest;
import com.polycoder.relmgmt.dto.PhaseResponse;
import com.polycoder.relmgmt.dto.BlockerRequest;
import com.polycoder.relmgmt.dto.BlockerResponse;
import com.polycoder.relmgmt.entity.Release;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface ReleaseService {

    /**
     * Get all releases with optional filtering and pagination
     * @param name optional name filter
     * @param identifier optional identifier filter
     * @param pageable pagination information
     * @return page of release responses
     */
    Page<ReleaseResponse> getAllReleases(String name, String identifier, Pageable pageable);

    /**
     * Get a release by ID
     * @param id the release ID
     * @return the release response
     */
    ReleaseResponse getReleaseById(Long id);

    /**
     * Get a release by identifier
     * @param identifier the release identifier
     * @return the release response
     */
    ReleaseResponse getReleaseByIdentifier(String identifier);

    /**
     * Create a new release
     * @param releaseRequest the release request data
     * @return the created release response
     */
    ReleaseResponse createRelease(ReleaseRequest releaseRequest);

    /**
     * Update an existing release
     * @param id the release ID
     * @param releaseRequest the updated release data
     * @return the updated release response
     */
    ReleaseResponse updateRelease(Long id, ReleaseRequest releaseRequest);

    /**
     * Delete a release by ID
     * @param id the release ID
     */
    void deleteRelease(Long id);

    /**
     * Get all active releases (with production go-live date in the future)
     * @return list of active release responses
     */
    List<ReleaseResponse> getActiveReleases();

    /**
     * Get all completed releases (with production go-live date in the past)
     * @return list of completed release responses
     */
    List<ReleaseResponse> getCompletedReleases();

    /**
     * Get releases with blockers
     * @return list of releases that have at least one blocker
     */
    List<ReleaseResponse> getReleasesWithBlockers();

    /**
     * Get releases with open blockers
     * @return list of releases that have at least one open blocker
     */
    List<ReleaseResponse> getReleasesWithOpenBlockers();

    /**
     * Add a phase to a release
     * @param releaseId the release ID
     * @param phaseRequest the phase request data
     * @return the created phase response
     */
    PhaseResponse addPhaseToRelease(Long releaseId, PhaseRequest phaseRequest);

    /**
     * Update a phase
     * @param releaseId the release ID
     * @param phaseId the phase ID
     * @param phaseRequest the updated phase data
     * @return the updated phase response
     */
    PhaseResponse updatePhase(Long releaseId, Long phaseId, PhaseRequest phaseRequest);

    /**
     * Delete a phase
     * @param releaseId the release ID
     * @param phaseId the phase ID
     */
    void deletePhase(Long releaseId, Long phaseId);

    /**
     * Get all phases for a release
     * @param releaseId the release ID
     * @return list of phase responses
     */
    List<PhaseResponse> getPhasesForRelease(Long releaseId);

    /**
     * Add a blocker to a release
     * @param releaseId the release ID
     * @param blockerRequest the blocker request data
     * @return the created blocker response
     */
    BlockerResponse addBlockerToRelease(Long releaseId, BlockerRequest blockerRequest);

    /**
     * Update a blocker
     * @param releaseId the release ID
     * @param blockerId the blocker ID
     * @param blockerRequest the updated blocker data
     * @return the updated blocker response
     */
    BlockerResponse updateBlocker(Long releaseId, Long blockerId, BlockerRequest blockerRequest);

    /**
     * Delete a blocker
     * @param releaseId the release ID
     * @param blockerId the blocker ID
     */
    void deleteBlocker(Long releaseId, Long blockerId);

    /**
     * Get all blockers for a release
     * @param releaseId the release ID
     * @return list of blocker responses
     */
    List<BlockerResponse> getBlockersForRelease(Long releaseId);

    /**
     * Find a release entity by ID
     * @param id the release ID
     * @return the release entity
     */
    Release findById(Long id);

    /**
     * Check if a release can be deleted (no active allocations)
     * @param releaseId the release ID to check
     * @return true if the release can be deleted, false otherwise
     */
    boolean canDeleteRelease(Long releaseId);

    /**
     * Validate that no more than one production go-live exists in a calendar month
     * @param startDate the start date to check
     * @param endDate the end date to check
     * @param excludeReleaseId the release ID to exclude from validation (for updates)
     * @return true if validation passes, false otherwise
     */
    boolean validateProductionGoLiveRule(LocalDate startDate, LocalDate endDate, Long excludeReleaseId);

    /**
     * Generate the next available release identifier for the current year
     * @return the next available identifier in YYYY-XXX format
     */
    String generateNextReleaseIdentifier();
} 