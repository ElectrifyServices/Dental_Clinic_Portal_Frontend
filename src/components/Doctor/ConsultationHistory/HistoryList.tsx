import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { SearchInput } from "@/components/ui";
import React, { useState } from "react";
import {
  Search,
  Filter,
  X,
  Eye,
  Activity,
  Stethoscope,
  Pill,
  FileText,
  Send,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { getConsultationReportAvailability } from "../../../utils/consultationReportUtils";

interface HistoryListProps {
  data: any[];
  pageData: any[];
  patients: any[];
  search: string;
  onSearchChange: (val: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  filterSort: "newest" | "oldest";
  onFilterSort: (val: "newest" | "oldest") => void;
  activeFilters: number;
  activeMenuId: number | null;
  onSetActiveMenuId: (id: number | null) => void;
  onSelectRecord: (record: any) => void;
  onDownloadPDF: (record: any, type: any) => void;
  onSendPDF: (record: any, type: any) => void;
  onDeleteClick: (id: number, e: React.MouseEvent) => void;
  safePage: number;
  PAGE_SIZE: number;
  isLoading?: boolean;
}

export function HistoryList({
  pageData,
  patients: _patients,
  search,
  onSearchChange,
  showFilters,
  onToggleFilters,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  filterSort,
  onFilterSort,
  activeFilters,
  activeMenuId: _activeMenuId,
  onSetActiveMenuId: _onSetActiveMenuId,
  onSelectRecord,
  onDownloadPDF,
  onSendPDF,
  onDeleteClick: _onDeleteClick,
  safePage: _safePage,
  PAGE_SIZE: _PAGE_SIZE,
  isLoading = false,
}: HistoryListProps) {
  const [activeDownloadMenuId, setActiveDownloadMenuId] = useState<number | null>(null);
  const [activeSendMenuId, setActiveSendMenuId] = useState<number | null>(null);

  const initials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarColors = [
    "bg-primary/10 text-primary",
    "bg-emerald-100 text-emerald-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const avatarColor = (id: number) => avatarColors[id % avatarColors.length];

  const fmtShort = (d: any) => {
    if (!d) return "—";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full" onClick={() => { setActiveDownloadMenuId(null); setActiveSendMenuId(null); }}>
      <div className="flex-shrink-0 px-5 py-2.5 border-b border-border bg-muted space-y-2">
        <div className="flex gap-2">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search by name, ID, diagnosis, contact..."
            className="flex-1"
          />
          <Button
            onClick={onToggleFilters}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors font-medium whitespace-nowrap ${showFilters || activeFilters > 0 ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"}`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
            {activeFilters > 0 && (
              <span className="bg-card text-primary text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-6 pt-0.5 animate-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Date Range:
              </span>
              <div className="flex items-center gap-1.5">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                />
                <span className="text-xs text-muted-foreground/60">to</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                />
                {(startDate || endDate) && (
                  <Button
                    onClick={() => {
                      onStartDateChange("");
                      onEndDateChange("");
                    }}
                    className="p-1 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                    title="Clear Date Range"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Sort:
              </span>
              {(["newest", "oldest"] as const).map((v) => (
                <Button
                  key={v}
                  onClick={() => onFilterSort(v)}
                  className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors font-medium ${filterSort === v ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"}`}
                >
                  {v === "newest" ? "Newest" : "Oldest"}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 relative">
        {isLoading && pageData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[300px]">
            <Loading type="spinner" text="Loading consultations..." />
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-50 animate-in fade-in duration-200">
                <Loading type="spinner" text="Loading consultations..." />
              </div>
            )}
            {pageData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-muted rounded-full p-4 mb-3">
                  <Search className="w-8 h-8 text-muted-foreground/60" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  No results found
                </h3>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Try a different search term or clear filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pageData.map((item) => (
              (() => {
              const reportAvailability = getConsultationReportAvailability(item);
              return (
              <Card key={item.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-3 border-b">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColor(item.id)}`}>
                        {initials(item.patient?.name)}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{item.patient?.name || "Unknown Patient"}</CardTitle>
                        <CardDescription className="text-xs truncate" title="Patient Code">
                          ID : {item.patient?.patient_code || item.patient?.id?.split('-')[0] || "—"}
                        </CardDescription>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full shrink-0 border border-green-200">
                      {item.status || "COMPLETED"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-1 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Stethoscope className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-semibold truncate">Dr. {item.doctor?.name || "Unknown"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 h-8">
                    {item.diagnosis_desc ? (
                      <><span className="font-semibold text-foreground">Diagnosis:</span> {item.diagnosis_desc}</>
                    ) : (
                      <span className="italic">No diagnosis recorded</span>
                    )}
                  </p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground pt-3 border-t border-border">
                    <span className="flex items-center gap-1.5 font-medium" title="Consultation Date">
                      <Activity className="w-3.5 h-3.5" />
                      <span className="font-semibold text-foreground mr-1">Date:</span> {fmtShort(item.created_at)}
                    </span>
                    {item.total_estimated_cost > 0 && (
                      <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded-md">
                        ₹{item.total_estimated_cost}
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-3 border-t flex justify-between bg-muted/20">
                  <Button variant="ghost" onClick={() => onSelectRecord(item)} className="text-xs font-bold text-primary hover:text-primary/80 hover:underline flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors h-auto">
                    <Eye className="w-4 h-4" /> View Full Details
                  </Button>
                  <div className="flex gap-1 relative">
                    <Button
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDownloadMenuId(activeDownloadMenuId === item.id ? null : item.id);
                      }}
                      className={`h-auto p-1.5 rounded-md transition-colors ${activeDownloadMenuId === item.id ? 'text-primary bg-primary/10 hover:bg-primary/20' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
                      title="Download Report"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>

                    {activeDownloadMenuId === item.id && (
                      <div className="absolute right-0 bottom-full mb-1 w-48 bg-card border border-border rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-bottom-2 duration-200 text-left">
                        {reportAvailability.clinical && <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownloadPDF(item, 'CLINICAL');
                            setActiveDownloadMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary flex items-center justify-start gap-2 h-auto"
                        >
                          <Activity className="w-3.5 h-3.5 text-primary shrink-0" /> Clinical Observations
                        </Button>}
                        {reportAvailability.treatment && <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownloadPDF(item, 'TREATMENT');
                            setActiveDownloadMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-muted-foreground hover:bg-purple-50 hover:text-purple-700 flex items-center justify-start gap-2 h-auto"
                        >
                          <Stethoscope className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Treatment Planning
                        </Button>}
                        {reportAvailability.prescription && <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownloadPDF(item, 'PRESCRIPTION');
                            setActiveDownloadMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-start gap-2 h-auto"
                        >
                          <Pill className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Prescription Only
                        </Button>}
                        <div className="h-px bg-muted my-1" />
                        <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownloadPDF(item, 'FULL');
                            setActiveDownloadMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-foreground hover:bg-muted flex items-center justify-start gap-2 h-auto"
                        >
                          <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> Full Summary
                        </Button>
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSendMenuId(activeSendMenuId === item.id ? null : item.id);
                        setActiveDownloadMenuId(null);
                      }}
                      className={`h-auto p-1.5 rounded-md transition-colors ${activeSendMenuId === item.id ? 'text-primary bg-primary/10 hover:bg-primary/20' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
                      title="Send Report"
                    >
                      <Send className="w-4 h-4" />
                    </Button>

                    {activeSendMenuId === item.id && (
                      <div className="absolute right-0 bottom-full mb-1 w-48 bg-card border border-border rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-bottom-2 duration-200 text-left">
                        {reportAvailability.clinical && <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendPDF(item, 'CLINICAL');
                            setActiveSendMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary flex items-center justify-start gap-2 h-auto"
                        >
                          <Activity className="w-3.5 h-3.5 text-primary shrink-0" /> Clinical Observations
                        </Button>}
                        {reportAvailability.treatment && <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendPDF(item, 'TREATMENT');
                            setActiveSendMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-muted-foreground hover:bg-purple-50 hover:text-purple-700 flex items-center justify-start gap-2 h-auto"
                        >
                          <Stethoscope className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Treatment Planning
                        </Button>}
                        {reportAvailability.prescription && <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendPDF(item, 'PRESCRIPTION');
                            setActiveSendMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-start gap-2 h-auto"
                        >
                          <Pill className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Prescription Only
                        </Button>}
                        <div className="h-px bg-muted my-1" />
                        <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendPDF(item, 'FULL');
                            setActiveSendMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-foreground hover:bg-muted flex items-center justify-start gap-2 h-auto"
                        >
                          <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> Full Summary
                        </Button>
                      </div>
                    )}
                    {/* This button can be enabled in the future, so for now it's just been commented out. */}
                    {/* <Button variant="ghost" onClick={(e) => onDeleteClick(item.id, e)} className="p-1.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors h-auto" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </Button> */}
                  </div>
                </CardFooter>
              </Card>
              );
              })()
            ))}
          </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
