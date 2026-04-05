import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import { ComplaintsListPage } from './ComplaintsListPage';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';

describe('ComplaintsListPage', () => {
  it('shows loading skeleton initially', () => {
    render(<ComplaintsListPage />);
    const skeletons = document.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays complaints table after loading', async () => {
    render(<ComplaintsListPage />);

    expect(await screen.findByText('NPF-2026-AB12X')).toBeInTheDocument();
    expect(screen.getByText('Extortion / Bribery')).toBeInTheDocument();
    expect(screen.getByText('Ikeja Division')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view/i })).toBeInTheDocument();
  });

  it('shows empty state when no complaints', async () => {
    server.use(
      http.get('/api/dashboard/complaints', () =>
        HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }),
      ),
    );

    render(<ComplaintsListPage />);

    expect(await screen.findByText(/no complaints found/i)).toBeInTheDocument();
  });

  it('shows error state with retry', async () => {
    server.use(
      http.get('/api/dashboard/complaints', () =>
        HttpResponse.json({ message: 'fail' }, { status: 500 }),
      ),
    );

    render(<ComplaintsListPage />);

    expect(await screen.findByText(/failed to load complaints/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('has a status filter dropdown', () => {
    render(<ComplaintsListPage />);

    expect(
      screen.getByRole('combobox', { name: /filter by status/i }),
    ).toBeInTheDocument();
  });
});
