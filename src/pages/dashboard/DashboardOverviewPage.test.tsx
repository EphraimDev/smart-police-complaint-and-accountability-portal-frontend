import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { DashboardOverviewPage } from './DashboardOverviewPage';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';

describe('DashboardOverviewPage', () => {
  it('shows loading skeleton initially', () => {
    render(<DashboardOverviewPage />);
    // Skeletons render as aria-hidden divs with animate-pulse
    const skeletons = document.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays stats after loading', async () => {
    render(<DashboardOverviewPage />);

    expect(await screen.findByText('Dashboard Overview')).toBeInTheDocument();
    expect(screen.getByText('156')).toBeInTheDocument(); // totalComplaints
    expect(screen.getByText('23')).toBeInTheDocument(); // pending
    expect(screen.getByText('14')).toBeInTheDocument(); // investigating
    expect(screen.getByText('98')).toBeInTheDocument(); // resolved
    expect(screen.getByText('240')).toBeInTheDocument(); // officers
    expect(screen.getByText('36')).toBeInTheDocument(); // stations
  });

  it('displays recent complaints', async () => {
    render(<DashboardOverviewPage />);

    expect(await screen.findByText('NPF-2026-AB12X')).toBeInTheDocument();
    expect(screen.getByText(/Extortion/)).toBeInTheDocument();
  });

  it('shows error state with retry', async () => {
    server.use(
      http.get('/api/dashboard/stats', () =>
        HttpResponse.json({ message: 'fail' }, { status: 500 }),
      ),
    );

    render(<DashboardOverviewPage />);

    expect(await screen.findByText(/failed to load dashboard/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
