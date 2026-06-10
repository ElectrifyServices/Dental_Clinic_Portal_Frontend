import React, { useEffect } from "react";
import { Save, Package, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Modal,
  Button,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Card,
  CardContent,
  Input,
  Loading,
} from "@/components/ui";
import { useFormTitle, useSubmitLabel } from "../../hooks/useFormConfig";
import {
  inventorySchema,
  type InventoryFormData,
} from "@/lib/schemas/inventory.schema";
import styles from "./inventory.module.css";

interface InventoryFormProps {
  onClose: () => void;
  onSave: (item: any) => void;
  item?: any;
  isLoading?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: "instruments", label: "Instruments" },
  { value: "materials", label: "Materials" },
  { value: "medicines", label: "Medicines" },
  { value: "equipment", label: "Equipment" },
  { value: "consumables", label: "Consumables" },
  { value: "other", label: "Other" },
] as const;

const UNIT_OPTIONS = [
  "pieces",
  "boxes",
  "bottles",
  "packs",
  "ml",
  "gm",
  "kg",
  "liters",
  "rolls",
  "pairs",
  "sets",
];

export function InventoryForm({ onClose, onSave, item, isLoading }: InventoryFormProps) {
  const formTitle = useFormTitle("inventory", item ? "edit" : "create");
  const submitLabel = useSubmitLabel("inventory", item ? "edit" : "create");

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema) as any,
    defaultValues: {
      name: item?.name ?? "",
      category: item?.category?.toLowerCase() ?? "instruments",
      description: item?.description ?? "",
      currentStock: item?.currentStock ?? 0,
      minStock: item?.minStock ?? 0,
      maxStock: item?.maxStock ?? 100,
      unit: item?.unit?.toLowerCase() ?? "pieces",
      warranty: item?.warranty ?? "",
      supplier: item?.supplier ?? "",
      cost: item?.cost ?? 0,
      expiryDate: (item?.expiryDate ?? "").split("T")[0],
      batchNumber: item?.batchNumber ?? "",
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name ?? "",
        category: item.category?.toLowerCase() ?? "instruments",
        description: item.description ?? "",
        currentStock: item.currentStock ?? 0,
        minStock: item.minStock ?? 0,
        maxStock: item.maxStock ?? 100,
        unit: item.unit?.toLowerCase() ?? "pieces",
        warranty: item.warranty ?? "",
        supplier: item.supplier ?? "",
        cost: item.cost ?? 0,
        expiryDate: (item.expiryDate ?? "").split("T")[0],
        batchNumber: item.batchNumber ?? "",
      });
    }
  }, [item, form]);

  const currentStock = form.watch("currentStock");
  const minStock = form.watch("minStock");

  const onSubmit = (data: InventoryFormData) => {
    onSave({
      ...data,
      id: item?.id || Date.now().toString(),
      lastRestocked:
        item?.lastRestocked || new Date().toISOString().split("T")[0],
    });
  };

  const selectCls =
    "form-input w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all";

  return (
    <Modal
      title={formTitle}
      onClose={onClose}
      size="xl"
      icon={<Package className="w-4 h-4" />}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} className="gap-2">
            <Save className="w-4 h-4" /> {submitLabel}
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <Loading type="spinner" text="Loading item details..." />
      ) : (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* ── Basic Info ─────────────────────────────────────────── */}
          <Card>
            <CardContent className="pt-6">
              <p className={styles.sectionHeading}>Basic Information</p>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Item Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Dental Mirror" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Category <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <select {...field} className={selectCls}>
                          {CATEGORY_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Optional description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Stock Info ──────────────────────────────────────────── */}
          <Card>
            <CardContent className="pt-6">
              <p className={styles.sectionHeading}>Stock Information</p>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="currentStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Current Stock <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          min={0} 
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                          onFocus={(e) => e.target.select()} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Min Stock <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          min={0} 
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                          onFocus={(e) => e.target.select()} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Max Stock <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          min={1} 
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                          onFocus={(e) => e.target.select()} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Unit <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <select {...field} className={selectCls}>
                          {UNIT_OPTIONS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="batchNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. BATCH-001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Expiry Date <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Low-stock warning — intentional amber status colors */}
              {Number(currentStock) <= Number(minStock) &&
                Number(currentStock) > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-tight">
                      Warning: Item will reach critical level soon
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* ── Purchase Info ───────────────────────────────────────── */}
          <Card>
            <CardContent className="pt-6">
              <p className={styles.sectionHeading}>Purchase Information</p>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Cost (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          min={0} 
                          step="0.01" 
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                          onFocus={(e) => e.target.select()} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Supplier name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="warranty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 1 year" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
      )}
    </Modal>
  );
}
