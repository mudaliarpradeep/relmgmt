import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ResourceDetailPage from './ResourceDetailPage';
import ResourceService from '../../services/api/v1/resourceService';
import type { Resource } from '../../types';
import { Status, EmployeeGrade, SkillFunction, SkillSubFunction } from '../../types';

// Mock the resource service
vi.mock('../../services/api/v1/resourceService');
const mockedResourceService = vi.mocked(ResourceService);

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams()
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

describe('ResourceDetailPage', () => {
  const mockResource: Resource = {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: '1' });
  });

  describe('Resource Information Display', () => {
    beforeEach(() => {
      mockedResourceService.getResource.mockResolvedValue(mockResource);
    });

    it('should render resource detail page with title', async () => {
      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Resource Details')).toBeInTheDocument();
      });
    });

    it('should display resource information correctly', async () => {
      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('12345678')).toBeInTheDocument();
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('Level 8')).toBeInTheDocument();
        
        // Check for Build text in multiple places (Resource Info and Skills section)
        const buildElements = screen.getAllByText('Build');
        expect(buildElements.length).toBeGreaterThan(0);
        
        // Check for ForgeRock IDM text in multiple places (Resource Info and Skills section)
        const forgerockElements = screen.getAllByText('ForgeRock IDM');
        expect(forgerockElements.length).toBeGreaterThan(0);
      });
    });

    it('should display project dates when available', async () => {
      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('2024-01-15')).toBeInTheDocument();
        expect(screen.getByText('2024-12-31')).toBeInTheDocument();
      });
    });

    it('should display "Not set" for missing project dates', async () => {
      const resourceWithoutDates = { ...mockResource, projectStartDate: undefined, projectEndDate: undefined };
      mockedResourceService.getResource.mockResolvedValue(resourceWithoutDates);

      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Not set')).toHaveLength(2);
      });
    });

    it('should display status with appropriate styling', async () => {
      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        const statusElement = screen.getByText('Active');
        expect(statusElement).toHaveClass('bg-green-100', 'text-green-800');
      });
    });

    it('should display inactive status with appropriate styling', async () => {
      const inactiveResource = { ...mockResource, status: Status.INACTIVE };
      mockedResourceService.getResource.mockResolvedValue(inactiveResource);

      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        const statusElement = screen.getByText('Inactive');
        expect(statusElement).toHaveClass('bg-red-100', 'text-red-800');
      });
    });

    it('should display creation and update timestamps', async () => {
      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        expect(screen.getByText(/Created:/)).toBeInTheDocument();
        expect(screen.getByText(/Updated:/)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state initially', () => {
      mockedResourceService.getResource.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithProviders(<ResourceDetailPage />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle resource not found error', async () => {
      const errorMessage = 'Resource not found';
      mockedResourceService.getResource.mockRejectedValue(new Error(errorMessage));

      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should handle network error', async () => {
      const errorMessage = 'Network error';
      mockedResourceService.getResource.mockRejectedValue(new Error(errorMessage));

      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockedResourceService.getResource.mockResolvedValue(mockResource);
    });

    it('should navigate back to resource list when back button is clicked', async () => {
      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Back to Resources')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Back to Resources'));

      expect(mockNavigate).toHaveBeenCalledWith('/resources');
    });

    it('should navigate to edit page when edit button is clicked', async () => {
      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Edit Resource')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit Resource'));

      expect(mockNavigate).toHaveBeenCalledWith('/resources/1/edit');
    });
  });

  describe('Allocation Status', () => {
    beforeEach(() => {
      mockedResourceService.getResource.mockResolvedValue(mockResource);
    });

    it('should display allocation status section', async () => {
      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Allocation Status')).toBeInTheDocument();
      });
    });

    it('should display current project allocation', async () => {
      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Current Project')).toBeInTheDocument();
      });
    });

    it('should display allocation percentage', async () => {
      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Allocation')).toBeInTheDocument();
      });
    });

    it('should display availability status', async () => {
      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Availability')).toBeInTheDocument();
      });
    });
  });

  describe('Actions', () => {
    beforeEach(() => {
      mockedResourceService.getResource.mockResolvedValue(mockResource);
    });

    it('should display action buttons', async () => {
      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Back to Resources')).toBeInTheDocument();
        expect(screen.getByText('Edit Resource')).toBeInTheDocument();
      });
    });

    it('should have proper button styling', async () => {
      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        const backButton = screen.getByText('Back to Resources');
        const editButton = screen.getByText('Edit Resource');
        
        expect(backButton).toHaveClass('bg-gray-500');
        expect(editButton).toHaveClass('bg-blue-600');
      });
    });
  });

  describe('URL Parameter Handling', () => {
    it('should fetch resource with correct ID from URL', async () => {
      mockUseParams.mockReturnValue({ id: '123' });
      mockedResourceService.getResource.mockResolvedValue(mockResource);

      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        expect(mockedResourceService.getResource).toHaveBeenCalledWith(123);
      });
    });

    it('should handle invalid ID parameter', async () => {
      mockUseParams.mockReturnValue({ id: 'invalid' });
      mockedResourceService.getResource.mockRejectedValue(new Error('Invalid ID'));

      renderWithProviders(<ResourceDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });
    });
  });
}); 