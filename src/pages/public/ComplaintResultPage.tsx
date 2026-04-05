import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge, Button, Card, Skeleton, ErrorState } from '@/components';
import type { ComplaintResult, ComplaintStatus } from '@/types/complaint';
import { trackComplaint } from '@/services/api';

const statusBadge: Record<
  ComplaintStatus,
  {
    variant: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';
    label: string;
  }
> = {
  draft: { variant: 'default', label: 'Draft' },
  submitted: { variant: 'primary', label: 'Submitted' },
  acknowledged: { variant: 'primary', label: 'Acknowledged' },
  under_review: { variant: 'warning', label: 'Under Review' },
  assigned: { variant: 'accent', label: 'Assigned' },
  under_investigation: { variant: 'accent', label: 'Investigating' },
  awaiting_response: { variant: 'warning', label: 'Awaiting Response' },
  escalated: { variant: 'danger', label: 'Escalated' },
  resolved: { variant: 'success', label: 'Resolved' },
  closed: { variant: 'default', label: 'Closed' },
  rejected: { variant: 'danger', label: 'Rejected' },
  withdrawn: { variant: 'default', label: 'Withdrawn' },
};

export function ComplaintResultPage() {
  const { trackingId } = useParams<{ trackingId: string }>();
  const [complaint, setComplaint] = useState<ComplaintResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchResult() {
      setLoading(true);
      setError('');
      try {
        const data = await trackComplaint(trackingId ?? '');
        if (!cancelled) setComplaint(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unexpected error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchResult();
    return () => {
      cancelled = true;
    };
  }, [trackingId]);

  if (loading) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16">
        <Skeleton className="mb-4 h-8 w-1/2" />
        <Skeleton className="mb-2 h-4 w-3/4" />
        <Skeleton className="mb-2 h-4 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </section>
    );
  }

  if (error || !complaint) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16">
        <ErrorState
          title="Complaint Not Found"
          message={error || 'We could not locate a complaint with this tracking ID.'}
          action={
            <Link to="/track-complaint">
              <Button variant="outline">Try Another ID</Button>
            </Link>
          }
        />
      </section>
    );
  }

  const badge = statusBadge[complaint.status] ?? {
    variant: 'default' as const,
    label: complaint.status,
  };

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">Reference</p>
          <h1 className="text-xl font-bold text-gray-900">{complaint.reference}</h1>
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      {/* Details card */}
      <Card className="mt-6" padding="md">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-gray-900">{complaint.title}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Category</dt>
            <dd className="mt-1 text-gray-900">{complaint.category}</dd>
          </div>
          {complaint.severity && (
            <div>
              <dt className="font-medium text-gray-500">Severity</dt>
              <dd className="mt-1 capitalize text-gray-900">{complaint.severity}</dd>
            </div>
          )}
          {complaint.incidentLocation && (
            <div>
              <dt className="font-medium text-gray-500">Incident Location</dt>
              <dd className="mt-1 text-gray-900">{complaint.incidentLocation}</dd>
            </div>
          )}
          <div>
            <dt className="font-medium text-gray-500">Submitted</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(complaint.createdAt).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Last Updated</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(complaint.updatedAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </Card>

      {/* Status Timeline */}
      {complaint.statusHistory && complaint.statusHistory.length > 0 && (
        <Card className="mt-6" padding="md">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-700">
            Status History
          </h2>
          <ol className="relative border-l border-gray-200 pl-6">
            {complaint.statusHistory.map((entry, i) => {
              const entryBadge = statusBadge[entry.status] ?? {
                variant: 'default' as const,
                label: entry.status,
              };
              return (
                <li key={i} className="mb-6 last:mb-0">
                  <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-primary-500" />
                  <div className="flex items-center gap-2">
                    <Badge variant={entryBadge.variant}>{entryBadge.label}</Badge>
                    <time className="text-xs text-gray-400">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  {entry.reason && (
                    <p className="mt-1 text-sm text-gray-600">{entry.reason}</p>
                  )}
                </li>
              );
            })}
          </ol>
        </Card>
      )}

      <div className="mt-8 flex gap-4">
        <Link to="/track-complaint">
          <Button variant="outline">Track Another</Button>
        </Link>
        <Link to="/">
          <Button variant="ghost">Home</Button>
        </Link>
      </div>
    </section>
  );
}
