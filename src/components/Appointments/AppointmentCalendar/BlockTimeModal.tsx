import { useState } from "react";
import { Ban, Trash2, Loader2, AlertTriangle, CalendarOff } from "lucide-react";
import { Modal, Button, LabeledField, Input, HourMinPicker } from "@/components/ui";
import { useAvailabilityOverridesQuery } from "@/hooks/staff/useAvailabilityOverridesQuery";
import { useCreateAvailabilityOverrideMutation } from "@/hooks/staff/useCreateAvailabilityOverrideMutation";
import { useDeleteAvailabilityOverrideMutation } from "@/hooks/staff/useDeleteAvailabilityOverrideMutation";

interface BlockTimeModalProps {
  doctorId: string;
  doctorName?: string;
  /** "YYYY-MM-DD" */
  date: string;
  onClose: () => void;
}

function formatTime12(t: string | null): string {
  if (!t || !t.includes(":")) return "";
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${String(displayHour).padStart(2, "0")}:${mStr} ${ampm}`;
}

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function BlockTimeModal({ doctorId, doctorName, date, onClose }: BlockTimeModalProps) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: overridesResponse, isLoading } = useAvailabilityOverridesQuery(doctorId, date);
  const overrides = overridesResponse?.data || [];

  const createOverride = useCreateAvailabilityOverrideMutation();
  const deleteOverride = useDeleteAvailabilityOverrideMutation();

  const handleAddBlock = async () => {
    setError(null);
    if ((startTime && !endTime) || (!startTime && endTime)) {
      setError("Please set both a start and end time, or leave both empty to block the whole day.");
      return;
    }
    if (startTime && endTime && startTime >= endTime) {
      setError("Start time must be before end time.");
      return;
    }
    try {
      await createOverride.mutateAsync({
        doctorId,
        payload: {
          date,
          start_time: startTime || undefined,
          end_time: endTime || undefined,
          reason: reason || undefined,
        },
      });
      setStartTime("");
      setEndTime("");
      setReason("");
    } catch (err: any) {
      setError(err?.message || "Failed to add block");
    }
  };

  const handleRemove = async (overrideId: string) => {
    try {
      await deleteOverride.mutateAsync({ doctorId, overrideId });
    } catch (err: any) {
      setError(err?.message || "Failed to remove block");
    }
  };

  return (
    <Modal
      title="Block Time"
      subtitle={`${doctorName ? `${doctorName} — ` : ""}${formatDisplayDate(date)}`}
      onClose={onClose}
      icon={<Ban className="w-5 h-5 text-red-600" />}
      size="lg"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="outline" onClick={onClose}>Done</Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="bg-primary/5 rounded-2xl border border-border p-4 space-y-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Block a time range for this date only
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LabeledField label="Start Time">
              <HourMinPicker value={startTime} onChange={setStartTime} optional />
            </LabeledField>
            <LabeledField label="End Time">
              <HourMinPicker value={endTime} onChange={setEndTime} optional />
            </LabeledField>
          </div>
          <LabeledField label="Reason (Optional)">
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Lunch, Emergency"
              className="w-full"
            />
          </LabeledField>
          <p className="text-[11px] text-muted-foreground">
            Leave both times empty to block the whole day for {doctorName || "this doctor"} on {formatDisplayDate(date)}.
          </p>

          {error && (
            <div className="flex items-center gap-2 text-xs font-semibold text-destructive bg-destructive/10 rounded-xl px-3 py-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Button
            onClick={handleAddBlock}
            disabled={createOverride.isPending}
            className="w-full gap-2"
          >
            {createOverride.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
            {createOverride.isPending ? "Blocking..." : "Block This Time"}
          </Button>
        </div>

        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Existing Blocks on {formatDisplayDate(date)}
          </p>
          {isLoading ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : overrides.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center opacity-50">
              <CalendarOff className="w-6 h-6 text-muted-foreground mb-2" />
              <p className="text-xs font-semibold text-muted-foreground">No blocks for this date</p>
            </div>
          ) : (
            <div className="space-y-2">
              {overrides.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-red-700">
                      {o.start_time && o.end_time ? `${formatTime12(o.start_time)} - ${formatTime12(o.end_time)}` : "Whole Day"}
                    </p>
                    {o.reason && <p className="text-xs text-red-600/80 truncate">{o.reason}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    disabled={deleteOverride.isPending}
                    onClick={() => handleRemove(o.id)}
                    className="h-8 w-8 rounded-full p-0 text-red-600 hover:bg-red-100 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
