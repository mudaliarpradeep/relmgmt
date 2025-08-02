import { render, screen } from '@testing-library/react';
import ReleaseTimeline from './ReleaseTimeline';

describe('ReleaseTimeline', () => {
  it('renders section title', () => {
    render(<ReleaseTimeline />);
    expect(screen.getByText('Release Timeline Overview')).toBeInTheDocument();
  });

  it('renders at least one timeline row', () => {
    render(<ReleaseTimeline />);
    expect(screen.getAllByTestId('timeline-row').length).toBeGreaterThan(0);
  });
}); 