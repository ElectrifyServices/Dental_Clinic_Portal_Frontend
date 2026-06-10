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
}

export const AppointmentStats: React.FC<AppointmentStatsProps> = () => {
  const { data: totalVolumeData, isPending: isTotalLoading } = useAppointmentTotalVolumeQuery();
  const { data: upcomingData, isPending: isUpcomingLoading } = useAppointmentUpcomingQuery();
  const { data: completedData, isPending: isCompletedLoading } = useAppointmentCompletedQuery();
  const { data: cancelledData, isPending: isCancelledLoading } = useAppointmentCancelledQuery();

  const parseData = (d: any) => {
    if (!d) return undefined;
    return d.count ?? d.total ?? d.data?.count ?? d.data?.total;
  };

  const total = parseData(totalVolumeData) ?? 0;
  const upcoming = parseData(upcomingData) ?? 0;
  const completed = parseData(completedData) ?? 0;
  const cancelled = parseData(cancelledData) ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
      <MetricCard
        label="Total"
        value={isTotalLoading ? "..." : total}
        icon={<Calendar className="w-4.5 h-4.5 md:w-6 md:h-6" />}
        variant="gray"
      />
      <MetricCard
        label="Upcoming"
        value={isUpcomingLoading ? "..." : upcoming}
        icon={<Clock className="w-4.5 h-4.5 md:w-6 md:h-6" />}
        variant="primary"
      />
      <MetricCard
        label="Completed"
        value={isCompletedLoading ? "..." : completed}
        icon={<CheckCircle className="w-4.5 h-4.5 md:w-6 md:h-6" />}
        variant="emerald"
      />
      <MetricCard
        label="Cancelled"
        value={isCancelledLoading ? "..." : cancelled}
        icon={<XCircle className="w-4.5 h-4.5 md:w-6 md:h-6" />}
        variant="rose"
      />
    </div>
  );
};

