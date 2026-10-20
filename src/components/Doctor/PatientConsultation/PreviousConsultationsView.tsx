import type { ApiAny } from "../../../types/api";
import React, { useState, useMemo } from "react";
import {
  FileText,
  Pill,
  Stethoscope,
  ChevronDown,
  Clock,
  ShieldAlert,
  AlertCircle,
  X,
  Filter,
  Activity,
  Calendar as CalendarIcon,
  Download,
  History,
  RefreshCw,
  Printer,
  Sparkles,
} from "lucide-react";
import {
  SearchInput,
  Button,
  Loading,
  Card,
  Badge,
  DataTable,
  ErrorState,
  DatePicker,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  toast,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { downloadConsultationPDF } from "../../../utils/pdfGenerator";
import { getConsultationReportAvailability } from "../../../utils/consultationReportUtils";

interface PreviousConsultationsViewProps {
  consultations: ApiAny;
  patient?: ApiAny;
  isLoading: boolean;
  isError: boolean;
  searchVal: string;
  onSearchChange: (v: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onClearFilters: () => void;
}

export function PreviousConsultationsView({
  consultations,
  patient,
  isLoading,
  isError,
  searchVal,
  onSearchChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
}: PreviousConsultationsViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDownloadPDF = async (record: ApiAny, type: ApiAny) => {
    const toastId = toast.loading("Generating PDF report...");
    try {
      const patientInfo = {
        id: patient?.id || record.patient_id || record.patient?.id || "—",
        patientName: patient?.patientName || patient?.name || record.patientName || record.patient?.name || "—",
        phone: patient?.patientPhone || patient?.phone || record.patient_phone || record.patient?.phone || "—",
        doctorName: (record as ApiAny).doctorName || record.doctor?.name || (patient as ApiAny)?.doctorName || "—",
        treatmentType: record.treatmentType || record.treatment_type,
        gender: patient?.gender || patient?.patientHistory?.gender || record.patient?.gender || "—",
        bloodGroup: patient?.bloodGroup || patient?.blood_group || patient?.patientHistory?.bloodGroup || record.patient?.blood_group || "—",
      };

      await downloadConsultationPDF({
        type: type || "FULL",
        patient: patientInfo,
        consultationData: record,
        toothChartState: record?.toothChartState || {},
      });
      toast.success("PDF Downloaded successfully!", { id: toastId });
    } catch (err: ApiAny) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF report", { id: toastId });
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getDateParts = (dateStr?: string) => {
    if (!dateStr) return { day: "--", month: "---", year: "----", time: "" };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { day: "--", month: "---", year: "----", time: "" };
      return {
        day: d.toLocaleDateString("en-US", { day: "2-digit" }),
        month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        year: d.getFullYear().toString(),
        time: d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }),
      };
    } catch {
      return { day: "--", month: "---", year: "----", time: "" };
    }
  };

  // Parse response structure dynamically to handle arrays, nested data, or wrapper objects
  const consultationsList = useMemo(() => {
    if (!consultations) return [];
    if (Array.isArray(consultations)) {
      return consultations;
    }
    const anyData = consultations as ApiAny;
    if (Array.isArray(anyData.data)) return anyData.data;
    if (Array.isArray(anyData.consultations)) return anyData.consultations;
    if (anyData.data && Array.isArray(anyData.data.consultations)) return anyData.data.consultations;
    if (anyData.data && Array.isArray(anyData.data.data)) return anyData.data.data;
    return [];
  }, [consultations]);

  const hasActiveFilters = Boolean(searchVal || dateFrom || dateTo);

  // Compute KPI statistics
  const stats = useMemo(() => {
    const total = consultationsList.length;
    const followUps = consultationsList.filter((c: ApiAny) => c.is_follow_up).length;
    const totalPrescriptions = consultationsList.reduce(
      (sum: number, c: ApiAny) => sum + (c.prescriptions?.length || 0),
      0
    );
    const totalProcedures = consultationsList.reduce(
      (sum: number, c: ApiAny) => sum + ((c.treatments || c.treatment_plans)?.length || 0),
      0
    );
    return { total, followUps, totalPrescriptions, totalProcedures };
  }, [consultationsList]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── Top KPI Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 shrink-0">
        <div className="bg-card border border-border/80 rounded-xl p-3 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
              Consultations
            </span>
            <span className="text-lg sm:text-2xl font-black text-foreground block">
              {stats.total}
            </span>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <History className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-xl p-3 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
              Follow-ups
            </span>
            <span className="text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400 block">
              {stats.followUps}
            </span>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <RefreshCw className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-xl p-3 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
              Prescriptions
            </span>
            <span className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
              {stats.totalPrescriptions}
            </span>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Pill className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-xl p-3 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block truncate">
              Procedures
            </span>
            <span className="text-lg sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 block">
              {stats.totalProcedures}
            </span>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ── Search & Date Range Filter Bar ── */}
      <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3 bg-muted/40 p-2.5 sm:p-3.5 rounded-2xl border border-border/80 shadow-xs">
        <SearchInput
          value={searchVal}
          onChange={onSearchChange}
          placeholder="Search by diagnosis, doctor, medicine, or condition..."
          className="flex-1 min-w-0 [&>input]:h-9.5 [&>input]:text-xs [&>input]:rounded-xl"
        />

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-card border border-border px-2.5 py-1 rounded-xl shadow-2xs">
            <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-wide">From:</span>
            <DatePicker
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(val) => onDateFromChange(val)}
              className="h-7 text-xs border-0 bg-transparent p-0 shadow-none focus:ring-0 focus-visible:ring-0 font-medium"
              placeholder="Start Date"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-card border border-border px-2.5 py-1 rounded-xl shadow-2xs">
            <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-wide">To:</span>
            <DatePicker
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(val) => onDateToChange(val)}
              className="h-7 text-xs border-0 bg-transparent p-0 shadow-none focus:ring-0 focus-visible:ring-0 font-medium"
              placeholder="End Date"
            />
          </div>

          {hasActiveFilters && (
            <Button
              onClick={onClearFilters}
              variant="ghost"
              size="sm"
              className="h-9 gap-1 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl px-2.5"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* ── Loading State ── */}
      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center">
          <Loading type="spinner" text="Fetching consultation records..." />
        </div>
      )}

      {/* ── Error State ── */}
      {isError && (
        <ErrorState
          title="Failed to load history"
          message="An error occurred while fetching the patient's previous consultations. Please try again."
        />
      )}

      {/* ── Empty State ── */}
      {!isLoading && !isError && consultationsList.length === 0 && (
        <div className="text-center py-16 bg-muted/20 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground/60 shadow-xs">
            <History className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">
              {hasActiveFilters ? "No matching consultations found" : "No previous consultations found"}
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              {hasActiveFilters
                ? "Try adjusting your search criteria or resetting date filters."
                : "This patient has no recorded consultations in the system yet."}
            </p>
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters} className="mt-2 text-xs rounded-xl">
              Reset Filters
            </Button>
          )}
        </div>
      )}

      {/* ── Consultations List Cards ── */}
      {!isLoading && !isError && consultationsList.length > 0 && (
        <div className="space-y-3">
          {consultationsList.map((c: ApiAny) => {
            const isExpanded = expandedId === c.id;
            const reportAvailability = getConsultationReportAvailability(c);
            const dateParts = getDateParts(c.created_at);

            const doctorName = c.doctor?.name || c.doctor_name || "Doctor";
            const treatmentsCount = (c.treatments || c.treatment_plans || []).length;
            const prescriptionsCount = (c.prescriptions || []).length;
            const findingsCount = (c.tooth_findings || []).length;

            return (
              <Card
                key={c.id}
                className={cn(
                  "group transition-all duration-200 bg-card rounded-2xl overflow-hidden",
                  isExpanded
                    ? "border-primary/40 shadow-lg ring-1 ring-primary/20"
                    : "border-border/80 shadow-xs hover:border-primary/40 hover:shadow-md"
                )}
              >
                {/* ── Card Header (Clickable) ── */}
                <div
                  onClick={() => toggleExpand(c.id)}
                  className="p-3.5 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer select-none hover:bg-muted/30 transition-colors gap-3 sm:gap-4"
                >
                  {/* Left: Date Badge + Doctor + Diagnosis */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    {/* Professional Date Block */}
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-primary/80 leading-none">
                        {dateParts.month}
                      </span>
                      <span className="text-xl sm:text-2xl font-black leading-none my-0.5 text-foreground">
                        {dateParts.day}
                      </span>
                      <span className="text-[9px] font-bold text-muted-foreground leading-none">
                        {dateParts.year}
                      </span>
                    </div>

                    <div className="hidden sm:block h-10 w-px bg-border/80 shrink-0" />

                    {/* Metadata: Doctor, Badges, Diagnosis */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Doctor Badge */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-muted/60 border border-border/80 text-foreground">
                          <Stethoscope className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>Dr. {doctorName}</span>
                        </div>

                        {/* Visit Type Badge */}
                        {c.is_follow_up ? (
                          <Badge variant="amber" className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                            Follow-Up
                          </Badge>
                        ) : (
                          <Badge variant="emerald" className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                            Checkup
                          </Badge>
                        )}

                        {/* Cost Badge */}
                        {c.total_estimated_cost > 0 && (
                          <span className="text-[11px] font-black text-foreground bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                            ₹{Number(c.total_estimated_cost).toLocaleString()}
                          </span>
                        )}

                        {/* Time */}
                        {dateParts.time && (
                          <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 ml-auto sm:ml-0">
                            <Clock className="w-3 h-3 opacity-60" />
                            {dateParts.time}
                          </span>
                        )}
                      </div>

                      {/* Diagnosis Line */}
                      <div className="text-sm font-semibold text-foreground flex items-center gap-1.5 truncate">
                        <span className="text-xs font-bold text-primary/90 shrink-0">Dx:</span>
                        <span className="truncate">
                          {c.diagnosis_desc || <span className="italic text-muted-foreground text-xs font-normal">No specific diagnosis recorded</span>}
                        </span>
                      </div>

                      {/* Summary Chips */}
                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        {prescriptionsCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50">
                            <Pill className="w-3 h-3" />
                            {prescriptionsCount} {prescriptionsCount === 1 ? "Medicine" : "Medicines"}
                          </span>
                        )}
                        {treatmentsCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200/50">
                            <Activity className="w-3 h-3" />
                            {treatmentsCount} {treatmentsCount === 1 ? "Procedure" : "Procedures"}
                          </span>
                        )}
                        {findingsCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50">
                            <ShieldAlert className="w-3 h-3" />
                            {findingsCount} {findingsCount === 1 ? "Tooth Finding" : "Findings"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & Toggle */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                    {/* PDF Reports Dropdown */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8.5 gap-1.5 text-xs rounded-xl font-bold border-border/80 hover:bg-primary/10 hover:text-primary hover:border-primary/40 shadow-2xs"
                          >
                            <Download className="w-3.5 h-3.5 text-primary" />
                            <span className="hidden sm:inline">Reports</span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-xl p-1 shadow-lg">
                          <DropdownMenuItem
                            onClick={() => handleDownloadPDF(c, "FULL")}
                            className="gap-2 text-xs font-semibold cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-primary" />
                            Full Summary Report
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={!reportAvailability.clinical}
                            onClick={() => handleDownloadPDF(c, "CLINICAL")}
                            className={cn(
                              "gap-2 text-xs font-medium cursor-pointer",
                              !reportAvailability.clinical && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <Activity className="w-3.5 h-3.5 text-blue-600" />
                            Clinical Observations
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={!reportAvailability.treatment}
                            onClick={() => handleDownloadPDF(c, "TREATMENT")}
                            className={cn(
                              "gap-2 text-xs font-medium cursor-pointer",
                              !reportAvailability.treatment && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
                            Treatment Planning
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={!reportAvailability.prescription}
                            onClick={() => handleDownloadPDF(c, "PRESCRIPTION")}
                            className={cn(
                              "gap-2 text-xs font-medium cursor-pointer",
                              !reportAvailability.prescription && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <Pill className="w-3.5 h-3.5 text-emerald-600" />
                            Prescription Only
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Expand/Collapse Chevron Button */}
                    <div
                      className={cn(
                        "w-8.5 h-8.5 rounded-xl border flex items-center justify-center transition-colors",
                        isExpanded
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-card border-border/80 text-muted-foreground group-hover:border-primary/40 group-hover:text-foreground"
                      )}
                    >
                      <ChevronDown
                        className={cn("w-4 h-4 transition-transform duration-300", isExpanded && "rotate-180")}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Expanded Content ── */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 border-t border-border/80 bg-muted/15 space-y-6 animate-in slide-in-from-top-2 duration-200">
                    {/* Clinical Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Clinical Observations */}
                      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Clinical Observations</span>
                        </div>
                        <p className="text-xs sm:text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">
                          {c.observations_desc || (
                            <span className="italic text-muted-foreground text-xs">No observations recorded.</span>
                          )}
                        </p>
                      </div>

                      {/* Diagnosis & Conclusion */}
                      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Diagnosis & Conclusion</span>
                        </div>
                        <p className="text-xs sm:text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">
                          {c.diagnosis_desc || (
                            <span className="italic text-muted-foreground text-xs">No diagnosis details provided.</span>
                          )}
                        </p>
                      </div>

                      {/* Tooth Findings & Chart */}
                      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Tooth Chart & Findings</span>
                        </div>
                        {c.tooth_findings && c.tooth_findings.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {c.tooth_findings.map((f: ApiAny, i: number) => (
                              <div
                                key={i}
                                className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-lg px-2 py-1 text-xs font-semibold"
                              >
                                <span className="bg-amber-200/80 dark:bg-amber-800/40 text-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded text-[10px] font-black">
                                  {f.tooth_number === "FM" ? "FM" : `#${f.tooth_number}`}
                                </span>
                                <span className="text-amber-900 dark:text-amber-300 text-[11px]">
                                  {f.condition === "OTHER" && f.other_condition ? f.other_condition : f.condition}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs italic text-muted-foreground">
                            No specific tooth chart conditions recorded.
                          </p>
                        )}
                      </div>

                      {/* Additional / Secondary Notes */}
                      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Doctor Notes & Follow-up</span>
                        </div>
                        <p className="text-xs sm:text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">
                          {c.additional_notes || (
                            <span className="italic text-muted-foreground text-xs">No secondary notes recorded.</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* ── Treatment Plan Section ── */}
                    <div className="bg-card border border-border/80 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-primary" />
                            <span>Recommended Treatment Plan</span>
                          </h5>
                          {(c.treatment_plan_description || c.treatment_plan || c.treatmentPlan) && (
                            <p className="text-xs text-muted-foreground">
                              {c.treatment_plan_description || c.treatment_plan || c.treatmentPlan}
                            </p>
                          )}
                        </div>
                        {c.total_estimated_cost > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase">Estimated Cost:</span>
                            <span className="text-sm font-black text-foreground bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-lg">
                              ₹{Number(c.total_estimated_cost).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {(c.treatments || c.treatment_plans) && (c.treatments || c.treatment_plans).length > 0 ? (
                        <div className="overflow-hidden border border-border/70 rounded-xl">
                          <DataTable
                            compact
                            columns={[
                              {
                                key: "tooth",
                                header: "Tooth",
                                render: (t: ApiAny) => {
                                  const tooth = t.tooth_number !== undefined ? t.tooth_number : t.tooth;
                                  return (
                                    <span className="font-bold text-xs bg-muted px-2 py-1 rounded-md border border-border/60">
                                      {tooth === "FM" ? "Full Mouth" : tooth ? `#${tooth}` : "All"}
                                    </span>
                                  );
                                },
                              },
                              {
                                key: "procedure",
                                header: "Procedure",
                                render: (t: ApiAny) => (
                                  <span className="font-bold text-foreground text-xs">
                                    {t.procedure || t.treatment_name}
                                  </span>
                                ),
                              },
                              {
                                key: "sessions",
                                header: "Sessions",
                                render: (t: ApiAny) => (
                                  <span className="text-xs text-muted-foreground font-medium">
                                    {Array.isArray(t.sessions) ? t.sessions.length : t.sessions || 1}
                                  </span>
                                ),
                              },
                              {
                                key: "est_cost",
                                header: "Cost",
                                align: "right",
                                render: (t: ApiAny) => (
                                  <span className="font-bold text-xs text-foreground">
                                    ₹{(t.est_cost || t.cost || 0).toLocaleString()}
                                  </span>
                                ),
                              },
                              {
                                key: "status",
                                header: "Status",
                                align: "center",
                                render: (t: ApiAny) => (
                                  <Badge
                                    variant={t.is_active !== false && t.status !== "completed" ? "emerald" : "gray"}
                                    className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                  >
                                    {t.is_active !== false && t.status !== "completed" ? "Active" : t.status || "Inactive"}
                                  </Badge>
                                ),
                              },
                            ]}
                            data={c.treatments || c.treatment_plans}
                            rowKey={(t: ApiAny, idx: number) => t.id || `${t.tooth || t.tooth_number}-${idx}`}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-muted/20 border border-dashed border-border/80 rounded-xl text-xs text-muted-foreground">
                          No itemized procedures specified in this consultation.
                        </div>
                      )}
                    </div>

                    {/* ── Prescriptions Section ── */}
                    <div className="bg-card border border-border/80 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                          <Pill className="w-4 h-4 text-emerald-600" />
                          <span>Prescribed Medications</span>
                        </h5>
                        {reportAvailability.prescription && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPDF(c, "PRESCRIPTION")}
                            className="h-7 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 gap-1.5"
                          >
                            <Download className="w-3 h-3" />
                            Download Rx PDF
                          </Button>
                        )}
                      </div>

                      {c.prescriptions && c.prescriptions.length > 0 ? (
                        <div className="overflow-hidden border border-border/70 rounded-xl">
                          <DataTable
                            compact
                            columns={[
                              {
                                key: "medicine",
                                header: "Medicine",
                                render: (pr: ApiAny) => {
                                  const m = pr.medicine_name || pr.medicine;
                                  const name = typeof m === "object" && m !== null ? m.name || m.medicine_name || "" : String(m || "");
                                  return (
                                    <div className="font-bold text-foreground text-xs">
                                      {name.trim() || "—"}
                                    </div>
                                  );
                                },
                              },
                              {
                                key: "dosage",
                                header: "Dosage",
                                render: (pr: ApiAny) => (
                                  <span className="font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded text-[11px] border border-amber-200/50">
                                    {pr.dosage || "—"}
                                  </span>
                                ),
                              },
                              {
                                key: "timing",
                                header: "Timing",
                                render: (pr: ApiAny) => (
                                  <span className="text-xs text-muted-foreground font-medium">
                                    {pr.timing || "—"}
                                  </span>
                                ),
                              },
                              {
                                key: "frequency",
                                header: "Frequency",
                                render: (pr: ApiAny) => (
                                  <span className="text-xs text-muted-foreground font-medium">
                                    {pr.frequency || "—"}
                                  </span>
                                ),
                              },
                              {
                                key: "duration",
                                header: "Duration",
                                render: (pr: ApiAny) => (
                                  <span className="text-xs text-foreground font-semibold">
                                    {pr.duration ? `${pr.duration} ${pr.duration_type || pr.durationUnit || "Days"}` : "—"}
                                  </span>
                                ),
                              },
                              {
                                key: "qty",
                                header: "Qty",
                                align: "right",
                                render: (pr: ApiAny) => (
                                  <span className="font-black text-xs text-foreground">
                                    {pr.qty || "—"}
                                  </span>
                                ),
                              },
                            ]}
                            data={c.prescriptions}
                            rowKey={(pr: ApiAny, idx: number) => pr.id || `${pr.medicine_name}-${idx}`}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-muted/20 border border-dashed border-border/80 rounded-xl text-xs text-muted-foreground">
                          No medications prescribed during this session.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
