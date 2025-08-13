import React from 'react';
import { User, Calendar, Phone } from 'lucide-react';

interface PatientProps {
  name: string;
  lastVisit: string;
  nextAppointment?: string;
  phone: string;
  status: 'active' | 'new' | 'overdue';
}

function PatientCard({ name, lastVisit, nextAppointment, phone, status }: PatientProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    new: 'bg-blue-100 text-blue-800',
    overdue: 'bg-red-100 text-red-800'
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div className="ml-3">
            <h4 className="font-semibold text-gray-900">{name}</h4>
            <div className="flex items-center text-sm text-gray-500">
              <Phone className="w-3 h-3 mr-1" />
              {phone}
            </div>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex items-center text-gray-600">
          <Calendar className="w-3 h-3 mr-2" />
          Last visit: {lastVisit}
        </div>
        {nextAppointment && (
          <div className="flex items-center text-gray-600">
            <Calendar className="w-3 h-3 mr-2" />
            Next: {nextAppointment}
          </div>
        )}
      </div>
    </div>
  );
}

export function RecentPatients() {
  const patients = [
    { name: 'Rajesh Kumar', lastVisit: '2 days ago', nextAppointment: 'Tomorrow 10:00 AM', phone: '+91 98765 43210', status: 'active' as const },
    { name: 'Priya Sharma', lastVisit: 'Today', phone: '+91 87654 32109', status: 'new' as const },
    { name: 'Amit Singh', lastVisit: '1 week ago', nextAppointment: 'Next Monday', phone: '+91 76543 21098', status: 'active' as const },
    { name: 'Neha Gupta', lastVisit: '2 months ago', phone: '+91 65432 10987', status: 'overdue' as const },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Patients</h3>
      <div className="space-y-4">
        {patients.map((patient, index) => (
          <PatientCard key={index} {...patient} />
        ))}
      </div>
      <button className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
        View All Patients
      </button>
    </div>
  );
}