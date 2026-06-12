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
  Input,
  Loading,
  ConfirmModal,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useFormTitle, useSubmitLabel } from "../../hooks/useFormConfig";
import {
  inventorySchema,
  type InventoryFormData,
} from "@/lib/schemas/inventory.schema";
import { useInventoryCategoriesQuery } from "../../hooks/inventory/useInventoryCategoriesQuery";
import { useCreateInventoryCategoryMutation } from "../../hooks/inventory/useCreateInventoryCategoryMutation";
import { useDeleteInventoryCategoryMutation } from "../../hooks/inventory/useDeleteInventoryCategoryMutation";
import { SearchableSelect } from "../ui/SearchableSelect";
import { useState } from "react";

interface InventoryFormProps {
  onClose: () => void;
  onSave: (item: any) => void;
  item?: any;
  isLoading?: boolean;
}

// Remove hardcoded CATEGORY_OPTIONS

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
  const { data: categoriesData, isLoading: isLoadingCategories } = useInventoryCategoriesQuery();


  const createCategoryMutation = useCreateInventoryCategoryMutation();

  const deleteCategoryMutation = useDeleteInventoryCategoryMutation();
  const [isDeletingCategory, setIsDeletingCategory] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string | null>(null);

  let dynamicCategories: any[] = [];
  if (Array.isArray(categoriesData)) dynamicCategories = categoriesData;
  else if (Array.isArray(categoriesData?.data)) dynamicCategories = categoriesData.data;
  else if (Array.isArray(categoriesData?.items)) dynamicCategories = categoriesData.items;
  else if (Array.isArray(categoriesData?.responseObject)) dynamicCategories = categoriesData.responseObject;
  else if (Array.isArray(categoriesData?.responseObject?.data)) dynamicCategories = categoriesData.responseObject.data;
  else if (categoriesData?.responseObject && Array.isArray(categoriesData?.responseObject?.categories)) dynamicCategories = categoriesData.responseObject.categories;

  const categoryOptions = dynamicCategories.map((c: any) => ({
    label: c?.name || c?.value || c?.label || "Unknown",
    value: c?.id || c?._id || c?.categoryId || c?.category_id || "Unknown",
    id: c?.id || c?._id || c?.categoryId || c?.category_id || Math.random().toString()
  })).filter((c: any) => c.value !== "Unknown");

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema) as any,
    defaultValues: {
      name: item?.name ?? "",
      category: item?.category ?? "",
      description: item?.description ?? "",
      currentStock: item?.currentStock ?? 0,
      minStock: item?.minStock ?? 0,
      maxStock: item?.maxStock ?? 100,
      unit: typeof item?.unit === 'string' ? item.unit.toLowerCase() : "pieces",
      warranty: item?.warranty ?? "",
      supplier: item?.supplier ?? "",
      cost: item?.cost ?? 0,
      expiryDate: typeof item?.expiryDate === 'string' ? item.expiryDate.split("T")[0] : "",
      batchNumber: item?.batchNumber ?? "",
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name ?? "",
        category: item.category ?? "",
        description: item.description ?? "",
        currentStock: item.currentStock ?? 0,
        minStock: item.minStock ?? 0,
        maxStock: item.maxStock ?? 100,
        unit: typeof item.unit === 'string' ? item.unit.toLowerCase() : "pieces",
        warranty: item.warranty ?? "",
        supplier: item.supplier ?? "",
        cost: item.cost ?? 0,
        expiryDate: typeof item.expiryDate === 'string' ? item.expiryDate.split("T")[0] : "",
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
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-3 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-border">Basic Information</p>
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
                        <SearchableSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={categoryOptions}
                          placeholder="Select category..."
                          searchPlaceholder="Search categories..."
                          isLoading={isLoadingCategories}
                          onCreateOption={async (val) => {
                            try {
                              const res = await createCategoryMutation.mutateAsync({ name: val });
                              const newId = res?.id || res?.data?.id || res?.responseObject?.id || res?.categoryId;
                              if (newId) {
                                field.onChange(newId);
                              } else {
                                // Fallback just in case
                                field.onChange(val);
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          isCreating={createCategoryMutation.isPending}
                          createLabel="Add new category"
                          onDeleteOption={(val) => {
                            const cat = categoryOptions.find((c: any) => c.value === val);
                            if (cat?.id) {
                              setDeleteId(cat.id);
                              setDeleteName(val);
                            }
                          }}
                          isDeletingValue={isDeletingCategory}
                        />
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
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-3 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-border">Stock Information</p>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {UNIT_OPTIONS.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-3 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-border">Purchase Information</p>
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

      {deleteId && deleteName && (
        <ConfirmModal
          title="Delete Category"
          message={`Are you sure you want to delete the category "${deleteName}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          isLoading={deleteCategoryMutation.isPending || isDeletingCategory !== null}
          onConfirm={async () => {
            setIsDeletingCategory(deleteName);
            try {
              await deleteCategoryMutation.mutateAsync({ id: deleteId });
              if (form.getValues().category === deleteName) {
                form.setValue("category", "");
              }
              setDeleteId(null);
              setDeleteName(null);
            } catch (e) {
              console.error(e);
            } finally {
              setIsDeletingCategory(null);
            }
          }}
          onCancel={() => {
            setDeleteId(null);
            setDeleteName(null);
          }}
        />
      )}
    </Modal>
  );
}
