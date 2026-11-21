import { z } from 'zod';

export const appointmentSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required'),
  country_code: z.string().optional().default('+91'),
  patientPhone: z.string().min(1, 'Phone number is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  doctorName: z.string(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  duration: z.string(),
  type: z.enum([
    "consultation",
    "cleaning",
    "filling",
    "extraction",
    "root-canal",
    "crown",
    "orthodontics",
    "surgery",
    "emergency",
    "other",
  ]),
  treatment: z.string(),
  treatmentType: z.string(),
  notes: z.string(),
  fee: z.coerce.number().min(0),
  patientConcern: z.string(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
