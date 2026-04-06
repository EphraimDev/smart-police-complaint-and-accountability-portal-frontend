import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { OfficersListPage } from './OfficersListPage';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';

describe('OfficersListPage', () => {
  it('shows loading skeleton initially', () => {
    render(<OfficersListPage />);
    const skeletons = document.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders bulk upload action', async () => {
    render(<OfficersListPage />);

    expect(await screen.findByRole('button', { name: /bulk upload officers/i })).toBeInTheDocument();
  });

  it('opens bulk upload officers modal', async () => {
    const user = userEvent.setup();
    render(<OfficersListPage />);

    await user.click(await screen.findByRole('button', { name: /bulk upload officers/i }));

    expect(
      screen.getByRole('heading', { name: /bulk upload officers/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/station/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/officer upload file/i)).toBeInTheDocument();
  });

  it('uploads officer file and shows success message', async () => {
    const user = userEvent.setup();
    render(<OfficersListPage />);

    await user.click(await screen.findByRole('button', { name: /bulk upload officers/i }));

    const input = screen.getByLabelText(/officer upload file/i);
    const file = new File(['firstName,lastName\nJane,Doe'], 'officers.csv', {
      type: 'text/csv',
    });

    await user.selectOptions(screen.getByLabelText(/station/i), 'st-001');
    await user.upload(input, file);
    const dialog = screen.getByRole('dialog', { name: /bulk upload officers/i });
    await user.click(within(dialog).getByRole('button', { name: /^upload officers$/i }));

    expect(
      await screen.findByText(/2 officers uploaded successfully\./i),
    ).toBeInTheDocument();
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
      http.get('/api/v1/officers', () =>
        HttpResponse.json({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
      ),
      http.get('http://localhost:3006/api/v1/officers', () =>
        HttpResponse.json({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
      ),
    );

    render(<OfficersListPage />);

    expect(await screen.findByText(/no officers found/i)).toBeInTheDocument();
  });

  it('shows error state with retry', async () => {
    server.use(
      http.get('/api/v1/officers', () =>
        HttpResponse.json({ message: 'fail' }, { status: 500 }),
      ),
      http.get('http://localhost:3006/api/v1/officers', () =>
        HttpResponse.json({ message: 'fail' }, { status: 500 }),
      ),
    );

    render(<OfficersListPage />);

    expect(await screen.findByText(/failed to load officers/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
