import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge, Button, Card, Skeleton, ErrorState } from '@/components';
import type { ComplaintResult, ComplaintStatus } from '@/types/complaint';

const statusBadge: Record<
  ComplaintStatus,
  {
    variant: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';
    label: string;
  }
> = {
  received: { variant: 'primary', label: 'Received' },
  'under-review': { variant: 'accent', label: 'Under Review' },
  investigating: { variant: 'warning', label: 'Investigating' },
  resolved: { variant: 'success', label: 'Resolved' },
  dismissed: { variant: 'danger', label: 'Dismissed' },
};

export function ComplaintResultPage() {
  const { trackingId } = useParams<{ trackingId: string }>();
  const [complaint, setComplaint] = useState<ComplaintResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchComplaint() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/complaints/${trackingId}`);
        if (!res.ok) {
          if (res.status === 404)
            throw new Error('Complaint not found. Please check your tracking ID.');
          throw new Error('Failed to fetch complaint details.');
        }
        const data: ComplaintResult = await res.json();
        if (!cancelled) setComplaint(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unexpected error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchComplaint();
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

  const badge = statusBadge[complaint.status];

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">Tracking ID</p>
          <h1 className="text-xl font-bold text-gray-900">{complaint.trackingId}</h1>
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      {/* Details card */}
      <Card className="mt-6" padding="md">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-gray-500">Category</dt>
            <dd className="mt-1 text-gray-900">{complaint.category}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Police Station</dt>
            <dd className="mt-1 text-gray-900">{complaint.policeStation}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">State</dt>
            <dd className="mt-1 text-gray-900">{complaint.state}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Submitted</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(complaint.submittedAt).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Last Updated</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(complaint.lastUpdated).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </Card>

      {/* Status Timeline */}
      {complaint.statusHistory.length > 0 && (
        <Card className="mt-6" padding="md">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-700">
            Status History
          </h2>
          <ol className="relative border-l border-gray-200 pl-6">
            {complaint.statusHistory.map((entry, i) => {
              const entryBadge = statusBadge[entry.status];
              return (
                <li key={i} className="mb-6 last:mb-0">
                  <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-primary-500" />
                  <div className="flex items-center gap-2">
                    <Badge variant={entryBadge.variant}>{entryBadge.label}</Badge>
                    <time className="text-xs text-gray-400">
                      {new Date(entry.date).toLocaleDateString()}
                    </time>
                  </div>
                  {entry.note && (
                    <p className="mt-1 text-sm text-gray-600">{entry.note}</p>
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
