import { z } from 'zod';

export const emrSchema = z.object({
  patientName: z.string().min(1, 'Patient is required'),
  type: z.enum(
    [
      // New record types
      'previous-prescriptions',
      'blood-reports',
      'ecg-reports',
      'physician-clearance',
      'xrays-imaging',
      'discharge-summary',
      'other',

      // Legacy types for compatibility
      'consultation',
      'prescription',
      'treatment-plan',
      'treatment-note',
      'clinical-observation',
      'dental-chart-record',
      'x-ray',
      'cbct-scan',
      'intraoral-photo',
      'lab-report',
      'procedure-record',
      'surgery-record',
      'implant-record',
      'follow-up-note',
      'medical-history-update',
      'billing-record',
      'insurance-document',
      'appointment-visit',
      'referral-letter',
      'other-document'
    ],
    { message: 'Please select a record type' },
  ),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  date: z.string().min(1, 'Date is required'),
  attachments: z.array(z.string()).default([]),
});

export type EmrFormData = z.infer<typeof emrSchema>;
