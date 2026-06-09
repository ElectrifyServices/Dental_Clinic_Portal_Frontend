import { Package, RefreshCw } from "lucide-react";
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
} from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { useFormTitle, useSubmitLabel } from "../../hooks/useFormConfig";
import {
  restockSchema,
  type RestockFormData,
} from "@/lib/schemas/inventory.schema";

interface RestockFormProps {
  item: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function RestockForm({ item, onClose, onSave }: RestockFormProps) {
  const formTitle = useFormTitle("restock", "create");
  const submitLabel = useSubmitLabel("restock", "create");

  const form = useForm<RestockFormData>({
    resolver: zodResolver(restockSchema) as any,
    defaultValues: {
      quantity: 1,
      reason: "Monthly restock from supplier",
      reference_id: "",
    },
  });

  const onSubmit = (data: RestockFormData) => {
    onSave({
      id: item.id,
      quantity: data.quantity,
      reason: data.reason,
      reference_id: data.reference_id,
    });
  };

  return (
    <Modal
      title={formTitle}
      onClose={onClose}
      size="md"
      icon={<RefreshCw className="w-4 h-4" />}
      footer={
        <div className="flex gap-3 w-full justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} className="gap-2">
            <RefreshCw className="w-4 h-4" /> {submitLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Item summary banner */}
        <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest">
              Active Item
            </p>
            <p className="text-lg font-black text-foreground leading-tight">
              {item.name}
            </p>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              Current Stock:{" "}
              <span className="font-bold text-foreground">
                {item.currentStock} {item.unit}
              </span>
            </p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4"
          >
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Quantity to Add <span className="text-destructive">*</span>
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Monthly restock from supplier" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reference_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference ID (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. PO-2026-001" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </Modal>
  );
}
