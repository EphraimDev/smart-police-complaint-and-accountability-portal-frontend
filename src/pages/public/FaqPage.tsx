import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '@/components';

const faqs = [
  {
    q: 'How do I file a complaint?',
    a: 'Click "File a Complaint" on the home page or in the navigation bar. Fill in all required fields including your personal information, the incident location, and a detailed description of what happened. After submission you will receive a unique tracking ID.',
  },
  {
    q: 'Is my identity protected?',
    a: 'Yes. Your personal information is kept confidential and is only shared with the investigating authority handling your case. We follow strict data protection guidelines.',
  },
  {
    q: 'What happens after I submit a complaint?',
    a: 'Your complaint is reviewed and assigned to the relevant oversight unit. It then goes through investigation, and you will be able to track its progress using your tracking ID.',
  },
  {
    q: 'How do I track my complaint?',
    a: 'Visit the "Track Complaint" page and enter the tracking ID you received after submission. You will see the current status and full history of your case.',
  },
  {
    q: 'What complaint categories are supported?',
    a: 'You can file complaints related to extortion/bribery, physical assault, unlawful detention, harassment/intimidation, negligence of duty, illegal search/seizure, corruption, and other misconduct.',
  },
  {
    q: 'Can I submit evidence or documents?',
    a: 'Document and media upload support is planned for a future release. Currently, please describe all evidence in the complaint description and include any reference numbers, dates, and witness details.',
  },
  {
    q: "What if I don't know the officer's name or badge number?",
    a: 'Officer details are optional. Provide as much information as you can — the police station name and incident location are usually sufficient for an investigation to begin.',
  },
  {
    q: 'How long does the investigation take?',
    a: 'Investigation timelines vary depending on the complexity of the case. Most complaints receive an initial review within 7 working days. You can track progress at any time.',
  },
  {
    q: 'Who manages this portal?',
    a: 'The Smart Police Complaint & Accountability Portal is maintained as a civic technology initiative to promote transparency and accountability within the Nigeria Police Force.',
  },
] as const;

export function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h1>
        <p className="mt-2 text-sm text-gray-500">
          Find answers to common questions about filing and tracking complaints.
        </p>
      </div>

      <div className="mt-10 space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <Card key={i} padding="none" className="overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium text-gray-900 hover:bg-gray-50"
                aria-expanded={isOpen}
              >
                <span>{faq.q}</span>
                <svg
                  className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div className="border-t border-gray-100 px-6 py-4 text-sm text-gray-600">
                  {faq.a}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <p className="text-gray-600">Still have questions?</p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <Link to="/submit-complaint">
            <Button>File a Complaint</Button>
          </Link>
          <Link to="/track-complaint">
            <Button variant="outline">Track Complaint</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
