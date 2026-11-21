import React from "react";
import { Clock, Calendar, Stethoscope } from "lucide-react";
import { DataTable, Badge } from "@/components/ui";
import { formatPhoneWithCountryCode } from "@/utils/phoneUtils";

interface AppointmentTimelineProps {
  appointments: any[];
  doctors: any[];
  statusVariants?: Record<string, any>;
}

export const AppointmentTimeline: React.FC<AppointmentTimelineProps> = ({
  appointments = [],
  doctors = [],
}) => {
  const sortedAppointments = [...appointments].sort((a, b) => {
    const timeA = a.time || a.bookedTime || "";
    const timeB = b.time || b.bookedTime || "";
    return timeA.localeCompare(timeB);
  });

  const getStatusVariant = (status: string): "green" | "blue" | "amber" | "red" | "gray" | "violet" | "indigo" => {
    const lower = (status || "").toLowerCase();
    if (lower === "completed" || lower === "checked-in") return "green";
    if (lower === "booked" || lower === "confirmed" || lower === "scheduled") return "indigo";
    if (lower === "in-progress") return "blue";
    if (lower === "cancelled") return "red";
    if (lower === "no-show") return "amber";
    return "gray";
  };

  const columns = [
    {
      key: "time",
      header: "Time",
      render: (apt: any) => (
        <div className="flex items-center gap-2 font-mono text-xs font-semibold text-primary">
          <Clock className="w-3.5 h-3.5" />
          {apt.time || apt.bookedTime}
        </div>
      ),
    },
    {
      key: "patientName",
      header: "Patient Name",
      render: (apt: any) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-xs">{apt.patientName}</span>
          {apt.patientPhone && (
            <span className="text-[10px] text-muted-foreground font-mono">{formatPhoneWithCountryCode(apt.patientPhone, apt.country_code)}</span>
          )}
        </div>
      ),
    },
    {
      key: "doctor",
      header: "Doctor",
      render: (apt: any) => {
        const doctor = Array.isArray(doctors) ? doctors.find((d) => d.id === apt.doctorId) : undefined;
        return (
          <span className="font-medium text-xs text-foreground">
            {doctor?.name || apt.doctorName || "—"}
          </span>
        );
      },
    },
    {
      key: "treatment",
      header: "Treatment / Reason",
      render: (apt: any) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Stethoscope className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span>{apt.treatmentType || apt.type || "General / Regular"}</span>
        </div>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (apt: any) => (
        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded">
          {apt.duration || 15} Min
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (apt: any) => (
        <Badge variant={getStatusVariant(apt.status)}>
          {apt.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-primary animate-pulse" />
        <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">
          Live Timeline
        </h4>
      </div>
      <DataTable
        columns={columns}
        data={sortedAppointments}
        emptyIcon={<Calendar className="w-8 h-8 text-muted-foreground/40" />}
        emptyTitle="No appointments scheduled"
        emptySubtitle="Timeline will populate once appointments are added."
        rowKey={(row: any) => row.id || Math.random().toString()}
      />
    </div>
  );
};
