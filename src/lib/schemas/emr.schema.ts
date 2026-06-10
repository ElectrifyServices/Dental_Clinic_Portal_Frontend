import { z } from 'zod';

export const emrSchema = z.object({
  patientName: z.string().min(1, 'Patient is required'),
  type: z.enum(
    [
      'CONSULTATION',
      'PRESCRIPTION',
      'LAB_REPORT',
      'X_RAY',
      'TREATMENT_NOTE',
      'BILLING_RECORD',
      'APPOINTMENT_VISIT'
    ],
    { message: 'Please select a record type' },
  ),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  date: z.string().min(1, 'Date is required'),
  attachments: z.array(z.string()).default([]),
});

export type EmrFormData = z.infer<typeof emrSchema>;
