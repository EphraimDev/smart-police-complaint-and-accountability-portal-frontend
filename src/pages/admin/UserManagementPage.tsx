import { useState } from 'react';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeactivateUser,
} from '@/hooks/useQueries';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '@/components/Table';
import { SkeletonTableRows } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Alert } from '@/components/Alert';
import type { AdminUser, CreateUserPayload } from '@/types/reports';

export function UserManagementPage() {
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const { data, isLoading, isError, refetch } = useUsers(page);
  const createMutation = useCreateUser();
  const deactivateMutation = useDeactivateUser();

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
                  <Td className="font-medium">{u.fullName ?? `${u.firstName} ${u.lastName}`}</Td>
                  <Td>{u.email}</Td>
                  <Td className="capitalize">{u.role}</Td>
                  <Td>{u.stationName ?? '—'}</Td>
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
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form, {
      onSuccess: () => {
        onCreated(`${form.firstName} ${form.lastName}`);
        setForm({ firstName: '', lastName: '', email: '', password: '' });
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
        <Input
          label="Password"
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
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
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? '',
  });

  const displayName = `${form.firstName} ${form.lastName}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      { firstName: form.firstName, lastName: form.lastName, phone: form.phone || undefined },
      { onSuccess: () => onUpdated(displayName) },
    );
  };

  return (
    <Modal open onClose={onClose} title={`Edit ${user.fullName ?? `${user.firstName} ${user.lastName}`}`}>
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
