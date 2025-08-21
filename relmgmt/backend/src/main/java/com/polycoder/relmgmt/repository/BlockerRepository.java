package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.Blocker;
import com.polycoder.relmgmt.entity.BlockerStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlockerRepository extends JpaRepository<Blocker, Long> {

    /**
     * Find all blockers for a specific release
     * @param releaseId the release ID
     * @return List of blockers for the release
     */
    @Query("SELECT b FROM Blocker b WHERE b.release.id = :releaseId")
    List<Blocker> findByReleaseId(@Param("releaseId") Long releaseId);

    /**
     * Find blockers by release ID and status
     * @param releaseId the release ID
     * @param status the blocker status
     * @return List of blockers matching the criteria
     */
    @Query("SELECT b FROM Blocker b WHERE b.release.id = :releaseId AND b.status = :status")
    List<Blocker> findByReleaseIdAndStatus(@Param("releaseId") Long releaseId, @Param("status") BlockerStatusEnum status);

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
    @Query("SELECT COUNT(b) FROM Blocker b WHERE b.release.id = :releaseId AND b.status = :status")
    long countByReleaseIdAndStatus(@Param("releaseId") Long releaseId, @Param("status") BlockerStatusEnum status);

    /**
     * Check if a release has any open blockers
     * @param releaseId the release ID
     * @return true if the release has open blockers, false otherwise
     */
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Blocker b WHERE b.release.id = :releaseId AND b.status IN :statuses")
    boolean existsByReleaseIdAndStatusIn(@Param("releaseId") Long releaseId, @Param("statuses") List<BlockerStatusEnum> statuses);
} 