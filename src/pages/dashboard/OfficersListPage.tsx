import { useState, type ChangeEvent } from 'react';
import { useOfficers, useBulkUploadOfficers, useStations } from '@/hooks/useQueries';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '@/components/Table';
import { SkeletonTableRows } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

const OFFICER_BULK_UPLOAD_TEMPLATE_PATH = '/templates/officer_bulk_upload_template.csv';

export function OfficersListPage() {
  const [page, setPage] = useState(1);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const { data, isLoading, isError, refetch } = useOfficers(page);
  const bulkUploadMutation = useBulkUploadOfficers();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Officers Directory</h1>
        <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
          Bulk Upload Officers
        </Button>
      </div>

      {successMsg && (
        <Alert variant="success" onDismiss={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

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
                  <Td className="font-medium">
                    {o.firstName} {o.lastName}
                  </Td>
                  <Td>{o.badgeNumber}</Td>
                  <Td>{o.rank}</Td>
                  <Td>{o.station?.name ?? '-'}</Td>
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

      <BulkUploadOfficersModal
        open={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        bulkUploadMutation={bulkUploadMutation}
        onUploaded={(message) => {
          setShowBulkUpload(false);
          setSuccessMsg(message);
        }}
      />
    </div>
  );
}

function BulkUploadOfficersModal({
  open,
  onClose,
  bulkUploadMutation,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  bulkUploadMutation: ReturnType<typeof useBulkUploadOfficers>;
  onUploaded: (message: string) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStationId, setSelectedStationId] = useState('');
  const { data: stationsData, isLoading: isStationsLoading } = useStations(1, 100);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedStationId) return;

    bulkUploadMutation.mutate({ file: selectedFile, stationId: selectedStationId }, {
      onSuccess: (response) => {
        setSelectedFile(null);
        setSelectedStationId('');
        onUploaded(response.message ?? 'Officers uploaded successfully.');
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Bulk Upload Officers">
      <div className="space-y-4 p-6">
        <Alert variant="info">
          Pick one station for the entire upload, then add a CSV or spreadsheet file using
          the officer template below.
        </Alert>
        <Select
          label="Station"
          value={selectedStationId}
          onChange={(event) => setSelectedStationId(event.target.value)}
          placeholder={isStationsLoading ? 'Loading stations...' : 'Select station'}
          disabled={isStationsLoading || !stationsData?.data.length}
          options={
            stationsData?.data.map((station) => ({
              value: station.id,
              label: station.name,
            })) ?? []
          }
          hint="The selected station will be applied to every officer in this upload."
        />
        <div className="rounded-md border border-dashed border-gray-300 p-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="bulk-officer-file">
            Officer Upload File
          </label>
          <input
            id="bulk-officer-file"
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={handleFileChange}
            className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
          />
          <p className="mt-2 text-xs text-gray-500">
            Current file: {selectedFile?.name ?? 'None selected'}
          </p>
        </div>
        <a
          href={OFFICER_BULK_UPLOAD_TEMPLATE_PATH}
          download="officer_bulk_upload_template.csv"
          className="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-50 active:bg-primary-100"
        >
          Download Officer Template
        </a>
        {bulkUploadMutation.isError && (
          <Alert variant="danger">
            {bulkUploadMutation.error instanceof Error
              ? bulkUploadMutation.error.message
              : 'Bulk upload failed. Please try again.'}
          </Alert>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            loading={bulkUploadMutation.isPending}
            disabled={!selectedFile || !selectedStationId}
          >
            Upload Officers
          </Button>
        </div>
      </div>
    </Modal>
  );
}
