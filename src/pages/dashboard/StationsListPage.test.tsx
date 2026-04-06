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

  it('renders add station and bulk upload buttons', async () => {
    render(<StationsListPage />);

    expect(await screen.findByRole('button', { name: /add station/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bulk upload stations/i })).toBeInTheDocument();
  });

  it('opens create station modal', async () => {
    const { user } = render(<StationsListPage />);

    await user.click(await screen.findByRole('button', { name: /add station/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /add station/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/station name/i)).toBeInTheDocument();
  });

  it('opens bulk upload stations modal', async () => {
    const { user } = render(<StationsListPage />);

    await user.click(await screen.findByRole('button', { name: /bulk upload stations/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /bulk upload stations/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/station upload file/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /download station template/i })).toBeInTheDocument();
    expect(screen.getByText(/sample station template/i)).toBeInTheDocument();
  });

  it('shows empty state when no stations', async () => {
    server.use(
      http.get('http://localhost:3006/api/v1/police-stations', () =>
        HttpResponse.json({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
      ),
    );

    render(<StationsListPage />);

    expect(await screen.findByText(/no stations found/i)).toBeInTheDocument();
  });

  it('shows error state with retry', async () => {
    server.use(
      http.get('http://localhost:3006/api/v1/police-stations', () =>
        HttpResponse.json({ message: 'fail' }, { status: 500 }),
      ),
    );

    render(<StationsListPage />);

    expect(await screen.findByText(/failed to load stations/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
