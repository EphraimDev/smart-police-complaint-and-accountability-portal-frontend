import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { BarChart, DonutChart, StatCard, TrendLine } from '@/components/Charts';

describe('BarChart', () => {
  it('renders title and bars for each data point', () => {
    render(
      <BarChart
        title="Categories"
        data={[
          { label: 'Extortion', value: 40 },
          { label: 'Assault', value: 25 },
        ]}
      />,
    );

    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Extortion')).toBeInTheDocument();
    expect(screen.getByText('Assault')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });
});

describe('DonutChart', () => {
  it('renders title, total, and legend items', () => {
    render(
      <DonutChart
        title="Status"
        data={[
          { label: 'Resolved', value: 80, color: '#059669' },
          { label: 'Pending', value: 20, color: '#D97706' },
        ]}
      />,
    );

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument(); // total
    expect(screen.getByText('Resolved')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Total" value={156} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('156')).toBeInTheDocument();
  });

  it('renders change indicator when provided', () => {
    render(<StatCard label="Monthly" value={24} change={12} />);

    expect(screen.getByText(/12% vs last month/)).toBeInTheDocument();
  });

  it('renders negative change', () => {
    render(<StatCard label="Monthly" value={10} change={-5} />);

    expect(screen.getByText(/5% vs last month/)).toBeInTheDocument();
  });
});

describe('TrendLine', () => {
  it('renders title and start/end labels', () => {
    render(
      <TrendLine
        title="Complaints Over Time"
        data={[
          { label: 'Jan', value: 10 },
          { label: 'Feb', value: 20 },
          { label: 'Mar', value: 15 },
        ]}
      />,
    );

    expect(screen.getByText('Complaints Over Time')).toBeInTheDocument();
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
  });
});
