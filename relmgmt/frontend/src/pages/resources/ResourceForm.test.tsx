import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ResourceForm from './ResourceForm';
import ResourceService from '../../services/api/v1/resourceService';
import type { Resource, ResourceRequest } from '../../types';
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

describe('ResourceForm', () => {
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
    // Default to create mode (no id)
    mockUseParams.mockReturnValue({ id: undefined });
  });

  describe('Create Mode', () => {
    it('should render form for creating new resource', () => {
      renderWithProviders(<ResourceForm />);
      
      expect(screen.getByText('Add New Resource')).toBeInTheDocument();
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Employee Number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Project Start Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Project End Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Employee Grade/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Skill Function/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Skill Sub-function/i)).toBeInTheDocument();
    });

    it('should have empty form fields initially', () => {
      renderWithProviders(<ResourceForm />);
      
      expect(screen.getByLabelText(/Name/i)).toHaveValue('');
      expect(screen.getByLabelText(/Employee Number/i)).toHaveValue('');
      expect(screen.getByLabelText(/Email/i)).toHaveValue('');
      expect(screen.getByLabelText(/Status/i)).toHaveValue(Status.ACTIVE);
      expect(screen.getByLabelText(/Project Start Date/i)).toHaveValue('');
      expect(screen.getByLabelText(/Project End Date/i)).toHaveValue('');
      expect(screen.getByLabelText(/Employee Grade/i)).toHaveValue(EmployeeGrade.LEVEL_1);
      expect(screen.getByLabelText(/Skill Function/i)).toHaveValue(SkillFunction.FUNCTIONAL_DESIGN);
      expect(screen.getByLabelText(/Skill Sub-function/i)).toHaveValue(SkillSubFunction.TALEND);
    });

    it('should display all enum options in dropdowns', () => {
      renderWithProviders(<ResourceForm />);
      
      // Check Status options
      const statusSelect = screen.getByLabelText(/Status/i);
      expect(statusSelect).toHaveValue(Status.ACTIVE);
      expect(screen.getByText(Status.ACTIVE)).toBeInTheDocument();
      expect(screen.getByText(Status.INACTIVE)).toBeInTheDocument();

      // Check Employee Grade options
      const gradeSelect = screen.getByLabelText(/Employee Grade/i);
      expect(gradeSelect).toHaveValue(EmployeeGrade.LEVEL_1);
      Object.values(EmployeeGrade).forEach(grade => {
        expect(screen.getByText(grade)).toBeInTheDocument();
      });

      // Check Skill Function options
      const functionSelect = screen.getByLabelText(/Skill Function/i);
      expect(functionSelect).toHaveValue(SkillFunction.FUNCTIONAL_DESIGN);
      Object.values(SkillFunction).forEach(func => {
        expect(screen.getByText(func)).toBeInTheDocument();
      });

      // Check Skill Sub-function options
      const subFunctionSelect = screen.getByLabelText(/Skill Sub-function/i);
      expect(subFunctionSelect).toHaveValue(SkillSubFunction.TALEND);
      Object.values(SkillSubFunction).forEach(subFunc => {
        expect(screen.getByText(subFunc)).toBeInTheDocument();
      });
    });

    it('should create resource successfully', async () => {
      const mockResourceRequest: ResourceRequest = {
        name: 'Jane Smith',
        employeeNumber: '87654321',
        email: 'jane.smith@example.com',
        status: Status.ACTIVE,
        projectStartDate: '2024-02-01',
        projectEndDate: '2024-12-31',
        employeeGrade: EmployeeGrade.LEVEL_9,
        skillFunction: SkillFunction.TEST,
        skillSubFunction: SkillSubFunction.MANUAL
      };

      mockedResourceService.createResource.mockResolvedValue(mockResource);

      renderWithProviders(<ResourceForm />);

      // Fill out the form
      fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Jane Smith' } });
      fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: '87654321' } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jane.smith@example.com' } });
      fireEvent.change(screen.getByLabelText(/Project Start Date/i), { target: { value: '2024-02-01' } });
      fireEvent.change(screen.getByLabelText(/Project End Date/i), { target: { value: '2024-12-31' } });
      fireEvent.change(screen.getByLabelText(/Employee Grade/i), { target: { value: EmployeeGrade.LEVEL_9 } });
      fireEvent.change(screen.getByLabelText(/Skill Function/i), { target: { value: SkillFunction.TEST } });
      fireEvent.change(screen.getByLabelText(/Skill Sub-function/i), { target: { value: SkillSubFunction.MANUAL } });

      // Submit the form
      fireEvent.click(screen.getByText('Save Resource'));

      await waitFor(() => {
        expect(mockedResourceService.createResource).toHaveBeenCalledWith(mockResourceRequest);
        expect(mockNavigate).toHaveBeenCalledWith('/resources');
      });
    });

    it('should handle creation errors', async () => {
      const errorMessage = 'Failed to create resource';
      mockedResourceService.createResource.mockRejectedValue(new Error(errorMessage));

      renderWithProviders(<ResourceForm />);

      // Fill out required fields
      fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Jane Smith' } });
      fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: '87654321' } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jane.smith@example.com' } });

      // Submit the form
      fireEvent.click(screen.getByText('Save Resource'));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ id: '1' });
      mockedResourceService.getResource.mockResolvedValue(mockResource);
    });

    it('should render form for editing existing resource', async () => {
      renderWithProviders(<ResourceForm />);

      await waitFor(() => {
        expect(screen.getByText('Edit Resource')).toBeInTheDocument();
      });

      expect(mockedResourceService.getResource).toHaveBeenCalledWith(1);
    });

    it('should populate form fields with existing resource data', async () => {
      renderWithProviders(<ResourceForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Name/i)).toHaveValue('John Doe');
        expect(screen.getByLabelText(/Employee Number/i)).toHaveValue('12345678');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('john.doe@example.com');
        expect(screen.getByLabelText(/Status/i)).toHaveValue(Status.ACTIVE);
        expect(screen.getByLabelText(/Project Start Date/i)).toHaveValue('2024-01-15');
        expect(screen.getByLabelText(/Project End Date/i)).toHaveValue('2024-12-31');
        expect(screen.getByLabelText(/Employee Grade/i)).toHaveValue(EmployeeGrade.LEVEL_8);
        expect(screen.getByLabelText(/Skill Function/i)).toHaveValue(SkillFunction.BUILD);
        expect(screen.getByLabelText(/Skill Sub-function/i)).toHaveValue(SkillSubFunction.FORGEROCK_IDM);
      });
    });

    it('should update resource successfully', async () => {
      const updatedResource: Resource = { ...mockResource, name: 'John Updated' };
      mockedResourceService.updateResource.mockResolvedValue(updatedResource);

      renderWithProviders(<ResourceForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Name/i)).toHaveValue('John Doe');
      });

      // Update the name
      fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John Updated' } });

      // Submit the form
      fireEvent.click(screen.getByText('Save Resource'));

      await waitFor(() => {
        expect(mockedResourceService.updateResource).toHaveBeenCalledWith(1, {
          name: 'John Updated',
          employeeNumber: '12345678',
          email: 'john.doe@example.com',
          status: Status.ACTIVE,
          projectStartDate: '2024-01-15',
          projectEndDate: '2024-12-31',
          employeeGrade: EmployeeGrade.LEVEL_8,
          skillFunction: SkillFunction.BUILD,
          skillSubFunction: SkillSubFunction.FORGEROCK_IDM
        });
        expect(mockNavigate).toHaveBeenCalledWith('/resources');
      });
    });

    it('should handle update errors', async () => {
      const errorMessage = 'Failed to update resource';
      mockedResourceService.updateResource.mockRejectedValue(new Error(errorMessage));

      renderWithProviders(<ResourceForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Name/i)).toHaveValue('John Doe');
      });

      // Submit the form
      fireEvent.click(screen.getByText('Save Resource'));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should handle loading errors', async () => {
      const errorMessage = 'Failed to load resource';
      mockedResourceService.getResource.mockRejectedValue(new Error(errorMessage));

      renderWithProviders(<ResourceForm />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      renderWithProviders(<ResourceForm />);

      // Try to submit empty form
      fireEvent.click(screen.getByText('Save Resource'));

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Employee Number is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      renderWithProviders(<ResourceForm />);

      // Fill required fields with invalid email
      fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'invalid-email' } });

      const form = document.querySelector('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should validate employee number format', async () => {
      renderWithProviders(<ResourceForm />);

      // Fill required fields with invalid employee number
      fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: '123' } }); // Too short
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } });

      fireEvent.click(screen.getByText('Save Resource'));

      await waitFor(() => {
        expect(screen.getByText('Employee Number must be 8 digits')).toBeInTheDocument();
      });
    });

    it('should validate date range', async () => {
      renderWithProviders(<ResourceForm />);

      // Fill required fields with invalid date range
      fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } });
      fireEvent.change(screen.getByLabelText(/Project Start Date/i), { target: { value: '2024-12-31' } });
      fireEvent.change(screen.getByLabelText(/Project End Date/i), { target: { value: '2024-01-01' } }); // End before start

      fireEvent.click(screen.getByText('Save Resource'));

      await waitFor(() => {
        expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back when cancel button is clicked', () => {
      renderWithProviders(<ResourceForm />);

      fireEvent.click(screen.getByText('Cancel'));

      expect(mockNavigate).toHaveBeenCalledWith('/resources');
    });

    it('should navigate back after successful save', async () => {
      mockedResourceService.createResource.mockResolvedValue(mockResource);

      renderWithProviders(<ResourceForm />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } });

      fireEvent.click(screen.getByText('Save Resource'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/resources');
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state when fetching resource data', () => {
      mockUseParams.mockReturnValue({ id: '1' });
      mockedResourceService.getResource.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithProviders(<ResourceForm />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show loading state when submitting form', async () => {
      mockedResourceService.createResource.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithProviders(<ResourceForm />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } });

      fireEvent.click(screen.getByText('Save Resource'));

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });
    });
  });
}); 