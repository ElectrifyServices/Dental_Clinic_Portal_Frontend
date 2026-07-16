import React, { useCallback, useRef, useState } from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import {
  Search,
  Plus,
  Clock,
  CheckCircle,
  Calendar,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Loader2,
  FileText,
  Edit,
  Play,
  MoreVertical,
  Download,
  MessageCircle,
} from "lucide-react";
import {
  Button,
  ContentCard,
  DataTable,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Loading,
  PageHeader,
  SearchableSelect,
  toast,
} from "@/components/ui";
import { TreatmentStats } from "./TreatmentList/TreatmentStats";
import { downloadCompletedTreatmentPDF } from "../../utils/pdfGenerator";
import { useDownloadTreatmentMutation } from "../../hooks/treatment/useDownloadTreatmentMutation";
import { useSendWhatsappTreatmentMutation } from "../../hooks/treatment/useSendWhatsappTreatmentMutation";
import { usePatientTreatmentPlansQuery } from "../../hooks/treatment/usePatientTreatmentPlansQuery";
import { useDoctorsListQuery } from "../../hooks/staff/useDoctorsListQuery";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { toUiTreatment } from "../../utils/treatmentPlanUtils";
import { procedures as procedureCatalog } from "../../constants/treatment.constants";

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

const UI_TO_API_STATUS: Record<string, string> = {
  planned: "PLANNED",
  "in-progress": "IN_PROGRESS",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

interface TreatmentListProps {
  treatments: any[];
  totals: { all: number; active: number; completed: number; planned: number; revenue: number };
  isLoading: boolean;
  isTableFetching?: boolean;
  isStatsLoading?: boolean;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  onParamsChange: (params: {
    page: number;
    search: string;
    filters: { status?: string[]; doctorId?: string[]; procedure?: string[] };
    startDate?: Date;
    endDate?: Date;
  }) => void;
  onAddTreatment: () => void;
  onViewTreatment: (id: string) => void;
  onEditTreatment: (id: string) => void;
  onManageSessions: (id: string) => void;
  onStartTreatment: (id: string) => void;
}

interface AdvancedFilters {
  dateFrom?: Date;
  dateTo?: Date;
  doctorId?: string;
  procedure?: string;
}

interface ExpandedTreatmentRowProps {
  patientId?: string;
  fallbackRowId?: string;
  onViewTreatment: (id: string) => void;
  onEditTreatment: (id: string) => void;
  onManageSessions: (id: string) => void;
  onStartTreatment: (id: string) => void;
  onDownloadPDF: (id: string) => void;
  onSendWhatsApp: (id: string) => void;
  downloadingId: string | null;
  sendingWhatsappId: string | null;
}

const PER_PAGE = 10;

function formatDate(value?: string | Date | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(
    "en-IN",
    options ?? { day: "2-digit", month: "short", year: "numeric" }
  );
}

function formatCurrency(value?: string | number | null) {
  const amount = Number(value || 0);
  const safeAmount = Number.isFinite(amount) && amount < 100_000_000 ? amount : 0;
  return `₹${safeAmount.toLocaleString("en-IN")}`;
}

function normalizeStatus(status?: string) {
  return String(status || "").toLowerCase().replace(/_/g, "-");
}

function StatusPill({ status }: { status: string }) {
  const sm = STATUS_META[normalizeStatus(status)] || STATUS_META.planned;
  return (
    <span
      className={`${sm.cls} inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border`}
    >
      {sm.icon}
      {sm.label}
    </span>
  );
}

function extractTreatmentPlans(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.responseObject?.data?.data)) return payload.responseObject.data.data;
  if (Array.isArray(payload?.responseObject?.data)) return payload.responseObject.data;
  return [];
}

function ExpandedTreatmentRow({
  patientId,
  fallbackRowId,
  onViewTreatment,
  onEditTreatment,
  onManageSessions,
  onStartTreatment,
  onDownloadPDF,
  onSendWhatsApp,
  downloadingId,
  sendingWhatsappId,
}: ExpandedTreatmentRowProps) {
  const resolvedPatientId = patientId || fallbackRowId;
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePatientTreatmentPlansQuery(resolvedPatientId, {
    enabled: !!resolvedPatientId,
    limit: 10,
  });

  const rawPlans = (data?.pages ?? []).flatMap((page) => extractTreatmentPlans(page));
  const plans = rawPlans.map(toUiTreatment);
  const loadMoreRef = useInfiniteScroll({
    enabled: !!resolvedPatientId,
    hasMore: !!hasNextPage,
    isLoading: isLoading || isFetchingNextPage,
    onLoadMore: () => {
      void fetchNextPage();
    },
  });

  if (!resolvedPatientId) {
    return (
      <div className="px-6 py-4 text-sm text-muted-foreground">
        Patient details are unavailable for this row.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-6 py-5">
        <Loading type="spinner" text="Loading patient treatments..." />
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="px-6 py-4 text-sm text-muted-foreground">
        No treatment plans found for this patient.
      </div>
    );
  }

  const expandedColumns = [
    {
      key: "index",
      header: "#",
      className: "w-16",
      render: (_plan: any, index: number) => (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs font-black text-primary">
          {index + 1}
        </span>
      ),
    },
    {
      key: "procedure",
      header: "Procedure",
      render: (plan: any) => (
        <div className="space-y-1">
          <div className="text-sm font-bold text-foreground">{plan.procedure || "Treatment Plan"}</div>
          {plan.notes ? (
            <div className="text-xs text-muted-foreground line-clamp-2">{plan.notes}</div>
          ) : null}
        </div>
      ),
    },
    {
      key: "tooth",
      header: "Tooth",
      render: (plan: any) => <span className="text-sm font-semibold text-foreground">{plan.tooth || "-"}</span>,
    },
    {
      key: "doctor",
      header: "Doctor",
      render: (plan: any) => <span className="text-sm font-semibold text-muted-foreground">{plan.doctorName || "-"}</span>,
    },
    {
      key: "date",
      header: "Date",
      render: (plan: any) => <span className="text-sm font-medium text-muted-foreground">{formatDate(plan.date)}</span>,
    },
    {
      key: "cost",
      header: "Cost",
      align: "right" as const,
      render: (plan: any) => <span className="text-sm font-black text-foreground">{formatCurrency(plan.cost)}</span>,
    },
    {
      key: "nextSession",
      header: "Next Session",
      render: (plan: any) => {
        const sessions: any[] = plan.sessions ?? [];
        const completedSessions = sessions.filter((session: any) => {
          const status = normalizeStatus(session.status);
          return status === "completed";
        }).length;
        const totalSessions = Math.max(
          Number(plan.total_sessions ?? plan.totalSessions ?? 0),
          sessions.length,
        );
        const nextSessionLabel = formatDate(plan.nextAppointment);
        const hasNextSession = nextSessionLabel && nextSessionLabel !== "-";
        const dotsToRender = totalSessions > 0 ? totalSessions : 1;

        return (
          <div className="flex min-w-[96px] flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              {hasNextSession ? (
                <>
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/65" />
                  <span className="text-sm font-bold text-foreground">{nextSessionLabel}</span>
                </>
              ) : (
                <span className="text-sm font-semibold text-muted-foreground/45">-</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                {Array.from({ length: dotsToRender }, (_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full ${
                      index < completedSessions ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-black text-slate-300">
                {completedSessions}/{totalSessions}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (plan: any) => <StatusPill status={plan.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: (plan: any) => {
        const isCompleted = normalizeStatus(plan.status) === "completed";
        const isPlanned = normalizeStatus(plan.status) === "planned";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-xl p-0 text-muted-foreground hover:bg-muted">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-2xl">
              <DropdownMenuItem
                onClick={() => onViewTreatment(plan.id)}
                className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-muted-foreground cursor-pointer"
              >
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                View Details
              </DropdownMenuItem>

              {isCompleted && (
                <>
                  <DropdownMenuItem
                    onClick={() => onDownloadPDF(plan.id)}
                    disabled={downloadingId === plan.id}
                    className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-muted-foreground cursor-pointer disabled:opacity-50"
                  >
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      {downloadingId === plan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </div>
                    Download PDF
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onSendWhatsApp(plan.id)}
                    disabled={sendingWhatsappId === plan.id}
                    className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-muted-foreground cursor-pointer disabled:opacity-50"
                  >
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      {sendingWhatsappId === plan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    Send WhatsApp
                  </DropdownMenuItem>
                </>
              )}

              {!isCompleted && (
                <DropdownMenuItem
                  onClick={() => onEditTreatment(plan.id)}
                  className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-muted-foreground cursor-pointer"
                >
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <Edit className="w-4 h-4" />
                  </div>
                  Edit Plan
                </DropdownMenuItem>
              )}

              {!isCompleted && (
                <DropdownMenuItem
                  onClick={() => onManageSessions(plan.id)}
                  className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-muted-foreground cursor-pointer"
                >
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  Sessions
                </DropdownMenuItem>
              )}

              {isPlanned && (
                <DropdownMenuItem
                  onClick={() => onStartTreatment(plan.id)}
                  className="px-3.5 py-2.5 text-xs font-bold hover:bg-primary/10 rounded-xl flex items-center gap-3 text-primary cursor-pointer"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Play className="w-4 h-4" />
                  </div>
                  Start Now
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="w-full min-w-0 px-2 pt-1 pb-2 sm:px-4">
      <div className="max-w-full min-w-0 space-y-3">
        <DataTable
          columns={expandedColumns}
          data={plans}
          rowKey={(plan) => plan.id}
          rowClassName={() => "bg-white"}
          disableRowAnimation
          className="rounded-2xl border border-border bg-card shadow-none transition-none [&_.data-table]:min-w-[980px]"
          scrollClassName="overflow-x-auto overflow-y-visible touch-pan-x [-webkit-overflow-scrolling:touch]"
        />

        {isFetchingNextPage ? (
          <div className="flex items-center justify-center py-3 text-xs font-semibold text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading more treatment plans...
          </div>
        ) : null}

        {hasNextPage ? <div ref={loadMoreRef} className="h-2 w-full" /> : null}
      </div>
    </div>
  );
}

export function TreatmentList({
  treatments,
  totals,
  isLoading,
  isTableFetching = false,
  isStatsLoading = false,
  totalItems,
  totalPages,
  currentPage,
  onParamsChange,
  onAddTreatment,
  onViewTreatment,
  onEditTreatment,
  onManageSessions,
  onStartTreatment,
}: TreatmentListProps) {
  const [search, setSearch] = useState("");
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [sendingWhatsappId, setSendingWhatsappId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  const [doctorSearch, setDoctorSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const { mutateAsync: downloadTreatment } = useDownloadTreatmentMutation();
  const { mutateAsync: sendWhatsapp } = useSendWhatsappTreatmentMutation();
  const { doctors, isLoading: isDoctorsLoading } = useDoctorsListQuery(doctorSearch);

  const handleDownloadPDF = async (id: string) => {
    try {
      setDownloadingId(id);
      toast.loading("Generating PDF...", { id: "pdf-download" });
      const data = await downloadTreatment({ id });
      await downloadCompletedTreatmentPDF(data);
      toast.success("PDF downloaded successfully!", { id: "pdf-download" });
    } catch (err: any) {
      toast.error("Failed to download PDF: " + (err.message || ""), { id: "pdf-download" });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSendWhatsApp = async (id: string) => {
    try {
      setSendingWhatsappId(id);
      toast.loading("Sending via WhatsApp...", { id: "whatsapp-send" });
      await sendWhatsapp({ id });
      toast.success("Treatment plan sent to WhatsApp successfully", { id: "whatsapp-send" });
    } catch (err: any) {
      toast.error("Failed to send WhatsApp: " + (err.message || "Unknown error"), { id: "whatsapp-send" });
    } finally {
      setSendingWhatsappId(null);
    }
  };

  const notify = useCallback(
    (overrides: Partial<{ page: number; search: string; statusFilter: string[]; adv: AdvancedFilters }>) => {
      const s = overrides.search !== undefined ? overrides.search : search;
      const sf = overrides.statusFilter !== undefined ? overrides.statusFilter : statusFilter;
      const p = overrides.page !== undefined ? overrides.page : currentPage;
      const adv = overrides.adv ?? advancedFilters;
      const apiStatuses = sf.map((st) => UI_TO_API_STATUS[st]).filter(Boolean);

      onParamsChange({
        page: p,
        search: s,
        filters: {
          ...(apiStatuses.length ? { status: apiStatuses } : {}),
          ...(adv.doctorId ? { doctorId: [adv.doctorId] } : {}),
          ...(adv.procedure ? { procedure: [adv.procedure] } : {}),
        },
        startDate: adv.dateFrom,
        endDate: adv.dateTo,
      });
    },
    [search, statusFilter, currentPage, advancedFilters, onParamsChange]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => notify({ search: value, page: 1 }), 400);
  };

  const handleStatusFilter = (status: string) => {
    let next: string[];
    if (status === "all") {
      next = [];
    } else {
      next = statusFilter.includes(status)
        ? statusFilter.filter((item) => item !== status)
        : [...statusFilter, status];
    }
    setStatusFilter(next);
    notify({ statusFilter: next, page: 1 });
  };

  const handlePageChange = (page: number) => notify({ page });

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
    !!advancedFilters.doctorId,
    !!advancedFilters.procedure,
    !!advancedFilters.dateFrom || !!advancedFilters.dateTo,
  ].filter(Boolean).length;

  const doctorOptions = doctors.map((doctor: any) => ({
    value: doctor.id,
    label: doctor.name || "Unknown Doctor",
    phone: doctor.phone || "",
    specialization: doctor.specialization || "",
    searchLabel: `${doctor.name || ""} ${doctor.phone || ""} ${doctor.specialization || ""}`.trim(),
  }));

  const procedureOptions = procedureCatalog.map((procedure) => ({
    value: procedure,
    label: procedure,
  }));

  const toggleExpandedRow = (rowId: string) => {
    setExpandedRowIds((prev) => (prev.has(rowId) ? new Set() : new Set([rowId])));
  };

  const columns = [
    {
      key: "expand",
      header: "",
      className: "w-12",
      render: (treatment: any) => {
        const isExpanded = expandedRowIds.has(treatment.id);
        return (
          <Button
            type="button"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpandedRow(treatment.id);
            }}
            className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:bg-muted"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        );
      },
    },
    {
      key: "patient",
      header: "Patient",
      render: (treatment: any) => (
        <div>
          <div className="font-bold text-foreground">{treatment.patientName || treatment.name || "-"}</div>
          <div className="text-[11px] font-bold text-primary mt-0.5 uppercase tracking-wider">
            {treatment.patient_code || treatment.patientCode || treatment.phone || "-"}
          </div>
        </div>
      ),
    },
    {
      key: "planCount",
      header: "Total Plans",
      render: (treatment: any) => (
        <div className="flex items-center gap-2">
          <span className="inline-flex min-w-8 items-center justify-center rounded-full border border-border bg-muted px-2 py-1 text-[12px] font-black text-foreground">
            {Number(treatment.treatment_plan_count ?? treatment.treatmentPlanCount ?? 0)}
          </span>
          <span className="hidden text-xs font-semibold text-muted-foreground sm:inline">
            treatment plans
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (treatment: any) => <StatusPill status={treatment.overall_status || treatment.overallStatus || treatment.status} />,
    },
    {
      key: "cost",
      header: "Total Cost",
      align: "right" as const,
      render: (treatment: any) => (
        <div className="text-sm font-bold text-foreground">
          {formatCurrency(treatment.total_treatment_cost)}
        </div>
      ),
    },
   
  ];

  return (
    <div className="flex h-[calc(100vh-7.5rem)] min-w-0 flex-col gap-3 overflow-hidden sm:gap-4">
      <PageHeader
        title="Treatment Plans"
        action={
          <Button onClick={onAddTreatment} size="lg" className="h-10 w-full justify-center shadow-sm gap-2 sm:w-auto">
            <Plus className="w-4 h-4" /> New Treatment Plan
          </Button>
        }
      />

      <div className="shrink-0">
        <TreatmentStats totals={totals} isLoading={isStatsLoading && !totals.all && !totals.active && !totals.completed && !totals.planned} />
      </div>

      <div className="min-w-0 shrink-0 space-y-3">
        <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1 group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search by patient, procedure, tooth or doctor..."
              value={search}
              onChange={handleSearchChange}
              className="h-11 w-full pl-12 pr-4 text-sm border border-border rounded-xl bg-muted/50 focus:bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium"
            />
          </div>

          <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-center md:justify-end lg:w-auto lg:min-w-[420px]">
            <div className="flex items-center bg-muted p-1 rounded-xl border border-border/50 overflow-x-auto scrollbar-none max-w-full flex-nowrap md:flex-1">
              {(["all", "planned", "in-progress", "completed"] as const).map((status) => (
                <Button
                  key={status}
                  variant="ghost"
                  onClick={() => handleStatusFilter(status)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shrink-0 whitespace-nowrap ${
                    (status === "all" && statusFilter.length === 0) || (status !== "all" && statusFilter.includes(status))
                      ? "bg-card text-primary shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {status === "all" ? "All Plans" : STATUS_META[status]?.label ?? status}
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters((value) => !value)}
                className={`h-10 gap-2 shrink-0 ${activeFilterCount > 0 ? "border-primary bg-primary/10 text-primary hover:bg-primary/15" : ""}`}
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
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-10 gap-1 text-muted-foreground shrink-0">
                  <X className="w-3 h-3" /> Clear all
                </Button>
              )}
            </div>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <Label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Doctor</Label>
                <SearchableSelect
                  value={advancedFilters.doctorId ?? ""}
                  onChange={(value: string) => handleAdvancedChange({ doctorId: value || undefined })}
                  options={doctorOptions}
                  placeholder="All Doctors"
                  searchPlaceholder="Search doctor..."
                  onSearchChange={setDoctorSearch}
                  isLoading={isDoctorsLoading}
                  className="h-11 bg-muted/50 hover:bg-card"
                  renderOption={(doctor: any) => (
                    <div className="flex items-center gap-3 py-1">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {(doctor.label || "D").charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-foreground text-xs">{doctor.label}</span>
                        {doctor.phone ? (
                          <span className="text-[10px] text-muted-foreground">{doctor.phone}</span>
                        ) : null}
                      </div>
                    </div>
                  )}
                />
              </div>

              <div>
                <Label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Procedure</Label>
                <SearchableSelect
                  value={advancedFilters.procedure ?? ""}
                  onChange={(value: string) => handleAdvancedChange({ procedure: value || undefined })}
                  options={procedureOptions}
                  placeholder="All Procedures"
                  searchPlaceholder="Search procedure..."
                  className="h-11 bg-muted/50 hover:bg-card"
                />
              </div>

              <div>
                <Label className="block text-xs font-semibold mb-1.5 text-muted-foreground">From Date</Label>
                <Input
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-muted/50 focus:bg-card focus:ring-2 focus:ring-primary/10 outline-none"
                  value={advancedFilters.dateFrom?.toISOString().split("T")[0] ?? ""}
                  onChange={(e) =>
                    handleAdvancedChange({
                      dateFrom: e.target.value ? new Date(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              <div>
                <Label className="block text-xs font-semibold mb-1.5 text-muted-foreground">To Date</Label>
                <Input
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-muted/50 focus:bg-card focus:ring-2 focus:ring-primary/10 outline-none"
                  value={advancedFilters.dateTo?.toISOString().split("T")[0] ?? ""}
                  onChange={(e) =>
                    handleAdvancedChange({
                      dateTo: e.target.value ? new Date(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <ContentCard
        bodyClassName="flex-1 min-h-0 p-0 overflow-hidden"
        className="min-w-0 flex-1 min-h-0 rounded-3xl"
        footer={
          totalPages > 1 ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
              <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                Showing {(currentPage - 1) * PER_PAGE + 1}-{Math.min(currentPage * PER_PAGE, totalItems)} of {totalItems}
              </p>
              <div className="flex items-center gap-1 self-start sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, currentPage - 3), currentPage + 2)
                  .map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      disabled={isLoading}
                      className="h-8 w-8 p-0 text-[10px] font-bold"
                    >
                      {page}
                    </Button>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || isLoading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : null
        }
      >
        {isLoading ? (
          <div className="flex min-h-[360px] items-center justify-center px-4">
            <Loading type="spinner" text="Loading treatments..." />
          </div>
        ) : (
          <div className="relative h-full min-h-0">
            <DataTable
              className="h-full rounded-none border-0 shadow-none [&_.data-table]:min-w-[760px] sm:[&_.data-table]:min-w-[880px]"
              scrollClassName="h-full overflow-auto touch-pan-x [-webkit-overflow-scrolling:touch]"
              disableRowAnimation
              columns={columns}
              data={treatments}
              rowKey={(row) => row.id}
              expandedRowIds={expandedRowIds}
              onRowClick={(row: any) => toggleExpandedRow(row.id)}
              rowClassName={(row: any) => (expandedRowIds.has(row.id) ? "bg-slate-50" : "")}
              renderExpandedRow={(row: any) => (
                <ExpandedTreatmentRow
                  patientId={row.patientId}
                  fallbackRowId={row.id}
                  onViewTreatment={onViewTreatment}
                  onEditTreatment={onEditTreatment}
                  onManageSessions={onManageSessions}
                  onStartTreatment={onStartTreatment}
                  onDownloadPDF={handleDownloadPDF}
                  onSendWhatsApp={handleSendWhatsApp}
                  downloadingId={downloadingId}
                  sendingWhatsappId={sendingWhatsappId}
                />
              )}
              emptyIcon={<Stethoscope className="w-10 h-10" />}
              emptyTitle="No treatments found"
              emptySubtitle={search || statusFilter.length ? "Adjust your search or clear filters." : "Create a new treatment plan."}
            />

            {isTableFetching && treatments.length > 0 ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[49px] z-20 flex items-center justify-center bg-background/35 backdrop-blur-[1px]">
                <div className="flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating rows...
                </div>
              </div>
            ) : null}
          </div>
        )}
      </ContentCard>
    </div>
  );
}
