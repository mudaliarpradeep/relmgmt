import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResourceService from './resourceService';
import apiClient from '../apiClient';
import type { 
  Resource, 
  ResourceRequest, 
  ResourceFilters, 
  PaginatedResponse, 
  ResourceImportResponse,
  StatusEnum,
  EmployeeGradeEnum,
  SkillFunctionEnum,
  SkillSubFunctionEnum
} from '../../../types';
import { Status, EmployeeGrade, SkillFunction, SkillSubFunction } from '../../../types';

// Mock the API client
vi.mock('../apiClient');
const mockedApiClient = vi.mocked(apiClient);

describe('ResourceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to create mock resource
  const createMockResource = (id: number = 1): Resource => ({
    id,
    name: 'John Doe',
    employeeNumber: '12345678',
    email: 'john.doe@example.com',
    status: Status.ACTIVE,
    projectStartDate: '2024-01-15',
    projectEndDate: '2024-12-31',
    employeeGrade: EmployeeGrade.LEVEL_8,
    skillFunction: SkillFunction.BUILD,
    skillSubFunction: SkillSubFunction.FORGEROCK_IDM,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  });

  const createMockPaginatedResponse = (resources: Resource[]): PaginatedResponse<Resource> => ({
    content: resources,
    pageable: {
      pageNumber: 0,
      pageSize: 20,
      sort: { sorted: true, unsorted: false, empty: false },
      offset: 0,
      paged: true,
      unpaged: false
    },
    totalElements: resources.length,
    totalPages: 1,
    last: true,
    size: 20,
    number: 0,
    sort: { sorted: true, unsorted: false, empty: false },
    numberOfElements: resources.length,
    first: true,
    empty: resources.length === 0
  });

  describe('getResources', () => {
    it('should fetch resources without filters', async () => {
      const mockResource = createMockResource();
      const mockResponse = createMockPaginatedResponse([mockResource]);
      
      mockedApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await ResourceService.getResources();

      expect(result.content).toHaveLength(1);
      expect(result.content[0].name).toBe('John Doe');
      expect(result.totalElements).toBe(1);
      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/resources?');
    });

    it('should fetch resources with filters', async () => {
      const mockResource = createMockResource();
      const mockResponse = createMockPaginatedResponse([mockResource]);
      
      mockedApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const filters: ResourceFilters = {
        status: Status.ACTIVE,
        skillFunction: SkillFunction.BUILD,
        page: 0,
        size: 10
      };

      const result = await ResourceService.getResources(filters);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].status).toBe(Status.ACTIVE);
      expect(result.content[0].skillFunction).toBe(SkillFunction.BUILD);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/v1/resources?status=ACTIVE&skillFunction=BUILD&page=0&size=10'
      );
    });

    it('should handle pagination parameters correctly', async () => {
      const mockResponse = createMockPaginatedResponse([]);
      mockResponse.pageable.pageNumber = 1;
      mockResponse.pageable.pageSize = 5;
      
      mockedApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const filters: ResourceFilters = {
        page: 1,
        size: 5
      };

      const result = await ResourceService.getResources(filters);

      expect(result.pageable.pageNumber).toBe(1);
      expect(result.pageable.pageSize).toBe(5);
      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/resources?page=1&size=5');
    });
  });

  describe('getResource', () => {
    it('should fetch resource by id', async () => {
      const mockResource = createMockResource();
      mockedApiClient.get.mockResolvedValueOnce({ data: mockResource });

      const resource = await ResourceService.getResource(1);

      expect(resource.id).toBe(1);
      expect(resource.name).toBe('John Doe');
      expect(resource.employeeNumber).toBe('12345678');
      expect(resource.email).toBe('john.doe@example.com');
      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/resources/1');
    });

    it('should throw error when resource not found', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { message: 'Resource not found' }
        }
      };
      mockedApiClient.get.mockRejectedValueOnce(errorResponse);

      await expect(ResourceService.getResource(999)).rejects.toThrow('Resource not found');
      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/resources/999');
    });
  });

  describe('createResource', () => {
    it('should create a new resource', async () => {
      const resourceRequest: ResourceRequest = {
        name: 'Jane Smith',
        employeeNumber: '87654321',
        email: 'jane.smith@example.com',
        status: Status.ACTIVE,
        projectStartDate: '2024-02-01',
        employeeGrade: EmployeeGrade.LEVEL_9,
        skillFunction: SkillFunction.TEST,
        skillSubFunction: SkillSubFunction.MANUAL
      };

      const mockResource = {
        id: 2,
        ...resourceRequest,
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-02-01T10:00:00Z'
      };
      
      mockedApiClient.post.mockResolvedValueOnce({ data: mockResource });

      const resource = await ResourceService.createResource(resourceRequest);

      expect(resource.id).toBe(2);
      expect(resource.name).toBe('Jane Smith');
      expect(resource.employeeNumber).toBe('87654321');
      expect(resource.status).toBe(Status.ACTIVE);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/v1/resources', resourceRequest);
    });
  });

  describe('updateResource', () => {
    it('should update an existing resource', async () => {
      const resourceRequest: ResourceRequest = {
        name: 'John Doe Updated',
        employeeNumber: '12345678',
        email: 'john.doe.updated@example.com',
        status: Status.ACTIVE,
        projectStartDate: '2024-01-15',
        projectEndDate: '2024-12-31',
        employeeGrade: EmployeeGrade.LEVEL_8,
        skillFunction: SkillFunction.BUILD,
        skillSubFunction: SkillSubFunction.FORGEROCK_IDM
      };

      const mockResource = {
        id: 1,
        ...resourceRequest,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-06-01T12:00:00Z'
      };
      
      mockedApiClient.put.mockResolvedValueOnce({ data: mockResource });

      const resource = await ResourceService.updateResource(1, resourceRequest);

      expect(resource.id).toBe(1);
      expect(resource.name).toBe('John Doe Updated');
      expect(resource.email).toBe('john.doe.updated@example.com');
      expect(mockedApiClient.put).toHaveBeenCalledWith('/v1/resources/1', resourceRequest);
    });
  });

  describe('deleteResource', () => {
    it('should delete resource successfully', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({ data: null });

      await expect(ResourceService.deleteResource(1)).resolves.not.toThrow();
      expect(mockedApiClient.delete).toHaveBeenCalledWith('/v1/resources/1');
    });

    it('should handle conflict when resource is allocated to active release', async () => {
      const errorResponse = {
        response: {
          status: 409,
          data: {
            message: 'Cannot delete resource. Resource is allocated to active releases.',
            details: ['Resource is allocated to Release R24Q1 (Production Go-Live: 2024-09-15)']
          }
        }
      };
      mockedApiClient.delete.mockRejectedValueOnce(errorResponse);

      await expect(ResourceService.deleteResource(2)).rejects.toThrow(
        'Cannot delete resource. Resource is allocated to active releases.'
      );
      expect(mockedApiClient.delete).toHaveBeenCalledWith('/v1/resources/2');
    });
  });

  describe('importResources', () => {
    it('should import resources from Excel file', async () => {
      const mockFile = new File(['mock content'], 'resources.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const importResponse: ResourceImportResponse = {
        totalProcessed: 10,
        successful: 8,
        failed: 2,
        errors: [
          { row: 3, message: 'Invalid email format' },
          { row: 7, message: 'Employee number must be 8 digits' }
        ]
      };
      
      mockedApiClient.post.mockResolvedValueOnce({ data: importResponse });

      const result = await ResourceService.importResources(mockFile);

      expect(result.totalProcessed).toBe(10);
      expect(result.successful).toBe(8);
      expect(result.failed).toBe(2);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].row).toBe(3);
      expect(result.errors[0].message).toBe('Invalid email format');
      
      const formData = new FormData();
      formData.append('file', mockFile);
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/v1/resources/import',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    });
  });

  describe('exportResources', () => {
    it('should export resources to Excel file', async () => {
      const excelContent = new Uint8Array([80, 75, 3, 4, 20, 0, 0, 0, 8, 0]);
      mockedApiClient.get.mockResolvedValueOnce({ data: excelContent });

      const result = await ResourceService.exportResources();

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/resources/export', {
        responseType: 'blob'
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };
      mockedApiClient.get.mockRejectedValueOnce(errorResponse);

      await expect(ResourceService.getResource(1)).rejects.toThrow('Internal server error');
    });

    it('should handle network errors', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(ResourceService.getResource(1)).rejects.toThrow('Network error');
    });

    it('should handle different status codes correctly', async () => {
      // Test 404 error
      const notFoundError = {
        response: { status: 404, data: {} }
      };
      mockedApiClient.get.mockRejectedValueOnce(notFoundError);

      await expect(ResourceService.getResource(1)).rejects.toThrow('Resource not found');
    });
  });
});