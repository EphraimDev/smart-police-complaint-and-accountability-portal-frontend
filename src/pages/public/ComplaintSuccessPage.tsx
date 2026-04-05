import { useParams, Link } from 'react-router-dom';
import { Button, Card } from '@/components';

export function ComplaintSuccessPage() {
  const { trackingId } = useParams<{ trackingId: string }>();

  return (
    <section className="mx-auto max-w-xl px-4 py-16 text-center">
      {/* Success icon */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-100">
        <svg
          className="h-10 w-10 text-success-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">
        Complaint Submitted Successfully
      </h1>
      <p className="mt-2 text-gray-600">
        Thank you for your submission. Your complaint has been recorded and will be
        reviewed by the appropriate authority.
      </p>

      {/* Tracking ID */}
      <Card className="mt-8" padding="lg">
        <p className="text-sm font-medium text-gray-500">Your Tracking ID</p>
        <p className="mt-2 select-all text-3xl font-bold tracking-wider text-primary-700">
          {trackingId}
        </p>
        <p className="mt-3 text-xs text-gray-500">
          Save this ID. You will need it to check the status of your complaint.
        </p>
      </Card>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link to={`/track-complaint?id=${trackingId}`}>
          <Button>Track My Complaint</Button>
        </Link>
        <Link to="/">
          <Button variant="ghost">Back to Home</Button>
        </Link>
      </div>
    </section>
  );
}
