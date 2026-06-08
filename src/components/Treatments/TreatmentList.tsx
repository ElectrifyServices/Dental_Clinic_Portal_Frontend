import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, Plus, Clock, CheckCircle, Calendar,
  Stethoscope, ChevronLeft, ChevronRight,
  Filter, X, Loader2,
} from "lucide-react";
import { TreatmentStats } from "./TreatmentList/TreatmentStats";
import { TreatmentTableRow } from "./TreatmentList/TreatmentTableRow";
import { ContentCard, Button } from "@/components/ui";

// ─── Status maps ──────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  completed: {
    label: "Completed",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  "in-progress": {
    label: "In Progress",
    cls: "bg-primary/10 text-primary border-primary/20",
    icon: <Clock className="w-3 h-3" />,
  },
  planned: {
    label: "Planned",
    cls: "bg-amber-50 text-amber-700 border-amber-100",
    icon: <Calendar className="w-3 h-3" />,
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-red-50 text-red-600 border-red-100",
    icon: <X className="w-3 h-3" />,
  },
};

// FIX: UI statuses ("in-progress") → API enums ("IN_PROGRESS")
const UI_TO_API_STATUS: Record<string, string> = {
  planned:      "PLANNED",
  "in-progress":"IN_PROGRESS",
  completed:    "COMPLETED",
  cancelled:    "CANCELLED",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface TreatmentListProps {
  // Data comes from parent (React Query) — no callback-based fetching
  treatments: any[];
  totals: { all: number; active: number; completed: number; planned: number; revenue: number };
  isLoading: boolean;
  totalItems: number;
  totalPages: number;
  currentPage: number;

  // Called when user changes search/filter/page — parent updates React Query params
  onParamsChange: (params: {
    page: number;
    search: string;
    filters: { status?: string[] };
    startDate?: Date;
    endDate?: Date;
  }) => void;

  onAddTreatment: () => void;
  onViewTreatment: (id: string) => void;
  onEditTreatment: (id: string) => void;
  onManageSessions: (id: string) => void;
  onMarkCompleted: (id: string) => void;
  onStartTreatment: (id: string) => void;
}

interface AdvancedFilters {
  dateFrom?: Date;
  dateTo?: Date;
}

const PER_PAGE = 10;


export function TreatmentList({
  treatments,
  totals,
  isLoading,
  totalItems,
  totalPages,
  currentPage,
  onParamsChange,
  onAddTreatment,
  onViewTreatment,
  onEditTreatment,
  onManageSessions,
  onMarkCompleted,
  onStartTreatment,
}: TreatmentListProps) {
  const [search,              setSearch]              = useState("");
  const [statusFilter,        setStatusFilter]        = useState<string[]>([]);   // UI values
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters,     setAdvancedFilters]     = useState<AdvancedFilters>({});

  // Debounce ref so search doesn't fire on every keystroke
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Notify parent whenever search/filter/page changes
  const notify = useCallback((
    overrides: Partial<{ page: number; search: string; statusFilter: string[]; adv: AdvancedFilters }>
  ) => {
    const s  = overrides.search       !== undefined ? overrides.search       : search;
    const sf = overrides.statusFilter !== undefined ? overrides.statusFilter : statusFilter;
    const p  = overrides.page         !== undefined ? overrides.page         : currentPage;
    const adv = overrides.adv ?? advancedFilters;

    // FIX: convert UI status array → API enum array before sending
    const apiStatuses = sf.map(st => UI_TO_API_STATUS[st]).filter(Boolean);

    onParamsChange({
      page:    p,
      search:  s,
      filters: apiStatuses.length ? { status: apiStatuses } : {},
      startDate: adv.dateFrom,
      endDate:   adv.dateTo,
    });
  }, [search, statusFilter, currentPage, advancedFilters, onParamsChange]);

  // Search — debounced 400 ms
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => notify({ search: val, page: 1 }), 400);
  };

  const handleStatusFilter = (s: string) => {
    let next: string[];
    if (s === "all") {
      next = [];
    } else {
      next = statusFilter.includes(s)
        ? statusFilter.filter(x => x !== s)
        : [...statusFilter, s];
    }
    setStatusFilter(next);
    notify({ statusFilter: next, page: 1 });
  };

  const handlePageChange = (p: number) => notify({ page: p });

  const handleAdvancedChange = (patch: Partial<AdvancedFilters>) => {
    const next = { ...advancedFilters, ...patch };
    setAdvancedFilters(next);
    notify({ adv: next, page: 1 });
  };

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter([]);
    setAdvancedFilters({});
    onParamsChange({ page: 1, search: "", filters: {} });
  };

  const activeFilterCount = [
    !!search,
    statusFilter.length > 0,
    !!advancedFilters.dateFrom || !!advancedFilters.dateTo,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary/5 p-6 rounded-3xl border border-primary/10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shadow-sm border border-primary/20">
            <Stethoscope className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Treatment Plans</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                {totalItems} Records Total
              </span>
              <span className="w-1 h-1 bg-muted rounded-full" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                ₹{totals.revenue.toLocaleString()} Projected
              </span>
            </div>
          </div>
        </div>
        <Button onClick={onAddTreatment} size="lg" className="h-12 px-6 shadow-xl shadow-primary/10 gap-2">
          <Plus className="w-4 h-4" /> New Treatment Plan
        </Button>
      </div>

      <TreatmentStats totals={totals} isLoading={isLoading} />

      {/* Filter bar */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by patient, procedure, tooth or doctor…"
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 text-sm border border-border rounded-xl bg-muted/50 focus:bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium"
            />
          </div>

          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 w-full lg:w-auto overflow-hidden">
            {/* Quick status tabs */}
            <div className="flex items-center bg-muted p-1 rounded-xl border border-border/50 overflow-x-auto scrollbar-none max-w-full flex-nowrap shrink-0">
              {(["all", "planned", "in-progress", "completed"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusFilter(s)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shrink-0 ${
                    (s === "all" && statusFilter.length === 0) ||
                    (s !== "all" && statusFilter.includes(s))
                      ? "bg-card text-primary shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s === "all" ? "All Plans" : STATUS_META[s]?.label ?? s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto lg:ml-0">
              {/* Advanced filters toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(v => !v)}
                className="gap-2 shrink-0"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px]">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-1 text-muted-foreground shrink-0">
                  <X className="w-3 h-3" /> Clear all
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Advanced filters panel */}
        {showAdvancedFilters && (
          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Date Range Filter</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">From Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-muted/50 focus:bg-card focus:ring-2 focus:ring-primary/10 outline-none"
                  value={advancedFilters.dateFrom?.toISOString().split("T")[0] ?? ""}
                  onChange={(e) => handleAdvancedChange({
                    dateFrom: e.target.value ? new Date(e.target.value) : undefined,
                  })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">To Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-muted/50 focus:bg-card focus:ring-2 focus:ring-primary/10 outline-none"
                  value={advancedFilters.dateTo?.toISOString().split("T")[0] ?? ""}
                  onChange={(e) => handleAdvancedChange({
                    dateTo: e.target.value ? new Date(e.target.value) : undefined,
                  })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <ContentCard
        bodyClassName="p-0 overflow-hidden"
        className="rounded-3xl"
        footer={
          totalPages > 1 ? (
            <div className="flex items-center justify-between w-full">
              <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                Showing {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, totalItems)} of {totalItems}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1 || isLoading} className="h-8 w-8 p-0">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, currentPage - 3), currentPage + 2)
                  .map(p => (
                    <Button key={p} variant={p === currentPage ? "default" : "outline"} size="sm" onClick={() => handlePageChange(p)} disabled={isLoading} className="h-8 w-8 p-0 text-[10px] font-bold">
                      {p}
                    </Button>
                  ))}
                <Button variant="outline" size="sm" onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || isLoading} className="h-8 w-8 p-0">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : null
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {["Patient & Procedure", "Tooth", "Doctor", "Date", "Cost", "Status", "Next Session", "Actions"].map((h, i) => (
                  <th key={h} className={`px-6 py-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest ${i === 4 ? "text-right" : i === 7 ? "text-center" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                // Skeleton rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-muted rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : treatments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-muted rounded-[2rem] flex items-center justify-center mb-4 ring-8 ring-muted/20">
                        <Stethoscope className="w-10 h-10 text-muted-foreground/40" />
                      </div>
                      <h3 className="text-sm font-black text-foreground uppercase tracking-widest">No treatments found</h3>
                      <p className="text-xs font-medium text-muted-foreground/60 mt-1 max-w-[200px]">
                        {search || statusFilter.length ? "Adjust your search or clear filters." : "Create a new treatment plan."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                treatments.map(t => (
                  <TreatmentTableRow
                    key={t.id}
                    treatment={t}
                    statusMeta={STATUS_META}
                    onView={onViewTreatment}
                    onEdit={onEditTreatment}
                    onManageSessions={onManageSessions}
                    onStart={onStartTreatment}
                    onComplete={onMarkCompleted}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </div>
  );
}
