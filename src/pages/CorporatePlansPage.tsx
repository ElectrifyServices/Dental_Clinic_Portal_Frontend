import React, { useState, useEffect } from 'react';
import { Building2, Users } from 'lucide-react';
import { CorporatePlanManagement } from '../components/CorporatePlans/CorporatePlanManagement';
import { EmployeeManagement } from '../components/CorporatePlans/EmployeeManagement';
import { useAppData } from '../hooks/useAppData';
import { useModal } from '../contexts/ModalContext';
import { useCorporatePlansQuery } from '../hooks/corporate/useCorporatePlansQuery';
import { useEmployeesQuery } from '../hooks/corporate/useEmployeesQuery';

const TABS = [
  { key: 'plans', label: 'Corporate Plans', icon: Building2 },
  { key: 'employees', label: 'Employee Management', icon: Users },
];

export const CorporatePlansPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const {
    corporatePlans, corporateEmployees,
    handleSaveCorporatePlan, handleDeleteCorporatePlan, handleToggleCorporatePlan,
    handleSaveEmployee, handleDeleteEmployee, handleBulkSaveEmployees, handleChangeEmployeePlan,
    isPlansLoading, refetchCorporate,
  } = useAppData({
    corporateSearch: debouncedSearch,
    corporateStatus: filter === 'all' ? undefined : filter.toUpperCase(),
  });
  const { confirmDelete } = useModal();
  const [tab, setTab] = useState<'plans' | 'employees'>('plans');

  useEffect(() => {
    if (refetchCorporate) {
      refetchCorporate();
    }
  }, [refetchCorporate]);

  // Fetch employee list to get the exact count dynamically from backend API
  const { data: employeesData } = useEmployeesQuery({ page: 1, limit: 1 });
  const pagination = employeesData?.pagination || employeesData?.data?.pagination;
  const totalEmployees = pagination ? (pagination.total || 0) : corporateEmployees.length;

  const plans = corporatePlans;
  const employees = corporateEmployees;

  return (
    <div className="space-y-3">
      {tab === 'plans' ? (
        <CorporatePlanManagement
          plans={plans}
          onSave={handleSaveCorporatePlan}
          onDelete={handleDeleteCorporatePlan}
          onToggle={handleToggleCorporatePlan}
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          isLoading={isPlansLoading}
          tab={tab}
          setTab={setTab}
        />
      ) : (
        <EmployeeManagement
          employees={employees}
          plans={plans}
          onSave={handleSaveEmployee}
          onDelete={handleDeleteEmployee}
          onBulkSave={handleBulkSaveEmployees}
          onChangePlan={handleChangeEmployeePlan}
          parentTab={tab}
          setParentTab={setTab}
        />
      )}
    </div>
  );
};
