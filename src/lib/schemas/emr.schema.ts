import { z } from 'zod';

export const emrSchema = z.object({
  patientName: z.string().min(1, 'Patient is required'),
  type: z.enum(
    ['consultation', 'prescription', 'lab-report', 'x-ray', 'treatment-note', 'billing-record', 'appointment-visit'],
    { message: 'Please select a record type' },
  ),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  date: z.string().min(1, 'Date is required'),
  attachments: z.array(z.string()).default([]),
});

export type EmrFormData = z.infer<typeof emrSchema>;
