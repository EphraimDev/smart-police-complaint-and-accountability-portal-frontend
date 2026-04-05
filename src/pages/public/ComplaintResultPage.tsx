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

function AttachmentPreview({
  attachmentUrl,
  originalName,
  mimeType,
}: {
  attachmentUrl: string;
  originalName: string;
  mimeType: string;
}) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = '';

    async function loadPreview() {
      try {
        setPreviewError(false);
        const response = await fetch(attachmentUrl);
        if (!response.ok) throw new Error('Failed to load attachment preview');

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);

        if (!cancelled) setPreviewUrl(objectUrl);
      } catch {
        if (!cancelled) setPreviewError(true);
      }
    }

    loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachmentUrl]);

  if (previewError || !previewUrl) return null;

  if (mimeType.startsWith('video/')) {
    return (
      <video controls preload="metadata" className="max-h-96 w-full bg-black">
        <source src={previewUrl} type={mimeType} />
        Your browser does not support video playback.
      </video>
    );
  }

  if (mimeType.startsWith('image/')) {
    return (
      <img
        src={previewUrl}
        alt={originalName}
        className="max-h-96 w-full bg-white object-contain"
      />
    );
  }

  if (mimeType === 'application/pdf') {
    return <iframe src={previewUrl} title={originalName} className="h-96 w-full" />;
  }

  return null;
}

export function ComplaintResultPage() {
  const { trackingId } = useParams<{ trackingId: string }>();
  const [complaint, setComplaint] = useState<ComplaintResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function fetchResult(showSkeleton = true) {
    if (showSkeleton) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError('');
    try {
      const data = await trackComplaint(trackingId ?? '');
      console.log('Fetched complaint data:', data);
      setComplaint(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      if (showSkeleton) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadComplaint() {
      if (loading) {
        setLoading(true);
      }
      setError('');
      try {
        const data = await trackComplaint(trackingId ?? '');
        console.log('Fetched complaint data:', data);
        if (!cancelled) setComplaint(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unexpected error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadComplaint();
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

  if (!complaint) {
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

  const badge = statusBadge[complaint.data.status] ?? {
    variant: 'default' as const,
    label: complaint.data.status,
  };

  const formatFileSize = (fileSize: string) => {
    const size = Number(fileSize);
    if (!Number.isFinite(size) || size <= 0) return fileSize;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getAttachmentUrl = (fileUrl: string) => `${import.meta.env.VITE_API_BASE_URL}${fileUrl}`;

  const getAttachmentPreviewType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'application/pdf') return 'pdf';
    return 'other';
  };

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">Reference</p>
          <h1 className="text-xl font-bold text-gray-900">
            {complaint.data.referenceNumber}
          </h1>
          {error && <p className="mt-2 text-sm text-danger-600">{error}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              void fetchResult(false);
            }}
            disabled={refreshing}
            className="inline-flex items-center gap-2"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
      </div>

      {/* Details card */}
      <Card className="mt-6" padding="md">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-gray-900">{complaint.data.title}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Category</dt>
            <dd className="mt-1 text-gray-900">{complaint.data.category}</dd>
          </div>
          {complaint.data.severity && (
            <div>
              <dt className="font-medium text-gray-500">Severity</dt>
              <dd className="mt-1 capitalize text-gray-900">{complaint.data.severity}</dd>
            </div>
          )}
          {complaint.data.incidentLocation && (
            <div>
              <dt className="font-medium text-gray-500">Incident Location</dt>
              <dd className="mt-1 text-gray-900">{complaint.data.incidentLocation}</dd>
            </div>
          )}
          <div>
            <dt className="font-medium text-gray-500">Submitted</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(complaint.data.createdAt).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Last Updated</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(complaint.data.updatedAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-gray-100 pt-6">
          <dt className="font-medium text-gray-500">Description</dt>
          <dd className="mt-1 whitespace-pre-line text-gray-900">
            {complaint.data.description}
          </dd>
        </div>

        {complaint.data.attachments.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h2 className="font-medium text-gray-500">Attached Files</h2>
            <ul className="mt-3 space-y-3">
              {complaint.data.attachments.map((attachment) => {
                const attachmentUrl = getAttachmentUrl(attachment.fileUrl);
                const previewType = getAttachmentPreviewType(attachment.mimeType);

                return (
                  <li key={attachment.id} className="rounded-lg border border-gray-200 p-3">
                    <a
                      href={attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-primary-700 hover:underline"
                    >
                      {attachment.originalName}
                    </a>
                    <p className="mt-1 text-sm text-gray-500">
                      {attachment.mimeType} · {formatFileSize(attachment.fileSize)}
                    </p>
                    {attachment.description && (
                      <p className="mt-2 text-sm text-gray-700">{attachment.description}</p>
                    )}

                    {previewType !== 'other' && (
                      <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        <AttachmentPreview
                          attachmentUrl={attachmentUrl}
                          originalName={attachment.originalName}
                          mimeType={attachment.mimeType}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Card>

      {/* Status Timeline */}
      {complaint.data.statusHistory && complaint.data.statusHistory.length > 0 && (
        <Card className="mt-6" padding="md">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-700">
            Status History
          </h2>
          <ol className="relative border-l border-gray-200 pl-6">
            {complaint.data.statusHistory.map((entry, i) => {
              const entryBadge = statusBadge[entry.newStatus] ?? {
                variant: 'default' as const,
                label: entry.newStatus,
              };
              return (
                <li key={i} className="mb-6 last:mb-0">
                  <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-primary-500" />
                  <div className="flex items-center gap-2">
                    <Badge variant={entryBadge.variant}>{entryBadge.label}</Badge>
                    <time className="text-xs text-gray-400">
                      {new Date(entry.changedAt).toLocaleDateString()}
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
