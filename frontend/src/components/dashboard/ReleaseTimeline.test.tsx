import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReleaseTimeline from './ReleaseTimeline';

describe('ReleaseTimeline', () => {
  it('renders section title', () => {
    render(
      <BrowserRouter>
        <ReleaseTimeline />
      </BrowserRouter>
    );
    expect(screen.getByText('Release Timeline Overview')).toBeInTheDocument();
  });

  it('renders at least one timeline row', () => {
    render(
      <BrowserRouter>
        <ReleaseTimeline />
      </BrowserRouter>
    );
    expect(screen.getAllByTestId('timeline-row').length).toBeGreaterThan(0);
  });
}); 