import { z } from 'zod';

export const labWorkSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  patientName: z.string().min(1, 'Patient is required'),
  treatmentId: z.string().min(1, 'An ongoing treatment is required'),
  treatmentName: z.string().optional(),
  labName: z.string().min(1, 'Lab name is required'),
  workType: z.string().optional(),
  unitsCount: z.coerce.number().optional().default(1),
  hasWarranty: z.boolean().default(false),
  warrantyYears: z.coerce.number().min(0).optional(),
  warrantyEndDate: z.string().optional(),
  createdDate: z.string().optional(),
  price: z.coerce.number().optional().default(0),
  notes: z.string().optional(),
  rawFiles: z.array(z.any()).optional().default([]),
});

export type LabWorkFormData = z.infer<typeof labWorkSchema>;
