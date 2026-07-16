import React, { useState } from 'react';
import { UserPlus, CheckCircle, Users, Plus, Trash2, User, Edit } from 'lucide-react';
import {
  Modal,
  Button,
  Label,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui';
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
  const [editingDepId, setEditingDepId] = useState<string | null>(null);

  const createEmployeeMutation = useCreateEmployeeMutation();
  const addDependentMutation = useAddDependentMutation();

  const selectedPlan = individualPlans.find(p => p.id === form.planId);
  const maxDependents = selectedPlan ? (Number((selectedPlan as any).family_coverage_limit) || Number((selectedPlan as any).familyCoverageLimit) || Number(selectedPlan.limit) || Number(selectedPlan.maxDependents) || 0) : 0;
  const coverageLimitReached = pendingDependents.length >= maxDependents && maxDependents > 0;

  React.useEffect(() => {
    if (showForm) {
      setForm(EMPTY_FORM());
      setErrors({});
      setPendingDependents([]);
      setShowAddDepForm(false);
      setEditingDepId(null);
    }
  }, [showForm]);

  React.useEffect(() => {
    if (showForm) {
      const formsCount = Math.max(0, maxDependents - 1);
      setPendingDependents(prev => {
        if (prev.length === formsCount) return prev;
        const newArr = [...prev];
        if (newArr.length > formsCount) {
          return newArr.slice(0, formsCount);
        } else {
          const needed = formsCount - newArr.length;
          for (let i = 0; i < needed; i++) {
            newArr.push({
              tempId: `tmp-${Date.now()}-${newArr.length + i}`,
              name: '',
              relationship: '',
              dateOfBirth: '',
              gender: 'male',
              phone: ''
            });
          }
          return newArr;
        }
      });
    }
  }, [maxDependents, showForm]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.planId) e.planId = 'Select a plan';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleAddDependent = () => {};
  const handleEditDependent = () => {};

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const payload: any = {
        name: form.name,
        phone: form.phone,
        plan_id: form.planId,
        status: 'ACTIVE',
      };

      const validDependents = pendingDependents.filter(dep => dep.name && dep.relationship);
      if (validDependents.length > 0) {
        payload.family_members = validDependents.map(dep => ({
          name: dep.name,
          relationship_type: dep.relationship.toUpperCase(),
          phone: dep.phone || undefined
        }));
      }

      await createEmployeeMutation.mutateAsync(payload);

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
              <Input value={form.phone} onChange={e => {
                setForm(p => ({ ...p, phone: e.target.value.replace(/[a-zA-Z]/g, "") }));
              }}
                placeholder="Phone number" className="rounded-xl" />
              {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>}
            </div>
            {/* <div>
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
              <Select value={form.gender} onValueChange={value => setForm(p => ({ ...p, gender: value as any }))}>
                <SelectTrigger className="rounded-xl text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
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
          <Select value={form.planId} onValueChange={value => setForm(p => ({ ...p, planId: value, coverageType: 'self' }))}>
            <SelectTrigger className="rounded-xl text-sm">
              <SelectValue placeholder="Select individual plan..." />
            </SelectTrigger>
            <SelectContent>
              {individualPlans.filter(p => p.isActive).map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} — ₹{p.annualFee?.toLocaleString() ?? '1,000'}/year{p.maxDependents ? ` (+${p.maxDependents} pax)` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        {/* Dependents */}
        {maxDependents > 0 && pendingDependents.length > 0 && (
          <div className="border border-border rounded-2xl overflow-hidden">
              <div className="p-4 space-y-4 bg-muted/5">
                <div>
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Family Members (Optional)</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Fill details below to add family members to this plan.</p>
                </div>

                {pendingDependents.map((dep, index) => (
                  <div key={dep.tempId} className="border border-primary/20 bg-white rounded-2xl p-4 shadow-sm space-y-3">
                    <Label className="text-[10px] font-black text-primary uppercase tracking-widest">Dependent {index + 1}</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Name</Label>
                        <Input value={dep.name} onChange={e => {
                          const val = e.target.value;
                          setPendingDependents(prev => prev.map((d, i) => i === index ? { ...d, name: val } : d));
                        }} placeholder="Full name" className="rounded-xl text-sm" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Relationship</Label>
                        <Select value={dep.relationship} onValueChange={val => {
                          setPendingDependents(prev => prev.map((d, i) => i === index ? { ...d, relationship: val } : d));
                        }}>
                          <SelectTrigger className="rounded-xl text-sm h-10 bg-white">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Spouse">Spouse</SelectItem>
                            <SelectItem value="Child">Child</SelectItem>
                            <SelectItem value="Parent">Parent</SelectItem>
                            <SelectItem value="Sibling">Sibling</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Phone</Label>
                        <Input value={dep.phone} onChange={e => {
                          setPendingDependents(prev => prev.map((d, i) => i === index ? { ...d, phone: e.target.value.replace(/[a-zA-Z]/g, "") } : d));
                        }} placeholder="Optional" className="rounded-xl text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
