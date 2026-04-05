import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { StationsListPage } from './StationsListPage';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';

describe('StationsListPage', () => {
  it('shows loading skeleton initially', () => {
    render(<StationsListPage />);
    const skeletons = document.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays stations table after loading', async () => {
    render(<StationsListPage />);

    expect(await screen.findByText('Ikeja Division')).toBeInTheDocument();
    expect(screen.getByText('Lagos')).toBeInTheDocument();
    expect(screen.getByText('Wuse Division')).toBeInTheDocument();
    expect(screen.getByText('FCT')).toBeInTheDocument();
  });

  it('shows empty state when no stations', async () => {
    server.use(
      http.get('/api/dashboard/stations', () =>
        HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }),
      ),
    );

    render(<StationsListPage />);

    expect(await screen.findByText(/no stations found/i)).toBeInTheDocument();
  });

  it('shows error state with retry', async () => {
    server.use(
      http.get('/api/dashboard/stations', () =>
        HttpResponse.json({ message: 'fail' }, { status: 500 }),
      ),
    );

    render(<StationsListPage />);

    expect(await screen.findByText(/failed to load stations/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
