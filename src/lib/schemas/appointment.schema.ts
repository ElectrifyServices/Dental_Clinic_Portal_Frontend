import { z } from 'zod';

export const appointmentSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required'),
  patientPhone: z.string().min(10, 'Phone must be at least 10 digits'),
  doctorId: z.string().min(1, 'Doctor is required'),
  doctorName: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.string().optional(),
  type: z.string().optional(),
  treatment: z.string().optional(),
  treatmentType: z.string().optional(),
  notes: z.string().optional(),
  fee: z.number().min(0).optional().default(0),
  patientConcern: z.string().optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
