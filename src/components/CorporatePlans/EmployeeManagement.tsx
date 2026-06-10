import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, Trash2, Edit2, Upload, Building2,
  Users, Phone, Mail, Search, X, ToggleLeft, ToggleRight,
  MoreHorizontal, ArrowRightLeft
} from 'lucide-react';
import { CorporateEmployee, CorporatePlan } from '../../types';
import {
  PageHeader, DataTable, Pagination, SearchInput,
  FilterTabs, PlanBadge, ConfirmModal, Badge,
  DropdownMenu, DropdownMenuTrigger,
  DropdownMenuContent, DropdownMenuItem, Button
} from '../ui';
import { useDeleteEmployeeMutation } from '../../hooks/corporate/useDeleteEmployeeMutation';
import { useEmployeesQuery } from '../../hooks/corporate/useEmployeesQuery';
import { useCompaniesQuery } from '../../hooks/corporate/useCompaniesQuery';
import { useActivePlansQuery } from '../../hooks/corporate/useActivePlansQuery';
import { useUpdateEmployeeStatusMutation } from '../../hooks/corporate/useUpdateEmployeeStatusMutation';
import { useModal } from '../../contexts/ModalContext';

import { EmployeeImportTab } from './Employee/EmployeeImportTab';
import { EmployeeFormModal } from './Employee/EmployeeFormModal';
import { ChangePlanModal } from './Employee/ChangePlanModal';
import { useQueryClient } from '@tanstack/react-query';

interface EmployeeManagementProps {
  employees: CorporateEmployee[];
  plans: CorporatePlan[];
  onSave: (emp: CorporateEmployee) => void;
  onDelete: (id: string) => void;
  onBulkSave: (emps: CorporateEmployee[]) => void;
  onChangePlan: (empId: string, newPlanId: string, newPlanName: string) => void;
  parentTab: 'plans' | 'employees';
  setParentTab: (tab: 'plans' | 'employees') => void;
}

import { parseXlsx, downloadTemplate } from './Employee/importUtils';
export function EmployeeManagement({ employees, plans, onSave, onDelete, onBulkSave, onChangePlan, parentTab, setParentTab }: EmployeeManagementProps) {
  const queryClient = useQueryClient();
  const deleteEmployeeMutation = useDeleteEmployeeMutation();

  const [tab, setTab] = useState<'list' | 'import'>('list');
  const [viewMode, setViewMode] = useState<'employees' | 'companies'>('employees');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { showToast } = useModal();
  const [showForm, setShowForm] = useState(false);
  const [editEmp, setEditEmp] = useState<CorporateEmployee | null>(null);
  const [changePlanEmp, setChangePlanEmp] = useState<CorporateEmployee | null>(null);
  const [deleteEmp, setDeleteEmp] = useState<CorporateEmployee | null>(null);

  const updateStatusMutation = useUpdateEmployeeStatusMutation();

  const activePlans = useMemo(() => {
    return plans; // Fallback to props directly, which is always up-to-date
  }, [plans]);

  // Filters
  const planFilterTabs = [
    { key: 'all', label: 'All Plans' },
    ...activePlans.filter(p => p.isActive).map(p => ({ key: p.id, label: p.code })),
  ];

  const { data: employeesData, isLoading: employeesLoading, refetch } = useEmployeesQuery({
    search: debouncedSearch,
    page,
    limit: PER_PAGE,
    filters: {
      company_name: selectedCompany ? [selectedCompany] : undefined,
      corporate_plan_id: planFilter === 'all' ? undefined : [planFilter],
    }
  });

  const apiEmployees: CorporateEmployee[] = useMemo(() => {
    let arr: any[] = [];
    if (Array.isArray(employeesData)) arr = employeesData;
    else if (employeesData && Array.isArray(employeesData.data)) arr = employeesData.data;
    else if (employeesData?.data && Array.isArray(employeesData.data.data)) arr = employeesData.data.data;
    else if (employeesData?.data?.employees && Array.isArray(employeesData.data.employees)) arr = employeesData.data.employees;
    else if (employeesData?.employees && Array.isArray(employeesData.employees)) arr = employeesData.employees;

    let mapped = arr.map((e: any) => ({
      id: e.id,
      employeeId: e.emp_id || '',
      name: e.name,
      phone: e.phone,
      email: e.email,
      gender: e.gender?.toLowerCase() || 'male',
      dateOfBirth: e.date_of_birth,
      designation: e.designation,
      department: e.department,
      companyName: e.company_name || 'Unknown',
      corporatePlanId: e.corporate_plan?.id || e.corporate_plan_id || '',
      corporatePlanName: e.corporate_plan?.plan_name || activePlans.find(p => p.id === (e.corporate_plan?.id || e.corporate_plan_id))?.name || '',
      enrolledAt: e.created_at || new Date().toISOString(),
      eligible_date: e.eligible_date,
      isActive: e.status === 'ACTIVE',
      status: e.status,
      patientId: e.patient_id || undefined,
    }));

    if (planFilter !== 'all') {
      mapped = mapped.filter(e => e.corporatePlanId === planFilter);
    }

    return mapped;
  }, [employeesData, activePlans, planFilter]);

  const pagination = employeesData?.pagination || employeesData?.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const totalPages = planFilter !== 'all' ? Math.ceil(apiEmployees.length / PER_PAGE) || 1 : pagination.totalPages || 1;
  const totalItems = planFilter !== 'all' ? apiEmployees.length : pagination.total || 0;

  const { data: companiesData } = useCompaniesQuery();

  // Group by company
  const companiesList = useMemo(() => {
    let arr: any[] = [];
    if (Array.isArray(companiesData)) arr = companiesData;
    else if (companiesData && Array.isArray(companiesData.data)) arr = companiesData.data;
    else if (companiesData?.data && Array.isArray(companiesData.data.data)) arr = companiesData.data.data;

    if (arr.length > 0) {
      return arr.map((c: any) => ({
        name: c.company_name || c.name || 'Unknown',
        count: Number(c.employee_count || c.count || c.total || c._count?.employees || 0),
      })).sort((a, b) => b.count - a.count);
    }

    return [];
  }, [companiesData]);

  // Stats
  const byPlan = useMemo(() => {
    const m: Record<string, number> = {};
    let arr: any[] = [];
    if (Array.isArray(companiesData)) arr = companiesData;
    else if (companiesData && Array.isArray(companiesData.data)) arr = companiesData.data;
    else if (companiesData?.data && Array.isArray(companiesData.data.data)) arr = companiesData.data.data;

    if (arr.length > 0) {
      arr.forEach((company: any) => {
        if (company.employees && Array.isArray(company.employees)) {
          company.employees.forEach((emp: any) => {
            const planId = emp.corporate_plan?.id || emp.corporate_plan_id;
            if (planId) {
              m[planId] = (m[planId] || 0) + 1;
            }
          });
        }
      });
      return m;
    }

    // Fallback to currently visible employees if companies data is unavailable
    apiEmployees.forEach(e => {
      if (e.corporatePlanId) m[e.corporatePlanId] = (m[e.corporatePlanId] || 0) + 1;
    });
    return m;
  }, [companiesData, apiEmployees]);

  // ── Modals ──
  const openNew = () => { setEditEmp(null); setShowForm(true); };
  const openEdit = (e: CorporateEmployee) => { setEditEmp(e); setShowForm(true); };
  const openChangePlan = (e: CorporateEmployee) => { setChangePlanEmp(e); };

  const handleDeleteEmployee = async () => {
    if (!deleteEmp) return;
    try {
      await deleteEmployeeMutation.mutateAsync({ id: deleteEmp.id });
      queryClient.invalidateQueries({ queryKey: ["corporatePlans"] });
      onDelete(deleteEmp.id);
      refetch();
      setDeleteEmp(null);
    } catch (e: any) {
      const resData = e.response?.data || e;
      const statusDesc = resData?.responseStatusList?.statusList?.[0]?.statusDesc;
      let errMsg = "Failed to remove employee.";

      if (statusDesc) {
        errMsg = statusDesc;
      } else if (resData?.statusDesc) {
        errMsg = resData.statusDesc;
      } else if (resData?.message) {
        errMsg = resData.message;
      } else if (e.message) {
        errMsg = e.message;
      }
      showToast(errMsg, "error");
    }
  };

  // ── Table columns ──
  const columns = [
    {
      key: 'employee', header: 'Employee', render: (e: CorporateEmployee) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
            {e.name[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">{e.name}</div>
            {e.employeeId && <div className="text-xs text-muted-foreground/60 font-mono">{e.employeeId}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'contact', header: 'Contact', render: (e: CorporateEmployee) => (
        <div>
          <div className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3 text-muted-foreground/60" />{e.phone}</div>
          {e.email && <div className="text-xs text-muted-foreground/60 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" />{e.email}</div>}
        </div>
      ),
    },
    {
      key: 'company', header: 'Company / Role', render: (e: CorporateEmployee) => (
        <div>
          <div className="text-sm font-medium text-foreground">{e.companyName}</div>
          {e.designation && <div className="text-xs text-muted-foreground/60">{e.designation}{e.department ? ` · ${e.department}` : ''}</div>}
        </div>
      ),
    },
    {
      key: 'plan', header: 'Corporate Plan', render: (e: CorporateEmployee) => {
        const plan = activePlans.find(p => p.id === e.corporatePlanId);
        return plan
          ? <PlanBadge name={plan.name} code={plan.code} color={plan.color} />
          : <span className="text-xs text-muted-foreground/60">No plan</span>;
      },
    },
    {
      key: 'patient', header: 'Patient Link', render: (e: CorporateEmployee) => (
        e.patientId
          ? <Badge variant="green">Registered</Badge>
          : <Badge variant="gray">Not yet</Badge>
      ),
    },
    {
      key: 'status', header: 'Status', render: (e: CorporateEmployee) => {
        const isExpired = e.status === 'EXPIRED';
        return (
          <Button
            onClick={async () => {
              if (isExpired) return;
              try {
                await updateStatusMutation.mutateAsync({ id: e.id, status: e.isActive ? 'INACTIVE' : 'ACTIVE' });
                refetch();
              } catch (err) {
              }
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold transition-colors border h-auto ${isExpired
              ? 'bg-rose-100 text-rose-700 border-rose-200 cursor-not-allowed'
              : e.isActive
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200'
                : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
              }`}
            disabled={isExpired || updateStatusMutation.isLoading || (updateStatusMutation as any).isPending}
            title={isExpired ? "Expired! Please update the eligibility date to change status." : ""}
          >
            {isExpired ? (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            ) : e.isActive ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
            {isExpired ? 'Expired' : e.isActive ? 'Active' : 'Inactive'}
          </Button>
        );
      },
    },
    {
      key: 'actions', header: 'Action', align: 'right' as const, render: (e: CorporateEmployee) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="btn-icon h-8 w-8">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={() => openEdit(e)}>
                <Edit2 className="w-4 h-4 mr-2" /> Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openChangePlan(e)}>
                <ArrowRightLeft className="w-4 h-4 mr-2" /> Change Plan
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setDeleteEmp(e)} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <PageHeader
        title="Employee Management"
        subtitle={`${totalItems} employees across ${activePlans.filter(p => p.isActive).length} active plans`}
        action={
          <div className="flex items-center gap-2">
            <Button onClick={() => { setTab('import'); setImportRows([]); setImportErrors([]); }} variant="outline" className="btn-secondary">
              <Upload className="w-4 h-4" /> Bulk Import
            </Button>
            <Button onClick={openNew} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Employee
            </Button>
          </div>
        }
      >
        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl">
          <Button
            onClick={() => setParentTab("plans")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all h-auto border-transparent bg-transparent text-muted-foreground hover:bg-background/50 hover:text-foreground ${parentTab === "plans" ? "bg-card text-primary shadow-sm hover:bg-card hover:text-primary" : ""}`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Corporate Plans
          </Button>
          <Button
            onClick={() => setParentTab("employees")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all h-auto border-transparent bg-transparent text-muted-foreground hover:bg-background/50 hover:text-foreground ${parentTab === "employees" ? "bg-card text-primary shadow-sm hover:bg-card hover:text-primary" : ""}`}
          >
            <Users className="w-3.5 h-3.5" />
            Employee Management
          </Button>
        </div>
      </PageHeader>

      {/* Plan summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {plans.filter(p => p.isActive).slice(0, 4).map(plan => (
          <div key={plan.id} className="kpi-card">
            <PlanBadge name={plan.name} code={plan.code} color={plan.color} />
            <p className="text-xl font-bold text-foreground mt-2">{byPlan[plan.id] || 0}</p>
            <p className="text-xs text-muted-foreground/60">{plan.companyName}</p>
          </div>
        ))}
      </div>

      {/* Tab: List / Import */}
      {tab === 'list' ? (
        <>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }}
              placeholder={viewMode === 'employees' ? "Search by name, phone, employee ID…" : "Search companies…"} className="flex-1" />
            {viewMode === 'employees' && (
              <FilterTabs tabs={planFilterTabs} active={planFilter} onChange={v => { setPlanFilter(v); setPage(1); }} />
            )}
            <Button
              onClick={() => { setViewMode(viewMode === 'employees' ? 'companies' : 'employees'); setSelectedCompany(null); setPage(1); }}
              variant="outline"
              className={`btn-secondary px-3 py-2 whitespace-nowrap h-11 rounded-xl ${viewMode === 'companies' ? 'bg-primary/10 text-primary border-primary/50' : ''}`}
              title={viewMode === 'employees' ? 'Switch to companies view' : 'Switch to employees view'}
            >
              <Building2 className="w-4 h-4" /> {viewMode === 'employees' ? 'Companies' : 'Employees'}
            </Button>
          </div>

          {/* Employees View */}
          {viewMode === 'employees' ? (
            <>
              {selectedCompany && (
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg p-3">
                  <span className="text-sm font-semibold text-blue-900">Showing: {selectedCompany}</span>
                  <Button onClick={() => setSelectedCompany(null)} variant="outline" className="btn-secondary text-xs ml-auto h-7 px-2">
                    <X className="w-3 h-3" /> Clear Filter
                  </Button>
                </div>
              )}
              <DataTable
                columns={columns}
                data={apiEmployees}
                rowKey={e => e.id}
                emptyIcon={<Users className="w-10 h-10 text-muted-foreground/40" />}
                emptyTitle="No employees found"
                emptySubtitle="Add employees individually or import from Excel"
                footer={
                  <Pagination page={page} totalPages={totalPages} totalItems={totalItems}
                    perPage={PER_PAGE} onPageChange={setPage} />
                }
              />
            </>
          ) : (
            /* Companies View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {companiesList
                .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
                .map(company => (
                  <div key={company.name}
                    onClick={() => { setSelectedCompany(company.name); setViewMode('employees'); setPage(1); }}
                    className="card p-5 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Company</p>
                        <p className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{company.name}</p>
                      </div>
                      <Building2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Total Employees</p>
                          <p className="text-2xl font-bold text-primary">{company.count}</p>
                        </div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-semibold">
                          View details →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      ) : (
        /* Import tab */
        <EmployeeImportTab
          plans={plans}
          activePlans={activePlans}
          setTab={(t) => {
            setTab(t);
            if (t === 'list') setViewMode('employees');
          }}
          onBulkSave={(emps) => {
            onBulkSave(emps);
            setTab('list');
            setViewMode('employees');
          }}
        />
      )}

      <EmployeeFormModal
        showForm={showForm}
        setShowForm={setShowForm}
        editEmp={editEmp}
        activePlans={activePlans}
        onSave={(emp) => {
          onSave(emp);
          setTab('list');
          setViewMode('employees');
        }}
        refetch={refetch}
      />

      <ChangePlanModal
        changePlanEmp={changePlanEmp}
        setChangePlanEmp={setChangePlanEmp}
        activePlans={activePlans}
        refetch={refetch}
      />

      {/* Delete confirm */}
      {deleteEmp && (
        <ConfirmModal
          title="Remove Employee"
          message={`Remove ${deleteEmp.name} from the corporate employee list? Their patient record will remain but plan association will be cleared.`}
          confirmLabel="Remove"
          variant="danger"
          isLoading={deleteEmployeeMutation.isPending}
          onConfirm={handleDeleteEmployee}
          onCancel={() => setDeleteEmp(null)}
        />
      )}
    </div>
  );
}
