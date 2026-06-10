import React from "react";
import {
  Clock,
  MoreVertical,
  Calendar as CalendarIcon,
  Stethoscope,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface AppointmentTableRowProps {
  appointment: any;
  doctors?: any[];
  statusVariants: Record<string, any>;
  formatTime: (t: string) => string;
  onOpenMenu: (e: React.MouseEvent, id: string) => void;
}

export const AppointmentTableRow: React.FC<AppointmentTableRowProps> = ({
  appointment,
  doctors,
  statusVariants,
  formatTime,
  onOpenMenu,
}) => {
  const a = appointment;
  const doc = doctors?.find((d: any) => d.id === a.doctor_id || d.id === a.doctorId);
  let doctorName = doc ? doc.name : (a.doctorName || a.doctor || "");
  if (doctorName && typeof doctorName === "string") {
    doctorName = doctorName.replace(/^(Dr\.\s+|Dr\s+)/i, "");
  }
  
  const ptNameRaw = a.patientName || (a.patient && a.patient.name) || (typeof a.patient === 'string' ? a.patient : "?");
  const patientName = String(ptNameRaw && ptNameRaw !== "[object Object]" ? ptNameRaw : "?");

  return (
    <tr className="hover:bg-muted/50 transition-colors group border-b border-border last:border-none">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary font-bold shadow-sm uppercase">
            {patientName.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-foreground leading-tight mb-0.5 capitalize">
              {patientName}
            </div>
            <div className="text-[10px] text-muted-foreground font-medium">
              {a.patientPhone || a.phone || "No Phone"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-muted-foreground/60" />
          </div>
          <div>
            <div className="font-semibold text-foreground text-xs">
              Dr. {doctorName}
            </div>
            <div className="text-[10px] text-muted-foreground/60 mt-0.5">
              {a.treatmentType || a.type}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs">
            <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground/60" />
            {a.date
              ? new Date(a.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })
              : "—"}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-muted-foreground/40" />
            {formatTime(a.time)}{" "}
            <span className="text-muted-foreground/40 mx-1">•</span>{" "}
            {a.duration || 15} min
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="font-semibold text-foreground text-sm">
          ₹{(a.fee || 0).toLocaleString()}
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge
          variant={statusVariants[a.status] || statusVariants[(a.status || "").toLowerCase()] || statusVariants[(a.status || "").toLowerCase().replace("_", "-")] || "gray"}
          className="text-[10px] px-3 py-0.5 font-medium"
        >
          {String(a.status || "").replace("_", " ").replace("-", " ")}
        </Badge>
      </td>
      <td className="px-6 py-4 text-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground/60 hover:text-foreground hover:bg-muted rounded-xl transition-all"
          onClick={(e) => onOpenMenu(e, a.id)}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
};
