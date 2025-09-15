package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.ResourceImportResponse;
import com.polycoder.relmgmt.entity.Resource;
import com.polycoder.relmgmt.entity.StatusEnum;
import com.polycoder.relmgmt.entity.EmployeeGradeEnum;
import com.polycoder.relmgmt.entity.SkillFunctionEnum;
import com.polycoder.relmgmt.entity.SkillSubFunctionEnum;
import com.polycoder.relmgmt.repository.ResourceRepository;
import com.polycoder.relmgmt.service.impl.ResourceServiceImpl;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceExcelServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceServiceImpl resourceService;

    private Resource testResource1;
    private Resource testResource2;

    @BeforeEach
    void setUp() {
        testResource1 = new Resource();
        testResource1.setId(1L);
        testResource1.setName("John Doe");
        testResource1.setEmployeeNumber("12345678");
        testResource1.setEmail("john.doe@example.com");
        testResource1.setStatus(StatusEnum.ACTIVE);
        testResource1.setProjectStartDate(LocalDate.of(2024, 1, 15));
        testResource1.setProjectEndDate(LocalDate.of(2024, 12, 31));
        testResource1.setEmployeeGrade(EmployeeGradeEnum.LEVEL_8);
        testResource1.setSkillFunction(SkillFunctionEnum.BUILD);
        testResource1.setSkillSubFunction(SkillSubFunctionEnum.FORGEROCK_IDM);

        testResource2 = new Resource();
        testResource2.setId(2L);
        testResource2.setName("Jane Smith");
        testResource2.setEmployeeNumber("87654321");
        testResource2.setEmail("jane.smith@example.com");
        testResource2.setStatus(StatusEnum.ACTIVE);
        testResource2.setProjectStartDate(LocalDate.of(2024, 2, 1));
        testResource2.setProjectEndDate(LocalDate.of(2024, 11, 30));
        testResource2.setEmployeeGrade(EmployeeGradeEnum.LEVEL_9);
        testResource2.setSkillFunction(SkillFunctionEnum.TEST);
        testResource2.setSkillSubFunction(SkillSubFunctionEnum.MANUAL);
    }

    @Test
    void testExportResourcesToExcel() throws IOException {
        // Arrange
        List<Resource> resources = Arrays.asList(testResource1, testResource2);
        when(resourceRepository.findAll()).thenReturn(resources);

        // Act
        byte[] excelData = resourceService.exportResourcesToExcel();

        // Assert
        assertNotNull(excelData);
        assertTrue(excelData.length > 0);

        // Verify Excel content
        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(excelData))) {
            Sheet sheet = workbook.getSheetAt(0);
            assertNotNull(sheet);
            assertEquals("Resources", sheet.getSheetName());

            // Check header row
            Row headerRow = sheet.getRow(0);
            assertNotNull(headerRow);
            assertEquals("Name", headerRow.getCell(0).getStringCellValue());
            assertEquals("Employee Number", headerRow.getCell(1).getStringCellValue());
            assertEquals("Email", headerRow.getCell(2).getStringCellValue());
            assertEquals("Status", headerRow.getCell(3).getStringCellValue());
            assertEquals("Project Start Date", headerRow.getCell(4).getStringCellValue());
            assertEquals("Project End Date", headerRow.getCell(5).getStringCellValue());
            assertEquals("Employee Grade", headerRow.getCell(6).getStringCellValue());
            assertEquals("Skill Function", headerRow.getCell(7).getStringCellValue());
            assertEquals("Skill Sub-function", headerRow.getCell(8).getStringCellValue());

            // Check first data row
            Row dataRow1 = sheet.getRow(1);
            assertNotNull(dataRow1);
            assertEquals("John Doe", dataRow1.getCell(0).getStringCellValue());
            assertEquals("12345678", dataRow1.getCell(1).getStringCellValue());
            assertEquals("john.doe@example.com", dataRow1.getCell(2).getStringCellValue());
            assertEquals("Active", dataRow1.getCell(3).getStringCellValue());
            assertEquals("Build", dataRow1.getCell(7).getStringCellValue());
            assertEquals("ForgeRock IDM", dataRow1.getCell(8).getStringCellValue());

            // Check second data row
            Row dataRow2 = sheet.getRow(2);
            assertNotNull(dataRow2);
            assertEquals("Jane Smith", dataRow2.getCell(0).getStringCellValue());
            assertEquals("87654321", dataRow2.getCell(1).getStringCellValue());
            assertEquals("jane.smith@example.com", dataRow2.getCell(2).getStringCellValue());
            assertEquals("Test", dataRow2.getCell(7).getStringCellValue());
            assertEquals("Manual", dataRow2.getCell(8).getStringCellValue());
        }

        verify(resourceRepository).findAll();
    }

    @Test
    void testImportResourcesFromExcelSuccess() throws IOException {
        // Arrange
        byte[] excelData = createValidExcelFile();
        MockMultipartFile file = new MockMultipartFile("file", "resources.xlsx", 
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelData);

        when(resourceRepository.existsByEmployeeNumber(anyString())).thenReturn(false);
        when(resourceRepository.existsByEmail(anyString())).thenReturn(false);
        when(resourceRepository.save(any(Resource.class))).thenReturn(testResource1);

        // Act
        ResourceImportResponse response = resourceService.importResourcesFromExcel(file);

        // Assert
        assertNotNull(response);
        assertEquals(2, response.getTotalProcessed());
        assertEquals(2, response.getSuccessful());
        assertEquals(0, response.getFailed());
        assertTrue(response.getErrors().isEmpty());

        verify(resourceRepository, times(2)).save(any(Resource.class));
    }

    @Test
    void testImportResourcesFromExcelWithErrors() throws IOException {
        // Arrange
        byte[] excelData = createInvalidExcelFile();
        MockMultipartFile file = new MockMultipartFile("file", "resources.xlsx", 
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelData);

        // Act
        ResourceImportResponse response = resourceService.importResourcesFromExcel(file);

        // Assert
        assertNotNull(response);
        assertEquals(2, response.getTotalProcessed());
        assertEquals(0, response.getSuccessful());
        assertEquals(2, response.getFailed());
        assertEquals(2, response.getErrors().size());

        verify(resourceRepository, never()).save(any(Resource.class));
    }

    @Test
    void testImportResourcesFromExcelWithDuplicates() throws IOException {
        // Arrange
        byte[] excelData = createValidExcelFile();
        MockMultipartFile file = new MockMultipartFile("file", "resources.xlsx", 
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelData);

        when(resourceRepository.existsByEmployeeNumber("12345678")).thenReturn(true);
        when(resourceRepository.existsByEmployeeNumber("87654321")).thenReturn(false);
        when(resourceRepository.existsByEmail(anyString())).thenReturn(false);
        when(resourceRepository.save(any(Resource.class))).thenReturn(testResource2);

        // Act
        ResourceImportResponse response = resourceService.importResourcesFromExcel(file);

        // Assert
        assertNotNull(response);
        assertEquals(2, response.getTotalProcessed());
        assertEquals(1, response.getSuccessful());
        assertEquals(1, response.getFailed());
        assertEquals(1, response.getErrors().size());
        assertEquals("Employee number already exists", response.getErrors().get(0).getMessage());

        verify(resourceRepository, times(1)).save(any(Resource.class));
    }

    @Test
    void testImportResourcesFromInvalidFile() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile("file", "resources.txt", 
            "text/plain", "invalid content".getBytes());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> resourceService.importResourcesFromExcel(file));
    }

    @Test
    void testImportResourcesFromEmptyFile() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile("file", "resources.xlsx", 
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", new byte[0]);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> resourceService.importResourcesFromExcel(file));
    }

    @Test
    void testExportResourcesWhenNoResources() {
        // Arrange
        when(resourceRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        byte[] excelData = resourceService.exportResourcesToExcel();

        // Assert
        assertNotNull(excelData);
        assertTrue(excelData.length > 0);

        verify(resourceRepository).findAll();
    }

    // Helper methods
    private byte[] createValidExcelFile() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Resources");

            // Create header row
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Name");
            headerRow.createCell(1).setCellValue("Employee Number");
            headerRow.createCell(2).setCellValue("Email");
            headerRow.createCell(3).setCellValue("Status");
            headerRow.createCell(4).setCellValue("Project Start Date");
            headerRow.createCell(5).setCellValue("Project End Date");
            headerRow.createCell(6).setCellValue("Employee Grade");
            headerRow.createCell(7).setCellValue("Skill Function");
            headerRow.createCell(8).setCellValue("Skill Sub-function");

            // Create data rows
            Row dataRow1 = sheet.createRow(1);
            dataRow1.createCell(0).setCellValue("John Doe");
            dataRow1.createCell(1).setCellValue("12345678");
            dataRow1.createCell(2).setCellValue("john.doe@example.com");
            dataRow1.createCell(3).setCellValue("Active");
            dataRow1.createCell(4).setCellValue("2024-01-15");
            dataRow1.createCell(5).setCellValue("2024-12-31");
            dataRow1.createCell(6).setCellValue("Level 8");
            dataRow1.createCell(7).setCellValue("Build");
            dataRow1.createCell(8).setCellValue("ForgeRock IDM");

            Row dataRow2 = sheet.createRow(2);
            dataRow2.createCell(0).setCellValue("Jane Smith");
            dataRow2.createCell(1).setCellValue("87654321");
            dataRow2.createCell(2).setCellValue("jane.smith@example.com");
            dataRow2.createCell(3).setCellValue("Active");
            dataRow2.createCell(4).setCellValue("2024-02-01");
            dataRow2.createCell(5).setCellValue("2024-11-30");
            dataRow2.createCell(6).setCellValue("Level 9");
            dataRow2.createCell(7).setCellValue("Test");
            dataRow2.createCell(8).setCellValue("Manual");

            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                workbook.write(baos);
                return baos.toByteArray();
            }
        }
    }

    private byte[] createInvalidExcelFile() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Resources");

            // Create header row
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Name");
            headerRow.createCell(1).setCellValue("Employee Number");
            headerRow.createCell(2).setCellValue("Email");
            headerRow.createCell(3).setCellValue("Status");
            headerRow.createCell(4).setCellValue("Project Start Date");
            headerRow.createCell(5).setCellValue("Project End Date");
            headerRow.createCell(6).setCellValue("Employee Grade");
            headerRow.createCell(7).setCellValue("Skill Function");
            headerRow.createCell(8).setCellValue("Skill Sub-function");

            // Create invalid data rows
            Row dataRow1 = sheet.createRow(1);
            dataRow1.createCell(0).setCellValue(""); // Invalid empty name
            dataRow1.createCell(1).setCellValue("123"); // Invalid employee number (too short)
            dataRow1.createCell(2).setCellValue("invalid-email"); // Invalid email
            dataRow1.createCell(3).setCellValue("InvalidStatus");
            dataRow1.createCell(4).setCellValue("invalid-date");
            dataRow1.createCell(5).setCellValue("");
            dataRow1.createCell(6).setCellValue("Invalid Grade");
            dataRow1.createCell(7).setCellValue("Invalid Function");
            dataRow1.createCell(8).setCellValue("");

            Row dataRow2 = sheet.createRow(2);
            dataRow2.createCell(0).setCellValue("Valid Name");
            dataRow2.createCell(1).setCellValue("12345678901"); // Invalid employee number (too long)
            dataRow2.createCell(2).setCellValue("test@example.com");
            dataRow2.createCell(3).setCellValue("Active");
            dataRow2.createCell(4).setCellValue("2024-01-15");
            dataRow2.createCell(5).setCellValue("2024-12-31");
            dataRow2.createCell(6).setCellValue("Level 8");
            dataRow2.createCell(7).setCellValue("Build");
            dataRow2.createCell(8).setCellValue("ForgeRock IDM");

            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                workbook.write(baos);
                return baos.toByteArray();
            }
        }
    }
}