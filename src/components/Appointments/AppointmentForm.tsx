import React, { useState } from 'react';
import {
  X, Save, Calendar, Clock, User, Phone, FileText,
  IndianRupee, Stethoscope, MessageSquare
} from 'lucide-react';
import { Appointment } from '../../types';

interface AppointmentFormProps {
  onClose: () => void;
  onSave: (appointment: Partial<Appointment>) => void;
  appointment?: Appointment;
  isQuickBooking?: boolean;
  doctors?: any[];
  doctorAvailability?: { [key: string]: boolean };
  appointments?: any[];
  selectedDate?: Date | null;
}

export function AppointmentForm({
  onClose,
  onSave,
  appointment,
  isQuickBooking = false,
  doctors = [],
  doctorAvailability = {},
  appointments = [],
  selectedDate,
}: AppointmentFormProps) {

  // ── original logic (untouched) ────────────────────────────────────────────
  const formatDateLocal = (date: Date) => {
    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day   = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const safeDate = selectedDate ? new Date(selectedDate) : new Date();

  const [formData, setFormData] = useState({
    patientName:    appointment?.patientName    || '',
    patientPhone:   appointment?.patientPhone   || '',
    treatment:      appointment?.treatment      || '',
    doctorId:       appointment?.doctorId       || '1',
    doctorName:     appointment?.doctorName     || 'Dr. Sharma',
    date:           appointment?.date           || formatDateLocal(safeDate),
    time:           appointment?.time           || '09:00',
    duration:       appointment?.duration       || 30,
    type:           appointment?.type           || 'consultation',
    notes:          appointment?.notes          || '',
    fee:            appointment?.fee            || 500,
    patientConcern: appointment?.patientConcern || '',
    treatmentType:  appointment?.treatmentType  || '',
  });

  const getBookedSlots = () =>
    (appointments || [])
      .filter(a => a.doctorId === formData.doctorId && a.date === formData.date)
      .map(a => a.time);

  const isPastTime = (time: string, date: string) => {
    const now      = new Date();
    const selected = new Date(date + 'T' + time);
    return selected < now;
  };

  const bookedSlots = getBookedSlots();

  const appointmentTypes = [
    { value: 'consultation',  label: 'General Consultation',     fee: 500   },
    { value: 'cleaning',      label: 'Teeth Cleaning & Scaling', fee: 1500  },
    { value: 'filling',       label: 'Dental Filling',           fee: 2000  },
    { value: 'extraction',    label: 'Tooth Extraction',         fee: 1000  },
    { value: 'root-canal',    label: 'Root Canal Treatment',     fee: 5000  },
    { value: 'crown',         label: 'Crown Fitting',            fee: 8000  },
    { value: 'orthodontics',  label: 'Orthodontic Treatment',    fee: 3000  },
    { value: 'surgery',       label: 'Oral Surgery',             fee: 10000 },
    { value: 'emergency',     label: 'Emergency Treatment',      fee: 1500  },
    { value: 'other',         label: 'Other Treatment',          fee: 500   },
  ];

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 18 && minute > 0) break;
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm   = hour >= 12 ? 'PM' : 'AM';
        const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
        slots.push({ time24, time12 });
      }
    }
    return slots;
  };

  const getAvailableTimeSlots = () => {
    const selDoctor = doctors.find(d => d.id === formData.doctorId);
    if (!selDoctor || !formData.date) return [];

    const selDate    = new Date(formData.date);
    const dayName    = selDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = selDoctor.workingHours[dayName];

    if (!daySchedule || !daySchedule.isWorking || !doctorAvailability[formData.doctorId]) return [];

    const allSlots  = generateTimeSlots();
    const startHour = parseInt(daySchedule.startTime.split(':')[0]);
    const endHour   = parseInt(daySchedule.endTime.split(':')[0]);
    const endMinute = parseInt(daySchedule.endTime.split(':')[1]);

    return allSlots.filter(slot => {
      const slotHour   = parseInt(slot.time24.split(':')[0]);
      const slotMinute = parseInt(slot.time24.split(':')[1]);

      if (slotHour < startHour) return false;
      if (slotHour > endHour)   return false;
      if (slotHour === endHour && slotMinute > endMinute) return false;

      if (daySchedule.breakStart && daySchedule.breakEnd) {
        const bsH = parseInt(daySchedule.breakStart.split(':')[0]);
        const bsM = parseInt(daySchedule.breakStart.split(':')[1]);
        const beH = parseInt(daySchedule.breakEnd.split(':')[0]);
        const beM = parseInt(daySchedule.breakEnd.split(':')[1]);
        if (
          (slotHour > bsH || (slotHour === bsH && slotMinute >= bsM)) &&
          (slotHour < beH || (slotHour === beH && slotMinute < beM))
        ) return false;
      }
      return true;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const conflict = (appointments || []).find(
      a => a.doctorId === formData.doctorId && a.date === formData.date && a.time === formData.time &&  a.id !== appointment?.id
    );
    if (conflict) { alert('❌ This slot is already booked'); return; }
    onSave({
      ...formData,
      id:           appointment?.id           || Date.now().toString(),
      patientId:    appointment?.patientId    || Date.now().toString(),
      status:       appointment?.status       || 'scheduled',
      reminderSent: false,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'treatmentType') {
        const selType = appointmentTypes.find(t => t.value === value);
        if (selType) updated.fee = selType.fee;
      }
      if (name === 'doctorId') {
        const selDoctor = doctors.find(d => d.id === value);
        if (selDoctor) {
          updated.doctorName = selDoctor.name;
          if (!updated.treatmentType) updated.fee = selDoctor.consultationFee || 500;
        }
      }
      if (name === 'doctorId' || name === 'date') updated.time = '';
      return updated;
    });
  };

  const availableTimeSlots = getAvailableTimeSlots();
  const selectedDoctor     = doctors.find(d => d.id === formData.doctorId);
  // ─────────────────────────────────────────────────────────────────────────

  const title    = isQuickBooking ? 'Quick appointment' : appointment ? 'Edit appointment' : 'New appointment';
  const subtitle = isQuickBooking ? 'Book an appointment instantly' : 'Schedule a new patient appointment';

  const inputCls =
    'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 ' +
    'focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none ' +
    'transition-all placeholder-gray-400 text-gray-900';

  const labelCls = 'flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide';

  const SectionDivider = ({ title }: { title: string }) => (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">
        {title}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-gray-100 my-4">

        {/* ── Header ── */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 leading-tight">{title}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* ── Patient info ── */}
          <SectionDivider title="Patient info" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                <User className="w-3.5 h-3.5" /> Patient name <span className="text-red-400 normal-case">*</span>
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                className={inputCls}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className={labelCls}>
                <Phone className="w-3.5 h-3.5" /> Phone number <span className="text-red-400 normal-case">*</span>
              </label>
              <input
                type="tel"
                name="patientPhone"
                value={formData.patientPhone}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, '');
                  setFormData(prev => ({ ...prev, patientPhone: value }));
                }}
                required
                className={inputCls}
                placeholder="98765 43210"
              />
            </div>
          </div>

          {/* ── Schedule ── */}
          <SectionDivider title="Schedule" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                <Calendar className="w-3.5 h-3.5" /> Date <span className="text-red-400 normal-case">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                min={formatDateLocal(new Date())}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                <User className="w-3.5 h-3.5" /> Assigned doctor <span className="text-red-400 normal-case">*</span>
              </label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
                className={inputCls}
              >
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} — {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Treatment ── */}
          <SectionDivider title="Treatment" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                <Stethoscope className="w-3.5 h-3.5" /> Treatment <span className="text-red-400 normal-case">*</span>
              </label>
              <input
                type="text"
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                required
                className={inputCls}
                placeholder="Treatment description"
              />
            </div>
            <div>
              <label className={labelCls}>
                <Stethoscope className="w-3.5 h-3.5" /> Treatment type <span className="text-red-400 normal-case">*</span>
              </label>
              <select
                name="treatmentType"
                value={formData.treatmentType}
                onChange={handleChange}
                required
                className={inputCls}
              >
                <option value="">Select type</option>
                {appointmentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} — ₹{type.fee.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                <IndianRupee className="w-3.5 h-3.5" /> Consultation fee
              </label>
              <input
                type="number"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                className={inputCls}
                placeholder="500"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>
              <MessageSquare className="w-3.5 h-3.5" /> Patient concern <span className="text-red-400 normal-case">*</span>
            </label>
            <textarea
              name="patientConcern"
              value={formData.patientConcern}
              onChange={handleChange}
              required
              rows={3}
              className={inputCls + ' resize-none'}
              placeholder="Describe the patient's main concern or symptoms..."
            />
          </div>

          {/* ── Time slots ── */}
          <SectionDivider title="Available time slots" />

          {/* Legend */}
          <div className="flex items-center gap-5 -mt-1">
            {[
              { dot: 'bg-green-500', label: 'Available'   },
              { dot: 'bg-blue-600',  label: 'Selected'    },
              { dot: 'bg-gray-300',  label: 'Unavailable' },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={`w-2 h-2 rounded-full ${l.dot}`} />
                {l.label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 max-h-52 overflow-y-auto p-3 border border-gray-200 rounded-xl bg-gray-50/60">
            {availableTimeSlots.map(slot => {
              const isBooked   = bookedSlots.includes(slot.time24);
              const isPast     = isPastTime(slot.time24, formData.date);
              const isSelected = formData.time === slot.time24;

              return (
                <button
                  key={slot.time24}
                  type="button"
                  onClick={() =>
                    !isBooked && !isPast &&
                    setFormData(prev => ({ ...prev, time: slot.time24 }))
                  }
                  disabled={isBooked || isPast}
                  className={`py-2 px-1 text-xs font-medium rounded-lg border transition-all text-center leading-tight ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : isBooked || isPast
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {slot.time12}
                  {isBooked && <div className="text-[10px] mt-0.5 opacity-70">Booked</div>}
                </button>
              );
            })}
          </div>

          {/* No slots */}
          {formData.date && formData.doctorId && availableTimeSlots.length === 0 && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 -mt-1">
              <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/>
              </svg>
              {!doctorAvailability[formData.doctorId]
                ? `${selectedDoctor?.name} is not available on ${new Date(formData.date).toLocaleDateString()}`
                : `No available slots for ${selectedDoctor?.name} on ${new Date(formData.date).toLocaleDateString()}`
              }
            </div>
          )}

          {/* Doctor info */}
          {selectedDoctor && doctorAvailability[formData.doctorId] && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 -mt-1">
              <span><span className="font-medium">{selectedDoctor.name}</span> · {selectedDoctor.specialization}</span>
              <span>Base fee: <span className="font-medium">₹{selectedDoctor.consultationFee?.toLocaleString() || '500'}</span></span>
              <span>15-min slots</span>
            </div>
          )}

          {/* Doctor unavailable */}
          {!doctorAvailability[formData.doctorId] && formData.doctorId && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 -mt-1">
              <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              This doctor is marked as unavailable. Please contact reception to confirm availability.
            </div>
          )}

          {/* ── Notes ── */}
          <SectionDivider title="Notes" />
          <div>
            <label className={labelCls}>
              <FileText className="w-3.5 h-3.5" /> Additional notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className={inputCls + ' resize-none'}
              placeholder="Special requirements or instructions..."
            />
          </div>

          {/* ── Footer ── */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              {isQuickBooking ? 'Book now' : 'Save appointment'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}


// import React, { useState } from 'react';
// import { X, Save, Calendar, Clock, User, Phone, FileText, IndianRupee, Stethoscope, MessageSquare } from 'lucide-react';
// import { Appointment } from '../../types';

// interface AppointmentFormProps {
//   onClose: () => void;
//   onSave: (appointment: Partial<Appointment>) => void;
//   appointment?: Appointment;
//   isQuickBooking?: boolean;
//   doctors?: any[];
//   doctorAvailability?: { [key: string]: boolean };
//    appointments?: any[] ;
//    selectedDate?: Date | null
// }

// export function AppointmentForm({ 
//   onClose, 
//   onSave, 
//   appointment, 
//   isQuickBooking = false, 
//   doctors = [], 
//   doctorAvailability = {},
//   appointments = [] ,
//    selectedDate
// }: AppointmentFormProps) {
//   const formatDateLocal = (date: Date) => {
//   const year = date.getFullYear()
//   const month = String(date.getMonth() + 1).padStart(2, '0')
//   const day = String(date.getDate()).padStart(2, '0')
//   return `${year}-${month}-${day}`
// }

// const safeDate = selectedDate ? new Date(selectedDate) : new Date()
// const [formData, setFormData] = useState({
//   patientName: appointment?.patientName || '',
//   patientPhone: appointment?.patientPhone || '',
//   treatment: appointment?.treatment || '',
//   doctorId: appointment?.doctorId || '1',
//   doctorName: appointment?.doctorName || 'Dr. Sharma',

//  date: appointment?.date || formatDateLocal(safeDate),

//   time: appointment?.time || '09:00',
//   duration: appointment?.duration || 30,
//   type: appointment?.type || 'consultation',
//   notes: appointment?.notes || '',
//   fee: appointment?.fee || 500,
//   patientConcern: appointment?.patientConcern || '',
//   treatmentType: appointment?.treatmentType || '',
// });
// const getBookedSlots = () => {
//   return (appointments || [])
//     .filter(a =>
//       a.doctorId === formData.doctorId &&
//       a.date === formData.date
//     )
//     .map(a => a.time)
// }
// const isPastTime = (time: string, date: string) => {
//   const now = new Date()
//   const selected = new Date(date + "T" + time)

//   return selected < now
// }
// const bookedSlots = getBookedSlots()
//   // const [bookedSlots, setBookedSlots] = useState<string[]>([
//   //   '09:00', '10:30', '14:00', '16:30' // Mock booked slots
//   // ]);

//   const appointmentTypes = [
//     { value: 'consultation', label: 'General Consultation', fee: 500 },
//     { value: 'cleaning', label: 'Teeth Cleaning & Scaling', fee: 1500 },
//     { value: 'filling', label: 'Dental Filling', fee: 2000 },
//     { value: 'extraction', label: 'Tooth Extraction', fee: 1000 },
//     { value: 'root-canal', label: 'Root Canal Treatment', fee: 5000 },
//     { value: 'crown', label: 'Crown Fitting', fee: 8000 },
//     { value: 'orthodontics', label: 'Orthodontic Treatment', fee: 3000 },
//     { value: 'surgery', label: 'Oral Surgery', fee: 10000 },
//     { value: 'emergency', label: 'Emergency Treatment', fee: 1500 },
//     { value: 'other', label: 'Other Treatment', fee: 500 },
//   ];

//   // Generate 15-minute interval time slots in AM/PM format
//   const generateTimeSlots = () => {
//     const slots = [];
//     for (let hour = 9; hour <= 18; hour++) {
//       for (let minute = 0; minute < 60; minute += 15) {
//         if (hour === 18 && minute > 0) break; // Stop at 6:00 PM
        
//         const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
//         const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
//         const ampm = hour >= 12 ? 'PM' : 'AM';
//         const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
        
//         slots.push({ time24, time12 });
//       }
//     }
//     return slots;
//   };

//   const getAvailableTimeSlots = () => {
//     const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
//     if (!selectedDoctor || !formData.date) return [];

//     const selectedDate = new Date(formData.date);
//     const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
//     const daySchedule = selectedDoctor.workingHours[dayName];

//     if (!daySchedule || !daySchedule.isWorking || !doctorAvailability[formData.doctorId]) return [];

//     // Get all possible time slots and filter based on doctor's schedule
//     const allSlots = generateTimeSlots();
//     const startHour = parseInt(daySchedule.startTime.split(':')[0]);
//     const endHour = parseInt(daySchedule.endTime.split(':')[0]);
//     const endMinute = parseInt(daySchedule.endTime.split(':')[1]);
    
//     return allSlots.filter(slot => {
//       const slotHour = parseInt(slot.time24.split(':')[0]);
//       const slotMinute = parseInt(slot.time24.split(':')[1]);
      
//       // Check if slot is within working hours
//       if (slotHour < startHour) return false;
//       if (slotHour > endHour) return false;
//       if (slotHour === endHour && slotMinute > endMinute) return false;
      
//       // Skip break time if defined
//       if (daySchedule.breakStart && daySchedule.breakEnd) {
//         const breakStartHour = parseInt(daySchedule.breakStart.split(':')[0]);
//         const breakStartMinute = parseInt(daySchedule.breakStart.split(':')[1]);
//         const breakEndHour = parseInt(daySchedule.breakEnd.split(':')[0]);
//         const breakEndMinute = parseInt(daySchedule.breakEnd.split(':')[1]);
        
//         if (slotHour > breakStartHour || (slotHour === breakStartHour && slotMinute >= breakStartMinute)) {
//           if (slotHour < breakEndHour || (slotHour === breakEndHour && slotMinute < breakEndMinute)) {
//             return false;
//           }
//         }
//       }
      
//       return true;
//     });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const conflict = (appointments || []).find(a =>
//   a.doctorId === formData.doctorId &&
//   a.date === formData.date &&
//   a.time === formData.time
  
// )
// const today = new Date()
// const selected = new Date(formData.date)

// today.setHours(0,0,0,0)
// selected.setHours(0,0,0,0)
// if (conflict) {
//   alert("❌ This slot is already booked")
//   return
// }
//     onSave({
//       ...formData,
//       id: appointment?.id || Date.now().toString(),
//       patientId: appointment?.patientId || Date.now().toString(),
//       status: appointment?.status || 'scheduled',
//       reminderSent: false,
//     });
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => {
//       const updated = { ...prev, [name]: value };
      
//       // Auto-update fee when appointment type changes
//       if (name === 'treatmentType') {
//         const selectedType = appointmentTypes.find(type => type.value === value);
//         if (selectedType) {
//           updated.fee = selectedType.fee;
//         }
//       }
      
//       // Auto-update fee when doctor changes
//       if (name === 'doctorId') {
//         const selectedDoctor = doctors.find(d => d.id === value);
//         if (selectedDoctor) {
//           updated.doctorName = selectedDoctor.name;
//           // Keep existing fee if treatment type is selected, otherwise use doctor's consultation fee
//           if (!updated.treatmentType) {
//             updated.fee = selectedDoctor.consultationFee || 500;
//           }
//         }
//       }
      
//       // Reset time when doctor or date changes
//       if (name === 'doctorId' || name === 'date') {
//         updated.time = '';
//       }
      
//       return updated;
//     });
//   };

//   const availableTimeSlots = getAvailableTimeSlots();
//   const selectedDoctor = doctors.find(d => d.id === formData.doctorId);

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto shadow-2xl">
//         <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">
//                 {isQuickBooking ? 'Quick Appointment' : appointment ? 'Edit Appointment' : 'New Appointment'}
//               </h2>
//               <p className="text-gray-600 mt-1">
//                 {isQuickBooking ? 'Book an appointment instantly' : 'Schedule a new patient appointment'}
//               </p>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 <User className="w-4 h-4 inline mr-2" />
//                 Patient Name *
//               </label>
//               <input
//                 type="text"
//                 name="patientName"
//                 value={formData.patientName}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                 placeholder="Enter patient's full name"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 <Phone className="w-4 h-4 inline mr-2" />
//                 Phone Number *
//               </label>
//               <input
//                 type="tel"
//                 name="patientPhone"
//                 value={formData.patientPhone}
//                   onChange={(e) => {
//     const value = e.target.value.replace(/\D/g, '') // 🔥 only numbers
//     setFormData(prev => ({ ...prev, patientPhone: value }))
//   }}
//                 required
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                 placeholder="+91 98765 43210"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 <Calendar className="w-4 h-4 inline mr-2" />
//                 Date *
//               </label>
//               <input
//                 type="date"
//                 name="date"
//                 value={formData.date}
//                 onChange={handleChange}
//                 required
//                 // min={new Date().toISOString().split('T')[0]}
//                 min={formatDateLocal(new Date())}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Assigned Doctor *
//               </label>
//               <select
//                 name="doctorId"
//                 value={formData.doctorId}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//               >
//                 {doctors.map(doctor => (
//                   <option key={doctor.id} value={doctor.id}>
//                     {doctor.name} - {doctor.specialization}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 <Stethoscope className="w-4 h-4 inline mr-2" />
//                 Treatment *
//               </label>
//               <input
//                 type="text"
//                 name="treatment"
//                 value={formData.treatment}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                 placeholder="Enter treatment description"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 <Stethoscope className="w-4 h-4 inline mr-2" />
//                 Treatment Type *
//               </label>
//               <select
//                 name="treatmentType"
//                 value={formData.treatmentType}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//               >
//                 <option value="">Select Treatment Type</option>
//                 {appointmentTypes.map(type => (
//                   <option key={type.value} value={type.value}>
//                     {type.label} - ₹{type.fee.toLocaleString()}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 <IndianRupee className="w-4 h-4 inline mr-2" />
//                 Consultation Fee
//               </label>
//               <input
//                 type="number"
//                 name="fee"
//                 value={formData.fee}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                 placeholder="Enter fee amount"
//               />
//             </div>

//             <div className="md:col-span-2">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 <MessageSquare className="w-4 h-4 inline mr-2" />
//                 Patient Concern *
//               </label>
//               <textarea
//                 name="patientConcern"
//                 value={formData.patientConcern}
//                 onChange={handleChange}
//                 required
//                 rows={3}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                 placeholder="Describe the patient's main concern or symptoms..."
//               />
//             </div>
//           </div>

//           {/* Time Slot Selection */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               <Clock className="w-4 h-4 inline mr-2" />
//               Available Time Slots *
//             </label>
//             <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-64 overflow-y-auto p-4 border border-gray-300 rounded-xl bg-gray-50">
//               {availableTimeSlots.map(slot => {
//                 const isBooked = bookedSlots.includes(slot.time24);
// const isPast = isPastTime(slot.time24, formData.date);
//                 const isSelected = formData.time === slot.time24;
                
//                 return (
//                   <button
//                     key={slot.time24}
//                     type="button"
//                     onClick={() => !isBooked && setFormData(prev => ({ ...prev, time: slot.time24 }))}
//                     disabled={isBooked || isPast}
// className={`p-3 text-xs font-medium rounded-lg ${
//   isSelected
//     ? 'bg-blue-600 text-white'
//     : isBooked || isPast
//     ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
//     : 'bg-green-100 text-green-800'
// }`}
//                   >
//                     {slot.time12}
//                     {isBooked && <div className="text-xs mt-1">Booked</div>}
//                   </button>
//                 );
//               })}
//             </div>
            
//             {formData.date && formData.doctorId && availableTimeSlots.length === 0 && (
//               <p className="text-sm text-red-600 mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
//                 {!doctorAvailability[formData.doctorId] 
//                   ? `${selectedDoctor?.name} is not available on ${new Date(formData.date).toLocaleDateString()}`
//                   : `No available slots for ${selectedDoctor?.name} on ${new Date(formData.date).toLocaleDateString()}`
//                 }
//               </p>
//             )}
            
//             {selectedDoctor && doctorAvailability[formData.doctorId] && (
//               <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
//                 <p className="text-sm text-blue-700">
//                   <strong>Doctor:</strong> {selectedDoctor.name} ({selectedDoctor.specialization}) | 
//                   <strong> Base Fee:</strong> ₹{selectedDoctor.consultationFee?.toLocaleString() || '500'} | 
//                   <strong> Slots:</strong> 15-minute intervals
//                 </p>
//               </div>
//             )}
            
//             {!doctorAvailability[formData.doctorId] && formData.doctorId && (
//               <p className="text-sm text-orange-600 mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
//                 ⚠️ This doctor is marked as unavailable today. Please contact reception to confirm availability.
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               <FileText className="w-4 h-4 inline mr-2" />
//               Additional Notes
//             </label>
//             <textarea
//               name="notes"
//               value={formData.notes}
//               onChange={handleChange}
//               rows={4}
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//               placeholder="Any additional notes, special requirements, or instructions..."
//             />
//           </div>

//           <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-6 py-3 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 font-semibold transition-all duration-200"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 font-semibold flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
//             >
//               <Save className="w-4 h-4 mr-2" />
//               {isQuickBooking ? 'Book Now' : 'Save Appointment'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }