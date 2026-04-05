import { Link } from 'react-router-dom';
import { Button, Card, Logo } from '@/components';

const features = [
  {
    title: 'File a Complaint',
    description:
      'Submit complaints against police misconduct anonymously or with your identity. Every submission receives a unique tracking ID.',
    icon: (
      <svg
        className="h-8 w-8 text-primary-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: 'Track Your Case',
    description:
      'Use your tracking ID to monitor the status of your complaint in real time — from submission through investigation to resolution.',
    icon: (
      <svg
        className="h-8 w-8 text-primary-600"
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
    ),
  },
  {
    title: 'Public Accountability',
    description:
      'Aggregated, anonymised data on complaints helps hold the Nigeria Police Force accountable to the citizens it serves.',
    icon: (
      <svg
        className="h-8 w-8 text-primary-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
  },
] as const;

const stats = [
  { value: '12,000+', label: 'Complaints Filed' },
  { value: '87%', label: 'Resolution Rate' },
  { value: '36', label: 'States + FCT' },
  { value: '24/7', label: 'Available Online' },
] as const;

export function LandingPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <Logo size="xl" showText={false} className="mx-auto mb-6 justify-center" />
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Smart Police Complaint &amp;{' '}
            <span className="text-accent-400">Accountability Portal</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-200">
            A secure, transparent platform for Nigerian citizens to report police
            misconduct, track case progress, and promote accountability within the Nigeria
            Police Force.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/submit-complaint">
              <Button size="lg" variant="secondary">
                File a Complaint
              </Button>
            </Link>
            <Link to="/track-complaint">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Track Your Complaint
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b border-gray-200 bg-white py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-primary-700">{s.value}</p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} padding="lg" className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-accent-50 py-14">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Your Voice Matters</h2>
          <p className="mt-3 text-gray-600">
            Every complaint recorded contributes to a safer, more accountable Nigeria
            Police Force. All submissions are handled confidentially.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link to="/submit-complaint">
              <Button size="lg">Submit a Complaint</Button>
            </Link>
            <Link to="/faq">
              <Button size="lg" variant="ghost">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
