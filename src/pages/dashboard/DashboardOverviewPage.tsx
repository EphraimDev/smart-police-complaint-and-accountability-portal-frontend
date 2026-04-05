import { Link } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useQueries';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/ErrorState';
import type { ComplaintStatus } from '@/types/complaint';

const statusBadge: Record<
  ComplaintStatus,
  {
    label: string;
    variant: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  }
> = {
  draft: { label: 'Draft', variant: 'default' },
  submitted: { label: 'Submitted', variant: 'primary' },
  acknowledged: { label: 'Acknowledged', variant: 'primary' },
  under_review: { label: 'Under Review', variant: 'warning' },
  assigned: { label: 'Assigned', variant: 'accent' },
  under_investigation: { label: 'Investigating', variant: 'accent' },
  awaiting_response: { label: 'Awaiting Response', variant: 'warning' },
  escalated: { label: 'Escalated', variant: 'danger' },
  resolved: { label: 'Resolved', variant: 'success' },
  closed: { label: 'Closed', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'danger' },
  withdrawn: { label: 'Withdrawn', variant: 'default' },
};

export function DashboardOverviewPage() {
  const { data, isLoading, isError, refetch } = useDashboardStats();

  if (isLoading) return <DashboardSkeleton />;
  if (isError)
    return <ErrorState title="Failed to load dashboard" onRetry={() => void refetch()} />;
  if (!data) return null;

  const stats = [
    { label: 'Total Complaints', value: data.totalComplaints, color: 'text-primary-700' },
    { label: 'Pending Review', value: data.pendingComplaints, color: 'text-warning-600' },
    {
      label: 'Investigating',
      value: data.investigatingComplaints,
      color: 'text-accent-600',
    },
    { label: 'Resolved', value: data.resolvedComplaints, color: 'text-success-600' },
    { label: 'Officers', value: data.totalOfficers, color: 'text-primary-600' },
    { label: 'Stations', value: data.totalStations, color: 'text-gray-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} padding="sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {s.label}
            </p>
            <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Recent complaints */}
      <Card padding="none">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
          <Link
            to="/dashboard/complaints"
            className="text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            View all
          </Link>
        </div>

        {data.recentComplaints.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            No recent complaints.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.recentComplaints.map((c) => {
              const badge = statusBadge[c.status] ?? {
                label: c.status,
                variant: 'default' as const,
              };
              return (
                <Link
                  key={c.id}
                  to={`/dashboard/complaints/${c.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {c.reference}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {c.category} — {c.title}
                    </p>
                  </div>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-7 w-14" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Skeleton className="mb-4 h-5 w-40" />
        <Skeleton className="mb-3 h-4 w-full" />
        <Skeleton className="mb-3 h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
