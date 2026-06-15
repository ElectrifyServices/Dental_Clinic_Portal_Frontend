import React, { useEffect } from "react";
import { Layout, Calendar, CheckCircle, Clock } from "lucide-react";
import { Modal, MetricCard } from "@/components/ui";
import { DoctorAvailability } from "./TodaySchedule/DoctorAvailability";
import { AppointmentTimeline } from "./TodaySchedule/AppointmentTimeline";
import {
  useScheduleBookedQuery,
  useSchedulePendingQuery,
  useScheduleCompletedQuery,
  useScheduleTeamAvailabilityQuery,
  useScheduleLiveTimelineQuery,
} from "@/hooks/appointments/useScheduleQueries";

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
  booked: "indigo",
};

export function TodaySchedulePopup({
  onClose,
  appointments = [],
  doctors = [],
  doctorAvailability = {},
  onToggleDoctorAvailability = () => { },
}: TodaySchedulePopupProps) {
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter((apt) => apt.date === todayStr);

  const { data: bookedData, refetch: refetchBooked } = useScheduleBookedQuery();
  const { data: pendingData, refetch: refetchPending } = useSchedulePendingQuery();
  const { data: completedData, refetch: refetchCompleted } = useScheduleCompletedQuery();
  const { data: teamAvailData, refetch: refetchTeam } = useScheduleTeamAvailabilityQuery();
  const { data: timelineData, refetch: refetchTimeline } = useScheduleLiveTimelineQuery();

  useEffect(() => {
    // Refetch all APIs when this modal opens
    refetchBooked();
    refetchPending();
    refetchCompleted();
    refetchTeam();
    refetchTimeline();
  }, [refetchBooked, refetchPending, refetchCompleted, refetchTeam, refetchTimeline]);

  console.log("Dashboard Schedule API Responses:", { bookedData, pendingData, completedData, teamAvailData, timelineData });

  const extractCount = (data: any, fallback: number): number => {
    if (data === null || data === undefined) return fallback;
    if (typeof data === "number") return data;
    if (typeof data === "string") {
      const parsed = parseInt(data, 10);
      return isNaN(parsed) ? fallback : parsed;
    }
    
    if (typeof data === "object") {
      // 1. Try direct keys
      const keys = ["count", "total", "booked", "pending", "completed", "value"];
      for (const key of keys) {
        if (typeof data[key] === "number") return data[key];
        if (typeof data[key] === "string") {
          const parsed = parseInt(data[key], 10);
          if (!isNaN(parsed)) return parsed;
        }
      }
      
      // 2. Try nested data key
      if (data.data !== undefined && data.data !== null) {
        if (typeof data.data === "number") return data.data;
        if (typeof data.data === "string") {
          const parsed = parseInt(data.data, 10);
          if (!isNaN(parsed)) return parsed;
        }
        if (typeof data.data === "object") {
          const nested = extractCount(data.data, -999999);
          if (nested !== -999999) return nested;
        }
      }

      // 3. Fallback to first numeric property
      for (const k of Object.keys(data)) {
        if (typeof data[k] === "number") return data[k];
        if (typeof data[k] === "string") {
          const parsed = parseInt(data[k], 10);
          if (!isNaN(parsed)) return parsed;
        }
      }
    }
    return fallback;
  };

  const resolvedAppointments = Array.isArray(timelineData?.data?.appointments)
    ? timelineData.data.appointments
    : Array.isArray(timelineData?.appointments)
    ? timelineData.appointments
    : Array.isArray(timelineData?.data)
    ? timelineData.data
    : Array.isArray(timelineData)
    ? timelineData
    : todayAppointments;

  const bookedCount = extractCount(bookedData, resolvedAppointments.length);
  const completedCount = extractCount(completedData, resolvedAppointments.filter((a: any) => (a.status || "").toLowerCase() === "completed").length);
  const pendingCount = extractCount(pendingData, resolvedAppointments.filter((a: any) => !["completed", "cancelled", "no-show"].includes((a.status || "").toLowerCase())).length);

  const resolvedDoctors = Array.isArray(teamAvailData?.data)
    ? teamAvailData.data
    : Array.isArray(teamAvailData)
    ? teamAvailData
    : doctors;

  const mergedDoctorAvailability = { ...doctorAvailability };
  if (Array.isArray(resolvedDoctors)) {
    resolvedDoctors.forEach((doc: any) => {
      if (mergedDoctorAvailability[doc.id] === undefined) {
        mergedDoctorAvailability[doc.id] = doc.status === "ACTIVE" || doc.isActive === true;
      }
    });
  }

  return (
    <Modal
      title="Today's Appointments Schedule"
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
          <MetricCard
            label="Total Booked"
            value={bookedCount}
            icon={<Calendar className="w-5 h-5 text-primary" />}
            variant="primary"
          />
          <MetricCard
            label="Completed"
            value={completedCount}
            icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
            variant="emerald"
          />
          <MetricCard
            label="Pending Slots"
            value={pendingCount}
            icon={<Clock className="w-5 h-5 text-indigo-600" />}
            variant="indigo"
          />
        </div>

        <div className="h-px bg-border/50" />

        <DoctorAvailability
          doctors={resolvedDoctors}
          doctorAvailability={mergedDoctorAvailability}
          onToggle={onToggleDoctorAvailability}
        />

        <div className="h-px bg-border/50" />

        <AppointmentTimeline
          appointments={resolvedAppointments}
          doctors={resolvedDoctors}
          statusVariants={STATUS_VARIANTS}
        />
      </div>
    </Modal>
  );
}
