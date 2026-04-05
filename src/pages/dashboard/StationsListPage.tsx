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
              <Th>State</Th>
              <Th>LGA</Th>
              <Th>Officers</Th>
              <Th>Complaints</Th>
              <Th>Phone</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <SkeletonTableRows rows={5} cols={6} />
            ) : data && data.data.length > 0 ? (
              data.data.map((s) => (
                <TableRow key={s.id}>
                  <Td className="font-medium">{s.name}</Td>
                  <Td>{s.state}</Td>
                  <Td>{s.lga}</Td>
                  <Td>{s.officerCount}</Td>
                  <Td>{s.complaintCount}</Td>
                  <Td>{s.phone}</Td>
                </TableRow>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
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
