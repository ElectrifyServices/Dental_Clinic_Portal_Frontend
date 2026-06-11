import React, { useState } from 'react';
import { UserPlus, CheckCircle, Users, Plus, Trash2, User } from 'lucide-react';
import { Modal, Button, Label, Input } from '../../ui';
import { CorporatePlan, CoverageType } from '../../../types';
import { useCreateEmployeeMutation } from '../../../hooks/corporate/useCreateEmployeeMutation';
import { useAddDependentMutation } from '../../../hooks/corporate/useAddDependentMutation';
import { useQueryClient } from '@tanstack/react-query';

interface IndividualMemberFormModalProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  individualPlans: CorporatePlan[];
  onSave: () => void;
}

interface PendingDependent {
  tempId: string;
  name: string;
  relationship: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
}

const EMPTY_PENDING = (): PendingDependent => ({
  tempId: `tmp-${Date.now()}`,
  name: '', relationship: '', dateOfBirth: '', gender: 'male', phone: '',
});

const EMPTY_FORM = () => ({
  name: '',
  phone: '',
  email: '',
  gender: 'male' as const,
  dateOfBirth: '',
  planId: '',
  enrollmentDate: new Date().toISOString().split('T')[0],
  coverageType: 'self' as CoverageType,
});

export function IndividualMemberFormModal({ showForm, setShowForm, individualPlans, onSave }: IndividualMemberFormModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingDependents, setPendingDependents] = useState<PendingDependent[]>([]);
  const [showAddDepForm, setShowAddDepForm] = useState(false);
  const [addDepForm, setAddDepForm] = useState<PendingDependent>(EMPTY_PENDING());

  const createEmployeeMutation = useCreateEmployeeMutation();
  const addDependentMutation = useAddDependentMutation();

  const selectedPlan = individualPlans.find(p => p.id === form.planId);
  const maxDependents = selectedPlan?.maxDependents ?? 0;
  const coverageLimitReached = pendingDependents.length >= maxDependents && maxDependents > 0;

  React.useEffect(() => {
    if (showForm) {
      setForm(EMPTY_FORM());
      setErrors({});
      setPendingDependents([]);
      setShowAddDepForm(false);
    }
  }, [showForm]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.planId) e.planId = 'Select a plan';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleAddDependent = () => {
    if (!addDepForm.name.trim() || !addDepForm.relationship.trim()) return;
    setPendingDependents(prev => [...prev, { ...addDepForm, tempId: `tmp-${Date.now()}` }]);
    setAddDepForm(EMPTY_PENDING());
    setShowAddDepForm(false);
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const empId = `IND-${Date.now()}`;
      const apiResponse = await createEmployeeMutation.mutateAsync({
        name: form.name,
        emp_id: empId,
        phone: form.phone,
        email: form.email || 'noemail@example.com',
        gender: form.gender.toUpperCase(),
        date_of_birth: form.dateOfBirth || '1990-01-01',
        company_name: 'Individual',
        designation: 'Individual Member',
        department: 'Individual',
        corporate_plan_id: form.planId,
        eligible_date: new Date(form.enrollmentDate).toISOString(),
        status: 'ACTIVE',
        coverage_type: form.coverageType === 'family' ? 'FAMILY' : 'SELF',
      });

      const newMemberId = apiResponse?.id || empId;

      for (const dep of pendingDependents) {
        await addDependentMutation.mutateAsync({
          memberId: newMemberId,
          name: dep.name,
          relationship: dep.relationship,
          dateOfBirth: dep.dateOfBirth || undefined,
          gender: dep.gender,
          phone: dep.phone || undefined,
          corporatePlanId: form.planId || undefined,
          primaryMemberName: form.name || undefined,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['corporatePlans'] });
      onSave();
      setShowForm(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to register member';
      setErrors(prev => ({ ...prev, submit: Array.isArray(msg) ? msg.join(', ') : msg }));
    }
  };

  if (!showForm) return null;

  return (
    <Modal
      title="Register Individual Plan Member"
      onClose={() => setShowForm(false)}
      size="2xl"
      icon={<UserPlus className="w-4 h-4" />}
      footer={
        <div className="flex flex-col gap-3 w-full">
          {errors.submit && (
            <p className="text-red-500 text-xs font-bold px-4 py-2.5 bg-red-50 rounded-xl border border-red-200">
              {errors.submit}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} className="gap-2" disabled={createEmployeeMutation.isPending}>
              {createEmployeeMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><CheckCircle className="w-4 h-4" /> Register Member</>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Personal Info */}
        <div>
          <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 block">Personal Information</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Full Name *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Full name" className="rounded-xl" />
              {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Phone *</Label>
              <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="Phone number" className="rounded-xl" />
              {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>}
            </div>
            <div>
              <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Email</Label>
              <Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="Email (optional)" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Date of Birth</Label>
              <Input type="date" value={form.dateOfBirth} onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))}
                className="rounded-xl" />
            </div>
            <div>
              <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Gender</Label>
              <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value as any }))}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-background font-medium">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Enrollment Date</Label>
              <Input type="date" value={form.enrollmentDate} onChange={e => setForm(p => ({ ...p, enrollmentDate: e.target.value }))}
                className="rounded-xl" />
            </div>
          </div>
        </div>

        {/* Plan Selection */}
        <div>
          <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 block">Plan</Label>
          <select value={form.planId} onChange={e => setForm(p => ({ ...p, planId: e.target.value, coverageType: 'self' }))}
            className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-background font-medium">
            <option value="">Select individual plan...</option>
            {individualPlans.filter(p => p.isActive).map(p => (
              <option key={p.id} value={p.id}>
                {p.name} — ₹{p.annualFee?.toLocaleString() ?? '1,000'}/year{p.maxDependents ? ` (+${p.maxDependents} pax)` : ''}
              </option>
            ))}
          </select>
          {errors.planId && <p className="text-red-500 text-[10px] mt-1">{errors.planId}</p>}
          {selectedPlan && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectedPlan.benefits.map(b => (
                <span key={b.id} className="text-[9px] font-black px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wide">
                  {b.description}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Coverage Type + Dependents */}
        {maxDependents > 0 && (
          <div className="border border-border rounded-2xl overflow-hidden">
            <div className="p-4 bg-muted/20">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 block">Coverage</Label>
              <div className="flex gap-3">
                {(['self', 'family'] as CoverageType[]).map(ct => (
                  <button key={ct} type="button"
                    onClick={() => setForm(p => ({ ...p, coverageType: ct }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                      form.coverageType === ct
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    {ct === 'self' ? 'Self Only' : '+ Family Members'}
                  </button>
                ))}
              </div>
            </div>

            {form.coverageType === 'family' && (
              <div className="p-4 space-y-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Family Members</Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{pendingDependents.length} / {maxDependents} added</p>
                  </div>
                  {!coverageLimitReached && !showAddDepForm && (
                    <Button variant="outline" size="sm" onClick={() => { setShowAddDepForm(true); setAddDepForm(EMPTY_PENDING()); }} className="gap-1.5 text-xs">
                      <UserPlus className="w-3.5 h-3.5" /> Add Member
                    </Button>
                  )}
                </div>

                {pendingDependents.map(dep => (
                  <div key={dep.tempId} className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{dep.name}</p>
                        <p className="text-[10px] text-muted-foreground">{dep.relationship}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-xl"
                      onClick={() => setPendingDependents(prev => prev.filter(d => d.tempId !== dep.tempId))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {showAddDepForm && (
                  <div className="border border-primary/30 bg-primary/5 rounded-2xl p-4 space-y-3">
                    <Label className="text-[10px] font-black text-primary uppercase tracking-widest">Add Family Member</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Name *</Label>
                        <Input value={addDepForm.name} onChange={e => setAddDepForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="Full name" className="rounded-xl text-sm" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Relationship *</Label>
                        <Input value={addDepForm.relationship} onChange={e => setAddDepForm(p => ({ ...p, relationship: e.target.value }))}
                          placeholder="e.g. Spouse, Child, Parent" className="rounded-xl text-sm" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Date of Birth</Label>
                        <Input type="date" value={addDepForm.dateOfBirth} onChange={e => setAddDepForm(p => ({ ...p, dateOfBirth: e.target.value }))}
                          className="rounded-xl text-sm" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Phone</Label>
                        <Input value={addDepForm.phone} onChange={e => setAddDepForm(p => ({ ...p, phone: e.target.value }))}
                          placeholder="Optional" className="rounded-xl text-sm" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddDependent} className="gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Add
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddDepForm(false)}>Cancel</Button>
                    </div>
                  </div>
                )}

                {coverageLimitReached && (
                  <p className="text-[11px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                    Maximum {maxDependents} dependent{maxDependents !== 1 ? 's' : ''} allowed for this plan.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
