import { useState } from 'react';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
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
import type { AdminUser, CreateUserPayload } from '@/types/reports';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'investigator', label: 'Investigator' },
  { value: 'officer', label: 'Officer' },
];

const statusBadge: Record<AdminUser['status'], 'success' | 'default' | 'danger'> = {
  active: 'success',
  inactive: 'default',
  suspended: 'danger',
};

export function UserManagementPage() {
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const { data, isLoading, isError, refetch } = useUsers(page);
  const createMutation = useCreateUser();
  const deleteMutation = useDeleteUser();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <Button onClick={() => setShowCreate(true)}>Add User</Button>
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
                  <Td className="font-medium">{u.fullName}</Td>
                  <Td>{u.email}</Td>
                  <Td className="capitalize">{u.role}</Td>
                  <Td>{u.stationName ?? '—'}</Td>
                  <Td>
                    <Badge variant={statusBadge[u.status]}>{u.status}</Badge>
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditUser(u)}
                        className="text-sm font-medium text-primary-700 hover:text-primary-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${u.fullName}?`)) {
                            deleteMutation.mutate(u.id, {
                              onSuccess: () =>
                                setSuccessMsg(`${u.fullName} has been removed.`),
                            });
                          }
                        }}
                        className="text-sm font-medium text-danger-600 hover:text-danger-700"
                      >
                        Remove
                      </button>
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

      {/* Create user modal */}
      <CreateUserModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(name) => {
          setShowCreate(false);
          setSuccessMsg(`${name} has been added.`);
        }}
        createMutation={createMutation}
      />

      {/* Edit user modal */}
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

/* ── Create User Modal ── */
function CreateUserModal({
  open,
  onClose,
  onCreated,
  createMutation,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (name: string) => void;
  createMutation: ReturnType<typeof useCreateUser>;
}) {
  const [form, setForm] = useState<CreateUserPayload>({
    fullName: '',
    email: '',
    role: 'officer',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form, {
      onSuccess: () => {
        onCreated(form.fullName);
        setForm({ fullName: '', email: '', role: 'officer' });
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New User">
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <Input
          label="Full Name"
          required
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
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
          options={roleOptions}
          value={form.role}
          onChange={(e) =>
            setForm((f) => ({ ...f, role: e.target.value as CreateUserPayload['role'] }))
          }
        />
        {createMutation.isError && (
          <Alert variant="danger">Failed to create user. Please try again.</Alert>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createMutation.isPending}>
            Create User
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Edit User Modal ── */
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
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form, {
      onSuccess: () => onUpdated(form.fullName),
    });
  };

  return (
    <Modal open onClose={onClose} title={`Edit ${user.fullName}`}>
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <Input
          label="Full Name"
          required
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
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
          options={roleOptions}
          value={form.role}
          onChange={(e) =>
            setForm((f) => ({ ...f, role: e.target.value as AdminUser['role'] }))
          }
        />
        <Select
          label="Status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'suspended', label: 'Suspended' },
          ]}
          value={form.status}
          onChange={(e) =>
            setForm((f) => ({ ...f, status: e.target.value as AdminUser['status'] }))
          }
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
