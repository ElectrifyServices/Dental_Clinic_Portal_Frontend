import React from 'react';
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Appointment {
  status: string;
}

interface AppointmentStatsProps {
  appointments: Appointment[];
}

import { MetricCard } from '@/components/ui';

export const AppointmentStats: React.FC<AppointmentStatsProps> = ({ appointments }) => {
  const total = appointments.length;
  const confirmed = appointments.filter(a => ['confirmed', 'scheduled', 'checked-in'].includes(a.status)).length;
  const completed = appointments.filter(a => a.status === 'completed').length;
  const cancelled = appointments.filter(a => ['cancelled', 'no-show'].includes(a.status)).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <MetricCard 
        label="Total Volume"
        value={total}
        icon={<Calendar className="w-6 h-6" />}
        variant="gray"
      />
      <MetricCard 
        label="Upcoming"
        value={confirmed}
        icon={<Clock className="w-6 h-6" />}
        variant="primary"
      />
      <MetricCard 
        label="Completed"
        value={completed}
        icon={<CheckCircle className="w-6 h-6" />}
        variant="emerald"
      />
      <MetricCard 
        label="Cancelled"
        value={cancelled}
        icon={<XCircle className="w-6 h-6" />}
        variant="rose"
      />
    </div>
  );
};
