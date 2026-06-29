import React, { useState } from "react";
import {
  Calendar,
  User,
  FileText,
  Pill,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldAlert,
  AlertCircle,
  X,
  Filter,
} from "lucide-react";
import { SearchInput, Button, Loading, Card, Badge, DataTable, ErrorState, Input } from "@/components/ui";

interface PreviousConsultationsViewProps {
  consultations: any;
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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Parse response structure dynamically to handle arrays, nested data, or wrapper objects
  const consultationsList = React.useMemo(() => {
    if (!consultations) return [];
    if (Array.isArray(consultations)) {
      return consultations;
    }
    const anyData = consultations as any;
    // Handle standard { data: [...] }
    if (Array.isArray(anyData.data)) {
      return anyData.data;
    }
    // Handle { consultations: [...] }
    if (Array.isArray(anyData.consultations)) {
      return anyData.consultations;
    }
    // Handle double-nested { data: { consultations: [...] } }
    if (anyData.data && Array.isArray(anyData.data.consultations)) {
      return anyData.data.consultations;
    }
    // Handle double-nested { data: { data: [...] } }
    if (anyData.data && Array.isArray(anyData.data.data)) {
      return anyData.data.data;
    }

    return [];
  }, [consultations]);

  const hasActiveFilters = !!(searchVal || dateFrom || dateTo);

  return (
    <div className="space-y-6">
      {/* Search & Date Filter Row */}
      <div className="flex flex-col gap-3 bg-muted/30 p-4 rounded-2xl border border-border/60">
        {/* Top row: search only (full width) */}
        <SearchInput
          value={searchVal}
          onChange={onSearchChange}
          placeholder="Search by diagnosis, doctor, tooth condition..."
        />

        {/* Bottom row: date range + clear filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date Range:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground">From</span>
              <Input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="w-auto h-auto px-3 py-1.5"
              />
            </div>
            <span className="text-muted-foreground text-xs font-bold">—</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground">To</span>
              <Input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => onDateToChange(e.target.value)}
                className="w-auto h-auto px-3 py-1.5"
              />
            </div>
          </div>
          {hasActiveFilters && (
            <Button
              onClick={onClearFilters}
              variant="destructive"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-destructive border border-destructive/30 bg-destructive/5 rounded-xl hover:bg-destructive/10 transition-all h-auto"
            >
              <X className="w-3.5 h-3.5" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {isLoading && (
        <Loading type="spinner" text="Fetching records from database..." />
      )}

      {isError && (
        <ErrorState 
          title="Failed to load history"
          message="An error occurred while fetching the patient's previous consultations. Please try again."
        />
      )}

      {!isLoading && !isError && consultationsList.length === 0 && (
        <div className="text-center py-16 bg-muted/30 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2">
          <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-2">
            <Clock className="w-7 h-7 text-muted-foreground/60" />
          </div>
          <h4 className="text-sm font-bold text-foreground">No previous consultations found</h4>
          <p className="text-xs text-muted-foreground max-w-sm">
            This patient has no recorded consultations in the system yet.
          </p>
        </div>
      )}

      {!isLoading && !isError && consultationsList.length > 0 && (
        <div className="space-y-4">
          {consultationsList.map((c, idx) => {
            const isExpanded = expandedId === c.id;
            return (
              <Card
                key={c.id}
                className={`group relative overflow-hidden transition-all duration-400 bg-card rounded-2xl ${
                  isExpanded
                    ? "border-primary/30 shadow-xl shadow-primary/5 ring-1 ring-primary/20"
                    : "border-border/60 shadow-sm hover:border-primary/40 hover:shadow-md"
                }`}
              >
                {/* Left accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${isExpanded ? "bg-primary" : "bg-muted-foreground/20 group-hover:bg-primary/50"}`} />

                {/* Collapsible Header */}
                <div
                  onClick={() => toggleExpand(c.id)}
                  className="p-5 pl-7 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer select-none transition-colors hover:bg-muted/10 gap-4 sm:gap-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-[15px] font-black text-foreground">
                          {formatDate(c.created_at).split(',')[0]}
                        </span>
                        <span className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                          {formatDate(c.created_at).split(',')[1]}
                        </span>
                      </div>
                    </div>

                    <div className="hidden sm:block h-10 w-[1px] bg-border" />

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border/50">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">
                        Treated by <span className="text-foreground font-bold">{c.doctor?.name || "Dr. Sharma"}</span>
                      </span>
                    </div>

                    {c.is_follow_up && (
                      <Badge variant="amber" className="text-[10px] uppercase font-black tracking-widest py-1 px-3 rounded-full shadow-sm sm:ml-2">
                        Follow-Up
                      </Badge>
                    )}
                  </div>

                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0 ${isExpanded ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-muted text-muted-foreground border border-border/50"}`}>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-7 pl-9 border-t border-border/40 bg-gradient-to-b from-muted/10 to-transparent space-y-8 animate-in slide-in-from-top-2 duration-300">
                    
                    {/* Clinical Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div className="space-y-6">
                        {/* Observations */}
                        <div className="relative">
                          <h5 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-3">
                            <FileText className="w-4 h-4" /> Clinical Observations
                          </h5>
                          <div className="bg-card border border-border/60 p-4.5 rounded-xl shadow-sm relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-xl" />
                            <p className="text-[14px] text-foreground/80 whitespace-pre-wrap font-medium leading-relaxed pl-1.5">
                              {c.observations_desc || <span className="italic text-muted-foreground">No observations recorded.</span>}
                            </p>
                          </div>
                        </div>

                        {/* Findings & Tooth Notes */}
                        <div className="relative">
                          <h5 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-3">
                            <ShieldAlert className="w-4 h-4" /> Findings & Chart
                          </h5>
                          <div className="bg-card border border-border/60 p-4.5 rounded-xl shadow-sm relative">
                             <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l-xl" />
                             <div className="pl-1.5">
                                {c.tooth_findings && c.tooth_findings.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {c.tooth_findings.map((f: any, i: number) => (
                                      <div key={i} className="flex items-center gap-2 bg-amber-50/80 border border-amber-200/60 rounded-lg pr-3 py-1 text-sm font-semibold shadow-sm">
                                        <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 ml-1">
                                          {f.tooth_number}
                                        </span>
                                        <span className="text-amber-900">{f.condition}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-sm italic text-muted-foreground font-medium">No specific tooth chart conditions recorded.</span>
                                )}
                             </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        {/* Diagnosis */}
                        <div className="relative">
                          <h5 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-3">
                            <Stethoscope className="w-4 h-4" /> Diagnosis & Conclusion
                          </h5>
                          <div className="bg-card border border-border/60 p-4.5 rounded-xl shadow-sm relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-xl" />
                            <p className="text-[14px] text-foreground/80 whitespace-pre-wrap font-medium leading-relaxed pl-1.5">
                              {c.diagnosis_desc || <span className="italic text-muted-foreground">No diagnosis details provided.</span>}
                            </p>
                          </div>
                        </div>

                        {/* Additional Notes */}
                        {c.additional_notes && (
                          <div className="relative">
                            <h5 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-3">
                              <AlertCircle className="w-4 h-4" /> Secondary Notes
                            </h5>
                            <div className="bg-card border border-border/60 p-4.5 rounded-xl shadow-sm relative">
                              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-l-xl" />
                              <p className="text-[14px] text-foreground/80 whitespace-pre-wrap font-medium leading-relaxed pl-1.5">
                                {c.additional_notes}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <hr className="border-border/60" />

                    {/* Treatment Plan Section */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                        <div>
                          <h5 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <Stethoscope className="w-4.5 h-4.5" /> Treatment Plan
                          </h5>
                          {(c.treatment_plan_description || c.treatment_plan || c.treatmentPlan) && (
                            <p className="text-sm text-muted-foreground font-semibold mt-2 max-w-2xl bg-muted/40 p-3 rounded-lg border border-border/50">
                              {c.treatment_plan_description || c.treatment_plan || c.treatmentPlan}
                            </p>
                          )}
                        </div>
                        {c.total_estimated_cost !== undefined && c.total_estimated_cost > 0 && (
                          <div className="bg-primary/5 px-5 py-2.5 rounded-xl border border-primary/20 shrink-0 shadow-sm flex flex-col items-end">
                            <span className="block text-[10px] font-black uppercase tracking-widest text-primary/70 mb-0.5">Est. Total Cost</span>
                            <span className="block text-xl font-black text-primary leading-none">₹{c.total_estimated_cost.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {(c.treatments || c.treatment_plans) && (c.treatments || c.treatment_plans).length > 0 ? (
                        <div className="bg-card rounded-xl shadow-sm border border-border/60 overflow-hidden">
                          <DataTable
                            columns={[
                              {
                                key: "tooth_number",
                                header: "Tooth",
                                render: (t: any) => {
                                  const tooth = t.tooth_number !== undefined ? t.tooth_number : t.tooth;
                                  return (
                                    <span className="font-black text-xs bg-muted px-2 py-1.5 rounded-md border border-border/50 shadow-sm">
                                      {tooth ? `#${tooth}` : "All"}
                                    </span>
                                  );
                                },
                              },
                              {
                                key: "procedure",
                                header: "Procedure",
                                render: (t: any) => <span className="font-bold text-foreground text-[13px]">{t.procedure || t.treatment_name}</span>,
                              },
                              {
                                key: "sessions",
                                header: "Sessions",
                                render: (t: any) => <span className="font-semibold text-muted-foreground">{Array.isArray(t.sessions) ? t.sessions.length : (t.sessions || 1)}</span>,
                              },
                              {
                                key: "est_cost",
                                header: "Cost (₹)",
                                align: "right",
                                render: (t: any) => (
                                  <span className="font-black text-foreground">
                                    ₹{(t.est_cost || t.cost || 0).toLocaleString()}
                                  </span>
                                ),
                              },
                              {
                                key: "is_active",
                                header: "Status",
                                align: "center",
                                render: (t: any) => (
                                  <Badge variant={t.is_active !== false && t.status !== "completed" ? "emerald" : "gray"} className="text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                                    {t.is_active !== false && t.status !== "completed" ? "Active" : (t.status || "Inactive")}
                                  </Badge>
                                ),
                              },
                            ]}
                            data={c.treatments || c.treatment_plans}
                            rowKey={(t: any) => t.id || `${t.tooth_number || t.tooth}-${t.procedure || t.treatment_name}`}
                          />
                        </div>
                      ) : (
                        <div className="bg-card border border-dashed border-border/60 rounded-xl p-5 text-center flex items-center justify-center gap-2">
                           <AlertCircle className="w-4 h-4 text-muted-foreground" />
                           <span className="text-sm font-semibold text-muted-foreground italic">No individual treatment item details recorded.</span>
                        </div>
                      )}
                    </div>

                    {/* Prescriptions Section */}
                    <div>
                      <h5 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
                        <Pill className="w-4.5 h-4.5" /> Prescriptions
                      </h5>
                      {c.prescriptions && c.prescriptions.length > 0 ? (
                        <div className="bg-card rounded-xl shadow-sm border border-border/60 overflow-hidden">
                          <DataTable
                            columns={[
                              {
                                key: "medicine",
                                header: "Medicine",
                                render: (pr: any) => {
                                  let medName = "";
                                  const m = pr.medicine_name || pr.medicine;
                                  if (typeof m === 'object' && m !== null) {
                                    medName = String(m.name || m.medicine_name || "");
                                  } else {
                                    medName = String(m || "");
                                  }
                                  return (
                                    <span className="font-black text-foreground text-[14px]">
                                      {medName.trim() || "—"}
                                    </span>
                                  );
                                },
                              },
                              {
                                key: "dosage",
                                header: "Dosage",
                                render: (pr: any) => (
                                  <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/50 text-[11px] uppercase tracking-wider shadow-sm">
                                    {pr.dosage || "—"}
                                  </span>
                                ),
                              },
                              {
                                key: "timing",
                                header: "Timing",
                                render: (pr: any) => <span className="font-semibold text-muted-foreground text-[13px]">{pr.timing || "—"}</span>,
                              },
                              {
                                key: "frequency",
                                header: "Freq",
                                render: (pr: any) => <span className="font-semibold text-muted-foreground text-[13px]">{pr.frequency || "—"}</span>,
                              },
                              {
                                key: "duration",
                                header: "Duration",
                                render: (pr: any) => <span className="font-bold text-[13px] text-foreground/80">{pr.duration ? `${pr.duration} ${pr.duration_type || pr.durationUnit || 'Days'}` : "—"}</span>,
                              },
                              {
                                key: "qty",
                                header: "Qty",
                                align: "right",
                                render: (pr: any) => <span className="font-black text-lg text-foreground/80">{pr.qty || "—"}</span>,
                              },
                            ]}
                            data={c.prescriptions}
                            rowKey={(pr: any) => pr.id || pr.medicine_name || Math.random().toString()}
                          />
                        </div>
                      ) : (
                        <div className="bg-card border border-dashed border-border/60 rounded-xl p-5 text-center flex items-center justify-center gap-2">
                           <AlertCircle className="w-4 h-4 text-muted-foreground" />
                           <span className="text-sm font-semibold text-muted-foreground italic">No medicines prescribed in this session.</span>
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
