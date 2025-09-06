package com.polycoder.relmgmt.repository;

import com.polycoder.relmgmt.entity.Allocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

public interface AllocationRepository extends JpaRepository<Allocation, Long> {

    @Query("SELECT a FROM Allocation a JOIN FETCH a.resource WHERE a.release.id = :releaseId")
    List<Allocation> findByReleaseId(@Param("releaseId") Long releaseId);

    @Query("SELECT a FROM Allocation a JOIN FETCH a.resource WHERE a.resource.id = :resourceId")
    List<Allocation> findByResourceId(@Param("resourceId") Long resourceId);

    @Query("select a from Allocation a where (:from is null or a.endDate >= :from) and (:to is null or a.startDate <= :to)")
    List<Allocation> findOverlapping(@Param("from") LocalDate from,
                                     @Param("to") LocalDate to);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM allocations WHERE release_id = :releaseId", nativeQuery = true)
    void deleteByReleaseId(@Param("releaseId") Long releaseId);

    @Query("SELECT a FROM Allocation a JOIN FETCH a.resource WHERE a.startDate <= :endDate AND a.endDate >= :startDate")
    List<Allocation> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM Allocation a JOIN FETCH a.resource WHERE a.resource.id = :resourceId AND a.startDate <= :endDate AND a.endDate >= :startDate")
    List<Allocation> findByResourceIdAndDateRange(@Param("resourceId") Long resourceId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}


