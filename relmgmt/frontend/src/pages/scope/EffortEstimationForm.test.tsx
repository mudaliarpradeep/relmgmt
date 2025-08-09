import { vi } from 'vitest';
import { renderWithRouter, screen, fireEvent, waitFor } from '../../test/test-utils';
import EffortEstimationForm from './EffortEstimationForm';
import ScopeService from '../../services/api/v1/scopeService';

vi.mock('../../services/api/v1/scopeService');
const mockedService = vi.mocked(ScopeService);

// Mock useParams to provide scope item id for route
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '2' }),
  };
});

describe('EffortEstimationForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('validates positive effort days (no submit when invalid)', async () => {
    renderWithRouter(<EffortEstimationForm />, { initialEntries: ['/scope/2/estimates/new'] });

    fireEvent.change(screen.getByLabelText(/effort days/i), { target: { value: '-1' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await new Promise((r) => setTimeout(r, 0));
    expect(mockedService.addEffortEstimates).not.toHaveBeenCalled();
  });

  it('submits with valid data', async () => {
    mockedService.addEffortEstimates.mockResolvedValueOnce([]);
    renderWithRouter(<EffortEstimationForm />, { initialEntries: ['/scope/2/estimates/new'] });

    fireEvent.change(screen.getByLabelText(/effort days/i), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockedService.addEffortEstimates).toHaveBeenCalledWith(2, expect.any(Array));
    });
  });
});


