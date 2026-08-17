import { Input } from "@/components/ui/Input";
import { useMemo, useState, useEffect } from "react";
import { getDependentByPatientId } from "../../hooks/corporate/dependentStorage";
import {
  Save,
  Plus,
  User,
  DollarSign,
  Stethoscope,
  ClipboardList,
  Eye,
  IndianRupee,
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
  Loading,
} from "@/components/ui";
import { sanitizeNumericString } from "@/utils/inputUtils";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { PendingItems } from "./InvoiceForm/PendingItems";
import { InvoiceItemRow } from "./InvoiceForm/InvoiceItemRow";
import { PlanBanner } from "./InvoiceForm/PlanBanner";
import { useFormConfig } from "../../hooks/useFormConfig";
import { usePatientQuery } from "../../hooks/patients/usePatientQuery";
import { useInvoicesQuery } from "../../hooks/billing/useInvoicesQuery";
import { useUnbilledItemsQuery } from "../../hooks/billing/useUnbilledItemsQuery";
import { normalizeInvoice } from "../../hooks/billing/useInvoiceQuery";
import { InvoiceViewer } from "./InvoiceViewer";
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
      patientPhone: (invoice as any)?.patientPhone ?? "",
      patientId: (invoice as any)?.patientId ?? "",
      doctor: (invoice as any)?.doctor ?? "",
      date: invoice?.date ?? new Date().toISOString().split("T")[0],
      dueDate: invoice?.dueDate ?? "",
      discount: invoice?.discount ?? 0,
      tax: invoice?.tax ?? 0,
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

  const [selectedPrevInvoiceId, setSelectedPrevInvoiceId] =
    useState<string>("");
  const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null);
  const [showAllInvoicesModal, setShowAllInvoicesModal] =
    useState<boolean>(false);

  const { data: patientInvoicesData } = useInvoicesQuery(
    {
      filters: { patient_id: formData.patientId ? [formData.patientId] : [] },
      limit: 100,
    },
    {
      enabled: !!formData.patientId,
      staleTime: 0,
      gcTime: 0,
      cacheTime: 0,
      refetchOnMount: "always",
    },
  );

  const patientInvoices = useMemo(() => {
    if (!patientInvoicesData) return [];
    let rawList: any[] = [];
    const apiInvoices = patientInvoicesData;
    if (Array.isArray(apiInvoices)) {
      rawList = apiInvoices;
    } else if (apiInvoices && Array.isArray((apiInvoices as any).invoices)) {
      rawList = (apiInvoices as any).invoices;
    } else if (
      apiInvoices &&
      Array.isArray((apiInvoices as any).data?.invoices)
    ) {
      rawList = (apiInvoices as any).data.invoices;
    } else if (apiInvoices && Array.isArray((apiInvoices as any).data?.data)) {
      rawList = (apiInvoices as any).data.data;
    } else if (apiInvoices && Array.isArray((apiInvoices as any).data)) {
      rawList = (apiInvoices as any).data;
    } else if (
      apiInvoices &&
      Array.isArray((apiInvoices as any).responseObject?.data)
    ) {
      rawList = (apiInvoices as any).responseObject.data;
    }
    return rawList.map((inv: any) => normalizeInvoice(inv)).filter(Boolean);
  }, [patientInvoicesData]);

  const [patientSearchInput, setPatientSearchInput] = useState("");
  const [patientSearchQuery, setPatientSearchQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setPatientSearchQuery(patientSearchInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [patientSearchInput]);

  const { data: rawPatientsData } = usePatientQuery({
    search: patientSearchQuery || undefined,
    filters: { isDropdown: [true] as any },
  });
  const apiPatients = useMemo(() => {
    if (!rawPatientsData) return [];
    if (Array.isArray(rawPatientsData)) return rawPatientsData;
    const target = (rawPatientsData as any).responseObject !== undefined ? (rawPatientsData as any).responseObject : rawPatientsData;
    if (Array.isArray(target)) return target;
    if (target && typeof target === "object") {
      if (Array.isArray(target.data?.data?.data)) return target.data.data.data;
      if (Array.isArray(target.data?.data)) return target.data.data;
      if (Array.isArray(target.data)) return target.data;
      if (Array.isArray(target.patients)) return target.patients;
      if (Array.isArray(target.data?.patients)) return target.data.patients;
    }
    return [];
  }, [rawPatientsData]);

  const selectedPatient = useMemo(() => {
    return apiPatients.find(
      (p: any) =>
        p.id === formData.patientId || p.name === formData.patientName,
    );
  }, [apiPatients, formData.patientId, formData.patientName]);

  const cat = (
    selectedPatient?.category ||
    selectedPatient?.patient_category ||
    ""
  ).toLowerCase();
  const isCorporate =
    cat === "corporate" ||
    cat === "employee" ||
    cat === "member" ||
    selectedPatient?.corporatePlanId ||
    selectedPatient?.companyId ||
    selectedPatient?.company_id ||
    selectedPatient?.is_member ||
    selectedPatient?.is_employee ||
    selectedPatient?.isMember ||
    selectedPatient?.isEmployee ||
    selectedPatient?.employeeId ||
    selectedPatient?.employee_id ||
    selectedPatient?.membership_id ||
    selectedPatient?.membershipId;

  const memberId =
    selectedPatient?.source === "member"
      ? selectedPatient.id
      : selectedPatient?.corporateMemberId ||
      selectedPatient?.member_id ||
      selectedPatient?.memberId ||
      selectedPatient?.primaryMemberId ||
      (isCorporate ? selectedPatient.id : "");

  const { data: rawUnbilledData, isLoading: isUnbilledLoading } = useUnbilledItemsQuery(
    formData.patientId,
    memberId,
    {
      enabled: !!formData.patientId,
      staleTime: 0,
      gcTime: 0,
      cacheTime: 0,
      refetchOnMount: "always",
    },
  );

  const outstandingBalance = useMemo(() => {
    if (!rawUnbilledData) return 0;
    const itemsList = Array.isArray(rawUnbilledData)
      ? rawUnbilledData
      : (rawUnbilledData as any)?.data?.items ||
      (rawUnbilledData as any)?.items ||
      (rawUnbilledData as any)?.data ||
      [];

    if (!Array.isArray(itemsList)) return 0;

    return itemsList.reduce(
      (sum: number, item: any) =>
        sum + Number(item.total || item.amount || item.cost || item.rate || 0),
      0,
    );
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
    const directPlan =
      corporatePlans.find(
        (cp) => cp.id === (p?.corporatePlanId || p?.companyId),
      ) || null;

    if (directPlan)
      return { activeCorporatePlan: directPlan, dependentOf: undefined };

    // Dependent lookup: check if this patient is a registered dependent
    if (formData.patientId) {
      const dep = getDependentByPatientId(formData.patientId);
      if (dep?.corporatePlanId) {
        const depPlan =
          corporatePlans.find((cp) => cp.id === dep.corporatePlanId) || null;
        if (depPlan)
          return {
            activeCorporatePlan: depPlan,
            dependentOf: dep.primaryMemberName,
          };
      }
    }

    return { activeCorporatePlan: null, dependentOf: undefined };
  }, [formData.patientId, formData.patientName, apiPatients, corporatePlans]);

  const pendingItems = useMemo(() => {
    if (!formData.patientId) return [];
    const list: any[] = [];

    const unbilledObj =
      rawUnbilledData?.data?.unbilled_items || rawUnbilledData?.unbilled_items;

    if (unbilledObj) {
      const apiConsultations = unbilledObj.consultations || [];
      const apiTreatments = unbilledObj.treatments || [];
      const apiMemberships = unbilledObj.membership || [];

      apiConsultations.forEach((c: any) => {
        list.push({
          id: c.id,
          type: c.type || "consultation",
          description:
            c.description ||
            `Consultation Fee (${new Date(c.date).toLocaleDateString("en-IN")})`,
          rate: c.final_amount ?? c.amount ?? c.original_amount ?? 0,
          date: c.date,
          doctor_name: c.doctor_name || c.doctorName,
          status: c.status,
          rawItem: c,
        });
      });

      apiTreatments.forEach((t: any) => {
        list.push({
          id: t.id,
          type: t.type || "treatment",
          description: t.description || t.procedure || "Treatment Item",
          rate: t.final_amount ?? t.amount ?? t.cost ?? t.original_amount ?? 0,
          date: t.date,
          doctor_name: t.doctor_name || t.doctorName,
          status: t.status,
          rawItem: t,
        });
      });

      apiMemberships.forEach((m: any) => {
        list.push({
          id: m.id,
          type: m.type || "membership",
          description:
            m.description || m.plan_name || m.planName || "Membership Fee",
          rate: m.final_amount ?? m.amount ?? m.cost ?? m.original_amount ?? 0,
          date: m.date,
          status: m.status,
          rawItem: m,
        });
      });
    }

    return list;
  }, [formData.patientId, rawUnbilledData]);

  const invoiceCfg = useFormConfig("invoice");

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const currentItems = (form.getValues("items") ?? []) as InvoiceItem[];
    const updatedItems = currentItems.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === "quantity" || field === "rate")
        updated.amount = (updated.quantity || 1) * (updated.rate || 0);
      return updated;
    });
    setItems(updatedItems);
  };

  const addPendingItem = (pItem: any) => {
    if (formData.linkedItemIds.includes(pItem.id)) return;
    const currentItems = (form.getValues("items") ?? []) as InvoiceItem[];
    const newItem = {
      id: `linked-${Date.now()}-${pItem.id}`,
      description: pItem.description,
      quantity: 1,
      rate: pItem.rate,
      amount: pItem.rate,
      linkedId: pItem.id,
      linkedType: pItem.type,
    } as any;
    setItems(
      currentItems.length === 1 &&
        !currentItems[0].description &&
        currentItems[0].rate === 0
        ? [newItem]
        : [...currentItems, newItem],
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
    const currentItems = (form.getValues("items") ?? []) as InvoiceItem[];
    setItems(currentItems.filter((i) => (i as any).linkedId !== linkedId));
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
  const taxAmount = 0;
  const total = formData.isComplimentary
    ? 0
    : Math.max(0, subtotal - discountAmount);

  const handleSubmit = (data: InvoiceFormData) => {
    onSave({
      ...data,
      id: invoice?.id || `INV-${Date.now()}`,
      items,
      subtotal,
      discount: data.discount,
      tax: 0,
      discountAmount: discountAmount,
      taxAmount: 0,
      total: data.isComplimentary ? 0 : total,
      status: data.isComplimentary
        ? "complimentary"
        : invoice?.status || "draft",
      corporatePlanId: activeCorporatePlan?.id,
      corporatePlanName: activeCorporatePlan?.name,
      planDiscountApplied: planDiscountResult.totalDiscount,
      planBenefitsUsed: planDiscountResult.applied.map((a: any) => a.label),
      memberId: memberId,
      payment_method: formData.paymentMethod,
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LabeledField label="Phone" required>
            <SearchableSelect
              value={formData.patientId || "none"}
              onChange={(val) => {
                if (val === "none") return;
                const p = apiPatients.find((p: any) => p.id === val);
                const cp =
                  p?.corporatePlanId || p?.companyId
                    ? corporatePlans.find(
                      (cp) => cp.id === (p.corporatePlanId || p.companyId),
                    )
                    : null;
                setSelectedPrevInvoiceId("");
                setFormData({
                  ...formData,
                  patientPhone: p?.phone || "",
                  patientName: p?.name || "",
                  patientId: val,
                  linkedItemIds: [],
                  discount: Math.min(100, Math.max(0, cp ? cp.discountPercent : p?.defaultDiscount || 0)),
                });
              }}
              onSearchChange={setPatientSearchInput}
              options={[
                { label: "Select Phone", value: "none" },
                ...apiPatients
                  .filter((p: any) => p.phone)
                  .map((p: any) => ({
                    label: `${p.phone} (${p.name})`,
                    searchLabel: `${p.phone} ${p.name}`,
                    value: p.id,
                    patient: p,
                  })),
              ]}
              renderOption={(option: any) => {
                if (option.value === "none")
                  return <span className="truncate pr-2">{option.label}</span>;
                const p = option.patient;
                if (!p)
                  return <span className="truncate pr-2">{option.label}</span>;

                const profilePic =
                  p.profilePicture || p.avatar || p.profile_picture || p.image;
                const initial = p.name
                  ? p.name.trim().charAt(0).toUpperCase()
                  : "?";

                return (
                  <div className="flex items-center gap-3 py-1">
                    {profilePic ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0 bg-muted">
                        <img
                          src={profilePic}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).style.display = "none";
                            const parent = (e.target as any).parentElement;
                            if (parent) {
                              const fallback =
                                parent.querySelector(".avatar-fallback");
                              if (fallback) fallback.classList.remove("hidden");
                            }
                          }}
                        />
                        <div className="avatar-fallback hidden w-full h-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                          {initial}
                        </div>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center border border-primary/20 flex-shrink-0">
                        {initial}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-foreground text-xs leading-tight">
                        {p.phone}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {p.name}
                      </span>
                    </div>
                  </div>
                );
              }}
              renderValue={(option: any) => {
                if (option.value === "none") return option.label;
                const p = option.patient;
                if (!p) return option.label;

                const profilePic =
                  p.profilePicture || p.avatar || p.profile_picture || p.image;
                const initial = p.name
                  ? p.name.trim().charAt(0).toUpperCase()
                  : "?";

                return (
                  <div className="flex items-center gap-2">
                    {profilePic ? (
                      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-border flex-shrink-0 bg-muted">
                        <img
                          src={profilePic}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).style.display = "none";
                            const parent = (e.target as any).parentElement;
                            if (parent) {
                              const fallback = parent.querySelector(
                                ".avatar-fallback-val",
                              );
                              if (fallback) fallback.classList.remove("hidden");
                            }
                          }}
                        />
                        <div className="avatar-fallback-val hidden w-full h-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center">
                          {initial}
                        </div>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center border border-primary/20 flex-shrink-0">
                        {initial}
                      </div>
                    )}
                    <span className="font-bold text-foreground text-sm truncate">
                      {p.phone}
                    </span>
                  </div>
                );
              }}
              placeholder="Select Phone"
              searchPlaceholder="Search Phone..."
              className="w-full bg-white"
            />
          </LabeledField>
          <LabeledField label="Name" required>
            <SearchableSelect
              value={formData.patientId || "none"}
              onChange={(val) => {
                if (val === "none") return;
                const p = apiPatients.find((p: any) => p.id === val);
                const cp =
                  p?.corporatePlanId || p?.companyId
                    ? corporatePlans.find(
                      (cp) => cp.id === (p.corporatePlanId || p.companyId),
                    )
                    : null;
                setSelectedPrevInvoiceId("");
                setFormData({
                  ...formData,
                  patientName: p?.name || "",
                  patientPhone: p?.phone || "",
                  patientId: val,
                  linkedItemIds: [],
                  discount: Math.min(100, Math.max(0, cp ? cp.discountPercent : p?.defaultDiscount || 0)),
                });
              }}
              onSearchChange={setPatientSearchInput}
              options={[
                { label: "Select Patient", value: "none" },
                ...apiPatients.map((p: any) => ({
                  label: `${p.name} ${p.phone ? `(${p.phone})` : ""}`,
                  searchLabel: `${p.name} ${p.phone || ""}`,
                  value: p.id,
                  patient: p,
                })),
              ]}
              renderOption={(option: any) => {
                if (option.value === "none")
                  return <span className="truncate pr-2">{option.label}</span>;
                const p = option.patient;
                if (!p)
                  return <span className="truncate pr-2">{option.label}</span>;

                const profilePic =
                  p.profilePicture || p.avatar || p.profile_picture || p.image;
                const initial = p.name
                  ? p.name.trim().charAt(0).toUpperCase()
                  : "?";

                return (
                  <div className="flex items-center gap-3 py-1">
                    {profilePic ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0 bg-muted">
                        <img
                          src={profilePic}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).style.display = "none";
                            const parent = (e.target as any).parentElement;
                            if (parent) {
                              const fallback =
                                parent.querySelector(".avatar-fallback");
                              if (fallback) fallback.classList.remove("hidden");
                            }
                          }}
                        />
                        <div className="avatar-fallback hidden w-full h-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                          {initial}
                        </div>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center border border-primary/20 flex-shrink-0">
                        {initial}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-foreground text-xs leading-tight">
                        {p.name}
                      </span>
                      {p.phone && (
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {p.phone}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }}
              renderValue={(option: any) => {
                if (option.value === "none") return option.label;
                const p = option.patient;
                if (!p) return option.label;

                const profilePic =
                  p.profilePicture || p.avatar || p.profile_picture || p.image;
                const initial = p.name
                  ? p.name.trim().charAt(0).toUpperCase()
                  : "?";

                return (
                  <div className="flex items-center gap-2">
                    {profilePic ? (
                      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-border flex-shrink-0 bg-muted">
                        <img
                          src={profilePic}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).style.display = "none";
                            const parent = (e.target as any).parentElement;
                            if (parent) {
                              const fallback = parent.querySelector(
                                ".avatar-fallback-val",
                              );
                              if (fallback) fallback.classList.remove("hidden");
                            }
                          }}
                        />
                        <div className="avatar-fallback-val hidden w-full h-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center">
                          {initial}
                        </div>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center border border-primary/20 flex-shrink-0">
                        {initial}
                      </div>
                    )}
                    <span className="font-bold text-foreground text-sm truncate">
                      {p.name}
                    </span>
                  </div>
                );
              }}
              placeholder="Select Patient"
              searchPlaceholder="Search Patient..."
              className="w-full bg-white"
            />
          </LabeledField>

          <LabeledField label="Invoice Date" required>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
              className="block w-full px-4 py-2 border rounded-xl text-sm"
            />
          </LabeledField>

          <LabeledField label="Payment Method">
            <Select
              value={formData.paymentMethod || ""}
              onValueChange={(val) =>
                setFormData({ ...formData, paymentMethod: val })
              }
            >
              <SelectTrigger className="w-full bg-white border-border">
                <SelectValue placeholder="Select Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </LabeledField>
        </div>

        {/* {formData.patientId && patientInvoices.length > 0 && (
          <div className="bg-muted/40 border border-border/50 rounded-2xl p-4 flex items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Patient Invoices Detected
                </p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  This patient has {patientInvoices.length} previous bills
                  recorded.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAllInvoicesModal(true)}
              className="bg-white hover:bg-slate-50 border-border text-foreground hover:text-primary font-bold px-4 rounded-xl flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-primary" /> View All Bills
            </Button>
          </div>
        )} */}

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
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shadow-sm flex-shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest truncate">
                    Outstanding Payment Detected
                  </p>
                  <p className="text-xs font-bold text-rose-900 mt-0.5 break-words">
                    This patient has a pending balance of ₹
                    {outstandingBalance.toLocaleString()} from previous
                    invoices.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {formData.patientName &&
          (() => {
            const p = apiPatients.find(
              (p: any) => p.name === formData.patientName,
            );
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
                      const disc = Math.min(
                        100,
                        Math.max(
                          0,
                          p.defaultDiscount !== undefined
                            ? p.defaultDiscount
                            : 100,
                        ),
                      );
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

        {isUnbilledLoading ? (
          <div className="flex justify-center py-6 border border-border/50 rounded-2xl bg-muted/20">
            <Loading type="spinner" text="Loading pending Bills..." />
          </div>
        ) : (
          <PendingItems
            pendingItems={pendingItems}
            linkedItemIds={formData.linkedItemIds}
            onAdd={addPendingItem}
            onRemove={removePendingItem}
          />
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-primary" /> Billable Items
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const currentItems = (form.getValues("items") ??
                  []) as InvoiceItem[];
                setItems([
                  ...currentItems,
                  {
                    id: Date.now().toString(),
                    description: "",
                    quantity: 1,
                    rate: 0,
                    amount: 0,
                  },
                ]);
              }}
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
                onUpdate={updateItem}
                onRemove={(id) => {
                  const currentItems = (form.getValues("items") ??
                    []) as InvoiceItem[];
                  const lid = (currentItems.find((i) => i.id === id) as any)
                    ?.linkedId;
                  if (lid)
                    setFormData((prev) => ({
                      ...prev,
                      linkedItemIds: prev.linkedItemIds.filter(
                        (i) => i !== lid,
                      ),
                    }));
                  setItems(currentItems.filter((i) => i.id !== id));
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
                  <IndianRupee
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
                <LabeledField label="Discount %">
                  <Input
                    type="number"
                    value={formData.isComplimentary ? 100 : formData.discount}
                    disabled={formData.isComplimentary}
                    onFocus={e => e.target.select()}
                    onChange={(e) => {
                      const valStr = sanitizeNumericString(e.target.value);
                      e.target.value = valStr;
                      const val = parseFloat(valStr);
                      setFormData({
                        ...formData,
                        discount: isNaN(val) ? 0 : Math.min(100, Math.max(0, val)),
                      });
                    }}
                    min={0}
                    max={100}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold disabled:bg-muted/50"
                  />
                </LabeledField>
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
                  <span className="font-bold">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-destructive">
                  <span>
                    Discount (
                    {formData.isComplimentary ? 100 : formData.discount}
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
      {showAllInvoicesModal && (
        <Modal
          title={`All Invoices for ${formData.patientName}`}
          onClose={() => setShowAllInvoicesModal(false)}
          size="lg"
          icon={<ClipboardList className="w-4 h-4" />}
        >
          <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <div className="rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                      Invoice
                    </th>
                    <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider text-right">
                      Amount
                    </th>
                    <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {patientInvoices.map((inv, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => setViewingInvoiceId(inv.id)}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">
                        {inv.invoice_number || inv.id}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {inv.date
                          ? new Date(inv.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">
                        ₹{inv.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${inv.status === "paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {viewingInvoiceId && (
        <InvoiceViewer
          invoiceId={viewingInvoiceId}
          patientId={formData.patientId}
          onClose={() => setViewingInvoiceId(null)}
        />
      )}
    </Modal>
  );
}
