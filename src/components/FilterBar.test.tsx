import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { FilterBar, type FilterField } from '@/components/FilterBar';
import { vi } from 'vitest';

const fields: FilterField[] = [
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  { name: 'dateFrom', label: 'From', type: 'date' },
  { name: 'search', label: 'Search', type: 'text', placeholder: 'Search...' },
];

describe('FilterBar', () => {
  it('renders all filter fields', () => {
    render(
      <FilterBar
        fields={fields}
        values={{ status: '', dateFrom: '', search: '' }}
        onChange={vi.fn()}
        onApply={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('renders Apply and Reset buttons', () => {
    render(
      <FilterBar
        fields={fields}
        values={{ status: '', dateFrom: '', search: '' }}
        onChange={vi.fn()}
        onApply={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('calls onChange when a filter value changes', async () => {
    const onChange = vi.fn();
    const { user } = render(
      <FilterBar
        fields={fields}
        values={{ status: '', dateFrom: '', search: '' }}
        onChange={onChange}
        onApply={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    await user.selectOptions(screen.getByLabelText('Status'), 'active');
    expect(onChange).toHaveBeenCalledWith('status', 'active');
  });

  it('calls onApply when the Apply button is clicked', async () => {
    const onApply = vi.fn();
    const { user } = render(
      <FilterBar
        fields={fields}
        values={{ status: 'active', dateFrom: '', search: '' }}
        onChange={vi.fn()}
        onApply={onApply}
        onReset={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /apply/i }));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('calls onReset when the Reset button is clicked', async () => {
    const onReset = vi.fn();
    const { user } = render(
      <FilterBar
        fields={fields}
        values={{ status: 'active', dateFrom: '', search: '' }}
        onChange={vi.fn()}
        onApply={vi.fn()}
        onReset={onReset}
      />,
    );

    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
