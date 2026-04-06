import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile, useChangePassword } from '@/hooks/useQueries';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { Badge } from '@/components/Badge';
import { formatUserRole } from '@/types/auth';

export function ProfileSettingsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile &amp; Settings</h1>
        <Card padding="md">
          <p className="text-sm text-gray-500">Loading profile…</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile &amp; Settings</h1>

      {/* Profile info card */}
      <Card padding="none">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
              {(user.fullName ?? `${user.firstName ?? ''} ${user.lastName ?? ''}`)
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {user.fullName ?? `${user.firstName ?? ''} ${user.lastName ?? ''}`}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{user.email}</span>
                <Badge variant="primary">
                  {formatUserRole(user.role)}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Edit profile */}
      <ProfileForm
        key={user.id}
        initialFirstName={user.firstName ?? ''}
        initialLastName={user.lastName ?? ''}
      />

      {/* Change password */}
      <ChangePasswordForm />
    </div>
  );
}

function ProfileForm({
  initialFirstName,
  initialLastName,
}: {
  initialFirstName: string;
  initialLastName: string;
}) {
  const mutation = useUpdateProfile();
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phone, setPhone] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    mutation.mutate(
      { firstName, lastName, phone: phone || undefined },
      { onSuccess: () => setSuccess(true) },
    );
  };

  return (
    <Card padding="none">
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          {success && <Alert variant="success">Profile updated successfully.</Alert>}
          {mutation.isError && (
            <Alert variant="danger">Failed to update profile. Please try again.</Alert>
          )}
          <Input
            label="First Name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label="Last Name"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <Input
            label="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={mutation.isPending}>
              Save Profile
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

function ChangePasswordForm() {
  const mutation = useChangePassword();
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPass.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPass !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    mutation.mutate(
      { currentPassword: current, newPassword: newPass },
      {
        onSuccess: () => {
          setSuccess(true);
          setCurrent('');
          setNewPass('');
          setConfirm('');
        },
        onError: () =>
          setError('Failed to change password. Please check your current password.'),
      },
    );
  };

  return (
    <Card padding="none">
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          {success && <Alert variant="success">Password changed successfully.</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Input
            label="Current Password"
            type="password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            required
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            hint="Minimum 8 characters"
          />
          <Input
            label="Confirm New Password"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={mutation.isPending}>
              Change Password
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
