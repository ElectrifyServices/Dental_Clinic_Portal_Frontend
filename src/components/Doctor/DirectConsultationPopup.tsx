import React, { useState, useEffect } from 'react';
import { X, User, Phone, Search, AlertCircle, UserPlus, Stethoscope, Calendar } from 'lucide-react';
import { TimeSlotGrid } from './DirectConsultation/TimeSlotGrid';

interface DirectConsultationPopupProps {
  onClose: () => void;
  onPatientFound: (patient: any, doctorId: string, doctorName: string, time: string) => void;
  onRegisterNew: (name: string, phone: string) => void;
  patients: any[];
  doctors: any[];
  appointments: any[];
  doctorAvailability: { [key: string]: boolean };
}

export function DirectConsultationPopup({ 
  onClose, 
  onPatientFound, 
  onRegisterNew, 
  patients,
  doctors,
  appointments,
  doctorAvailability
}: DirectConsultationPopupProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  const [selectedTime, setSelectedTime] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatDateLocal(new Date());

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 18 && minute > 0) break;
        const time24 = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        const time12 = `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
        slots.push({ time24, time12 });
      }
    }
    return slots;
  };

  const getSlotsWithStatus = () => {
    const selDoctor = doctors.find((d) => d.id === selectedDoctorId);
    if (!selDoctor) return [];

    const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const daySchedule = selDoctor.workingHours[dayName];

    if (!daySchedule || !daySchedule.isWorking || !doctorAvailability[selectedDoctorId]) return [];

    const allPossibleSlots = generateTimeSlots();
    const startHour = parseInt(daySchedule.startTime.split(":")[0]);
    const startMinute = parseInt(daySchedule.startTime.split(":")[1]);
    const endHour = parseInt(daySchedule.endTime.split(":")[0]);
    const endMinute = parseInt(daySchedule.endTime.split(":")[1]);

    const bookedSlots = (appointments || [])
      .filter(a => a.doctorId === selectedDoctorId && a.date === todayStr)
      .map(a => a.time);

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return allPossibleSlots.filter((slot) => {
      const slotHour = parseInt(slot.time24.split(":")[0]);
      const slotMinute = parseInt(slot.time24.split(":")[1]);

      if (slotHour < startHour || (slotHour === startHour && slotMinute < startMinute)) return false;
      if (slotHour > endHour || (slotHour === endHour && slotMinute > endMinute)) return false;

      if (daySchedule.breakStart && daySchedule.breakEnd) {
        const bsH = parseInt(daySchedule.breakStart.split(":")[0]);
        const bsM = parseInt(daySchedule.breakStart.split(":")[1]);
        const beH = parseInt(daySchedule.breakEnd.split(":")[0]);
        const beM = parseInt(daySchedule.breakEnd.split(":")[1]);
        if (
          (slotHour > bsH || (slotHour === bsH && slotMinute >= bsM)) &&
          (slotHour < beH || (slotHour === beH && slotMinute < beM))
        )
          return false;
      }
      return true;
    }).map(slot => {
      const slotHour = parseInt(slot.time24.split(":")[0]);
      const slotMinute = parseInt(slot.time24.split(":")[1]);
      
      const isPast = slotHour < currentHour || (slotHour === currentHour && slotMinute < currentMinute);
      const isBooked = bookedSlots.includes(slot.time24) || bookedSlots.includes(slot.time12);

      return {
        ...slot,
        isBooked,
        isPast
      };
    });
  };

  const allSlots = getSlotsWithStatus();

  useEffect(() => {
    const firstAvailable = allSlots.find(s => !s.isBooked && !s.isPast);
    if (firstAvailable && !selectedTime) {
      setSelectedTime(firstAvailable.time12);
    }
  }, [allSlots]);

  const handleProceed = () => {
    if (!name.trim() || !phone.trim()) {
      setError('Please enter both name and phone number');
      return;
    }

    if (!selectedDoctorId) {
      setError('Please select a doctor');
      return;
    }

    if (!selectedTime) {
      setError('Please select an available slot');
      return;
    }

    setIsSearching(true);
    setError(null);

    // Simulate search
    setTimeout(() => {
      const foundPatient = patients.find(
        p => p.name.toLowerCase() === name.toLowerCase().trim() && 
             p.phone.replace(/\D/g, '') === phone.replace(/\D/g, '')
      );

      if (foundPatient) {
        const doc = doctors.find(d => d.id === selectedDoctorId);
        onPatientFound(foundPatient, selectedDoctorId, doc?.name || '', selectedTime);
      } else {
        setError('Patient not found in records.');
      }
      setIsSearching(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center text-white">
            <Stethoscope className="w-6 h-6 mr-3" />
            <h3 className="text-xl font-bold">Direct Consultation</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Patient Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter patient name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <Stethoscope className="w-4 h-4 mr-2 text-blue-600" />
                Assigned Doctor
              </label>
              <div className="relative">
                <select
                  value={selectedDoctorId}
                  onChange={(e) => {
                    setSelectedDoctorId(e.target.value);
                    setSelectedTime('');
                  }}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer font-medium"
                >
                  <option value="" disabled>Choose a doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} - {doc.specialization}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-600" />
                Available Slots
              </label>
              
              <TimeSlotGrid 
                slots={allSlots} 
                selectedTime={selectedTime} 
                onSelectTime={setSelectedTime} 
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-800">{error}</p>
                  <p className="text-xs text-red-600 mt-0.5">Please check the details or register as a new patient.</p>
                </div>
              </div>
              <button
                onClick={() => onRegisterNew(name, phone)}
                className="w-full py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-sm flex items-center justify-center transition-all shadow-md"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Register New Patient
              </button>
            </div>
          )}

          {!error && (
            <button
              onClick={handleProceed}
              disabled={isSearching || !selectedTime}
              className="btn-primary w-full justify-center"
            >
              {isSearching ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Proceed to Consultation
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


