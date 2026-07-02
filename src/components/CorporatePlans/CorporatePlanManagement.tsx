import React, { useState } from 'react';
import { Plus, Zap, CreditCard } from 'lucide-react';
import { CorporatePlan, PlanCategory } from '../../types';
import { Button, Loading, SearchInput, FilterTabs, Pagination } from '../ui';
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
  category?: 'all' | string;
  onCategoryChange?: (val: 'all' | string) => void;
  isLoading?: boolean;
  onGoToRegister?: () => void;
}

export function CorporatePlanManagement({
  plans, onSave, onDelete, onToggle,
  search: propSearch, onSearchChange: propOnSearchChange,
  filter: propFilter, onFilterChange: propOnFilterChange,
  category: propCategory, onCategoryChange: propOnCategoryChange,
  isLoading, onGoToRegister,
}: Props) {
  const { showToast, confirmDelete, showConfirm } = useModal();
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
  const [localCategoryFilter, setLocalCategoryFilter] = useState<'all' | PlanCategory>('all');

  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const search = propSearch !== undefined ? propSearch : localSearch;
  const setSearch = propOnSearchChange || setLocalSearch;
  const filter = propFilter !== undefined ? propFilter : localFilter;
  const setFilter = propOnFilterChange || setLocalFilter;
  const categoryFilter = propCategory !== undefined ? (propCategory as 'all' | PlanCategory) : localCategoryFilter;
  const setCategoryFilter = propOnCategoryChange || setLocalCategoryFilter;

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

  const handleToggle = (plan: CorporatePlan) => {
    showConfirm(
      'Update Status',
      `Are you sure you want to ${plan.isActive ? 'deactivate' : 'activate'} this plan?`,
      async () => {
        try {
          await updateStatusMutation.mutateAsync({ id: plan.id, status: plan.isActive ? 'INACTIVE' : 'ACTIVE' });
          onToggle(plan.id);
          showToast(`Plan ${plan.isActive ? 'deactivated' : 'activated'}`);
        } catch (err: any) {
          throw err;
        }
      }
    );
  };

  const openNew = () => { setEditing(null); setShowForm(true); };
  const openEdit = (p: CorporatePlan) => { setEditing(p); setShowForm(true); };

  const CATEGORY_TABS = [
    { value: 'all', label: 'All Plans' },
    { value: 'corporate', label: 'COMPANY' },
    { value: 'individual', label: 'INDIVIDUAL' },
  ] as { value: 'all' | PlanCategory; label: string }[];

  const STATUS_TABS = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ] as { value: 'all' | 'active' | 'inactive'; label: string }[];

  return (
    <div className="space-y-5">

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50/50 rounded-2xl border border-border/50 w-full">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px] sm:min-w-[240px]">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search plans or company…"
            className="w-full"
          />
        </div>

        {/* Filter Tabs */}
        <div className="shrink-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterTabs
            tabs={CATEGORY_TABS}
            active={categoryFilter}
            onChange={(val) => setCategoryFilter(val as any)}
          />
        </div>
        <div className="shrink-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterTabs
            tabs={STATUS_TABS}
            active={filter}
            onChange={(val) => setFilter(val as any)}
          />
        </div>

        {/* Action Button */}
        <div className="flex w-full sm:w-auto items-center shrink-0 sm:ml-auto">
          <Button onClick={openNew} className="gap-2 h-10 w-full sm:w-auto rounded-xl shadow-md shadow-primary/15 bg-primary text-white hover:bg-primary/90 transition-all px-4 justify-center">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
          {paginatedData.map((plan, index) => (
            <CorporatePlanCard
              key={`${plan.id}-${index}`}
              plan={plan}
              BENEFIT_LABELS={BENEFIT_LABELS}
              isUpdatingStatus={updateStatusMutation.isPending}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggle={() => handleToggle(plan)}
              expanded={expandedPlanId === plan.id}
              onToggleExpand={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && !isLoading && filtered.length > 0 && (
        <div className="py-4 px-6 border border-border/50 bg-card rounded-2xl shadow-sm mt-6">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            perPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
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
