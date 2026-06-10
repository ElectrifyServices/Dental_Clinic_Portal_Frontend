import { z } from 'zod';

export const inventorySchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  category: z.enum(['instruments', 'materials', 'medicines', 'equipment', 'consumables', 'other'], {
    message: 'Please select a category',
  }),
  description: z.string().optional(),
  currentStock: z.coerce.number().min(0, 'Stock cannot be negative'),
  minStock: z.coerce.number().min(0, 'Min stock cannot be negative'),
  maxStock: z.coerce.number().min(1, 'Max stock must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  warranty: z.string().optional(),
  supplier: z.string().optional(),
  cost: z.coerce.number().min(0, 'Cost cannot be negative'),
  expiryDate: z.string().optional(),
  batchNumber: z.string().optional(),
}).refine((d) => d.maxStock >= d.minStock, {
  message: 'Max stock must be ≥ min stock',
  path: ['maxStock'],
});

export type InventoryFormData = z.infer<typeof inventorySchema>;

export const restockSchema = z.object({
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  reason: z.string().optional(),
  reference_id: z.string().optional(),
});
export type RestockFormData = z.infer<typeof restockSchema>;

export const consumeSchema = z.object({
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  reason: z.string().min(1, 'Reason is required'),
  reference_id: z.string().optional(),
});
export type ConsumeFormData = z.infer<typeof consumeSchema>;

export const adjustSchema = z.object({
  quantity: z.coerce.number(), // Can be positive or negative
  reason: z.string().min(1, 'Reason is required'),
  reference_id: z.string().optional(),
});
export type AdjustFormData = z.infer<typeof adjustSchema>;

