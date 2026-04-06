import { useState, type ChangeEvent } from 'react';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeactivateUser,
  useRoles,
  useBulkCreateUsers,
} from '@/hooks/useQueries';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '@/components/Table';
import { SkeletonTableRows } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Alert } from '@/components/Alert';
import type {
  AdminUser,
  CreateUserPayload,
  RoleOption,
} from '@/types/reports';

const BULK_UPLOAD_TEMPLATE = `firstName,lastName,email,roles
Jane,Doe,jane.doe@example.com,admin
John,Smith,john.smith@example.com,investigator|reviewer`;

export function UserManagementPage() {
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const { data, isLoading, isError, refetch } = useUsers(page);
  const { data: roles = [], isLoading: isLoadingRoles } = useRoles();
  const createMutation = useCreateUser();
  const bulkCreateMutation = useBulkCreateUsers();
  const deactivateMutation = useDeactivateUser();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
            Bulk Upload Users
          </Button>
          <Button onClick={() => setShowCreate(true)}>Add User</Button>
        </div>
      </div>

      {successMsg && (
        <Alert variant="success" onDismiss={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      {isError ? (
        <ErrorState title="Failed to load users" onRetry={() => void refetch()} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Station</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <SkeletonTableRows rows={5} cols={6} />
            ) : data && data.data.length > 0 ? (
              data.data.map((u) => (
                <TableRow key={u.id}>
                  <Td className="font-medium">
                    {u.fullName ?? `${u.firstName} ${u.lastName}`}
                  </Td>
                  <Td>{u.email}</Td>
                  <Td>{formatRoleLabel(u.roles?.[0] ?? u.role ?? '')}</Td>
                  <Td>{u.stationName ?? '-'}</Td>
                  <Td>
                    <Badge variant={u.isActive ? 'success' : 'default'}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditUser(u)}
                        className="text-sm font-medium text-primary-700 hover:text-primary-800"
                      >
                        Edit
                      </button>
                      {u.isActive && (
                        <button
                          onClick={() => {
                            const name = u.fullName ?? `${u.firstName} ${u.lastName}`;
                            if (confirm(`Deactivate ${name}?`)) {
                              deactivateMutation.mutate(u.id, {
                                onSuccess: () =>
                                  setSuccessMsg(`${name} has been deactivated.`),
                              });
                            }
                          }}
                          className="text-sm font-medium text-danger-600 hover:text-danger-700"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </Td>
                </TableRow>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <EmptyState title="No users found" />
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

      <CreateUserModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(name) => {
          setShowCreate(false);
          setSuccessMsg(`${name} has been added.`);
        }}
        createMutation={createMutation}
        roles={roles}
        isLoadingRoles={isLoadingRoles}
      />

      <BulkUploadUsersModal
        open={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        bulkCreateMutation={bulkCreateMutation}
        onCreated={(count) => {
          setShowBulkUpload(false);
          setSuccessMsg(`${count} users have been uploaded.`);
        }}
      />

      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onUpdated={(name) => {
            setEditUser(null);
            setSuccessMsg(`${name} has been updated.`);
          }}
        />
      )}
    </div>
  );
}

function CreateUserModal({
  open,
  onClose,
  onCreated,
  createMutation,
  roles,
  isLoadingRoles,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (name: string) => void;
  createMutation: ReturnType<typeof useCreateUser>;
  roles: RoleOption[];
  isLoadingRoles: boolean;
}) {
  const [form, setForm] = useState<CreateUserPayload>({
    firstName: '',
    lastName: '',
    email: '',
    roleIds: [],
  });

  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: role.name,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form, {
      onSuccess: () => {
        onCreated(`${form.firstName} ${form.lastName}`);
        setForm({ firstName: '', lastName: '', email: '', roleIds: [] });
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New User">
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <Input
          label="First Name"
          required
          value={form.firstName}
          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
        />
        <Input
          label="Last Name"
          required
          value={form.lastName}
          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
        />
        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <Select
          label="Role"
          required
          value={form.roleIds?.[0] ?? ''}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              roleIds: e.target.value ? [e.target.value] : [],
            }))
          }
          options={roleOptions}
          placeholder={isLoadingRoles ? 'Loading roles...' : 'Select a role'}
          disabled={isLoadingRoles || roleOptions.length === 0}
          hint="Roles are fetched from the backend and sent as roleIds."
        />
        {createMutation.isError && (
          <Alert variant="danger">Failed to create user. Please try again.</Alert>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createMutation.isPending}
            disabled={isLoadingRoles || !form.roleIds?.length}
          >
            Create User
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function BulkUploadUsersModal({
  open,
  onClose,
  onCreated,
  bulkCreateMutation,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (count: number) => void;
  bulkCreateMutation: ReturnType<typeof useBulkCreateUsers>;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file ?? null);
    setFileName(file?.name ?? '');
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    bulkCreateMutation.mutate(selectedFile, {
      onSuccess: (response) => {
        setSelectedFile(null);
        setFileName('');
        onCreated(response.count ?? 0);
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Bulk Upload Users">
      <div className="space-y-4 p-6">
        <Alert variant="info">
          Upload the CSV file directly to the backend bulk upload endpoint.
        </Alert>

        <div className="rounded-md border border-dashed border-gray-300 p-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="bulk-user-file"
          >
            CSV File
          </label>
          <input
            id="bulk-user-file"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
          />
          <p className="mt-2 text-xs text-gray-500">
            Current file: {fileName || 'None selected'}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={() => downloadCsvTemplate(BULK_UPLOAD_TEMPLATE)}
        >
          Download CSV Template
        </Button>

        <TemplatePreview
          title="Sample CSV Template"
          lines={BULK_UPLOAD_TEMPLATE.split('\n')}
        />

        {bulkCreateMutation.isError && (
          <Alert variant="danger">
            {bulkCreateMutation.error instanceof Error
              ? bulkCreateMutation.error.message
              : 'Bulk upload failed. Please try again.'}
          </Alert>
        )}

        {selectedFile && (
          <Alert variant="success">
            {fileName} is ready to upload.
          </Alert>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            loading={bulkCreateMutation.isPending}
            disabled={!selectedFile}
          >
            Upload Users
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function EditUserModal({
  user,
  onClose,
  onUpdated,
}: {
  user: AdminUser;
  onClose: () => void;
  onUpdated: (name: string) => void;
}) {
  const updateMutation = useUpdateUser(user.id);
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? '',
  });

  const displayName = `${form.firstName} ${form.lastName}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
      },
      { onSuccess: () => onUpdated(displayName) },
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${user.fullName ?? `${user.firstName} ${user.lastName}`}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <Input
          label="First Name"
          required
          value={form.firstName}
          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
        />
        <Input
          label="Last Name"
          required
          value={form.lastName}
          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
        {updateMutation.isError && (
          <Alert variant="danger">Failed to update user. Please try again.</Alert>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={updateMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function downloadCsvTemplate(contents: string) {
  const blob = new Blob([contents], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'user-bulk-upload-template.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function formatRoleLabel(role: string) {
  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function TemplatePreview({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-gray-600">
        {lines.join('\n')}
      </pre>
    </div>
  );
}
