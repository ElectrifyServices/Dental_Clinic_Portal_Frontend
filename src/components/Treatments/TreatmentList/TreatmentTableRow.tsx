import { Button } from "@/components/ui/Button";
import React, { useState } from "react";
import {
  FileText, MoreVertical, Edit, Clock,
  Play, CheckCircle, Calendar, Download, Loader2, MessageCircle
} from "lucide-react";
import {
  toast, DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuSub,
  DropdownMenuSubTrigger, DropdownMenuSubContent
} from "@/components/ui";
import { downloadCompletedTreatmentPDF } from "../../../utils/pdfGenerator";
import { useDownloadTreatmentMutation } from "../../../hooks/treatment/useDownloadTreatmentMutation";
import { useSendWhatsappTreatmentMutation } from "../../../hooks/treatment/useSendWhatsappTreatmentMutation";
import { useSendWhatsappSessionMutation } from "../../../hooks/treatment/useSendWhatsappSessionMutation";

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
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const { mutateAsync: downloadTreatment } = useDownloadTreatmentMutation();
  const { mutateAsync: sendWhatsapp } = useSendWhatsappTreatmentMutation();
  const { mutateAsync: sendWhatsappSession } = useSendWhatsappSessionMutation();

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

  const handleSendWhatsApp = async (id: string, sessionIndex?: number | 'all', sessionId?: string) => {
    try {
      setSending(true);
      const isAll = !sessionIndex || sessionIndex === 'all';
      toast.loading(isAll ? "Sending via WhatsApp..." : `Sending Session ${sessionIndex} via WhatsApp...`, { id: "whatsapp-send" });
      
      if (isAll) {
        await sendWhatsapp({ id });
      } else if (sessionId) {
        await sendWhatsappSession({ id, sessionId });
      } else {
        throw new Error("Session ID is missing");
      }
      
      toast.success(isAll ? "Treatment plan sent to WhatsApp successfully" : `Session ${sessionIndex} plan sent to WhatsApp successfully`, { id: "whatsapp-send" });
    } catch (err: any) {
      toast.error("Failed to send WhatsApp: " + (err.message || "Unknown error"), { id: "whatsapp-send" });
    } finally {
      setSending(false);
    }
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
        {(() => {
          const rawTooth = treatment.tooth ?? (treatment as any).tooth_number;
          if (rawTooth === undefined || rawTooth === null || rawTooth === "" || rawTooth === "—" || rawTooth === "-") {
            return <span className="px-2 py-1 bg-muted text-muted-foreground rounded-lg text-[10px] font-bold border border-border">—</span>;
          }
          const parts = String(rawTooth).split(",").map(p => p.trim());
          let hasFm = false;
          const formattedParts = parts.map(part => {
            if (part === "-1" || part.toUpperCase() === "FM" || part.toUpperCase() === "FULL MOUTH") {
              hasFm = true;
              return "FM";
            }
            return part;
          });
          const displayStr = formattedParts.join(", ");
          const hoverTitle = hasFm
            ? formattedParts.map(p => (p === "FM" ? "Full Mouth" : `Tooth #${p}`)).join(", ")
            : undefined;

          return (
            <span
              title={hoverTitle}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                hasFm
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-help"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {displayStr}
            </span>
          );
        })()}
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
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="p-2 rounded-xl transition-all text-muted-foreground/60 hover:text-foreground hover:bg-muted"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-2xl bg-white border border-border shadow-lg z-50">
              {/* View Details is always first and available */}
              <DropdownMenuItem
                onClick={() => onView(treatment.id)}
                className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl cursor-pointer flex items-center gap-3 text-muted-foreground transition-colors"
              >
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                View Details
              </DropdownMenuItem>

              {/* If NOT completed, show standard workflow management items */}
              {treatment.status !== "completed" && treatment.status !== "COMPLETED" && (
                <>
                  <DropdownMenuItem
                    onClick={() => onEdit(treatment.id)}
                    className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl cursor-pointer flex items-center gap-3 text-muted-foreground transition-colors"
                  >
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <Edit className="w-4 h-4" />
                    </div>
                    Edit Plan
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onManageSessions(treatment.id)}
                    className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl cursor-pointer flex items-center gap-3 text-muted-foreground transition-colors"
                  >
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
                  </DropdownMenuItem>

                  {treatment.status === "planned" && (
                    <DropdownMenuItem
                      onClick={() => onStart(treatment.id)}
                      className="px-3.5 py-2.5 text-xs font-bold hover:bg-primary/10 rounded-xl cursor-pointer flex items-center gap-3 text-primary transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Play className="w-4 h-4" />
                      </div>
                      Start Now
                    </DropdownMenuItem>
                  )}

                  {treatment.status === "in-progress" && (
                    <DropdownMenuItem
                      onClick={() => onComplete(treatment.id)}
                      className="px-3.5 py-2.5 text-xs font-bold hover:bg-emerald-50 rounded-xl cursor-pointer flex items-center gap-3 text-emerald-700 transition-colors"
                    >
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      Mark Done
                    </DropdownMenuItem>
                  )}
                </>
              )}

              {/* If completed, show PDF Download */}
              {(treatment.status === "completed" || treatment.status === "COMPLETED") && (
                <DropdownMenuItem
                  onClick={() => handleDownloadPDF(treatment.id)}
                  disabled={downloading}
                  className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl cursor-pointer flex items-center gap-3 text-muted-foreground disabled:opacity-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    {downloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </div>
                  Download PDF
                </DropdownMenuItem>
              )}

              {/* Send WhatsApp options - ALWAYS shown */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  disabled={sending}
                  className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center justify-between gap-3 text-muted-foreground cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    Send WhatsApp
                  </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-44 p-1.5 rounded-2xl bg-white border border-border shadow-lg z-[60]">
                    {Array.from({ length: sessions.length || 1 }).map((_, i) => (
                      <DropdownMenuItem
                        key={i}
                        onClick={() => handleSendWhatsApp(treatment.id, i + 1, sessions[i]?.id)}
                        className="px-3.5 py-2 text-xs font-bold hover:bg-muted rounded-xl cursor-pointer"
                      >
                        Session {i + 1}
                      </DropdownMenuItem>
                    ))}
                    <div className="h-px bg-muted my-1" />
                    <DropdownMenuItem
                      onClick={() => handleSendWhatsApp(treatment.id, 'all')}
                      className="px-3.5 py-2 text-xs font-bold hover:bg-muted rounded-xl cursor-pointer text-emerald-600"
                    >
                      Full WhatsApp
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}
