import { vi } from 'vitest';
import { renderWithRouter, screen, fireEvent, waitFor } from '../../test/test-utils';
import ProjectForm from './ProjectForm';
import ProjectService from '../../services/api/v1/projectService';

vi.mock('../../services/api/v1/projectService');
const mockedService = vi.mocked(ProjectService);

// Mock useParams to provide releaseId for create route
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ releaseId: '10' }),
  };
});

describe('ProjectForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('validates required fields', async () => {
    renderWithRouter(<ProjectForm />, { initialEntries: ['/releases/10/projects/new'] });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });

  it('submits create form with valid values', async () => {
    mockedService.createProject.mockResolvedValueOnce({} as any);

    renderWithRouter(<ProjectForm />, { initialEntries: ['/releases/10/projects/new'] });

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Project A' } });
    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: 'Day 1' } });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockedService.createProject).toHaveBeenCalledWith(10, expect.objectContaining({
        name: 'Project A',
        type: 'Day 1',
      }));
    });
  });
});


