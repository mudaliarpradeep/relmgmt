import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResourceUtilization from './ResourceUtilization';

describe('ResourceUtilization', () => {
  it('renders section title', () => {
    render(
      <BrowserRouter>
        <ResourceUtilization />
      </BrowserRouter>
    );
    expect(screen.getByText('Resource Utilization')).toBeInTheDocument();
  });

  it('renders at least one utilization bar', () => {
    render(
      <BrowserRouter>
        <ResourceUtilization />
      </BrowserRouter>
    );
    expect(screen.getAllByTestId('utilization-bar').length).toBeGreaterThan(0);
  });
}); 