import React, { useState } from 'react';
import {
  CheckCircle, ChevronRight, ChevronLeft, User, Users, Tag,
  Building2, Phone, Mail, Calendar, Search, Zap, ArrowRight,
  Sparkles, Shield, Star, Award,
} from 'lucide-react';
import { CorporatePlan } from '../../../types';
import { COLOR_MAP } from '../../../utils/corporatePlan';
import { Button, Input, LabeledField, Card, SearchInput, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui';
import { useCreateEmployeeMutation } from '../../../hooks/corporate/useCreateEmployeeMutation';
import { useAddDependentMutation } from '../../../hooks/corporate/useAddDependentMutation';
import { useModal } from '../../../contexts/ModalContext';

interface QuickRegistrationFlowProps {
  plans: CorporatePlan[];
  onRegistered: () => void;
}

interface FamilyMember {
  name: string;
  relationship: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
}

const STEPS = [
  { num: 1, label: 'Choose Plan',   icon: Sparkles },
  { num: 2, label: 'Member Info',   icon: User },
  { num: 3, label: 'Discount',      icon: Tag },
  { num: 4, label: 'Family',        icon: Users },
  { num: 5, label: 'Confirm',       icon: CheckCircle },
];

const RELATIONSHIPS = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'];

const blankMember = (): FamilyMember => ({
  name: '', relationship: 'Spouse', phone: '', dateOfBirth: '', gender: 'male',
});

const GRADIENT_MAP: Record<string, string> = {
  blue:    'from-blue-500 to-blue-700',
  violet:  'from-violet-500 to-purple-700',
  emerald: 'from-emerald-500 to-teal-700',
  rose:    'from-rose-500 to-pink-700',
  amber:   'from-amber-400 to-orange-600',
  cyan:    'from-cyan-500 to-blue-600',
  indigo:  'from-indigo-500 to-violet-700',
  teal:    'from-teal-500 to-emerald-600',
};

const TIER_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  platinum: Sparkles, gold: Star, silver: Shield, premium: Award, standard: Shield, basic: CheckCircle,
};

export function QuickRegistrationFlow({ plans, onRegistered }: QuickRegistrationFlowProps) {
  const [step, setStep] = useState(1);
  const [planSearch, setPlanSearch] = useState('');

  const [selectedPlan, setSelectedPlan]   = useState<CorporatePlan | null>(null);
  const [memberName, setMemberName]       = useState('');
  const [memberPhone, setMemberPhone]     = useState('');
  const [memberEmail, setMemberEmail]     = useState('');
  const [memberDob, setMemberDob]         = useState('');
  const [memberGender, setMemberGender]   = useState<'male' | 'female' | 'other'>('male');
  const [companyName, setCompanyName]     = useState('');
  const [discountType, setDiscountType]   = useState<'none' | 'percent' | 'fixed'>('none');
  const [discountValue, setDiscountValue] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [errors, setErrors]               = useState<Record<string, string>>({});
  const [saving, setSaving]               = useState(false);
  const [saved, setSaved]                 = useState(false);

  const createMember = useCreateEmployeeMutation();
  const addDependent = useAddDependentMutation();
  const { showToast } = useModal();

  const activePlans = plans.filter(p => p.isActive);
  const filteredPlans = activePlans.filter(p =>
    !planSearch ||
    p.name.toLowerCase().includes(planSearch.toLowerCase()) ||
    p.code.toLowerCase().includes(planSearch.toLowerCase())
  );

  const isIndividual  = selectedPlan?.planCategory === 'individual';
  const maxDependents = selectedPlan?.maxDependents ?? 0;

  const validateStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1 && !selectedPlan) e.plan = 'Please select a plan to continue';
    if (s === 2) {
      if (!memberName.trim()) e.name = 'Full name is required';
      if (!memberPhone.trim()) e.phone = 'Phone number is required';
      if (!isIndividual && !companyName.trim()) e.company = 'Company name is required';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next = () => {
    if (!validateStep(step)) return;
    if (step === 4 && maxDependents === 0) { setStep(5); return; }
    setStep(s => Math.min(s + 1, 5));
  };
  const back = () => { setErrors({}); setStep(s => Math.max(s - 1, 1)); };

  const handleSave = async () => {
    if (!selectedPlan) return;
    setSaving(true);
    try {
      const created = await createMember.mutateAsync({
        name: memberName.trim(),
        emp_id: `M-${Date.now()}`,
        phone: memberPhone.trim(),
        email: memberEmail.trim(),
        gender: memberGender.toUpperCase(),
        date_of_birth: memberDob || '',
        company_name: isIndividual ? 'Individual' : companyName.trim(),
        corporate_plan_id: selectedPlan.id,
        eligible_date: new Date().toISOString(),
        status: 'ACTIVE',
        coverage_type: familyMembers.length > 0 ? 'FAMILY' : 'SELF',
      });

      for (const fm of familyMembers) {
        if (!fm.name.trim()) continue;
        await addDependent.mutateAsync({
          memberId: created.id,
          name: fm.name,
          relationship: fm.relationship,
          dateOfBirth: fm.dateOfBirth,
          gender: fm.gender,
          phone: fm.phone,
          corporatePlanId: selectedPlan.id,
          primaryMemberName: memberName,
        });
      }

      setSaved(true);
      showToast(`${memberName} registered successfully`);
      setTimeout(onRegistered, 1800);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.statusDesc || err?.message || 'Registration failed';
      setErrors({ submit: msg });
    } finally {
      setSaving(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (saved) {
    const grad = GRADIENT_MAP[selectedPlan?.color ?? 'blue'];
    return (
      <div className="bg-white border border-border/60 rounded-2xl shadow-sm flex flex-col items-center justify-center py-24 gap-6">
        <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg`}>
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-foreground">{memberName} is enrolled!</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Added to <span className="font-bold text-foreground">{selectedPlan?.name}</span>
            {familyMembers.filter(f => f.name.trim()).length > 0 &&
              ` with ${familyMembers.filter(f => f.name.trim()).length} family member(s)`
            }
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          Redirecting to Members…
        </div>
      </div>
    );
  }

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="space-y-5">

      {/* ── Header + progress ──────────────────────────────────────────── */}
      <Card className="p-5 border-border/60 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-black text-foreground">Quick Registration</h2>
            <p className="text-xs text-muted-foreground">Enrol a new member in under a minute</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Step {step} of {STEPS.length}</p>
            <p className="text-sm font-black text-foreground">{STEPS[step - 1].label}</p>
          </div>
        </div>

        {/* Progress track */}
        <div className="space-y-2.5">
          <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between">
            {STEPS.map(s => {
              const Icon = s.icon;
              const done   = step > s.num;
              const active = step === s.num;
              return (
                <div key={s.num} className="flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    done   ? 'bg-emerald-500 text-white' :
                    active ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm' :
                             'bg-muted text-muted-foreground/40'
                  }`}>
                    {done ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wide hidden sm:block ${
                    active ? 'text-foreground' : done ? 'text-emerald-600' : 'text-muted-foreground/40'
                  }`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ── Step card ──────────────────────────────────────────────────── */}
      <Card className="overflow-hidden border-border/60 shadow-sm">

        {/* Step 1: Choose Plan */}
        {step === 1 && (
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-black text-foreground">Select a Membership Plan</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Choose the plan this member will be enrolled in</p>
            </div>

            <SearchInput value={planSearch} onChange={setPlanSearch} placeholder="Search by name or code…" className="w-full" />

            {errors.plan && (
              <p className="text-destructive text-xs font-bold flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-destructive" /> {errors.plan}
              </p>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredPlans.length === 0 ? (
                <p className="text-center py-10 text-muted-foreground text-sm">No active plans found</p>
              ) : filteredPlans.map(plan => {
                const grad = GRADIENT_MAP[plan.color] ?? GRADIENT_MAP.blue;
                const selected = selectedPlan?.id === plan.id;
                const isInd = plan.planCategory === 'individual';
                const TierIcon = plan.planTier ? TIER_ICON[plan.planTier] : null;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => { setSelectedPlan(plan); setErrors({}); }}
                    className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all group ${
                      selected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40 hover:bg-muted/30'
                    }`}
                  >
                    {/* Color swatch */}
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0`}>
                      {isInd ? <User className="w-4 h-4 text-white" /> : <Building2 className="w-4 h-4 text-white" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground truncate">{plan.name}</span>
                        {TierIcon && <TierIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-muted-foreground">{plan.code}</span>
                        <span className="text-[9px] text-muted-foreground/60">·</span>
                        <span className="text-[10px] text-muted-foreground">
                          {isInd ? 'Personal' : plan.companyName}
                        </span>
                        {plan.annualFee && (
                          <>
                            <span className="text-[9px] text-muted-foreground/60">·</span>
                            <span className="text-[10px] font-bold text-emerald-600">₹{plan.annualFee.toLocaleString()}/yr</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Family info */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-bold text-muted-foreground block">
                        {(plan.maxDependents ?? 0) === 0 ? 'Self Only' : `+${plan.maxDependents} family`}
                      </span>
                    </div>

                    {/* Selected indicator */}
                    {selected && <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Member Info */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-base font-black text-foreground">Member Information</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enrolling in <span className="font-bold text-foreground">{selectedPlan?.name}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <LabeledField label="Full Name *" error={errors.name}>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={memberName} onChange={e => setMemberName(e.target.value)} placeholder="e.g. Rajesh Kumar" className="pl-10 rounded-xl" />
                  </div>
                </LabeledField>
              </div>

              <LabeledField label="Phone *" error={errors.phone}>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={memberPhone} onChange={e => setMemberPhone(e.target.value)} placeholder="9876543210" className="pl-10 rounded-xl" />
                </div>
              </LabeledField>

              <LabeledField label="Email">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={memberEmail} onChange={e => setMemberEmail(e.target.value)} placeholder="email@example.com" className="pl-10 rounded-xl" />
                </div>
              </LabeledField>

              <LabeledField label="Date of Birth">
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="date" value={memberDob} onChange={e => setMemberDob(e.target.value)} className="pl-10 rounded-xl" />
                </div>
              </LabeledField>

              <LabeledField label="Gender">
                <div className="flex gap-2">
                  {(['male', 'female', 'other'] as const).map(g => (
                    <button
                      key={g} type="button"
                      onClick={() => setMemberGender(g)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-bold capitalize transition-all ${
                        memberGender === g
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </LabeledField>

              {!isIndividual && (
                <div className="col-span-2">
                  <LabeledField label="Company Name *" error={errors.company}>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Tech Corp Pvt Ltd" className="pl-10 rounded-xl" />
                    </div>
                  </LabeledField>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Special Discount */}
        {step === 3 && (
          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-base font-black text-foreground">Special Discount</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Optionally apply an extra discount for this member only</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {([
                { key: 'none',    label: 'No Discount',  sub: 'Standard plan benefits',   icon: Shield },
                { key: 'percent', label: '% Discount',   sub: 'Additional % off',          icon: Tag },
                { key: 'fixed',   label: '₹ Fixed Off',  sub: 'Fixed ₹ reduction',         icon: Tag },
              ] as { key: 'none' | 'percent' | 'fixed'; label: string; sub: string; icon: React.ComponentType<{ className?: string }> }[]).map(opt => {
                const Icon = opt.icon;
                const sel = discountType === opt.key;
                return (
                  <button
                    key={opt.key} type="button"
                    onClick={() => setDiscountType(opt.key)}
                    className={`flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all ${
                      sel ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${sel ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-sm font-bold ${sel ? 'text-primary' : 'text-foreground'}`}>{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-snug">{opt.sub}</span>
                  </button>
                );
              })}
            </div>

            {discountType !== 'none' && (
              <LabeledField label={discountType === 'percent' ? 'Discount Percentage (%)' : 'Fixed Amount (₹)'}>
                <Input
                  type="number" min="0"
                  value={discountValue}
                  onChange={e => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'percent' ? 'e.g. 5' : 'e.g. 500'}
                  className="rounded-xl w-48 font-bold text-lg"
                />
              </LabeledField>
            )}
          </div>
        )}

        {/* Step 4: Family Members */}
        {step === 4 && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">Family Members</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Plan allows up to <span className="font-bold text-foreground">{maxDependents}</span> family member{maxDependents !== 1 ? 's' : ''}
                </p>
              </div>
              {familyMembers.length < maxDependents && (
                <Button
                  variant="outline" size="sm"
                  onClick={() => setFamilyMembers(p => [...p, blankMember()])}
                  className="gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" /> Add
                </Button>
              )}
            </div>

            {maxDependents === 0 ? (
              <div className="text-center py-10 bg-muted/30 rounded-2xl border border-dashed border-border text-muted-foreground text-sm">
                This plan covers only the primary member.
              </div>
            ) : (
              <div className="space-y-3">
                {familyMembers.map((fm, idx) => (
                  <div key={idx} className="border border-border rounded-2xl p-4 space-y-3 relative bg-muted/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Family Member {idx + 1}</span>
                      <button type="button" onClick={() => setFamilyMembers(p => p.filter((_, i) => i !== idx))} className="text-[11px] text-destructive hover:underline font-bold">Remove</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <LabeledField label="Name *">
                          <Input value={fm.name} onChange={e => setFamilyMembers(p => p.map((m, i) => i === idx ? { ...m, name: e.target.value } : m))} placeholder="Full name" className="rounded-xl" />
                        </LabeledField>
                      </div>
                      <LabeledField label="Relationship">
                        <Select
                          value={fm.relationship}
                          onValueChange={val => setFamilyMembers(p => p.map((m, i) => i === idx ? { ...m, relationship: val } : m))}
                        >
                          <SelectTrigger className="w-full rounded-xl text-sm h-10">
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            {RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </LabeledField>
                      <LabeledField label="Phone">
                        <Input value={fm.phone} onChange={e => setFamilyMembers(p => p.map((m, i) => i === idx ? { ...m, phone: e.target.value } : m))} placeholder="Optional" className="rounded-xl" />
                      </LabeledField>
                    </div>
                  </div>
                ))}
                {familyMembers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-2xl">
                    Click "Add" to include family members
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Confirm */}
        {step === 5 && (
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-black text-foreground">Review & Confirm</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Everything look good? Hit Register to enrol.</p>
            </div>

            {/* Plan summary card */}
            {selectedPlan && (() => {
              const grad = GRADIENT_MAP[selectedPlan.color] ?? GRADIENT_MAP.blue;
              return (
                <div className={`relative rounded-2xl bg-gradient-to-br ${grad} p-4 text-white overflow-hidden`}>
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Membership Plan</p>
                  <p className="text-lg font-black">{selectedPlan.name}</p>
                  <p className="text-sm text-white/70">
                    {selectedPlan.planCategory === 'individual' ? 'Personal Membership' : selectedPlan.companyName}
                    {' · '}{selectedPlan.code}
                  </p>
                </div>
              );
            })()}

            {/* Member summary */}
            <div className="bg-muted/30 rounded-2xl p-4 border border-border space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Primary Member</p>
              <p className="text-sm font-bold text-foreground">{memberName}</p>
              <p className="text-xs text-muted-foreground">{memberPhone}{memberEmail ? ` · ${memberEmail}` : ''}</p>
              {!isIndividual && <p className="text-xs text-muted-foreground">{companyName}</p>}
              {discountType !== 'none' && discountValue && (
                <p className="text-xs font-semibold text-amber-600 mt-1 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Special discount: {discountType === 'percent' ? `${discountValue}%` : `₹${discountValue}`}
                </p>
              )}
            </div>

            {/* Family summary */}
            {familyMembers.filter(f => f.name.trim()).length > 0 && (
              <div className="bg-muted/30 rounded-2xl p-4 border border-border">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                  Family ({familyMembers.filter(f => f.name.trim()).length})
                </p>
                {familyMembers.filter(f => f.name.trim()).map((fm, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border/40 last:border-0">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{fm.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{fm.relationship}</span>
                  </div>
                ))}
              </div>
            )}

            {errors.submit && (
              <p className="text-destructive text-xs font-semibold px-4 py-2.5 bg-destructive/5 rounded-xl border border-destructive/20">
                {errors.submit}
              </p>
            )}
          </div>
        )}

        {/* ── Navigation ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20">
          <Button variant="outline" onClick={back} disabled={step === 1} className="gap-2 rounded-xl">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>

          {step < 5 ? (
            <Button onClick={next} className="gap-2 rounded-xl px-6">
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 rounded-xl px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0 shadow-sm shadow-emerald-200"
            >
              {saving
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><CheckCircle className="w-4 h-4" /> Register Member</>
              }
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
