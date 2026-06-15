import { Input } from "@/components/ui/Input";
import React, { useState } from 'react';
import { Plus, Search, Zap, SlidersHorizontal, CreditCard } from 'lucide-react';
import { CorporatePlan, PlanCategory } from '../../types';
import { Button, Loading } from '../ui';
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
  onGoToRegister?: () => void;
}

export function CorporatePlanManagement({
  plans, onSave, onDelete, onToggle,
  search: propSearch, onSearchChange: propOnSearchChange,
  filter: propFilter, onFilterChange: propOnFilterChange,
  isLoading, onGoToRegister,
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

  const search    = propSearch     !== undefined ? propSearch     : localSearch;
  const setSearch = propOnSearchChange            || setLocalSearch;
  const filter    = propFilter     !== undefined ? propFilter     : localFilter;
  const setFilter = propOnFilterChange            || setLocalFilter;

  const filtered = plans.filter(p => {
    const matchCat =
      categoryFilter === 'all' ? true :
      categoryFilter === 'corporate' ? (!p.planCategory || p.planCategory === 'corporate') :
      p.planCategory === 'individual';
    const matchStatus =
      filter === 'all' ? true :
      filter === 'active' ? p.isActive : !p.isActive;
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  const handleDelete = (id: string) => {
    confirmDelete('Delete Plan', 'This plan will be permanently removed. Members on this plan will be affected.', async () => {
      try {
        await deletePlanMutation.mutateAsync({ id });
        onDelete(id);
        showToast('Plan deleted');
      } catch (err: any) {
        showToast(err?.response?.data?.message || err?.message || 'Failed to delete plan', 'error');
      }
    });
  };

  const handleToggle = async (plan: CorporatePlan) => {
    try {
      await updateStatusMutation.mutateAsync({ id: plan.id, status: plan.isActive ? 'INACTIVE' : 'ACTIVE' });
      onToggle(plan.id);
      showToast(`Plan ${plan.isActive ? 'deactivated' : 'activated'}`);
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to update status', 'error');
    }
  };

  const openNew  = () => { setEditing(null); setShowForm(true); };
  const openEdit = (p: CorporatePlan) => { setEditing(p); setShowForm(true); };

  const CATEGORY_TABS = [
    { value: 'all',        label: 'All Plans' },
    { value: 'corporate',  label: 'Company' },
    { value: 'individual', label: 'Personal' },
  ] as { value: 'all' | PlanCategory; label: string }[];

  const STATUS_TABS = [
    { value: 'all',      label: 'All' },
    { value: 'active',   label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ] as { value: 'all' | 'active' | 'inactive'; label: string }[];

  return (
    <div className="space-y-5">

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-56 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search plans or company…"
            className="pl-10 h-10 rounded-xl border-border/60 bg-card shadow-xs"
          />
        </div>

        {/* Category segmented */}
        <div className="flex bg-muted/70 rounded-xl p-1 border border-border/60 gap-0.5">
          {CATEGORY_TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setCategoryFilter(t.value)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                categoryFilter === t.value
                  ? 'bg-card text-foreground shadow-sm border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Status segmented */}
        <div className="flex bg-muted/70 rounded-xl p-1 border border-border/60 gap-0.5">
          {STATUS_TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                filter === t.value
                  ? 'bg-card text-foreground shadow-sm border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Spacer + actions */}
        <div className="flex items-center gap-2 ml-auto">
          {onGoToRegister && (
            <Button variant="outline" onClick={onGoToRegister} className="gap-2 h-10 rounded-xl shadow-xs">
              <Zap className="w-4 h-4 text-amber-500" />
              Quick Register
            </Button>
          )}
          <Button onClick={openNew} className="gap-2 h-10 rounded-xl shadow-sm shadow-primary/20">
            <Plus className="w-4 h-4" />
            New Plan
          </Button>
        </div>
      </div>

      {/* ── Results count ────────────────────────────────────────────────── */}
      {!isLoading && plans.length > 0 && (
        <p className="text-xs text-muted-foreground font-medium">
          Showing <span className="font-bold text-foreground">{filtered.length}</span> of {plans.length} plans
          {search && <> matching "<span className="text-primary">{search}</span>"</>}
        </p>
      )}

      {/* ── Plan grid ────────────────────────────────────────────────────── */}
      {isLoading ? (
        <Loading type="spinner" text="Loading membership plans…" className="py-28 bg-muted/20 rounded-2xl border border-dashed border-border" />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 gap-5 bg-muted/20 rounded-2xl border-2 border-dashed border-border/60">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <div className="text-center">
            <p className="font-bold text-foreground text-sm">
              {search ? 'No plans match your search' : 'No membership plans yet'}
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              {search ? 'Try a different search term' : 'Create your first plan to start enrolling members'}
            </p>
          </div>
          {!search && (
            <Button onClick={openNew} className="gap-2">
              <Plus className="w-4 h-4" /> Create First Plan
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(plan => (
            <CorporatePlanCard
              key={plan.id}
              plan={plan}
              BENEFIT_LABELS={BENEFIT_LABELS}
              isUpdatingStatus={updateStatusMutation.isPending}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggle={() => handleToggle(plan)}
            />
          ))}
        </div>
      )}

      <CorporatePlanFormModal
        showForm={showForm}
        setShowForm={setShowForm}
        editing={editing}
        onSave={onSave}
      />
    </div>
  );
}
