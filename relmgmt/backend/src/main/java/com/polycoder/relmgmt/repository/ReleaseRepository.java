package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.Release;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReleaseRepository extends JpaRepository<Release, Long> {

    /**
     * Find a release by identifier
     * @param identifier the release identifier to search for
     * @return Optional containing the release if found
     */
    Optional<Release> findByIdentifier(String identifier);

    /**
     * Check if a release exists by identifier
     * @param identifier the identifier to check
     * @return true if release exists, false otherwise
     */
    boolean existsByIdentifier(String identifier);

    /**
     * Find releases by name containing the given text (case-insensitive)
     * @param name the name text to search for
     * @param pageable pagination information
     * @return Page of releases with names containing the search text
     */
    Page<Release> findByNameContainingIgnoreCase(String name, Pageable pageable);

    /**
     * Find releases by identifier containing the given text (case-insensitive)
     * @param identifier the identifier text to search for
     * @param pageable pagination information
     * @return Page of releases with identifiers containing the search text
     */
    Page<Release> findByIdentifierContainingIgnoreCase(String identifier, Pageable pageable);

    /**
     * Find releases that have a production go-live phase with end date in the future
     * @param currentDate the current date to compare against
     * @return List of active releases
     */
    @Query("SELECT DISTINCT r FROM Release r " +
           "JOIN r.phases p " +
           "WHERE p.phaseType = 'PRODUCTION_GO_LIVE' " +
           "AND p.endDate > :currentDate")
    List<Release> findActiveReleases(@Param("currentDate") LocalDate currentDate);

    /**
     * Find releases that have a production go-live phase with end date in the past
     * @param currentDate the current date to compare against
     * @return List of completed releases
     */
    @Query("SELECT DISTINCT r FROM Release r " +
           "JOIN r.phases p " +
           "WHERE p.phaseType = 'PRODUCTION_GO_LIVE' " +
           "AND p.endDate <= :currentDate")
    List<Release> findCompletedReleases(@Param("currentDate") LocalDate currentDate);

    /**
     * Find releases with blockers
     * @return List of releases that have at least one blocker
     */
    @Query("SELECT DISTINCT r FROM Release r " +
           "WHERE EXISTS (SELECT 1 FROM r.blockers)")
    List<Release> findReleasesWithBlockers();

    /**
     * Find releases with open blockers
     * @return List of releases that have at least one open blocker
     */
    @Query("SELECT DISTINCT r FROM Release r " +
           "WHERE EXISTS (SELECT 1 FROM r.blockers b WHERE b.status IN ('OPEN', 'IN_PROGRESS'))")
    List<Release> findReleasesWithOpenBlockers();

    /**
     * Find the highest identifier number for a specific year
     * @param year the year to search for (e.g., "2025", "2026")
     * @return Optional containing the highest identifier number, or empty if none found
     */
    @Query("SELECT MAX(CAST(SUBSTRING(r.identifier, 6) AS INTEGER)) " +
           "FROM Release r " +
           "WHERE r.identifier LIKE CONCAT(:year, '-%')")
    Optional<Integer> findHighestIdentifierNumberForYear(@Param("year") String year);
} 