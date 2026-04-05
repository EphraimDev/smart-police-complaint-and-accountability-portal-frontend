import { z } from 'zod';

/* ── Zod schema for public complaint submission ── */
export const complaintSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(120, 'Full name must be under 120 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be under 15 digits')
    .regex(/^[0-9+\-\s]+$/, 'Enter a valid phone number'),
  state: z.string().min(1, 'Select a state'),
  lga: z.string().min(1, 'Enter the Local Government Area'),
  policeStation: z.string().min(2, 'Enter the police station name'),
  officerName: z.string().optional(),
  officerBadgeNumber: z.string().optional(),
  incidentDate: z.string().min(1, 'Select the date of the incident'),
  category: z.string().min(1, 'Select a complaint category'),
  description: z
    .string()
    .min(20, 'Describe the incident in at least 20 characters')
    .max(3000, 'Description must be under 3000 characters'),
  consent: z.literal(true, {
    message: 'You must agree to submit your complaint',
  }),
});

export type ComplaintFormData = z.infer<typeof complaintSchema>;

/* ── Complaint categories ── */
export const complaintCategories = [
  { value: 'extortion', label: 'Extortion / Bribery' },
  { value: 'assault', label: 'Physical Assault' },
  { value: 'unlawful-detention', label: 'Unlawful Detention' },
  { value: 'harassment', label: 'Harassment / Intimidation' },
  { value: 'negligence', label: 'Negligence of Duty' },
  { value: 'illegal-search', label: 'Illegal Search / Seizure' },
  { value: 'corruption', label: 'Corruption' },
  { value: 'other', label: 'Other' },
] as const;

/* ── Nigerian states ── */
export const nigerianStates = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
] as const;

/* ── API response types ── */
export interface ComplaintSubmissionResponse {
  trackingId: string;
  message: string;
}

export type ComplaintStatus =
  | 'received'
  | 'under-review'
  | 'investigating'
  | 'resolved'
  | 'dismissed';

export interface ComplaintResult {
  trackingId: string;
  status: ComplaintStatus;
  category: string;
  policeStation: string;
  state: string;
  submittedAt: string;
  lastUpdated: string;
  statusHistory: { status: ComplaintStatus; date: string; note: string }[];
}
