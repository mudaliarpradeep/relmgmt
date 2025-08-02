import { render, screen } from '@testing-library/react';
import ResourceUtilization from './ResourceUtilization';

describe('ResourceUtilization', () => {
  it('renders section title', () => {
    render(<ResourceUtilization />);
    expect(screen.getByText('Resource Utilization')).toBeInTheDocument();
  });

  it('renders at least one utilization bar', () => {
    render(<ResourceUtilization />);
    expect(screen.getAllByTestId('utilization-bar').length).toBeGreaterThan(0);
  });
}); 