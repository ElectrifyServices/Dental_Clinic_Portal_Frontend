import React, { useState } from 'react';
import {
  Plus, Edit2, Trash2, Building2, Users, Calendar,
  CheckCircle, ChevronDown, ChevronUp, Gift,
  Percent, Star, Tag, Search, ToggleLeft, ToggleRight, Info,
  Settings2
} from 'lucide-react';
import { CorporatePlan, PlanBenefit, PlanBenefitType } from '../../types';
import { PLAN_COLORS, TREATMENT_LABELS, COLOR_MAP, getPlanStatus } from '../../utils/corporatePlan';
import { Modal, Button, FormField, SectionRenderer } from '../ui';
import { useFormConfig } from '../../hooks/useFormConfig';

interface Props {
  plans: CorporatePlan[];
  onSave: (plan: CorporatePlan) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const BENEFIT_ICONS: Record<PlanBenefitType, React.ReactNode> = {
  flat_discount: <Percent className="w-3.5 h-3.5" />,
  treatment_discount: <Tag className="w-3.5 h-3.5" />,
  free_consultations: <Gift className="w-3.5 h-3.5" />,
  free_treatments: <Star className="w-3.5 h-3.5" />,
  capped_discount: <CheckCircle className="w-3.5 h-3.5" />,
  custom: <Settings2 className="w-3.5 h-3.5" />,
};

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  expiring: 'bg-amber-100 text-amber-700 border-amber-200',
  expired: 'bg-red-100 text-red-700 border-red-200',
  inactive: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Active', expiring: 'Expiring Soon', expired: 'Expired', inactive: 'Inactive',
};

const mkBenefit = (): PlanBenefit => ({
  id: Date.now().toString(), type: 'flat_discount', value: 20,
  description: '20% discount on all treatments',
});

const mkForm = () => ({
  name: '', companyName: '', code: '', description: '',
  benefits: [mkBenefit()],
  validFrom: new Date().toISOString().split('T')[0],
  validTo: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
  maxMembers: undefined as number | undefined,
  isActive: true, color: 'blue',
});

function autoDesc(b: PlanBenefit): string {
  switch (b.type) {
    case 'flat_discount': return `${b.value}% discount on all treatments`;
    case 'treatment_discount': return `${b.value}% discount on ${(b.treatmentTypes || []).map(t => TREATMENT_LABELS[t] || t).join(', ') || 'selected treatments'}`;
    case 'free_consultations': return `${b.value} free consultation${b.value > 1 ? 's' : ''} per year`;
    case 'free_treatments': return `${b.value} free ${(b.treatmentTypes || []).map(t => TREATMENT_LABELS[t] || t).join(', ') || 'treatment'}`;
    case 'capped_discount': return `${b.value}% discount (max ₹${b.cap?.toLocaleString() || '...'} per visit)`;
    case 'custom': return `${b.value}% off on ${b.customName || 'Custom Benefit'}`;
    default: return '';
  }
}

export function CorporatePlanManagement({ plans, onSave, onDelete, onToggle }: Props) {
  const cfg = useFormConfig('corporate');
  const cfgAny = cfg as any;
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
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CorporatePlan | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [form, setForm] = useState(mkForm());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = plans.filter(p => {
    const q = search.toLowerCase();
    const match = p.name.toLowerCase().includes(q) || p.companyName.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    const f = filter === 'all' || (filter === 'active' ? p.isActive : !p.isActive);
    return match && f;
  });

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

  const handleSave = () => {
    if (!validate()) return;
    const plan: CorporatePlan = editing
      ? { ...editing, ...form }
      : { ...form, id: `CORP-${Date.now()}`, currentMembers: 0, createdAt: new Date().toISOString(), createdBy: 'Super Admin' };
    onSave(plan);
    setShowForm(false);
  };

  const openNew = () => { setEditing(null); setForm(mkForm()); setErrors({}); setShowForm(true); };
  const openEdit = (p: CorporatePlan) => { setEditing(p); setForm({ name: p.name, companyName: p.companyName, code: p.code, description: p.description, benefits: p.benefits, validFrom: p.validFrom, validTo: p.validTo, maxMembers: p.maxMembers, isActive: p.isActive, color: p.color }); setErrors({}); setShowForm(true); };

  // Unified handler for SectionRenderer
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
      const nb = { ...b, [field]: val };
      if (field !== 'description') nb.description = autoDesc(nb);
      return nb;
    });
    setForm({ ...form, benefits: updated });
  };

  const totalMembers = plans.reduce((s, p) => s + p.currentMembers, 0);
  const activePlans = plans.filter(p => p.isActive).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-none">Corporate Plans</h1>
          <p className="text-gray-500 text-sm mt-1.5 font-medium">
            {activePlans} active plan{activePlans !== 1 ? 's' : ''} · {totalMembers} enrolled member{totalMembers !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openNew} className="gap-2 shadow-lg shadow-primary/10">
          <Plus className="w-4 h-4" /> Create New Plan
        </Button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-primary/80 font-medium leading-relaxed">
          Plans created here are available company-wide. When registering a patient, staff can map them to a plan — discounts and benefits apply automatically in the billing engine.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search plans, companies…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold" />
        </div>
        <div className="flex p-1 bg-muted rounded-xl border border-border">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all rounded-lg ${filter === f ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-[2.5rem] border-2 border-dashed border-border/50">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">No plans found</p>
          <p className="text-muted-foreground/60 text-xs mt-2 font-medium">Create your first corporate plan to get started</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filtered.map(plan => {
            const c = COLOR_MAP[plan.color] ?? COLOR_MAP.blue;
            const status = getPlanStatus(plan);
            const expanded = expandedId === plan.id;
            return (
              <div key={plan.id} className="bg-white rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl transition-all overflow-hidden group">
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className={`w-14 h-14 rounded-2xl ${c.iconBg} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <Building2 className="w-7 h-7 text-white" />
                      </div>
                      <div className="min-w-0 pt-1">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <h3 className="text-xl font-bold text-foreground tracking-tight">{plan.name}</h3>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-widest ${c.bg} ${c.text} ${c.border}`}>{plan.code}</span>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-widest ${STATUS_BADGE[status]}`}>{STATUS_LABEL[status]}</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-bold leading-tight">{plan.companyName}</p>
                        {plan.description && <p className="text-xs text-muted-foreground/60 mt-1.5 font-medium leading-relaxed max-w-2xl">{plan.description}</p>}
                        <div className="flex gap-6 mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-xl"><Users className="w-3.5 h-3.5" />{plan.currentMembers}{plan.maxMembers ? ` / ${plan.maxMembers}` : ''} Enrollments</span>
                          <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-xl"><Calendar className="w-3.5 h-3.5" />{plan.validFrom} — {plan.validTo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => onToggle(plan.id)} title={plan.isActive ? 'Deactivate' : 'Activate'}
                        className="p-2.5 hover:bg-muted rounded-2xl transition-all">
                        {plan.isActive ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground/40" />}
                      </button>
                      <button onClick={() => openEdit(plan)} className="p-2.5 hover:bg-primary/10 rounded-2xl transition-all text-primary">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => onDelete(plan.id)}
                        className="p-2.5 hover:bg-red-50 rounded-2xl transition-all text-red-500">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Benefit chips */}
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {plan.benefits.map(b => (
                      <span key={b.id} className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${c.bg} ${c.text} ${c.border} shadow-sm`}>
                        {BENEFIT_ICONS[b.type]}
                        {b.description}
                      </span>
                    ))}
                  </div>

                  <button onClick={() => setExpandedId(expanded ? null : plan.id)}
                    className="mt-6 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-all">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {expanded ? 'Collapse Details' : 'View Full Configuration'}
                  </button>
                </div>

                {expanded && (
                  <div className={`px-8 pb-8 pt-2 border-t border-border bg-muted/10`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.benefits.map(b => (
                        <div key={b.id} className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-border shadow-sm group-hover:shadow-md transition-all">
                          <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center text-white flex-shrink-0 shadow-md`}>
                            {BENEFIT_ICONS[b.type]}
                          </div>
                          <div className="pt-0.5">
                            <p className="text-xs font-black text-foreground uppercase tracking-widest mb-1">{BENEFIT_LABELS[b.type]}</p>
                            <p className="text-sm font-bold text-muted-foreground leading-tight">{b.description}</p>
                            {b.treatmentTypes?.length ? (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {b.treatmentTypes.map(t => (
                                  <span key={t} className="text-[9px] font-black bg-muted px-2 py-0.5 rounded-lg uppercase tracking-tight text-muted-foreground">{TREATMENT_LABELS[t] || t}</span>
                                ))}
                              </div>
                            ) : null}
                            {b.cap ? <p className="text-[10px] font-black text-primary mt-3 uppercase tracking-widest">Cap: ₹{b.cap.toLocaleString()} Per Visit</p> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <Modal
          title={editing ? (cfgAny.title?.edit ?? 'Update Corporate Plan') : (cfgAny.title?.create ?? 'Corporate Plan Design')}
          subtitle={editing ? `Editing configuration for ${form.companyName}` : 'Configure new health benefits and enrollment caps'}
          onClose={() => setShowForm(false)}
          size="5xl"
          icon={<Building2 className="w-4 h-4" />}
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button variant="outline" onClick={() => setShowForm(false)}>Discard Changes</Button>
              <Button onClick={handleSave} className="gap-2 shadow-lg shadow-primary/10">
                <CheckCircle className="w-4 h-4" /> {editing ? (cfgAny.submitLabel?.edit ?? 'Apply Plan Updates') : (cfgAny.submitLabel?.create ?? 'Launch New Plan')}
              </Button>
            </div>
          }
        >
          <div className="space-y-8 py-2">
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

              {/* Color swatch — kept custom (visual picker, not a standard select) */}
              <FormField label={fl('color', 'Visual Branding Theme')}>
                <div className="flex gap-2 flex-wrap pt-1">
                  {PLAN_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                      className={`w-9 h-9 rounded-xl ${planColorDots[c] ?? 'bg-gray-400'} transition-all shadow-md ${form.color === c ? 'ring-2 ring-offset-4 ring-primary scale-110' : 'opacity-30 hover:opacity-100'}`} />
                  ))}
                </div>
              </FormField>
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

              {errors.benefits && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest px-2 bg-red-50 py-2 rounded-xl border border-red-100">{errors.benefits}</p>}

              <div className="grid grid-cols-1 gap-6">
                {form.benefits.map((b, idx) => (
                  <div key={b.id} className="group relative border border-border rounded-[2rem] p-8 bg-muted/10 hover:bg-muted/20 transition-all shadow-inner">
                    <div className="absolute -top-3 left-6 px-4 py-1 bg-white border border-border rounded-full text-[9px] font-black text-primary uppercase tracking-widest shadow-sm">
                      Coverage Node #{idx + 1}
                    </div>

                    {form.benefits.length > 1 && (
                      <button type="button" onClick={() => setForm({ ...form, benefits: form.benefits.filter((_, i) => i !== idx) })}
                        className="absolute top-4 right-4 p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
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
                        <FormField label={fl('customName', 'Benefit Label (Manual Entry)')}>
                          <input type="text" value={b.customName || ''} onChange={e => updateBenefit(idx, 'customName', e.target.value)}
                            placeholder="e.g. Lab Charges, X-Ray"
                            className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold bg-background shadow-sm" />
                        </FormField>
                      ) : (
                        <FormField label={['free_consultations', 'free_treatments'].includes(b.type) ? fl('allocationCount', 'Allocation Count') : fl('value', 'Discount Rate (%)')}>
                          <input type="number" min="0" max={b.type.includes('discount') ? 100 : 999} value={b.value}
                            onChange={e => updateBenefit(idx, 'value', parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-black bg-background shadow-sm" />
                        </FormField>
                      )}

                      {b.type === 'custom' && (
                        <FormField label={fl('value', 'Discount Rate (%)')}>
                          <input type="number" min="0" max={100} value={b.value}
                            onChange={e => updateBenefit(idx, 'value', parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-black bg-background shadow-sm" />
                        </FormField>
                      )}

                      {b.type === 'capped_discount' && (
                        <FormField label={fl('cap', 'Maximum Cap (₹)')}>
                          <input type="number" min="0" value={b.cap ?? ''}
                            onChange={e => updateBenefit(idx, 'cap', parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold bg-background shadow-sm" />
                        </FormField>
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
                        <FormField label={fl('description', 'Auto-Generated Display Description')} error={errors[`b_${idx}`]}>
                          <input type="text" value={b.description} onChange={e => updateBenefit(idx, 'description', e.target.value)}
                            placeholder="Patient-facing benefit description"
                            className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium bg-muted/30 shadow-inner" />
                        </FormField>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </Modal>
      )}
    </div>
  );
}
