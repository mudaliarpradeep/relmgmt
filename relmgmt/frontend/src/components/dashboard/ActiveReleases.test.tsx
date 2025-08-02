import { render, screen } from '@testing-library/react';
import ActiveReleases from './ActiveReleases';

describe('ActiveReleases', () => {
  it('renders section title', () => {
    render(<ActiveReleases />);
    expect(screen.getByText('Active Releases')).toBeInTheDocument();
  });

  it('renders at least one release', () => {
    render(<ActiveReleases />);
    expect(screen.getAllByTestId('release-item').length).toBeGreaterThan(0);
  });
}); 