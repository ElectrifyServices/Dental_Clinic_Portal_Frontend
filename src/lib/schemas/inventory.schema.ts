import { z } from 'zod';

export const inventorySchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  category: z.string().min(1, 'Please select a category'),
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
  quantity: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z
      .number({
        required_error: "Quantity is required",
        invalid_type_error: "Quantity must be a valid number",
      })
      .min(1, "Quantity must be at least 1")
  ),
  reason: z
    .string({
      required_error: "Reason is required",
      invalid_type_error: "Reason is required",
    })
    .trim()
    .min(1, "Reason is required"),
  reference_id: z.string().optional(),
});
export type ConsumeFormData = z.infer<typeof consumeSchema>;

export const adjustSchema = z.object({
  quantity: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? val : num;
    },
    z
      .number({
        required_error: "Quantity change is required (e.g. +5 or -2)",
        invalid_type_error: "Quantity change must be a valid number",
      })
      .refine((val) => val !== 0, {
        message: "Quantity change cannot be 0 (e.g. +5 or -2)",
      })
  ),
  reason: z
    .string({
      required_error: "Reason is required",
      invalid_type_error: "Reason is required",
    })
    .trim()
    .min(1, "Reason is required"),
  reference_id: z.string().optional(),
});
export type AdjustFormData = z.infer<typeof adjustSchema>;

