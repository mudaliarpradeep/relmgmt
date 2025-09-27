import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../../test/test-utils';
import ResourceListPage from './ResourceListPage';
import ResourceService from '../../services/api/v1/resourceService';
import type { PaginatedResponse, Resource } from '../../services/api/sharedTypes';
import { Status, EmployeeGrade, SkillFunction, SkillSubFunction } from '../../services/api/sharedTypes';

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
      renderWithRouter(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Resource Management')).toBeInTheDocument();
      });
    });

    it('should render the "Add New Resource" button', async () => {
      renderWithRouter(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Add New Resource')).toBeInTheDocument();
      });
    });

    it('should render the "Import from Excel" button', async () => {
      renderWithRouter(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Import from Excel')).toBeInTheDocument();
      });
    });

    it('should render the "Export to Excel" button', async () => {
      renderWithRouter(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Export to Excel')).toBeInTheDocument();
      });
    });

    it('should render filters section', async () => {
      renderWithRouter(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Filters')).toBeInTheDocument();
        expect(screen.getByLabelText('Status')).toBeInTheDocument();
        expect(screen.getByLabelText('Skill Function')).toBeInTheDocument();
        expect(screen.getByText('Reset Filters')).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should display loading state initially', async () => {
      renderWithRouter(<ResourceListPage />);
      
      // Should show loading initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      
      // Should load resources after initial load
      await waitFor(() => {
        expect(screen.getAllByText('John Doe')).toHaveLength(2); // Table + Mobile card
      });
    });

    it('should display resources after loading', async () => {
      renderWithRouter(<ResourceListPage />);
      
      await waitFor(() => {
        // Check for both table and mobile card views
        const johnDoeElements = screen.getAllByText('John Doe');
        expect(johnDoeElements).toHaveLength(2); // One in table, one in mobile card
        
        const janeSmithElements = screen.getAllByText('Jane Smith');
        expect(janeSmithElements).toHaveLength(2); // One in table, one in mobile card
      });
    });

    it('should handle loading error', async () => {
      const error = new Error('Failed to fetch resources');
      mockedResourceService.getResources.mockRejectedValue(error);

      renderWithRouter(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch resources')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should filter by status', async () => {
      renderWithRouter(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText('John Doe')).toHaveLength(2);
      });

      const statusFilter = screen.getByLabelText('Status');
      fireEvent.change(statusFilter, { target: { value: 'Active' } });

      await waitFor(() => {
        // The service should be called with the display name, which gets converted to enum name
        expect(mockedResourceService.getResources).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'Active'
          })
        );
      });
    });

    it('should filter by skill function', async () => {
      renderWithRouter(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText('John Doe')).toHaveLength(2);
      });

      const skillFunctionFilter = screen.getByLabelText('Skill Function');
      fireEvent.change(skillFunctionFilter, { target: { value: 'Build' } });

      await waitFor(() => {
        // The service should be called with the display name, which gets converted to enum name
        expect(mockedResourceService.getResources).toHaveBeenCalledWith(
          expect.objectContaining({
            skillFunction: 'Build'
          })
        );
      });
    });

    it('should reset filters', async () => {
      renderWithRouter(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText('John Doe')).toHaveLength(2);
      });

      const resetButton = screen.getByText('Reset Filters');
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(mockedResourceService.getResources).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 0,
            size: 15
          })
        );
      });
    });
  });

  describe('Resource Actions', () => {
    it('should navigate to add resource page', async () => {
      renderWithRouter(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText('John Doe')).toHaveLength(2);
      });

      const addButton = screen.getByText('Add New Resource');
      fireEvent.click(addButton);

      expect(mockNavigate).toHaveBeenCalledWith('/resources/new');
    });

    it('should navigate to edit resource page', async () => {
      renderWithRouter(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText('John Doe')).toHaveLength(2);
      });

      // Click the first edit button (from table view)
      const editButtons = screen.getAllByText(/edit/i);
      fireEvent.click(editButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/resources/1/edit');
    });

    it('should navigate to resource detail page when clicking on resource row', async () => {
      renderWithRouter(<ResourceListPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText('John Doe')).toHaveLength(2);
      });

      // Click on the resource name in the table (first occurrence)
      const johnDoeElements = screen.getAllByText('John Doe');
      fireEvent.click(johnDoeElements[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/resources/1');
    });
  });

  describe('Resource Deletion', () => {
    it('should confirm deletion', async () => {
      mockedResourceService.deleteResource.mockResolvedValue(undefined);

      renderWithRouter(<ResourceListPage />);
      
      await waitFor(() => {
        // Should find 4 delete buttons (2 in table view, 2 in mobile card view)
        expect(screen.getAllByText(/delete/i)).toHaveLength(4);
      });

      // Click delete button (first one from table view)
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

      renderWithRouter(<ResourceListPage />);
      
      await waitFor(() => {
        // Should find 4 delete buttons (2 in table view, 2 in mobile card view)
        expect(screen.getAllByText(/delete/i)).toHaveLength(4);
      });

      // Click delete button (first one from table view)
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
      renderWithRouter(<ResourceListPage />);
      
      await waitFor(() => {
        // Should find 4 delete buttons (2 in table view, 2 in mobile card view)
        expect(screen.getAllByText(/delete/i)).toHaveLength(4);
      });

      // Click delete button (first one from table view)
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

      renderWithRouter(<ResourceListPage />);
      
      await waitFor(() => {
        // Should find 2 John Doe elements (table + mobile card)
        expect(screen.getAllByText('John Doe')).toHaveLength(2);
      });

      const exportButton = screen.getByText('Export to Excel');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockedResourceService.exportResources).toHaveBeenCalled();
        expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      });
    });

    it('should show import dialog when import button is clicked', async () => {
      renderWithRouter(<ResourceListPage />);
      
      await waitFor(() => {
        // Should find 2 John Doe elements (table + mobile card)
        expect(screen.getAllByText('John Doe')).toHaveLength(2);
      });

      const importButton = screen.getByText('Import from Excel');
      fireEvent.click(importButton);

      expect(screen.getByText(/import resources from excel/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/choose file/i)).toBeInTheDocument();
    });
  });
});