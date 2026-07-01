import { z } from 'zod';

const prescriptionItemSchema = z.object({
  id: z.string(),
  medicine: z.string().optional(),
  dosage: z.string().optional(),
  timing: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  qty: z.string().optional(),
});

const sessionSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  scheduledDate: z.string().optional(),
  duration: z.number().optional(),
  cost: z.number().optional(),
  status: z.string().optional(),
});

export const treatmentSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required'),
  patientId: z.string().optional(),
  procedure: z.string().min(1, 'Procedure is required'),
  tooth: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  cost: z.coerce.number().min(0).default(0),
  status: z.enum(['planned', 'in-progress', 'completed', 'cancelled']).default('planned'),
  nextAppointment: z.string().optional(),
  images: z.array(z.string()).default([]),
  rawFiles: z.array(z.any()).optional().default([]),
  existingImages: z.array(z.string()).optional().default([]),
  doctorId: z.string().default('1'),
  doctorName: z.string().optional(),
  prescriptions: z.array(prescriptionItemSchema).default([]),
  sessions: z.array(sessionSchema).default([]),
});

export type TreatmentFormData = z.infer<typeof treatmentSchema>;
