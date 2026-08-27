import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
  country_code: z.string().optional().default('+91'),
  phone: z.string().min(1, 'Phone number is required'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', '']).optional(),
  address: z.string().optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']).optional(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed', '']).optional(),
  occupation: z.string().optional(),
  relation: z.string().optional(),
  customRelation: z.string().optional(),

  // Emergency contact
  emergencyName: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyRelation: z.string().optional(),
  customEmergencyRelation: z.string().optional(),

  // Medical history (newline-separated tags stored as string)
  medicalHistory: z.string().optional(),
  pastDentalHistory: z.string().optional(),
  allergies: z.string().optional(),
  allergyOther: z.string().optional(),
  allergyNotes: z.string().optional(),

  // Insurance
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  referredBy: z.string().optional(),

  // Previous clinic
  previousDoctorName: z.string().optional(),
  previousClinicName: z.string().optional(),
  previousDoctorPhone: z.string().optional(),
  previousClinicAddress: z.string().optional(),
  previousLastVisitDate: z.string().optional(),
  previousReason: z.string().optional(),
  previousTreatments: z.array(z.string()).optional().default([]),

  // IDs
  patientId: z.string().optional(),
  barcode: z.string().optional(),
  avatar: z.string().optional(),
  dentalFiles: z.array(z.any()).optional().default([]),
  remove_image_ids: z.array(z.string()).optional().default([]),
});

export type PatientFormData = z.infer<typeof patientSchema>;
