package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.Phase;
import com.polycoder.relmgmt.entity.PhaseTypeEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PhaseRepository extends JpaRepository<Phase, Long> {

    /**
     * Find all phases for a specific release
     * @param releaseId the release ID
     * @return List of phases for the release
     */
    List<Phase> findByReleaseId(Long releaseId);

    /**
     * Find phases by release ID and phase type
     * @param releaseId the release ID
     * @param phaseType the phase type
     * @return List of phases matching the criteria
     */
    List<Phase> findByReleaseIdAndPhaseType(Long releaseId, PhaseTypeEnum phaseType);

    /**
     * Find phases by phase type across all releases
     * @param phaseType the phase type
     * @return List of phases with the specified type
     */
    List<Phase> findByPhaseType(PhaseTypeEnum phaseType);

    /**
     * Find phases that overlap with a given date range
     * @param startDate the start date
     * @param endDate the end date
     * @return List of phases that overlap with the date range
     */
    @Query("SELECT p FROM Phase p " +
           "WHERE (p.startDate <= :endDate AND p.endDate >= :startDate)")
    List<Phase> findPhasesOverlappingDateRange(@Param("startDate") LocalDate startDate, 
                                              @Param("endDate") LocalDate endDate);

    /**
     * Find phases for a specific release that overlap with a given date range
     * @param releaseId the release ID
     * @param startDate the start date
     * @param endDate the end date
     * @return List of phases for the release that overlap with the date range
     */
    @Query("SELECT p FROM Phase p " +
           "WHERE p.release.id = :releaseId " +
           "AND (p.startDate <= :endDate AND p.endDate >= :startDate)")
    List<Phase> findPhasesByReleaseOverlappingDateRange(@Param("releaseId") Long releaseId,
                                                        @Param("startDate") LocalDate startDate,
                                                        @Param("endDate") LocalDate endDate);

    /**
     * Find production go-live phases in a given date range
     * @param startDate the start date
     * @param endDate the end date
     * @return List of production go-live phases in the date range
     */
    @Query("SELECT p FROM Phase p " +
           "WHERE p.phaseType = 'PRODUCTION_GO_LIVE' " +
           "AND p.startDate >= :startDate " +
           "AND p.endDate <= :endDate")
    List<Phase> findProductionGoLivePhasesInDateRange(@Param("startDate") LocalDate startDate,
                                                      @Param("endDate") LocalDate endDate);

    /**
     * Check if a release has a specific phase type
     * @param releaseId the release ID
     * @param phaseType the phase type
     * @return true if the release has the phase type, false otherwise
     */
    boolean existsByReleaseIdAndPhaseType(Long releaseId, PhaseTypeEnum phaseType);
} 