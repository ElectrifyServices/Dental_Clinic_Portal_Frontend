import {
  MessageSquareText,
  Download,
  Stethoscope,
  User,
  Calendar,
  FileText,
  Camera,
  Pill,
  IndianRupee,
  Clock,
  Activity,
  CheckCircle2,
  Clock as ClockIcon,
  CalendarDays,
  Edit2,
  ExternalLink,
  Paperclip,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { useState } from "react";
import { Modal, Button, ContentCard, Badge, Loading } from "@/components/ui";
import { useTreatmentPlanQuery } from "@/hooks/treatment/useTreatmentPlanQuery";
import { ConsultationFeedback } from "./ConsultationFeedback";

interface TreatmentViewerProps {
  treatmentId: string; // Changed from treatment: any to treatmentId
  onClose: () => void;
  onEditTreatment: (id: string) => void;
  onMarkCompleted: (id: string) => void;
  onStartTreatment: (id: string) => void;
  onManageSessions?: (id: string, sessionId?: string) => void;
}

export function TreatmentViewer({
  treatmentId,
  onClose,
  onEditTreatment,
  onMarkCompleted,
  onStartTreatment,
  onManageSessions,
}: TreatmentViewerProps) {
  const [showConsultationFeedback, setShowConsultationFeedback] = useState(false);

  // Fetch treatment data using the ID
  const { data: treatmentData, isLoading, error } = useTreatmentPlanQuery(treatmentId, {
    enabled: !!treatmentId
  });

  const treatment = treatmentData?.data ?? treatmentData; // Adjust based on your API response structure

  // Loading state
  if (isLoading) {
    return (
      <Modal
        title="Loading..."
        onClose={onClose}
        size="5xl"
        icon={<Stethoscope className="w-5 h-5 animate-pulse" />}
      >
        <div className="flex items-center justify-center py-12">
          <Loading type="spinner" text="Loading treatment details..." />
        </div>
      </Modal>
    );
  }

  // Error state
  if (error) {
    return (
      <Modal
        title="Error Loading Treatment"
        onClose={onClose}
        size="5xl"
        icon={<Stethoscope className="w-5 h-5 text-red-500" />}
      >
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Failed to load treatment details</p>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  if (!treatment) return null;
  const handleDownload = () => {
    const printContent = `
      <html>
        <head>
          <title>Treatment Plan - ${treatment.patient?.name || treatment.patientName}</title>
          <style>
            body { font-family: 'Inter', sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 4px solid #3b82f6; padding-bottom: 20px; }
            .section { background: #f8fafc; padding: 25px; border-radius: 16px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
            h1, h2, h3 { color: #0f172a; margin-top: 0; }
            .prescription-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .med-card { background: white; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; }
            .session-card { background: white; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 12px; }
            .session-status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .status-scheduled { background: #fef3c7; color: #d97706; }
            .status-completed { background: #d1fae5; color: #059669; }
            .status-in-progress { background: #dbeafe; color: #2563eb; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TREATMENT PLAN & PROGRESS</h1>
            <p style="font-weight: bold; color: #3b82f6;">Opal Smiles Dental Studio - Advanced Dental Solutions</p>
          </div>
          
          <div class="section">
            <h3>Patient Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <p><strong>Patient:</strong> ${treatment.patient?.name || treatment.patientName}</p>
              <p><strong>Procedure:</strong> ${treatment.procedure}</p>
              <p><strong>Tooth:</strong> ${(() => {
                if (!treatment.tooth_number) return "-";
                const parts = String(treatment.tooth_number).split(",").map(p => p.trim());
                let hasFm = false;
                const formatted = parts.map(p => {
                  if (p === "-1" || p.toUpperCase() === "FM" || p.toUpperCase() === "FULL MOUTH") {
                    hasFm = true;
                    return "FM";
                  }
                  return p;
                });
                const display = formatted.join(", ");
                return hasFm ? `<span title="Full Mouth" style="cursor:help; font-weight:bold; color:#059669;">${display}</span>` : display;
              })()}</p>
              <p><strong>Doctor:</strong> ${treatment.doctor?.name || treatment.doctorName}</p>
              <p><strong>Date:</strong> ${new Date(treatment.treatment_date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${treatment.status}</p>
            </div>
          </div>

          <div class="section">
            <h3>Clinical Notes</h3>
            <p style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0;">${treatment.clinical_notes || "No notes available."}</p>
          </div>

          ${treatment.sessions?.length > 0
        ? `
          <div class="section">
            <h3>Treatment Sessions</h3>
            ${treatment.sessions
          .map(
            (session: any) => `
              <div class="session-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <h4 style="margin: 0;">Session ${session.visit_number}</h4>
                  <span class="session-status status-${session.status?.toLowerCase()}">${session.status}</span>
                </div>
                <p><strong>Date:</strong> ${new Date(session.visit_date).toLocaleDateString()}</p>
                <p><strong>Duration:</strong> ${session.duration_min} mins</p>
                <p><strong>Fee:</strong> ₹${parseInt(session.session_fee).toLocaleString()}</p>
                ${session.work_done
                ? `<p><strong>Work Done:</strong> ${session.work_done}</p>`
                : ""
              }
                ${session.session_findings
                ? `<p><strong>Findings:</strong> ${session.session_findings}</p>`
                : ""
              }
                ${session.next_session_plan
                ? `<p><strong>Next Session Plan:</strong> ${session.next_session_plan}</p>`
                : ""
              }
              </div>
            `,
          )
          .join("")}
          </div>
          `
        : ""
      }

          <div class="section">
            <h3>Prescribed Medications</h3>
            <div class="prescription-grid">
              ${(treatment.prescriptions || [])
        .map(
          (p: any) => {
            const printMedName = p.medicine?.name || p.medicine_name || p.medicineName || "Medicine";
            return `
                <div class="med-card">
                  <p><strong>${printMedName}</strong></p>
                  <p style="font-size: 13px; margin: 5px 0;">Dosage: ${p.dosage} | Timing: ${p.timing}</p>
                  <p style="font-size: 13px; margin: 5px 0;">Freq: ${p.frequency}/day | Dur: ${p.duration} ${p.duration_type}</p>
                  <p style="font-size: 13px; margin: 5px 0;">Quantity: ${p.qty} units</p>
                  ${p.medicine?.description ? `<p style="font-size: 13px; margin: 5px 0; color: #64748b;"><em>${p.medicine.description}</em></p>` : ""}
                  ${p.instructions ? `<p style="font-size: 13px; margin: 5px 0;"><strong>Instructions:</strong> ${p.instructions}</p>` : ""}
                </div>
              `;
          }
        )
        .join("")}
            </div>
          </div>

          <div class="footer">
            <p>Confidential medical document. Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;
    const blob = new Blob([printContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `treatment-plan-${treatment.patient?.name || treatment.patientName}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSessionStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      SCHEDULED: "amber",
      IN_PROGRESS: "blue",
      COMPLETED: "green",
      CANCELLED: "red",
    };
    return variants[status?.toUpperCase()] || "default";
  };

  const getSessionStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "IN_PROGRESS":
        return <Activity className="w-4 h-4 text-blue-500" />;
      case "SCHEDULED":
        return <CalendarDays className="w-4 h-4 text-amber-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const statusVariant = (
    treatment.status === "COMPLETED"
      ? "green"
      : treatment.status === "IN_PROGRESS"
        ? "blue"
        : "amber"
  ) as any;

  // Calculate session progress
  const totalSessions = treatment.sessions?.length || 0;
  const completedSessions =
    treatment.sessions?.filter((s: any) => s.status === "COMPLETED").length || 0;
  const sessionProgress =
    totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  return (
    <Modal
      title={treatment.procedure}
      subtitle={`${treatment.patient?.name || treatment.patientName} • ${(() => {
        if (!treatment.tooth_number) return "Tooth -";
        const parts = String(treatment.tooth_number).split(",").map(p => p.trim());
        let hasFm = false;
        const formatted = parts.map(p => {
          if (p === "-1" || p.toUpperCase() === "FM" || p.toUpperCase() === "FULL MOUTH") {
            hasFm = true;
            return "FM";
          }
          return p;
        });
        return `Tooth ${formatted.join(", ")}${hasFm ? " (Full Mouth)" : ""}`;
      })()}`}
      onClose={onClose}
      size="5xl"
      icon={<Stethoscope className="w-5 h-5" />}
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-10 rounded-xl"
            >
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowConsultationFeedback(true)}
              className="gap-2 h-10 rounded-xl"
            >
              <MessageSquareText className="w-4 h-4" /> Consultation Feedback
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <ContentCard
            title="Patient Overview"
            icon={<User className="w-5 h-5" />}
            className="bg-primary/5 border-primary/10"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-primary/5 pb-2">
                <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">
                  Name
                </span>
                <span className="text-sm font-black text-foreground">
                  {treatment.patient?.name}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-primary/5 pb-2">
                <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">
                  Phone
                </span>
                <span className="text-sm font-black text-foreground">
                  {treatment.patient?.phone || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-primary/5 pb-2">
                <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">
                  Tooth
                </span>
                <span className="text-sm font-black text-foreground">
                  {String(treatment.tooth_number) === "-1" || String(treatment.tooth_number) === "FM" ? "Full Mouth" : `#${treatment.tooth_number}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">
                  Doctor
                </span>
                <span className="text-sm font-black text-foreground">
                  {treatment.doctor?.name || treatment.doctor?.staff?.name || treatment.doctorName || (treatment.doctor as any)?.personal_profile?.staff?.name || "—"}
                </span>
              </div>
            </div>
          </ContentCard>

          <ContentCard
            title="Timeline & Status"
            icon={<Calendar className="w-5 h-5" />}
            className="bg-emerald-50/50 border-emerald-100"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-emerald-100/50 pb-2">
                <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">
                  Treatment Date
                </span>
                <span className="text-sm font-black text-foreground">
                  {new Date(treatment.treatment_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-emerald-100/50 pb-2">
                <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">
                  Next Visit
                </span>
                <span className="text-sm font-black text-foreground">
                  {treatment.next_appointment
                    ? new Date(treatment.next_appointment).toLocaleDateString(
                      "en-IN",
                      { day: "2-digit", month: "short", year: "numeric" }
                    )
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">
                  Status
                </span>
                <Badge
                  variant={statusVariant}
                  className="font-black text-[9px] uppercase tracking-widest px-2.5 h-5"
                >
                  {treatment.status?.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </ContentCard>

          {(() => {
            const estCost = Number(treatment.est_cost) || 0;
            const discountVal = Number(treatment.discount_value) || 0;
            const discountAmt = Number(treatment.discount_amount) || 0;
            
            const membershipBenefits = treatment.membership_benefits;
            const membershipDiscount = Number(membershipBenefits?.benefit_discount) || 0;
            
            const finalCost = Number(membershipBenefits?.final_cost) 
              || Number(treatment.final_cost) 
              || (estCost - discountAmt);

            const rawPaidAmt = treatment.total_paid_amount ?? treatment.totalPaidAmount ?? treatment.paid_amount ?? treatment.paidAmount ?? 0;
            const paidAmt = isNaN(Number(rawPaidAmt)) ? 0 : Number(rawPaidAmt);

            const rawPendingAmt = treatment.pending_amount ?? treatment.pendingAmount;
            const pendingAmt = rawPendingAmt !== null && rawPendingAmt !== undefined && !isNaN(Number(rawPendingAmt))
              ? Number(rawPendingAmt)
              : Math.max(0, finalCost - paidAmt);

            return (
              <ContentCard
                title="Financial Summary"
                icon={<IndianRupee className="w-5 h-5" />}
                className="bg-indigo-50/50 border-indigo-100"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-indigo-100/50 pb-2">
                    <span className="text-[10px] font-black text-indigo-600/60 uppercase tracking-widest">
                      Estimated Cost
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      ₹{estCost.toLocaleString()}
                    </span>
                  </div>
                  {discountVal > 0 && (
                    <div className="flex justify-between items-center border-b border-indigo-100/50 pb-2">
                      <span className="text-[10px] font-black text-indigo-600/60 uppercase tracking-widest">
                        Discount ({discountVal}%)
                      </span>
                      <span className="text-sm font-bold text-red-500">
                        − ₹{discountAmt.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {membershipBenefits && (
                    <>
                      <div className="flex justify-between items-center border-b border-indigo-100/50 pb-2">
                        <span className="text-[10px] font-black text-indigo-600/60 uppercase tracking-widest">
                          Membership
                        </span>
                        <Badge variant="indigo" className="text-[9px] font-black uppercase tracking-widest px-1.5 h-5 truncate max-w-[120px]">
                          {membershipBenefits.plan_name}
                        </Badge>
                      </div>
                      {membershipDiscount > 0 && (
                        <div className="flex justify-between items-center border-b border-indigo-100/50 pb-2">
                          <span className="text-[10px] font-black text-indigo-600/60 uppercase tracking-widest">
                            Member Savings
                          </span>
                          <span className="text-sm font-bold text-purple-600">
                            − ₹{membershipDiscount.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between items-center border-b border-indigo-100/50 pb-2">
                    <span className="text-[10px] font-black text-indigo-600/60 uppercase tracking-widest">
                      Final Cost
                    </span>
                    <span className="text-sm font-black text-indigo-900">
                      ₹{finalCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-indigo-100/50 pb-2">
                    <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">
                      Total Paid Amount
                    </span>
                    <span className="text-sm font-black text-emerald-600">
                      ₹{paidAmt.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-red-500/80 uppercase tracking-widest">
                      Pending Amount
                    </span>
                    <span className="text-sm font-black text-red-600">
                      ₹{pendingAmt.toLocaleString()}
                    </span>
                  </div>
                </div>
              </ContentCard>
            );
          })()}
        </div>

        {treatment.membership_benefits && (
          <ContentCard
            title="Membership Plan Benefits Applied"
            icon={<ShieldCheck className="w-5 h-5 text-indigo-600" />}
            className="bg-indigo-50/20 border-indigo-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Plan Details</p>
                <div className="bg-card p-3 rounded-xl border border-indigo-100/50 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900">{treatment.membership_benefits.plan_name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Enrolled Member: {treatment.membership_benefits.member_name}</p>
                  </div>
                  <Badge variant="indigo" className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
                    Active
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Benefit Summary</p>
                <div className="space-y-2">
                  {(treatment.membership_benefits.benefits || []).map((benefit: any, idx: number) => {
                    const isFlatDiscount = benefit.type === "FLAT_DISCOUNT";
                    return (
                      <div key={idx} className="flex items-start justify-between p-2.5 bg-card rounded-xl border border-indigo-50/80 text-xs">
                        <div className="flex-1 pr-4">
                          <span className="font-bold text-foreground">{benefit.benifit_label}</span>
                          {!isFlatDiscount && benefit.allocationCount != null && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                              Used: {benefit.used} / Total: {benefit.allocationCount} (Remaining: {benefit.remaining})
                            </p>
                          )}
                        </div>
                        {isFlatDiscount && benefit.benefit_discount > 0 && (
                          <span className="font-bold text-emerald-600 shrink-0">
                            Saved ₹{Number(benefit.benefit_discount).toLocaleString()}
                          </span>
                        )}
                        {!isFlatDiscount && benefit.used > 0 && (
                          <span className="font-bold text-indigo-600 shrink-0 uppercase text-[9px] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            Availed
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {treatment.reason && (
              <div className="mt-4 p-3 bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 leading-relaxed">
                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Reason for Complimentary Treatment</p>
                {treatment.reason}
              </div>
            )}
          </ContentCard>
        )}

        {/* Sessions Section */}
        {treatment.sessions?.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" /> 
              </h3>
              {totalSessions > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {completedSessions}/{totalSessions} completed
                  </span>
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${sessionProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {treatment.sessions
                .sort(
                  (a: any, b: any) =>
                    (a.visit_number || 0) - (b.visit_number || 0)
                )
                .map((session: any) => (
                  <ContentCard
                    key={session.id}
                    className={`border-l-4 hover:shadow-md transition-all ${session.status === "COMPLETED"
                        ? "border-l-emerald-500"
                        : session.status === "IN_PROGRESS"
                          ? "border-l-blue-500"
                          : "border-l-amber-500"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-black text-primary">
                            {session.visit_number}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-foreground">
                              Session {session.visit_number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {session.clinical_objectives || "No objectives set"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 ml-11">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                            <div>
                              <p className="text-[9px] font-black uppercase text-muted-foreground">
                                Date
                              </p>
                              <p className="text-xs font-semibold">
                                {session.visit_date ? new Date(session.visit_date).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  }
                                ) : "Not Scheduled"}
                              </p>
                            </div>
                          </div>

                           <div className="flex items-center gap-2">
                             <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                             <div>
                               <p className="text-[9px] font-black uppercase text-muted-foreground">
                                 Duration
                               </p>
                               <p className="text-xs font-semibold">
                                 {/* {session.start_time} */}
                                 {session.duration_min} min
                               </p>
                             </div>
                           </div>

                        

                          <div className="flex items-center gap-2">
                            {getSessionStatusIcon(session.status)}
                            <div>
                              <p className="text-[9px] font-black uppercase text-muted-foreground">
                                Status
                              </p>
                              <Badge
                                variant={getSessionStatusBadge(session.status)}
                                className="text-[9px] px-2 h-5 whitespace-nowrap"
                              >
                                {session.status?.replace("_", " ") || "SCHEDULED"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Additional session details */}
                        {(session.work_done ||
                          session.session_findings ||
                          session.next_session_plan ||
                          session.paid_amount ||
                          session.payment_method ||
                          session.attachments?.length > 0) && (
                          <div className="mt-4 ml-11 p-3 bg-muted/30 rounded-lg border border-border/50">
                            {session.work_done && (
                              <div className="mb-2">
                                <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">
                                  Work Done
                                </p>
                                <p className="text-sm">{session.work_done}</p>
                              </div>
                            )}
                            {session.session_findings && (
                              <div className="mb-2">
                                <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">
                                  Clinical Findings
                                </p>
                                <p className="text-sm">{session.session_findings}</p>
                              </div>
                            )}
                            {session.next_session_plan && (
                              <div className="mb-2">
                                <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">
                                  Next Session Plan
                                </p>
                                <p className="text-sm">{session.next_session_plan}</p>
                              </div>
                            )}
                            {(session.paid_amount != null || session.payment_method) && (
                              <div className="mb-2 flex gap-4 border-t border-border/50 pt-2 mt-2">
                                {session.paid_amount != null && Number(session.paid_amount) > 0 && (
                                  <div>
                                    <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">
                                      Paid Amount
                                    </p>
                                    <p className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                                      ₹{Number(session.paid_amount).toLocaleString("en-IN")}
                                    </p>
                                  </div>
                                )}
                                {session.payment_method && (
                                  <div>
                                    <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">
                                      Payment Method
                                    </p>
                                    <p className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block uppercase">
                                      {session.payment_method}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                            {session.attachments?.length > 0 && (
                              <div className={session.work_done || session.session_findings || session.next_session_plan ? "mt-3 pt-3 border-t border-border/50" : ""}>
                                <p className="text-[9px] font-black uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                                  <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                                  Attachments
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {session.attachments.map((attachment: any) => {
                                    const fileSize = formatFileSize(Number(attachment.file_size));
                                    const fileMeta = [fileSize, attachment.file_type || attachment.file_extension]
                                      .filter(Boolean)
                                      .join(" | ");

                                    return (
                                      <a
                                        key={attachment.id || attachment.file_url}
                                        href={attachment.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-3 rounded-lg border border-border/70 bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                                      >
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                                          <FileText className="w-4 h-4" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                          <span className="block truncate">
                                            {attachment.file_name || "Attachment"}
                                          </span>
                                          {fileMeta && (
                                            <span className="block text-[10px] font-bold text-muted-foreground">
                                              {fileMeta}
                                            </span>
                                          )}
                                        </span>
                                        <ExternalLink className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                                      </a>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {onManageSessions && session.status === "COMPLETED" && (
                        <Button
                          variant="outline"
                          className="h-9 w-9 rounded-xl border-blue-200 bg-blue-50 p-0 text-blue-700 hover:bg-blue-100 shrink-0"
                          onClick={() => onManageSessions(treatment.id, session.id)}
                          title="Edit Session details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </ContentCard>
                ))}
            </div>
          </div>
        )}

        <ContentCard
          title="Clinical Notes & Progression"
          icon={<FileText className="w-5 h-5 text-primary" />}
          className="border-border/50"
        >
          <div className="bg-muted/30 rounded-2xl p-6 border border-border/50 text-foreground font-medium text-sm leading-relaxed whitespace-pre-wrap">
            {treatment.clinical_notes ||
              "No detailed clinical notes provided for this treatment plan."}
          </div>
        </ContentCard>

        {treatment.prescriptions?.length > 0 && (
          <div className="space-y-4">
            <h3 className="px-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-500" /> Prescribed Medications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {treatment.prescriptions.map((p: any) => {
                const medName = p.medicine?.name || p.medicine_name || p.medicineName || "Medicine";
                const dosageText = p.dosage ? `Dosage: ${p.dosage}` : undefined;
                return (
                  <ContentCard
                    key={p.id}
                    title={medName}
                    subtitle={dosageText}
                    className="bg-emerald-50/20 border-emerald-100/50 hover:border-emerald-200 transition-colors"
                  >
                    {p.medicine?.description && (
                      <p className="text-xs text-muted-foreground -mt-1 mb-3 italic">
                        {p.medicine.description}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-emerald-400" /> {p.timing}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-emerald-400" /> {p.duration}{" "}
                        {p.duration_type}
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-emerald-400" /> {p.frequency}/day
                      </div>
                      <div className="flex items-center gap-2">
                        <Pill className="w-3 h-3 text-emerald-400" /> {p.qty} Units
                      </div>
                    </div>
                    {p.instructions && (
                      <div className="mt-3 pt-3 border-t border-emerald-100/50">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-bold">Instructions:</span> {p.instructions}
                        </p>
                      </div>
                    )}
                  </ContentCard>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {showConsultationFeedback && (
        <ConsultationFeedback
          treatmentId={treatmentId}
          patientName={treatment.patient?.name || treatment.patientName}
          onClose={() => setShowConsultationFeedback(false)}
        />
      )}
    </Modal>
  );
}
