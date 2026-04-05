import { useState } from 'react';
import { useOfficers } from '@/hooks/useQueries';
import { Button } from '@/components/Button';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '@/components/Table';
import { SkeletonTableRows } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

export function OfficersListPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useOfficers(page);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Officers Directory</h1>

      {isError ? (
        <ErrorState title="Failed to load officers" onRetry={() => void refetch()} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <Th>Name</Th>
              <Th>Badge #</Th>
              <Th>Rank</Th>
              <Th>Station</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <SkeletonTableRows rows={5} cols={4} />
            ) : data && data.data.length > 0 ? (
              data.data.map((o) => (
                <TableRow key={o.id}>
                  <Td className="font-medium">{o.firstName} {o.lastName}</Td>
                  <Td>{o.badgeNumber}</Td>
                  <Td>{o.rank}</Td>
                  <Td>{o.station?.name ?? '—'}</Td>
                </TableRow>
              ))
            ) : (
              <tr>
                <td colSpan={4}>
                  <EmptyState title="No officers found" />
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
      )}

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
