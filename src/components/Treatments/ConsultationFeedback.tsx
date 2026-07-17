import type React from "react";
import { ClipboardList, ExternalLink, FileText, Loader2, Paperclip, Pill, Stethoscope } from "lucide-react";
import { Button, Card, Modal } from "@/components/ui";
import {
  ConsultationFeedbackItem,
  PlanPrescription,
  useTreatmentConsultationFeedbackQuery,
} from "../../hooks/treatment/useTreatmentSessionHooks";

interface ConsultationFeedbackProps {
  treatmentId: string;
  patientName?: string;
  onClose: () => void;
}

const getFeedbackItems = (payload: any): ConsultationFeedbackItem[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.responseObject?.data)) return payload.responseObject.data;
  return [];
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getMedicineName = (prescription: PlanPrescription) =>
  prescription.medicine?.name ||
  prescription.medicine_name ||
  prescription.medicineName ||
  "Medicine";

function NotesBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card px-4 py-3">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="min-h-[40px] whitespace-pre-wrap text-sm font-medium leading-relaxed text-foreground">
        {value?.trim() || "N/A"}
      </p>
    </div>
  );
}

export function ConsultationFeedback({
  treatmentId,
  patientName,
  onClose,
}: ConsultationFeedbackProps) {
  const { data, isLoading, isError, error } = useTreatmentConsultationFeedbackQuery(treatmentId, {
    enabled: !!treatmentId,
  });

  const feedbackItems = getFeedbackItems(data);
  const feedback = feedbackItems[0];
  const prescriptions = feedback?.prescriptions ?? [];
  const attachments = feedback?.attachments ?? [];

  return (
    <Modal
      title="Consultation Feedback"
      subtitle={patientName}
      onClose={onClose}
      size="5xl"
      icon={<ClipboardList className="w-5 h-5" />}
    >
      {isLoading ? (
        <div className="flex min-h-[260px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-5 text-sm font-semibold text-red-700">
          {(error as any)?.response?.data?.message || "Failed to load consultation feedback."}
        </div>
      ) : !feedback ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-muted-foreground">
            No consultation feedback found.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <NotesBlock
              icon={<Stethoscope className="h-3.5 w-3.5" />}
              label="Diagnosis"
              value={feedback.diagnosis_desc}
            />
            <NotesBlock
              icon={<ClipboardList className="h-3.5 w-3.5" />}
              label="Observations"
              value={feedback.observations_desc}
            />
            <NotesBlock
              icon={<FileText className="h-3.5 w-3.5" />}
              label="Treatment Plan"
              value={feedback.treatment_plan_desc}
            />
            <NotesBlock
              icon={<FileText className="h-3.5 w-3.5" />}
              label="Additional Notes"
              value={feedback.additional_notes}
            />
          </div>

          <Card className="overflow-hidden rounded-xl border border-border/70">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-black text-foreground">Prescriptions</h3>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                {prescriptions.length}
              </span>
            </div>
            {prescriptions.length > 0 ? (
              <div className="divide-y divide-border">
                {prescriptions.map((prescription, index) => (
                  <div key={prescription.id || index} className="grid gap-3 px-4 py-3 sm:grid-cols-[1.2fr_2fr]">
                    <div>
                      <p className="text-sm font-black text-foreground">{getMedicineName(prescription)}</p>
                      {prescription.instructions && (
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          {prescription.instructions}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
                      {prescription.dosage && <span>Dosage: {prescription.dosage}</span>}
                      {prescription.timing && <span>Timing: {prescription.timing}</span>}
                      {prescription.frequency && <span>Frequency: {prescription.frequency}</span>}
                      {prescription.duration != null && (
                        <span>
                          Duration: {prescription.duration} {prescription.duration_type || "DAYS"}
                        </span>
                      )}
                      {prescription.qty != null && <span>Qty: {prescription.qty}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-5 text-sm font-semibold text-muted-foreground">
                No prescriptions added.
              </p>
            )}
          </Card>

          <Card className="overflow-hidden rounded-xl border border-border/70">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-black text-foreground">Attachments</h3>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black text-primary">
                {attachments.length}
              </span>
            </div>
            {attachments.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
                {attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">{attachment.file_name}</p>
                      <p className="text-xs font-medium text-muted-foreground">
                        {[formatFileSize(attachment.file_size), formatDate(attachment.uploaded_at)]
                          .filter(Boolean)
                          .join(" | ")}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="px-4 py-5 text-sm font-semibold text-muted-foreground">
                No attachments added.
              </p>
            )}
          </Card>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
