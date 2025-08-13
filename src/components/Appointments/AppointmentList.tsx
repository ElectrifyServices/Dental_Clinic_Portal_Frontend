import React, { useState } from 'react';
import { Clock, User, Phone, MapPin, MoreVertical, Edit, Trash2, UserCheck, UserX, CheckCircle } from 'lucide-react';

interface Appointment {
  id: string;
  time: string;
  patient: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  phone: string;
  duration: string;
}

const appointments: Appointment[] = [
  { id: '1', time: '09:00 AM', patient: 'Rajesh Kumar', type: 'Regular Checkup', status: 'completed', phone: '+91 98765 43210', duration: '30 min' },
  { id: '2', time: '10:30 AM', patient: 'Priya Sharma', type: 'Teeth Cleaning', status: 'in-progress', phone: '+91 87654 32109', duration: '45 min' },
  { id: '3', time: '12:00 PM', patient: 'Amit Singh', type: 'Root Canal', status: 'confirmed', phone: '+91 76543 21098', duration: '60 min' },
  { id: '4', time: '02:30 PM', patient: 'Neha Gupta', type: 'Dental Filling', status: 'scheduled', phone: '+91 65432 10987', duration: '45 min' },
  { id: '5', time: '04:00 PM', patient: 'Suresh Patel', type: 'Crown Fitting', status: 'scheduled', phone: '+91 54321 09876', duration: '90 min' },
];

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div id="appointment-pagination" className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
      <div id="appointment-pagination-info" className="text-sm text-gray-700 mb-4 sm:mb-0">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>
      
      <div id="appointment-pagination-controls" className="flex items-center space-x-2">
        <button
          id="appointment-pagination-prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            id={`appointment-page-${page}`}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              page === currentPage
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          id="appointment-pagination-next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

interface AppointmentListProps {
  appointments?: any[];
  onEditAppointment?: (appointmentId: string) => void;
  onDeleteAppointment?: (appointmentId: string) => void;
  onUpdateStatus?: (appointmentId: string, status: string) => void;
  onCheckInPatient?: (appointment: any) => void;
}

export function AppointmentList({ 
  appointments: propAppointments, 
  onEditAppointment,
  onDeleteAppointment,
  onUpdateStatus,
  onCheckInPatient
}: AppointmentListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Use prop appointments if provided, otherwise use mock data
  const displayAppointments = propAppointments && propAppointments.length > 0 
    ? [...propAppointments].sort((a, b) => {
        // Sort by date first, then by time
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      })
    : [...appointments].sort((a, b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });
  
  // Pagination logic
  const totalItems = displayAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = displayAppointments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'checked-in': return 'bg-purple-100 text-purple-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartAppointment = (appointmentId: string) => {
    onUpdateStatus?.(appointmentId, 'in-progress');
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    onUpdateStatus?.(appointmentId, 'completed');
  };

  const handleMarkNoShow = (appointmentId: string) => {
    onUpdateStatus?.(appointmentId, 'no-show');
  };

  const handleEditAppointment = (appointmentId: string) => {
    onEditAppointment?.(appointmentId);
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      onDeleteAppointment?.(appointmentId);
    }
  };

  return (
    <div id="appointment-list-container" className="bg-white rounded-lg border border-gray-200">
      <div id="appointment-list-header" className="p-6 border-b border-gray-200">
        <h3 id="appointment-list-title" className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
        <p className="text-sm text-gray-500 mt-1">January 15, 2024</p>
      </div>
      
      <div id="appointment-list-body" className="divide-y divide-gray-200">
        {paginatedAppointments.map((appointment) => (
          <div key={appointment.id} id={`appointment-item-${appointment.id}`} className="p-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div id={`appointment-time-${appointment.id}`} className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{appointment.time}</div>
                  <div className="text-sm text-gray-500">{appointment.duration || '30 min'}</div>
                </div>
                
                <div id={`appointment-details-${appointment.id}`} className="flex-1">
                  <div className="flex items-center mb-2">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <h4 className="font-semibold text-gray-900">{appointment.patient || appointment.patientName}</h4>
                    <span id={`appointment-status-${appointment.id}`} className={`ml-3 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {appointment.treatment || appointment.type}
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {appointment.phone || appointment.patientPhone}
                    </div>
                  </div>
                </div>
              </div>
              
              <div id={`appointment-actions-${appointment.id}`} className="flex items-center space-x-2">
                {appointment.status === 'scheduled' && (
                    <button 
                      id={`checkin-btn-${appointment.id}`}
                      onClick={() => onCheckInPatient?.(appointment)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Check In
                    </button>
                )}
                {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                  <button 
                    id={`noshow-btn-${appointment.id}`}
                    onClick={() => handleMarkNoShow(appointment.id)}
                    className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 flex items-center"
                  >
                    <UserX className="w-4 h-4 mr-1" />
                    No Show
                  </button>
                )}
                
                {/* Action Menu */}
                <div id={`appointment-menu-${appointment.id}`} className="relative group">
                  <button id={`appointment-menu-btn-${appointment.id}`} className="p-2 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <div id={`appointment-menu-dropdown-${appointment.id}`} className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <button
                      id={`edit-appointment-${appointment.id}`}
                      onClick={() => handleEditAppointment(appointment.id)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-3" />
                      Edit Appointment
                    </button>
                    <button
                      id={`delete-appointment-${appointment.id}`}
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-3" />
                      Delete Appointment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {paginatedAppointments.length === 0 && (
          <div id="appointment-empty-state" className="p-6 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No appointments scheduled</p>
          </div>
        )}
      </div>
      
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
}