import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { Modal, Button, Badge, LabeledField } from '../../ui';
import { CorporateEmployee, CorporatePlan } from '../../../types';
import { useUpdateEmployeeMutation } from '../../../hooks/corporate/useUpdateEmployeeMutation';
import { useQueryClient } from '@tanstack/react-query';

interface ChangePlanModalProps {
  changePlanEmp: CorporateEmployee | null;
  setChangePlanEmp: (emp: CorporateEmployee | null) => void;
  activePlans: CorporatePlan[];
  refetch: () => void;
}

export function ChangePlanModal({ changePlanEmp, setChangePlanEmp, activePlans, refetch }: ChangePlanModalProps) {
  const queryClient = useQueryClient();
  const [newPlanId, setNewPlanId] = useState('');
  const updateEmployeeMutation = useUpdateEmployeeMutation();

  useEffect(() => {
    if (changePlanEmp) {
      setNewPlanId(changePlanEmp.corporatePlanId);
    }
  }, [changePlanEmp]);

  const handleChangePlan = async () => {
    if (!changePlanEmp || !newPlanId) return;
    const plan = activePlans.find(p => p.id === newPlanId);
    if (!plan) return;

    try {
      const transformedBody = {
        id: changePlanEmp.id,
        name: changePlanEmp.name,
        emp_id: changePlanEmp.employeeId || '',
        phone: changePlanEmp.phone,
        email: changePlanEmp.email || "noemail@example.com",
        gender: (changePlanEmp.gender || "male").toUpperCase(),
        date_of_birth: changePlanEmp.dateOfBirth || "1990-01-01",
        company_name: changePlanEmp.companyName,
        designation: changePlanEmp.designation || "Employee",
        department: changePlanEmp.department || "General",
        corporate_plan_id: newPlanId,
        eligible_date: changePlanEmp.eligible_date || new Date().toISOString(),
        status: changePlanEmp.isActive ? "ACTIVE" : "INACTIVE",
      };

      await updateEmployeeMutation.mutateAsync(transformedBody);
      queryClient.invalidateQueries({ queryKey: ["corporatePlans"] });
      refetch();
      setChangePlanEmp(null);
    } catch (err) {
      console.error("Failed to change plan", err);
    }
  };

  if (!changePlanEmp) return null;

  return (
    <Modal 
      title="Update Corporate Health Plan" 
      onClose={() => setChangePlanEmp(null)} 
      size="md"
      icon={<RefreshCw className="w-4 h-4" />}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={() => setChangePlanEmp(null)}>Cancel</Button>
          <Button 
            onClick={handleChangePlan} 
            disabled={!newPlanId || newPlanId === changePlanEmp.corporatePlanId || updateEmployeeMutation.isLoading}
            className="gap-2 shadow-lg shadow-primary/10"
          >
            {updateEmployeeMutation.isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><CheckCircle className="w-4 h-4" /> Confirm Plan Update</>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
            {changePlanEmp.name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Employee Information</p>
            <p className="text-sm font-bold text-foreground">{changePlanEmp.name}</p>
            <p className="text-[11px] text-muted-foreground font-medium">{changePlanEmp.phone} · {changePlanEmp.companyName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Current Active Plan</span>
              <Badge variant="blue" className="text-[8px]">ACTIVE</Badge>
            </div>
            <p className="text-sm font-black text-blue-900">{changePlanEmp.corporatePlanName || 'No Plan Assigned'}</p>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <div className="w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>

          <LabeledField label="Target Health Plan Selection" required>
            <select 
              value={newPlanId} 
              onChange={e => setNewPlanId(e.target.value)} 
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm appearance-none"
            >
              <option value="">Select a new plan…</option>
              {activePlans.filter(p => p.isActive).map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.companyName} ({p.code})</option>
              ))}
            </select>
          </LabeledField>
        </div>

        <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-[11px] text-amber-900/80 font-bold leading-relaxed">
            This change is immediate. The employee's clinical records and future invoices will automatically reflect the benefits and discounts associated with the new plan.
          </p>
        </div>
      </div>
    </Modal>
  );
}
