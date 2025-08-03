package com.polycoder.relmgmt.service.impl;

import com.polycoder.relmgmt.dto.ResourceRequest;
import com.polycoder.relmgmt.dto.ResourceResponse;
import com.polycoder.relmgmt.dto.ResourceImportResponse;
import com.polycoder.relmgmt.entity.Resource;
import com.polycoder.relmgmt.entity.StatusEnum;
import com.polycoder.relmgmt.entity.EmployeeGradeEnum;
import com.polycoder.relmgmt.entity.SkillFunctionEnum;
import com.polycoder.relmgmt.entity.SkillSubFunctionEnum;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.exception.ValidationException;
import com.polycoder.relmgmt.repository.ResourceRepository;
import com.polycoder.relmgmt.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceServiceImpl implements ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    @Override
    public Page<ResourceResponse> getAllResources(StatusEnum status, SkillFunctionEnum skillFunction, Pageable pageable) {
        Page<Resource> resourcePage;
        
        if (status != null && skillFunction != null) {
            resourcePage = resourceRepository.findByStatusAndSkillFunction(status, skillFunction, pageable);
        } else if (status != null) {
            resourcePage = resourceRepository.findByStatus(status, pageable);
        } else if (skillFunction != null) {
            resourcePage = resourceRepository.findBySkillFunction(skillFunction, pageable);
        } else {
            resourcePage = resourceRepository.findAll(pageable);
        }
        
        return resourcePage.map(this::convertToResourceResponse);
    }

    @Override
    public ResourceResponse getResourceById(Long id) {
        Resource resource = findById(id);
        return convertToResourceResponse(resource);
    }

    @Override
    public ResourceResponse createResource(ResourceRequest resourceRequest) {
        // Validate unique constraints
        if (resourceRepository.existsByEmployeeNumber(resourceRequest.getEmployeeNumber())) {
            throw new ValidationException("Employee number already exists: " + resourceRequest.getEmployeeNumber());
        }
        
        if (resourceRepository.existsByEmail(resourceRequest.getEmail())) {
            throw new ValidationException("Email already exists: " + resourceRequest.getEmail());
        }
        
        Resource resource = convertToResource(resourceRequest);
        Resource savedResource = resourceRepository.save(resource);
        return convertToResourceResponse(savedResource);
    }

    @Override
    public ResourceResponse updateResource(Long id, ResourceRequest resourceRequest) {
        Resource existingResource = findById(id);
        
        // Check if employee number is being changed and if it already exists
        if (!existingResource.getEmployeeNumber().equals(resourceRequest.getEmployeeNumber()) &&
            resourceRepository.existsByEmployeeNumber(resourceRequest.getEmployeeNumber())) {
            throw new ValidationException("Employee number already exists: " + resourceRequest.getEmployeeNumber());
        }
        
        // Check if email is being changed and if it already exists
        if (!existingResource.getEmail().equals(resourceRequest.getEmail()) &&
            resourceRepository.existsByEmail(resourceRequest.getEmail())) {
            throw new ValidationException("Email already exists: " + resourceRequest.getEmail());
        }
        
        // Update the resource
        updateResourceFromRequest(existingResource, resourceRequest);
        Resource updatedResource = resourceRepository.save(existingResource);
        return convertToResourceResponse(updatedResource);
    }

    @Override
    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        
        // Check if resource can be deleted (not allocated to active releases)
        if (!canDeleteResource(id)) {
            throw new ValidationException("Cannot delete resource. Resource is allocated to active releases.");
        }
        
        resourceRepository.deleteById(id);
    }

    @Override
    public ResourceImportResponse importResourcesFromExcel(MultipartFile file) {
        return importResourcesFromExcelFile(file);
    }

    @Override
    public byte[] exportResourcesToExcel() {
        return generateExcelExport();
    }

    @Override
    public Resource findById(Long id) {
        return resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    @Override
    public Resource findByEmployeeNumber(String employeeNumber) {
        return resourceRepository.findByEmployeeNumber(employeeNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found with employee number: " + employeeNumber));
    }

    @Override
    public List<ResourceResponse> getActiveResources() {
        List<Resource> activeResources = resourceRepository.findByStatus(StatusEnum.ACTIVE);
        return activeResources.stream()
            .map(this::convertToResourceResponse)
            .collect(Collectors.toList());
    }

    @Override
    public List<ResourceResponse> getResourcesBySkillFunctionAndStatus(SkillFunctionEnum skillFunction, StatusEnum status) {
        List<Resource> resources = resourceRepository.findBySkillFunctionAndStatus(skillFunction, status);
        return resources.stream()
            .map(this::convertToResourceResponse)
            .collect(Collectors.toList());
    }

    @Override
    public boolean canDeleteResource(Long resourceId) {
        // TODO: Implement allocation check when allocation entities are available
        // For now, return true as allocation functionality is not yet implemented
        /*
        List<Long> allocatedResources = resourceRepository.findResourcesAllocatedToActiveReleases(
            resourceId, LocalDate.now());
        return allocatedResources.isEmpty();
        */
        return true;
    }

    // Helper methods for conversion
    private ResourceResponse convertToResourceResponse(Resource resource) {
        ResourceResponse response = new ResourceResponse();
        response.setId(resource.getId());
        response.setName(resource.getName());
        response.setEmployeeNumber(resource.getEmployeeNumber());
        response.setEmail(resource.getEmail());
        response.setStatus(resource.getStatus().getDisplayName());
        response.setProjectStartDate(resource.getProjectStartDate());
        response.setProjectEndDate(resource.getProjectEndDate());
        response.setEmployeeGrade(resource.getEmployeeGrade().getDisplayName());
        response.setSkillFunction(resource.getSkillFunction().getDisplayName());
        response.setSkillSubFunction(resource.getSkillSubFunction() != null ? 
            resource.getSkillSubFunction().getDisplayName() : null);
        response.setCreatedAt(resource.getCreatedAt());
        response.setUpdatedAt(resource.getUpdatedAt());
        return response;
    }

    private Resource convertToResource(ResourceRequest request) {
        Resource resource = new Resource();
        updateResourceFromRequest(resource, request);
        return resource;
    }

    private void updateResourceFromRequest(Resource resource, ResourceRequest request) {
        resource.setName(request.getName());
        resource.setEmployeeNumber(request.getEmployeeNumber());
        resource.setEmail(request.getEmail());
        resource.setStatus(parseStatusEnum(request.getStatus()));
        resource.setProjectStartDate(request.getProjectStartDate());
        resource.setProjectEndDate(request.getProjectEndDate());
        resource.setEmployeeGrade(parseEmployeeGradeEnum(request.getEmployeeGrade()));
        resource.setSkillFunction(parseSkillFunctionEnum(request.getSkillFunction()));
        resource.setSkillSubFunction(parseSkillSubFunctionEnum(request.getSkillSubFunction()));
    }

    private StatusEnum parseStatusEnum(String status) {
        try {
            // Convert display name to enum
            for (StatusEnum statusEnum : StatusEnum.values()) {
                if (statusEnum.getDisplayName().equalsIgnoreCase(status)) {
                    return statusEnum;
                }
            }
            throw new ValidationException("Invalid status: " + status);
        } catch (Exception e) {
            throw new ValidationException("Invalid status: " + status);
        }
    }

    private EmployeeGradeEnum parseEmployeeGradeEnum(String grade) {
        try {
            // Convert display name to enum
            for (EmployeeGradeEnum gradeEnum : EmployeeGradeEnum.values()) {
                if (gradeEnum.getDisplayName().equalsIgnoreCase(grade)) {
                    return gradeEnum;
                }
            }
            throw new ValidationException("Invalid employee grade: " + grade);
        } catch (Exception e) {
            throw new ValidationException("Invalid employee grade: " + grade);
        }
    }

    private SkillFunctionEnum parseSkillFunctionEnum(String skillFunction) {
        try {
            // Convert display name to enum
            for (SkillFunctionEnum functionEnum : SkillFunctionEnum.values()) {
                if (functionEnum.getDisplayName().equalsIgnoreCase(skillFunction)) {
                    return functionEnum;
                }
            }
            throw new ValidationException("Invalid skill function: " + skillFunction);
        } catch (Exception e) {
            throw new ValidationException("Invalid skill function: " + skillFunction);
        }
    }

    private SkillSubFunctionEnum parseSkillSubFunctionEnum(String skillSubFunction) {
        if (skillSubFunction == null || skillSubFunction.trim().isEmpty()) {
            return null;
        }
        
        try {
            // Convert display name to enum
            for (SkillSubFunctionEnum subFunctionEnum : SkillSubFunctionEnum.values()) {
                if (subFunctionEnum.getDisplayName().equalsIgnoreCase(skillSubFunction)) {
                    return subFunctionEnum;
                }
            }
            throw new ValidationException("Invalid skill sub-function: " + skillSubFunction);
        } catch (Exception e) {
            throw new ValidationException("Invalid skill sub-function: " + skillSubFunction);
        }
    }

    // Excel Import/Export Helper Methods
    private ResourceImportResponse importResourcesFromExcelFile(MultipartFile file) {
        List<ResourceImportResponse.ImportError> errors = new ArrayList<>();
        List<Resource> resourcesToSave = new ArrayList<>();
        int totalProcessed = 0;
        int successful = 0;
        int failed = 0;

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // Skip header row
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                totalProcessed++;
                
                try {
                    Resource resource = parseResourceFromRow(row, i + 1);
                    
                    // Check for duplicates
                    if (resourceRepository.existsByEmployeeNumber(resource.getEmployeeNumber())) {
                        errors.add(new ResourceImportResponse.ImportError(i + 1, "Employee number already exists"));
                        failed++;
                        continue;
                    }
                    
                    if (resourceRepository.existsByEmail(resource.getEmail())) {
                        errors.add(new ResourceImportResponse.ImportError(i + 1, "Email already exists"));
                        failed++;
                        continue;
                    }
                    
                    resourcesToSave.add(resource);
                    successful++;
                    
                } catch (Exception e) {
                    errors.add(new ResourceImportResponse.ImportError(i + 1, e.getMessage()));
                    failed++;
                }
            }
            
            // Save all valid resources
            for (Resource resource : resourcesToSave) {
                resourceRepository.save(resource);
            }
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to process Excel file: " + e.getMessage(), e);
        }
        
        return new ResourceImportResponse(totalProcessed, successful, failed, errors);
    }

    private Resource parseResourceFromRow(Row row, int rowNumber) {
        Resource resource = new Resource();
        
        try {
            // Name
            String name = getCellStringValue(row.getCell(0));
            if (name == null || name.trim().isEmpty()) {
                throw new ValidationException("Name is required");
            }
            resource.setName(name.trim());
            
            // Employee Number
            String employeeNumber = getCellStringValue(row.getCell(1));
            if (employeeNumber == null || employeeNumber.length() != 8) {
                throw new ValidationException("Employee number must be exactly 8 characters");
            }
            resource.setEmployeeNumber(employeeNumber);
            
            // Email
            String email = getCellStringValue(row.getCell(2));
            if (email == null || !email.contains("@")) {
                throw new ValidationException("Invalid email address");
            }
            resource.setEmail(email);
            
            // Status
            String status = getCellStringValue(row.getCell(3));
            resource.setStatus(parseStatusEnum(status));
            
            // Project Start Date
            String startDateStr = getCellStringValue(row.getCell(4));
            if (startDateStr == null || startDateStr.trim().isEmpty()) {
                throw new ValidationException("Project start date is required");
            }
            resource.setProjectStartDate(parseDate(startDateStr));
            
            // Project End Date (optional)
            String endDateStr = getCellStringValue(row.getCell(5));
            if (endDateStr != null && !endDateStr.trim().isEmpty()) {
                resource.setProjectEndDate(parseDate(endDateStr));
            }
            
            // Employee Grade
            String grade = getCellStringValue(row.getCell(6));
            resource.setEmployeeGrade(parseEmployeeGradeEnum(grade));
            
            // Skill Function
            String skillFunction = getCellStringValue(row.getCell(7));
            resource.setSkillFunction(parseSkillFunctionEnum(skillFunction));
            
            // Skill Sub-function (optional)
            String skillSubFunction = getCellStringValue(row.getCell(8));
            resource.setSkillSubFunction(parseSkillSubFunctionEnum(skillSubFunction));
            
        } catch (Exception e) {
            throw new ValidationException("Row " + rowNumber + ": " + e.getMessage());
        }
        
        return resource;
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return null;
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().toString();
                } else {
                    return String.valueOf((long) cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getStringCellValue();
            default:
                return null;
        }
    }

    private LocalDate parseDate(String dateStr) {
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e) {
            try {
                return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("MM/dd/yyyy"));
            } catch (DateTimeParseException e2) {
                try {
                    return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                } catch (DateTimeParseException e3) {
                    throw new ValidationException("Invalid date format: " + dateStr + ". Expected format: YYYY-MM-DD, MM/dd/yyyy, or dd/MM/yyyy");
                }
            }
        }
    }

    private byte[] generateExcelExport() {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Resources");
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            createHeaderRow(headerRow);
            
            // Get all resources
            List<Resource> resources = resourceRepository.findAll();
            
            // Create data rows
            int rowIndex = 1;
            for (Resource resource : resources) {
                Row dataRow = sheet.createRow(rowIndex++);
                populateDataRow(dataRow, resource);
            }
            
            // Auto-size columns
            for (int i = 0; i < 9; i++) {
                sheet.autoSizeColumn(i);
            }
            
            // Convert to byte array
            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                workbook.write(baos);
                return baos.toByteArray();
            }
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file: " + e.getMessage(), e);
        }
    }

    private void createHeaderRow(Row headerRow) {
        headerRow.createCell(0).setCellValue("Name");
        headerRow.createCell(1).setCellValue("Employee Number");
        headerRow.createCell(2).setCellValue("Email");
        headerRow.createCell(3).setCellValue("Status");
        headerRow.createCell(4).setCellValue("Project Start Date");
        headerRow.createCell(5).setCellValue("Project End Date");
        headerRow.createCell(6).setCellValue("Employee Grade");
        headerRow.createCell(7).setCellValue("Skill Function");
        headerRow.createCell(8).setCellValue("Skill Sub-function");
        
        // Style header row
        CellStyle headerStyle = headerRow.getSheet().getWorkbook().createCellStyle();
        Font headerFont = headerRow.getSheet().getWorkbook().createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        
        for (int i = 0; i < 9; i++) {
            headerRow.getCell(i).setCellStyle(headerStyle);
        }
    }

    private void populateDataRow(Row dataRow, Resource resource) {
        dataRow.createCell(0).setCellValue(resource.getName());
        dataRow.createCell(1).setCellValue(resource.getEmployeeNumber());
        dataRow.createCell(2).setCellValue(resource.getEmail());
        dataRow.createCell(3).setCellValue(resource.getStatus().getDisplayName());
        dataRow.createCell(4).setCellValue(resource.getProjectStartDate().toString());
        
        Cell endDateCell = dataRow.createCell(5);
        if (resource.getProjectEndDate() != null) {
            endDateCell.setCellValue(resource.getProjectEndDate().toString());
        } else {
            endDateCell.setCellValue("");
        }
        
        dataRow.createCell(6).setCellValue(resource.getEmployeeGrade().getDisplayName());
        dataRow.createCell(7).setCellValue(resource.getSkillFunction().getDisplayName());
        
        Cell subFunctionCell = dataRow.createCell(8);
        if (resource.getSkillSubFunction() != null) {
            subFunctionCell.setCellValue(resource.getSkillSubFunction().getDisplayName());
        } else {
            subFunctionCell.setCellValue("");
        }
    }

    @Override
    public int updateExpiredResourcesStatus() {
        LocalDate currentDate = LocalDate.now();
        List<Resource> expiredResources = resourceRepository.findActiveResourcesWithPastEndDates(StatusEnum.ACTIVE, currentDate);
        
        int updatedCount = 0;
        for (Resource resource : expiredResources) {
            resource.setStatus(StatusEnum.INACTIVE);
            resourceRepository.save(resource);
            updatedCount++;
        }
        
        return updatedCount;
    }
}