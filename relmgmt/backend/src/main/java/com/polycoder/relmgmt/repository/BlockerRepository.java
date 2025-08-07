package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.Blocker;
import com.polycoder.relmgmt.entity.BlockerStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlockerRepository extends JpaRepository<Blocker, Long> {

    /**
     * Find all blockers for a specific release
     * @param releaseId the release ID
     * @return List of blockers for the release
     */
    List<Blocker> findByReleaseId(Long releaseId);

    /**
     * Find blockers by release ID and status
     * @param releaseId the release ID
     * @param status the blocker status
     * @return List of blockers matching the criteria
     */
    List<Blocker> findByReleaseIdAndStatus(Long releaseId, BlockerStatusEnum status);

    /**
     * Find blockers by status across all releases
     * @param status the blocker status
     * @return List of blockers with the specified status
     */
    List<Blocker> findByStatus(BlockerStatusEnum status);

    /**
     * Find open blockers (OPEN or IN_PROGRESS status)
     * @return List of open blockers
     */
    List<Blocker> findByStatusIn(List<BlockerStatusEnum> statuses);

    /**
     * Count blockers by release ID and status
     * @param releaseId the release ID
     * @param status the blocker status
     * @return count of blockers matching the criteria
     */
    long countByReleaseIdAndStatus(Long releaseId, BlockerStatusEnum status);

    /**
     * Check if a release has any open blockers
     * @param releaseId the release ID
     * @return true if the release has open blockers, false otherwise
     */
    boolean existsByReleaseIdAndStatusIn(Long releaseId, List<BlockerStatusEnum> statuses);
} 