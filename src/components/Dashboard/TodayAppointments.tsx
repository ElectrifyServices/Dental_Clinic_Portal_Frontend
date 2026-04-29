import React from 'react';
import { Clock, User, Phone } from 'lucide-react';

interface AppointmentProps {
  time: string;
  patient: string;
  type: string;
  status: 'upcoming' | 'current' | 'completed';
  phone: string;
  duration?: string | number;
}

function AppointmentCard({ time, patient, type, status, phone, duration }: AppointmentProps) {
  const statusColors = {
    upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
    current: 'bg-green-50 text-green-700 border-green-200',
    completed: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  return (
    <div className={`p-4 rounded-lg border ${statusColors[status]} mb-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          <span className="font-medium">{time}</span>
          <span className="text-[10px] text-gray-500 ml-2">(Est. {duration || 15} mins)</span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-white/50 font-medium">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      <div className="mt-2">
        <div className="flex items-center mb-1">
          <User className="w-4 h-4 mr-2" />
          <span className="font-semibold">{patient}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">{type}</span>
          <div className="flex items-center text-sm">
            <Phone className="w-3 h-3 mr-1" />
            {phone}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TodayAppointmentsProps {
  appointments?: any[];
}

export function TodayAppointments({ appointments: propAppointments }: TodayAppointmentsProps) {
  const defaultAppointments = [
    { time: '09:00 AM', patient: 'Rajesh Kumar', type: 'Regular Checkup', status: 'completed' as const, phone: '+91 98765 43210' },
    { time: '10:30 AM', patient: 'Priya Sharma', type: 'Teeth Cleaning', status: 'current' as const, phone: '+91 87654 32109' },
    { time: '12:00 PM', patient: 'Amit Singh', type: 'Root Canal', status: 'upcoming' as const, phone: '+91 76543 21098' },
    { time: '02:30 PM', patient: 'Neha Gupta', type: 'Dental Filling', status: 'upcoming' as const, phone: '+91 65432 10987' },
    { time: '04:00 PM', patient: 'Suresh Patel', type: 'Crown Fitting', status: 'upcoming' as const, phone: '+91 54321 09876' },
  ];

  // Filter today's appointments from props or use default
  const todayAppointments = propAppointments 
    ? propAppointments.filter(apt => {
        const today = new Date().toISOString().split('T')[0];
        return apt.date === today;
      }).map(apt => ({
        time: apt.time,
        patient: apt.patientName,
        type: apt.type,
        status: apt.status || 'upcoming',
        phone: apt.patientPhone,
        duration: apt.duration
      }))
    : defaultAppointments;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Appointments</h3>
      <div className="max-h-96 overflow-y-auto">
        {todayAppointments.map((appointment, index) => (
          <AppointmentCard key={index} {...appointment} />
        ))}
        {todayAppointments.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No appointments scheduled for today</p>
          </div>
        )}
      </div>
      <button className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
        View All Appointments
      </button>
    </div>
  );
}