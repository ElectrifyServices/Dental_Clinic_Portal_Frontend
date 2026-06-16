import React, { useEffect } from "react";
import { Layout, Calendar, CheckCircle, Clock, Hourglass } from "lucide-react";
import { Modal } from "@/components/ui";
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
    : Array.isArray(timelineData?.data?.data)
    ? timelineData.data.data
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
          {/* Total Booked Card */}
          <div className="flex items-center justify-between p-5 bg-blue-50/20 border border-blue-100/60 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50/80 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Total Booked
                </p>
                <p className="text-3xl font-extrabold text-slate-900 mt-2 leading-none">
                  {bookedCount}
                </p>
                <p className="text-[10px] font-semibold text-muted-foreground/80 mt-1.5 leading-none">
                  Appointments
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <svg className="w-24 h-10 text-blue-500" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5,32 C20,12 35,28 50,15 C65,2 80,22 95,8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="95" cy="8" r="3" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* Completed Card */}
          <div className="flex items-center justify-between p-5 bg-emerald-50/20 border border-emerald-100/60 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200/60 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50/80 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Completed
                </p>
                <p className="text-3xl font-extrabold text-slate-900 mt-2 leading-none">
                  {completedCount}
                </p>
                <p className="text-[10px] font-semibold text-muted-foreground/80 mt-1.5 leading-none">
                  Appointments
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <svg className="w-24 h-10 text-emerald-500" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5,35 C20,25 35,30 50,18 C65,6 80,20 95,12" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="95" cy="12" r="3" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* Pending Slots Card */}
          <div className="flex items-center justify-between p-5 bg-purple-50/20 border border-purple-100/60 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-200/60 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50/80 text-purple-600 flex items-center justify-center flex-shrink-0">
                <Hourglass className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Pending Slots
                </p>
                <p className="text-3xl font-extrabold text-slate-900 mt-2 leading-none">
                  {pendingCount}
                </p>
                <p className="text-[10px] font-semibold text-muted-foreground/80 mt-1.5 leading-none">
                  Available Slots
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <svg className="w-24 h-10 text-purple-500" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5,30 C20,15 35,22 50,12 C65,2 80,18 95,10" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="95" cy="10" r="3" fill="currentColor" />
              </svg>
            </div>
          </div>
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
