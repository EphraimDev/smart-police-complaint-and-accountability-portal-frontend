import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { OfficersListPage } from './OfficersListPage';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';

describe('OfficersListPage', () => {
  it('shows loading skeleton initially', () => {
    render(<OfficersListPage />);
    const skeletons = document.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays officers table after loading', async () => {
    render(<OfficersListPage />);

    expect(await screen.findByText('Inspector Chukwu')).toBeInTheDocument();
    expect(screen.getByText('NPF-4421')).toBeInTheDocument();
    expect(screen.getByText('Sergeant Abdullahi')).toBeInTheDocument();
    expect(screen.getByText('NPF-3312')).toBeInTheDocument();
  });

  it('shows empty state when no officers', async () => {
    server.use(
      http.get('/api/dashboard/officers', () =>
        HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }),
      ),
    );

    render(<OfficersListPage />);

    expect(await screen.findByText(/no officers found/i)).toBeInTheDocument();
  });

  it('shows error state with retry', async () => {
    server.use(
      http.get('/api/dashboard/officers', () =>
        HttpResponse.json({ message: 'fail' }, { status: 500 }),
      ),
    );

    render(<OfficersListPage />);

    expect(await screen.findByText(/failed to load officers/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
