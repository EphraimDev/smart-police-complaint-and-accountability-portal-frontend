import { z } from 'zod';

/* ── Complaint status (matches API enum) ── */
export type ComplaintStatus =
  | 'draft'
  | 'submitted'
  | 'acknowledged'
  | 'under_review'
  | 'assigned'
  | 'under_investigation'
  | 'awaiting_response'
  | 'escalated'
  | 'resolved'
  | 'closed'
  | 'rejected'
  | 'withdrawn';

/* ── Complaint categories (matches API enum) ── */
export const complaintCategories = [
  { value: 'excessive_force', label: 'Excessive Force' },
  { value: 'misconduct', label: 'Misconduct' },
  { value: 'corruption', label: 'Corruption' },
  { value: 'discrimination', label: 'Discrimination' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'negligence', label: 'Negligence' },
  { value: 'unlawful_arrest', label: 'Unlawful Arrest' },
  { value: 'abuse_of_power', label: 'Abuse of Power' },
  { value: 'property_damage', label: 'Property Damage' },
  { value: 'unprofessional_conduct', label: 'Unprofessional Conduct' },
  { value: 'delayed_response', label: 'Delayed Response' },
  { value: 'other', label: 'Other' },
] as const;

/* ── Severity levels ── */
export const severityLevels = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
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

/* ── Zod schema for public complaint submission ── */
export const complaintSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be under 200 characters'),
  complainantName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(120, 'Full name must be under 120 characters'),
  complainantEmail: z.string().email('Enter a valid email address'),
  complainantPhone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be under 15 digits')
    .regex(/^[0-9+\-\s]+$/, 'Enter a valid phone number'),
  incidentLocation: z.string().min(1, 'Enter the incident location'),
  incidentDate: z.string().min(1, 'Select the date of the incident'),
  category: z.string().min(1, 'Select a complaint category'),
  severity: z.string().optional(),
  description: z
    .string()
    .min(20, 'Describe the incident in at least 20 characters')
    .max(3000, 'Description must be under 3000 characters'),
  isAnonymous: z.boolean().optional(),
  consent: z.literal(true, {
    message: 'You must agree to submit your complaint',
  }),
});

export type ComplaintFormData = z.infer<typeof complaintSchema>;

/* ── API response types ── */
export interface ComplaintSubmissionResponse {
  success: boolean;
  message: string;
  correlationId: string;
  data: {
    createdBy: null | { id: string; firstName: string; lastName: string };
    referenceNumber: string;
    title: string;
    description: string;
    status: ComplaintStatus;
    severity: string;
    category: string;
    source: string;
    channel: string;
    isAnonymous: boolean;
    citizenUserId: null | string;
    complainantNameEncrypted: string;
    complainantEmailEncrypted: string;
    complainantPhoneEncrypted: string;
    complainantAddressEncrypted: null | string;
    incidentDate: string;
    incidentLocation: string;
    stationId: null | string;
    trackingToken: string;
    idempotencyKey: null | string;
    updatedBy: null | string;
    resolutionSummary: null | string;
    closedAt: null | string;
    slaDueDate: null | string;
    id: string;
    createdAt: string;
    updatedAt: string;
    isOverdue: boolean;
    version: number;
  };
}

export interface ComplaintResult {
  success: boolean;
  message: string;
  correlationId: string;
  data: {
    id: string;
    createdAt: string;
    updatedAt: string;
    createdBy: null | string | { id: string; firstName: string; lastName: string };
    updatedBy: null | string | { id: string; firstName: string; lastName: string };
    referenceNumber: string;
    title: string;
    description: string;
    status: ComplaintStatus;
    severity: string;
    category: string;
    source: string;
    channel: string;
    isAnonymous: boolean;
    citizenUserId: null | string;
    incidentDate: string;
    incidentLocation: string;
    stationId: null | string;
    resolutionSummary: null | string;
    closedAt: null | string;
    slaDueDate: null | string;
    isOverdue: boolean;
    idempotencyKey: null | string;
    version: number;
    isTrackingTokenAuthenticated: boolean;
    statusHistory: {
      previousStatus: ComplaintStatus | null;
      newStatus: ComplaintStatus;
      changedAt: string;
      changedById: string;
      reasonCode: null | string;
      reason: string;
    }[];
    attachments: {
      id: string;
      createdAt: string;
      updatedAt: string;
      createdBy: string;
      updatedBy: null | string;
      complaintId: string;
      fileName: string;
      originalName: string;
      mimeType: string;
      fileSize: string;
      storagePath: string;
      storageProvider: string;
      fileHash: string;
      hashAlgorithm: string;
      evidenceType: string;
      accessLevel: string;
      description: null | string;
      isMalwareScanned: boolean;
      malwareScanResult: null | string;
      isIntegrityVerified: boolean;
      fileUrl: string;
    }[];
  };
}
