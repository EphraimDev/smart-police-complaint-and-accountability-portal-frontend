import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import { AuditTrailPage } from './AuditTrailPage';

describe('AuditTrailPage', () => {
  it('renders audit log rows from the default endpoint', async () => {
    render(<AuditTrailPage />);

    await waitFor(() => {
      expect(screen.getByText('Complaint Update')).toBeInTheDocument();
    });

    expect(screen.getByText('Audit Trail')).toBeInTheDocument();
    expect(screen.getByText('usr-001')).toBeInTheDocument();
    expect(screen.getByText('corr-audit-001')).toBeInTheDocument();
  });

  it('shows expanded audit details', async () => {
    const { user } = render(<AuditTrailPage />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'View' }).length).toBeGreaterThan(0);
    });

    await user.click(screen.getAllByRole('button', { name: 'View' })[0]);

    expect(screen.getByText('Before State')).toBeInTheDocument();
    expect(screen.getByText('Additional Metadata')).toBeInTheDocument();
    expect(screen.getByText('Failure Reason')).toBeInTheDocument();
  });

  it('applies actor filters using the actor endpoint', async () => {
    const { user } = render(<AuditTrailPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('View')).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText('View'), 'actor');
    await user.type(screen.getByLabelText('Actor ID'), 'usr-002');
    await user.click(screen.getByRole('button', { name: /apply/i }));

    await waitFor(() => {
      expect(screen.getByText('User Create')).toBeInTheDocument();
    });

    expect(screen.getByText('audit@npf.gov.ng')).toBeInTheDocument();
    expect(screen.queryByText('admin@npf.gov.ng')).not.toBeInTheDocument();
  });
});
