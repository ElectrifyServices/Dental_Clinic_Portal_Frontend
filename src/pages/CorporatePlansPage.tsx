import React, { useState } from 'react';
import { Building2, Users } from 'lucide-react';
import { CorporatePlanManagement } from '../components/CorporatePlans/CorporatePlanManagement';
import { EmployeeManagement } from '../components/CorporatePlans/EmployeeManagement';
import { CorporatePlan, CorporateEmployee } from '../types';

interface Props {
  plans: CorporatePlan[];
  employees: CorporateEmployee[];
  onSavePlan: (plan: CorporatePlan) => void;
  onDeletePlan: (id: string) => void;
  onTogglePlan: (id: string) => void;
  onSaveEmployee: (emp: CorporateEmployee) => void;
  onDeleteEmployee: (id: string) => void;
  onBulkSaveEmployees: (emps: CorporateEmployee[]) => void;
  onChangePlan: (empId: string, newPlanId: string, newPlanName: string) => void;
}

const TABS = [
  { key: 'plans', label: 'Corporate Plans', icon: Building2 },
  { key: 'employees', label: 'Employee Management', icon: Users },
];

export const CorporatePlansPage: React.FC<Props> = ({
  plans, employees,
  onSavePlan, onDeletePlan, onTogglePlan,
  onSaveEmployee, onDeleteEmployee, onBulkSaveEmployees, onChangePlan,
}) => {
  const [tab, setTab] = useState<'plans' | 'employees'>('plans');

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-0.5 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                active ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}>
              <Icon className="w-4 h-4" />
              {t.label}
              {t.key === 'employees' && employees.length > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                  {employees.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === 'plans' ? (
        <CorporatePlanManagement
          plans={plans}
          onSave={onSavePlan}
          onDelete={onDeletePlan}
          onToggle={onTogglePlan}
        />
      ) : (
        <EmployeeManagement
          employees={employees}
          plans={plans}
          onSave={onSaveEmployee}
          onDelete={onDeleteEmployee}
          onBulkSave={onBulkSaveEmployees}
          onChangePlan={onChangePlan}
        />
      )}
    </div>
  );
};
