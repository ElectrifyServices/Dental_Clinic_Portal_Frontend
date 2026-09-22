import { useState } from "react";
import { Ban, Loader2, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { Modal, Button, LabeledField, Input } from "@/components/ui";
import { CorporateEmployee } from "@/types";
import { useCancelMembershipMutation, CancelMembershipResult } from "@/hooks/corporate/useCancelMembershipMutation";

interface CancelMembershipModalProps {
  employee: CorporateEmployee;
  onClose: () => void;
}

export function CancelMembershipModal({ employee, onClose }: CancelMembershipModalProps) {
  const dependents = employee.dependents || [];
  const hasFamily = dependents.length > 0;

  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CancelMembershipResult | null>(null);

  const cancelMembership = useCancelMembershipMutation();

  const handleConfirm = async () => {
    setError(null);
    try {
      const res = await cancelMembership.mutateAsync({
        id: employee.id,
        reason: reason || undefined,
      });
      setResult(res?.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel membership");
    }
  };

  if (result) {
    return (
      <Modal
        title="Membership Cancelled"
        subtitle={employee.name}
        onClose={onClose}
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        size="lg"
        footer={
          <div className="flex justify-end w-full">
            <Button onClick={onClose}>Done</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {employee.name}'s membership has been cancelled.
          </div>
          <div className="rounded-2xl border border-border p-4 space-y-2 bg-muted/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated refund for unused period</span>
              <span className="font-bold text-foreground">
                Rs. {(result.total_refund_estimate ?? 0).toFixed(0)}
              </span>
            </div>
            {(result.cancelled_family_members ?? 0) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Family members also cancelled</span>
                <span className="font-bold text-foreground">{result.cancelled_family_members}</span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            This is a computed estimate for reference only — no refund has been processed automatically.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="Cancel Membership"
      subtitle={`${employee.name} — ${employee.corporatePlanName}`}
      onClose={onClose}
      icon={<Ban className="w-5 h-5 text-red-600" />}
      size="lg"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={cancelMembership.isPending}
            className="bg-destructive hover:bg-destructive/90 gap-2"
          >
            {cancelMembership.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
            {cancelMembership.isPending ? "Cancelling..." : "Cancel Membership"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          This will cancel {employee.name}'s current plan. This action cannot be undone.
        </div>

        {hasFamily && (
          <div className="rounded-2xl border border-border p-4">
            <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              This will also cancel {dependents.length} family member{dependents.length > 1 ? "s" : ""}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This plan covers the whole family under one payment, so cancelling it cancels everyone on it.
            </p>
            <ul className="mt-2 space-y-1">
              {dependents.map((dep) => (
                <li key={dep.id} className="text-xs text-foreground/80 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  {dep.name}
                  {dep.relationship && (
                    <span className="text-muted-foreground">({dep.relationship})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <LabeledField label="Reason (Optional)">
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Patient requested cancellation"
            className="w-full"
          />
        </LabeledField>

        {error && (
          <div className="flex items-center gap-2 text-xs font-semibold text-destructive bg-destructive/10 rounded-xl px-3 py-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
