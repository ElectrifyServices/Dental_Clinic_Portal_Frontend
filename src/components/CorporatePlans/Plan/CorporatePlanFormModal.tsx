import { Input } from "@/components/ui/Input";
import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, CheckCircle, Users, Banknote, Award, User, Settings2 } from 'lucide-react';
import { CorporatePlan, PlanBenefit, CorporatePlanTier } from '../../../types';
import { TREATMENT_LABELS, PLAN_COLORS } from '../../../utils/corporatePlan';
import { Modal, Button, LabeledField, SectionRenderer, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label, Loading, Textarea } from '../../ui';
import { mkForm, mkBenefit, autoDesc } from './constants';
import { useFormConfig } from '../../../hooks/useFormConfig';
import { useCreateCorporatePlanMutation } from '../../../hooks/corporate/useCreateCorporatePlanMutation';
import { useUpdateCorporatePlanMutation } from '../../../hooks/corporate/useUpdateCorporatePlanMutation';
import { useModal } from '../../../contexts/ModalContext';
import { useCorporatePlanQuery } from '../../../hooks/corporate/useCorporatePlanQuery';
import { mapProcedureLabelToKey } from '@/constants/consent.constants';

// ── Tier config ───────────────────────────────────────────────────────────────
const CORPORATE_TIERS: { value: CorporatePlanTier; label: string; activeClass: string }[] = [
  { value: 'platinum', label: 'Platinum', activeClass: 'border-violet-500 bg-violet-50 text-violet-700 hover:bg-violet-50 hover:text-violet-700' },
  { value: 'gold', label: 'Gold', activeClass: 'border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-50 hover:text-amber-700' },
  { value: 'silver', label: 'Silver', activeClass: 'border-slate-400 bg-slate-50 text-slate-600 hover:bg-slate-50 hover:text-slate-600' },
];
const INDIVIDUAL_TIERS: { value: CorporatePlanTier; label: string; pax: number; activeClass: string }[] = [
  { value: 'premium', label: 'Premium', pax: 5, activeClass: 'border-indigo-500 bg-indigo-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700' },
  { value: 'standard', label: 'Standard', pax: 2, activeClass: 'border-sky-500 bg-sky-50 text-sky-700 hover:bg-sky-50 hover:text-sky-700' },
  { value: 'basic', label: 'Basic', pax: 0, activeClass: 'border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700' },
];

// ── Family coverage presets ───────────────────────────────────────────────────
type CoveragePreset = 'self' | '2' | '5' | 'custom';
const COVERAGE_PRESETS: { key: CoveragePreset; label: string; sub: string; pax: number | null }[] = [
  { key: 'self', label: 'Self Only', sub: 'Single person', pax: 0 },
  { key: '2', label: 'Up to 2 Family Members', sub: 'Member + 2', pax: 2 },
  { key: '5', label: 'Up to 5 Family Members', sub: 'Member + 5', pax: 5 },
  { key: 'custom', label: 'Custom', sub: 'Set your own number', pax: null },
];

function getCoveragePreset(maxDependents: number): CoveragePreset {
  if (maxDependents === 0) return 'self';
  if (maxDependents === 2) return '2';
  if (maxDependents === 5) return '5';
  return 'custom';
}

function parseBackendError(err: any, fallback = "An error occurred"): string {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  const desc = data.responseStatusList?.statusList?.[0]?.statusDesc || data.statusDesc;
  if (desc) return desc;
  const msg = data.message || data.error;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string") return msg;
  return typeof data === "object" ? JSON.stringify(data) : String(data);
}

interface CorporatePlanFormModalProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  editing: CorporatePlan | null;
  onSave: (plan: CorporatePlan) => void;
}

export function CorporatePlanFormModal({ showForm, setShowForm, editing, onSave }: CorporatePlanFormModalProps) {
  const [form, setForm] = useState(mkForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coveragePreset, setCoveragePreset] = useState<CoveragePreset>('self');

  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const cfg = useFormConfig('corporate');
  const cfgAny = cfg as any;
  const { showToast } = useModal();

  const createPlanMutation = useCreateCorporatePlanMutation();
  const updatePlanMutation = useUpdateCorporatePlanMutation();

  const { data: planDetails, isLoading: isFetching } = useCorporatePlanQuery(editing?.id || undefined, {
    enabled: showForm && !!editing?.id,
  });

  const [expandedBenefits, setExpandedBenefits] = useState<Record<number, boolean>>({ 0: true });

  const toggleBenefit = (idx: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedBenefits(prev => ({ ...prev, [idx]: prev[idx] === false ? true : false }));
  };

  const BENEFIT_LABELS: Record<string, string> = Object.fromEntries(
    (cfgAny.benefitTypes ?? []).map((b: any) => [b.value, b.label])
  );
  const planColorDots: Record<string, string> = Object.fromEntries(
    (cfgAny.planColors ?? []).map((c: any) => [c.value, c.dot])
  );

  const coreIdentitySection = cfg.sections?.find(s => s.id === 'coreIdentity');

  useEffect(() => {
    if (!showForm) return;

    if (editing) {
      if (planDetails) {
        const planData = planDetails.data || planDetails;

        const mapHexToColor = (hex: string): string => {
          const colorMap: Record<string, string> = {
            "#3B82F6": "blue", "#8B5CF6": "violet", "#10B981": "emerald",
            "#F43F5E": "rose", "#F59E0B": "amber", "#06B6D4": "cyan",
            "#6366F1": "indigo", "#14B8A6": "teal",
          };
          return colorMap[hex?.toUpperCase()] || "blue";
        };

        const mapBackendBenefitType = (t: string): string => ({
          FLAT_DISCOUNT: "flat_discount", TREATMENT_DISCOUNT: "treatment_discount",
          FREE_CONSULTATION: "free_consultations", FREE_TREATMENT_SERVICE: "free_treatments",
          CAPPED_DISCOUNT: "capped_discount",
          UNLIMITED_CONSULTATION: "unlimited_consultations", COMPLIMENTARY_SESSION: "complimentary_session",
          PRIORITY_SCHEDULING: "priority_scheduling", FLUORIDE_APPLICATION: "fluoride_application",
          CUSTOM: "custom",
        }[t] || "custom");

        const benefits = (planData.benefits || []).map((b: any) => {
          let customTreatmentText = "";
          const standardKeys = [
            'consultation', 'follow-up', 'xray-review', 'cleaning', 'emergency',
            'filling', 'root-canal', 'extraction', 'orthodontics', 'implants',
            'full-mouth-rehab', 'veneers-cosmetic', 'child-dentistry', 'crown',
            'denture', 'toothache', 'swelling-infection', 'broken-tooth', 'trauma-injury'
          ];
          const treatmentTypes = (b.clinical_procedures || []).map((proc: string) => {
            const key = mapProcedureLabelToKey(proc);
            if (!standardKeys.includes(key)) {
              customTreatmentText = proc;
              return 'other';
            }
            return key;
          });

          return {
            id: b.id || Date.now().toString() + Math.random().toString(),
            type: mapBackendBenefitType(b.type),
            value: b.discount_percentage || b.allocationCount || 0,
            cap: b.max_amount || undefined,
            customName: b.benifit_label || undefined,
            treatmentTypes,
            customTreatmentText,
            description: b.description || "",
          };
        });

        const resolvedCategory = (planData.plan_type?.toLowerCase() === 'company' ? 'corporate' : planData.plan_type?.toLowerCase() === 'individual' ? 'individual' : planData.plan_category?.toLowerCase() || editing.planCategory || 'corporate') as any;
        const resolvedMaxDep = planData.family_coverage_limit ?? planData.max_dependents ?? editing.maxDependents ?? 0;
        setCoveragePreset(getCoveragePreset(resolvedMaxDep));

        setForm({
          name: planData.plan_name || editing.name,
          companyName: planData.company_name || editing.companyName,
          code: planData.plan_code || editing.code,
          description: planData.description || editing.description,
          benefits: benefits.length > 0 ? benefits : editing.benefits,
          validFrom: planData.valid_from ? planData.valid_from.split('T')[0] : editing.validFrom,
          validTo: planData.valid_till ? planData.valid_till.split('T')[0] : editing.validTo,
          maxMembers: planData.max_member || planData.enrollment_cap || editing.maxMembers,
          isActive: planData.status === "ACTIVE",
          color: planData.theme_color ? mapHexToColor(planData.theme_color) as any : editing.color,
          planCategory: resolvedCategory,
          planTier: (planData.plan_tier?.toLowerCase() || editing.planTier) as CorporatePlanTier | undefined,
          annualFee: planData.annual_fee ?? editing.annualFee,
          maxDependents: resolvedMaxDep,
        });
      } else {
        const dep = editing.maxDependents ?? 0;
        setCoveragePreset(getCoveragePreset(dep));
        setForm({
          name: editing.name,
          companyName: editing.companyName,
          code: editing.code,
          description: editing.description,
          benefits: editing.benefits,
          validFrom: editing.validFrom,
          validTo: editing.validTo,
          maxMembers: editing.maxMembers,
          isActive: editing.isActive,
          color: editing.color,
          planCategory: editing.planCategory || 'corporate',
          planTier: editing.planTier,
          annualFee: editing.annualFee,
          maxDependents: dep,
        });
      }
    } else {
      setForm(mkForm());
      setCoveragePreset('self');
    }
    setErrors({});
  }, [showForm, editing, planDetails]);

  const handleFormChange = (name: string, value: any) => {
    setForm(prev => {
      if (name === 'code') return { ...prev, code: String(value).toUpperCase() };
      if (name === 'maxMembers') return { ...prev, maxMembers: value ? parseInt(value) : undefined };
      return { ...prev, [name]: value };
    });
  };

  const setCoverage = (preset: CoveragePreset) => {
    setCoveragePreset(preset);
    if (preset !== 'custom') {
      const pax = COVERAGE_PRESETS.find(p => p.key === preset)?.pax ?? 0;
      setForm(prev => ({ ...prev, maxDependents: pax ?? 0 }));
    }
  };

  const updateBenefit = (idx: number, field: keyof PlanBenefit, val: any) => {
    const updated = form.benefits.map((b, i) => {
      if (i !== idx) return b;
      const nb = { ...b, [field]: val } as PlanBenefit;
      if (field !== 'description') nb.description = autoDesc(nb);
      return nb;
    });
    setForm({ ...form, benefits: updated });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.planCategory) e.planCategory = 'Required';
    if (!form.name.trim()) e.name = 'Required';
    if (form.planCategory === 'corporate' && !form.companyName.trim()) e.companyName = 'Required';
    if (!form.code.trim()) e.code = 'Required';
    if (!form.validFrom) e.validFrom = 'Required';
    if (!form.validTo || form.validTo < form.validFrom) e.validTo = 'Must be after start date';
    if (form.maxMembers === undefined || form.maxMembers === null || isNaN(form.maxMembers)) {
      e.maxMembers = 'Required';
    } else if (form.maxMembers <= 0) {
      e.maxMembers = 'Must be greater than 0';
    }
    if (!form.benefits.length) e.benefits = 'Add at least one benefit';
    form.benefits.forEach((b, i) => { if (!b.description.trim()) e[`b_${i}`] = 'Required'; });
    setErrors(e);
    return !Object.keys(e).length;
  };

  const mapColorToHex = (c: string): string => ({
    blue: "#3B82F6", violet: "#8B5CF6", emerald: "#10B981", rose: "#F43F5E",
    amber: "#F59E0B", cyan: "#06B6D4", indigo: "#6366F1", teal: "#14B8A6",
  }[c] || "#4F46E5");

  const mapBenefitType = (t: string): string => ({
    flat_discount: "FLAT_DISCOUNT", treatment_discount: "TREATMENT_DISCOUNT",
    free_consultations: "FREE_CONSULTATION", free_treatments: "FREE_TREATMENT_SERVICE",
    capped_discount: "CAPPED_DISCOUNT",
    unlimited_consultations: "UNLIMITED_CONSULTATION", complimentary_session: "COMPLIMENTARY_SESSION",
    priority_scheduling: "PRIORITY_SCHEDULING", fluoride_application: "FLUORIDE_APPLICATION",
    custom: "CUSTOM",
  }[t] || "CUSTOM");

  const buildBenefitsPayload = (benefits: typeof form.benefits) =>
    benefits.map(b => {
      const isFree = ["free_consultations", "free_treatments", "unlimited_consultations", "complimentary_session"].includes(b.type);
      const isFlagOnly = ["priority_scheduling", "fluoride_application"].includes(b.type);
      let clinical_procedures: string[] = [];
      if (b.type === "free_consultations" || b.type === "unlimited_consultations") clinical_procedures = ["Consultation"];
      else if (b.type === "fluoride_application") clinical_procedures = ["Fluoride Application"];
      else if (Array.isArray(b.treatmentTypes)) {
        clinical_procedures = b.treatmentTypes.map(t => {
          if (t === 'other' && b.customTreatmentText) return b.customTreatmentText;
          return TREATMENT_LABELS[t] || t;
        });
      }
      return {
        type: mapBenefitType(b.type),
        allocationCount: isFlagOnly ? 0 : b.type === 'unlimited_consultations' ? -1 : (isFree ? b.value : 0),
        clinical_procedures,
        description: b.description || "",
        benifit_label: b.customName || b.description || "Benefit",
        discount_percentage: isFlagOnly ? 0 : (!isFree ? b.value : 0),
        max_amount: b.cap || 0,
      };
    });

  const handleSave = async () => {
    if (!validate()) return;

    const basePayload = {
      plan_name: form.name,
      company_name: form.planCategory === 'individual' ? 'Individual' : form.companyName,
      plan_code: form.code,
      description: form.description || "",
      valid_till: new Date(form.validTo).toISOString(),
      max_member: form.maxMembers || 0,
      theme_color: mapColorToHex(form.color),
      benefits: buildBenefitsPayload(form.benefits),
      plan_type: (form.planCategory?.toUpperCase() === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'COMPANY') as 'COMPANY' | 'INDIVIDUAL',
      plan_tier: form.planTier?.toUpperCase() || undefined,
      annual_fee: form.annualFee || 0,
      family_coverage_limit: form.maxDependents || 0,
    };

    if (!editing) {
      try {
        const validFromObj = new Date(form.validFrom);
        const todayObj = new Date();
        let submitValidFrom = validFromObj.toISOString();
        if (form.validFrom === todayObj.toISOString().split('T')[0]) {
          todayObj.setMinutes(todayObj.getMinutes() + 2);
          submitValidFrom = todayObj.toISOString();
        }
        const apiResponse = await createPlanMutation.mutateAsync({ ...basePayload, valid_from: submitValidFrom });
        const plan: CorporatePlan = {
          ...form, id: apiResponse?.id || `CORP-${Date.now()}`,
          currentMembers: 0, createdAt: new Date().toISOString(), createdBy: 'Admin',
          planCategory: form.planCategory || 'corporate', planTier: form.planTier,
          annualFee: form.annualFee, maxDependents: form.maxDependents || 0,
        };
        onSave(plan);
        showToast('Membership plan created');
        setShowForm(false);
      } catch (err: any) {
        const msg = parseBackendError(err, "Failed to create plan").replace(/enrollment_cap/gi, "Max Members");
        setErrors(prev => ({ ...prev, submit: msg }));
      }
    } else {
      try {
        await updatePlanMutation.mutateAsync({
          id: editing.id, ...basePayload,
          valid_from: new Date(form.validFrom).toISOString(),
        });
        onSave({ ...editing, ...form });
        showToast('Plan updated');
        setShowForm(false);
      } catch (err: any) {
        const msg = parseBackendError(err, "Failed to update plan").replace(/enrollment_cap/gi, "Max Members");
        setErrors(prev => ({ ...prev, submit: msg }));
      }
    }
  };

  if (!showForm) return null;

  const isSaving = createPlanMutation.isPending || updatePlanMutation.isPending;

  return (
    <Modal
      title={editing ? 'Edit Membership Plan' : 'Create Membership Plan'}
      subtitle={editing ? `Editing "${form.name}"` : 'Set up a new membership plan for your clinic'}
      onClose={() => setShowForm(false)}
      size="5xl"
      icon={<Award className="w-4 h-4" />}
      footer={
        <div className="flex flex-col gap-3 w-full">
          {errors.submit && (
            <p className="text-destructive text-xs font-semibold px-4 py-2.5 bg-destructive/5 rounded-xl border border-destructive/20">
              {errors.submit}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} className="gap-2" disabled={isSaving}>
              {isSaving
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><CheckCircle className="w-4 h-4" /> {editing ? 'Save Changes' : 'Create Plan'}</>
              }
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-8 py-1 relative min-h-[200px]">
        {isFetching && (
          <Loading type="spinner" text="Loading plan details..." className="absolute inset-0 bg-background/70 backdrop-blur-[2px] z-50 rounded-2xl" />
        )}

        {/* ── SECTION A: Basic Information ─────────────────────────────────── */}
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center">A</span>
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Basic Information</h3>
          </div>

          {/* Plan Name + Code */}
          <div className="grid grid-cols-2 gap-4">
            <LabeledField label={<span>Plan Name <span className="text-destructive font-bold">*</span></span>} error={errors.name}>
              <Input
                value={form.name}
                onChange={e => handleFormChange('name', e.target.value)}
                placeholder="e.g. Gold Family Plan"
                className="rounded-xl"
              />
            </LabeledField>
            <LabeledField label={<span>Plan Code <span className="text-destructive font-bold">*</span></span>} error={errors.code}>
              <Input
                value={form.code}
                onChange={e => handleFormChange('code', e.target.value)}
                placeholder="e.g. GOLD-2024"
                className="rounded-xl font-mono"
              />
            </LabeledField>
          </div>

          {/* Plan Category */}
          <LabeledField label={<span>Plan Type <span className="text-destructive font-bold">*</span></span>} error={errors.planCategory}>
            <div className="flex gap-3 pt-1">
              {(['corporate', 'individual'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm(prev => ({
                    ...prev,
                    planCategory: cat,
                    planTier: undefined,
                    companyName: cat === 'individual' ? 'Individual' : (prev.companyName === 'Individual' ? '' : prev.companyName),
                    maxDependents: cat === 'individual' ? 0 : prev.maxDependents,
                  }))}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border-2 text-sm font-bold transition-all ${form.planCategory === cat
                      ? cat === 'corporate'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                >
                  {cat === 'corporate' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  {cat === 'corporate' ? 'Company Membership' : 'Personal Membership'}
                </button>
              ))}
            </div>
          </LabeledField>

          {/* Plan Tier */}
          {form.planCategory && (
            <LabeledField label={<span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Tier {form.planCategory === 'individual' ? '(sets family member limit)' : '(optional)'}</span>}>
              <div className="flex gap-2 flex-wrap pt-1">
                {(form.planCategory === 'individual' ? INDIVIDUAL_TIERS : CORPORATE_TIERS).map(tier => (
                  <button
                    key={tier.value}
                    type="button"
                    onClick={() => {
                      const updates: any = { planTier: tier.value };
                      if (form.planCategory === 'individual') {
                        updates.maxDependents = (tier as any).pax;
                        setCoveragePreset(getCoveragePreset((tier as any).pax));
                      }
                      setForm(prev => ({ ...prev, ...updates }));
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${form.planTier === tier.value ? tier.activeClass : 'border-border text-muted-foreground hover:border-primary/40'
                      }`}
                  >
                    {tier.label}
                    {form.planCategory === 'individual' && (
                      <span className="text-[10px] opacity-60">
                        {(tier as any).pax === 0 ? 'Self only' : `+${(tier as any).pax} pax`}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </LabeledField>
          )}

          {/* Company Name (corporate only) */}
          {form.planCategory === 'corporate' && (
            <LabeledField label={<span>Company Name <span className="text-destructive font-bold">*</span></span>} error={errors.companyName}>
              <Input
                value={form.companyName}
                onChange={e => handleFormChange('companyName', e.target.value)}
                placeholder="e.g. Tech Corp Pvt Ltd"
                className="rounded-xl"
              />
            </LabeledField>
          )}

          {/* Dates + Max Members */}
          <div className="grid grid-cols-3 gap-4">
            <LabeledField label={<span>Start Date <span className="text-destructive font-bold">*</span></span>} error={errors.validFrom}>
              <Input 
                type="date" 
                min={!editing ? localToday : undefined}
                value={form.validFrom} 
                onChange={e => handleFormChange('validFrom', e.target.value)} 
                className="rounded-xl relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
              />
            </LabeledField>
            <LabeledField label={<span>End Date <span className="text-destructive font-bold">*</span></span>} error={errors.validTo}>
              <Input 
                type="date" 
                min={!editing ? localToday : undefined}
                value={form.validTo} 
                onChange={e => handleFormChange('validTo', e.target.value)} 
                className="rounded-xl relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
              />
            </LabeledField>
            <LabeledField label={<span>Max Members <span className="text-destructive font-bold">*</span></span>} error={errors.maxMembers}>
              <Input
                type="number" min="1"
                value={form.maxMembers ?? ''}
                onFocus={e => e.target.select()}
                onChange={e => {
                  let valStr = e.target.value;
                  if (/^0+[1-9]/.test(valStr)) {
                    valStr = valStr.replace(/^0+/, '');
                  } else if (/^0{2,}/.test(valStr)) {
                    valStr = '0';
                  }
                  e.target.value = valStr;
                  handleFormChange('maxMembers', valStr);
                }}
                placeholder="e.g. 100"
                className="rounded-xl"
              />
            </LabeledField>
          </div>

          {/* Annual Fee */}
          <LabeledField label="Annual Fee (₹)">
            <div className="relative">
              <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number" min="0"
                value={form.annualFee ?? ''}
                onFocus={e => e.target.select()}
                onChange={e => {
                  let valStr = e.target.value;
                  if (/^0+[1-9]/.test(valStr)) {
                    valStr = valStr.replace(/^0+/, '');
                  } else if (/^0{2,}/.test(valStr)) {
                    valStr = '0';
                  }
                  e.target.value = valStr;
                  setForm(prev => ({ ...prev, annualFee: parseFloat(valStr) || 0 }));
                }}
                placeholder="e.g. 2000"
                className="pl-10 rounded-xl"
              />
            </div>
          </LabeledField>

          {/* Description */}
          <LabeledField label="Description">
            <Textarea
              value={form.description}
              onChange={e => handleFormChange('description', e.target.value)}
              placeholder="What does this membership plan include?"
              rows={2}
              className="w-full rounded-xl resize-none"
            />
          </LabeledField>

          {/* Color Theme */}
          <LabeledField label="Color Theme">
            <div className="flex gap-2 flex-wrap pt-1">
              {PLAN_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c as any })}
                  className={`w-8 h-8 rounded-xl transition-all shadow-sm ${planColorDots[c] ?? 'bg-gray-400'} ${form.color === c ? 'ring-2 ring-offset-3 ring-primary scale-110' : 'opacity-40 hover:opacity-80'
                    }`}
                />
              ))}
            </div>
          </LabeledField>
        </section>

        <div className="h-px bg-border/60" />

        {/* ── SECTION B: Family Coverage ────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center">B</span>
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Family Coverage</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {COVERAGE_PRESETS.map(preset => (
              <button
                key={preset.key}
                type="button"
                onClick={() => setCoverage(preset.key)}
                className={`flex flex-col items-start gap-1 p-4 rounded-2xl border-2 text-left transition-all ${coveragePreset === preset.key
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
              >
                <Users className={`w-4 h-4 ${coveragePreset === preset.key ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-xs font-bold">{preset.label}</span>
                <span className="text-[10px] opacity-60">{preset.sub}</span>
              </button>
            ))}
          </div>

          {/* Custom number input */}
          {coveragePreset === 'custom' && (
            <LabeledField label="Custom number of family members allowed (per member)">
              <div className="relative w-48">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number" min="0" max="20"
                  value={form.maxDependents ?? 0}
                  onChange={e => setForm(prev => ({ ...prev, maxDependents: parseInt(e.target.value) || 0 }))}
                  className="pl-10 rounded-xl w-full"
                />
              </div>
            </LabeledField>
          )}
        </section>

        <div className="h-px bg-border/60" />

        {/* ── SECTION C: Benefits ──────────────────────────────────────────── */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center">C</span>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Benefits</h3>
            </div>
            <Button
              variant="outline" size="sm"
              onClick={() => {
                const newIdx = form.benefits.length;
                setForm({ ...form, benefits: [...form.benefits, mkBenefit()] });
                setExpandedBenefits(prev => ({ ...prev, [newIdx]: true }));
              }}
              className="gap-1.5 h-8"
            >
              <Plus className="w-3.5 h-3.5" /> Add Benefit
            </Button>
          </div>

          {errors.benefits && (
            <p className="text-destructive text-[11px] font-bold px-3 py-2 bg-destructive/5 rounded-xl border border-destructive/20">
              {errors.benefits}
            </p>
          )}

          <div className="space-y-4">
            {form.benefits.map((b, idx) => {
              const isExpanded = expandedBenefits[idx] !== false;
              return (
              <div key={b.id} className="relative border border-border rounded-2xl p-6 bg-muted/10 hover:bg-muted/20 transition-all">
                <div 
                  className="absolute -top-2.5 left-5 px-3 py-0.5 bg-card border border-border rounded-full text-[9px] font-black text-primary uppercase tracking-widest cursor-pointer select-none"
                  onClick={(e) => toggleBenefit(idx, e)}
                >
                  Benefit {idx + 1} {isExpanded ? '▼' : '▶'}
                </div>

                {form.benefits.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm({ ...form, benefits: form.benefits.filter((_, i) => i !== idx) });
                    }}
                    className="absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                
                {/* Accordion Toggle Header for the whole block when collapsed */}
                {!isExpanded && (
                  <div className="cursor-pointer select-none text-sm font-semibold text-muted-foreground pt-2" onClick={(e) => toggleBenefit(idx, e)}>
                    {b.type === 'custom' ? b.customName || 'Custom Benefit' : BENEFIT_LABELS[b.type] || 'Benefit Details'}
                    {b.value ? ` - ${b.value}` : ''}
                  </div>
                )}

                {isExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                    {/* Benefit type */}
                    <div className="md:col-span-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Benefit Type</Label>
                      <Select value={b.type} onValueChange={val => updateBenefit(idx, 'type', val)}>
                        <SelectTrigger className="w-full rounded-xl text-sm">
                          <SelectValue placeholder="Choose benefit type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(BENEFIT_LABELS).map(([v, l]) => (
                            <SelectItem key={v} value={v}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Value / Count */}
                    {b.type === 'custom' ? (
                      <LabeledField label="Benefit Name">
                        <Input
                          value={b.customName || ''}
                          onChange={e => updateBenefit(idx, 'customName', e.target.value)}
                          placeholder="e.g. Lab Charges"
                          className="rounded-xl"
                        />
                      </LabeledField>
                    ) : ['priority_scheduling', 'unlimited_consultations', 'fluoride_application'].includes(b.type) ? null : (
                      <LabeledField label={['free_consultations', 'free_treatments', 'complimentary_session'].includes(b.type) ? 'Number of Sessions' : 'Discount %'}>
                        <Input
                          type="number" min="0"
                          max={b.type.includes('discount') ? 100 : 999}
                          value={b.value || ''}
                          onFocus={e => e.target.select()}
                          onChange={e => {
                            let valStr = e.target.value;
                            if (/^0+[1-9]/.test(valStr)) {
                              valStr = valStr.replace(/^0+/, '');
                            } else if (/^0{2,}/.test(valStr)) {
                              valStr = '0';
                            }
                            e.target.value = valStr;
                            updateBenefit(idx, 'value', parseFloat(valStr) || 0);
                          }}
                          className="rounded-xl font-bold"
                        />
                      </LabeledField>
                    )}

                    {b.type === 'custom' && (
                      <LabeledField label="Discount %">
                        <Input
                          type="number" min="0" max={100} value={b.value || ''}
                          onFocus={e => e.target.select()}
                          onChange={e => {
                            let valStr = e.target.value;
                            if (/^0+[1-9]/.test(valStr)) {
                              valStr = valStr.replace(/^0+/, '');
                            } else if (/^0{2,}/.test(valStr)) {
                              valStr = '0';
                            }
                            e.target.value = valStr;
                            updateBenefit(idx, 'value', parseFloat(valStr) || 0);
                          }}
                          className="rounded-xl font-bold"
                        />
                      </LabeledField>
                    )}

                    {b.type === 'capped_discount' && (
                      <LabeledField label="Maximum Amount (₹)">
                        <Input
                          type="number" min="0" value={b.cap || ''}
                          onFocus={e => e.target.select()}
                          onChange={e => {
                            let valStr = e.target.value;
                            if (/^0+[1-9]/.test(valStr)) {
                              valStr = valStr.replace(/^0+/, '');
                            } else if (/^0{2,}/.test(valStr)) {
                              valStr = '0';
                            }
                            e.target.value = valStr;
                            updateBenefit(idx, 'cap', parseFloat(valStr) || 0);
                          }}
                          className="rounded-xl"
                        />
                      </LabeledField>
                    )}

                    {/* Applicable treatments */}
                    {(b.type === 'treatment_discount' || b.type === 'free_treatments' || b.type === 'complimentary_session') && (
                      <div className="md:col-span-3">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Applicable Treatments</Label>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(TREATMENT_LABELS).map(([key, label]) => (
                            <label
                              key={key}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-all select-none text-xs font-bold ${b.treatmentTypes?.includes(key)
                                  ? 'bg-primary/10 border-primary text-primary'
                                  : 'bg-background border-border text-muted-foreground hover:border-primary/40'
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={b.treatmentTypes?.includes(key) ?? false}
                                className="sr-only"
                                onChange={e => {
                                  const curr = b.treatmentTypes || [];
                                  updateBenefit(idx, 'treatmentTypes', e.target.checked ? [...curr, key] : curr.filter(t => t !== key));
                                }}
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                        {b.treatmentTypes?.includes('other') && (
                          <div className="mt-3 max-w-md">
                            <LabeledField label="Specify Custom Treatment Name">
                              <Input
                                value={b.customTreatmentText || ''}
                                onChange={e => updateBenefit(idx, 'customTreatmentText', e.target.value)}
                                placeholder="e.g. Tooth Whitening"
                                className="rounded-xl font-bold bg-white"
                              />
                            </LabeledField>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    <div className="md:col-span-3">
                      <LabeledField label="Benefit Description (shown to patients)" error={errors[`b_${idx}`]}>
                        <Textarea
                          value={b.description}
                          onChange={e => updateBenefit(idx, 'description', e.target.value)}
                          placeholder="e.g. 20% off on all treatments"
                          className="rounded-xl bg-muted/30 min-h-[80px]"
                        />
                      </LabeledField>
                    </div>
                  </div>
                )}
              </div>
            )})}
          </div>
        </section>
      </div>
    </Modal>
  );
}
