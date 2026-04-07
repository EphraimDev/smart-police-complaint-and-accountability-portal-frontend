import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Textarea, Alert, Card } from '@/components';
import {
  complaintSchema,
  type ComplaintFormData,
  complaintCategories,
  severityLevels,
} from '@/types/complaint';
import { submitComplaint } from '@/services/api';

const MAX_FILES = 10;
const ACCEPT_STRING = 'application/pdf,image/*,audio/*,video/*';

function isAcceptedType(file: File): boolean {
  if (file.type === 'application/pdf') return true;
  if (file.type.startsWith('image/')) return true;
  if (file.type.startsWith('audio/')) return true;
  if (file.type.startsWith('video/')) return true;
  return false;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SubmitComplaintPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: { consent: undefined as unknown as true, isAnonymous: false },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const selected = Array.from(e.target.files || []);

    const invalid = selected.filter((f) => !isAcceptedType(f));
    if (invalid.length) {
      setFileError(`Unsupported file type: ${invalid.map((f) => f.name).join(', ')}`);
      e.target.value = '';
      return;
    }

    const combined = [...files, ...selected];
    if (combined.length > MAX_FILES) {
      setFileError(`You can upload a maximum of ${MAX_FILES} files.`);
      e.target.value = '';
      return;
    }

    setFiles(combined);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ComplaintFormData) => {
    setServerError('');
    try {
      const { consent: _, ...payload } = data;
      const result = await submitComplaint(payload, files.length ? files : undefined);
      console.log('Complaint submitted successfully:', result);
      navigate(`/complaint-success/${result.data.referenceNumber || result.data.id}`);
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
          {/* ── Complaint Title ── */}
          <fieldset>
            <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-700">
              Complaint Summary
            </legend>
            <Input
              label="Complaint Title *"
              placeholder="Brief summary of your complaint"
              error={errors.title?.message}
              {...register('title')}
            />
          </fieldset>

          {/* ── Personal Information ── */}
          <fieldset>
            <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-700">
              Personal Information
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full Name *"
                placeholder="e.g. Adaobi Nnamdi"
                error={errors.complainantName?.message}
                {...register('complainantName')}
              />
              <Input
                label="Email Address *"
                type="email"
                placeholder="you@email.com"
                error={errors.complainantEmail?.message}
                {...register('complainantEmail')}
              />
              <Input
                label="Phone Number *"
                type="tel"
                placeholder="0801 234 5678"
                error={errors.complainantPhone?.message}
                {...register('complainantPhone')}
              />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input
                id="isAnonymous"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                {...register('isAnonymous')}
              />
              <label htmlFor="isAnonymous" className="text-sm text-gray-600">
                Submit anonymously (your personal details will be hidden)
              </label>
            </div>
          </fieldset>

          {/* ── Incident Details ── */}
          <fieldset>
            <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-700">
              Incident Details
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Incident Location *"
                placeholder="e.g. Ikeja, Lagos"
                error={errors.incidentLocation?.message}
                {...register('incidentLocation')}
              />
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
              <Select
                label="Severity"
                placeholder="Select severity level"
                options={severityLevels.map((s) => ({
                  value: s.value,
                  label: s.label,
                }))}
                error={errors.severity?.message}
                {...register('severity')}
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

          {/* ── File Attachments ── */}
          <fieldset>
            <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-700">
              Supporting Evidence
            </legend>
            <p className="mb-2 text-sm text-gray-500">
              Upload up to {MAX_FILES} files (PDF, images, audio, or video).
            </p>
            <div
              className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 transition hover:border-primary-400"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
              }}
              role="button"
              tabIndex={0}
              aria-label="Upload files"
            >
              <svg
                className="mb-2 h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-sm font-medium text-gray-600">
                Click to browse files
              </span>
              <span className="mt-1 text-xs text-gray-400">
                {files.length}/{MAX_FILES} files selected
              </span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPT_STRING}
                onChange={handleFileChange}
                className="hidden"
                aria-hidden="true"
              />
            </div>

            {fileError && (
              <p className="mt-2 text-xs text-danger-600" role="alert">
                {fileError}
              </p>
            )}

            {files.length > 0 && (
              <ul className="mt-3 divide-y divide-gray-100 rounded-md border border-gray-200">
                {files.map((file, idx) => (
                  <li
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between px-3 py-2 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-gray-700">{file.name}</span>
                      <span className="shrink-0 text-xs text-gray-400">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="ml-2 shrink-0 text-gray-400 hover:text-danger-600"
                      aria-label={`Remove ${file.name}`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
