import { useState, type ChangeEvent } from 'react';
import { useStations, useCreateStation, useBulkUploadStations } from '@/hooks/useQueries';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { Alert } from '@/components/Alert';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '@/components/Table';
import { SkeletonTableRows } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import type { CreateStationPayload, Station } from '@/types/dashboard';

const STATION_BULK_UPLOAD_TEMPLATE_PATH = '/templates/police_station_bulk_upload_template.csv';

export function StationsListPage() {
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const { data, isLoading, isError, refetch } = useStations(page);
  const createMutation = useCreateStation();
  const bulkUploadMutation = useBulkUploadStations();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Police Stations</h1>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
            Bulk Upload Stations
          </Button>
          <Button onClick={() => setShowCreate(true)}>Add Station</Button>
        </div>
      </div>

      {successMsg && (
        <Alert variant="success" onDismiss={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

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
                  <Td>{s.code ?? '-'}</Td>
                  <Td>{s.region ?? '-'}</Td>
                  <Td>{s.phone ?? '-'}</Td>
                  <Td>{s.email ?? '-'}</Td>
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

      <CreateStationModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        createMutation={createMutation}
        onCreated={(station) => {
          setShowCreate(false);
          setSuccessMsg(`${station.name} has been created.`);
        }}
      />

      <BulkUploadStationsModal
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

function CreateStationModal({
  open,
  onClose,
  createMutation,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  createMutation: ReturnType<typeof useCreateStation>;
  onCreated: (station: Station) => void;
}) {
  const [form, setForm] = useState<CreateStationPayload>({
    name: '',
    code: '',
    address: '',
    region: '',
    phone: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form, {
      onSuccess: (station) => {
        onCreated(station);
        setForm({ name: '', code: '', address: '', region: '', phone: '', email: '' });
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Station">
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <Input
          label="Station Name"
          required
          value={form.name}
          onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
        />
        <Input
          label="Code"
          required
          value={form.code}
          onChange={(e) => setForm((current) => ({ ...current, code: e.target.value }))}
        />
        <Input
          label="Address"
          value={form.address}
          onChange={(e) => setForm((current) => ({ ...current, address: e.target.value }))}
        />
        <Input
          label="Region"
          value={form.region}
          onChange={(e) => setForm((current) => ({ ...current, region: e.target.value }))}
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))}
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
        />
        {createMutation.isError && (
          <Alert variant="danger">Failed to create station. Please try again.</Alert>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createMutation.isPending}
            disabled={!form.name.trim() || !form.code.trim()}
          >
            Create Station
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function BulkUploadStationsModal({
  open,
  onClose,
  bulkUploadMutation,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  bulkUploadMutation: ReturnType<typeof useBulkUploadStations>;
  onUploaded: (message: string) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    bulkUploadMutation.mutate(selectedFile, {
      onSuccess: (response) => {
        setSelectedFile(null);
        onUploaded(response.message ?? 'Stations uploaded successfully.');
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Bulk Upload Stations">
      <div className="space-y-4 p-6">
        <Alert variant="info">
          Upload a CSV or spreadsheet file using the template below.
        </Alert>
        <div className="rounded-md border border-dashed border-gray-300 p-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="bulk-station-file">
            Station Upload File
          </label>
          <input
            id="bulk-station-file"
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
          href={STATION_BULK_UPLOAD_TEMPLATE_PATH}
          download="police_station_bulk_upload_template.csv"
          className="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-50 active:bg-primary-100"
        >
          Download Station Template
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
            disabled={!selectedFile}
          >
            Upload Stations
          </Button>
        </div>
      </div>
    </Modal>
  );
}
