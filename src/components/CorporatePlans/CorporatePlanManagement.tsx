import type { ApiAny } from "../../types/api";
import React, { useState } from 'react';
import { Plus, CreditCard, Filter, X } from 'lucide-react';
import { CorporatePlan, PlanCategory } from '../../types';
import { Button, Loading, SearchInput, Pagination, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label, FilterContainer } from '../ui';
import { cn } from '@/lib/utils';
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
  isLoading, onGoToRegister: _onGoToRegister,
}: Props) {
  const { showToast, confirmDelete, showConfirm } = useModal();
  const deletePlanMutation = useDeleteCorporatePlanMutation();
  const updateStatusMutation = useUpdateCorporatePlanStatusMutation();
  const cfg = useFormConfig('corporate');
  const BENEFIT_LABELS: Record<string, string> = Object.fromEntries(
    ((cfg as ApiAny).benefitTypes ?? []).map((b: ApiAny) => [b.value, b.label])
  );

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CorporatePlan | null>(null);
  const [localSearch, setLocalSearch] = useState('');
  const [localFilter, setLocalFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [localCategoryFilter, setLocalCategoryFilter] = useState<'all' | PlanCategory>('all');

  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    confirmDelete('Delete Plan', 'This plan will be permanently removed. Members on this plan will be affected.', async () => {
      try {
        await deletePlanMutation.mutateAsync({ id });
        onDelete(id);
        showToast('Plan deleted');
      } catch (err: ApiAny) {
        showToast(err?.response?.data?.message || err?.message || 'Failed to delete plan', 'error');
      }
    });
  };

  const handleToggle = (plan: CorporatePlan) => {
    showConfirm(
      'Update Status',
      `Are you sure you want to ${plan.isActive ? 'deactivate' : 'activate'} this plan?`,
      async () => {
        await updateStatusMutation.mutateAsync({ id: plan.id, status: plan.isActive ? 'INACTIVE' : 'ACTIVE' });
        onToggle(plan.id);
        showToast(`Plan ${plan.isActive ? 'deactivated' : 'activated'}`);
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
    <div className="flex-1 min-h-0 flex flex-col gap-4">

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <FilterContainer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        className="shrink-0 space-y-3"
      >
        <div className="flex items-center gap-2 p-3 bg-slate-50/50 rounded-2xl border border-border/50 w-full">
          <div className="flex-1 min-w-0">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search plans or company…"
              className="w-full"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "h-10 gap-2 shrink-0",
              (categoryFilter !== "all" || filter !== "all") && "border-primary bg-primary/10 text-primary hover:bg-primary/15"
            )}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {(categoryFilter !== "all" || filter !== "all") && (
              <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px]">
                {[categoryFilter !== "all", filter !== "all"].filter(Boolean).length}
              </span>
            )}
          </Button>

          {(categoryFilter !== "all" || filter !== "all") && (
            <Button
              variant="ghost"
              onClick={() => {
                setCategoryFilter("all");
                setFilter("all");
              }}
              className="h-10 gap-1 text-muted-foreground shrink-0"
            >
              <X className="w-3 h-3" /> <span className="hidden sm:inline">Clear</span>
            </Button>
          )}

          <div className="shrink-0">
            <Button onClick={openNew} className="gap-2 h-10 rounded-xl shadow-md shadow-primary/15 bg-primary text-white hover:bg-primary/90 transition-all px-4 justify-center">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Plan</span>
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <Label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Category</Label>
                <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val as ApiAny)}>
                  <SelectTrigger className="w-full h-10 rounded-xl text-xs bg-muted/50 border-border/60">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_TABS.map(tab => (
                      <SelectItem key={tab.value} value={tab.value} className="text-xs">
                        {tab.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Status</Label>
                <Select value={filter} onValueChange={(val) => setFilter(val as ApiAny)}>
                  <SelectTrigger className="w-full h-10 rounded-xl text-xs bg-muted/50 border-border/60">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_TABS.map(tab => (
                      <SelectItem key={tab.value} value={tab.value} className="text-xs">
                        {tab.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </FilterContainer>

      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto gap-4">
        {/* ── Results count ────────────────────────────────────────────────── */}
        {!isLoading && plans.length > 0 && (
          <p className="text-xs text-muted-foreground font-medium shrink-0">
            Showing <span className="font-bold text-foreground">{filtered.length}</span> of {plans.length} plans
            {search && <> matching "<span className="text-primary">{search}</span>"</>}
          </p>
        )}

        {/* ── Plan grid ────────────────────────────────────────────────────── */}
        {isLoading ? (
          <Loading type="spinner" text="Loading membership plans…" className="py-28 bg-muted/20 rounded-2xl border border-dashed border-border" />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-5 bg-muted/20 rounded-2xl border-2 border-dashed border-border/60 flex-1">
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
          <div className="columns-1 md:columns-2 xl:columns-3 gap-4 [column-fill:balance] flex-1">
            {paginatedData.map((plan, index) => (
              <div key={`${plan.id}-${index}`} className="break-inside-avoid mb-4">
                <CorporatePlanCard
                  plan={plan}
                  BENEFIT_LABELS={BENEFIT_LABELS}
                  isUpdatingStatus={updateStatusMutation.isPending}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onToggle={() => handleToggle(plan)}
                  expanded={expandedPlanId === plan.id}
                  onToggleExpand={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                />
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="py-3 px-4 border border-border/50 bg-card rounded-2xl shadow-sm">
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              perPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onPerPageChange={handlePerPageChange}
            />
          </div>
        )}
      </div>

      <CorporatePlanFormModal
        showForm={showForm}
        setShowForm={setShowForm}
        editing={editing}
        onSave={onSave}
      />
    </div>
  );
}
