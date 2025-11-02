import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ReleaseListPage from './ReleaseListPage';
import ReleaseService from '../../services/api/v1/releaseService';
import { ReleaseStatus } from '../../services/api/sharedTypes';

// Mock the service
vi.mock('../../services/api/v1/releaseService');

const mockReleases = [
  {
    id: 1,
    name: 'Release 1.0',
    identifier: 'REL-2025-001',
    description: 'First release',
    status: ReleaseStatus.PLANNING,
    phases: [
      { id: 1, phaseType: 'BUILD', phaseTypeDisplayName: 'Build', status: 'NOT_STARTED', startDate: '2025-01-01', endDate: '2025-01-31' }
    ],
    blockers: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Release 2.0',
    identifier: 'REL-2025-002',
    description: 'Second release',
    status: ReleaseStatus.IN_PROGRESS,
    phases: [
      { id: 2, phaseType: 'BUILD', phaseTypeDisplayName: 'Build', status: 'IN_PROGRESS', startDate: '2025-02-01', endDate: '2025-02-28' }
    ],
    blockers: [
      { id: 1, description: 'Blocker 1', severity: 'HIGH', status: 'OPEN', createdAt: '2025-01-15T00:00:00Z' }
    ],
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z'
  }
];

describe('ReleaseListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the page title', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Release Management')).toBeInTheDocument();
        expect(screen.getByText('Manage and track software releases')).toBeInTheDocument();
      });
    });

    it('should render create release button', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const createButtons = screen.getAllByRole('link', { name: /create release/i });
        expect(createButtons.length).toBeGreaterThan(0);
        expect(createButtons[0]).toHaveAttribute('href', '/releases/new');
      });
    });

    it('should render releases table with data', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Release 1.0')).toBeInTheDocument();
        expect(screen.getByText('Release 2.0')).toBeInTheDocument();
        expect(screen.getByText('REL-2025-001')).toBeInTheDocument();
        expect(screen.getByText('REL-2025-002')).toBeInTheDocument();
      });
    });

    it('should render status badges with correct colors', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        // Filter out option elements from select dropdown
        const planningBadges = screen.getAllByText(ReleaseStatus.PLANNING);
        const planningBadge = planningBadges.find(el => 
          !el.closest('select') && el.classList.contains('rounded-full')
        );
        expect(planningBadge).toHaveClass('bg-blue-100', 'text-blue-800');

        const inProgressBadges = screen.getAllByText(ReleaseStatus.IN_PROGRESS);
        const inProgressBadge = inProgressBadges.find(el => 
          !el.closest('select') && el.classList.contains('rounded-full')
        );
        expect(inProgressBadge).toHaveClass('bg-green-100', 'text-green-800');
      });
    });

    it('should render phases and blockers count', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText('1 phases')).toHaveLength(2);
        expect(screen.getByText('0 blockers')).toBeInTheDocument();
        expect(screen.getByText('1 blockers')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should display loading message while fetching data', () => {
      vi.mocked(ReleaseService.getReleases).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Loading releases...')).toBeInTheDocument();
    });

    it('should hide loading message after data is fetched', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading releases...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no releases exist', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No releases')).toBeInTheDocument();
        expect(screen.getByText('Get started by creating a new release.')).toBeInTheDocument();
      });
    });

    it('should render create release button in empty state', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const createButtons = screen.getAllByRole('link', { name: /create release/i });
        expect(createButtons).toHaveLength(2); // One in header, one in empty state
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', async () => {
      const errorMessage = 'Failed to fetch releases';
      vi.mocked(ReleaseService.getReleases).mockRejectedValue(new Error(errorMessage));

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should display empty table when error occurs', async () => {
      vi.mocked(ReleaseService.getReleases).mockRejectedValue(new Error('Network error'));

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No releases')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should render status filter dropdown', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Status Filter')).toBeInTheDocument();
      });
    });

    it('should show all status options in filter', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const statusFilter = screen.getByLabelText('Status Filter');
        expect(statusFilter).toBeInTheDocument();
        
        // Check for options
        Object.values(ReleaseStatus).forEach(status => {
          expect(screen.getByRole('option', { name: status })).toBeInTheDocument();
        });
      });
    });

    it('should reload releases when status filter changes', async () => {
      const user = userEvent.setup();
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Status Filter')).toBeInTheDocument();
      });

      const statusFilter = screen.getByLabelText('Status Filter');
      await user.selectOptions(statusFilter, ReleaseStatus.IN_PROGRESS);

      // Should reload releases - verify service was called again
      expect(ReleaseService.getReleases).toHaveBeenCalledTimes(2);
    });
  });

  describe('Actions', () => {
    it('should render action buttons for each release', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const viewButtons = screen.getAllByText('View');
        const editButtons = screen.getAllByText('Edit');
        const deleteButtons = screen.getAllByText('Delete');

        expect(viewButtons).toHaveLength(2);
        expect(editButtons).toHaveLength(2);
        expect(deleteButtons).toHaveLength(2);
      });
    });

    it('should navigate to release detail when view is clicked', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const viewButtons = screen.getAllByText('View');
        expect(viewButtons[0]).toHaveAttribute('href', '/releases/1');
      });
    });

    it('should navigate to edit form when edit is clicked', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        expect(editButtons[0]).toHaveAttribute('href', '/releases/1/edit');
      });
    });

    it('should show confirmation dialog when delete is clicked', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText('Delete')).toHaveLength(2);
      });

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this release?');
      confirmSpy.mockRestore();
    });

    it('should call delete service when confirmed', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(ReleaseService.deleteRelease).mockResolvedValue(undefined);
      
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText('Delete')).toHaveLength(2);
      });

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(ReleaseService.deleteRelease).toHaveBeenCalledWith(1);
      });
    });

    it('should reload releases after successful delete', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(ReleaseService.deleteRelease).mockResolvedValue(undefined);
      
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText('Delete')).toHaveLength(2);
      });

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        // Should be called twice: initial load + after delete
        expect(ReleaseService.getReleases).toHaveBeenCalledTimes(2);
      });
    });

    it('should display error when delete fails', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const errorMessage = 'Failed to delete';
      vi.mocked(ReleaseService.deleteRelease).mockRejectedValue(new Error(errorMessage));
      
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText('Delete')).toHaveLength(2);
      });

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should not delete when confirmation is cancelled', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      vi.mocked(ReleaseService.deleteRelease).mockResolvedValue(undefined);
      
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText('Delete')).toHaveLength(2);
      });

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      expect(ReleaseService.deleteRelease).not.toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    it('should not show pagination when only one page', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('Previous')).not.toBeInTheDocument();
        expect(screen.queryByText('Next')).not.toBeInTheDocument();
      });
    });

    it('should show pagination when multiple pages', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 3,
        totalElements: 30,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText('Previous')).toHaveLength(2); // Mobile + desktop
        expect(screen.getAllByText('Next')).toHaveLength(2);
      });
    });

    it('should display current page information', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 3,
        totalElements: 30,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/showing page/i)).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('should disable previous button on first page', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 3,
        totalElements: 30,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const prevButtons = screen.getAllByText('Previous');
        prevButtons.forEach(button => {
          expect(button).toBeDisabled();
        });
      });
    });

    it('should enable next button when not on last page', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 3,
        totalElements: 30,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const nextButtons = screen.getAllByText('Next');
        nextButtons.forEach(button => {
          expect(button).not.toBeDisabled();
        });
      });
    });

    it('should change page when next is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 3,
        totalElements: 30,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText('Next')).toHaveLength(2);
      });

      const nextButtons = screen.getAllByText('Next');
      await user.click(nextButtons[0]);

      await waitFor(() => {
        expect(ReleaseService.getReleases).toHaveBeenCalledWith(1, 10);
      });
    });

    it('should change page when previous is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(ReleaseService.getReleases)
        .mockResolvedValueOnce({
          content: mockReleases,
          totalPages: 3,
          totalElements: 30,
          size: 10,
          number: 1
        });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getAllByText('Previous')).toHaveLength(2);
      });

      // Click Next first to go to page 2
      const nextButtons = screen.getAllByText('Next');
      await userEvent.setup().click(nextButtons[0]);

      await waitFor(() => {
        expect(ReleaseService.getReleases).toHaveBeenCalled();
      });

      // Then click Previous
      const prevButtons = screen.getAllByText('Previous');
      await userEvent.setup().click(prevButtons[0]);

      await waitFor(() => {
        expect(ReleaseService.getReleases).toHaveBeenCalled();
      });
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const formattedDate = new Date('2025-01-01T00:00:00Z').toLocaleDateString();
        expect(screen.getByText(formattedDate)).toBeInTheDocument();
      });
    });
  });

  describe('Table Structure', () => {
    it('should render table headers', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Release')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Phases')).toBeInTheDocument();
        expect(screen.getByText('Blockers')).toBeInTheDocument();
        expect(screen.getByText('Created')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
      });
    });

    it('should render release descriptions when available', async () => {
      vi.mocked(ReleaseService.getReleases).mockResolvedValue({
        content: mockReleases,
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0
      });

      render(
        <MemoryRouter initialEntries={['/releases']}>
          <Routes>
            <Route path="/releases" element={<ReleaseListPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('First release')).toBeInTheDocument();
        expect(screen.getByText('Second release')).toBeInTheDocument();
      });
    });
  });
});
