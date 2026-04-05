import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import { Routes, Route } from 'react-router-dom';
import { ComplaintResultPage } from './ComplaintResultPage';

function renderWithRoute(trackingId: string) {
  return render(
    <Routes>
      <Route path="/complaint/:trackingId" element={<ComplaintResultPage />} />
    </Routes>,
    { routerProps: { initialEntries: [`/complaint/${trackingId}`] } },
  );
}

describe('ComplaintResultPage', () => {
  it('shows loading skeleton initially', () => {
    renderWithRoute('NPF-2026-AB12X');
    // Skeleton divs are aria-hidden, just confirm the section renders
    expect(document.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('displays complaint details after loading', async () => {
    renderWithRoute('NPF-2026-AB12X');

    await waitFor(() => {
      expect(screen.getByText('NPF-2026-AB12X')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Under Review').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Extortion / Bribery')).toBeInTheDocument();
    expect(screen.getByText('Ikeja Division')).toBeInTheDocument();
    expect(screen.getByText('Lagos')).toBeInTheDocument();
  });

  it('renders status history timeline', async () => {
    renderWithRoute('NPF-2026-AB12X');

    await waitFor(() => {
      expect(screen.getByText('Status History')).toBeInTheDocument();
    });

    expect(screen.getByText('Complaint received and logged.')).toBeInTheDocument();
    expect(
      screen.getByText('Assigned to oversight unit for preliminary review.'),
    ).toBeInTheDocument();
  });

  it('shows error state for unknown tracking ID', async () => {
    renderWithRoute('UNKNOWN-ID');

    await waitFor(() => {
      expect(screen.getByText('Complaint Not Found')).toBeInTheDocument();
    });
  });
});
