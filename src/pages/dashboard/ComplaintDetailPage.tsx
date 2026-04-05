import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useComplaint,
  useAssignComplaint,
  useUpdateComplaintStatus,
  useOfficers,
} from '@/hooks/useQueries';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { Textarea } from '@/components/Textarea';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/ErrorState';
import type { ComplaintStatus } from '@/types/complaint';
import type { StatusHistoryEntry, EvidenceItem } from '@/types/dashboard';

/* ── Status helpers ── */
const statusVariant: Record<
  ComplaintStatus,
  'default' | 'warning' | 'accent' | 'success' | 'danger'
> = {
  received: 'default',
  'under-review': 'warning',
  investigating: 'accent',
  resolved: 'success',
  dismissed: 'danger',
};

const statusLabel: Record<ComplaintStatus, string> = {
  received: 'Received',
  'under-review': 'Under Review',
  investigating: 'Investigating',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
};

const statusOptions = Object.entries(statusLabel).map(([value, label]) => ({
  value,
  label,
}));

/* ── Main page ── */
export function ComplaintDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: complaint, isLoading, isError, refetch } = useComplaint(id);

  if (isLoading) return <ComplaintDetailSkeleton />;
  if (isError || !complaint) {
    return (
      <ErrorState
        title="Complaint not found"
        message="The requested complaint could not be loaded."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/dashboard/complaints"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back to complaints
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            {complaint.trackingId}
          </h1>
        </div>
        <Badge variant={statusVariant[complaint.status]}>
          {statusLabel[complaint.status]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column – details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Complaint info */}
          <Card padding="none">
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Complaint Details</h2>
            </CardHeader>
            <CardBody>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Dd label="Category" value={complaint.category} />
                <Dd label="Status" value={statusLabel[complaint.status]} />
                <Dd label="Police Station" value={complaint.policeStation} />
                <Dd label="State" value={complaint.state} />
                <Dd label="LGA" value={complaint.lga} />
                <Dd
                  label="Incident Date"
                  value={new Date(complaint.incidentDate).toLocaleDateString()}
                />
                {complaint.officerName && (
                  <Dd label="Officer Named" value={complaint.officerName} />
                )}
                {complaint.officerBadgeNumber && (
                  <Dd label="Badge Number" value={complaint.officerBadgeNumber} />
                )}
              </dl>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-xs font-medium uppercase text-gray-500">Description</p>
                <p className="mt-1 whitespace-pre-line text-sm text-gray-700">
                  {complaint.description}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Complainant info */}
          <Card padding="none">
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Complainant Information</h2>
            </CardHeader>
            <CardBody>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Dd label="Full Name" value={complaint.fullName} />
                <Dd label="Email" value={complaint.email} />
                <Dd label="Phone" value={complaint.phone} />
              </dl>
            </CardBody>
          </Card>

          {/* Evidence */}
          <EvidenceSection evidence={complaint.evidence} />

          {/* Timeline */}
          <StatusTimeline history={complaint.statusHistory} />
        </div>

        {/* Right column – actions */}
        <div className="space-y-6">
          <AssignmentPanel
            complaintId={complaint.id}
            assignedOfficerName={complaint.assignedOfficerName}
          />
          <UpdateStatusPanel
            complaintId={complaint.id}
            currentStatus={complaint.status}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Description list helper ── */
function Dd({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
    </div>
  );
}

/* ── Status Timeline ── */
function StatusTimeline({ history }: { history: StatusHistoryEntry[] }) {
  return (
    <Card padding="none">
      <CardHeader>
        <h2 className="font-semibold text-gray-900">Status Timeline</h2>
      </CardHeader>
      <CardBody>
        <ol className="relative border-l border-gray-200 pl-6">
          {history.map((entry, i) => (
            <li key={i} className="mb-6 last:mb-0">
              <span className="absolute -left-1.5 h-3 w-3 rounded-full border-2 border-white bg-primary-500" />
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant[entry.status]}>
                  {statusLabel[entry.status]}
                </Badge>
                <time className="text-xs text-gray-400">
                  {new Date(entry.date).toLocaleString()}
                </time>
              </div>
              <p className="mt-1 text-sm text-gray-700">{entry.note}</p>
              {entry.updatedBy && (
                <p className="mt-0.5 text-xs text-gray-400">by {entry.updatedBy}</p>
              )}
            </li>
          ))}
        </ol>
      </CardBody>
    </Card>
  );
}

/* ── Evidence UI ── */
function EvidenceSection({ evidence }: { evidence: EvidenceItem[] }) {
  if (evidence.length === 0) return null;

  return (
    <Card padding="none">
      <CardHeader>
        <h2 className="font-semibold text-gray-900">Evidence ({evidence.length})</h2>
      </CardHeader>
      <CardBody>
        <ul className="divide-y divide-gray-100">
          {evidence.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{e.fileName}</p>
                <p className="text-xs text-gray-500">
                  {e.fileType} — {(e.fileSize / 1024).toFixed(0)} KB —{' '}
                  {new Date(e.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <a
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 shrink-0 text-sm font-medium text-primary-700 hover:text-primary-800"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

/* ── Assignment Panel ── */
function AssignmentPanel({
  complaintId,
  assignedOfficerName,
}: {
  complaintId: string;
  assignedOfficerName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const { data: officersData } = useOfficers(1);
  const assignMutation = useAssignComplaint(complaintId);

  const handleAssign = () => {
    if (!selectedOfficer) return;
    assignMutation.mutate(
      { officerId: selectedOfficer },
      {
        onSuccess: () => {
          setOpen(false);
          setSelectedOfficer('');
        },
      },
    );
  };

  return (
    <Card padding="none">
      <CardHeader>
        <h2 className="font-semibold text-gray-900">Assignment</h2>
      </CardHeader>
      <CardBody>
        {assignedOfficerName ? (
          <p className="text-sm text-gray-700">
            Assigned to <span className="font-medium">{assignedOfficerName}</span>
          </p>
        ) : (
          <p className="text-sm text-gray-500">Not yet assigned</p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setOpen(true)}
        >
          {assignedOfficerName ? 'Reassign' : 'Assign Officer'}
        </Button>
      </CardBody>

      <Modal open={open} onClose={() => setOpen(false)} title="Assign Officer">
        <div className="space-y-4">
          <Select
            label="Officer"
            placeholder="Select an officer"
            options={
              officersData?.data.map((o) => ({
                value: o.id,
                label: `${o.fullName} (${o.badgeNumber})`,
              })) ?? []
            }
            value={selectedOfficer}
            onChange={(e) => setSelectedOfficer(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAssign}
              loading={assignMutation.isPending}
              disabled={!selectedOfficer}
            >
              Assign
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

/* ── Update Status Panel ── */
function UpdateStatusPanel({
  complaintId,
  currentStatus,
}: {
  complaintId: string;
  currentStatus: ComplaintStatus;
}) {
  const [open, setOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const updateMutation = useUpdateComplaintStatus(complaintId);

  const handleUpdate = () => {
    if (!newStatus || !note) return;
    updateMutation.mutate(
      { status: newStatus as ComplaintStatus, note },
      {
        onSuccess: () => {
          setOpen(false);
          setNewStatus('');
          setNote('');
        },
      },
    );
  };

  return (
    <Card padding="none">
      <CardHeader>
        <h2 className="font-semibold text-gray-900">Update Status</h2>
      </CardHeader>
      <CardBody>
        <p className="text-sm text-gray-700">
          Current:{' '}
          <Badge variant={statusVariant[currentStatus]}>
            {statusLabel[currentStatus]}
          </Badge>
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setOpen(true)}
        >
          Change Status
        </Button>
      </CardBody>

      <Modal open={open} onClose={() => setOpen(false)} title="Update Complaint Status">
        <div className="space-y-4">
          <Select
            label="New Status"
            placeholder="Select status"
            options={statusOptions}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          />
          <Textarea
            label="Note"
            placeholder="Reason for status change…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdate}
              loading={updateMutation.isPending}
              disabled={!newStatus || !note}
            >
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

/* ── Loading skeleton ── */
function ComplaintDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-2 h-4 w-28" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <Skeleton className="mb-4 h-5 w-40" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="mb-1 h-3 w-16" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <Skeleton className="mb-3 h-5 w-24" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}
