import { useMemo, useState, type ReactNode } from 'react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { FilterBar, type FilterField } from '@/components/FilterBar';
import { SkeletonTableRows } from '@/components/Skeleton';
import { Table, TableBody, TableHead, TableRow, Td, Th } from '@/components/Table';
import { useAuditLogs } from '@/hooks/useQueries';
import type { AuditLogEntry, AuditLogQuery } from '@/types/audit';

const filterFields: FilterField[] = [
  {
    name: 'mode',
    label: 'View',
    type: 'select',
    placeholder: 'Select scope',
    options: [
      { value: 'all', label: 'All Logs' },
      { value: 'entity', label: 'By Entity' },
      { value: 'actor', label: 'By Actor' },
    ],
  },
  {
    name: 'entityType',
    label: 'Entity Type',
    type: 'text',
    placeholder: 'complaint, user, station...',
  },
  {
    name: 'entityId',
    label: 'Entity ID',
    type: 'text',
    placeholder: 'Enter entity ID',
  },
  {
    name: 'actorId',
    label: 'Actor ID',
    type: 'text',
    placeholder: 'Enter actor ID',
  },
];

const defaultFilters: Record<string, string> = {
  mode: 'all',
  entityType: '',
  entityId: '',
  actorId: '',
};

export function AuditTrailPage() {
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>(defaultFilters);
  const [appliedQuery, setAppliedQuery] = useState<AuditLogQuery>({
    mode: 'all',
    page: 1,
    limit: 20,
  });

  const query = useMemo(
    () => ({
      ...appliedQuery,
      page,
      limit: 20,
    }),
    [appliedQuery, page],
  );

  const { data, isLoading, isError, refetch } = useAuditLogs(query);

  const stats = useMemo(() => {
    const logs = data?.data ?? [];

    return {
      total: data?.total ?? logs.length,
      failures: logs.filter((entry) => isFailureOutcome(entry.outcome)).length,
      actors: new Set(logs.map((entry) => entry.actorId).filter(Boolean)).size,
      entityTypes: new Set(logs.map((entry) => entry.entityType)).size,
    };
  }, [data]);

  const handleApply = () => {
    const nextMode = normalizeMode(filters.mode);
    setPage(1);
    setExpandedId(null);
    setAppliedQuery({
      mode: nextMode,
      actorId: nextMode === 'actor' ? filters.actorId.trim() : undefined,
      entityType: nextMode === 'entity' ? filters.entityType.trim() : undefined,
      entityId: nextMode === 'entity' ? filters.entityId.trim() : undefined,
      page: 1,
      limit: 20,
    });
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setPage(1);
    setExpandedId(null);
    setAppliedQuery({ mode: 'all', page: 1, limit: 20 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
          <p className="mt-1 max-w-3xl text-sm text-gray-600">
            Review actor activity, entity changes, outcomes, and supporting metadata
            recorded by the backend audit log service.
          </p>
        </div>
        <div className="rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-800">
          <span className="font-semibold">Endpoint family:</span> `/api/v1/audit-logs`
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Records" value={String(stats.total)} />
        <SummaryCard label="Failures" value={String(stats.failures)} tone="danger" />
        <SummaryCard label="Actors on page" value={String(stats.actors)} tone="accent" />
        <SummaryCard
          label="Entity types"
          value={String(stats.entityTypes)}
          tone="success"
        />
      </div>

      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
        onApply={handleApply}
        onReset={handleReset}
      >
        <p className="text-xs text-gray-500">
          Use `By Entity` for `/audit-logs/entity/{'{entityType}'}/{'{entityId}'}` and
          `By Actor` for `/audit-logs/actor/{'{actorId}'}`.
        </p>
      </FilterBar>

      {isError ? (
        <ErrorState title="Failed to load audit logs" onRetry={() => void refetch()} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHead>
              <TableRow>
                <Th>When</Th>
                <Th>Action</Th>
                <Th>Entity</Th>
                <Th>Actor</Th>
                <Th>Outcome</Th>
                <Th>Correlation</Th>
                <Th>Details</Th>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <SkeletonTableRows rows={6} cols={7} />
              ) : data && data.data.length > 0 ? (
                data.data.map((entry) => (
                  <AuditLogRow
                    key={entry.id}
                    entry={entry}
                    expanded={expandedId === entry.id}
                    onToggle={() =>
                      setExpandedId((current) => (current === entry.id ? null : entry.id))
                    }
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title="No audit logs found"
                      description="Adjust the filters or query a different entity or actor."
                    />
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Page {data.page} of {data.totalPages} ({data.total} total records)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.page >= data.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function AuditLogRow({
  entry,
  expanded,
  onToggle,
}: {
  entry: AuditLogEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <TableRow>
        <Td className="whitespace-nowrap">
          <div className="font-medium text-gray-900">{formatDateTime(entry.createdAt)}</div>
          <div className="text-xs text-gray-500">Updated {formatDateTime(entry.updatedAt)}</div>
        </Td>
        <Td>
          <Badge variant="primary">{formatTokenLabel(entry.action)}</Badge>
        </Td>
        <Td>
          <div className="font-medium text-gray-900">{formatTokenLabel(entry.entityType)}</div>
          <div className="text-xs text-gray-500">{entry.entityId ?? 'No entity id'}</div>
        </Td>
        <Td>
          <div className="font-medium text-gray-900">{entry.actorEmail ?? 'System'}</div>
          <div className="text-xs text-gray-500">{entry.actorId ?? 'No actor id'}</div>
        </Td>
        <Td>
          <Badge variant={getOutcomeVariant(entry.outcome)}>
            {formatOutcome(entry.outcome)}
          </Badge>
        </Td>
        <Td className="max-w-[180px] truncate text-sm text-gray-600">
          {entry.correlationId ?? 'N/A'}
        </Td>
        <Td>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            {expanded ? 'Hide' : 'View'}
          </Button>
        </Td>
      </TableRow>

      {expanded && (
        <tr className="border-b border-gray-100 bg-gray-50/70">
          <td colSpan={7} className="p-0">
            <div className="grid gap-4 p-5 lg:grid-cols-3">
              <DetailCard title="Request Context">
                <DetailItem label="IP Address" value={entry.ipAddress} />
                <DetailItem label="User Agent" value={entry.userAgent} mono />
                <DetailItem label="Failure Reason" value={entry.failureReason} />
              </DetailCard>

              <DetailCard title="State Change">
                <JsonPreview label="Before State" value={entry.beforeState} />
                <JsonPreview label="After State" value={entry.afterState} />
              </DetailCard>

              <DetailCard title="Additional Metadata">
                <JsonPreview label="Metadata" value={entry.metadata} />
              </DetailCard>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function SummaryCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'accent' | 'success' | 'danger';
}) {
  const tones = {
    default: 'border-gray-200 bg-white text-gray-900',
    accent: 'border-accent-200 bg-accent-50 text-accent-900',
    success: 'border-success-200 bg-success-50 text-success-900',
    danger: 'border-danger-200 bg-danger-50 text-danger-900',
  };

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function DetailItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p
        className={`mt-1 break-words text-sm text-gray-700 ${mono ? 'font-mono text-xs' : ''}`}
      >
        {value || 'Not recorded'}
      </p>
    </div>
  );
}

function JsonPreview({
  label,
  value,
}: {
  label: string;
  value: Record<string, unknown> | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <pre className="mt-1 overflow-x-auto rounded-md bg-gray-950 p-3 text-xs text-gray-100">
        {value ? JSON.stringify(value, null, 2) : 'No data'}
      </pre>
    </div>
  );
}

function normalizeMode(mode: string): AuditLogQuery['mode'] {
  if (mode === 'entity' || mode === 'actor') {
    return mode;
  }

  return 'all';
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatTokenLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatOutcome(value?: string) {
  return value ? formatTokenLabel(value) : 'Unknown';
}

function getOutcomeVariant(outcome?: string) {
  if (isFailureOutcome(outcome)) {
    return 'danger' as const;
  }

  if ((outcome ?? '').toLowerCase() === 'success') {
    return 'success' as const;
  }

  if ((outcome ?? '').toLowerCase() === 'warning') {
    return 'warning' as const;
  }

  return 'default' as const;
}

function isFailureOutcome(outcome?: string) {
  return ['failure', 'failed', 'error', 'rejected'].includes((outcome ?? '').toLowerCase());
}
