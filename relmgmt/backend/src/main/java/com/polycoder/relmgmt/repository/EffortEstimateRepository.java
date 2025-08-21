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
     * Find all effort estimates for a specific component
     */
    List<EffortEstimate> findByComponentId(Long componentId);

    /**
     * Find all effort estimates for a specific component with pagination
     */
    Page<EffortEstimate> findByComponentId(Long componentId, Pageable pageable);

    /**
     * Find effort estimates by skill function for a specific component
     */
    List<EffortEstimate> findByComponentIdAndSkillFunction(Long componentId, SkillFunctionEnum skillFunction);

    /**
     * Find effort estimates by skill sub-function for a specific component
     */
    List<EffortEstimate> findByComponentIdAndSkillSubFunction(Long componentId, SkillSubFunctionEnum skillSubFunction);

    /**
     * Find effort estimates by phase for a specific component
     */
    List<EffortEstimate> findByComponentIdAndPhase(Long componentId, PhaseTypeEnum phase);

    /**
     * Find effort estimates by skill function and phase for a specific component
     */
    List<EffortEstimate> findByComponentIdAndSkillFunctionAndPhase(Long componentId, SkillFunctionEnum skillFunction, PhaseTypeEnum phase);

    /**
     * Find effort estimates by skill function and skill sub-function for a specific component
     */
    List<EffortEstimate> findByComponentIdAndSkillFunctionAndSkillSubFunction(Long componentId, SkillFunctionEnum skillFunction, SkillSubFunctionEnum skillSubFunction);

    /**
     * Find effort estimates by skill function, skill sub-function, and phase for a specific component
     */
    List<EffortEstimate> findByComponentIdAndSkillFunctionAndSkillSubFunctionAndPhase(Long componentId, SkillFunctionEnum skillFunction, SkillSubFunctionEnum skillSubFunction, PhaseTypeEnum phase);

    /**
     * Count effort estimates for a specific component
     */
    long countByComponentId(Long componentId);

    /**
     * Sum effort days by skill function for a specific component
     */
    @Query("SELECT SUM(e.effortDays) FROM EffortEstimate e WHERE e.component.id = :componentId AND e.skillFunction = :skillFunction")
    Double sumEffortDaysByComponentIdAndSkillFunction(@Param("componentId") Long componentId, @Param("skillFunction") SkillFunctionEnum skillFunction);

    /**
     * Sum effort days by skill function and phase for a specific component
     */
    @Query("SELECT SUM(e.effortDays) FROM EffortEstimate e WHERE e.component.id = :componentId AND e.skillFunction = :skillFunction AND e.phase = :phase")
    Double sumEffortDaysByComponentIdAndSkillFunctionAndPhase(@Param("componentId") Long componentId, @Param("skillFunction") SkillFunctionEnum skillFunction, @Param("phase") PhaseTypeEnum phase);

    /**
     * Sum effort days by skill function and skill sub-function for a specific component
     */
    @Query("SELECT SUM(e.effortDays) FROM EffortEstimate e WHERE e.component.id = :componentId AND e.skillFunction = :skillFunction AND e.skillSubFunction = :skillSubFunction")
    Double sumEffortDaysByComponentIdAndSkillFunctionAndSkillSubFunction(@Param("componentId") Long componentId, @Param("skillFunction") SkillFunctionEnum skillFunction, @Param("skillSubFunction") SkillSubFunctionEnum skillSubFunction);

    /**
     * Find effort estimates by scope item ID (through component)
     */
    @Query("SELECT e FROM EffortEstimate e WHERE e.component.scopeItem.id = :scopeItemId")
    List<EffortEstimate> findByScopeItemId(@Param("scopeItemId") Long scopeItemId);

    /**
     * Find effort estimates by scope item ID with pagination (through component)
     */
    @Query("SELECT e FROM EffortEstimate e WHERE e.component.scopeItem.id = :scopeItemId")
    Page<EffortEstimate> findByScopeItemId(@Param("scopeItemId") Long scopeItemId, Pageable pageable);

    /**
     * Find effort estimates by release ID (through component -> scope item -> release)
     */
    @Query("SELECT e FROM EffortEstimate e WHERE e.component.scopeItem.release.id = :releaseId")
    List<EffortEstimate> findByReleaseId(@Param("releaseId") Long releaseId);

    /**
     * Find effort estimates by release ID with pagination (through component -> scope item -> release)
     */
    @Query("SELECT e FROM EffortEstimate e WHERE e.component.scopeItem.release.id = :releaseId")
    Page<EffortEstimate> findByReleaseId(@Param("releaseId") Long releaseId, Pageable pageable);

    /**
     * Sum effort days by skill function for a specific release
     */
    @Query("SELECT SUM(e.effortDays) FROM EffortEstimate e WHERE e.component.scopeItem.release.id = :releaseId AND e.skillFunction = :skillFunction")
    Double sumEffortDaysByReleaseIdAndSkillFunction(@Param("releaseId") Long releaseId, @Param("skillFunction") SkillFunctionEnum skillFunction);

    /**
     * Sum effort days by skill function and phase for a specific release
     */
    @Query("SELECT SUM(e.effortDays) FROM EffortEstimate e WHERE e.component.scopeItem.release.id = :releaseId AND e.skillFunction = :skillFunction AND e.phase = :phase")
    Double sumEffortDaysByReleaseIdAndSkillFunctionAndPhase(@Param("releaseId") Long releaseId, @Param("skillFunction") SkillFunctionEnum skillFunction, @Param("phase") PhaseTypeEnum phase);
}


