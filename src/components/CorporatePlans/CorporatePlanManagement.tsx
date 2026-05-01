import React, { useState } from 'react';
import {
  Plus, Edit2, Trash2, Building2, Users, Calendar,
  CheckCircle, XCircle, ChevronDown, ChevronUp, Gift,
  Percent, Star, Tag, Search, ToggleLeft, ToggleRight, Info
} from 'lucide-react';
import { CorporatePlan, PlanBenefit, PlanBenefitType } from '../../types';
import { PLAN_COLORS, TREATMENT_LABELS, COLOR_MAP, getPlanStatus } from '../../utils/corporatePlan';

interface Props {
  plans: CorporatePlan[];
  onSave: (plan: CorporatePlan) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const BENEFIT_LABELS: Record<PlanBenefitType, string> = {
  flat_discount: 'Flat % Discount (All Services)',
  treatment_discount: 'Treatment-Specific % Discount',
  free_consultations: 'Free Consultations (per year)',
  free_treatments: 'Free Specific Treatments',
  capped_discount: 'Capped % Discount (max ₹)',
};

const BENEFIT_ICONS: Record<PlanBenefitType, React.ReactNode> = {
  flat_discount:       <Percent className="w-3.5 h-3.5" />,
  treatment_discount:  <Tag className="w-3.5 h-3.5" />,
  free_consultations:  <Gift className="w-3.5 h-3.5" />,
  free_treatments:     <Star className="w-3.5 h-3.5" />,
  capped_discount:     <CheckCircle className="w-3.5 h-3.5" />,
};

const STATUS_BADGE: Record<string, string> = {
  active:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  expiring: 'bg-amber-100 text-amber-700 border-amber-200',
  expired:  'bg-red-100 text-red-700 border-red-200',
  inactive: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Active', expiring: 'Expiring Soon', expired: 'Expired', inactive: 'Inactive',
};

const DOT: Record<string, string> = {
  blue:'bg-blue-500', violet:'bg-violet-500', emerald:'bg-emerald-500', rose:'bg-rose-500',
  amber:'bg-amber-500', cyan:'bg-cyan-500', indigo:'bg-indigo-500', teal:'bg-teal-500',
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
    default: return '';
  }
}

export function CorporatePlanManagement({ plans, onSave, onDelete, onToggle }: Props) {
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
  const openEdit = (p: CorporatePlan) => { setEditing(p); setForm({ ...p }); setErrors({}); setShowForm(true); };

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
          <h1 className="text-2xl font-bold text-gray-900">Corporate Plans</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {activePlans} active plan{activePlans !== 1 ? 's' : ''} · {totalMembers} enrolled member{totalMembers !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Plans created here are available company-wide. When registering a patient, staff can map them to a plan — discounts apply automatically in billing.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search plans, companies…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex rounded-xl border border-gray-300 bg-white overflow-hidden">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">No plans found</p>
          <p className="text-gray-400 text-sm mt-1">Create your first corporate plan to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(plan => {
            const c = COLOR_MAP[plan.color] ?? COLOR_MAP.blue;
            const status = getPlanStatus(plan);
            const expanded = expandedId === plan.id;
            return (
              <div key={plan.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900">{plan.name}</h3>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>{plan.code}</span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[status]}`}>{STATUS_LABEL[status]}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{plan.companyName}</p>
                        {plan.description && <p className="text-xs text-gray-400 mt-0.5">{plan.description}</p>}
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{plan.currentMembers}{plan.maxMembers ? `/${plan.maxMembers}` : ''} members</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{plan.validFrom} → {plan.validTo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => onToggle(plan.id)} title={plan.isActive ? 'Deactivate' : 'Activate'}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        {plan.isActive ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                      </button>
                      <button onClick={() => openEdit(plan)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button onClick={() => { if (window.confirm(`Delete "${plan.name}"?`)) onDelete(plan.id); }}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Benefit chips */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {plan.benefits.map(b => (
                      <span key={b.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
                        {BENEFIT_ICONS[b.type]}{b.description}
                      </span>
                    ))}
                  </div>

                  <button onClick={() => setExpandedId(expanded ? null : plan.id)}
                    className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {expanded ? 'Hide details' : 'View details'}
                  </button>
                </div>

                {expanded && (
                  <div className={`px-5 pb-5 border-t ${c.border} ${c.bg}`}>
                    <div className="pt-4 space-y-2">
                      {plan.benefits.map(b => (
                        <div key={b.id} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-white/80 shadow-sm">
                          <div className={`w-7 h-7 rounded-lg ${c.iconBg} flex items-center justify-center text-white flex-shrink-0`}>
                            {BENEFIT_ICONS[b.type]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{BENEFIT_LABELS[b.type]}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{b.description}</p>
                            {b.treatmentTypes?.length ? (
                              <p className="text-xs text-gray-500 mt-0.5">Applies to: {b.treatmentTypes.map(t => TREATMENT_LABELS[t] || t).join(', ')}</p>
                            ) : null}
                            {b.cap ? <p className="text-xs text-gray-500">Cap: ₹{b.cap.toLocaleString()} per visit</p> : null}
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Corporate Plan' : 'Create Corporate Plan'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-xl"><XCircle className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Basic info */}
              <section>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Plan Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Plan Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Gold Health Plan"
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company Name *</label>
                    <input type="text" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} placeholder="e.g. Infosys"
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.companyName ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                    {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Plan Code *</label>
                    <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. GOLD"
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${errors.code ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                    <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief summary of what the plan covers…"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Valid From *</label>
                    <input type="date" value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })}
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.validFrom ? 'border-red-400' : 'border-gray-300'}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Valid To *</label>
                    <input type="date" value={form.validTo} onChange={e => setForm({ ...form, validTo: e.target.value })}
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.validTo ? 'border-red-400' : 'border-gray-300'}`} />
                    {errors.validTo && <p className="text-red-500 text-xs mt-1">{errors.validTo}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Max Members <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input type="number" min="0" value={form.maxMembers ?? ''} onChange={e => setForm({ ...form, maxMembers: e.target.value ? parseInt(e.target.value) : undefined })} placeholder="No limit"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Badge Color</label>
                    <div className="flex gap-2 flex-wrap pt-1">
                      {PLAN_COLORS.map(c => (
                        <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                          className={`w-7 h-7 rounded-lg ${DOT[c]} transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-800 scale-110' : 'opacity-50 hover:opacity-100'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Benefits */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-700">Plan Benefits</h3>
                  <button type="button" onClick={() => setForm({ ...form, benefits: [...form.benefits, mkBenefit()] })}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold">
                    <Plus className="w-3.5 h-3.5" /> Add Benefit
                  </button>
                </div>
                {errors.benefits && <p className="text-red-500 text-xs mb-2">{errors.benefits}</p>}
                <div className="space-y-4">
                  {form.benefits.map((b, idx) => (
                    <div key={b.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Benefit {idx + 1}</span>
                        {form.benefits.length > 1 && (
                          <button type="button" onClick={() => setForm({ ...form, benefits: form.benefits.filter((_, i) => i !== idx) })}>
                            <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Type</label>
                          <select value={b.type} onChange={e => updateBenefit(idx, 'type', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            {Object.entries(BENEFIT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            {['free_consultations', 'free_treatments'].includes(b.type) ? 'Count' : 'Percentage (%)'}
                          </label>
                          <input type="number" min="0" max={b.type.includes('discount') ? 100 : 999} value={b.value}
                            onChange={e => updateBenefit(idx, 'value', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                        </div>
                        {b.type === 'capped_discount' && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Max Cap (₹)</label>
                            <input type="number" min="0" value={b.cap ?? ''}
                              onChange={e => updateBenefit(idx, 'cap', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                          </div>
                        )}
                        {(b.type === 'treatment_discount' || b.type === 'free_treatments') && (
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Applicable Treatments</label>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(TREATMENT_LABELS).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-1.5 cursor-pointer select-none">
                                  <input type="checkbox" checked={b.treatmentTypes?.includes(key) ?? false}
                                    onChange={e => {
                                      const curr = b.treatmentTypes || [];
                                      updateBenefit(idx, 'treatmentTypes', e.target.checked ? [...curr, key] : curr.filter(t => t !== key));
                                    }}
                                    className="w-3.5 h-3.5 accent-blue-600" />
                                  <span className="text-xs text-gray-700">{label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Display Description *</label>
                          <input type="text" value={b.description} onChange={e => updateBenefit(idx, 'description', e.target.value)}
                            placeholder="Plain-language description shown to patients and staff"
                            className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors[`b_${idx}`] ? 'border-red-400' : 'border-gray-300'}`} />
                          {errors[`b_${idx}`] && <p className="text-red-500 text-xs mt-1">{errors[`b_${idx}`]}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />{editing ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
