import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResourceImportModal from './ResourceImportModal';
import ResourceService from '../../services/api/v1/resourceService';
import type { ResourceImportResponse } from '../../services/api/sharedTypes';

// Mock ResourceService
vi.mock('../../services/api/v1/resourceService');

describe('ResourceImportModal', () => {
  const mockOnClose = vi.fn();
  const mockOnImportSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <ResourceImportModal
          isOpen={false}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      expect(screen.queryByText('Import Resources from Excel')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      expect(screen.getByText('Import Resources from Excel')).toBeInTheDocument();
      expect(screen.getByLabelText('Choose File')).toBeInTheDocument();
      expect(screen.getByText('Import')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should display expected format information', () => {
      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      expect(screen.getByText('Expected Excel Format:')).toBeInTheDocument();
      expect(screen.getByText(/Name.*Employee Number.*Email/)).toBeInTheDocument();
    });
  });

  describe('File Selection', () => {
    it('should accept valid Excel files', () => {
      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      const file = new File(['test content'], 'resources.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const input = screen.getByLabelText('Choose File') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      expect(screen.getByText(/Selected:/)).toBeInTheDocument();
      expect(screen.getByText(/resources.xlsx/)).toBeInTheDocument();
    });

    it('should reject non-Excel files', () => {
      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      const file = new File(['test content'], 'document.pdf', {
        type: 'application/pdf',
      });

      const input = screen.getByLabelText('Choose File') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      expect(screen.getByText(/Please select a valid Excel file/)).toBeInTheDocument();
    });

    it('should reject files larger than 10MB', () => {
      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      // Create a file object with size > 10MB
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const input = screen.getByLabelText('Choose File') as HTMLInputElement;
      Object.defineProperty(input, 'files', {
        value: [largeFile],
        writable: false,
      });
      fireEvent.change(input);

      expect(screen.getByText(/File size must be less than 10MB/)).toBeInTheDocument();
    });

    it('should clear error when valid file is selected after error', () => {
      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      // First, select invalid file
      const invalidFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText('Choose File') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [invalidFile] } });

      expect(screen.getByText(/Please select a valid Excel file/)).toBeInTheDocument();

      // Then select valid file
      const validFile = new File(['test'], 'resources.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      fireEvent.change(input, { target: { files: [validFile] } });

      expect(screen.queryByText(/Please select a valid Excel file/)).not.toBeInTheDocument();
    });
  });

  describe('Import Functionality', () => {
    it('should disable import button when no file is selected', () => {
      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      const importButton = screen.getByText('Import');
      expect(importButton).toBeDisabled();
    });

    it('should enable import button when file is selected', () => {
      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      const file = new File(['test'], 'resources.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const input = screen.getByLabelText('Choose File') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      const importButton = screen.getByText('Import');
      expect(importButton).not.toBeDisabled();
    });

    it('should call ResourceService.importResources with selected file', async () => {
      const mockImportResponse: ResourceImportResponse = {
        totalProcessed: 10,
        successful: 10,
        failed: 0,
        errors: [],
      };

      vi.mocked(ResourceService.importResources).mockResolvedValue(mockImportResponse);

      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      const file = new File(['test'], 'resources.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const input = screen.getByLabelText('Choose File') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      const importButton = screen.getByText('Import');
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(ResourceService.importResources).toHaveBeenCalledWith(file);
      });
    });

    it('should show loading state during import', async () => {
      const mockImportResponse: ResourceImportResponse = {
        totalProcessed: 10,
        successful: 10,
        failed: 0,
        errors: [],
      };

      vi.mocked(ResourceService.importResources).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockImportResponse), 100))
      );

      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      const file = new File(['test'], 'resources.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const input = screen.getByLabelText('Choose File') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      const importButton = screen.getByText('Import');
      fireEvent.click(importButton);

      expect(screen.getByText('Importing...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Importing...')).not.toBeInTheDocument();
      });
    });

    it('should display import results on successful import', async () => {
      const mockImportResponse: ResourceImportResponse = {
        totalProcessed: 30,
        successful: 28,
        failed: 2,
        errors: [
          { row: 5, message: 'Invalid email format' },
          { row: 12, message: 'Employee number must be 8 digits' },
        ],
      };

      vi.mocked(ResourceService.importResources).mockResolvedValue(mockImportResponse);

      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      const file = new File(['test'], 'resources.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const input = screen.getByLabelText('Choose File') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      const importButton = screen.getByText('Import');
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(screen.getByText('Import Summary')).toBeInTheDocument();
        expect(screen.getByText('Total Processed:')).toBeInTheDocument();
        expect(screen.getByText('30')).toBeInTheDocument();
        expect(screen.getByText('Successful:')).toBeInTheDocument();
        expect(screen.getByText('28')).toBeInTheDocument();
        expect(screen.getByText('Failed:')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('should display error details when import has errors', async () => {
      const mockImportResponse: ResourceImportResponse = {
        totalProcessed: 10,
        successful: 8,
        failed: 2,
        errors: [
          { row: 3, message: 'Invalid email format' },
          { row: 7, message: 'Employee number must be 8 digits' },
        ],
      };

      vi.mocked(ResourceService.importResources).mockResolvedValue(mockImportResponse);

      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      const file = new File(['test'], 'resources.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const input = screen.getByLabelText('Choose File') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      const importButton = screen.getByText('Import');
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(screen.getByText('Import Errors')).toBeInTheDocument();
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
        expect(screen.getByText('Employee number must be 8 digits')).toBeInTheDocument();
      });
    });

    it('should show success message when all resources imported successfully', async () => {
      const mockImportResponse: ResourceImportResponse = {
        totalProcessed: 30,
        successful: 30,
        failed: 0,
        errors: [],
      };

      vi.mocked(ResourceService.importResources).mockResolvedValue(mockImportResponse);

      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      const file = new File(['test'], 'resources.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const input = screen.getByLabelText('Choose File') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      const importButton = screen.getByText('Import');
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(screen.getByText(/All resources imported successfully/)).toBeInTheDocument();
      });
    });

    it('should call onImportSuccess and close modal after successful import', async () => {
      const mockImportResponse: ResourceImportResponse = {
        totalProcessed: 10,
        successful: 10,
        failed: 0,
        errors: [],
      };

      vi.mocked(ResourceService.importResources).mockResolvedValue(mockImportResponse);

      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      const file = new File(['test'], 'resources.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const input = screen.getByLabelText('Choose File') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      const importButton = screen.getByText('Import');
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(screen.getByText(/All resources imported successfully/)).toBeInTheDocument();
      });

      // Wait for the setTimeout to execute (2000ms delay)
      await waitFor(() => {
        expect(mockOnImportSuccess).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should handle import error gracefully', async () => {
      const errorMessage = 'Network error occurred';
      vi.mocked(ResourceService.importResources).mockRejectedValue(new Error(errorMessage));

      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      const file = new File(['test'], 'resources.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const input = screen.getByLabelText('Choose File') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      const importButton = screen.getByText('Import');
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(mockOnImportSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Modal Controls', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when background overlay is clicked', () => {
      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      const overlay = document.querySelector('.bg-gray-500.bg-opacity-75');
      expect(overlay).toBeInTheDocument();
      
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should reset state when modal is closed', () => {
      const { rerender } = render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      const file = new File(['test'], 'resources.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const input = screen.getByLabelText('Choose File') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      expect(screen.getByText(/Selected:/)).toBeInTheDocument();

      // Close modal
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      // Reopen modal
      rerender(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      // File selection should be cleared
      expect(screen.queryByText(/Selected:/)).not.toBeInTheDocument();
    });

    it('should change button text to "Close" after import results are shown', async () => {
      const mockImportResponse: ResourceImportResponse = {
        totalProcessed: 10,
        successful: 10,
        failed: 0,
        errors: [],
      };

      vi.mocked(ResourceService.importResources).mockResolvedValue(mockImportResponse);

      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      const file = new File(['test'], 'resources.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const input = screen.getByLabelText('Choose File') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      expect(screen.getByText('Cancel')).toBeInTheDocument();

      const importButton = screen.getByText('Import');
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(screen.getByText(/All resources imported successfully/)).toBeInTheDocument();
      });

      expect(screen.getByText('Close')).toBeInTheDocument();
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should disable controls during import', async () => {
      let resolveImport: (value: ResourceImportResponse) => void;
      const importPromise = new Promise<ResourceImportResponse>((resolve) => {
        resolveImport = resolve;
      });

      vi.mocked(ResourceService.importResources).mockReturnValue(importPromise);

      render(
        <ResourceImportModal
          isOpen={true}
          onClose={mockOnClose}
          onImportSuccess={mockOnImportSuccess}
        />
      );

      const file = new File(['test'], 'resources.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const input = screen.getByLabelText('Choose File') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      const importButton = screen.getByText('Import');
      fireEvent.click(importButton);

      // During import, file input and cancel button should be disabled
      await waitFor(() => {
        expect(input).toBeDisabled();
        expect(screen.getByText('Cancel')).toBeDisabled();
      });

      // Resolve the import
      resolveImport!({
        totalProcessed: 10,
        successful: 10,
        failed: 0,
        errors: [],
      });

      // After import completes, wait for success message
      await waitFor(() => {
        expect(screen.getByText(/All resources imported successfully/)).toBeInTheDocument();
      });

      // Controls should be enabled again
      expect(input).not.toBeDisabled();
    });
  });
});

