import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderWithRouter } from '../../test/test-utils';
import ResourceForm from './ResourceForm';
import ResourceService from '../../services/api/v1/resourceService';
import type { Resource } from '../../services/api/sharedTypes';

// Mock the ResourceService
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

describe('ResourceForm', () => {
  const mockResource: Resource = {
    id: 1,
    name: 'John Doe',
    employeeNumber: '12345678',
    email: 'john.doe@example.com',
    status: 'Active',
    projectStartDate: '',
    projectEndDate: undefined,
    employeeGrade: 'Level 1',
    skillFunction: 'Functional Design',
    skillSubFunction: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    // Default to create mode (no ID)
    mockUseParams.mockReturnValue({ id: undefined });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      renderWithRouter(<ResourceForm />);
      
      // Wait for the form to be rendered (not in loading state)
      await waitFor(() => {
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      });
      
      // Fill in required fields first
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: '12345678' } });
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'invalid-email' } });
      });

      // Submit the form using the submit button
      await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
      });

      // Wait for validation error to appear
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });

      // Verify that the service was not called
      expect(mockedResourceService.createResource).not.toHaveBeenCalled();
    });

    it('should validate employee number format', async () => {
      renderWithRouter(<ResourceForm />);
      
      // Wait for the form to be rendered (not in loading state)
      await waitFor(() => {
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      });
      
      // Fill in required fields with invalid employee number
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: '123' } });
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john.doe@example.com' } });
      });

      // Submit the form
      await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
      });

      // Wait for validation error to appear
      await waitFor(() => {
        expect(screen.getByText('Employee Number must be 8 digits')).toBeInTheDocument();
      });

      // Verify that the service was not called
      expect(mockedResourceService.createResource).not.toHaveBeenCalled();
    });

    it('should validate project dates', async () => {
      renderWithRouter(<ResourceForm />);
      
      // Wait for the form to be rendered (not in loading state)
      await waitFor(() => {
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      });
      
      // Fill in required fields with invalid dates
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: '12345678' } });
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john.doe@example.com' } });
        fireEvent.change(screen.getByLabelText(/Project Start Date/i), { target: { value: '2024-12-31' } });
        fireEvent.change(screen.getByLabelText(/Project End Date/i), { target: { value: '2024-01-01' } });
      });

      // Submit the form
      await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
      });

      // Wait for validation error to appear
      await waitFor(() => {
        expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
      });

      // Verify that the service was not called
      expect(mockedResourceService.createResource).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      mockedResourceService.createResource.mockResolvedValue(mockResource);
      
      renderWithRouter(<ResourceForm />);
      
      // Wait for the form to be rendered (not in loading state)
      await waitFor(() => {
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      });
      
      // Fill in required fields with valid data
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: '12345678' } });
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john.doe@example.com' } });
      });

      // Submit the form
      await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
      });

      // Wait for form submission
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
          skillSubFunction: undefined
        });
        expect(mockNavigate).toHaveBeenCalledWith('/resources');
      });
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      // Mock useParams to return an ID for edit mode
      mockUseParams.mockReturnValue({ id: '1' });
      mockedResourceService.getResource.mockResolvedValue(mockResource);
    });

    it('should render in edit mode with resource data', async () => {
      renderWithRouter(<ResourceForm />);
      
      await waitFor(() => {
        expect(screen.getByText('Edit Resource')).toBeInTheDocument();
        expect(screen.getByText('Update resource information')).toBeInTheDocument();
      });

      // Check that form fields are populated with resource data
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('12345678')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
    });

    it('should update resource when form is submitted in edit mode', async () => {
      mockedResourceService.updateResource.mockResolvedValue(mockResource);
      
      renderWithRouter(<ResourceForm />);
      
      await waitFor(() => {
        expect(screen.getByText('Edit Resource')).toBeInTheDocument();
      });

      // Wait for form fields to be populated
      await waitFor(() => {
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      });

      // Fill in required fields
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: '87654321' } });
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'jane.doe@example.com' } });
      });

      // Submit the form
      await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
      });

      await waitFor(() => {
        expect(mockedResourceService.updateResource).toHaveBeenCalledWith(1, {
          name: 'Jane Doe',
          employeeNumber: '87654321',
          email: 'jane.doe@example.com',
          status: 'Active',
          projectStartDate: undefined,
          projectEndDate: undefined,
          employeeGrade: 'Level 1',
          skillFunction: 'Functional Design',
          skillSubFunction: undefined
        });
        expect(mockNavigate).toHaveBeenCalledWith('/resources');
      });
    });
  });
});