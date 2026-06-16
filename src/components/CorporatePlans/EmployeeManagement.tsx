import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, Trash2, Edit2, Upload, Building2, User,
  Users, Phone, Search,
  MoreHorizontal, ArrowRightLeft,
  UserPlus, Zap,
} from 'lucide-react';
import { CorporateEmployee, CorporatePlan, CoverageType } from '../../types';
import {
  PageHeader, DataTable, Pagination, PlanBadge, ConfirmModal,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, Button, SearchInput, FilterTabs,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '../ui';
import { useDeleteEmployeeMutation } from '../../hooks/corporate/useDeleteEmployeeMutation';
import { useEmployeesQuery } from '../../hooks/corporate/useEmployeesQuery';
import { useCompaniesQuery } from '../../hooks/corporate/useCompaniesQuery';
import { useUpdateEmployeeStatusMutation } from '../../hooks/corporate/useUpdateEmployeeStatusMutation';
import { useModal } from '../../contexts/ModalContext';
import { EmployeeImportTab } from './Employee/EmployeeImportTab';
import { EmployeeFormModal } from './Employee/EmployeeFormModal';
import { ChangePlanModal } from './Employee/ChangePlanModal';
import { getDependentsByMember, removeDependent, notifyDependentChange } from '../../hooks/corporate/dependentStorage';
import { useQueryClient } from '@tanstack/react-query';
import { EmployeeDependentFormModal } from './Employee/EmployeeDependentFormModal';

interface EmployeeManagementProps {
  employees: CorporateEmployee[];
  plans: CorporatePlan[];
  onSave: (emp: CorporateEmployee) => void;
  onDelete: (id: string) => void;
  onBulkSave: (emps: CorporateEmployee[]) => void;
  onChangePlan: (empId: string, newPlanId: string, newPlanName: string) => void;
  onGoToRegister?: () => void;
}

const PER_PAGE = 15;

export function EmployeeManagement({
  employees, plans, onSave, onDelete, onBulkSave, onChangePlan, onGoToRegister,
}: EmployeeManagementProps) {
  const queryClient = useQueryClient();
  const { showToast } = useModal();

  const deleteEmployeeMutation = useDeleteEmployeeMutation();
  const updateStatusMutation = useUpdateEmployeeStatusMutation();

  const [tab, setTab] = useState<'list' | 'import'>('list');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [planTypeFilter, setPlanTypeFilter] = useState<'all' | 'corporate' | 'individual'>('all');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editEmp, setEditEmp] = useState<CorporateEmployee | null>(null);
  const [changePlanEmp, setChangePlanEmp] = useState<CorporateEmployee | null>(null);
  const [deleteEmp, setDeleteEmp] = useState<CorporateEmployee | null>(null);
  const [addDependentEmp, setAddDependentEmp] = useState<CorporateEmployee | null>(null);
  const [editDep, setEditDep] = useState<any | null>(null);
  const [deleteDep, setDeleteDep] = useState<any | null>(null);
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const queryFilters = useMemo(() => {
    const filters: any = {};

    if (planTypeFilter === 'corporate') {
      const corpPlanIds = plans.filter(p => p.planCategory !== 'individual').map(p => p.id);
      filters.corporate_plan_id = corpPlanIds.length > 0 ? corpPlanIds : ['none'];
    } else if (planTypeFilter === 'individual') {
      const indPlanIds = plans.filter(p => p.planCategory === 'individual').map(p => p.id);
      filters.corporate_plan_id = indPlanIds.length > 0 ? indPlanIds : ['none'];
    }

    if (selectedPlanFilter !== 'all') {
      filters.corporate_plan_id = [selectedPlanFilter];
    }

    if (selectedCompanyFilter !== 'all') {
      filters.company_name = [selectedCompanyFilter];
    }

    return filters;
  }, [planTypeFilter, selectedPlanFilter, selectedCompanyFilter, plans]);

  const { data: employeesData, isLoading: employeesLoading, refetch } = useEmployeesQuery({
    search: debouncedSearch,
    page,
    limit: PER_PAGE,
    filters: queryFilters,
  });

  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      refetch();
    };
    window.addEventListener('plan_dependents_changed', handler);
    return () => window.removeEventListener('plan_dependents_changed', handler);
  }, [refetch, queryClient]);

  const apiMembers: CorporateEmployee[] = useMemo(() => {
    let arr: any[] = [];
    if (Array.isArray(employeesData)) arr = employeesData;
    else if (Array.isArray(employeesData?.data)) arr = employeesData.data;
    else if (Array.isArray(employeesData?.data?.data)) arr = employeesData.data.data;
    else if (Array.isArray(employeesData?.data?.employees)) arr = employeesData.data.employees;
    else if (Array.isArray(employeesData?.employees)) arr = employeesData.employees;

    return arr.map((e: any) => ({
      id: e.id,
      employeeId: e.emp_id || '',
      name: e.name,
      phone: e.phone,
      email: e.email,
      gender: e.gender?.toLowerCase() || 'male',
      dateOfBirth: e.date_of_birth,
      designation: e.designation,
      department: e.department,
      companyName: e.company_name || '',
      corporatePlanId: e.corporate_plan?.id || e.corporate_plan_id || '',
      corporatePlanName: e.corporate_plan?.plan_name || plans.find(p => p.id === (e.corporate_plan?.id || e.corporate_plan_id))?.name || '',
      enrolledAt: e.created_at || new Date().toISOString(),
      eligible_date: e.eligible_date,
      isActive: e.status === 'ACTIVE',
      status: e.status,
      patientId: e.patient_id || undefined,
      coverageType: (e.coverage_type?.toLowerCase() || 'self') as CoverageType,
      dependents: getDependentsByMember(e.id),
    }));
  }, [employeesData, plans]);

  const pagination = employeesData?.pagination || employeesData?.data?.pagination || { page: 1, limit: PER_PAGE, total: 0, totalPages: 1 };
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.total || 0;

  const planTypeTabs = [
    { key: 'all', label: 'All Members' },
    { key: 'corporate', label: 'Corporate Plans' },
    { key: 'individual', label: 'Individual Plans' },
  ];

  const handlePlanTypeChange = (val: string) => {
    setPlanTypeFilter(val as any);
    setSelectedPlanFilter('all');
    setSelectedCompanyFilter('all');
    setPage(1);
  };

  const availablePlanOptions = useMemo(() => {
    let filteredPlans = plans.filter(p => p.isActive);
    if (planTypeFilter === 'corporate') {
      filteredPlans = filteredPlans.filter(p => p.planCategory !== 'individual');
    } else if (planTypeFilter === 'individual') {
      filteredPlans = filteredPlans.filter(p => p.planCategory === 'individual');
    }
    return [
      { value: 'all', label: 'All Plans' },
      ...filteredPlans.map(p => ({ value: p.id, label: `${p.name} (${p.code})` }))
    ];
  }, [plans, planTypeFilter]);

  const availableCompanyOptions = useMemo(() => {
    const companies = Array.from(new Set(
      plans
        .filter(p => p.isActive && p.planCategory !== 'individual' && p.companyName && p.companyName !== 'Individual')
        .map(p => p.companyName!)
    ));
    return [
      { value: 'all', label: 'All Companies' },
      ...companies.map(c => ({ value: c, label: c }))
    ];
  }, [plans]);

  const handleDelete = async () => {
    if (!deleteEmp) return;
    try {
      await deleteEmployeeMutation.mutateAsync({ id: deleteEmp.id });
      queryClient.invalidateQueries({ queryKey: ['corporatePlans'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      onDelete(deleteEmp.id);
      refetch();
      setDeleteEmp(null);
    } catch (e: any) {
      const d = e.response?.data || e;
      const msg = d?.responseStatusList?.statusList?.[0]?.statusDesc || d?.statusDesc || d?.message || e.message || 'Failed to remove member';
      showToast(msg, 'error');
    }
  };

  const handleDeleteDependent = () => {
    if (!deleteDep) return;
    try {
      removeDependent(deleteDep.id);
      notifyDependentChange();
      showToast("Family member removed successfully", "success");
      refetch();
      setDeleteDep(null);
    } catch (err) {
      showToast("Failed to remove family member", "error");
    }
  };

  const handleRowClick = (emp: CorporateEmployee) => {
    setExpandedRowIds(prev => {
      const next = new Set(prev);
      next.has(emp.id) ? next.delete(emp.id) : next.add(emp.id);
      return next;
    });
  };

  const renderExpandedRow = (emp: CorporateEmployee) => {
    if (!emp.dependents?.length) {
      return (
        <div className="p-4 text-center text-muted-foreground text-sm">
          No family members added yet.
        </div>
      );
    }

    const dependentColumns = [
      {
        key: 'name',
        header: 'Name',
        render: (dep: any) => <span className="font-bold text-foreground text-sm">{dep.name}</span>,
      },
      {
        key: 'relationship',
        header: 'Relation',
        render: (dep: any) => <span className="text-xs text-muted-foreground">{dep.relationship}</span>,
      },
      {
        key: 'contact',
        header: 'Contact',
        render: (dep: any) => dep.phone ? (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Phone className="w-3 h-3 opacity-60" /> {dep.phone}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/40 italic">—</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (dep: any) => (
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${dep.isActive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-muted text-muted-foreground'}`}>
            {dep.isActive !== false ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'ACTION',
        align: 'right' as const,
        render: (dep: any) => (
          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg hover:text-primary hover:border-primary/30"
              onClick={(ev) => {
                ev.stopPropagation();
                setEditDep(dep);
                setAddDependentEmp(emp);
              }}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/5 hover:border-destructive/30"
              onClick={(ev) => {
                ev.stopPropagation();
                setDeleteDep(dep);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ),
      },
    ];

    return (
      <div className="p-4 bg-muted/20 border-l-2 border-primary/40">
        <h4 className="text-sm font-semibold mb-3">Family Members ({emp.dependents.length})</h4>
        <DataTable
          columns={dependentColumns}
          data={emp.dependents}
          rowKey={dep => dep.id}
        />
      </div>
    );
  };

  // Avatar colour cycling
  const AVATAR_COLORS = [
    'from-blue-500 to-blue-700',
    'from-violet-500 to-purple-700',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-700',
    'from-amber-400 to-orange-600',
    'from-indigo-500 to-violet-700',
    'from-teal-500 to-emerald-600',
    'from-cyan-500 to-blue-600',
  ];
  const avatarGrad = (name: string) =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'member', header: 'Member',
      render: (e: CorporateEmployee) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGrad(e.name)} flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm`}>
            {e.name[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-foreground text-sm">{e.name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 opacity-60" /> {e.phone}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'plan', header: 'Plan',
      render: (e: CorporateEmployee) => {
        const plan = plans.find(p => p.id === e.corporatePlanId);
        return plan
          ? <PlanBadge name={plan.name} code={plan.code} color={plan.color} />
          : <span className="text-xs text-muted-foreground/60 italic">No plan</span>;
      },
    },
    {
      key: 'type', header: 'Type',
      render: (e: CorporateEmployee) => {
        const plan = plans.find(p => p.id === e.corporatePlanId);
        const isInd = plan?.planCategory === 'individual' || e.companyName === 'Individual';
        return (
          <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide border ${
            isInd
              ? 'bg-teal-50 text-teal-700 border-teal-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {isInd ? <User className="w-2.5 h-2.5" /> : <Building2 className="w-2.5 h-2.5" />}
            {isInd ? 'Personal' : 'Company'}
          </span>
        );
      },
    },
    {
      key: 'company', header: 'Company',
      render: (e: CorporateEmployee) => (
        <span className="text-xs text-muted-foreground">
          {e.companyName === 'Individual' ? <span className="italic opacity-40">—</span> : e.companyName}
        </span>
      ),
    },
    {
      key: 'family', header: 'Family',
      render: (e: CorporateEmployee) => {
        const count = e.dependents?.length ?? 0;
        return count > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/8 border border-primary/20 px-2.5 py-1 rounded-full">
            <Users className="w-3 h-3" /> +{count}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50 italic">Self</span>
        );
      },
    },
    {
      key: 'status', header: 'Status',
      render: (e: CorporateEmployee) => {
        const isExpired = e.status === 'EXPIRED';
        return (
          <Button
            onClick={async (ev) => {
              ev.stopPropagation();
              if (isExpired) return;
              try {
                await updateStatusMutation.mutateAsync({ id: e.id, status: e.isActive ? 'INACTIVE' : 'ACTIVE' });
                refetch();
              } catch {}
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border h-auto uppercase tracking-wide transition-all ${
              isExpired
                ? 'bg-rose-50 text-rose-600 border-rose-200 cursor-not-allowed'
                : e.isActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
            }`}
            disabled={isExpired || (updateStatusMutation as any).isPending}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${
              isExpired ? 'bg-rose-500' : e.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/40'
            }`} />
            {isExpired ? 'Expired' : e.isActive ? 'Active' : 'Inactive'}
          </Button>
        );
      },
    },
    {
      key: 'actions', header: 'ACTION', align: 'right' as const,
      render: (e: CorporateEmployee) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={ev => ev.stopPropagation()}>
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onSelect={ev => { ev.stopPropagation(); setEditEmp(e); setShowForm(true); }}>
                <Edit2 className="w-4 h-4 mr-2 text-primary" /> Edit Member
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={ev => { ev.stopPropagation(); setChangePlanEmp(e); }}>
                <ArrowRightLeft className="w-4 h-4 mr-2" /> Change Plan
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={ev => { ev.stopPropagation(); setAddDependentEmp(e); }}>
                <UserPlus className="w-4 h-4 mr-2" /> Add Family Member
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={ev => { ev.stopPropagation(); setDeleteEmp(e); }} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <PageHeader
        title="Members"
        subtitle={`${totalItems} member${totalItems !== 1 ? 's' : ''} across ${plans.filter(p => p.isActive).length} active plan${plans.filter(p => p.isActive).length !== 1 ? 's' : ''}`}
        action={
          <div className="flex items-center gap-2">
            <Button onClick={() => setTab('import')} variant="outline" className="gap-2">
              <Upload className="w-4 h-4" /> Import
            </Button>
            <Button onClick={() => { setEditEmp(null); setShowForm(true); }} className="gap-2">
              <Plus className="w-4 h-4" /> Add Member
            </Button>
          </div>
        }
      />

      {tab === 'list' ? (
        <>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 p-3 rounded-2xl border border-border/50">
            <div className="flex flex-1 flex-col sm:flex-row gap-3 items-center w-full">
              <SearchInput
                value={search}
                onChange={val => { setSearch(val); setPage(1); }}
                placeholder="Search by name, phone…"
                className="w-full sm:max-w-xs"
              />

              <FilterTabs
                tabs={planTypeTabs}
                active={planTypeFilter}
                onChange={handlePlanTypeChange}
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto justify-end">
              {/* Plan Select */}
              <div className="w-full sm:w-48">
                <Select
                  value={selectedPlanFilter}
                  onValueChange={val => { setSelectedPlanFilter(val); setPage(1); }}
                >
                  <SelectTrigger className="w-full h-10 rounded-xl text-xs bg-white border-border/60 hover:bg-slate-50">
                    <SelectValue placeholder="Filter by Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlanOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Company Select - only for corporate or all */}
              {planTypeFilter !== 'individual' && (
                <div className="w-full sm:w-48">
                  <Select
                    value={selectedCompanyFilter}
                    onValueChange={val => { setSelectedCompanyFilter(val); setPage(1); }}
                  >
                    <SelectTrigger className="w-full h-10 rounded-xl text-xs bg-white border-border/60 hover:bg-slate-50">
                      <SelectValue placeholder="Filter by Company" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCompanyOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <DataTable
            columns={columns}
            data={apiMembers}
            rowKey={e => e.id}
            emptyIcon={<Users className="w-10 h-10 text-muted-foreground/40" />}
            emptyTitle="No members found"
            emptySubtitle="Use Add Member to add your first member"
            onRowClick={handleRowClick}
            expandedRowIds={expandedRowIds}
            renderExpandedRow={renderExpandedRow}
            footer={
              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                perPage={PER_PAGE}
                onPageChange={setPage}
              />
            }
          />
        </>
      ) : (
        <EmployeeImportTab
          plans={plans}
          activePlans={plans}
          setTab={t => { setTab(t); }}
          onBulkSave={emps => { onBulkSave(emps); setTab('list'); }}
        />
      )}

      <EmployeeFormModal
        showForm={showForm}
        setShowForm={setShowForm}
        editEmp={editEmp}
        activePlans={plans}
        onSave={emp => { onSave(emp); setTab('list'); }}
        refetch={refetch}
      />

      <ChangePlanModal
        changePlanEmp={changePlanEmp}
        setChangePlanEmp={setChangePlanEmp}
        activePlans={plans}
        refetch={refetch}
      />

      {addDependentEmp && !showForm && (
        <EmployeeDependentFormModal
          showForm={!!addDependentEmp}
          setShowForm={val => { if (!val) { setAddDependentEmp(null); setEditDep(null); } }}
          employee={addDependentEmp}
          editDep={editDep}
          onSave={() => { setAddDependentEmp(null); setEditDep(null); refetch(); }}
        />
      )}

      {deleteEmp && (
        <ConfirmModal
          title="Remove Member"
          message={`Remove ${deleteEmp.name} from the membership list? Their patient record will remain but the plan association will be cleared.`}
          confirmLabel="Remove"
          variant="danger"
          isLoading={deleteEmployeeMutation.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleteEmp(null)}
        />
      )}

      {deleteDep && (
        <ConfirmModal
          title="Remove Family Member"
          message={`Remove ${deleteDep.name} from the family list?`}
          confirmLabel="Remove"
          variant="danger"
          onConfirm={handleDeleteDependent}
          onCancel={() => setDeleteDep(null)}
        />
      )}
    </div>
  );
}
