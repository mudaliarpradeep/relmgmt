package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.Resource;
import com.polycoder.relmgmt.entity.StatusEnum;
import com.polycoder.relmgmt.entity.SkillFunctionEnum;
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
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    /**
     * Find a resource by employee number
     * @param employeeNumber the employee number to search for
     * @return Optional containing the resource if found
     */
    Optional<Resource> findByEmployeeNumber(String employeeNumber);

    /**
     * Find a resource by email
     * @param email the email to search for
     * @return Optional containing the resource if found
     */
    Optional<Resource> findByEmail(String email);

    /**
     * Check if a resource exists by employee number
     * @param employeeNumber the employee number to check
     * @return true if resource exists, false otherwise
     */
    boolean existsByEmployeeNumber(String employeeNumber);

    /**
     * Check if a resource exists by email
     * @param email the email to check
     * @return true if resource exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Find resources by status
     * @param status the status to filter by
     * @param pageable pagination information
     * @return Page of resources with the specified status
     */
    Page<Resource> findByStatus(StatusEnum status, Pageable pageable);

    /**
     * Find resources by skill function
     * @param skillFunction the skill function to filter by
     * @param pageable pagination information
     * @return Page of resources with the specified skill function
     */
    Page<Resource> findBySkillFunction(SkillFunctionEnum skillFunction, Pageable pageable);

    /**
     * Find resources by status and skill function
     * @param status the status to filter by
     * @param skillFunction the skill function to filter by
     * @param pageable pagination information
     * @return Page of resources with the specified status and skill function
     */
    Page<Resource> findByStatusAndSkillFunction(StatusEnum status, SkillFunctionEnum skillFunction, Pageable pageable);

    /**
     * Find all resources with active status
     * @return List of active resources
     */
    List<Resource> findByStatus(StatusEnum status);

    /**
     * Find resources allocated to active releases (for deletion validation)
     * This query checks if a resource is allocated to any release with a production go-live date in the future
     * NOTE: This method will be implemented when Allocation and Release entities are available
     * @param resourceId the resource ID to check
     * @param currentDate the current date
     * @return List of resource IDs that are allocated to active releases
     */
    /*
    @Query("SELECT DISTINCT a.resource.id FROM Allocation a " +
           "JOIN a.release r " +
           "JOIN r.phases p " +
           "WHERE a.resource.id = :resourceId " +
           "AND p.phaseType = 'PRODUCTION_GO_LIVE' " +
           "AND p.endDate > :currentDate")
    List<Long> findResourcesAllocatedToActiveReleases(@Param("resourceId") Long resourceId, @Param("currentDate") LocalDate currentDate);
    */

    /**
     * Find resources by skill function and status
     * @param skillFunction the skill function to filter by
     * @param status the status to filter by
     * @return List of resources matching the criteria
     */
    List<Resource> findBySkillFunctionAndStatus(SkillFunctionEnum skillFunction, StatusEnum status);
}