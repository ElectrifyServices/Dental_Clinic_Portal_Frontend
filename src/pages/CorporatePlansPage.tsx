import React, { useState } from 'react';
import { Building2, Users } from 'lucide-react';
import { CorporatePlanManagement } from '../components/CorporatePlans/CorporatePlanManagement';
import { EmployeeManagement } from '../components/CorporatePlans/EmployeeManagement';
import { useAppData } from '../hooks/useAppData';
import { useModal } from '../contexts/ModalContext';

const TABS = [
  { key: 'plans', label: 'Corporate Plans', icon: Building2 },
  { key: 'employees', label: 'Employee Management', icon: Users },
];

export const CorporatePlansPage: React.FC = () => {
  const {
    corporatePlans, corporateEmployees,
    handleSaveCorporatePlan, handleDeleteCorporatePlan, handleToggleCorporatePlan,
    handleSaveEmployee, handleDeleteEmployee, handleBulkSaveEmployees, handleChangeEmployeePlan,
  } = useAppData();
  const { confirmDelete } = useModal();
  const [tab, setTab] = useState<'plans' | 'employees'>('plans');

  const plans = corporatePlans;
  const employees = corporateEmployees;

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-0.5 bg-muted p-1 rounded-xl w-fit">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                active ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}>
              <Icon className="w-4 h-4" />
              {t.label}
              {t.key === 'employees' && employees.length > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
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
          onSave={handleSaveCorporatePlan}
          onDelete={(id: string) =>
            confirmDelete('Delete Corporate Plan', 'Delete this plan?', () => handleDeleteCorporatePlan(id))
          }
          onToggle={handleToggleCorporatePlan}
        />
      ) : (
        <EmployeeManagement
          employees={employees}
          plans={plans}
          onSave={handleSaveEmployee}
          onDelete={(id: string) =>
            confirmDelete('Delete Employee', 'Delete employee?', () => handleDeleteEmployee(id))
          }
          onBulkSave={handleBulkSaveEmployees}
          onChangePlan={handleChangeEmployeePlan}
        />
      )}
    </div>
  );
};
