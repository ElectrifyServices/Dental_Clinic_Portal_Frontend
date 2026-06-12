import { Input } from "@/components/ui/Input";
import React, { useState } from 'react';
import { Plus, Building2, Search, Info, Users, UserPlus } from 'lucide-react';
import { CorporatePlan, PlanCategory } from '../../types';
import { Button, PageHeader, Loading } from '../ui';
import { useDeleteCorporatePlanMutation } from '../../hooks/corporate/useDeleteCorporatePlanMutation';
import { useUpdateCorporatePlanStatusMutation } from '../../hooks/corporate/useUpdateCorporatePlanStatusMutation';
import { useModal } from '../../contexts/ModalContext';
import { useFormConfig } from '../../hooks/useFormConfig';

import { CorporatePlanCard } from './Plan/CorporatePlanCard';
import { CorporatePlanFormModal } from './Plan/CorporatePlanFormModal';

interface Props {
  plans: CorporatePlan[];
  onSave: (plan: CorporatePlan) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  search?: string;
  onSearchChange?: (val: string) => void;
  filter?: 'all' | 'active' | 'inactive';
  onFilterChange?: (val: 'all' | 'active' | 'inactive') => void;
  isLoading?: boolean;
  tab: 'plans' | 'employees';
  setTab: (tab: 'plans' | 'employees') => void;
}

export function CorporatePlanManagement({
  plans,
  onSave,
  onDelete,
  onToggle,
  search: propSearch,
  onSearchChange: propOnSearchChange,
  filter: propFilter,
  onFilterChange: propOnFilterChange,
  isLoading,
  tab,
  setTab,
}: Props) {
  const { showToast, confirmDelete } = useModal();
  const deletePlanMutation = useDeleteCorporatePlanMutation();
  const updateStatusMutation = useUpdateCorporatePlanStatusMutation();
  const cfg = useFormConfig('corporate');
  const BENEFIT_LABELS: Record<string, string> = Object.fromEntries(
    ((cfg as any).benefitTypes ?? []).map((b: any) => [b.value, b.label])
  );

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CorporatePlan | null>(null);
  const [localSearch, setLocalSearch] = useState('');
  const [localFilter, setLocalFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | PlanCategory>('all');

  const search = propSearch !== undefined ? propSearch : localSearch;
  const setSearch = propOnSearchChange || setLocalSearch;
  const filter = propFilter !== undefined ? propFilter : localFilter;
  const setFilter = propOnFilterChange || setLocalFilter;

  const filtered = plans.filter(p => {
    if (categoryFilter === 'corporate') return !p.planCategory || p.planCategory === 'corporate';
    if (categoryFilter === 'individual') return p.planCategory === 'individual';
    return true;
  });
  const handleDelete = (id: string) => {
    confirmDelete(
      'Delete Corporate Plan',
      'Delete this plan?',
      async () => {
        try {
          await deletePlanMutation.mutateAsync({ id });
          onDelete(id);
        } catch (err: any) {
          showToast(err?.response?.data?.message || err?.message || "Failed to delete plan", "error");
        }
      }
    );
  };

  const handleToggle = async (plan: CorporatePlan) => {
    try {
      await updateStatusMutation.mutateAsync({ id: plan.id, status: plan.isActive ? 'INACTIVE' : 'ACTIVE' });
      onToggle(plan.id);
      showToast(`Plan ${plan.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || "Failed to update status");
    }
  };

  const openNew = () => { setEditing(null); setShowForm(true); };
  const openEdit = (p: CorporatePlan) => { setEditing(p); setShowForm(true); };

  const totalMembers = plans.reduce((s, p) => s + p.currentMembers, 0);
  const activePlans = plans.filter(p => p.isActive).length;

  return (
    <div className="space-y-3">
      <PageHeader
        title="Plans"
        subtitle={`${activePlans} active plan${activePlans !== 1 ? 's' : ''} & ${totalMembers} enrolled member${totalMembers !== 1 ? 's' : ''}`}
        action={
          <Button onClick={openNew} className="gap-2 shadow-lg shadow-primary/10">
            {categoryFilter === 'individual' ? <UserPlus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {categoryFilter === 'individual' ? 'Create Individual Plan' : 'Create New Plan'}
          </Button>
        }
      >
        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl">
          <Button
            variant={tab === "plans" ? "default" : "ghost"}
            onClick={() => setTab("plans")}
            className={`gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${tab === "plans" ? "shadow-sm" : ""}`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Corporate Plans
          </Button>
          <Button
            variant={tab === "employees" ? "default" : "ghost"}
            onClick={() => setTab("employees")}
            className={`gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${tab === "employees" ? "shadow-sm" : ""}`}
          >
            <Users className="w-3.5 h-3.5" />
            Employee Management
          </Button>
        </div>
      </PageHeader>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-primary/80 font-medium leading-relaxed">
          Plans created here are available company-wide. When registering a patient, staff can map them to a plan, discounts and benefits apply automatically in the billing engine.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="text" placeholder="Search plans, companies" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold" />
        </div>
        {/* Category filter */}
        <div className="flex p-1 bg-muted rounded-xl border border-border">
          {([
            { value: 'all', label: 'All' },
            { value: 'corporate', label: 'Corporate' },
            { value: 'individual', label: 'Individual' },
          ] as { value: 'all' | PlanCategory; label: string }[]).map(c => (
            <Button key={c.value} variant={categoryFilter === c.value ? "default" : "ghost"} onClick={() => setCategoryFilter(c.value)}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all rounded-lg ${categoryFilter === c.value ? "shadow-sm" : ""}`}>
              {c.label}
            </Button>
          ))}
        </div>
        <div className="flex p-1 bg-muted rounded-xl border border-border">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <Button key={f} variant={filter === f ? "default" : "ghost"} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all rounded-lg ${filter === f ? "shadow-sm" : ""}`}>
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      {isLoading ? (
        <Loading type="spinner" text="Fetching corporate plans..." className="py-24 bg-card rounded-[2.5rem] border border-border shadow-sm" />
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-[2.5rem] border-2 border-dashed border-border/50">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">No plans found</p>
          <p className="text-muted-foreground/60 text-xs mt-2 font-medium">Create your first corporate plan to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(plan => (
            <CorporatePlanCard
              key={plan.id}
              plan={plan}
              BENEFIT_LABELS={BENEFIT_LABELS}
              isUpdatingStatus={updateStatusMutation.isPending || (updateStatusMutation as any).isPending}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggle={() => handleToggle(plan)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <CorporatePlanFormModal
        showForm={showForm}
        setShowForm={setShowForm}
        editing={editing}
        onSave={onSave}
      />
    </div>
  );
}
