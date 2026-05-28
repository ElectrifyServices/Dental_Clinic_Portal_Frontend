import React, { useState, useEffect } from 'react';
import { User, CheckCircle } from 'lucide-react';
import { Modal, Button, SectionRenderer } from '../../ui';
import { CorporateEmployee, CorporatePlan } from '../../../types';
import { useFormConfig } from '../../../hooks/useFormConfig';
import { useCreateEmployeeMutation } from '../../../hooks/corporate/useCreateEmployeeMutation';
import { useUpdateEmployeeMutation } from '../../../hooks/corporate/useUpdateEmployeeMutation';
import { useEmployeeQuery } from '../../../hooks/corporate/useEmployeeQuery';

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
});

export function EmployeeFormModal({ showForm, setShowForm, editEmp, activePlans, onSave, refetch }: EmployeeFormModalProps) {
  const [form, setForm] = useState<Partial<CorporateEmployee>>(EMPTY_EMP());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const empCfg = useFormConfig('employee');
  const createEmployeeMutation = useCreateEmployeeMutation();
  const updateEmployeeMutation = useUpdateEmployeeMutation();

  // Fetch detailed employee data from backend GET /employee/:id when editing
  const { data: employeeDetails, isLoading: isFetching } = useEmployeeQuery(editEmp?.id || undefined, {
    enabled: showForm && !!editEmp?.id,
  });
  
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
          });
        } else {
          setForm({ ...editEmp });
        }
      } else {
        setForm(EMPTY_EMP());
      }
      setFormErrors({});
    }
  }, [showForm, editEmp, employeeDetails, activePlans]);

  const handleFormChange = (name: string, value: any) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const planOptions = React.useMemo(() => {
    const list = activePlans
      .filter(p => p.isActive)
      .map(p => ({ value: p.id, label: `${p.name} (${p.companyName})` }));

    // If the employee's current plan is not in the active list (e.g. it is inactive), 
    // append it so that the user sees the plan name rather than the UUID.
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
    if (!form.companyName?.trim()) errs.companyName = 'Required';
    if (!form.corporatePlanId) errs.corporatePlanId = 'Assign a corporate plan';
    setFormErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const plan = activePlans.find(p => p.id === form.corporatePlanId);
    
    if (!editEmp) {
      try {
        const transformedBody = {
          name: form.name!,
          emp_id: form.employeeId || `EMP${Date.now().toString().slice(-5)}`,
          phone: form.phone!,
          email: form.email || "noemail@example.com",
          gender: (form.gender || "male").toUpperCase(),
          date_of_birth: form.dateOfBirth || "1990-01-01",
          company_name: form.companyName!,
          designation: form.designation || "Employee",
          department: form.department || "General",
          corporate_plan_id: form.corporatePlanId!,
          eligible_date: form.eligible_date ? new Date(form.eligible_date).toISOString() : new Date().toISOString(),
          status: form.isActive !== false ? "ACTIVE" : "INACTIVE",
        };

        const apiResponse = await createEmployeeMutation.mutateAsync(transformedBody);
        
        const emp: CorporateEmployee = {
          id: apiResponse?.id || `EMP-${Date.now()}`,
          employeeId: form.employeeId || apiResponse?.emp_id || '',
          name: form.name!,
          phone: form.phone!,
          email: form.email || '',
          gender: form.gender || 'male',
          dateOfBirth: form.dateOfBirth || '',
          designation: form.designation || '',
          department: form.department || '',
          companyName: form.companyName!,
          corporatePlanId: form.corporatePlanId!,
          corporatePlanName: plan?.name || '',
          enrolledAt: editEmp?.enrolledAt || new Date().toISOString(),
          eligible_date: form.eligible_date || apiResponse?.eligible_date || '',
          isActive: form.isActive !== false,
          patientId: editEmp?.patientId || undefined,
        };
        onSave(emp);
        refetch();
        setShowForm(false);
      } catch (err: any) {
        console.error("Failed to create employee via API:", err);
        setFormErrors(prev => ({
          ...prev,
          submit: err?.response?.data?.message || err?.message || "Failed to create employee on backend"
        }));
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
          company_name: form.companyName!,
          designation: form.designation || "Employee",
          department: form.department || "General",
          corporate_plan_id: form.corporatePlanId!,
          eligible_date: form.eligible_date ? new Date(form.eligible_date).toISOString() : new Date().toISOString(),
          status: form.isActive !== false ? "ACTIVE" : "INACTIVE",
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
          companyName: form.companyName!,
          corporatePlanId: form.corporatePlanId!,
          corporatePlanName: plan?.name || '',
          enrolledAt: editEmp?.enrolledAt || new Date().toISOString(),
          eligible_date: form.eligible_date || editEmp?.eligible_date || '',
          isActive: form.isActive !== false,
          patientId: editEmp?.patientId || undefined,
        };
        onSave(emp);
        refetch();
        setShowForm(false);
      } catch (err: any) {
        console.error("Failed to update employee via API:", err);
        setFormErrors(prev => ({
          ...prev,
          submit: err?.response?.data?.message || err?.message || "Failed to update employee on backend"
        }));
      }
    }
  };

  if (!showForm) return null;

  return (
    <Modal
      title={editEmp ? (empCfgAny.title?.edit ?? 'Edit Employee') : (empCfgAny.title?.create ?? 'Add Employee')}
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
            <Button onClick={handleSave} className="gap-2 shadow-lg shadow-primary/10" disabled={createEmployeeMutation.isLoading || updateEmployeeMutation.isLoading}>
              {(createEmployeeMutation.isLoading || updateEmployeeMutation.isLoading) ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> {editEmp ? (empCfgAny.submitLabel?.edit ?? 'Update Details') : (empCfgAny.submitLabel?.create ?? 'Register Employee')}
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
        <div className="p-4 bg-muted/30 rounded-2xl border border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${form.isActive !== false ? 'bg-emerald-500' : 'bg-muted-foreground animate-pulse'}`} />
            <label htmlFor="empActive" className="text-xs font-black uppercase tracking-widest text-foreground cursor-pointer">Active Status</label>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="empActive" checked={form.isActive !== false} className="sr-only peer"
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    </Modal>
  );
}
