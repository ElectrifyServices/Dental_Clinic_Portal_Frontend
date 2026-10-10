import type { ApiAny } from "../../../types/api";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { CountryCodeSelect } from "@/components/ui/CountryCodeSelect";
import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, CheckCircle, Users, Banknote, Award, User } from 'lucide-react';
import { CorporatePlan, PlanBenefit, CorporatePlanTier } from '../../../types';
import { TREATMENT_LABELS, PLAN_COLORS } from '../../../utils/corporatePlan';
import { Modal, Button, LabeledField, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label, Loading, Textarea } from '../../ui';
import { mkForm, mkBenefit, autoDesc } from './constants';
import { useFormConfig } from '../../../hooks/useFormConfig';
import { useCreateCorporatePlanMutation } from '../../../hooks/corporate/useCreateCorporatePlanMutation';
import { useUpdateCorporatePlanMutation } from '../../../hooks/corporate/useUpdateCorporatePlanMutation';
import { useModal } from '../../../contexts/ModalContext';
import { useCorporatePlanQuery } from '../../../hooks/corporate/useCorporatePlanQuery';
import { mapProcedureLabelToKey } from '@/constants/consent.constants';
import { sanitizeNumericString } from '@/utils/inputUtils';
import { usePhoneValidation } from '@/hooks/usePhoneValidation';
import { getPhonePlaceholder } from '@/utils/phoneUtils';

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

function parseBackendError(err: ApiAny, fallback = "An error occurred"): string {
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

  const { phoneError, handlePhoneChange: handleCorporatePhoneChange, validateOnSubmit: validatePhone, maxLength, countryIso, clearPhoneError } = usePhoneValidation({
    dialingCode: form.contactCountryCode || "+91",
    onPhoneChange: (sanitized) => {
      setForm(prev => ({ ...prev, contactPhone: sanitized }));
    },
  });

  const phonePlaceholder = getPhonePlaceholder(countryIso);

  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const cfg = useFormConfig('corporate');
  const cfgAny = cfg as ApiAny;
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
    (cfgAny.benefitTypes ?? []).map((b: ApiAny) => [b.value, b.label])
  );
  const planColorDots: Record<string, string> = Object.fromEntries(
    (cfgAny.planColors ?? []).map((c: ApiAny) => [c.value, c.dot])
  );

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

        const benefits = (planData.benefits || []).map((b: ApiAny) => {
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

        const resolvedCategory = (planData.plan_type?.toLowerCase() === 'company' ? 'corporate' : planData.plan_type?.toLowerCase() === 'individual' ? 'individual' : planData.plan_category?.toLowerCase() || editing.planCategory || 'corporate') as ApiAny;
        const resolvedMaxDep = planData.family_coverage_limit ?? planData.max_dependents ?? editing.maxDependents ?? 0;
        setCoveragePreset(getCoveragePreset(resolvedMaxDep));

        setForm({
          name: planData.plan_name || editing.name,
          companyName: planData.company_name || editing.companyName,
          code: planData.plan_code || editing.code,
          contactName: planData.contact_name || (editing as ApiAny).contactName || '',
          contactPhone: planData.contact_phone || (editing as ApiAny).contactPhone || '',
          contactEmail: planData.contact_email || (editing as ApiAny).contactEmail || '',
          contactCountryCode: planData.contact_country_code || (editing as ApiAny).contactCountryCode || '+91',
          description: planData.description || editing.description,
          benefits: benefits.length > 0 ? benefits : editing.benefits,
          validFrom: planData.valid_from ? planData.valid_from.split('T')[0] : editing.validFrom,
          validTo: planData.valid_till ? planData.valid_till.split('T')[0] : editing.validTo,
          maxMembers: planData.max_member || planData.enrollment_cap || editing.maxMembers,
          isActive: planData.status === "ACTIVE",
          color: planData.theme_color ? mapHexToColor(planData.theme_color) as ApiAny : editing.color,
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
          contactName: (editing as ApiAny).contactName || '',
          contactPhone: (editing as ApiAny).contactPhone || '',
          contactEmail: (editing as ApiAny).contactEmail || '',
          contactCountryCode: (editing as ApiAny).contactCountryCode || '+91',
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

  const handleFormChange = (name: string, value: ApiAny) => {
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

  const updateBenefit = (idx: number, field: keyof PlanBenefit, val: ApiAny) => {
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
    if (form.planCategory === 'corporate') {
      if (!form.companyName.trim()) e.companyName = 'Required';
      if (!form.contactName.trim()) e.contactName = 'Required';
      
      if (!form.contactPhone.trim()) {
        e.contactPhone = 'Required';
      } else if (!validatePhone(form.contactPhone)) {
        e.contactPhone = 'Invalid phone number';
      }

      if (!form.contactEmail.trim()) {
        e.contactEmail = 'Required';
      } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.contactEmail)) {
        e.contactEmail = 'Invalid email address';
      }
    }
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
      contact_name: form.contactName,
      contact_phone: form.contactPhone,
      contact_email: form.contactEmail.toLowerCase(),
      contact_country_code: form.contactCountryCode,
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
      } catch (err: ApiAny) {
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
      } catch (err: ApiAny) {
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
      bodyClassName="p-4 sm:p-5"
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
      <div className="space-y-4 py-0.5 relative min-h-50">
        {isFetching && (
          <Loading type="spinner" text="Loading plan details..." className="absolute inset-0 bg-background/70 backdrop-blur-[2px] z-50 rounded-2xl" />
        )}

        {/* ── SECTION A: Basic Information ─────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-0.5">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">A</span>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Basic Information</h3>
          </div>

          {/* Plan Name + Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <LabeledField label="Plan Name" required error={errors.name}>
                <Input
                  value={form.name}
                  onChange={e => handleFormChange('name', e.target.value)}
                  placeholder="e.g. Gold Family Plan"
                  className="rounded-xl h-9"
                />
              </LabeledField>
            </div>
            <div>
              <LabeledField label="Plan Code" required error={errors.code}>
                <Input
                  value={form.code}
                  onChange={e => handleFormChange('code', e.target.value)}
                  placeholder="e.g. GOLD-2024"
                  className="rounded-xl font-mono uppercase h-9"
                />
              </LabeledField>
            </div>
          </div>

          {/* Plan Category & Tier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
            <LabeledField label="Plan Type" required error={errors.planCategory}>
              <div className="flex gap-2 pt-0.5">
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
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                      form.planCategory === cat
                        ? cat === 'corporate'
                          ? 'border-blue-500 bg-blue-50/80 text-blue-700 shadow-xs'
                          : 'border-teal-500 bg-teal-50/80 text-teal-700 shadow-xs'
                        : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {cat === 'corporate' ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    {cat === 'corporate' ? 'Company Membership' : 'Personal Membership'}
                  </button>
                ))}
              </div>
            </LabeledField>

            {form.planCategory ? (
              <LabeledField label={<span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Tier {form.planCategory === 'individual' ? '(sets family member limit)' : '(optional)'}</span>}>
                <div className="flex gap-1.5 flex-wrap pt-0.5">
                  {(form.planCategory === 'individual' ? INDIVIDUAL_TIERS : CORPORATE_TIERS).map(tier => (
                    <button
                      key={tier.value}
                      type="button"
                      onClick={() => {
                        const updates: ApiAny = { planTier: tier.value };
                        if (form.planCategory === 'individual') {
                          updates.maxDependents = (tier as ApiAny).pax;
                          setCoveragePreset(getCoveragePreset((tier as ApiAny).pax));
                        }
                        setForm(prev => ({ ...prev, ...updates }));
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        form.planTier === tier.value ? tier.activeClass : 'border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {tier.label}
                      {form.planCategory === 'individual' && (
                        <span className="text-[10px] opacity-60">
                          {(tier as ApiAny).pax === 0 ? 'Self only' : `+${(tier as ApiAny).pax} pax`}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </LabeledField>
            ) : <div />}
          </div>

          {/* Corporate specific fields */}
          {form.planCategory === 'corporate' && (
            <div className="space-y-2.5 bg-muted/20 p-3 rounded-xl border border-border">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Corporate Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <LabeledField label="Company Name" required error={errors.companyName}>
                  <Input
                    value={form.companyName}
                    onChange={e => handleFormChange('companyName', e.target.value)}
                    placeholder="e.g. Tech Corp Pvt Ltd"
                    className="rounded-xl bg-background h-9"
                  />
                </LabeledField>
                <LabeledField label="Contact Name" required error={errors.contactName}>
                  <Input
                    value={form.contactName}
                    onChange={e => handleFormChange('contactName', e.target.value)}
                    placeholder="e.g. John Doe"
                    className="rounded-xl bg-background h-9"
                  />
                </LabeledField>
                <LabeledField label="Email" required error={errors.contactEmail}>
                  <Input
                    value={form.contactEmail}
                    onChange={e => handleFormChange('contactEmail', e.target.value)}
                    placeholder="e.g. contact@techcorp.com"
                    className="rounded-xl bg-background h-9"
                  />
                </LabeledField>
                <LabeledField label="Phone" required error={errors.contactPhone || phoneError}>
                  <div className="flex gap-2 items-center">
                    <CountryCodeSelect
                      value={form.contactCountryCode || "+91"}
                      onChange={(val) => {
                        handleFormChange('contactCountryCode', val);
                        clearPhoneError();
                      }}
                      className="w-30 rounded-xl bg-background border h-9"
                    />
                    <Input
                      type="tel"
                      value={form.contactPhone}
                      onChange={handleCorporatePhoneChange}
                      maxLength={maxLength}
                      placeholder={phonePlaceholder || "e.g. 9876543210"}
                      className="rounded-xl bg-background flex-1 h-9"
                    />
                  </div>
                </LabeledField>
              </div>
            </div>
          )}

          {/* Dates + Max Members + Annual Fee */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <LabeledField label="Start Date" required error={errors.validFrom}>
              <DatePicker
                min={!editing ? localToday : undefined}
                value={form.validFrom}
                onChange={(val) => handleFormChange('validFrom', val)}
                className="rounded-xl h-9"
              />
            </LabeledField>
            <LabeledField label="End Date" required error={errors.validTo}>
              <DatePicker
                min={!editing ? localToday : undefined}
                value={form.validTo}
                onChange={(val) => handleFormChange('validTo', val)}
                className="rounded-xl h-9"
              />
            </LabeledField>
            <LabeledField label="Max Members" required error={errors.maxMembers}>
              <Input
                type="number" min="1"
                value={form.maxMembers ?? ''}
                onFocus={e => e.target.select()}
                onChange={e => {
                  const valStr = sanitizeNumericString(e.target.value);
                  e.target.value = valStr;
                  handleFormChange('maxMembers', valStr);
                }}
                placeholder="e.g. 100"
                className="rounded-xl h-9"
              />
            </LabeledField>
            <LabeledField label="Annual Fee (₹)">
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type="number" min="0"
                  value={form.annualFee ?? ''}
                  onFocus={e => e.target.select()}
                  onChange={e => {
                    const valStr = sanitizeNumericString(e.target.value);
                    e.target.value = valStr;
                    setForm(prev => ({ ...prev, annualFee: parseFloat(valStr) || 0 }));
                  }}
                  placeholder="e.g. 2000"
                  className="pl-8.5 rounded-xl h-9"
                />
              </div>
            </LabeledField>
          </div>

          {/* Description & Color Theme */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 items-start">
            <div className="md:col-span-2">
              <LabeledField label="Description">
                <Textarea
                  value={form.description}
                  onChange={e => handleFormChange('description', e.target.value)}
                  placeholder="What does this membership plan include?"
                  rows={2}
                  className="w-full rounded-xl resize-none text-xs"
                />
              </LabeledField>
            </div>
            <div>
              <LabeledField label="Color Theme">
                <div className="flex gap-1.5 flex-wrap pt-0.5">
                  {PLAN_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c as ApiAny })}
                      className={`w-7 h-7 rounded-lg transition-all shadow-xs ${planColorDots[c] ?? 'bg-gray-400'} ${
                        form.color === c ? 'ring-2 ring-offset-2 ring-primary scale-105' : 'opacity-40 hover:opacity-80'
                      }`}
                    />
                  ))}
                </div>
              </LabeledField>
            </div>
          </div>
        </section>

        <div className="h-px bg-border/40" />

        {/* ── SECTION B: Family Coverage ────────────────────────────────────── */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 pb-0.5">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">B</span>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Family Coverage</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {COVERAGE_PRESETS.map(preset => (
              <button
                key={preset.key}
                type="button"
                onClick={() => setCoverage(preset.key)}
                className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                  coveragePreset === preset.key
                    ? 'border-primary bg-primary/5 text-primary shadow-xs'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${coveragePreset === preset.key ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate leading-tight">{preset.label}</p>
                  <p className="text-[10px] opacity-60 truncate leading-tight">{preset.sub}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Custom number input */}
          {coveragePreset === 'custom' && (
            <div className="pt-0.5">
              <LabeledField label="Custom number of family members allowed (per member)">
                <div className="relative w-44">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    type="number" min="0" max="20"
                    value={form.maxDependents ?? 0}
                    onChange={e => setForm(prev => ({ ...prev, maxDependents: parseInt(e.target.value) || 0 }))}
                    className="pl-8.5 rounded-xl w-full h-8.5 text-xs font-bold"
                  />
                </div>
              </LabeledField>
            </div>
          )}
        </section>

        <div className="h-px bg-border/40" />

        {/* ── SECTION C: Benefits ──────────────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-0.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">C</span>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Benefits</h3>
            </div>
            <Button
              variant="outline" size="sm"
              onClick={() => {
                const newIdx = form.benefits.length;
                setForm({ ...form, benefits: [...form.benefits, mkBenefit()] });
                setExpandedBenefits(prev => ({ ...prev, [newIdx]: true }));
              }}
              className="gap-1.5 h-7 text-xs px-2.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Benefit
            </Button>
          </div>

          {errors.benefits && (
            <p className="text-destructive text-[11px] font-bold px-3 py-1.5 bg-destructive/5 rounded-xl border border-destructive/20">
              {errors.benefits}
            </p>
          )}

          <div className="space-y-3">
            {form.benefits.map((b, idx) => {
              const isExpanded = expandedBenefits[idx] !== false;
              return (
                <div key={b.id} className="relative border border-border rounded-xl p-3.5 sm:p-4 bg-muted/10 hover:bg-muted/15 transition-all">
                  <div 
                    className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-card border border-border rounded-full text-[9px] font-black text-primary uppercase tracking-widest cursor-pointer select-none"
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
                      className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all p-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  
                  {/* Accordion Toggle Header for the whole block when collapsed */}
                  {!isExpanded && (
                    <div className="cursor-pointer select-none text-xs font-semibold text-muted-foreground pt-1" onClick={(e) => toggleBenefit(idx, e)}>
                      {b.type === 'custom' ? b.customName || 'Custom Benefit' : BENEFIT_LABELS[b.type] || 'Benefit Details'}
                      {b.value ? ` - ${b.value}` : ''}
                    </div>
                  )}

                  {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                      {/* Benefit type */}
                      <div className="md:col-span-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Benefit Type</Label>
                        <Select value={b.type} onValueChange={val => updateBenefit(idx, 'type', val)}>
                          <SelectTrigger className="w-full rounded-xl text-xs h-9">
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
                            className="rounded-xl h-9"
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
                              const valStr = sanitizeNumericString(e.target.value);
                              e.target.value = valStr;
                              updateBenefit(idx, 'value', parseFloat(valStr) || 0);
                            }}
                            className="rounded-xl font-bold h-9"
                          />
                        </LabeledField>
                      )}

                      {b.type === 'custom' && (
                        <LabeledField label="Discount %">
                          <Input
                            type="number" min="0" max={100} value={b.value || ''}
                            onFocus={e => e.target.select()}
                            onChange={e => {
                              const valStr = sanitizeNumericString(e.target.value);
                              e.target.value = valStr;
                              updateBenefit(idx, 'value', parseFloat(valStr) || 0);
                            }}
                            className="rounded-xl font-bold h-9"
                          />
                        </LabeledField>
                      )}

                      {b.type === 'capped_discount' && (
                        <LabeledField label="Maximum Amount (₹)">
                          <Input
                            type="number" min="0" value={b.cap || ''}
                            onFocus={e => e.target.select()}
                            onChange={e => {
                              const valStr = sanitizeNumericString(e.target.value);
                              e.target.value = valStr;
                              updateBenefit(idx, 'cap', parseFloat(valStr) || 0);
                            }}
                            className="rounded-xl h-9"
                          />
                        </LabeledField>
                      )}

                      {/* Applicable treatments */}
                      {(b.type === 'treatment_discount' || b.type === 'free_treatments' || b.type === 'complimentary_session') && (
                        <div className="md:col-span-3">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Applicable Treatments</Label>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(TREATMENT_LABELS).map(([key, label]) => (
                              <label
                                key={key}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer transition-all select-none text-[11px] font-bold ${b.treatmentTypes?.includes(key)
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
                            <div className="mt-2 max-w-md">
                              <LabeledField label="Specify Custom Treatment Name">
                                <Input
                                  value={b.customTreatmentText || ''}
                                  onChange={e => updateBenefit(idx, 'customTreatmentText', e.target.value)}
                                  placeholder="e.g. Tooth Whitening"
                                  className="rounded-xl font-bold bg-white h-9"
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
                            className="rounded-xl bg-muted/30 min-h-16 text-xs"
                            rows={2}
                          />
                        </LabeledField>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </Modal>
  );
}
