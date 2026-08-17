import React from 'react';
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { MetricCard } from '@/components/ui';
import {
  useAppointmentTotalVolumeQuery,
  useAppointmentUpcomingQuery,
  useAppointmentCompletedQuery,
  useAppointmentCancelledQuery,
} from '@/hooks/appointments/useAppointmentStatsQueries';

interface Appointment {
  status: string;
}

interface AppointmentStatsProps {
  appointments?: Appointment[];
  startDate?: string;
  endDate?: string;
  doctorId?: string | null;
}

export const AppointmentStats: React.FC<AppointmentStatsProps> = ({ appointments = [], startDate, endDate, doctorId }) => {
  const { data: totalVolumeData, isPending: isTotalLoading } = useAppointmentTotalVolumeQuery(startDate, endDate, doctorId);
  const { data: upcomingData, isPending: isUpcomingLoading } = useAppointmentUpcomingQuery(startDate, endDate, doctorId);
  const { data: completedData, isPending: isCompletedLoading } = useAppointmentCompletedQuery(startDate, endDate, doctorId);
  const { data: cancelledData, isPending: isCancelledLoading } = useAppointmentCancelledQuery(startDate, endDate, doctorId);

  const parseData = (d: any) => {
    if (!d) return undefined;
    return d.count ?? d.total ?? d.data?.count ?? d.data?.total;
  };

  const total = parseData(totalVolumeData) ?? 0;
  const upcoming = parseData(upcomingData) ?? 0;
  const completed = parseData(completedData) ?? 0;
  const cancelled = parseData(cancelledData) ?? 0;

  const doctorAppointments = doctorId
    ? appointments.filter((appointment: any) => {
        const appointmentDoctorId = appointment.doctorId || appointment.doctor_id || appointment.doctor?.id;
        if (String(appointmentDoctorId) !== String(doctorId)) return false;

        const appointmentDate = String(appointment.date || "").split("T")[0];
        if (startDate && appointmentDate < startDate) return false;
        if (endDate && appointmentDate > endDate) return false;
        return true;
      })
    : null;

  const selectedTotal = doctorAppointments?.length ?? total;
  const selectedUpcoming = doctorAppointments
    ? doctorAppointments.filter((appointment: any) =>
        !["completed", "cancelled", "no-show"].includes(
          String(appointment.status || "").toLowerCase(),
        ),
      ).length
    : upcoming;
  const selectedCompleted = doctorAppointments
    ? doctorAppointments.filter((appointment: any) =>
        String(appointment.status || "").toLowerCase() === "completed",
      ).length
    : completed;
  const selectedCancelled = doctorAppointments
    ? doctorAppointments.filter((appointment: any) =>
        String(appointment.status || "").toLowerCase() === "cancelled",
      ).length
    : cancelled;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
      <MetricCard
        label="Total"
        value={doctorId ? selectedTotal : isTotalLoading ? "..." : total}
        icon={<Calendar className="w-4.5 h-4.5 md:w-6 md:h-6" />}
        variant="gray"
      />
      <MetricCard
        label="Upcoming"
        value={doctorId ? selectedUpcoming : isUpcomingLoading ? "..." : upcoming}
        icon={<Clock className="w-4.5 h-4.5 md:w-6 md:h-6" />}
        variant="primary"
      />
      <MetricCard
        label="Completed"
        value={doctorId ? selectedCompleted : isCompletedLoading ? "..." : completed}
        icon={<CheckCircle className="w-4.5 h-4.5 md:w-6 md:h-6" />}
        variant="emerald"
      />
      <MetricCard
        label="Cancelled"
        value={doctorId ? selectedCancelled : isCancelledLoading ? "..." : cancelled}
        icon={<XCircle className="w-4.5 h-4.5 md:w-6 md:h-6" />}
        variant="rose"
      />
    </div>
  );
};

