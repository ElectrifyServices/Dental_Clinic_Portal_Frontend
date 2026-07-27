import { z } from 'zod';

export const labWorkSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  patientName: z.string().min(1, 'Patient is required'),
  labName: z.string().min(1, 'Lab name is required'),
  workType: z.string().min(1, 'Work / Tooth No. is required'),
  unitsCount: z.coerce.number().min(1, 'No. of units must be at least 1'),
  hasWarranty: z.boolean().default(false),
  createdDate: z.string().min(1, 'Created date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
});

export type LabWorkFormData = z.infer<typeof labWorkSchema>;
