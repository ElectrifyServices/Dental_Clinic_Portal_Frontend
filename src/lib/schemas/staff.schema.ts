import { z } from 'zod';

const staffBaseObject = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  country_code: z.string().optional(),
  role: z.enum(['super_admin', 'admin', 'doctor', 'receptionist', 'nurse', 'assistant', 'staff'], {
    message: 'Please select a valid role',
  }),
  specialization: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').or(z.literal('')),
  confirmPassword: z.string().or(z.literal('')),
  permissions: z.array(z.string()).default(['appointments', 'patients']),
  uniqueId: z.string(),
  documents: z.array(z.any()).default([]),
  profitSharing: z.boolean().default(false),
  profitPercentage: z.number().min(0).max(100).default(0),
  licenseNumber: z.string().optional(),
  monthlySalary: z.string().optional(),
  salaryPaid: z.string().optional(),
  salaryPending: z.string().optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  qualification: z.string().optional(),
  consultationFee: z.string().optional(),
  isActive: z.boolean().default(true),
  avatar: z.string().optional(),
});

/** Used when editing an existing staff member — password fields are hidden/optional. */
export const staffSchema = staffBaseObject.refine(
  (data) => !data.password || data.password === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] },
);

/** Used when onboarding a new staff member — a login password is mandatory. */
export const staffCreateSchema = staffBaseObject
  .extend({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string().min(1, 'Please confirm the password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type StaffFormData = z.infer<typeof staffSchema>;

/** Step-level field groups for progressive validation */
export const staffStep1Fields = ['name', 'email', 'phone', 'uniqueId', 'password', 'confirmPassword'] as const;
export const staffStep2Fields = ['role', 'specialization', 'permissions', 'isActive'] as const;
export const staffStep3Fields = ['documents', 'licenseNumber'] as const;
export const staffStep4Fields = ['profitSharing', 'profitPercentage', 'monthlySalary', 'consultationFee', 'qualification', 'experience', 'department'] as const;
