import React, { useState, useEffect } from 'react';
import { User, CheckCircle, Users, Plus, Trash2, UserPlus } from 'lucide-react';
import {
  Modal,
  Button,
  SectionRenderer,
  Label,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui';
import { CorporateEmployee, CorporatePlan, PlanDependent, CoverageType } from '../../../types';
import { useFormConfig } from '../../../hooks/useFormConfig';
import { useCreateEmployeeMutation } from '../../../hooks/corporate/useCreateEmployeeMutation';
import { useUpdateEmployeeMutation } from '../../../hooks/corporate/useUpdateEmployeeMutation';
import { useEmployeeQuery } from '../../../hooks/corporate/useEmployeeQuery';
import { useDependentsQuery } from '../../../hooks/corporate/useDependentsQuery';
import { useAddDependentMutation } from '../../../hooks/corporate/useAddDependentMutation';
import { useRemoveDependentMutation } from '../../../hooks/corporate/useRemoveDependentMutation';
import { useQueryClient } from '@tanstack/react-query';

interface EmployeeFormModalProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  editEmp: CorporateEmployee | null;
  activePlans: CorporatePlan[];
  onSave: (emp: CorporateEmployee) => void;
  refetch: () => void;
}

const EMPTY_EMP = (): Partial<CorporateEmployee> => ({
  employeeId: '', name: '', phone: '', email: '', gender: 'male',
  dateOfBirth: '', designation: '', department: '',
  companyName: '', corporatePlanId: '', corporatePlanName: '',
  eligible_date: new Date().toISOString().split('T')[0],
  isActive: true,
  coverageType: 'self',
});

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

export function EmployeeFormModal({ showForm, setShowForm, editEmp, activePlans, onSave, refetch }: EmployeeFormModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<CorporateEmployee>>(EMPTY_EMP());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [pendingDependents, setPendingDependents] = useState<PendingDependent[]>([]);
  const [showAddDepForm, setShowAddDepForm] = useState(false);
  const [addDepForm, setAddDepForm] = useState<PendingDependent>(EMPTY_PENDING());

  const todayStr = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const isDateInPast = React.useMemo(() => {
    if (!form.eligible_date) return false;
    return form.eligible_date < todayStr;
  }, [form.eligible_date, todayStr]);

  const empCfg = useFormConfig('employee');
  const createEmployeeMutation = useCreateEmployeeMutation();
  const updateEmployeeMutation = useUpdateEmployeeMutation();
  const addDependentMutation = useAddDependentMutation();
  const removeDependentMutation = useRemoveDependentMutation();

  const { data: employeeDetails, isLoading: isFetching } = useEmployeeQuery(editEmp?.id || undefined, {
    enabled: showForm && !!editEmp?.id,
  });

  const { data: existingDependents, refetch: refetchDependents } = useDependentsQuery(
    showForm && editEmp?.id ? editEmp.id : undefined
  );

  const selectedPlan = React.useMemo(
    () => activePlans.find(p => p.id === form.corporatePlanId),
    [activePlans, form.corporatePlanId]
  );

  const maxDependents = selectedPlan?.maxDependents ?? 0;
  const totalDependents = (existingDependents?.length ?? 0) + pendingDependents.length;

  const empCfgAny = empCfg as any;
  const personalSection = empCfg.sections?.find(s => s.id === 'personal');
  const employmentSection = empCfg.sections?.find(s => s.id === 'employment');
  const eligibilitySection = empCfg.sections?.find(s => s.id === 'eligibility');

  useEffect(() => {
    if (showForm) {
      if (editEmp) {
        if (employeeDetails) {
          const empData = employeeDetails.data || employeeDetails;
          const plan = activePlans.find(p => p.id === (empData.corporate_plan?.id || empData.corporate_plan_id));
          setForm({
            id: empData.id,
            employeeId: empData.emp_id || '',
            name: empData.name || '',
            phone: empData.phone || '',
            email: empData.email || '',
            gender: empData.gender?.toLowerCase() || 'male',
            dateOfBirth: empData.date_of_birth ? empData.date_of_birth.split('T')[0] : '',
            designation: empData.designation || '',
            department: empData.department || '',
            companyName: empData.company_name || '',
            corporatePlanId: empData.corporate_plan?.id || empData.corporate_plan_id || '',
            corporatePlanName: empData.corporate_plan?.plan_name || plan?.name || '',
            enrolledAt: empData.created_at || editEmp.enrolledAt || '',
            eligible_date: empData.eligible_date ? empData.eligible_date.split('T')[0] : '',
            isActive: empData.status === 'ACTIVE',
            patientId: empData.patient_id || editEmp.patientId,
            coverageType: (empData.coverage_type?.toLowerCase() || editEmp.coverageType || 'self') as CoverageType,
          });
        } else {
          setForm({ ...editEmp });
        }
      } else {
        setForm(EMPTY_EMP());
        setPendingDependents([]);
      }
      setFormErrors({});
      setShowAddDepForm(false);
    }
  }, [showForm, editEmp, employeeDetails, activePlans]);

  const handleFormChange = (name: string, value: any) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const planOptions = React.useMemo(() => {
    const list = activePlans
      .filter(p => p.isActive)
      .map(p => ({ value: p.id, label: `${p.name} (${p.companyName})` }));

    if (form.corporatePlanId && !list.some(p => p.value === form.corporatePlanId)) {
      const plan = activePlans.find(p => p.id === form.corporatePlanId);
      if (plan) {
        list.push({ value: plan.id, label: `${plan.name} (${plan.companyName})` });
      } else if (form.corporatePlanName) {
        list.push({ value: form.corporatePlanId, label: `${form.corporatePlanName} (${form.companyName || 'Current Plan'})` });
      } else {
        list.push({ value: form.corporatePlanId, label: `Current Plan (${form.corporatePlanId.slice(0, 8)})` });
      }
    }
    return list;
  }, [activePlans, form.corporatePlanId, form.corporatePlanName, form.companyName]);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.name?.trim()) errs.name = 'Required';
    if (!form.phone?.trim()) errs.phone = 'Required';
    if (!form.corporatePlanId) errs.corporatePlanId = 'Assign a corporate plan';
    setFormErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleAddDependent = () => {
    if (!addDepForm.name.trim() || !addDepForm.relationship.trim()) {
      return;
    }
    if (editEmp?.id) {
      // Live save for existing employees
      addDependentMutation.mutateAsync({
        memberId: editEmp.id,
        name: addDepForm.name,
        relationship: addDepForm.relationship,
        dateOfBirth: addDepForm.dateOfBirth || undefined,
        gender: addDepForm.gender,
        phone: addDepForm.phone || undefined,
        corporatePlanId: form.corporatePlanId || undefined,
        primaryMemberName: form.name || undefined,
      }).then(() => {
        refetchDependents();
        setAddDepForm(EMPTY_PENDING());
        setShowAddDepForm(false);
      });
    } else {
      // Queue for after employee is created
      setPendingDependents(prev => [...prev, { ...addDepForm, tempId: `tmp-${Date.now()}` }]);
      setAddDepForm(EMPTY_PENDING());
      setShowAddDepForm(false);
    }
  };

  const handleRemoveExistingDependent = async (depId: string) => {
    await removeDependentMutation.mutateAsync({ id: depId });
    refetchDependents();
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const plan = activePlans.find(p => p.id === form.corporatePlanId);
    const companyNameVal = plan?.companyName || 'Individual';
    const coverageTypeVal = form.coverageType === 'family' ? 'FAMILY' : 'SELF';

    if (!editEmp) {
      try {
        const transformedBody = {
          name: form.name!,
          emp_id: form.employeeId || `EMP${Date.now().toString().slice(-5)}`,
          phone: form.phone!,
          email: form.email || "noemail@example.com",
          gender: (form.gender || "male").toUpperCase(),
          date_of_birth: form.dateOfBirth || "1990-01-01",
          company_name: companyNameVal,
          designation: form.designation || "Employee",
          department: form.department || "General",
          corporate_plan_id: form.corporatePlanId!,
          eligible_date: form.eligible_date ? new Date(form.eligible_date).toISOString() : new Date().toISOString(),
          status: form.isActive !== false ? "ACTIVE" : "INACTIVE",
          coverage_type: coverageTypeVal as 'SELF' | 'FAMILY',
        };

        const apiResponse = await createEmployeeMutation.mutateAsync(transformedBody);
        const newEmpId = apiResponse?.id || `EMP-${Date.now()}`;

        // Save pending dependents
        for (const dep of pendingDependents) {
          await addDependentMutation.mutateAsync({
            memberId: newEmpId,
            name: dep.name,
            relationship: dep.relationship,
            dateOfBirth: dep.dateOfBirth || undefined,
            gender: dep.gender,
            phone: dep.phone || undefined,
            corporatePlanId: form.corporatePlanId || undefined,
            primaryMemberName: form.name || undefined,
          });
        }

        const emp: CorporateEmployee = {
          id: newEmpId,
          employeeId: form.employeeId || apiResponse?.emp_id || '',
          name: form.name!,
          phone: form.phone!,
          email: form.email || '',
          gender: form.gender || 'male',
          dateOfBirth: form.dateOfBirth || '',
          designation: form.designation || '',
          department: form.department || '',
          companyName: companyNameVal,
          corporatePlanId: form.corporatePlanId!,
          corporatePlanName: plan?.name || '',
          enrolledAt: new Date().toISOString(),
          eligible_date: form.eligible_date || apiResponse?.eligible_date || '',
          isActive: form.isActive !== false,
          patientId: undefined,
          coverageType: form.coverageType || 'self',
        };
        onSave(emp);
        queryClient.invalidateQueries({ queryKey: ["corporatePlans"] });
        queryClient.invalidateQueries({ queryKey: ["employees"] });
        queryClient.invalidateQueries({ queryKey: ["companies"] });
        refetch();
        setShowForm(false);
      } catch (err: any) {
        const apiError = err?.response?.data?.responseStatusList?.statusList?.[0]?.statusDesc ||
                         err?.response?.data?.statusDesc ||
                         err?.response?.data?.message ||
                         err?.status?.statusDesc ||
                         err?.message ||
                         "Failed to create employee on backend";
        const msg = Array.isArray(apiError) ? apiError.join(', ') : apiError;
        setFormErrors(prev => ({ ...prev, submit: msg }));
      }
    } else {
      try {
        const transformedBody = {
          id: editEmp.id,
          name: form.name!,
          emp_id: form.employeeId || '',
          phone: form.phone!,
          email: form.email || "noemail@example.com",
          gender: (form.gender || "male").toUpperCase(),
          date_of_birth: form.dateOfBirth || "1990-01-01",
          company_name: companyNameVal,
          designation: form.designation || "Employee",
          department: form.department || "General",
          corporate_plan_id: form.corporatePlanId!,
          eligible_date: form.eligible_date ? new Date(form.eligible_date).toISOString() : new Date().toISOString(),
          status: form.isActive !== false ? "ACTIVE" : "INACTIVE",
          coverage_type: coverageTypeVal as 'SELF' | 'FAMILY',
        };

        await updateEmployeeMutation.mutateAsync(transformedBody);

        const emp: CorporateEmployee = {
          id: editEmp.id,
          employeeId: form.employeeId || '',
          name: form.name!,
          phone: form.phone!,
          email: form.email || '',
          gender: form.gender || 'male',
          dateOfBirth: form.dateOfBirth || '',
          designation: form.designation || '',
          department: form.department || '',
          companyName: companyNameVal,
          corporatePlanId: form.corporatePlanId!,
          corporatePlanName: plan?.name || '',
          enrolledAt: editEmp?.enrolledAt || new Date().toISOString(),
          eligible_date: form.eligible_date || editEmp?.eligible_date || '',
          isActive: form.isActive !== false,
          patientId: editEmp?.patientId || undefined,
          coverageType: form.coverageType || 'self',
        };
        onSave(emp);
        queryClient.invalidateQueries({ queryKey: ["corporatePlans"] });
        queryClient.invalidateQueries({ queryKey: ["employees"] });
        queryClient.invalidateQueries({ queryKey: ["companies"] });
        refetch();
        setShowForm(false);
      } catch (err: any) {
        const apiError = err?.response?.data?.responseStatusList?.statusList?.[0]?.statusDesc ||
                         err?.response?.data?.statusDesc ||
                         err?.response?.data?.message ||
                         err?.status?.statusDesc ||
                         err?.message ||
                         "Failed to update employee on backend";
        const msg = Array.isArray(apiError) ? apiError.join(', ') : apiError;
        setFormErrors(prev => ({ ...prev, submit: msg }));
      }
    }
  };

  if (!showForm) return null;

  const coverageLimitReached = totalDependents >= maxDependents && maxDependents > 0;

  return (
    <Modal
      title={editEmp ? (empCfgAny.title?.edit ?? 'Edit Member') : (empCfgAny.title?.create ?? 'Add Member')}
      onClose={() => setShowForm(false)}
      size="2xl"
      icon={<User className="w-4 h-4" />}
      footer={
        <div className="flex flex-col gap-3 w-full">
          {formErrors.submit && (
            <p className="text-red-500 text-xs font-bold text-left px-4 py-2.5 bg-red-50 rounded-xl border border-red-200">
              {formErrors.submit}
            </p>
          )}
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} className="gap-2 shadow-lg shadow-primary/10" disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}>
              {(createEmployeeMutation.isPending || updateEmployeeMutation.isPending) ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> {editEmp ? (empCfgAny.submitLabel?.edit ?? 'Save Changes') : (empCfgAny.submitLabel?.create ?? 'Register Member')}
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 relative min-h-[200px]">
        {isFetching && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 z-50 rounded-2xl transition-all duration-300">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-md" />
            <p className="text-xs font-bold text-primary tracking-wide animate-pulse">Loading employee details from API...</p>
          </div>
        )}
        {personalSection && (
          <SectionRenderer
            section={personalSection}
            values={form}
            onChange={handleFormChange}
            errors={formErrors}
            cols={2}
          />
        )}
        {employmentSection && (
          <SectionRenderer
            section={employmentSection}
            values={form}
            onChange={handleFormChange}
            errors={formErrors}
            dynamicOptions={{ corporatePlanId: planOptions }}
            cols={2}
          />
        )}
        {eligibilitySection && (
          <SectionRenderer
            section={eligibilitySection}
            values={form}
            onChange={handleFormChange}
            errors={formErrors}
            cols={2}
          />
        )}

        {/* Coverage Type + Dependents — only shown when plan allows dependents */}
        {maxDependents > 0 && (
          <div className="border border-border rounded-2xl overflow-hidden">
            {/* Coverage toggle */}
            <div className="p-4 bg-muted/20">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 block">Coverage Type</Label>
              <div className="flex gap-3">
                {(['self', 'family'] as CoverageType[]).map(ct => (
                  <Button
                    key={ct}
                    type="button"
                    variant="outline"
                    onClick={() => setForm(prev => ({ ...prev, coverageType: ct }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                      form.coverageType === ct
                        ? 'border-primary bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    {ct === 'self' ? 'Self Only' : '+ Family Members'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Dependents list */}
            {form.coverageType === 'family' && (
              <div className="p-4 space-y-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Family Members
                    </Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {totalDependents} / {maxDependents} added
                    </p>
                  </div>
                  {!coverageLimitReached && !showAddDepForm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setShowAddDepForm(true); setAddDepForm(EMPTY_PENDING()); }}
                      className="gap-1.5 text-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Add Member
                    </Button>
                  )}
                </div>

                {/* Existing (saved) dependents */}
                {existingDependents && existingDependents.length > 0 && (
                  <div className="space-y-2">
                    {existingDependents.map((dep: PlanDependent) => (
                      <div key={dep.id} className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3 border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{dep.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {dep.relationship}{dep.dateOfBirth ? ` • ${dep.dateOfBirth}` : ''}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 rounded-xl"
                          onClick={() => handleRemoveExistingDependent(dep.id)}
                          disabled={removeDependentMutation.isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pending (not yet saved) dependents */}
                {pendingDependents.length > 0 && (
                  <div className="space-y-2">
                    {pendingDependents.map(dep => (
                      <div key={dep.tempId} className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{dep.name}</p>
                            <p className="text-[10px] text-amber-600 font-medium">{dep.relationship} • Pending save</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 rounded-xl"
                          onClick={() => setPendingDependents(prev => prev.filter(d => d.tempId !== dep.tempId))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add dependent inline form */}
                {showAddDepForm && (
                  <div className="border border-primary/30 bg-primary/5 rounded-2xl p-4 space-y-3">
                    <Label className="text-[10px] font-black text-primary uppercase tracking-widest">Add Family Member</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Name *</Label>
                        <Input
                          value={addDepForm.name}
                          onChange={e => setAddDepForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="Full name"
                          className="rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Relationship *</Label>
                        <Input
                          value={addDepForm.relationship}
                          onChange={e => setAddDepForm(p => ({ ...p, relationship: e.target.value }))}
                          placeholder="e.g. Spouse, Child, Parent"
                          className="rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Date of Birth</Label>
                        <Input
                          type="date"
                          value={addDepForm.dateOfBirth}
                          onChange={e => setAddDepForm(p => ({ ...p, dateOfBirth: e.target.value }))}
                          className="rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Phone</Label>
                        <Input
                          value={addDepForm.phone}
                          onChange={e => setAddDepForm(p => ({ ...p, phone: e.target.value }))}
                          placeholder="Optional"
                          className="rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Gender</Label>
                        <Select
                          value={addDepForm.gender}
                          onValueChange={value => setAddDepForm(p => ({ ...p, gender: value as any }))}
                        >
                          <SelectTrigger className="rounded-xl text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={handleAddDependent} className="gap-1.5" disabled={addDependentMutation.isLoading}>
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

        <div className="p-4 bg-muted/30 rounded-2xl border border-border flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${form.isActive !== false ? 'bg-emerald-500' : 'bg-muted-foreground animate-pulse'}`} />
              <Label htmlFor="empActive" className={`text-xs font-black uppercase tracking-widest ${isDateInPast ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground cursor-pointer'}`}>Active Status</Label>
            </div>
            <Label className={`relative inline-flex items-center ${isDateInPast ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
              <Input type="checkbox" id="empActive" checked={form.isActive !== false} className="sr-only peer"
                disabled={isDateInPast}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </Label>
          </div>
          {isDateInPast && (
            <p className="text-[10px] text-rose-500 font-semibold">
              * Cannot change status when eligibility date is in the past.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
