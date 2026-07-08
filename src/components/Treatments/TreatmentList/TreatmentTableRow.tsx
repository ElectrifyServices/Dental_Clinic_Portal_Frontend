import { Button } from "@/components/ui/Button";
import React, { useState } from "react";
import {
  FileText, MoreVertical, Edit, Clock,
  Play, CheckCircle, Calendar, Download, Loader2
} from "lucide-react";
import { createPortal } from "react-dom";
import { toast } from "@/components/ui";
import { downloadCompletedTreatmentPDF } from "../../../utils/pdfGenerator";
import { useDownloadTreatmentMutation } from "../../../hooks/treatment/useDownloadTreatmentMutation";

interface TreatmentTableRowProps {
  treatment: any;
  statusMeta: Record<string, { label: string; cls: string; icon: React.ReactNode }>;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onManageSessions: (id: string) => void;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
}

export function TreatmentTableRow({
  treatment, statusMeta, onView, onEdit, onManageSessions, onStart, onComplete,
}: TreatmentTableRowProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [downloading, setDownloading] = useState(false);
  const { mutateAsync: downloadTreatment } = useDownloadTreatmentMutation();

  const handleDownloadPDF = async (id: string) => {
    try {
      setDownloading(true);
      toast.loading("Generating PDF...", { id: "pdf-download" });
      const data = await downloadTreatment({ id });
      await downloadCompletedTreatmentPDF(data);
      toast.success("PDF downloaded successfully!", { id: "pdf-download" });
    } catch (err: any) {
      toast.error("Failed to download PDF: " + (err.message || ""), { id: "pdf-download" });
    } finally {
      setDownloading(false);
    }
  };

  const openMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const menuHeight = 220;
    const windowHeight = window.innerHeight;
    let top = rect.bottom + 4;
    if (rect.bottom + menuHeight > windowHeight) {
      top = rect.top - menuHeight;
      if (top < 0) top = 10;
    }
    setMenuPos({ top, left: rect.right - 192 });
    setShowMenu(v => !v);
  };

  const sm = statusMeta[treatment.status] || statusMeta.planned;
  const cost = Number(treatment.cost) < 100_000_000 ? Number(treatment.cost) : 0;

  // Session progress from already-mapped sessions array on the UI treatment object
  const sessions: any[] = treatment.sessions ?? [];
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s: any) => s.status === "completed").length;
  const cancelledSessions = sessions.filter((s: any) => s.status === "cancelled").length;

  // FIX: next session date — use plan's nextAppointment (set by backend when session is scheduled)
  // Fall back to finding the earliest SCHEDULED session date
  const nextApptRaw: string | undefined =
    treatment.nextAppointment ||
    sessions
      .filter((s: any) => s.status === "scheduled" || s.status === "in-progress")
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]?.date;

  const nextApptLabel = nextApptRaw
    ? new Date(nextApptRaw).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
    : null;

  return (
    <tr className="group hover:bg-muted/50 transition-colors">

      {/* Patient & Procedure */}
      <td className="py-4 px-6">
        <div className="font-bold text-foreground">{treatment.patientName}</div>
        <div className="text-[11px] font-bold text-primary mt-0.5 uppercase tracking-wider">
          {treatment.procedure}
        </div>
      </td>

      {/* Tooth */}
      <td className="py-4 px-6">
        <span className="px-2 py-1 bg-muted text-muted-foreground rounded-lg text-[10px] font-bold border border-border">
          {treatment.tooth && treatment.tooth !== "—" ? treatment.tooth : "—"}
        </span>
      </td>

      {/* Doctor */}
      <td className="py-4 px-6">
        <div className="text-sm font-semibold text-muted-foreground">{treatment.doctorName || "—"}</div>
      </td>

      {/* Date */}
      <td className="py-4 px-6">
        <div className="text-sm font-medium text-muted-foreground">
          {treatment.date
            ? new Date(treatment.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
            : "—"}
        </div>
      </td>

      {/* Cost */}
      <td className="py-4 px-6 text-right">
        <div className="text-sm font-bold text-foreground">₹{cost.toLocaleString()}</div>
      </td>

      {/* Status badge */}
      <td className="py-4 px-6">
        <span className={`${sm.cls} flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border`}>
          {sm.icon}{sm.label}
        </span>
      </td>

      {/* Next Session — date + optional session progress dots */}
      <td className="py-4 px-6">
        <div className="space-y-1.5">
          {nextApptLabel ? (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary/60 shrink-0" />
              <span className="text-xs font-bold text-foreground">{nextApptLabel}</span>
            </div>
          ) : (
            <span className="text-xs font-bold text-muted-foreground/40">—</span>
          )}

          {/* Session progress dots — shown when sessions exist */}
          {totalSessions > 0 && (
            <div className="flex items-center gap-1">
              {sessions.slice(0, 6).map((s: any, i: number) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${s.status === "completed"
                      ? "bg-emerald-500"
                      : s.status === "cancelled"
                        ? "bg-red-500"
                        : s.status === "in-progress" || s.status === "in_progress"
                          ? "bg-primary animate-pulse"
                          : "bg-border"
                    }`}
                />
              ))}
              {totalSessions > 6 && (
                <span className="text-[9px] text-muted-foreground/50">+{totalSessions - 6}</span>
              )}
              <span className={`text-[9px] font-black ml-1 ${cancelledSessions > 0 ? "text-red-500" : "text-muted-foreground/50"}`}>
                {completedSessions + cancelledSessions}/{totalSessions}
              </span>
            </div>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="py-4 px-6">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            onClick={() => onView(treatment.id)}
            className="p-2 text-muted-foreground/60 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
            title="View Details"
          >
            <FileText className="w-4 h-4" />
          </Button>

          {(treatment.status === "completed" || treatment.status === "COMPLETED") && (
            <Button
              variant="ghost"
              onClick={() => handleDownloadPDF(treatment.id)}
              disabled={downloading}
              className="p-2 text-muted-foreground/60 hover:text-primary hover:bg-primary/10 rounded-xl transition-all disabled:opacity-50"
              title="Download PDF"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
          )}

          <div className="relative">
            <Button
              variant="ghost"
              onClick={openMenu}
              className={`p-2 rounded-xl transition-all ${showMenu ? "bg-muted text-foreground" : "text-muted-foreground/60 hover:text-foreground hover:bg-muted"}`}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>

            {showMenu && createPortal(
              <>
                <div className="fixed inset-0 z-[9998]" onClick={() => setShowMenu(false)} />
                <div
                  className="fixed z-[9999] bg-card rounded-2xl border border-border shadow-2xl w-48 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{ top: menuPos.top, left: menuPos.left }}
                >
                  <div className="p-1.5">
                    {treatment.status !== "completed" && (
                      <Button variant="ghost" onClick={() => { onEdit(treatment.id); setShowMenu(false); }}
                        className="w-full text-left px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-muted-foreground transition-colors">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                          <Edit className="w-4 h-4" />
                        </div>
                        Edit Plan
                      </Button>
                    )}

                    {treatment.status !== "completed" && (
                      <Button variant="ghost" onClick={() => { onManageSessions(treatment.id); setShowMenu(false); }}
                        className="w-full text-left px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-muted-foreground transition-colors">
                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                          Sessions
                          {totalSessions > 0 && (
                            <span className="text-[9px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">
                              {completedSessions}/{totalSessions}
                            </span>
                          )}
                        </div>
                      </Button>
                    )}

                    {treatment.status === "planned" && (
                      <Button variant="ghost" onClick={() => { onStart(treatment.id); setShowMenu(false); }}
                        className="w-full text-left px-3.5 py-2.5 text-xs font-bold hover:bg-primary/10 rounded-xl flex items-center gap-3 text-primary transition-colors">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Play className="w-4 h-4" />
                        </div>
                        Start Now
                      </Button>
                    )}

                    {treatment.status === "in-progress" && (
                      <Button variant="ghost" onClick={() => { onComplete(treatment.id); setShowMenu(false); }}
                        className="w-full text-left px-3.5 py-2.5 text-xs font-bold hover:bg-emerald-50 rounded-xl flex items-center gap-3 text-emerald-700 transition-colors">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        Mark Done
                      </Button>
                    )}
                  </div>
                </div>
              </>,
              document.body,
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
