import { useEffect, useState } from "react";
import { Wallet, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  Modal, Button, LabeledField, Input,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui";
import { CorporateEmployee } from "@/types";
import {
  useMembershipRefundSummaryQuery,
  MembershipRefundEnrollmentSummary,
} from "@/hooks/corporate/useMembershipRefundSummaryQuery";
import { useRecordMembershipRefundMutation } from "@/hooks/corporate/useRecordMembershipRefundMutation";

interface RecordRefundModalProps {
  employee: CorporateEmployee;
  onClose: () => void;
}

type PaymentMethodValue = "CASH" | "CARD" | "UPI" | "ONLINE";

const PAYMENT_METHODS: { value: PaymentMethodValue; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "UPI", label: "UPI" },
  { value: "ONLINE", label: "Online" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function RecordRefundModal({ employee, onClose }: RecordRefundModalProps) {
  const { data: summaryResponse, isLoading } = useMembershipRefundSummaryQuery(employee.id);
  const summary = summaryResponse?.data;
  const enrollments = summary?.enrollments || [];

  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue>("CASH");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selected: MembershipRefundEnrollmentSummary | undefined = enrollments.find(
    (e) => e.enrollment_id === selectedEnrollmentId,
  );

  useEffect(() => {
    if (enrollments.length > 0 && !selectedEnrollmentId) {
      setSelectedEnrollmentId(enrollments[0].enrollment_id);
    }
  }, [enrollments, selectedEnrollmentId]);

  useEffect(() => {
    if (selected) {
      setAmount(selected.refund_remaining > 0 ? String(selected.refund_remaining) : "");
    }
  }, [selected?.enrollment_id]);

  const recordRefund = useRecordMembershipRefundMutation();

  const handleSubmit = async () => {
    setError(null);
    const numericAmount = Number(amount);
    if (!selectedEnrollmentId) {
      setError("Select a cancelled plan to refund against.");
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      setError("Enter a valid refund amount.");
      return;
    }
    try {
      await recordRefund.mutateAsync({
        memberId: employee.id,
        enrollment_id: selectedEnrollmentId,
        amount: numericAmount,
        payment_method: paymentMethod,
        notes: notes || undefined,
      });
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record refund");
    }
  };

  return (
    <Modal
      title="Record Refund"
      subtitle={employee.name}
      onClose={onClose}
      icon={<Wallet className="w-5 h-5 text-emerald-600" />}
      size="lg"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="outline" onClick={onClose}>Done</Button>
        </div>
      }
    >
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading...</p>
      ) : enrollments.length === 0 ? (
        <p className="text-xs text-muted-foreground">No cancelled membership found for this member.</p>
      ) : (
        <div className="space-y-4">
          {enrollments.length > 1 && (
            <LabeledField label="Cancelled Plan">
              <Select value={selectedEnrollmentId} onValueChange={setSelectedEnrollmentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {enrollments.map((e) => (
                    <SelectItem key={e.enrollment_id} value={e.enrollment_id}>
                      {e.plan_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </LabeledField>
          )}

          {selected && (
            <>
              <div className="rounded-2xl border border-border p-4 space-y-2 bg-muted/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount paid</span>
                  <span className="font-bold text-foreground">Rs. {selected.paid_amount.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payable for period used</span>
                  <span className="font-bold text-foreground">Rs. {selected.amount_payable_for_used_period.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-border pt-2">
                  <span className="text-muted-foreground">Total refund due</span>
                  <span className="font-bold text-foreground">Rs. {selected.refund_due.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Already refunded</span>
                  <span className="font-bold text-foreground">Rs. {selected.refunded_so_far.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-border pt-2">
                  <span className="text-emerald-700 font-semibold">Remaining to refund</span>
                  <span className="font-bold text-emerald-700">Rs. {selected.refund_remaining.toFixed(0)}</span>
                </div>
              </div>

              {selected.refunds.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Refund History
                  </p>
                  <div className="space-y-1.5">
                    {selected.refunds.map((r) => (
                      <div key={r.id} className="flex items-center justify-between text-xs bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-semibold text-emerald-700">Rs. {r.amount.toFixed(0)}</span>
                          <span className="text-muted-foreground">via {r.payment_method}</span>
                        </div>
                        <span className="text-muted-foreground">{formatDate(r.refunded_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.refund_remaining > 0 ? (
                <div className="rounded-2xl border border-border p-4 space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Record a new refund payout
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <LabeledField label="Amount">
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full"
                      />
                    </LabeledField>
                    <LabeledField label="Payment Method">
                      <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethodValue)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </LabeledField>
                  </div>
                  <LabeledField label="Notes (Optional)">
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Partial refund, remainder next week"
                      className="w-full"
                    />
                  </LabeledField>

                  {error && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-destructive bg-destructive/10 rounded-xl px-3 py-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={recordRefund.isPending}
                    className="w-full gap-2"
                  >
                    {recordRefund.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                    {recordRefund.isPending ? "Recording..." : "Record Refund"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Fully refunded — nothing remaining for this plan.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
