import { render, screen } from '@testing-library/react';
import AppLayout from './AppLayout';

describe('AppLayout', () => {
  it('renders without crashing', () => {
    render(<AppLayout>Test Content</AppLayout>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders Sidebar and Header', () => {
    render(<AppLayout>Test Content</AppLayout>);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders children in the main content area', () => {
    render(
      <AppLayout>
        <div data-testid="child-content">Main Content</div>
      </AppLayout>
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });
}); 