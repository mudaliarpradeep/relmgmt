import { vi } from 'vitest';
import { renderWithRouter, screen, fireEvent, waitFor } from '../../test/test-utils';
import ScopeItemForm from './ScopeItemForm';
import ScopeService from '../../services/api/v1/scopeService';

vi.mock('../../services/api/v1/scopeService');
const mockedService = vi.mocked(ScopeService);

// Mock useParams to provide releaseId for create route
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ releaseId: '5' }),
  };
});

describe('ScopeItemForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('validates required fields', async () => {
    renderWithRouter(<ScopeItemForm />, { initialEntries: ['/releases/5/scope-items/new'] });

    fireEvent.click(screen.getByRole('button', { name: /create scope item/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });

  it('submits create form with valid values', async () => {
    mockedService.createScopeItem.mockResolvedValueOnce({} as any);

    renderWithRouter(<ScopeItemForm />, { initialEntries: ['/releases/5/scope-items/new'] });

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/scope item name/i), { target: { value: 'Scope A' } });
    fireEvent.change(screen.getByLabelText(/functional design \(pd\)/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/sit \(pd\)/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/uat \(pd\)/i), { target: { value: '2' } });

    // Add a component first (required by validation)
    fireEvent.click(screen.getByRole('button', { name: /add component/i }));

    // Fill in component details - the component should be added with default values of 1
    // Find the component name input field that was just added (more specific selector)
    const componentNameInput = screen.getByPlaceholderText('Component name');
    fireEvent.change(componentNameInput, { target: { value: 'Test Component' } });

    // Save the component
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    // Now submit the form
    fireEvent.click(screen.getByRole('button', { name: /create scope item/i }));

    await waitFor(() => {
      expect(mockedService.createScopeItem).toHaveBeenCalledWith(5, expect.objectContaining({ 
        name: 'Scope A',
        functionalDesignDays: 5,
        sitDays: 3,
        uatDays: 2,
        components: expect.arrayContaining([
          expect.objectContaining({
            name: 'Test Component',
            componentType: expect.any(String),
            technicalDesignDays: 1,
            buildDays: 1
          })
        ])
      }));
    });
  });
});


