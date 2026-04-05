import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { TrackComplaintPage } from './TrackComplaintPage';

describe('TrackComplaintPage', () => {
  it('renders the heading', () => {
    render(<TrackComplaintPage />);
    expect(
      screen.getByRole('heading', { name: /track your complaint/i }),
    ).toBeInTheDocument();
  });

  it('renders the tracking ID input', () => {
    render(<TrackComplaintPage />);
    expect(screen.getByLabelText(/tracking id/i)).toBeInTheDocument();
  });

  it('shows an error when submitting empty', async () => {
    const { user } = render(<TrackComplaintPage />);

    const btn = screen.getByRole('button', { name: /look up complaint/i });
    await user.click(btn);

    expect(screen.getByText(/please enter your tracking id/i)).toBeInTheDocument();
  });
});
