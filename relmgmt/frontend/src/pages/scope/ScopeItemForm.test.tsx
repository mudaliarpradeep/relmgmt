import { vi } from 'vitest';
import { renderWithRouter, screen, fireEvent, waitFor } from '../../test/test-utils';
import ScopeItemForm from './ScopeItemForm';
import ScopeService from '../../services/api/v1/scopeService';

vi.mock('../../services/api/v1/scopeService');
const mockedService = vi.mocked(ScopeService);

// Mock useParams to provide projectId for create route
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ projectId: '5' }),
  };
});

describe('ScopeItemForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('validates required fields', async () => {
    renderWithRouter(<ScopeItemForm />, { initialEntries: ['/projects/5/scope/new'] });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });

  it('submits create form with valid values', async () => {
    mockedService.createScopeItem.mockResolvedValueOnce({} as any);

    renderWithRouter(<ScopeItemForm />, { initialEntries: ['/projects/5/scope/new'] });

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Scope A' } });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockedService.createScopeItem).toHaveBeenCalledWith(5, expect.objectContaining({ name: 'Scope A' }));
    });
  });
});


