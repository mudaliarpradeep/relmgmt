package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.ResourceRequest;
import com.polycoder.relmgmt.dto.ResourceResponse;
import com.polycoder.relmgmt.dto.ResourceImportResponse;
import com.polycoder.relmgmt.entity.Resource;
import com.polycoder.relmgmt.entity.StatusEnum;
import com.polycoder.relmgmt.entity.SkillFunctionEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResourceService {

    /**
     * Get all resources with optional filtering
     * @param status optional status filter
     * @param skillFunction optional skill function filter
     * @param pageable pagination information
     * @return page of resource responses
     */
    Page<ResourceResponse> getAllResources(StatusEnum status, SkillFunctionEnum skillFunction, Pageable pageable);

    /**
     * Get a resource by ID
     * @param id the resource ID
     * @return the resource response
     */
    ResourceResponse getResourceById(Long id);

    /**
     * Create a new resource
     * @param resourceRequest the resource request data
     * @return the created resource response
     */
    ResourceResponse createResource(ResourceRequest resourceRequest);

    /**
     * Update an existing resource
     * @param id the resource ID
     * @param resourceRequest the updated resource data
     * @return the updated resource response
     */
    ResourceResponse updateResource(Long id, ResourceRequest resourceRequest);

    /**
     * Delete a resource by ID
     * @param id the resource ID
     */
    void deleteResource(Long id);

    /**
     * Import resources from Excel file
     * @param file the Excel file containing resource data
     * @return the import response with success/failure statistics
     */
    ResourceImportResponse importResourcesFromExcel(MultipartFile file);

    /**
     * Export resources to Excel file
     * @return byte array of the Excel file
     */
    byte[] exportResourcesToExcel();

    /**
     * Find a resource entity by ID
     * @param id the resource ID
     * @return the resource entity
     */
    Resource findById(Long id);

    /**
     * Find a resource by employee number
     * @param employeeNumber the employee number
     * @return the resource entity
     */
    Resource findByEmployeeNumber(String employeeNumber);

    /**
     * Get all active resources
     * @return list of active resource responses
     */
    List<ResourceResponse> getActiveResources();

    /**
     * Get resources by skill function and status
     * @param skillFunction the skill function to filter by
     * @param status the status to filter by
     * @return list of resource responses matching the criteria
     */
    List<ResourceResponse> getResourcesBySkillFunctionAndStatus(SkillFunctionEnum skillFunction, StatusEnum status);

    /**
     * Check if a resource can be deleted (not allocated to active releases)
     * @param resourceId the resource ID to check
     * @return true if the resource can be deleted, false otherwise
     */
    boolean canDeleteResource(Long resourceId);
}