import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import { ReportsPage } from './ReportsPage';

describe('ReportsPage', () => {
  it('shows loading skeleton initially', () => {
    render(<ReportsPage />);
    expect(screen.getByTestId('reports-skeleton')).toBeInTheDocument();
  });

  it('renders summary stats after loading', async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Reports & Analytics')).toBeInTheDocument();
    });

    // 156 appears in multiple stat cards, just check at least one exists
    expect(screen.getAllByText('156').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('63%')).toBeInTheDocument(); // resolutionRate
  });

  it('renders filter bar with Apply and Reset buttons', async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('renders station rankings table', async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Station Rankings')).toBeInTheDocument();
    });

    expect(screen.getByText('Ikeja Division')).toBeInTheDocument();
    expect(screen.getByText('Wuse Division')).toBeInTheDocument();
  });

  it('renders officer performance table', async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Officer Performance')).toBeInTheDocument();
    });

    expect(screen.getByText('Inspector Chukwu')).toBeInTheDocument();
    expect(screen.getByText('Sergeant Abdullahi')).toBeInTheDocument();
  });

  it('renders charts', async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Complaints Over Time')).toBeInTheDocument();
    });

    expect(screen.getByText('Status Distribution')).toBeInTheDocument();
    expect(screen.getByText('Complaints by Category')).toBeInTheDocument();
  });
});
