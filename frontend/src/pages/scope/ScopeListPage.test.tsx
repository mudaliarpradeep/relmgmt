import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../../test/test-utils';
import ScopeListPage from './ScopeListPage';
import ScopeService from '../../services/api/v1/scopeService';
import ReleaseService from '../../services/api/v1/releaseService';
import { ReleaseStatus } from '../../services/api/sharedTypes';
import type { Release, ScopeItemWithComponents } from '../../services/api/sharedTypes';

vi.mock('../../services/api/v1/scopeService');
vi.mock('../../services/api/v1/releaseService');
const mockedScopeService = vi.mocked(ScopeService);
const mockedReleaseService = vi.mocked(ReleaseService);

const mockUseParams = vi.fn(() => ({ releaseId: '1' }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams()
  };
});

describe('ScopeListPage', () => {
  const mockRelease: Release = {
    id: 1,
    name: 'Release 1.0',
    identifier: 'REL-001',
    description: 'Test release',
    status: ReleaseStatus.PLANNING,
    phases: [],
    blockers: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  };

  const mockScopeItems: ScopeItemWithComponents[] = [
    {
      id: 1,
      name: 'User Authentication',
      description: 'Implement user auth',
      functionalDesignDays: 5,
      sitDays: 3,
      uatDays: 2,
      releaseId: 1,
      components: [
        {
          id: 1,
          name: 'Auth API',
          componentType: 'SAILPOINT',
          technicalDesignDays: 2,
          buildDays: 5,
          scopeItemId: 1
        },
        {
          id: 2,
          name: 'Auth UI',
          componentType: 'FORGEROCK_UI',
          technicalDesignDays: 1,
          buildDays: 3,
          scopeItemId: 1
        }
      ]
    },
    {
      id: 2,
      name: 'Data Migration',
      description: 'Migrate legacy data',
      functionalDesignDays: 3,
      sitDays: 2,
      uatDays: 1,
      releaseId: 1,
      components: []
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ releaseId: '1' });
  });

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      mockedReleaseService.getRelease.mockImplementation(() => new Promise(() => {}));
      mockedScopeService.getScopeItemsWithComponents.mockImplementation(() => new Promise(() => {}));

      renderWithRouter(<ScopeListPage />);

      // Check for spinner element
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Invalid Release ID', () => {
    it('should show error for invalid release ID', () => {
      // Mock useParams to return invalid ID
      mockUseParams.mockReturnValueOnce({ releaseId: 'invalid' });

      renderWithRouter(<ScopeListPage />);

      expect(screen.getByText('Invalid release id')).toBeInTheDocument();
    });
  });

  describe('Page Header', () => {
    it('should display page title', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce(mockScopeItems);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        const titles = screen.getAllByText('Scope Items');
        expect(titles.length).toBeGreaterThan(0);
      });

      expect(screen.getByText(/for Release 1.0/i)).toBeInTheDocument();
    });

    it('should display subtitle', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce(mockScopeItems);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        expect(screen.getByText('Manage scope items and their components for this release')).toBeInTheDocument();
      });
    });

    it('should have add scope item button', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce(mockScopeItems);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        const addButtons = screen.getAllByRole('link', { name: /add scope item/i });
        expect(addButtons.length).toBeGreaterThan(0);
        expect(addButtons[0]).toHaveAttribute('href', '/releases/1/scope-items/new');
      });
    });
  });

  describe('Breadcrumb Navigation', () => {
    it('should display breadcrumb trail', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce(mockScopeItems);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Releases' })).toBeInTheDocument();
      });

      expect(screen.getByRole('link', { name: 'Release 1.0' })).toBeInTheDocument();
      const scopeItemsTexts = screen.getAllByText('Scope Items');
      expect(scopeItemsTexts.length).toBeGreaterThan(0);
    });

    it('should have correct breadcrumb links', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce(mockScopeItems);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        const releasesLink = screen.getByRole('link', { name: 'Releases' });
        expect(releasesLink).toHaveAttribute('href', '/releases');
      });

      const releaseLink = screen.getByRole('link', { name: 'Release 1.0' });
      expect(releaseLink).toHaveAttribute('href', '/releases/1');
    });
  });

  describe('Scope Items Display', () => {
    it('should display all scope items', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce(mockScopeItems);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        expect(screen.getByText('User Authentication')).toBeInTheDocument();
      });

      expect(screen.getByText('Data Migration')).toBeInTheDocument();
    });

    it('should display scope item descriptions', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce(mockScopeItems);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        expect(screen.getByText('Implement user auth')).toBeInTheDocument();
      });

      expect(screen.getByText('Migrate legacy data')).toBeInTheDocument();
    });

    it('should display "No description" when missing', async () => {
      const itemsWithoutDescription = [{
        ...mockScopeItems[0],
        description: ''
      }];
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce(itemsWithoutDescription);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        expect(screen.getByText('No description')).toBeInTheDocument();
      });
    });

    it('should display component badges', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce(mockScopeItems);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        expect(screen.getByText('SailPoint')).toBeInTheDocument();
      });

      expect(screen.getByText('ForgeRock UI')).toBeInTheDocument();
    });

    it('should display "No components" badge when no components', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce(mockScopeItems);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        expect(screen.getByText('No components')).toBeInTheDocument();
      });
    });

    it('should calculate and display total effort', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce(mockScopeItems);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        // First item: functional(5) + sit(3) + uat(2) + tech(2+1) + build(5+3) = 21 PD
        expect(screen.getByText('Total: 21 PD')).toBeInTheDocument();
      });

      // Second item: functional(3) + sit(2) + uat(1) = 6 PD
      expect(screen.getByText('Total: 6 PD')).toBeInTheDocument();
    });

    it('should display effort breakdown', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce(mockScopeItems);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        const scopeLevelTexts = screen.getAllByText('Scope Item Level:');
        expect(scopeLevelTexts.length).toBeGreaterThan(0);
      });

      const componentLevelTexts = screen.getAllByText('Component Level:');
      expect(componentLevelTexts.length).toBeGreaterThan(0);
    });

    it('should link to scope item detail page', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce(mockScopeItems);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /user authentication/i });
        expect(link).toHaveAttribute('href', '/scope-items/1');
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no scope items', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce([]);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        expect(screen.getByText('No scope items')).toBeInTheDocument();
      });

      expect(screen.getByText('Get started by creating a new scope item.')).toBeInTheDocument();
    });

    it('should have add button in empty state', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce([]);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        const addButtons = screen.getAllByRole('link', { name: /add scope item/i });
        expect(addButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Summary Statistics', () => {
    it('should display summary stats when items exist', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce(mockScopeItems);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        expect(screen.getByText('Total Scope Items')).toBeInTheDocument();
      });

      expect(screen.getByText('Total Components')).toBeInTheDocument();
      expect(screen.getByText('Total Effort')).toBeInTheDocument();
    });

    it('should calculate total scope items correctly', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce(mockScopeItems);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        const statsSection = screen.getByText('Total Scope Items').closest('dl');
        expect(statsSection?.textContent).toContain('2');
      });
    });

    it('should calculate total components correctly', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce(mockScopeItems);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        const statsSection = screen.getByText('Total Components').closest('dl');
        // First item has 2 components, second has 0 = 2 total
        expect(statsSection?.textContent).toContain('2');
      });
    });

    it('should calculate total effort correctly', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce(mockScopeItems);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        const statsSection = screen.getByText('Total Effort').closest('dl');
        // Item 1: 21 PD, Item 2: 6 PD = 27 PD total
        expect(statsSection?.textContent).toContain('27');
      });
    });

    it('should not show stats when no items', async () => {
      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce([]);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        expect(screen.queryByText('Total Scope Items')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on load failure', async () => {
      mockedReleaseService.getRelease.mockRejectedValueOnce(new Error('Failed to load data'));
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce([]);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load data')).toBeInTheDocument();
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockedReleaseService.getRelease.mockRejectedValueOnce('String error');
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce([]);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load data')).toBeInTheDocument();
      });
    });
  });

  describe('Component Type Labels', () => {
    it('should display all component type labels correctly', async () => {
      const itemsWithAllTypes: ScopeItemWithComponents[] = [{
        id: 1,
        name: 'All Types',
        description: 'Test',
        functionalDesignDays: 1,
        sitDays: 1,
        uatDays: 1,
        releaseId: 1,
        components: [
          { id: 1, name: 'C1', componentType: 'ETL', technicalDesignDays: 1, buildDays: 1, scopeItemId: 1 },
          { id: 2, name: 'C2', componentType: 'FORGEROCK_IGA', technicalDesignDays: 1, buildDays: 1, scopeItemId: 1 },
          { id: 3, name: 'C3', componentType: 'FORGEROCK_UI', technicalDesignDays: 1, buildDays: 1, scopeItemId: 1 },
          { id: 4, name: 'C4', componentType: 'FORGEROCK_IG', technicalDesignDays: 1, buildDays: 1, scopeItemId: 1 },
          { id: 5, name: 'C5', componentType: 'FORGEROCK_IDM', technicalDesignDays: 1, buildDays: 1, scopeItemId: 1 },
          { id: 6, name: 'C6', componentType: 'SAILPOINT', technicalDesignDays: 1, buildDays: 1, scopeItemId: 1 },
          { id: 7, name: 'C7', componentType: 'FUNCTIONAL_TEST', technicalDesignDays: 1, buildDays: 1, scopeItemId: 1 }
        ]
      }];

      mockedReleaseService.getRelease.mockResolvedValueOnce(mockRelease);
      mockedScopeService.getScopeItemsWithComponents.mockResolvedValueOnce(itemsWithAllTypes);

      renderWithRouter(<ScopeListPage />);

      await waitFor(() => {
        expect(screen.getByText('ETL')).toBeInTheDocument();
      });

      expect(screen.getByText('ForgeRock IGA')).toBeInTheDocument();
      expect(screen.getByText('ForgeRock UI')).toBeInTheDocument();
      expect(screen.getByText('ForgeRock IG')).toBeInTheDocument();
      expect(screen.getByText('ForgeRock IDM')).toBeInTheDocument();
      expect(screen.getByText('SailPoint')).toBeInTheDocument();
      expect(screen.getByText('Functional Test')).toBeInTheDocument();
    });
  });
});

