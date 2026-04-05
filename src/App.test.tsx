import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import App from '@/App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getAllByText('SPCAP').length).toBeGreaterThanOrEqual(1);
  });
});
