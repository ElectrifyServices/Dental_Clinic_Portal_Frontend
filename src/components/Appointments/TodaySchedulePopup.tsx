import { Layout } from "lucide-react";
import { Modal } from "@/components/ui";
import { DoctorAvailability } from "./TodaySchedule/DoctorAvailability";
import { AppointmentTimeline } from "./TodaySchedule/AppointmentTimeline";

interface TodaySchedulePopupProps {
  onClose: () => void;
  appointments: any[];
  doctors: any[];
  doctorAvailability: { [key: string]: boolean };
  onToggleDoctorAvailability: (doctorId: string) => void;
}

const STATUS_VARIANTS: Record<string, any> = {
  completed: "green",
  "in-progress": "blue",
  "checked-in": "green",
  confirmed: "indigo",
  scheduled: "gray",
  cancelled: "red",
  "no-show": "amber",
};

export function TodaySchedulePopup({
  onClose,
  appointments = [],
  doctors = [],
  doctorAvailability = {},
  onToggleDoctorAvailability = () => {},
}: TodaySchedulePopupProps) {
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter((apt) => apt.date === todayStr);

  const completedCount = todayAppointments.filter(
    (a) => a.status === "completed",
  ).length;
  const pendingCount = todayAppointments.filter(
    (a) => !["completed", "cancelled", "no-show"].includes(a.status),
  ).length;

  return (
    <Modal
      title="Today's Clinic Schedule"
      subtitle={new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
      onClose={onClose}
      size="5xl"
      icon={<Layout className="w-4 h-4" />}
    >
      <div className="space-y-8 py-2">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "Total Booked",
              val: todayAppointments.length,
              bg: "bg-primary/5",
              border: "border-primary/10",
              text: "text-primary",
            },
            {
              label: "Completed",
              val: completedCount,
              bg: "bg-emerald-50",
              border: "border-emerald-100",
              text: "text-emerald-700",
            },
            {
              label: "Pending Slots",
              val: pendingCount,
              bg: "bg-primary/10",
              border: "border-primary/20",
              text: "text-primary",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`${s.bg} p-5 rounded-2xl border ${s.border} shadow-sm transition-all hover:shadow-md`}
            >
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">
                {s.label}
              </p>
              <p className={`text-2xl font-black ${s.text}`}>{s.val}</p>
            </div>
          ))}
        </div>

        <div className="h-px bg-border/50" />

        <DoctorAvailability
          doctors={doctors}
          doctorAvailability={doctorAvailability}
          onToggle={onToggleDoctorAvailability}
        />

        <div className="h-px bg-border/50" />

        <div className="space-y-4">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
            Live Appointment Timeline
          </label>
          <AppointmentTimeline
            appointments={todayAppointments}
            doctors={doctors}
            statusVariants={STATUS_VARIANTS}
          />
        </div>
      </div>
    </Modal>
  );
}
