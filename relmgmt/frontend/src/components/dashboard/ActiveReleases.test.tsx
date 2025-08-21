import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ActiveReleases from './ActiveReleases';

describe('ActiveReleases', () => {
  it('renders section title', () => {
    render(
      <BrowserRouter>
        <ActiveReleases />
      </BrowserRouter>
    );
    expect(screen.getByText('Active Releases')).toBeInTheDocument();
  });

  it('renders at least one release', () => {
    render(
      <BrowserRouter>
        <ActiveReleases />
      </BrowserRouter>
    );
    expect(screen.getAllByTestId('release-item').length).toBeGreaterThan(0);
  });
}); 