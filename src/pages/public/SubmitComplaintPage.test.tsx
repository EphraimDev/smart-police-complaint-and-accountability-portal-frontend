import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import { SubmitComplaintPage } from './SubmitComplaintPage';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('SubmitComplaintPage', () => {
  it('renders the form heading', () => {
    render(<SubmitComplaintPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /file a complaint/i }),
    ).toBeInTheDocument();
  });

  it('renders all required form fields', () => {
    render(<SubmitComplaintPage />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^state/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/local government area/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/police station/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of incident/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^description/i)).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    const { user } = render(<SubmitComplaintPage />);

    const submitBtn = screen.getByRole('button', { name: /submit complaint/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });

  it('submits the form and navigates on success', async () => {
    const { user } = render(<SubmitComplaintPage />);

    // Fill required fields
    await user.type(screen.getByLabelText(/full name/i), 'Adaobi Nnamdi');
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '08012345678');
    await user.selectOptions(screen.getByLabelText(/^state/i), 'Lagos');
    await user.type(screen.getByLabelText(/local government area/i), 'Ikeja');
    await user.type(screen.getByLabelText(/police station/i), 'Ikeja Division');
    await user.type(screen.getByLabelText(/date of incident/i), '2026-03-15');
    await user.selectOptions(screen.getByLabelText(/^category/i), 'extortion');
    await user.type(
      screen.getByLabelText(/^description/i),
      'An officer at the Ikeja division demanded a bribe during a routine stop.',
    );
    await user.click(screen.getByLabelText(/I confirm/i));

    const submitBtn = screen.getByRole('button', { name: /submit complaint/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/complaint-success/NPF-2026-AB12X');
    });
  });
});
