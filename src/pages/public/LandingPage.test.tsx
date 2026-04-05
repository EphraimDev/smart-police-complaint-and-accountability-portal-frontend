import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  it('renders the hero heading', () => {
    render(<LandingPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /Accountability Portal/i }),
    ).toBeInTheDocument();
  });

  it('has a link to file a complaint', () => {
    render(<LandingPage />);
    const links = screen.getAllByRole('link', {
      name: /file a complaint|submit a complaint/i,
    });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute('href', '/submit-complaint');
  });

  it('has a link to track a complaint', () => {
    render(<LandingPage />);
    const link = screen.getByRole('link', { name: /track your complaint/i });
    expect(link).toHaveAttribute('href', '/track-complaint');
  });

  it('renders the "How It Works" section', () => {
    render(<LandingPage />);
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getAllByText('File a Complaint').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Track Your Case')).toBeInTheDocument();
    expect(screen.getByText('Public Accountability')).toBeInTheDocument();
  });

  it('renders stats section', () => {
    render(<LandingPage />);
    expect(screen.getByText('12,000+')).toBeInTheDocument();
    expect(screen.getByText('Resolution Rate')).toBeInTheDocument();
  });
});
