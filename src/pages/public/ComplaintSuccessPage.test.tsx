import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { Routes, Route } from 'react-router-dom';
import { ComplaintSuccessPage } from './ComplaintSuccessPage';

function renderWithRoute(trackingId: string) {
  return render(
    <Routes>
      <Route path="/complaint-success/:trackingId" element={<ComplaintSuccessPage />} />
    </Routes>,
    { routerProps: { initialEntries: [`/complaint-success/${trackingId}`] } },
  );
}

describe('ComplaintSuccessPage', () => {
  it('renders the success heading', () => {
    renderWithRoute('NPF-2026-AB12X');
    expect(
      screen.getByRole('heading', { name: /submitted successfully/i }),
    ).toBeInTheDocument();
  });

  it('displays the tracking ID', () => {
    renderWithRoute('NPF-2026-AB12X');
    expect(screen.getByText('NPF-2026-AB12X')).toBeInTheDocument();
  });

  it('has a link to track the complaint', () => {
    renderWithRoute('NPF-2026-AB12X');
    const link = screen.getByRole('link', { name: /track my complaint/i });
    expect(link).toHaveAttribute('href', '/track-complaint?id=NPF-2026-AB12X');
  });

  it('has a link back to home', () => {
    renderWithRoute('NPF-2026-AB12X');
    const link = screen.getByRole('link', { name: /back to home/i });
    expect(link).toHaveAttribute('href', '/');
  });
});
