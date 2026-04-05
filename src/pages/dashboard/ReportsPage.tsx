import { useState, useCallback } from 'react';
import { useReports } from '@/hooks/useQueries';
import { FilterBar, type FilterField } from '@/components/FilterBar';
import { BarChart, DonutChart, StatCard, TrendLine } from '@/components/Charts';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '@/components/Table';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/ErrorState';
import { complaintCategories, nigerianStates } from '@/types/complaint';
import type { ReportFilters } from '@/types/reports';

const statusColors: Record<string, string> = {
  received: '#6B7280',
  'under-review': '#D97706',
  investigating: '#B45309',
  resolved: '#059669',
  dismissed: '#DC2626',
};

const categoryColors = [
  'bg-primary-600',
  'bg-accent-500',
  'bg-success-600',
  'bg-warning-500',
  'bg-danger-500',
  'bg-primary-400',
  'bg-accent-300',
  'bg-gray-500',
];

const filterFields: FilterField[] = [
  {
    name: 'dateFrom',
    label: 'From Date',
    type: 'date',
  },
  {
    name: 'dateTo',
    label: 'To Date',
    type: 'date',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All Statuses',
    options: [
      { value: 'received', label: 'Received' },
      { value: 'under-review', label: 'Under Review' },
      { value: 'investigating', label: 'Investigating' },
      { value: 'resolved', label: 'Resolved' },
      { value: 'dismissed', label: 'Dismissed' },
    ],
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    placeholder: 'All Categories',
    options: complaintCategories.map((c) => ({ value: c.value, label: c.label })),
  },
  {
    name: 'state',
    label: 'State',
    type: 'select',
    placeholder: 'All States',
    options: nigerianStates.map((s) => ({ value: s, label: s })),
  },
];

const defaultFilters: Record<string, string> = {
  dateFrom: '',
  dateTo: '',
  status: '',
  category: '',
  state: '',
};

export function ReportsPage() {
  const [filterValues, setFilterValues] =
    useState<Record<string, string>>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters | undefined>();

  const { data, isLoading, isError, refetch } = useReports(appliedFilters);

  const handleChange = useCallback((name: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleApply = useCallback(() => {
    const filters: ReportFilters = {};
    if (filterValues.dateFrom) filters.dateFrom = filterValues.dateFrom;
    if (filterValues.dateTo) filters.dateTo = filterValues.dateTo;
    if (filterValues.status)
      filters.status = filterValues.status as ReportFilters['status'];
    if (filterValues.category) filters.category = filterValues.category;
    if (filterValues.state) filters.state = filterValues.state;
    setAppliedFilters(Object.keys(filters).length > 0 ? filters : undefined);
  }, [filterValues]);

  const handleReset = useCallback(() => {
    setFilterValues(defaultFilters);
    setAppliedFilters(undefined);
  }, []);

  if (isLoading) return <ReportsSkeleton />;
  if (isError)
    return <ErrorState title="Failed to load reports" onRetry={() => void refetch()} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports &amp; Analytics</h1>

      <FilterBar
        fields={filterFields}
        values={filterValues}
        onChange={handleChange}
        onApply={handleApply}
        onReset={handleReset}
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Complaints" value={data.summary.totalComplaints} />
        <StatCard
          label="This Month"
          value={data.summary.complaintsThisMonth}
          change={data.summary.changeFromLastMonth}
        />
        <StatCard label="Resolution Rate" value={`${data.summary.resolutionRate}%`} />
        <StatCard label="Avg Resolution" value={`${data.summary.avgResolutionDays}d`} />
        <StatCard
          label="Month Change"
          value={`${data.summary.changeFromLastMonth >= 0 ? '+' : ''}${data.summary.changeFromLastMonth}%`}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 md:grid-cols-2">
        <TrendLine
          title="Complaints Over Time"
          data={data.complaintsTrend.map((p) => ({ label: p.date, value: p.count }))}
        />
        <DonutChart
          title="Status Distribution"
          data={data.statusBreakdown.map((s) => ({
            label: s.status.replace('-', ' '),
            value: s.count,
            color: statusColors[s.status] ?? '#6B7280',
          }))}
        />
      </div>

      <BarChart
        title="Complaints by Category"
        data={data.categoryBreakdown.map((c, i) => ({
          label: c.category,
          value: c.count,
          color: categoryColors[i % categoryColors.length],
        }))}
      />

      {/* Station rankings table */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Station Rankings</h2>
        <Table>
          <TableHead>
            <TableRow>
              <Th>Station</Th>
              <Th>State</Th>
              <Th>Complaints</Th>
              <Th>Resolved</Th>
              <Th>Resolution Rate</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.stationRankings.map((s) => (
              <TableRow key={s.stationId}>
                <Td className="font-medium">{s.stationName}</Td>
                <Td>{s.state}</Td>
                <Td>{s.complaintCount}</Td>
                <Td>{s.resolvedCount}</Td>
                <Td>{s.resolutionRate}%</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Officer performance table */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Officer Performance</h2>
        <Table>
          <TableHead>
            <TableRow>
              <Th>Officer</Th>
              <Th>Rank</Th>
              <Th>Assigned</Th>
              <Th>Resolved</Th>
              <Th>Avg Days</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.officerPerformance.map((o) => (
              <TableRow key={o.officerId}>
                <Td className="font-medium">{o.officerName}</Td>
                <Td>{o.rank}</Td>
                <Td>{o.assignedCount}</Td>
                <Td>{o.resolvedCount}</Td>
                <Td>{o.avgResolutionDays}</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6" data-testid="reports-skeleton">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-16 w-full" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-7 w-14" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
