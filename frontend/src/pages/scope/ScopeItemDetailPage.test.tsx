import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithRouter } from '../../test/test-utils';
import ScopeItemDetailPage from './ScopeItemDetailPage';
import ScopeService from '../../services/api/v1/scopeService';
import type { ScopeItemWithComponents } from '../../services/api/sharedTypes';

vi.mock('../../services/api/v1/scopeService');
const mockedService = vi.mocked(ScopeService);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => mockNavigate
  };
});

describe('ScopeItemDetailPage', () => {
  const mockScopeItem: ScopeItemWithComponents = {
    id: 1,
    name: 'User Authentication System',
    description: 'Complete authentication module',
    functionalDesignDays: 5,
    sitDays: 3,
    uatDays: 2,
    releaseId: 10,
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      mockedService.getScopeItemWithComponents.mockImplementation(() => new Promise(() => {}));

      renderWithRouter(<ScopeItemDetailPage />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Scope Item Information', () => {
    it('should load and display scope item data', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('User Authentication System')).toBeInTheDocument();
      });

      expect(screen.getByText('Complete authentication module')).toBeInTheDocument();
    });

    it('should not display description section when no description', async () => {
      const itemWithoutDesc = { ...mockScopeItem, description: '' };
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(itemWithoutDesc);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('User Authentication System')).toBeInTheDocument();
      });

      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render edit and delete buttons', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /edit/i })).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should have correct edit link href', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        const editLink = screen.getByRole('link', { name: /edit/i });
        expect(editLink).toHaveAttribute('href', '/scope-items/1/edit');
      });
    });
  });

  describe('Scope Item Level Estimates', () => {
    it('should display scope item level estimate table', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Scope Item Level Estimates')).toBeInTheDocument();
      });

      expect(screen.getByText('Functional Design')).toBeInTheDocument();
      expect(screen.getByText('SIT')).toBeInTheDocument();
      expect(screen.getByText('UAT')).toBeInTheDocument();
    });

    it('should display correct effort values', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('5 PD')).toBeInTheDocument(); // Functional Design
      });

      expect(screen.getByText('3 PD')).toBeInTheDocument(); // SIT
      expect(screen.getByText('2 PD')).toBeInTheDocument(); // UAT
    });

    it('should calculate and display total scope item level effort', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Total Scope Item Level')).toBeInTheDocument();
      });

      // Total = 5 + 3 + 2 = 10 PD - find within the scope item level table
      const totalRow = screen.getByText('Total Scope Item Level').closest('tr');
      expect(totalRow).toHaveTextContent('10 PD');
    });
  });

  describe('Components Section', () => {
    it('should display components table header', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Components')).toBeInTheDocument();
      });

      expect(screen.getByText('Component Name')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Technical Design (days)')).toBeInTheDocument();
      expect(screen.getByText('Build (days)')).toBeInTheDocument();
      expect(screen.getByText('Total Effort')).toBeInTheDocument();
    });

    it('should display all components', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Auth API')).toBeInTheDocument();
      });

      expect(screen.getByText('Auth UI')).toBeInTheDocument();
    });

    it('should display component types with proper labels', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('SailPoint')).toBeInTheDocument();
      });

      expect(screen.getByText('ForgeRock UI')).toBeInTheDocument();
    });

    it('should display component effort values', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        const cells = screen.getAllByRole('cell');
        const cellTexts = cells.map(cell => cell.textContent);

        // Auth API: technical=2, build=5, total=7
        expect(cellTexts).toContain('2');
        expect(cellTexts).toContain('5');
        expect(cellTexts).toContain('7 PD');

        // Auth UI: technical=1, build=3, total=4
        expect(cellTexts).toContain('1');
        expect(cellTexts).toContain('3');
        expect(cellTexts).toContain('4 PD');
      });
    });

    it('should show empty state when no components', async () => {
      const itemWithoutComponents = { ...mockScopeItem, components: [] };
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(itemWithoutComponents);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('No components yet')).toBeInTheDocument();
      });
    });

    it('should have add component button', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        const addButton = screen.getByRole('link', { name: /add component/i });
        expect(addButton).toHaveAttribute('href', '/scope-items/1/edit');
      });
    });
  });

  describe('Effort Summary', () => {
    it('should display effort summary section', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Effort Summary')).toBeInTheDocument();
      });
    });

    it('should calculate scope item level effort', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Scope Item Level:')).toBeInTheDocument();
      });

      // Scope level = 5 + 3 + 2 = 10 PD
      const summarySection = screen.getByText('Effort Summary').parentElement;
      expect(summarySection?.textContent).toContain('10 PD');
    });

    it('should calculate component level effort', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Component Level:')).toBeInTheDocument();
      });

      // Component level = (2+5) + (1+3) = 11 PD
      const summarySection = screen.getByText('Effort Summary').parentElement;
      expect(summarySection?.textContent).toContain('11 PD');
    });

    it('should calculate total effort', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Total Effort:')).toBeInTheDocument();
      });

      // Total = 10 (scope) + 11 (components) = 21 PD
      const summarySection = screen.getByText('Effort Summary').parentElement;
      expect(summarySection?.textContent).toContain('21 PD');
    });
  });

  describe('Navigation Footer', () => {
    it('should have back to scope items link', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: /back to scope items/i });
        expect(backLink).toHaveAttribute('href', '/releases/10/scope-items');
      });
    });
  });

  describe('Delete Functionality', () => {
    it('should check if item can be deleted before confirmation', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);
      mockedService.canDeleteScopeItem.mockResolvedValueOnce(true);
      mockedService.deleteScopeItem.mockResolvedValueOnce(undefined);

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithRouter(<ScopeItemDetailPage />);

      const deleteButton = await screen.findByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockedService.canDeleteScopeItem).toHaveBeenCalledWith(1);
      });

      expect(confirmSpy).toHaveBeenCalled();
    });

    it('should show error if item cannot be deleted', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);
      mockedService.canDeleteScopeItem.mockResolvedValueOnce(false);

      renderWithRouter(<ScopeItemDetailPage />);

      const deleteButton = await screen.findByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Cannot delete scope item: it has components')).toBeInTheDocument();
      });

      expect(mockedService.deleteScopeItem).not.toHaveBeenCalled();
    });

    it('should delete item when confirmed', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);
      mockedService.canDeleteScopeItem.mockResolvedValueOnce(true);
      mockedService.deleteScopeItem.mockResolvedValueOnce(undefined);

      vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithRouter(<ScopeItemDetailPage />);

      const deleteButton = await screen.findByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockedService.deleteScopeItem).toHaveBeenCalledWith(1);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/releases/10/scope-items');
    });

    it('should not delete when cancelled', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(mockScopeItem);
      mockedService.canDeleteScopeItem.mockResolvedValueOnce(true);

      vi.spyOn(window, 'confirm').mockReturnValue(false);

      renderWithRouter(<ScopeItemDetailPage />);

      const deleteButton = await screen.findByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockedService.canDeleteScopeItem).toHaveBeenCalled();
      });

      expect(mockedService.deleteScopeItem).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display error when loading fails', async () => {
      mockedService.getScopeItemWithComponents.mockRejectedValueOnce(new Error('Failed to load scope item'));

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load scope item')).toBeInTheDocument();
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockedService.getScopeItemWithComponents.mockRejectedValueOnce('String error');

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load scope item')).toBeInTheDocument();
      });
    });

    it('should display "Not found" when no data', async () => {
      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(null as unknown as ScopeItemWithComponents);

      renderWithRouter(<ScopeItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Not found')).toBeInTheDocument();
      });
    });
  });

  describe('Component Type Labels', () => {
    it('should handle all component types', async () => {
      const itemWithAllTypes: ScopeItemWithComponents = {
        ...mockScopeItem,
        components: [
          { id: 1, name: 'C1', componentType: 'ETL', technicalDesignDays: 1, buildDays: 1, scopeItemId: 1 },
          { id: 2, name: 'C2', componentType: 'FORGEROCK_IGA', technicalDesignDays: 1, buildDays: 1, scopeItemId: 1 },
          { id: 3, name: 'C3', componentType: 'FORGEROCK_UI', technicalDesignDays: 1, buildDays: 1, scopeItemId: 1 },
          { id: 4, name: 'C4', componentType: 'FORGEROCK_IG', technicalDesignDays: 1, buildDays: 1, scopeItemId: 1 },
          { id: 5, name: 'C5', componentType: 'FORGEROCK_IDM', technicalDesignDays: 1, buildDays: 1, scopeItemId: 1 },
          { id: 6, name: 'C6', componentType: 'SAILPOINT', technicalDesignDays: 1, buildDays: 1, scopeItemId: 1 },
          { id: 7, name: 'C7', componentType: 'FUNCTIONAL_TEST', technicalDesignDays: 1, buildDays: 1, scopeItemId: 1 }
        ]
      };

      mockedService.getScopeItemWithComponents.mockResolvedValueOnce(itemWithAllTypes);

      renderWithRouter(<ScopeItemDetailPage />);

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

