import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Input, Card, Alert } from '@/components';

export function TrackComplaintPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState(searchParams.get('id') ?? '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = trackingId.trim();
    if (!trimmed) {
      setError('Please enter your tracking ID');
      return;
    }
    setError('');
    navigate(`/complaint/${trimmed}`);
  };

  return (
    <section className="mx-auto max-w-xl px-4 py-16">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
          <svg
            className="h-8 w-8 text-primary-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Track Your Complaint</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter the tracking ID you received when you submitted your complaint.
        </p>
      </div>

      {error && (
        <Alert variant="danger" className="mt-6">
          {error}
        </Alert>
      )}

      <Card className="mt-8" padding="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tracking ID"
            placeholder="e.g. NPF-2026-XXXXX"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
          />
          <Button type="submit" className="w-full" size="lg">
            Look Up Complaint
          </Button>
        </form>
      </Card>
    </section>
  );
}
