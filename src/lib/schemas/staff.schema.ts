import { z } from 'zod';
import { validatePhone, isoFromDialingCode } from '@/utils/phoneUtils';

export const getStaffSchema = (isEdit: boolean = false) =>
  z.object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().min(1, 'Email address is required').email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    country_code: z.string().optional(),
    country_iso: z.string().optional(),
    role: z.enum(['super_admin', 'admin', 'doctor', 'receptionist', 'nurse', 'assistant', 'staff'], {
      message: 'Please select a valid role',
    }),
    specialization: z.string().optional(),
    password: isEdit
      ? z.string().min(6, 'Password must be at least 6 characters').or(z.literal(''))
      : z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
    confirmPassword: isEdit
      ? z.string().or(z.literal(''))
      : z.string().min(1, 'Confirm password is required'),
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
  }).superRefine((data, ctx) => {
    if (data.phone) {
      const iso = data.country_iso || isoFromDialingCode(data.country_code || '+91');
      const result = validatePhone(data.phone, iso);
      if (!result.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.errorMessage || 'Invalid phone number for selected country',
          path: ['phone'],
        });
      }
    }

    if (!isEdit) {
      if (!data.password || data.password.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password is required',
          path: ['password'],
        });
      } else if (data.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password must be at least 8 characters',
          path: ['password'],
        });
      }

      if (!data.confirmPassword || data.confirmPassword.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Confirm password is required',
          path: ['confirmPassword'],
        });
      } else if (data.password && data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Passwords do not match',
          path: ['confirmPassword'],
        });
      }
    } else {
      if (data.password && data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Passwords do not match',
          path: ['confirmPassword'],
        });
      }
    }
  });

export const staffSchema = getStaffSchema(false);

export type StaffFormData = z.infer<typeof staffSchema>;

/** Step-level field groups for progressive validation */
export const staffStep1Fields = ['name', 'email', 'phone', 'country_code', 'country_iso', 'uniqueId', 'password', 'confirmPassword'] as const;
export const staffStep2Fields = ['role', 'specialization', 'permissions', 'isActive'] as const;
export const staffStep3Fields = ['documents', 'licenseNumber'] as const;
export const staffStep4Fields = ['profitSharing', 'profitPercentage', 'monthlySalary', 'consultationFee', 'qualification', 'experience', 'department'] as const;
