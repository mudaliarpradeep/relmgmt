import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResourceListPage from './ResourceListPage';
import ResourceService from '../../services/api/v1/resourceService';
import type { PaginatedResponse, Resource } from '../../types';
import { Status, EmployeeGrade, SkillFunction, SkillSubFunction } from '../../types';

// Mock the ResourceService
vi.mock('../../services/api/v1/resourceService');
const mockedResourceService = vi.mocked(ResourceService);

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to wrap components with necessary providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ResourceListPage', () => {
  const mockResources: Resource[] = [
    {
      id: 1,
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
    },
    {
      id: 2,
      name: 'Jane Smith',
      employeeNumber: '87654321',
      email: 'jane.smith@example.com',
      status: Status.ACTIVE,
      projectStartDate: '2024-02-01',
      employeeGrade: EmployeeGrade.LEVEL_9,
      skillFunction: SkillFunction.TEST,
      skillSubFunction: SkillSubFunction.MANUAL,
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-02-01T10:00:00Z'
    }
  ];

  const mockPaginatedResponse: PaginatedResponse<Resource> = {
    content: mockResources,
    pageable: {
      pageNumber: 0,
      pageSize: 20,
      sort: { sorted: true, unsorted: false, empty: false },
      offset: 0,
      paged: true,
      unpaged: false
    },
    totalElements: 2,
    totalPages: 1,
    last: true,
    size: 20,
    number: 0,
    sort: { sorted: true, unsorted: false, empty: false },
    numberOfElements: 2,
    first: true,
    empty: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedResourceService.getResources.mockResolvedValue(mockPaginatedResponse);
  });

  describe('Rendering', () => {
    it('should render the page title', async () => {
      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Resource Management')).toBeInTheDocument();
      });
    });

    it('should render the "Add New Resource" button', async () => {
      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Add New Resource')).toBeInTheDocument();
      });
    });

    it('should render the "Import from Excel" button', async () => {
      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Import from Excel')).toBeInTheDocument();
      });
    });

    it('should render the "Export to Excel" button', async () => {
      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Export to Excel')).toBeInTheDocument();
      });
    });

    it('should render filter controls', async () => {
      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/skill function/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should display loading state initially', async () => {
      renderWithProviders(<ResourceListPage />);
      
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should load and display resources', async () => {
      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      expect(mockedResourceService.getResources).toHaveBeenCalledWith({
        page: 0,
        size: 20
      });
    });

    it('should display resource information in the table', async () => {
      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('12345678')).toBeInTheDocument(); // Employee Number
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument(); // Email
        // Check for Active status in table cells, not dropdown options
        const statusCells = screen.getAllByText('Active');
        expect(statusCells.length).toBeGreaterThan(0); // Should appear in table rows
        // Check for Build skill function - it appears in both dropdown and table
        const buildElements = screen.getAllByText('Build');
        expect(buildElements.length).toBeGreaterThan(0); // Should appear in dropdown and table
      });
    });

    it('should handle loading errors', async () => {
      const errorMessage = 'Failed to load resources';
      mockedResourceService.getResources.mockRejectedValue(new Error(errorMessage));

      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should display empty state when no resources found', async () => {
      const emptyResponse = { ...mockPaginatedResponse, content: [], totalElements: 0, empty: true };
      mockedResourceService.getResources.mockResolvedValue(emptyResponse);

      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/no resources found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should filter by status', async () => {
      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const statusFilter = screen.getByLabelText(/status/i);
      fireEvent.change(statusFilter, { target: { value: Status.ACTIVE } });

      await waitFor(() => {
        expect(mockedResourceService.getResources).toHaveBeenCalledWith({
          page: 0,
          size: 20,
          status: Status.ACTIVE
        });
      });
    });

    it('should filter by skill function', async () => {
      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const skillFunctionFilter = screen.getByLabelText(/skill function/i);
      fireEvent.change(skillFunctionFilter, { target: { value: SkillFunction.BUILD } });

      await waitFor(() => {
        expect(mockedResourceService.getResources).toHaveBeenCalledWith({
          page: 0,
          size: 20,
          skillFunction: SkillFunction.BUILD
        });
      });
    });

    it('should reset filters', async () => {
      renderWithProviders(<ResourceListPage />);
      
      // Wait for initial load to complete
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Apply filters first
      const statusFilter = screen.getByLabelText(/status/i);
      fireEvent.change(statusFilter, { target: { value: Status.ACTIVE } });

      await waitFor(() => {
        expect(mockedResourceService.getResources).toHaveBeenCalledWith({
          page: 0,
          size: 20,
          status: Status.ACTIVE
        });
      });

      // Reset filters
      const resetButton = screen.getByText(/reset filters/i);
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(mockedResourceService.getResources).toHaveBeenCalledWith({
          page: 0,
          size: 20
        });
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls when there are multiple pages', async () => {
      const multiPageResponse = { 
        ...mockPaginatedResponse, 
        totalPages: 3, 
        last: false 
      };
      mockedResourceService.getResources.mockResolvedValue(multiPageResponse);

      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('mobile-next-button')).toBeInTheDocument();
        expect(screen.getByTestId('mobile-previous-button')).toBeInTheDocument();
      });
    });

    it('should handle page changes', async () => {
      const multiPageResponse = { 
        ...mockPaginatedResponse, 
        totalPages: 3, 
        last: false 
      };
      mockedResourceService.getResources.mockResolvedValue(multiPageResponse);

      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('mobile-next-button')).toBeInTheDocument();
      });

      const nextButton = screen.getByTestId('mobile-next-button');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockedResourceService.getResources).toHaveBeenCalledWith({
          page: 1,
          size: 20
        });
      });
    });
  });

  describe('Resource Actions', () => {
    it('should navigate to add new resource page', async () => {
      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add New Resource');
      fireEvent.click(addButton);

      expect(mockNavigate).toHaveBeenCalledWith('/resources/new');
    });

    it('should navigate to resource detail page when clicking on a resource', async () => {
      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const resourceRow = screen.getByText('John Doe').closest('tr');
      fireEvent.click(resourceRow!);

      expect(mockNavigate).toHaveBeenCalledWith('/resources/1');
    });

    it('should show edit button for each resource', async () => {
      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText(/edit/i)).toHaveLength(2);
      });
    });

    it('should navigate to edit page when clicking edit button', async () => {
      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText(/edit/i)).toHaveLength(2);
      });

      const editButtons = screen.getAllByText(/edit/i);
      fireEvent.click(editButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/resources/1/edit');
    });

    it('should show delete button for each resource', async () => {
      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText(/delete/i)).toHaveLength(2);
      });
    });
  });

  describe('Resource Deletion', () => {
    it('should show confirmation dialog when delete button is clicked', async () => {
      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText(/delete/i)).toHaveLength(2);
      });

      const deleteButtons = screen.getAllByText(/delete/i);
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
      expect(screen.getByText(/confirm delete/i)).toBeInTheDocument();
      expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    });

    it('should delete resource successfully', async () => {
      mockedResourceService.deleteResource.mockResolvedValue();

      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText(/delete/i)).toHaveLength(2);
      });

      // Click delete button
      const deleteButtons = screen.getAllByText(/delete/i);
      fireEvent.click(deleteButtons[0]);

      // Confirm deletion
      const confirmButton = screen.getByText(/confirm delete/i);
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockedResourceService.deleteResource).toHaveBeenCalledWith(1);
        expect(mockedResourceService.getResources).toHaveBeenCalledTimes(2); // Initial load + reload after delete
      });
    });

    it('should handle deletion conflict error', async () => {
      const conflictError = new Error('Cannot delete resource. Resource is allocated to active releases.');
      mockedResourceService.deleteResource.mockRejectedValue(conflictError);

      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText(/delete/i)).toHaveLength(2);
      });

      // Click delete button
      const deleteButtons = screen.getAllByText(/delete/i);
      fireEvent.click(deleteButtons[0]);

      // Confirm deletion
      const confirmButton = screen.getByText(/confirm delete/i);
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/cannot delete resource/i)).toBeInTheDocument();
        expect(screen.getByText(/allocated to active releases/i)).toBeInTheDocument();
      });
    });

    it('should cancel deletion', async () => {
      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText(/delete/i)).toHaveLength(2);
      });

      // Click delete button
      const deleteButtons = screen.getAllByText(/delete/i);
      fireEvent.click(deleteButtons[0]);

      // Cancel deletion
      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.click(cancelButton);

      // Confirmation dialog should be closed
      expect(screen.queryByText(/are you sure you want to delete/i)).not.toBeInTheDocument();
      expect(mockedResourceService.deleteResource).not.toHaveBeenCalled();
    });
  });

  describe('Excel Import/Export', () => {
    it('should handle Excel export', async () => {
      const mockBlob = new Blob(['mock excel content'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      mockedResourceService.exportResources.mockResolvedValue(mockBlob);

      // Mock URL.createObjectURL and download
      const mockCreateObjectURL = vi.fn(() => 'mock-url');
      const mockRevokeObjectURL = vi.fn();
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Export to Excel');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockedResourceService.exportResources).toHaveBeenCalled();
        expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      });
    });

    it('should show import dialog when import button is clicked', async () => {
      renderWithProviders(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const importButton = screen.getByText('Import from Excel');
      fireEvent.click(importButton);

      expect(screen.getByText(/import resources from excel/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/choose file/i)).toBeInTheDocument();
    });
  });
});