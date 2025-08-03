import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../../test/test-utils';
import ResourceForm from './ResourceForm';
import ResourceService from '../../services/api/v1/resourceService';
import type { Resource } from '../../types';

// Mock the ResourceService
vi.mock('../../services/api/v1/resourceService');
const mockedResourceService = vi.mocked(ResourceService);

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseParams = vi.fn(() => ({ id: undefined })); // Default to create mode

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

describe('ResourceForm', () => {
  const mockResource: Resource = {
    id: 1,
    name: 'John Doe',
    employeeNumber: '12345678',
    email: 'john.doe@example.com',
    status: 'Active',
    projectStartDate: '2024-01-15',
    projectEndDate: '2024-12-31',
    employeeGrade: 'Level 8',
    skillFunction: 'Build',
    skillSubFunction: 'ForgeRock IDM',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: undefined }); // Reset to create mode
  });

  describe('Create Mode', () => {
    it('should render form for creating new resource', () => {
      renderWithRouter(<ResourceForm />);
      
      expect(screen.getByText('Add New Resource')).toBeInTheDocument();
      expect(screen.getByText('Create a new resource entry')).toBeInTheDocument();
      expect(screen.getByText('Create Resource')).toBeInTheDocument();
    });

    it('should handle form submission for new resource', async () => {
      mockedResourceService.createResource.mockResolvedValue(mockResource);

      renderWithRouter(<ResourceForm />);
      
      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john.doe@example.com' } });

      fireEvent.click(screen.getByText('Create Resource'));

      await waitFor(() => {
        expect(mockedResourceService.createResource).toHaveBeenCalledWith({
          name: 'John Doe',
          employeeNumber: '12345678',
          email: 'john.doe@example.com',
          status: 'Active',
          projectStartDate: undefined,
          projectEndDate: undefined,
          employeeGrade: 'Level 1',
          skillFunction: 'Functional Design',
          skillSubFunction: 'Talend'
        });
        expect(mockNavigate).toHaveBeenCalledWith('/resources');
      });
    });

    it('should show validation errors for invalid form', async () => {
      renderWithRouter(<ResourceForm />);
      
      // Try to submit without filling required fields
      fireEvent.click(screen.getByText('Create Resource'));

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/employee number is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      expect(mockedResourceService.createResource).not.toHaveBeenCalled();
    });

    it('should handle submission errors', async () => {
      const error = new Error('Failed to create resource');
      mockedResourceService.createResource.mockRejectedValue(error);

      renderWithRouter(<ResourceForm />);
      
      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john.doe@example.com' } });

      fireEvent.click(screen.getByText('Create Resource'));

      await waitFor(() => {
        expect(screen.getByText('Failed to create resource')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      // Mock useParams to return an ID for edit mode
      mockUseParams.mockReturnValue({ id: '1' });
      mockedResourceService.getResource.mockResolvedValue(mockResource);
    });

    it('should render form for editing existing resource', async () => {
      renderWithRouter(<ResourceForm />);
      
      await waitFor(() => {
        expect(screen.getByText('Edit Resource')).toBeInTheDocument();
        expect(screen.getByText('Update existing resource information')).toBeInTheDocument();
        expect(screen.getByText('Update Resource')).toBeInTheDocument();
      });
    });

    it('should load existing resource data', async () => {
      renderWithRouter(<ResourceForm />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('12345678')).toBeInTheDocument();
        expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
      });
    });

    it('should handle form submission for existing resource', async () => {
      mockedResourceService.updateResource.mockResolvedValue(mockResource);

      renderWithRouter(<ResourceForm />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      });

      // Update a field
      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Jane Doe' } });

      fireEvent.click(screen.getByText('Update Resource'));

      await waitFor(() => {
        expect(mockedResourceService.updateResource).toHaveBeenCalledWith(1, {
          name: 'Jane Doe',
          employeeNumber: '12345678',
          email: 'john.doe@example.com',
          status: 'Active',
          projectStartDate: '2024-01-15',
          projectEndDate: '2024-12-31',
          employeeGrade: 'Level 8',
          skillFunction: 'Build',
          skillSubFunction: 'ForgeRock IDM'
        });
        expect(mockNavigate).toHaveBeenCalledWith('/resources');
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      renderWithRouter(<ResourceForm />);
      
      // Fill in required fields first
      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'invalid-email' } });

      // Submit the form using the submit button
      const submitButton = screen.getByText('Create Resource');
      fireEvent.click(submitButton);

      // Wait for validation error to appear
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('should validate employee number format', async () => {
      renderWithRouter(<ResourceForm />);
      
      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: '123' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john.doe@example.com' } });

      const submitButton = screen.getByText('Create Resource');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Employee Number must be 8 digits')).toBeInTheDocument();
      });
    });

    it('should validate project end date is after start date', async () => {
      renderWithRouter(<ResourceForm />);
      
      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john.doe@example.com' } });
      fireEvent.change(screen.getByLabelText(/Project Start Date/i), { target: { value: '2024-12-31' } });
      fireEvent.change(screen.getByLabelText(/Project End Date/i), { target: { value: '2024-01-01' } });

      const submitButton = screen.getByText('Create Resource');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state when submitting form', async () => {
      // Mock a delayed response
      mockedResourceService.createResource.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockResource), 100))
      );

      renderWithRouter(<ResourceForm />);
      
      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john.doe@example.com' } });

      fireEvent.click(screen.getByText('Create Resource'));

      // Should show loading state
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      // The button should be disabled during loading
      const submitButton = screen.getByRole('button', { name: /saving/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Navigation', () => {
    it('should navigate back when cancel is clicked', () => {
      renderWithRouter(<ResourceForm />);
      
      fireEvent.click(screen.getByText('Cancel'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/resources');
    });
  });
}); 