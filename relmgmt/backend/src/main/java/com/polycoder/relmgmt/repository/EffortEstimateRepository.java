package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.EffortEstimate;
import com.polycoder.relmgmt.entity.PhaseTypeEnum;
import com.polycoder.relmgmt.entity.SkillFunctionEnum;
import com.polycoder.relmgmt.entity.SkillSubFunctionEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EffortEstimateRepository extends JpaRepository<EffortEstimate, Long> {

    /**
     * Find all effort estimates for a specific scope item
     */
    List<EffortEstimate> findByScopeItemId(Long scopeItemId);

    /**
     * Find all effort estimates for a specific scope item with pagination
     */
    Page<EffortEstimate> findByScopeItemId(Long scopeItemId, Pageable pageable);

    /**
     * Find effort estimates by skill function for a specific scope item
     */
    List<EffortEstimate> findByScopeItemIdAndSkillFunction(Long scopeItemId, SkillFunctionEnum skillFunction);

    /**
     * Find effort estimates by skill sub-function for a specific scope item
     */
    List<EffortEstimate> findByScopeItemIdAndSkillSubFunction(Long scopeItemId, SkillSubFunctionEnum skillSubFunction);

    /**
     * Find effort estimates by phase for a specific scope item
     */
    List<EffortEstimate> findByScopeItemIdAndPhase(Long scopeItemId, PhaseTypeEnum phase);

    /**
     * Find effort estimates by skill function and phase for a specific scope item
     */
    List<EffortEstimate> findByScopeItemIdAndSkillFunctionAndPhase(Long scopeItemId, SkillFunctionEnum skillFunction, PhaseTypeEnum phase);

    /**
     * Find effort estimates by skill function and skill sub-function for a specific scope item
     */
    List<EffortEstimate> findByScopeItemIdAndSkillFunctionAndSkillSubFunction(Long scopeItemId, SkillFunctionEnum skillFunction, SkillSubFunctionEnum skillSubFunction);

    /**
     * Find effort estimates by skill function, skill sub-function, and phase for a specific scope item
     */
    List<EffortEstimate> findByScopeItemIdAndSkillFunctionAndSkillSubFunctionAndPhase(Long scopeItemId, SkillFunctionEnum skillFunction, SkillSubFunctionEnum skillSubFunction, PhaseTypeEnum phase);

    /**
     * Count effort estimates for a specific scope item
     */
    long countByScopeItemId(Long scopeItemId);

    /**
     * Sum effort days by skill function for a specific scope item
     */
    @Query("SELECT SUM(e.effortDays) FROM EffortEstimate e WHERE e.scopeItem.id = :scopeItemId AND e.skillFunction = :skillFunction")
    Double sumEffortDaysByScopeItemIdAndSkillFunction(@Param("scopeItemId") Long scopeItemId, @Param("skillFunction") SkillFunctionEnum skillFunction);

    /**
     * Sum effort days by skill function and phase for a specific scope item
     */
    @Query("SELECT SUM(e.effortDays) FROM EffortEstimate e WHERE e.scopeItem.id = :scopeItemId AND e.skillFunction = :skillFunction AND e.phase = :phase")
    Double sumEffortDaysByScopeItemIdAndSkillFunctionAndPhase(@Param("scopeItemId") Long scopeItemId, @Param("skillFunction") SkillFunctionEnum skillFunction, @Param("phase") PhaseTypeEnum phase);

    /**
     * Sum effort days by skill function and skill sub-function for a specific scope item
     */
    @Query("SELECT SUM(e.effortDays) FROM EffortEstimate e WHERE e.scopeItem.id = :scopeItemId AND e.skillFunction = :skillFunction AND e.skillSubFunction = :skillSubFunction")
    Double sumEffortDaysByScopeItemIdAndSkillFunctionAndSkillSubFunction(@Param("scopeItemId") Long scopeItemId, @Param("skillFunction") SkillFunctionEnum skillFunction, @Param("skillSubFunction") SkillSubFunctionEnum skillSubFunction);

    /**
     * Find effort estimates by project ID
     */
    @Query("SELECT e FROM EffortEstimate e WHERE e.scopeItem.project.id = :projectId")
    List<EffortEstimate> findByProjectId(@Param("projectId") Long projectId);

    /**
     * Find effort estimates by project ID with pagination
     */
    @Query("SELECT e FROM EffortEstimate e WHERE e.scopeItem.project.id = :projectId")
    Page<EffortEstimate> findByProjectId(@Param("projectId") Long projectId, Pageable pageable);

    /**
     * Find effort estimates by release ID
     */
    @Query("SELECT e FROM EffortEstimate e WHERE e.scopeItem.project.release.id = :releaseId")
    List<EffortEstimate> findByReleaseId(@Param("releaseId") Long releaseId);

    /**
     * Find effort estimates by release ID with pagination
     */
    @Query("SELECT e FROM EffortEstimate e WHERE e.scopeItem.project.release.id = :releaseId")
    Page<EffortEstimate> findByReleaseId(@Param("releaseId") Long releaseId, Pageable pageable);

    /**
     * Sum effort days by skill function for a specific release
     */
    @Query("SELECT SUM(e.effortDays) FROM EffortEstimate e WHERE e.scopeItem.project.release.id = :releaseId AND e.skillFunction = :skillFunction")
    Double sumEffortDaysByReleaseIdAndSkillFunction(@Param("releaseId") Long releaseId, @Param("skillFunction") SkillFunctionEnum skillFunction);

    /**
     * Sum effort days by skill function and phase for a specific release
     */
    @Query("SELECT SUM(e.effortDays) FROM EffortEstimate e WHERE e.scopeItem.project.release.id = :releaseId AND e.skillFunction = :skillFunction AND e.phase = :phase")
    Double sumEffortDaysByReleaseIdAndSkillFunctionAndPhase(@Param("releaseId") Long releaseId, @Param("skillFunction") SkillFunctionEnum skillFunction, @Param("phase") PhaseTypeEnum phase);
}


