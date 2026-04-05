import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Textarea, Alert, Card } from '@/components';
import {
  complaintSchema,
  type ComplaintFormData,
  complaintCategories,
  nigerianStates,
  type ComplaintSubmissionResponse,
} from '@/types/complaint';

export function SubmitComplaintPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: { consent: undefined as unknown as true },
  });

  const onSubmit = async (data: ComplaintFormData) => {
    setServerError('');
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? 'Submission failed. Please try again.');
      }

      const result: ComplaintSubmissionResponse = await res.json();
      navigate(`/complaint-success/${result.trackingId}`);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      );
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">File a Complaint</h1>
      <p className="mt-1 text-sm text-gray-500">
        All fields marked with <span className="text-danger-500">*</span> are required.
        Your complaint will be assigned a unique tracking ID.
      </p>

      {serverError && (
        <Alert variant="danger" className="mt-6" onDismiss={() => setServerError('')}>
          {serverError}
        </Alert>
      )}

      <Card className="mt-6" padding="lg">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          {/* ── Personal Information ── */}
          <fieldset>
            <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-700">
              Personal Information
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full Name *"
                placeholder="e.g. Adaobi Nnamdi"
                error={errors.fullName?.message}
                {...register('fullName')}
              />
              <Input
                label="Email Address *"
                type="email"
                placeholder="you@email.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Phone Number *"
                type="tel"
                placeholder="0801 234 5678"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
          </fieldset>

          {/* ── Location ── */}
          <fieldset>
            <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-700">
              Incident Location
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="State *"
                placeholder="Select state"
                options={nigerianStates.map((s) => ({ value: s, label: s }))}
                error={errors.state?.message}
                {...register('state')}
              />
              <Input
                label="Local Government Area *"
                placeholder="e.g. Ikeja"
                error={errors.lga?.message}
                {...register('lga')}
              />
              <Input
                label="Police Station *"
                placeholder="Name of the police station"
                error={errors.policeStation?.message}
                {...register('policeStation')}
              />
            </div>
          </fieldset>

          {/* ── Officer Details ── */}
          <fieldset>
            <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-700">
              Officer Details (Optional)
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Officer Name"
                placeholder="If known"
                {...register('officerName')}
              />
              <Input
                label="Badge / Service Number"
                placeholder="If known"
                {...register('officerBadgeNumber')}
              />
            </div>
          </fieldset>

          {/* ── Incident Details ── */}
          <fieldset>
            <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-700">
              Incident Details
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Date of Incident *"
                type="date"
                error={errors.incidentDate?.message}
                {...register('incidentDate')}
              />
              <Select
                label="Category *"
                placeholder="Select category"
                options={complaintCategories.map((c) => ({
                  value: c.value,
                  label: c.label,
                }))}
                error={errors.category?.message}
                {...register('category')}
              />
            </div>
            <div className="mt-4">
              <Textarea
                label="Description *"
                placeholder="Describe the incident in detail. Include dates, locations, and any witnesses."
                rows={6}
                error={errors.description?.message}
                {...register('description')}
              />
            </div>
          </fieldset>

          {/* ── Consent ── */}
          <div className="flex items-start gap-3">
            <input
              id="consent"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...register('consent')}
            />
            <label htmlFor="consent" className="text-sm text-gray-600">
              I confirm that the information provided is truthful. I understand this
              complaint will be reviewed by the appropriate authorities.{' '}
              <span className="text-danger-500">*</span>
            </label>
          </div>
          {errors.consent && (
            <p className="text-xs text-danger-600" role="alert">
              {errors.consent.message}
            </p>
          )}

          {/* ── Submit ── */}
          <div className="flex justify-end pt-2">
            <Button type="submit" size="lg" loading={isSubmitting}>
              Submit Complaint
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
