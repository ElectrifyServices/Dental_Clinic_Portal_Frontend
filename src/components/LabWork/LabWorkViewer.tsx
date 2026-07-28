import { FlaskConical, ShieldCheck, ShieldOff, FileText } from "lucide-react";
import { Modal, Button, StatusBadge } from "@/components/ui";
import { getFileUrl } from "../../services/apiClient";
import { LabWork, LabWorkStatus } from "../../types";

interface LabWorkViewerProps {
  labWork: LabWork;
  onClose: () => void;
}

const STATUS_META: Record<LabWorkStatus, { label: string; variant: "blue" | "amber" | "green" }> = {
  ordered: { label: "Ordered", variant: "blue" },
  received: { label: "Received", variant: "amber" },
  paid: { label: "Paid", variant: "green" },
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-sm font-bold text-foreground text-right">{value}</span>
    </div>
  );
}

export function LabWorkViewer({ labWork, onClose }: LabWorkViewerProps) {
  const meta = STATUS_META[labWork.status] || STATUS_META.ordered;

  return (
    <Modal
      title="Lab Work Details"
      onClose={onClose}
      size="md"
      icon={<FlaskConical className="w-4 h-4" />}
      footer={
        <div className="flex justify-end w-full">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-1">
        <Row label="Patient" value={labWork.patientName} />
        <Row label="Treatment" value={labWork.treatmentName || "—"} />
        <Row label="Lab Name" value={labWork.labName} />
        <Row label="Work / Tooth No." value={labWork.workType} />
        <Row label="No. of Units" value={labWork.unitsCount} />
        <Row
          label="Warranty"
          value={
            labWork.hasWarranty ? (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" /> Warranty
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <ShieldOff className="w-3.5 h-3.5" /> No Warranty
              </span>
            )
          }
        />
        {labWork.hasWarranty && (
          <>
            <Row label="Warranty Years" value={labWork.warrantyYears ?? "—"} />
            <Row label="Warranty Valid Till" value={formatDate(labWork.warrantyEndDate)} />
          </>
        )}
        <Row label="Created Date" value={formatDate(labWork.createdDate)} />
        <Row label="Price" value={`₹${Number(labWork.price || 0).toLocaleString()}`} />
        <Row
          label="Status"
          value={
            <StatusBadge variant={meta.variant} className="text-[10px] uppercase font-bold">
              {meta.label}
            </StatusBadge>
          }
        />
        {labWork.notes && (
          <div className="py-2.5 border-b border-border/50">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
              Notes
            </span>
            <p className="text-sm text-foreground whitespace-pre-wrap">{labWork.notes}</p>
          </div>
        )}
        {labWork.attachments && labWork.attachments.length > 0 && (
          <div className="py-2.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
              Documents
            </span>
            <div className="space-y-1.5">
              {labWork.attachments.map((att) => (
                <a
                  key={att.id}
                  href={getFileUrl(att.file_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline text-sm font-semibold"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">{att.file_name}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
