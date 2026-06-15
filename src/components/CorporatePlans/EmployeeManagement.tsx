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
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, Button,
} from '../ui';
import { Input } from '../ui/Input';
import { useDeleteEmployeeMutation } from '../../hooks/corporate/useDeleteEmployeeMutation';
import { useEmployeesQuery } from '../../hooks/corporate/useEmployeesQuery';
import { useCompaniesQuery } from '../../hooks/corporate/useCompaniesQuery';
import { useUpdateEmployeeStatusMutation } from '../../hooks/corporate/useUpdateEmployeeStatusMutation';
import { useModal } from '../../contexts/ModalContext';
import { EmployeeImportTab } from './Employee/EmployeeImportTab';
import { EmployeeFormModal } from './Employee/EmployeeFormModal';
import { ChangePlanModal } from './Employee/ChangePlanModal';
import { getDependentsByMember } from '../../hooks/corporate/dependentStorage';
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
  const [planFilter, setPlanFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editEmp, setEditEmp] = useState<CorporateEmployee | null>(null);
  const [changePlanEmp, setChangePlanEmp] = useState<CorporateEmployee | null>(null);
  const [deleteEmp, setDeleteEmp] = useState<CorporateEmployee | null>(null);
  const [addDependentEmp, setAddDependentEmp] = useState<CorporateEmployee | null>(null);
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: employeesData, isLoading: employeesLoading, refetch } = useEmployeesQuery({
    search: debouncedSearch,
    page,
    limit: PER_PAGE,
    filters: {
      corporate_plan_id: planFilter === 'all' ? undefined : [planFilter],
    },
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

    if (planFilter !== 'all') mapped = mapped.filter(e => e.corporatePlanId === planFilter);
    return mapped;
  }, [employeesData, plans, planFilter]);

  const pagination = employeesData?.pagination || employeesData?.data?.pagination || { page: 1, limit: PER_PAGE, total: 0, totalPages: 1 };
  const totalPages = planFilter !== 'all' ? Math.ceil(apiMembers.length / PER_PAGE) || 1 : pagination.totalPages || 1;
  const totalItems = planFilter !== 'all' ? apiMembers.length : pagination.total || 0;

  const { data: companiesData } = useCompaniesQuery();
  const companiesList = useMemo(() => {
    let arr: any[] = [];
    if (Array.isArray(companiesData)) arr = companiesData;
    else if (Array.isArray(companiesData?.data)) arr = companiesData.data;
    else if (Array.isArray(companiesData?.data?.data)) arr = companiesData.data.data;
    return arr.map((c: any) => ({
      name: c.company_name || c.name || 'Unknown',
      count: Number(c.employee_count || c.count || c.total || 0),
    })).sort((a, b) => b.count - a.count);
  }, [companiesData]);

  const planFilterTabs = [
    { key: 'all', label: 'All Plans' },
    ...plans.filter(p => p.isActive).map(p => ({ key: p.id, label: p.code })),
  ];

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
    return (
      <div className="p-4 bg-muted/20 border-l-2 border-primary/40">
        <h4 className="text-sm font-semibold mb-3">Family Members ({emp.dependents.length})</h4>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Relation</th>
                <th className="px-4 py-2">Contact</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {emp.dependents.map((dep, idx) => (
                <tr key={dep.id} className={idx < emp.dependents!.length - 1 ? 'border-b border-border/50' : ''}>
                  <td className="px-4 py-2 font-medium">{dep.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{dep.relationship}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {dep.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {dep.phone}</div>}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dep.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                      {dep.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      key: 'actions', header: '', align: 'right' as const,
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
            {onGoToRegister && (
              <Button onClick={onGoToRegister} variant="outline" className="gap-2">
                <Zap className="w-4 h-4" /> Quick Register
              </Button>
            )}
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
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 min-w-56">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, phone…"
                className="pl-10 rounded-xl"
              />
            </div>

            <div className="flex p-1 bg-muted rounded-xl border border-border gap-0.5 overflow-x-auto">
              {planFilterTabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => { setPlanFilter(t.key); setPage(1); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                    planFilter === t.key
                      ? 'bg-card text-foreground shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <DataTable
            columns={columns}
            data={apiMembers}
            rowKey={e => e.id}
            emptyIcon={<Users className="w-10 h-10 text-muted-foreground/40" />}
            emptyTitle="No members found"
            emptySubtitle="Use Quick Register to add your first member"
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
          setShowForm={val => { if (!val) setAddDependentEmp(null); }}
          employee={addDependentEmp}
          onSave={() => { setAddDependentEmp(null); refetch(); }}
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
    </div>
  );
}
