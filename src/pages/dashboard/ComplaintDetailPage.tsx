import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useComplaint,
  useAssignComplaint,
  useUpdateComplaintStatus,
  useOfficers,
  useStatusHistory,
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
import type { StatusHistoryEntry } from '@/types/dashboard';

/* ── Status helpers ── */
const statusVariant: Record<
  ComplaintStatus,
  'default' | 'warning' | 'accent' | 'success' | 'danger' | 'primary'
> = {
  draft: 'default',
  submitted: 'primary',
  acknowledged: 'primary',
  under_review: 'warning',
  assigned: 'accent',
  under_investigation: 'accent',
  awaiting_response: 'warning',
  escalated: 'danger',
  resolved: 'success',
  closed: 'default',
  rejected: 'danger',
  withdrawn: 'default',
};

const statusLabel: Record<ComplaintStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  acknowledged: 'Acknowledged',
  under_review: 'Under Review',
  assigned: 'Assigned',
  under_investigation: 'Investigating',
  awaiting_response: 'Awaiting Response',
  escalated: 'Escalated',
  resolved: 'Resolved',
  closed: 'Closed',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
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
            {complaint.reference}
          </h1>
        </div>
        <Badge variant={statusVariant[complaint.status] ?? 'default'}>
          {statusLabel[complaint.status] ?? complaint.status}
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
                <Dd label="Title" value={complaint.title} />
                <Dd label="Category" value={complaint.category} />
                <Dd label="Status" value={statusLabel[complaint.status] ?? complaint.status} />
                <Dd label="Severity" value={complaint.severity ?? '—'} />
                {complaint.station && (
                  <Dd label="Police Station" value={complaint.station.name} />
                )}
                {complaint.incidentLocation && (
                  <Dd label="Incident Location" value={complaint.incidentLocation} />
                )}
                {complaint.incidentDate && (
                  <Dd
                    label="Incident Date"
                    value={new Date(complaint.incidentDate).toLocaleDateString()}
                  />
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
                <Dd label="Name" value={complaint.complainantName ?? (complaint.isAnonymous ? 'Anonymous' : '—')} />
                <Dd label="Email" value={complaint.complainantEmail ?? '—'} />
                <Dd label="Phone" value={complaint.complainantPhone ?? '—'} />
              </dl>
            </CardBody>
          </Card>

          {/* Timeline */}
          <StatusTimeline complaintId={complaint.id} />
        </div>

        {/* Right column – actions */}
        <div className="space-y-6">
          <AssignmentPanel
            complaintId={complaint.id}
            assignedInvestigator={complaint.assignedInvestigator}
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
function StatusTimeline({ complaintId }: { complaintId: string }) {
  const { data: history } = useStatusHistory(complaintId);

  if (!history || history.length === 0) {
    return (
      <Card padding="none">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Status Timeline</h2>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-gray-500">No status history available.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card padding="none">
      <CardHeader>
        <h2 className="font-semibold text-gray-900">Status Timeline</h2>
      </CardHeader>
      <CardBody>
        <ol className="relative border-l border-gray-200 pl-6">
          {history.map((entry: StatusHistoryEntry) => (
            <li key={entry.id} className="mb-6 last:mb-0">
              <span className="absolute -left-1.5 h-3 w-3 rounded-full border-2 border-white bg-primary-500" />
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant[entry.status] ?? 'default'}>
                  {statusLabel[entry.status] ?? entry.status}
                </Badge>
                <time className="text-xs text-gray-400">
                  {new Date(entry.createdAt).toLocaleString()}
                </time>
              </div>
              {entry.reason && (
                <p className="mt-1 text-sm text-gray-700">{entry.reason}</p>
              )}
              {entry.changedBy && (
                <p className="mt-0.5 text-xs text-gray-400">
                  by {entry.changedBy.firstName} {entry.changedBy.lastName}
                </p>
              )}
            </li>
          ))}
        </ol>
      </CardBody>
    </Card>
  );
}

/* ── Assignment Panel ── */
function AssignmentPanel({
  complaintId,
  assignedInvestigator,
}: {
  complaintId: string;
  assignedInvestigator?: { id: string; firstName: string; lastName: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const { data: officersData } = useOfficers(1);
  const assignMutation = useAssignComplaint(complaintId);

  const assignedName = assignedInvestigator
    ? `${assignedInvestigator.firstName} ${assignedInvestigator.lastName}`
    : null;

  const handleAssign = () => {
    if (!selectedOfficer) return;
    assignMutation.mutate(
      { complaintId, assigneeId: selectedOfficer },
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
        {assignedName ? (
          <p className="text-sm text-gray-700">
            Assigned to <span className="font-medium">{assignedName}</span>
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
          {assignedName ? 'Reassign' : 'Assign Officer'}
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
                label: `${o.firstName} ${o.lastName} (${o.badgeNumber})`,
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
  const [reason, setReason] = useState('');
  const updateMutation = useUpdateComplaintStatus(complaintId);

  const handleUpdate = () => {
    if (!newStatus || !reason) return;
    updateMutation.mutate(
      { status: newStatus as ComplaintStatus, reason },
      {
        onSuccess: () => {
          setOpen(false);
          setNewStatus('');
          setReason('');
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
          <Badge variant={statusVariant[currentStatus] ?? 'default'}>
            {statusLabel[currentStatus] ?? currentStatus}
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
            label="Reason"
            placeholder="Reason for status change…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
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
              disabled={!newStatus || !reason}
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
