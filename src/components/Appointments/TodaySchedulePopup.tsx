import React from 'react';
import { X, Calendar, Clock, User, Phone, MapPin, CheckCircle, AlertCircle, UserCheck, UserX } from 'lucide-react';

interface TodaySchedulePopupProps {
  onClose: () => void;
  appointments: any[];
  doctors: any[];
  doctorAvailability: { [key: string]: boolean };
  onToggleDoctorAvailability: (doctorId: string) => void;
}

export function TodaySchedulePopup({ 
  onClose, 
  appointments, 
  doctors, 
  doctorAvailability, 
  onToggleDoctorAvailability 
}: TodaySchedulePopupProps) {
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.date === today);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Today's Schedule</h2>
              <p className="text-gray-600 mt-1">{new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Doctor Availability Section */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Doctor Availability Today</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map(doctor => (
                <div key={doctor.id} className="bg-white rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    </div>
                    <button
                      onClick={() => onToggleDoctorAvailability(doctor.id)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        doctorAvailability[doctor.id]
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      {doctorAvailability[doctor.id] ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className={`text-sm font-medium flex items-center ${
                    doctorAvailability[doctor.id] ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      doctorAvailability[doctor.id] ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    {doctorAvailability[doctor.id] ? 'Available' : 'Unavailable'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Today's Appointments</h3>
              <div className="text-sm text-gray-600">
                {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''} scheduled
              </div>
            </div>

            {todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.map(appointment => {
                  const doctor = doctors.find(d => d.id === appointment.doctorId);
                  
                  return (
                    <div key={appointment.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mr-4">
                            <Clock className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{appointment.time}</h4>
                            <p className="text-gray-600">{appointment.duration || 30} minutes</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1">{appointment.status.toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-3" />
                            <span className="font-medium text-gray-900">{appointment.patientName}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 mr-3" />
                            <span className="text-gray-600">{appointment.patientPhone}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                            <span className="text-gray-600">{appointment.type}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-3" />
                            <span className="text-gray-600">{doctor?.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600">Fee: ₹{appointment.fee?.toLocaleString()}</span>
                          </div>
                          {!doctorAvailability[appointment.doctorId] && (
                            <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded-lg border border-orange-200">
                              ⚠️ Doctor marked as unavailable
                            </div>
                          )}
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments today</h3>
                <p className="text-gray-600">Enjoy your free day or use this time for administrative tasks.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}