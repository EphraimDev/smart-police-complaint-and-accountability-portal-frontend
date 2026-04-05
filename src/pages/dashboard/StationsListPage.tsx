import { useState } from 'react';
import { useStations } from '@/hooks/useQueries';
import { Button } from '@/components/Button';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '@/components/Table';
import { SkeletonTableRows } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

export function StationsListPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useStations(page);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Police Stations</h1>

      {isError ? (
        <ErrorState title="Failed to load stations" onRetry={() => void refetch()} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <Th>Station Name</Th>
              <Th>Code</Th>
              <Th>Region</Th>
              <Th>Phone</Th>
              <Th>Email</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <SkeletonTableRows rows={5} cols={5} />
            ) : data && data.data.length > 0 ? (
              data.data.map((s) => (
                <TableRow key={s.id}>
                  <Td className="font-medium">{s.name}</Td>
                  <Td>{s.code ?? '—'}</Td>
                  <Td>{s.region ?? '—'}</Td>
                  <Td>{s.phone ?? '—'}</Td>
                  <Td>{s.email ?? '—'}</Td>
                </TableRow>
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  <EmptyState title="No stations found" />
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
