import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useComplaints } from '@/hooks/useQueries';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '@/components/Table';
import { SkeletonTableRows } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import type { ComplaintStatus } from '@/types/complaint';

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

const filterOptions: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'received', label: 'Received' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

export function ComplaintsListPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading, isError, refetch } = useComplaints(
    page,
    statusFilter || undefined,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            aria-label="Filter by status"
          >
            {filterOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isError ? (
        <ErrorState title="Failed to load complaints" onRetry={() => void refetch()} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <Th>Tracking ID</Th>
              <Th>Category</Th>
              <Th>Station</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th>Action</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <SkeletonTableRows rows={5} cols={6} />
            ) : data && data.data.length > 0 ? (
              data.data.map((c) => (
                <TableRow key={c.id}>
                  <Td className="font-medium">{c.trackingId}</Td>
                  <Td>{c.category}</Td>
                  <Td>{c.policeStation}</Td>
                  <Td>
                    <Badge variant={statusVariant[c.status]}>
                      {statusLabel[c.status]}
                    </Badge>
                  </Td>
                  <Td>{new Date(c.submittedAt).toLocaleDateString()}</Td>
                  <Td>
                    <Link
                      to={`/dashboard/complaints/${c.id}`}
                      className="text-sm font-medium text-primary-700 hover:text-primary-800"
                    >
                      View
                    </Link>
                  </Td>
                </TableRow>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title="No complaints found"
                    description="No complaints match the current filter."
                  />
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {data.page} of {data.totalPages} ({data.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
