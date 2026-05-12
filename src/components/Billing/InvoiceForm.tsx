import React, { useState, useMemo } from "react";
import { Save, Plus, User, Calendar, DollarSign, Building2, Stethoscope, ClipboardList } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Invoice, InvoiceItem } from "../../types";
import { computePlanDiscount } from "../../utils/corporatePlan";
import { Modal, Button, Card, CardContent, LabeledField, Badge, SectionRenderer } from "@/components/ui";
import { PendingItems } from "./InvoiceForm/PendingItems";
import { InvoiceItemRow } from "./InvoiceForm/InvoiceItemRow";
import { PlanBanner } from "./InvoiceForm/PlanBanner";
import { useFormConfig } from "../../hooks/useFormConfig";
import { invoiceSchema, type InvoiceFormData } from "@/lib/schemas/billing.schema";

interface InvoiceFormProps {
  onClose: () => void;
  onSave: (invoice: Partial<Invoice>) => void;
  invoice?: Invoice;
  patients: any[];
  treatments: any[];
  consultations: any[];
  corporatePlans: any[];
}

export function InvoiceForm({ onClose, onSave, invoice, patients, treatments = [], consultations = [], corporatePlans = [] }: InvoiceFormProps) {
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      patientName: invoice?.patientName ?? "",
      patientId: (invoice as any)?.patientId ?? "",
      doctor: (invoice as any)?.doctor ?? "",
      date: invoice?.date ?? new Date().toISOString().split("T")[0],
      dueDate: invoice?.dueDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      discount: invoice?.discount ?? 0,
      tax: invoice?.tax ?? 18,
      isComplimentary: (invoice as any)?.isComplimentary ?? false,
      complimentaryNote: (invoice as any)?.complimentaryNote ?? "",
      linkedItemIds: (invoice as any)?.linkedItemIds ?? [],
      items: invoice?.items?.map(i => ({ ...i, quantity: i.quantity ?? 1, rate: i.rate ?? 0, amount: i.amount ?? 0 })) ?? [
        { id: "1", description: "", quantity: 1, rate: 0, amount: 0 }
      ],
    },
  });

  const formData = form.watch();
  const setFormData = (updater: any) => {
    const current = form.getValues();
    const updated = typeof updater === 'function' ? updater(current) : updater;
    Object.entries(updated).forEach(([k, v]) => form.setValue(k as keyof InvoiceFormData, v as any));
  };

  const items = (formData.items ?? []) as InvoiceItem[];
  const setItems = (newItems: InvoiceItem[]) => form.setValue('items', newItems as any);

  const activeCorporatePlan = useMemo(() => {
    const p = patients.find(p => p.id === formData.patientId || p.name === formData.patientName);
    return corporatePlans.find(cp => cp.id === (p?.corporatePlanId || p?.companyId)) || null;
  }, [formData.patientId, formData.patientName, patients, corporatePlans]);

  const pendingItems = useMemo(() => {
    if (!formData.patientName) return [];
    const list: any[] = [];
    consultations.filter(c => c.patientName === formData.patientName && !c.isBilled).forEach(c => {
      const isFree = activeCorporatePlan?.freeConsultation;
      list.push({ id: c.id, type: 'consultation', description: `Consultation Fee (${new Date(c.consultationDate || c.date).toLocaleDateString('en-IN')})${isFree ? ' [FREE]' : ''}`, rate: isFree ? 0 : 500, date: c.consultationDate || c.date });
    });
    treatments.filter(t => t.patientName === formData.patientName && (t.status === 'completed' || t.status === 'in-progress')).forEach(t => {
      if (Array.isArray(t.sessions)) {
        t.sessions.filter((s: any) => (s.status === 'completed' || s.status === 'in-progress') && !s.isBilled).forEach((s: any) => {
          list.push({ id: `${t.id}-${s.id}`, type: 'treatment-session', description: `${t.procedure} - Session ${s.sessionNumber}`, rate: s.cost || 0, date: s.scheduledDate || s.date, originalTreatmentId: t.id, originalSessionId: s.id });
        });
      } else if (!t.isBilled) {
        list.push({ id: t.id, type: 'treatment', description: t.procedure, rate: t.cost || 0, date: t.date });
      }
    });
    return list;
  }, [formData.patientName, treatments, consultations, activeCorporatePlan]);

  const invoiceCfg = useFormConfig('invoice');
  const commonServices: Array<{ name: string; rate: number }> = (invoiceCfg as any).commonServices ?? [];
  const doctors = ["Dr. Rajesh Sharma — General Dentistry", "Dr. Priya Patel — Orthodontics", "Dr. Amit Singh — Oral Surgery"];

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === "quantity" || field === "rate") updated.amount = (updated.quantity || 1) * (updated.rate || 0);
      return updated;
    }));
  };

  const addPendingItem = (pItem: any) => {
    if (formData.linkedItemIds.includes(pItem.id)) return;
    const newItem = { id: `linked-${Date.now()}-${pItem.id}`, description: pItem.description, quantity: 1, rate: pItem.rate, amount: pItem.rate, linkedId: pItem.id } as any;
    setItems(items.length === 1 && !items[0].description && items[0].rate === 0 ? [newItem] : [...items, newItem]);
    setFormData(prev => ({ ...prev, linkedItemIds: [...prev.linkedItemIds, pItem.id] }));
  };

  const removePendingItem = (linkedId: string) => {
    setFormData(prev => ({ ...prev, linkedItemIds: prev.linkedItemIds.filter(id => id !== linkedId) }));
    setItems(items.filter(i => (i as any).linkedId !== linkedId));
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const manualDiscount = formData.isComplimentary ? subtotal : (subtotal * formData.discount) / 100;
  const planDiscountResult = useMemo(() => {
    if (!activeCorporatePlan || formData.isComplimentary) return { totalDiscount: 0, applied: [] };
    const types = items.map(i => i.description.toLowerCase().includes('consultation') ? 'consultation' : 'other');
    return computePlanDiscount(activeCorporatePlan, subtotal - manualDiscount, types);
  }, [activeCorporatePlan, subtotal, manualDiscount, items, formData.isComplimentary]);

  const discountAmount = manualDiscount + planDiscountResult.totalDiscount;
  const taxAmount = formData.isComplimentary ? 0 : (Math.max(0, subtotal - discountAmount) * formData.tax) / 100;
  const total = formData.isComplimentary ? 0 : Math.max(0, subtotal - discountAmount + taxAmount);

  const handleSubmit = (data: InvoiceFormData) => {
    onSave({
      ...data, id: invoice?.id || `INV-${Date.now()}`, items, subtotal, discount: discountAmount, tax: taxAmount,
      total: data.isComplimentary ? 0 : total, status: data.isComplimentary ? "complimentary" : (invoice?.status || "draft"),
      corporatePlanId: activeCorporatePlan?.id, corporatePlanName: activeCorporatePlan?.name,
      planDiscountApplied: planDiscountResult.totalDiscount, planBenefitsUsed: planDiscountResult.applied.map((a: any) => a.label),
    } as any);
  };

  return (
    <Modal title={invoice ? "Edit Invoice" : "Create Bill"} onClose={onClose} size="2xl" icon={<ClipboardList className="w-4 h-4" />}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={form.handleSubmit(handleSubmit)} className="gap-2"><Save className="w-4 h-4" /> Save & Finalize Bill</Button>
        </div>
      }
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LabeledField label="Patient Name *" required>
            <select value={formData.patientName} onChange={(e) => {
              const p = patients.find(p => p.name === e.target.value);
              const cp = p?.corporatePlanId || p?.companyId ? corporatePlans.find(cp => cp.id === (p.corporatePlanId || p.companyId)) : null;
              setFormData({ ...formData, patientName: e.target.value, patientId: p?.id || '', linkedItemIds: [], discount: cp ? cp.discountPercent : (p?.defaultDiscount || 0) });
            }} required className="w-full px-4 py-2 border rounded-xl text-sm font-medium">
              <option value="">Select Patient</option>
              {patients.map(p => <option key={p.id} value={p.name}>{p.name} ({p.id}) {p.category === 'family' ? '⭐' : ''}</option>)}
            </select>
          </LabeledField>
          <LabeledField label="Invoice Date *"><input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required className="w-full px-4 py-2 border rounded-xl text-sm"/></LabeledField>
          <LabeledField label="Due Date *"><input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} required className="w-full px-4 py-2 border rounded-xl text-sm"/></LabeledField>
        </div>

        {activeCorporatePlan && <PlanBanner plan={activeCorporatePlan} savings={planDiscountResult.totalDiscount} />}

        {formData.patientName && (() => {
          const p = patients.find(p => p.name === formData.patientName);
          if (['family', 'staff', 'complimentary'].includes(p?.category)) return (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600"><User className="w-5 h-5" /></div>
                <div><p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{p.category} Patient Detected</p><p className="text-xs font-bold text-amber-900 mt-0.5">Special benefits available for this patient.</p></div>
              </div>
              <Button size="sm" onClick={() => {
                const disc = p.defaultDiscount !== undefined ? p.defaultDiscount : 100;
                setFormData(prev => ({ ...prev, isComplimentary: disc === 100, discount: disc, complimentaryNote: disc === 100 ? `Waived - ${p.category.toUpperCase()} Benefit` : prev.complimentaryNote }));
              }} className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap">Apply {p.defaultDiscount || 100}% Discount</Button>
            </div>
          );
        })()}

        <PendingItems pendingItems={pendingItems} linkedItemIds={formData.linkedItemIds} onAdd={addPendingItem} onRemove={removePendingItem} />

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Stethoscope className="w-4 h-4 text-primary" /> Billable Items</h3>
            <Button size="sm" variant="outline" onClick={() => setItems([...items, { id: Date.now().toString(), description: "", quantity: 1, rate: 0, amount: 0 }])} className="h-8 text-xs gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Item</Button>
          </div>
          <div className="space-y-3">
            {items.map(item => <InvoiceItemRow key={item.id} item={item} commonServices={commonServices} onUpdate={updateItem} onRemove={(id) => {
              const lid = (items.find(i => i.id === id) as any)?.linkedId;
              if (lid) setFormData(prev => ({ ...prev, linkedItemIds: prev.linkedItemIds.filter(i => i !== lid) }));
              setItems(items.filter(i => i.id !== id));
            }} />)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
          <Card className="border-border/50 shadow-none bg-muted/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className={`w-4 h-4 ${formData.isComplimentary ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Complimentary Bill</span>
                </div>
                <input type="checkbox" checked={formData.isComplimentary} onChange={e => setFormData(prev => ({ ...prev, isComplimentary: e.target.checked, discount: e.target.checked ? 100 : 0, tax: e.target.checked ? 0 : 18 }))} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              </div>
              {formData.isComplimentary && <input type="text" placeholder="Complimentary Reason..." value={formData.complimentaryNote} onChange={e => setFormData(prev => ({ ...prev, complimentaryNote: e.target.value }))} className="w-full px-3 py-2 bg-card border rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none" />}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <LabeledField label="Discount %"><input type="number" value={formData.isComplimentary ? 100 : formData.discount} disabled={formData.isComplimentary} onChange={e => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-xl text-sm font-bold disabled:bg-muted/50"/></LabeledField>
                  <LabeledField label="Tax %"><input type="number" value={formData.isComplimentary ? 0 : formData.tax} disabled={formData.isComplimentary} onChange={e => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-xl text-sm font-bold disabled:bg-muted/50"/></LabeledField>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/30 rounded-2xl p-4 border border-border/50 space-y-2">
            <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase px-1"><span>Summary</span><span>Amount</span></div>
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-bold">₹{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm text-destructive"><span>Discount ({formData.isComplimentary ? 100 : formData.discount}%)</span><span className="font-bold">-₹{manualDiscount.toLocaleString()}</span></div>
              {planDiscountResult.totalDiscount > 0 && <div className="flex justify-between text-sm text-primary"><span>Corporate Benefits</span><span className="font-bold">-₹{planDiscountResult.totalDiscount.toLocaleString()}</span></div>}
              <div className="flex justify-between text-sm text-muted-foreground"><span>GST ({formData.isComplimentary ? 0 : formData.tax}%)</span><span className="font-bold">₹{taxAmount.toLocaleString()}</span></div>
              <div className="pt-3 border-t border-dashed border-border flex justify-between items-center"><span className="text-sm font-black uppercase tracking-wider">Final Total</span><span className="text-2xl font-black text-primary">₹{(formData.isComplimentary ? 0 : total).toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
