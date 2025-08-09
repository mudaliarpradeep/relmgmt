package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.Allocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AllocationRepository extends JpaRepository<Allocation, Long> {

    List<Allocation> findByReleaseId(Long releaseId);

    List<Allocation> findByResourceId(Long resourceId);

    @Query("select a from Allocation a where a.resource.id = :resourceId and ((a.startDate <= :endDate and a.endDate >= :startDate))")
    List<Allocation> findOverlappingAllocations(@Param("resourceId") Long resourceId,
                                                @Param("startDate") LocalDate startDate,
                                                @Param("endDate") LocalDate endDate);
}


