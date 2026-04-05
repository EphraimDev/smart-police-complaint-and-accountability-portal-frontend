import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { FaqPage } from './FaqPage';

describe('FaqPage', () => {
  it('renders the FAQ heading', () => {
    render(<FaqPage />);
    expect(
      screen.getByRole('heading', { name: /frequently asked questions/i }),
    ).toBeInTheDocument();
  });

  it('renders all FAQ items as collapsed buttons', () => {
    render(<FaqPage />);
    const buttons = screen.getAllByRole('button', { expanded: false });
    expect(buttons.length).toBeGreaterThanOrEqual(9);
  });

  it('expands a FAQ item on click', async () => {
    const { user } = render(<FaqPage />);

    const firstQuestion = screen.getByRole('button', {
      name: /how do i file a complaint/i,
    });
    expect(firstQuestion).toHaveAttribute('aria-expanded', 'false');

    await user.click(firstQuestion);
    expect(firstQuestion).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByText(/click "file a complaint" on the home page/i),
    ).toBeInTheDocument();
  });

  it('collapses a FAQ item when clicked again', async () => {
    const { user } = render(<FaqPage />);

    const btn = screen.getByRole('button', {
      name: /how do i file a complaint/i,
    });

    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');

    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('has links to file and track complaints', () => {
    render(<FaqPage />);
    expect(screen.getByRole('link', { name: /file a complaint/i })).toHaveAttribute(
      'href',
      '/submit-complaint',
    );
    expect(screen.getByRole('link', { name: /track complaint/i })).toHaveAttribute(
      'href',
      '/track-complaint',
    );
  });
});
