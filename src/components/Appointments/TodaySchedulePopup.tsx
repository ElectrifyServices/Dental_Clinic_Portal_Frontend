import React from 'react';
import {
  X, Calendar, Clock, User, Phone, MapPin,
  CheckCircle, AlertCircle, UserCheck, UserX,
  DollarSign, FileText, TrendingUp
} from 'lucide-react';

interface TodaySchedulePopupProps {
  onClose: () => void;
  appointments: any[];
  doctors: any[];
  doctorAvailability: { [key: string]: boolean };
  onToggleDoctorAvailability: (doctorId: string) => void;
}

export function TodaySchedulePopup({
  onClose,
  appointments = [],
  doctors = [],
  doctorAvailability = {},
  onToggleDoctorAvailability = () => {},
}: TodaySchedulePopupProps) {

  // ── original logic (untouched) ──────────────────────────────────────────
  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = formatDateLocal(new Date());

  const todayAppointments = appointments.filter(apt => apt.date === today);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':  return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
      case 'scheduled':  return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':  return 'bg-red-100 text-red-800 border-red-200';
      default:           return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':   return <CheckCircle className="w-3.5 h-3.5" />;
      case 'in-progress': return <Clock className="w-3.5 h-3.5" />;
      case 'cancelled':   return <AlertCircle className="w-3.5 h-3.5" />;
      default:            return <Calendar className="w-3.5 h-3.5" />;
    }
  };

  const isDoctorAvailableToday = (doctorId: string) =>
    todayAppointments.some(a => a.doctorId === doctorId);
  // ────────────────────────────────────────────────────────────────────────

  // derived counts for stat cards
  const completedCount = todayAppointments.filter(a => a.status === 'completed').length;
  const pendingCount   = todayAppointments.filter(
    a => a.status !== 'completed' && a.status !== 'cancelled'
  ).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl border border-gray-100 my-4">

        {/* ── Header ── */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 leading-tight">Today's schedule</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-gray-100">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Total today</p>
            <p className="text-2xl font-semibold text-blue-600">{todayAppointments.length}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Completed</p>
            <p className="text-2xl font-semibold text-green-700">{completedCount}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-semibold text-amber-700">{pendingCount}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* ── Doctor availability ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Doctor availability</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {doctors.map(doctor => {
                const available = isDoctorAvailableToday(doctor.id);
                return (
                  <div
                    key={doctor.id}
                    className={`bg-white rounded-xl border p-3.5 flex items-center justify-between gap-3 ${
                      available
                        ? 'border-l-2 border-l-green-500 border-t-gray-100 border-r-gray-100 border-b-gray-100'
                        : 'border-l-2 border-l-red-400 border-t-gray-100 border-r-gray-100 border-b-gray-100'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doctor.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{doctor.specialization}</p>
                      <div className={`flex items-center gap-1.5 mt-2 text-xs font-medium ${
                        available ? 'text-green-700' : 'text-red-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          available ? 'bg-green-500' : 'bg-red-400'
                        }`} />
                        {available ? 'Available today' : 'Unavailable'}
                      </div>
                    </div>
                    <button
                      onClick={() => onToggleDoctorAvailability(doctor.id)}
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${
                        available
                          ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                          : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {available
                        ? <UserCheck className="w-4 h-4" />
                        : <UserX className="w-4 h-4" />
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Appointments ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">Appointments</h3>
              </div>
              <span className="text-xs text-gray-500">
                {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''} scheduled
              </span>
            </div>

            {todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.map(appointment => {
                  const doctor = doctors.find(d => d.id === appointment.doctorId);

                  return (
                    <div
                      key={appointment.id}
                      className="bg-white border border-gray-100 rounded-xl p-4"
                    >
                      {/* card top row */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{appointment.time}</p>
                            <p className="text-xs text-gray-500">Est. Duration: {appointment.duration || 30} min</p>
                          </div>
                        </div>

                        <div className={`px-2.5 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span>{appointment.status.replace('-', ' ')}</span>
                        </div>
                      </div>

                      {/* detail grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <User className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="text-gray-900 font-medium">{appointment.patientName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <User className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="text-gray-700">{doctor?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="text-gray-700">{appointment.patientPhone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="text-gray-700 font-medium">
                            ₹{appointment.fee?.toLocaleString()}
                          </span>
                        </div>
<div className="flex items-center gap-2 text-xs text-gray-500 sm:col-span-2">
  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
  
  <span
    className={`px-2 py-1 rounded-full text-xs font-medium ${
      appointment.status === 'checked-in'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-gray-100 text-gray-600'
    }`}
  >
    {appointment.status === 'checked-in'
      ? (appointment.type || appointment.treatment || 'consultation')
      : 'Booked'}
  </span>
</div>
                      </div>

                      {/* doctor unavailable warning */}
                      {!doctorAvailability[appointment.doctorId] && (
                        <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          Doctor marked as unavailable
                        </div>
                      )}

                      {/* notes */}
                      {appointment.notes && (
                        <div className="mt-3 px-3 py-2 bg-gray-50 border-l-2 border-gray-300 rounded-r-lg text-xs text-gray-600">
                          {appointment.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-14 bg-gray-50 rounded-xl">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">No appointments today</p>
                <p className="text-xs text-gray-500">Enjoy your free day or use this time for administrative tasks.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// import React from 'react';
// import { X, Calendar, Clock, User, Phone, MapPin, CheckCircle, AlertCircle, UserCheck, UserX } from 'lucide-react';

// interface TodaySchedulePopupProps {
//   onClose: () => void;
//   appointments: any[];
//   doctors: any[];
//   doctorAvailability: { [key: string]: boolean };
//   onToggleDoctorAvailability: (doctorId: string) => void;
// }

// export function TodaySchedulePopup({ 
//   onClose, 
//   appointments, 
//   doctors, 
//   doctorAvailability, 
//   onToggleDoctorAvailability 
// }: TodaySchedulePopupProps) {
//  const formatDateLocal = (date: Date) => {
//   const year = date.getFullYear()
//   const month = String(date.getMonth() + 1).padStart(2, '0')
//   const day = String(date.getDate()).padStart(2, '0')
//   return `${year}-${month}-${day}`
// }

// const today = formatDateLocal(new Date())
//  const todayAppointments = appointments.filter(apt => {
//   return apt.date === today
// })

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'completed': return 'bg-green-100 text-green-800 border-green-200';
//       case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
//       case 'confirmed': case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//       case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
//       default: return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'completed': return <CheckCircle className="w-4 h-4" />;
//       case 'in-progress': return <Clock className="w-4 h-4" />;
//       case 'cancelled': return <AlertCircle className="w-4 h-4" />;
//       default: return <Calendar className="w-4 h-4" />;
//     }
//   };
//   const isDoctorAvailableToday = (doctorId: string) => {
//   return todayAppointments.some(a => a.doctorId === doctorId)
// }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl">
//         <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">Today's Schedule</h2>
//               <p className="text-gray-600 mt-1">{new Date().toLocaleDateString('en-IN', { 
//                 weekday: 'long', 
//                 year: 'numeric', 
//                 month: 'long', 
//                 day: 'numeric' 
//               })}</p>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* Doctor Availability Section */}
//           <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
//             <h3 className="text-lg font-bold text-blue-900 mb-4">Doctor Availability Today</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {doctors.map(doctor => (
//                 <div key={doctor.id} className="bg-white rounded-xl p-4 border border-blue-200">
//                   <div className="flex items-center justify-between mb-3">
//                     <div>
//                       <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
//                       <p className="text-sm text-gray-600">{doctor.specialization}</p>
//                     </div>
//                     <button
//                       onClick={() => onToggleDoctorAvailability(doctor.id)}
//                       className={`p-2 rounded-lg transition-all duration-200 ${
//                         isDoctorAvailableToday(doctor.id)
//                           ? 'bg-green-100 text-green-600 hover:bg-green-200'
//                           : 'bg-red-100 text-red-600 hover:bg-red-200'
//                       }`}
//                     >
//                       {isDoctorAvailableToday(doctor.id) ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
//                     </button>
//                   </div>
//                   <div className={`text-sm font-medium flex items-center ${
//                     isDoctorAvailableToday(doctor.id) ? 'text-green-600' : 'text-red-600'
//                   }`}>
//                     <div className={`w-2 h-2 rounded-full mr-2 ${
//                       isDoctorAvailableToday(doctor.id) ? 'bg-green-500' : 'bg-red-500'
//                     }`}></div>
//                     {isDoctorAvailableToday(doctor.id) ? 'Available' : 'Unavailable'}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Appointments Section */}
//           <div>
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-bold text-gray-900">Today's Appointments</h3>
//               <div className="text-sm text-gray-600">
//                 {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''} scheduled
//               </div>
//             </div>

//             {todayAppointments.length > 0 ? (
//               <div className="space-y-4">
//                 {todayAppointments.map(appointment => {
//                   const doctor = doctors.find(d => d.id === appointment.doctorId);
                  
//                   return (
//                     <div key={appointment.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
//                       <div className="flex items-center justify-between mb-4">
//                         <div className="flex items-center">
//                           <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mr-4">
//                             <Clock className="w-6 h-6 text-blue-600" />
//                           </div>
//                           <div>
//                             <h4 className="font-bold text-gray-900 text-lg">{appointment.time}</h4>
//                             <p className="text-gray-600">{appointment.duration || 30} minutes</p>
//                           </div>
//                         </div>
//                         <div className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center ${getStatusColor(appointment.status)}`}>
//                           {getStatusIcon(appointment.status)}
//                           <span className="ml-1">{appointment.status.toUpperCase()}</span>
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="space-y-3">
//                           <div className="flex items-center">
//                             <User className="w-4 h-4 text-gray-400 mr-3" />
//                             <span className="font-medium text-gray-900">{appointment.patientName}</span>
//                           </div>
//                           <div className="flex items-center">
//                             <Phone className="w-4 h-4 text-gray-400 mr-3" />
//                             <span className="text-gray-600">{appointment.patientPhone}</span>
//                           </div>
//                           <div className="flex items-center">
//                             <MapPin className="w-4 h-4 text-gray-400 mr-3" />
//                             <span className="text-gray-600">{appointment.type}</span>
//                           </div>
//                         </div>
//                         <div className="space-y-3">
//                           <div className="flex items-center">
//                             <User className="w-4 h-4 text-gray-400 mr-3" />
//                             <span className="text-gray-600">{doctor?.name}</span>
//                           </div>
//                           <div className="flex items-center">
//                             <span className="text-gray-600">Fee: ₹{appointment.fee?.toLocaleString()}</span>
//                           </div>
//                           {!doctorAvailability[appointment.doctorId] && (
//                             <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded-lg border border-orange-200">
//                               ⚠️ Doctor marked as unavailable
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       {appointment.notes && (
//                         <div className="mt-4 p-3 bg-gray-50 rounded-lg">
//                           <p className="text-sm text-gray-700">{appointment.notes}</p>
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="text-center py-12 bg-gray-50 rounded-2xl">
//                 <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                 <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments today</h3>
//                 <p className="text-gray-600">Enjoy your free day or use this time for administrative tasks.</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }