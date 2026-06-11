import { Input } from "@/components/ui/Input";
import { useMemo } from "react";
import { getDependentByPatientId } from "../../hooks/corporate/dependentStorage";
import {
  Save,
  Plus,
  User,
  DollarSign,
  Stethoscope,
  ClipboardList,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Invoice, InvoiceItem } from "../../types";
import { computePlanDiscount } from "../../utils/corporatePlan";
import {
  Modal,
  Button,
  Card,
  CardContent,
  LabeledField,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui";
import { PendingItems } from "./InvoiceForm/PendingItems";
import { InvoiceItemRow } from "./InvoiceForm/InvoiceItemRow";
import { PlanBanner } from "./InvoiceForm/PlanBanner";
import { useFormConfig } from "../../hooks/useFormConfig";
import { usePatientQuery } from "../../hooks/patients/usePatientQuery";
import { useInvoicesQuery } from "../../hooks/billing/useInvoicesQuery";
import { useUnbilledItemsQuery } from "../../hooks/billing/useUnbilledItemsQuery";
import {
  invoiceSchema,
  type InvoiceFormData,
} from "@/lib/schemas/billing.schema";

interface InvoiceFormProps {
  onClose: () => void;
  onSave: (invoice: Partial<Invoice>) => void;
  invoice?: Invoice;
  patients: any[];
  treatments: any[];
  consultations: any[];
  corporatePlans: any[];
}

export function InvoiceForm({
  onClose,
  onSave,
  invoice,
  patients,
  treatments = [],
  consultations = [],
  corporatePlans = [],
}: InvoiceFormProps) {
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      patientName: invoice?.patientName ?? "",
      patientId: (invoice as any)?.patientId ?? "",
      doctor: (invoice as any)?.doctor ?? "",
      date: invoice?.date ?? new Date().toISOString().split("T")[0],
      dueDate:
        invoice?.dueDate ??
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      discount: invoice?.discount ?? 0,
      tax: invoice?.tax ?? 18,
      isComplimentary: (invoice as any)?.isComplimentary ?? false,
      complimentaryNote: (invoice as any)?.complimentaryNote ?? "",
      linkedItemIds: (invoice as any)?.linkedItemIds ?? [],
      items: invoice?.items?.map((i) => ({
        ...i,
        quantity: i.quantity ?? 1,
        rate: i.rate ?? 0,
        amount: i.amount ?? 0,
      })) ?? [{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }],
    },
  });

  const formData = form.watch();

  const { data: rawPatientsData } = usePatientQuery({ filters: { isDropdown: [true] as any } });
  const apiPatients = useMemo(() => {
    return Array.isArray(rawPatientsData) 
      ? rawPatientsData 
      : (rawPatientsData as any)?.data?.data || (rawPatientsData as any)?.data || [];
  }, [rawPatientsData]);

  // const { data: rawInvoicesData } = useInvoicesQuery(
  //   {
  //     page: 1,
  //     limit: 100,
  //     filters: {
  //       patient_id: formData.patientId ? [formData.patientId] : undefined,
  //     },
  //   },
  //   {
  //     enabled: !!formData.patientId,
  //   }
  // );

  const { data: rawUnbilledData } = useUnbilledItemsQuery(
    formData.patientId,
    {
      enabled: !!formData.patientId,
    }
  );

  const outstandingBalance = useMemo(() => {
    if (!rawUnbilledData) return 0;
    const itemsList = Array.isArray(rawUnbilledData) 
      ? rawUnbilledData 
      : (rawUnbilledData as any)?.data?.items || (rawUnbilledData as any)?.items || (rawUnbilledData as any)?.data || [];
    
    if (!Array.isArray(itemsList)) return 0;
    
    return itemsList
      .reduce((sum: number, item: any) => sum + (Number(item.total || item.amount || item.cost || item.rate || 0)), 0);
  }, [rawUnbilledData]);
  const setFormData = (
    updater:
      | Partial<InvoiceFormData>
      | ((prev: InvoiceFormData) => Partial<InvoiceFormData>),
  ) => {
    const current = form.getValues();
    const updated = typeof updater === "function" ? updater(current) : updater;
    Object.entries(updated).forEach(([k, v]) =>
      form.setValue(k as keyof InvoiceFormData, v as any),
    );
  };

  const items = (formData.items ?? []) as InvoiceItem[];
  const setItems = (newItems: InvoiceItem[]) =>
    form.setValue("items", newItems as any);

  const { activeCorporatePlan, dependentOf } = useMemo(() => {
    const p = apiPatients.find(
      (p) => p.id === formData.patientId || p.name === formData.patientName,
    );

    // Direct plan lookup (primary member or individually enrolled patient)
    const directPlan = corporatePlans.find(
      (cp) => cp.id === (p?.corporatePlanId || p?.companyId),
    ) || null;

    if (directPlan) return { activeCorporatePlan: directPlan, dependentOf: undefined };

    // Dependent lookup: check if this patient is a registered dependent
    if (formData.patientId) {
      const dep = getDependentByPatientId(formData.patientId);
      if (dep?.corporatePlanId) {
        const depPlan = corporatePlans.find(cp => cp.id === dep.corporatePlanId) || null;
        if (depPlan) return { activeCorporatePlan: depPlan, dependentOf: dep.primaryMemberName };
      }
    }

    return { activeCorporatePlan: null, dependentOf: undefined };
  }, [formData.patientId, formData.patientName, apiPatients, corporatePlans]);

  const pendingItems = useMemo(() => {
    if (!formData.patientId) return [];
    const list: any[] = [];
    
    const unbilledObj = rawUnbilledData?.data?.unbilled_items || rawUnbilledData?.unbilled_items;
    
    if (unbilledObj) {
      const apiConsultations = unbilledObj.consultations || [];
      const apiTreatments = unbilledObj.treatments || [];
      
      apiConsultations.forEach((c: any) => {
        const isFree = c.is_free || c.isFree || activeCorporatePlan?.freeConsultation || false;
        list.push({
          id: c.id,
          type: c.type || "consultation",
          description: c.description || `Consultation Fee (${new Date(c.date).toLocaleDateString("en-IN")})${isFree ? " [FREE]" : ""}`,
          rate: isFree ? 0 : (c.amount ?? 500),
          date: c.date,
          doctor_name: c.doctor_name || c.doctorName,
          status: c.status,
        });
      });
      
      apiTreatments.forEach((t: any) => {
        const isFree = t.is_free || t.isFree || false;
        list.push({
          id: t.id,
          type: t.type || "treatment",
          description: t.description || t.procedure || "Treatment Item",
          rate: isFree ? 0 : (t.amount ?? t.cost ?? 0),
          date: t.date,
          doctor_name: t.doctor_name || t.doctorName,
          status: t.status,
        });
      });
    }
    
    return list;
  }, [formData.patientId, rawUnbilledData, activeCorporatePlan]);

  const invoiceCfg = useFormConfig("invoice");
  const commonServices: Array<{ name: string; rate: number }> =
    (invoiceCfg as any).commonServices ?? [];

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "rate")
          updated.amount = (updated.quantity || 1) * (updated.rate || 0);
        return updated;
      }),
    );
  };

  const addPendingItem = (pItem: any) => {
    if (formData.linkedItemIds.includes(pItem.id)) return;
    const newItem = {
      id: `linked-${Date.now()}-${pItem.id}`,
      description: pItem.description,
      quantity: 1,
      rate: pItem.rate,
      amount: pItem.rate,
      linkedId: pItem.id,
    } as any;
    setItems(
      items.length === 1 && !items[0].description && items[0].rate === 0
        ? [newItem]
        : [...items, newItem],
    );
    setFormData((prev) => ({
      ...prev,
      linkedItemIds: [...prev.linkedItemIds, pItem.id],
    }));
  };

  const removePendingItem = (linkedId: string) => {
    setFormData((prev) => ({
      ...prev,
      linkedItemIds: prev.linkedItemIds.filter((id) => id !== linkedId),
    }));
    setItems(items.filter((i) => (i as any).linkedId !== linkedId));
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const manualDiscount = formData.isComplimentary
    ? subtotal
    : (subtotal * formData.discount) / 100;
  const planDiscountResult = useMemo(() => {
    if (!activeCorporatePlan || formData.isComplimentary)
      return { totalDiscount: 0, applied: [] };
    const types = items.map((i) =>
      i.description.toLowerCase().includes("consultation")
        ? "consultation"
        : "other",
    );
    return computePlanDiscount(
      activeCorporatePlan,
      subtotal - manualDiscount,
      types,
    );
  }, [
    activeCorporatePlan,
    subtotal,
    manualDiscount,
    items,
    formData.isComplimentary,
  ]);

  const discountAmount = manualDiscount + planDiscountResult.totalDiscount;
  const taxAmount = formData.isComplimentary
    ? 0
    : (Math.max(0, subtotal - discountAmount) * formData.tax) / 100;
  const total = formData.isComplimentary
    ? 0
    : Math.max(0, subtotal - discountAmount + taxAmount);

  const handleSubmit = (data: InvoiceFormData) => {
    onSave({
      ...data,
      id: invoice?.id || `INV-${Date.now()}`,
      items,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total: data.isComplimentary ? 0 : total,
      status: data.isComplimentary
        ? "complimentary"
        : invoice?.status || "draft",
      corporatePlanId: activeCorporatePlan?.id,
      corporatePlanName: activeCorporatePlan?.name,
      planDiscountApplied: planDiscountResult.totalDiscount,
      planBenefitsUsed: planDiscountResult.applied.map((a: any) => a.label),
    } as any);
  };

  return (
    <Modal
      title={invoice ? "Edit Invoice" : "Create Bill"}
      onClose={onClose}
      size="2xl"
      icon={<ClipboardList className="w-4 h-4" />}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(handleSubmit)} className="gap-2">
            <Save className="w-4 h-4" /> Save & Finalize Bill
          </Button>
        </div>
      }
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LabeledField label="Patient Name" required>
            <Select
              value={formData.patientName}
              onValueChange={(val) => {
                const p = apiPatients.find((p: any) => p.name === val);
                const cp =
                  p?.corporatePlanId || p?.companyId
                    ? corporatePlans.find(
                      (cp) => cp.id === (p.corporatePlanId || p.companyId),
                    )
                    : null;
                setFormData({
                  ...formData,
                  patientName: val,
                  patientId: p?.id || "",
                  linkedItemIds: [],
                  discount: cp ? cp.discountPercent : p?.defaultDiscount || 0,
                });
              }}
            >
              <SelectTrigger className="w-full px-4 py-2 border rounded-xl text-sm font-medium text-left">
                <SelectValue placeholder="Select Patient" />
              </SelectTrigger>
              <SelectContent>
                {apiPatients.map((p: any) => (
                  <SelectItem key={p.id} value={p.name}>
                    {p.name} {p.category === "family" ? "⭐" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </LabeledField>
          <LabeledField label="Invoice Date" required>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
              className="w-full px-4 py-2 border rounded-xl text-sm"
            />
          </LabeledField>
          <LabeledField label="Due Date" required>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              required
              className="w-full px-4 py-2 border rounded-xl text-sm"
            />
          </LabeledField>
        </div>

        {activeCorporatePlan && (
          <PlanBanner
            plan={activeCorporatePlan}
            savings={planDiscountResult.totalDiscount}
            dependentOf={dependentOf}
          />
        )}

        {outstandingBalance > 0 && (
          <Card className="border-rose-100 bg-rose-50/50 shadow-none rounded-2xl overflow-hidden">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shadow-sm">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">
                    Outstanding Payment Detected
                  </p>
                  <p className="text-xs font-bold text-rose-900 mt-0.5">
                    This patient has a pending balance of ₹{outstandingBalance.toLocaleString()} from previous invoices.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {formData.patientName &&
          (() => {
            const p = apiPatients.find((p: any) => p.name === formData.patientName);
            if (["family", "staff", "complimentary"].includes(p?.category))
              return (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between gap-4 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                        {p.category} Patient Detected
                      </p>
                      <p className="text-xs font-bold text-amber-900 mt-0.5">
                        Special benefits available for this patient.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      const disc =
                        p.defaultDiscount !== undefined
                          ? p.defaultDiscount
                          : 100;
                      setFormData((prev) => ({
                        ...prev,
                        isComplimentary: disc === 100,
                        discount: disc,
                        complimentaryNote:
                          disc === 100
                            ? `Waived - ${p.category.toUpperCase()} Benefit`
                            : prev.complimentaryNote,
                      }));
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap"
                  >
                    Apply {p.defaultDiscount || 100}% Discount
                  </Button>
                </div>
              );
          })()}

        <PendingItems
          pendingItems={pendingItems}
          linkedItemIds={formData.linkedItemIds}
          onAdd={addPendingItem}
          onRemove={removePendingItem}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-primary" /> Billable Items
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setItems([
                  ...items,
                  {
                    id: Date.now().toString(),
                    description: "",
                    quantity: 1,
                    rate: 0,
                    amount: 0,
                  },
                ])
              }
              className="h-8 text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </Button>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <InvoiceItemRow
                key={item.id}
                item={item}
                commonServices={commonServices}
                onUpdate={updateItem}
                onRemove={(id) => {
                  const lid = (items.find((i) => i.id === id) as any)?.linkedId;
                  if (lid)
                    setFormData((prev) => ({
                      ...prev,
                      linkedItemIds: prev.linkedItemIds.filter(
                        (i) => i !== lid,
                      ),
                    }));
                  setItems(items.filter((i) => i.id !== id));
                }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
          <Card className="border-border/50 shadow-none bg-muted/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign
                    className={`w-4 h-4 ${formData.isComplimentary ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Complimentary Bill
                  </span>
                </div>
                <Input
                  type="checkbox"
                  checked={formData.isComplimentary}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isComplimentary: e.target.checked,
                      discount: e.target.checked ? 100 : 0,
                      tax: e.target.checked ? 0 : 18,
                    }))
                  }
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
              </div>
              {formData.isComplimentary && (
                <Input
                  type="text"
                  placeholder="Complimentary Reason..."
                  value={formData.complimentaryNote}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      complimentaryNote: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-card border rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                />
              )}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <LabeledField label="Discount %">
                    <Input
                      type="number"
                      value={formData.isComplimentary ? 100 : formData.discount}
                      disabled={formData.isComplimentary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-xl text-sm font-bold disabled:bg-muted/50"
                    />
                  </LabeledField>
                  <LabeledField label="Tax %">
                    <Input
                      type="number"
                      value={formData.isComplimentary ? 0 : formData.tax}
                      disabled={formData.isComplimentary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tax: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-xl text-sm font-bold disabled:bg-muted/50"
                    />
                  </LabeledField>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border-border/50 shadow-none">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase px-1">
                <span>Summary</span>
                <span>Amount</span>
              </div>
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-destructive">
                  <span>
                    Discount ({formData.isComplimentary ? 100 : formData.discount}
                    %)
                  </span>
                  <span className="font-bold">
                    -₹{manualDiscount.toLocaleString()}
                  </span>
                </div>
                {planDiscountResult.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Corporate Benefits</span>
                    <span className="font-bold">
                      -₹{planDiscountResult.totalDiscount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    GST ({formData.isComplimentary ? 0 : formData.tax}%)
                  </span>
                  <span className="font-bold">₹{taxAmount.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-dashed border-border flex justify-between items-center">
                  <span className="text-sm font-black uppercase tracking-wider">
                    Final Total
                  </span>
                  <span className="text-2xl font-black text-primary">
                    ₹{(formData.isComplimentary ? 0 : total).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </Modal>
  );
}
