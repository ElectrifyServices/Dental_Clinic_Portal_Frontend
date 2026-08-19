import { z } from 'zod';

const invoiceItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  rate: z.coerce.number().min(0),
  amount: z.coerce.number().min(0),
  item_discount: z.coerce.number().min(0).default(0).optional(),
});

export const invoiceSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required'),
  patientPhone: z.string().optional(),
  patientId: z.string().optional(),
  doctor: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  dueDate: z.string().optional(),
  discount: z.coerce.number().min(0).max(100).default(0),
  tax: z.coerce.number().min(0).max(100).default(18),
  isComplimentary: z.boolean().default(false),
  complimentaryNote: z.string().optional(),
  linkedItemIds: z.array(z.string()).default([]),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  paymentMethod: z.string().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type InvoiceItemData = z.infer<typeof invoiceItemSchema>;
