import type { ReactNode } from 'react';
import { Button } from './Button';

export interface FilterField {
  name: string;
  label: string;
  type: 'select' | 'date' | 'text';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface FilterBarProps {
  fields: FilterField[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onApply: () => void;
  onReset: () => void;
  children?: ReactNode;
  className?: string;
}

export function FilterBar({
  fields,
  values,
  onChange,
  onApply,
  onReset,
  children,
  className = '',
}: FilterBarProps) {
  return (
    <div
      className={`flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4 ${className}`}
      role="search"
      aria-label="Filters"
    >
      {fields.map((field) => (
        <div key={field.name} className="min-w-[160px] flex-1">
          <label
            htmlFor={`filter-${field.name}`}
            className="mb-1 block text-xs font-medium text-gray-600"
          >
            {field.label}
          </label>
          {field.type === 'select' ? (
            <select
              id={`filter-${field.name}`}
              value={values[field.name] ?? ''}
              onChange={(e) => onChange(field.name, e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              {field.placeholder && <option value="">{field.placeholder}</option>}
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`filter-${field.name}`}
              type={field.type}
              value={values[field.name] ?? ''}
              onChange={(e) => onChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          )}
        </div>
      ))}

      <div className="flex gap-2">
        <Button size="sm" onClick={onApply}>
          Apply
        </Button>
        <Button size="sm" variant="ghost" onClick={onReset}>
          Reset
        </Button>
      </div>

      {children}
    </div>
  );
}
