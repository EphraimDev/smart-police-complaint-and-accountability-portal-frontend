import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/types/auth';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';

export function ForgotPasswordPage() {
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { message?: string }).message ?? 'Request failed. Please try again.',
        );
      }

      const { message } = (await res.json()) as { message: string };
      setSuccessMessage(message);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-gray-900">Reset Password</h1>
      <p className="mb-6 text-sm text-gray-500">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

      {serverError && (
        <Alert variant="danger" className="mb-4" onDismiss={() => setServerError('')}>
          {serverError}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" className="mb-4">
          {successMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="officer@npf.gov.ng"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        <Link to="/login" className="font-medium text-primary-700 hover:text-primary-800">
          Back to login
        </Link>
      </p>
    </div>
  );
}
