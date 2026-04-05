import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ComplaintDetailPage } from './ComplaintDetailPage';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';

function renderDetail(id = 'cmp-001') {
  return render(<ComplaintDetailPage />, {
    routerProps: { initialEntries: [`/dashboard/complaints/${id}`], initialIndex: 0 },
  });
}

// Mock useParams to return our id
import { vi } from 'vitest';
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'cmp-001' }),
  };
});

describe('ComplaintDetailPage', () => {
  it('shows loading skeleton initially', () => {
    renderDetail();
    const skeletons = document.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays complaint details after loading', async () => {
    renderDetail();

    expect(await screen.findByText('NPF-2026-AB12X')).toBeInTheDocument();
    expect(screen.getByText('Extortion / Bribery')).toBeInTheDocument();
    expect(screen.getByText('Emeka Okonkwo')).toBeInTheDocument();
    expect(screen.getByText('emeka@example.com')).toBeInTheDocument();
    expect(screen.getByText('Ikeja Division')).toBeInTheDocument();
  });

  it('shows status timeline', async () => {
    renderDetail();

    expect(await screen.findByText('Status Timeline')).toBeInTheDocument();
    expect(screen.getByText('Complaint received and logged.')).toBeInTheDocument();
    expect(screen.getByText(/Assigned to oversight unit/)).toBeInTheDocument();
  });

  it('shows evidence section', async () => {
    renderDetail();

    expect(await screen.findByText('Evidence (2)')).toBeInTheDocument();
    expect(screen.getByText('receipt-photo.jpg')).toBeInTheDocument();
    expect(screen.getByText('witness-statement.pdf')).toBeInTheDocument();
  });

  it('shows assignment panel', async () => {
    renderDetail();

    expect(await screen.findByText('Assignment')).toBeInTheDocument();
    expect(screen.getAllByText(/Inspector Chukwu/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /reassign/i })).toBeInTheDocument();
  });

  it('shows update status panel', async () => {
    renderDetail();

    expect(await screen.findByText('Update Status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change status/i })).toBeInTheDocument();
  });

  it('shows error state for non-existent complaint', async () => {
    server.use(
      http.get('/api/dashboard/complaints/:id', () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 }),
      ),
    );

    renderDetail();

    expect(await screen.findByText(/complaint not found/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
