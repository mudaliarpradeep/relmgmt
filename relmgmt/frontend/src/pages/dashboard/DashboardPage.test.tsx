import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithRouter } from '../../test/test-utils';
import DashboardPage from './DashboardPage';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the components to isolate DashboardPage testing
vi.mock('../../components/ui/StatCard', () => ({
  default: ({ title, value, color, onClick }: { title: string; value: number | string; color: string; onClick?: () => void }) => (
    <div data-testid={`stat-card-${color}`} onClick={onClick}>
      <span data-testid="stat-title">{title}</span>
      <span data-testid="stat-value">{value}</span>
    </div>
  ),
}));

vi.mock('../../components/dashboard/ActiveReleases', () => ({
  default: () => <div data-testid="active-releases">Active Releases</div>,
}));

vi.mock('../../components/dashboard/ResourceUtilization', () => ({
  default: () => <div data-testid="resource-utilization">Resource Utilization</div>,
}));

vi.mock('../../components/dashboard/ReleaseTimeline', () => ({
  default: () => <div data-testid="release-timeline">Release Timeline</div>,
}));

vi.mock('../../components/dashboard/QuickActions', () => ({
  default: () => <div data-testid="quick-actions">Quick Actions</div>,
}));

vi.mock('../../components/dashboard/AllocationConflicts', () => ({
  default: () => <div data-testid="allocation-conflicts">Allocation Conflicts</div>,
}));

// Mock ResourceService
vi.mock('../../services/api/v1/resourceService', () => ({
  default: {
    getResources: vi.fn().mockResolvedValue({
      totalElements: 125,
      content: [],
      pageable: { pageNumber: 0, pageSize: 1 },
      totalPages: 1,
      last: true,
      size: 1,
      number: 0,
      sort: { sorted: true, unsorted: false, empty: false },
      numberOfElements: 1,
      first: true,
      empty: false
    })
  }
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard', () => {
    renderWithRouter(<DashboardPage />);
    expect(screen.getByTestId('stat-card-blue')).toBeInTheDocument();
  });

  it('renders all stat cards with correct data', async () => {
    renderWithRouter(<DashboardPage />);
    
    // Check that all stat cards are rendered
    expect(screen.getByTestId('stat-card-blue')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-green')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-red')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-purple')).toBeInTheDocument();
    
    // Check that stat titles are present
    const statTitles = screen.getAllByTestId('stat-title');
    expect(statTitles).toHaveLength(4);
    expect(statTitles[0]).toHaveTextContent('Active Releases');
    expect(statTitles[1]).toHaveTextContent('Active Resources');
    expect(statTitles[2]).toHaveTextContent('Allocation Conflicts');
    expect(statTitles[3]).toHaveTextContent('Upcoming Go-Lives');
    
    // Check that stat values are present
    const statValues = screen.getAllByTestId('stat-value');
    expect(statValues).toHaveLength(4);
    expect(statValues[0]).toHaveTextContent('4');
    // The resource count will show "..." initially while loading, then "125"
    expect(statValues[1]).toHaveTextContent('125');
    expect(statValues[2]).toHaveTextContent('3');
    expect(statValues[3]).toHaveTextContent('2');
  });

  it('renders all dashboard sections', () => {
    renderWithRouter(<DashboardPage />);
    
    // Check that all dashboard sections are rendered
    expect(screen.getByTestId('active-releases')).toBeInTheDocument();
    expect(screen.getByTestId('resource-utilization')).toBeInTheDocument();
    expect(screen.getByTestId('release-timeline')).toBeInTheDocument();
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    expect(screen.getByTestId('allocation-conflicts')).toBeInTheDocument();
  });

  it('renders dashboard sections in correct order', () => {
    renderWithRouter(<DashboardPage />);
    
    // Check that sections appear in the expected order
    const container = screen.getByTestId('stat-card-blue').parentElement;
    
    // First row: Stats
    expect(container).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');
    
    // Second row: Active Releases and Resource Utilization
    const secondRow = screen.getByTestId('active-releases').parentElement;
    expect(secondRow).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-2');
    
    // Third row: Release Timeline
    const thirdRow = screen.getByTestId('release-timeline').parentElement;
    expect(thirdRow).toHaveClass('mb-4', 'sm:mb-6');
    
    // Fourth row: Quick Actions, Allocation Conflicts
    const fourthRow = screen.getByTestId('quick-actions').parentElement;
    expect(fourthRow).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-2');
  });

  it('has proper container styling', () => {
    renderWithRouter(<DashboardPage />);
    
    const container = screen.getByTestId('stat-card-blue').parentElement?.parentElement;
    expect(container).toHaveClass('w-full', 'max-w-7xl', 'mx-auto', 'px-2', 'sm:px-4', 'lg:px-6', 'xl:px-8', 'py-4', 'sm:py-6', 'lg:py-8');
  });
}); 