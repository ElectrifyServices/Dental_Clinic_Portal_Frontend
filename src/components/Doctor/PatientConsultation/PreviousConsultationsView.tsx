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
import { SearchInput } from "@/components/ui";

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

    console.log("Raw Patient Consultations Response:", consultations);

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
              <input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="px-3 py-1.5 border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer bg-card"
              />
            </div>
            <span className="text-muted-foreground text-xs font-bold">—</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground">To</span>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => onDateToChange(e.target.value)}
                className="px-3 py-1.5 border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer bg-card"
              />
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-destructive border border-destructive/30 bg-destructive/5 rounded-xl hover:bg-destructive/10 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Fetching records from database...
          </p>
        </div>
      )}

      {isError && (
        <div className="p-6 text-center bg-destructive/5 border border-destructive/10 rounded-2xl flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <h4 className="text-base font-bold text-destructive">Failed to load history</h4>
          <p className="text-xs text-muted-foreground">
            An error occurred while fetching the patient's previous consultations. Please try again.
          </p>
        </div>
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
        <div className="space-y-3">
          {consultationsList.map((c, idx) => {
            const isExpanded = expandedId === c.id;
            return (
              <div
                key={c.id}
                className={`border border-border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded
                    ? "shadow-lg ring-1 ring-primary/20 bg-card"
                    : "hover:border-primary/40 bg-card/60"
                  }`}
              >
                {/* Collapsible Header */}
                <div
                  onClick={() => toggleExpand(c.id)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">
                        {formatDate(c.created_at)}
                      </span>
                    </div>
                    <span className="w-1.5 h-1.5 bg-muted rounded-full hidden sm:inline" />
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground/60" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        Doctor: <span className="text-foreground font-bold">{c.doctor?.name || "Dr. Sharma"}</span>
                      </span>
                    </div>
                    {c.is_follow_up && (
                      <span className="badge badge-amber text-[10px] font-bold py-0.5 px-2">
                        Follow-Up Check
                      </span>
                    )}
                  </div>
                  <div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-6 border-t border-border/50 bg-card space-y-6 animate-in fade-in duration-200">
                    {/* Top Grid: Observations, Diagnosis, Tooth Findings */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {/* Observations */}
                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                          <h5 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2 mb-2">
                            <FileText className="w-3.5 h-3.5" />
                            Clinical Observations
                          </h5>
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap font-medium">
                            {c.observations_desc || "No observations recorded."}
                          </p>
                        </div>

                        {/* Diagnosis */}
                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                          <h5 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2 mb-2">
                            <Stethoscope className="w-3.5 h-3.5" />
                            Diagnosis & Conclusion
                          </h5>
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap font-medium">
                            {c.diagnosis_desc || "No diagnosis details provided."}
                          </p>
                        </div>
                      </div>

                      {/* Tooth Findings and Details */}
                      <div className="space-y-4">
                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                          <h5 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2 mb-2">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Tooth Condition Findings
                          </h5>
                          {c.tooth_findings && c.tooth_findings.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {c.tooth_findings.map((f, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold"
                                >
                                  <span className="bg-amber-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black">
                                    {f.tooth_number}
                                  </span>
                                  {f.condition}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              No specific tooth chart conditions recorded.
                            </p>
                          )}
                        </div>

                        {/* General Info */}
                        {c.additional_notes && (
                          <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                            <h5 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2 mb-2">
                              <Clock className="w-3.5 h-3.5" />
                              Secondary Additional Notes
                            </h5>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap font-medium">
                              {c.additional_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle Grid: Treatment Plan & Cost */}
                    <div className="border border-border/50 rounded-xl overflow-hidden">
                      <div className="bg-muted/40 px-5 py-3 border-b border-border/50 flex items-center justify-between">
                        <h5 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                          <Stethoscope className="w-4 h-4" />
                          Treatment Procedures Planned
                        </h5>
                        {c.total_estimated_cost !== undefined && (
                          <span className="text-sm font-bold text-foreground">
                            Estimated Cost:{" "}
                            <span className="text-primary font-black">
                              ₹{c.total_estimated_cost.toLocaleString()}
                            </span>
                          </span>
                        )}
                      </div>
                      {c.treatment_plan_description && (
                        <div className="px-5 py-3.5 bg-card border-b border-border/50">
                          <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Plan Description</p>
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap font-medium">{c.treatment_plan_description}</p>
                        </div>
                      )}
                      {c.treatments && c.treatments.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-muted/20 border-b border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <th className="py-2.5 px-4">Tooth</th>
                                <th className="py-2.5 px-4">Procedure</th>
                                <th className="py-2.5 px-4">Sessions</th>
                                <th className="py-2.5 px-4 text-right">Cost (₹)</th>
                                <th className="py-2.5 px-4 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 text-xs font-semibold">
                              {c.treatments.map((t, idx) => (
                                <tr key={idx} className="hover:bg-muted/10">
                                  <td className="py-2.5 px-4">
                                    <span className="font-bold bg-muted px-2 py-0.5 rounded border border-border">
                                      #{t.tooth_number || "All"}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-4 font-bold text-foreground">
                                    {t.procedure}
                                  </td>
                                  <td className="py-2.5 px-4">{t.sessions || 1}</td>
                                  <td className="py-2.5 px-4 text-right font-black text-primary">
                                    ₹{(t.est_cost || 0).toLocaleString()}
                                  </td>
                                  <td className="py-2.5 px-4 text-center">
                                    <span
                                      className={`badge ${t.is_active !== false ? "badge-green" : "badge-gray"
                                        } text-[9px] font-bold`}
                                    >
                                      {t.is_active !== false ? "Active" : "Inactive"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-xs text-muted-foreground italic">
                          No individual treatment item details recorded.
                        </div>
                      )}
                    </div>

                    {/* Bottom Section: Prescriptions */}
                    <div className="border border-border/50 rounded-xl overflow-hidden">
                      <div className="bg-muted/40 px-5 py-3 border-b border-border/50">
                        <h5 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                          <Pill className="w-4 h-4" />
                          Prescription Details
                        </h5>
                      </div>
                      {c.prescriptions && c.prescriptions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-muted/20 border-b border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <th className="py-2.5 px-4">Medicine</th>
                                <th className="py-2.5 px-4">Dosage</th>
                                <th className="py-2.5 px-4">Timing</th>
                                <th className="py-2.5 px-4">Frequency</th>
                                <th className="py-2.5 px-4">Duration</th>
                                <th className="py-2.5 px-4 text-right">Qty</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 text-xs font-semibold">
                              {c.prescriptions.map((pr, idx) => (
                                <tr key={idx} className="hover:bg-muted/10">
                                  <td className="py-2.5 px-4 font-bold text-foreground">
                                    {pr.medicine_name}
                                  </td>
                                  <td className="py-2.5 px-4 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 inline-block my-1 text-[11px]">
                                    {pr.dosage}
                                  </td>
                                  <td className="py-2.5 px-4 text-muted-foreground">
                                    {pr.timing}
                                  </td>
                                  <td className="py-2.5 px-4">{pr.frequency}</td>
                                  <td className="py-2.5 px-4">
                                    {pr.duration} {pr.duration_type}
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-bold">
                                    {pr.qty}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-xs text-muted-foreground italic bg-card">
                          No medicines prescribed in this session.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
