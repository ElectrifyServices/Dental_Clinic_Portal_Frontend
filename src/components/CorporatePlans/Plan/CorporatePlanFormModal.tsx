import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Settings2, CheckCircle } from 'lucide-react';
import { CorporatePlan, PlanBenefit } from '../../../types';
import { TREATMENT_LABELS, PLAN_COLORS } from '../../../utils/corporatePlan';
import { Modal, Button, LabeledField, SectionRenderer } from '../../ui';
import { mkForm, mkBenefit, autoDesc } from './constants';
import { useFormConfig } from '../../../hooks/useFormConfig';
import { useCreateCorporatePlanMutation } from '../../../hooks/corporate/useCreateCorporatePlanMutation';
import { useUpdateCorporatePlanMutation } from '../../../hooks/corporate/useUpdateCorporatePlanMutation';
import { useModal } from '../../../contexts/ModalContext';
import { useCorporatePlanQuery } from '../../../hooks/corporate/useCorporatePlanQuery';

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

  const cfg = useFormConfig('corporate');
  const cfgAny = cfg as any;
  const { showToast } = useModal();

  const createPlanMutation = useCreateCorporatePlanMutation();
  const updatePlanMutation = useUpdateCorporatePlanMutation();

  // Fetch detailed plan details from API GET /corporate/plan/:id when editing
  const { data: planDetails, isLoading: isFetching } = useCorporatePlanQuery(editing?.id || undefined, {
    enabled: showForm && !!editing?.id,
  });

  const BENEFIT_LABELS: Record<string, string> = Object.fromEntries(
    (cfgAny.benefitTypes ?? []).map((b: any) => [b.value, b.label])
  );
  const planColorDots: Record<string, string> = Object.fromEntries(
    (cfgAny.planColors ?? []).map((c: any) => [c.value, c.dot])
  );

  const allFields = [...(cfg.sections?.flatMap(s => s.fields) ?? [])];
  const fieldMap = Object.fromEntries(allFields.map(f => [f.name, f]));
  const fl = (name: string, fallback = name) => fieldMap[name]?.label ?? fallback;
  const coreIdentitySection = cfg.sections?.find(s => s.id === 'coreIdentity');

  useEffect(() => {
    if (showForm) {
      if (editing) {
        if (planDetails) {
          const planData = planDetails.data || planDetails;

          const mapHexToColor = (hex: string): string => {
            const colorMap: Record<string, string> = {
              "#3B82F6": "blue",
              "#8B5CF6": "violet",
              "#10B981": "emerald",
              "#F43F5E": "rose",
              "#F59E0B": "amber",
              "#06B6D4": "cyan",
              "#6366F1": "indigo",
              "#14B8A6": "teal",
            };
            return colorMap[hex?.toUpperCase()] || "blue";
          };

          const mapBackendBenefitType = (backendType: string): string => {
            const typeMap: Record<string, string> = {
              FLAT_DISCOUNT: "flat_discount",
              TREATMENT_DISCOUNT: "treatment_discount",
              FREE_CONSULTATION: "free_consultations",
              FREE_TREATMENT_SERVICE: "free_treatments",
              CAPPED_DISCOUNT: "capped_discount",
              CUSTOM: "custom",
            };
            return typeMap[backendType] || "custom";
          };

          const mapProcedureLabelToKey = (label: string): string => {
            const labelMap: Record<string, string> = {
              "Consultation / Check-up": "consultation",
              "Consultation": "consultation",
              "follow up visit": "follow-up",
              "X-ray review": "xray-review",
              "Teeth Cleaning": "cleaning",
              "Tooth Pain / Emergency": "emergency",
              "Filling": "filling",
              "Root Canal Treatment": "root-canal",
              "Extraction / Wisdom Tooth": "extraction",
              "Braces / Aligners": "orthodontics",
              "Implants": "implants",
              "full mouth rehabilitation": "full-mouth-rehab",
              "Veneers/Cosmetic Dentistry": "veneers-cosmetic",
              "Child Dentistry": "child-dentistry",
              "Crown": "crown",
              "Denture": "denture",
              "Toothache": "toothache",
              "Swelling / Infection": "swelling-infection",
              "Broken Tooth": "broken-tooth",
              "Trauma / Injury": "trauma-injury",
              "other/ not sure": "other",
              
              // Legacy mapping fallbacks
              "Teeth Cleaning & Scaling": "cleaning",
              "Dental Filling": "filling",
              "Tooth Extraction": "extraction",
              "Root Canal": "root-canal",
              "Crown Fitting": "crown",
              "Orthodontics": "orthodontics",
              "Oral Surgery": "surgery",
              "Other": "other",
            };
            return labelMap[label] || label.toLowerCase();
          };

          const benefits = (planData.benefits || []).map((b: any) => ({
            id: b.id || `b-${Date.now()}-${Math.random()}`,
            type: mapBackendBenefitType(b.type),
            value: ["FREE_CONSULTATION", "FREE_TREATMENT_SERVICE"].includes(b.type)
              ? (b.allocationCount || b.count || 0)
              : (b.discount_percentage || 0),
            allocationCount: b.allocationCount || b.count || 0,
            cap: b.max_amount || undefined,
            customName: b.benifit_label || undefined,
            treatmentTypes: (b.clinical_procedures || []).map(mapProcedureLabelToKey),
            description: b.description || "",
          }));

          setForm({
            name: planData.plan_name || editing.name,
            companyName: planData.company_name || editing.companyName,
            code: planData.plan_code || editing.code,
            description: planData.description || editing.description,
            benefits: benefits.length > 0 ? benefits : editing.benefits,
            validFrom: planData.valid_from ? planData.valid_from.split('T')[0] : editing.validFrom,
            validTo: planData.valid_till ? planData.valid_till.split('T')[0] : editing.validTo,
            maxMembers: planData.max_member || editing.maxMembers,
            isActive: planData.status === "ACTIVE",
            color: planData.theme_color ? mapHexToColor(planData.theme_color) as any : editing.color
          });
        } else {
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
            color: editing.color
          });
        }
      } else {
        setForm(mkForm());
      }
      setErrors({});
    }
  }, [showForm, editing, planDetails]);

  const handleFormChange = (name: string, value: any) => {
    setForm(prev => {
      if (name === 'code') return { ...prev, code: String(value).toUpperCase() };
      if (name === 'maxMembers') return { ...prev, maxMembers: value ? parseInt(value) : undefined };
      return { ...prev, [name]: value };
    });
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
    if (!form.name.trim()) e.name = 'Required';
    if (!form.companyName.trim()) e.companyName = 'Required';
    if (!form.code.trim()) e.code = 'Required';
    if (!form.validFrom) e.validFrom = 'Required';
    if (!form.validTo || form.validTo < form.validFrom) e.validTo = 'Must be after start date';
    if (!form.benefits.length) e.benefits = 'Add at least one benefit';
    form.benefits.forEach((b, i) => { if (!b.description.trim()) e[`b_${i}`] = 'Required'; });
    setErrors(e);
    return !Object.keys(e).length;
  };

  const mapColorToHex = (colorName: string): string => {
    const hexMap: Record<string, string> = {
      blue: "#3B82F6", violet: "#8B5CF6", emerald: "#10B981", rose: "#F43F5E",
      amber: "#F59E0B", cyan: "#06B6D4", indigo: "#6366F1", teal: "#14B8A6",
    };
    return hexMap[colorName] || "#4F46E5";
  };

  const mapBenefitType = (frontendType: string): string => {
    const typeMap: Record<string, string> = {
      flat_discount: "FLAT_DISCOUNT", treatment_discount: "TREATMENT_DISCOUNT",
      free_consultations: "FREE_CONSULTATION", free_treatments: "FREE_TREATMENT_SERVICE",
      capped_discount: "CAPPED_DISCOUNT", custom: "CUSTOM",
    };
    return typeMap[frontendType] || "CUSTOM";
  };

  const buildBenefitsPayload = (benefits: typeof form.benefits) =>
    benefits.map((b) => {
      const allocationCount = ["free_consultations", "free_treatments"].includes(b.type) ? b.value : 0;
      const discount_percentage = b.type.includes("discount") || b.type === "custom" ? b.value : 0;

      let clinical_procedures: string[] = [];
      if (b.type === "free_consultations") {
        clinical_procedures = ["Consultation"];
      } else if (Array.isArray(b.treatmentTypes)) {
        clinical_procedures = b.treatmentTypes.map(t => TREATMENT_LABELS[t] || t);
      }

      return {
        type: mapBenefitType(b.type),
        allocationCount,
        clinical_procedures,
        description: b.description || "",
        benifit_label: b.customName || b.description || "Benefit",
        discount_percentage,
        max_amount: b.cap || 0,
      };
    });

  const handleSave = async () => {
    if (!validate()) return;

    if (!editing) {
      try {
        const validFromObj = new Date(form.validFrom);
        const todayObj = new Date();
        let submitValidFrom = validFromObj.toISOString();

        if (form.validFrom === todayObj.toISOString().split('T')[0]) {
          todayObj.setMinutes(todayObj.getMinutes() + 2);
          submitValidFrom = todayObj.toISOString();
        }

        const transformedBody = {
          plan_name: form.name,
          company_name: form.companyName,
          plan_code: form.code,
          description: form.description || "",
          valid_from: submitValidFrom,
          valid_till: new Date(form.validTo).toISOString(),
          enrollment_cap: form.maxMembers || 0,
          theme_color: mapColorToHex(form.color),
          benefits: buildBenefitsPayload(form.benefits),
        };

        const apiResponse = await createPlanMutation.mutateAsync(transformedBody);

        const plan: CorporatePlan = {
          ...form,
          id: apiResponse?.id || `CORP-${Date.now()}`,
          currentMembers: 0,
          createdAt: new Date().toISOString(),
          createdBy: 'Super Admin',
        };
        onSave(plan);
        showToast('Plan created successfully');
        setShowForm(false);
      } catch (err: any) {
        console.error("Failed to create corporate plan via API:", err);
        let errorMsg = parseBackendError(err, "Failed to create plan on backend");

        if (typeof errorMsg === "string") {
          errorMsg = errorMsg.replace(/enrollment_cap/gi, "Enrollment Cap");
        }
        setErrors(prev => ({
          ...prev,
          submit: errorMsg,
        }));
      }
    } else {
      try {
        const transformedBody = {
          id: editing.id,
          plan_name: form.name,
          company_name: form.companyName,
          plan_code: form.code,
          description: form.description || "",
          valid_from: new Date(form.validFrom).toISOString(),
          valid_till: new Date(form.validTo).toISOString(),
          enrollment_cap: form.maxMembers || 0,
          theme_color: mapColorToHex(form.color),
          benefits: buildBenefitsPayload(form.benefits),
        };

        await updatePlanMutation.mutateAsync(transformedBody);

        const plan: CorporatePlan = { ...editing, ...form };
        onSave(plan);
        showToast('Plan updated successfully');
        setShowForm(false);
      } catch (err: any) {
        console.error("Failed to update corporate plan via API:", err);
        let errorMsg = parseBackendError(err, "Failed to update plan on backend");

        if (typeof errorMsg === "string") {
          errorMsg = errorMsg.replace(/enrollment_cap/gi, "Enrollment Cap");
        }
        setErrors(prev => ({
          ...prev,
          submit: errorMsg,
        }));
      }
    }
  };

  if (!showForm) return null;

  return (
    <Modal
      title={editing ? (cfgAny.title?.edit ?? 'Update Corporate Plan') : (cfgAny.title?.create ?? 'Corporate Plan Design')}
      subtitle={editing ? `Editing configuration for ${form.companyName}` : 'Configure new health benefits and enrollment caps'}
      onClose={() => setShowForm(false)}
      size="5xl"
      icon={<Building2 className="w-4 h-4" />}
      footer={
        <div className="flex flex-col gap-3 w-full">
          {errors.submit && (
            <p className="text-red-500 text-xs font-bold text-left px-4 py-2.5 bg-red-50 rounded-xl border border-red-200">
              {errors.submit}
            </p>
          )}
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setShowForm(false)}>Discard Changes</Button>
            <Button
              onClick={handleSave}
              className="gap-2 shadow-lg shadow-primary/10"
              disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
            >
              {(createPlanMutation.isPending || updatePlanMutation.isPending) ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> {editing ? (cfgAny.submitLabel?.edit ?? 'Apply Plan Updates') : (cfgAny.submitLabel?.create ?? 'Launch New Plan')}
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-8 py-2 relative min-h-[200px]">
        {isFetching && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 z-50 rounded-2xl transition-all duration-300">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-md" />
            <p className="text-xs font-bold text-primary tracking-wide animate-pulse">Loading corporate plan details from API...</p>
          </div>
        )}
        <section className="space-y-4">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
            {coreIdentitySection?.title ?? 'Core Identity'}
          </label>

          {/* Standard fields from JSON config */}
          {coreIdentitySection && (
            <SectionRenderer
              section={{ ...coreIdentitySection, fields: coreIdentitySection.fields.filter(f => f.name !== 'color') }}
              values={form}
              onChange={handleFormChange}
              errors={errors}
              cols={3}
            />
          )}

          {/* Color swatch */}
          <LabeledField label={fl('color', 'Visual Branding Theme')}>
            <div className="flex gap-2 flex-wrap pt-1">
              {PLAN_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c as any })}
                  className={`w-9 h-9 rounded-xl ${planColorDots[c] ?? 'bg-gray-400'} transition-all shadow-md ${form.color === c ? 'ring-2 ring-offset-4 ring-primary scale-110' : 'opacity-30 hover:opacity-100'}`} />
              ))}
            </div>
          </LabeledField>
        </section>

        <div className="h-px bg-border/50" />

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{cfg.sections?.find(s => s.id === 'benefitLogic')?.title ?? 'Plan Benefit Logic'}</label>
              <div className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Automatic Calculations</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setForm({ ...form, benefits: [...form.benefits, mkBenefit()] })} className="h-9 gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Add Coverage Node
            </Button>
          </div>

          {errors.benefits && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest px-2 bg-destructive/10 py-2 rounded-xl border border-destructive/20">{errors.benefits}</p>}

          <div className="grid grid-cols-1 gap-6">
            {form.benefits.map((b, idx) => (
              <div key={b.id} className="group relative border border-border rounded-[2rem] p-8 bg-muted/10 hover:bg-muted/20 transition-all shadow-inner">
                <div className="absolute -top-3 left-6 px-4 py-1 bg-card border border-border rounded-full text-[9px] font-black text-primary uppercase tracking-widest shadow-sm">
                  Coverage Node #{idx + 1}
                </div>

                {form.benefits.length > 1 && (
                  <button type="button" onClick={() => setForm({ ...form, benefits: form.benefits.filter((_, i) => i !== idx) })}
                    className="absolute top-4 right-4 p-2.5 text-muted-foreground hover:text-red-500 hover:bg-destructive/10 rounded-2xl transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Logic Type</label>
                      <button
                        type="button"
                        onClick={() => updateBenefit(idx, 'type', b.type === 'custom' ? 'flat_discount' : 'custom')}
                        className={`flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tight transition-all ${b.type === 'custom' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'}`}
                      >
                        <Settings2 className="w-3 h-3" /> {b.type === 'custom' ? 'Using Custom Label' : 'Use Custom Label'}
                      </button>
                    </div>
                    <select value={b.type} onChange={e => updateBenefit(idx, 'type', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold bg-background appearance-none shadow-sm">
                      {Object.entries(BENEFIT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>

                  {b.type === 'custom' ? (
                    <LabeledField label={fl('customName', 'Benefit Label (Manual Entry)')}>
                      <input type="text" value={b.customName || ''} onChange={e => updateBenefit(idx, 'customName', e.target.value)}
                        placeholder="e.g. Lab Charges, X-Ray"
                        className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold bg-background shadow-sm" />
                    </LabeledField>
                  ) : (
                    <LabeledField label={['free_consultations', 'free_treatments'].includes(b.type) ? fl('allocationCount', 'Allocation Count') : fl('value', 'Discount Rate (%)')}>
                      <input type="number" min="0" max={b.type.includes('discount') ? 100 : 999} value={b.value}
                        onChange={e => updateBenefit(idx, 'value', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-black bg-background shadow-sm" />
                    </LabeledField>
                  )}

                  {b.type === 'custom' && (
                    <LabeledField label={fl('value', 'Discount Rate (%)')}>
                      <input type="number" min="0" max={100} value={b.value}
                        onChange={e => updateBenefit(idx, 'value', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-black bg-background shadow-sm" />
                    </LabeledField>
                  )}

                  {b.type === 'capped_discount' && (
                    <LabeledField label={fl('cap', 'Maximum Cap (₹)')}>
                      <input type="number" min="0" value={b.cap ?? ''}
                        onChange={e => updateBenefit(idx, 'cap', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold bg-background shadow-sm" />
                    </LabeledField>
                  )}

                  {(b.type === 'treatment_discount' || b.type === 'free_treatments') && (
                    <div className="md:col-span-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 block ml-1">{fl('treatmentTypes', 'Target Clinical Procedures')}</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(TREATMENT_LABELS).map(([key, label]) => (
                          <label key={key} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border cursor-pointer transition-all select-none ${b.treatmentTypes?.includes(key) ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm' : 'bg-background border-border text-muted-foreground hover:border-primary/40'}`}>
                            <input type="checkbox" checked={b.treatmentTypes?.includes(key) ?? false} className="sr-only"
                              onChange={e => {
                                const curr = b.treatmentTypes || [];
                                updateBenefit(idx, 'treatmentTypes', e.target.checked ? [...curr, key] : curr.filter(t => t !== key));
                              }} />
                            <span className="text-[11px] uppercase tracking-tighter font-black">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-3">
                    <LabeledField label={fl('description', 'Auto-Generated Display Description')} error={errors[`b_${idx}`]}>
                      <input type="text" value={b.description} onChange={e => updateBenefit(idx, 'description', e.target.value)}
                        placeholder="Patient-facing benefit description"
                        className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium bg-muted/30 shadow-inner" />
                    </LabeledField>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  );
}
