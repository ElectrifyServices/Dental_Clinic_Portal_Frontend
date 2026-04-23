import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Star,
  Phone,
  Calendar as CalendarIcon,
  ChevronRight,
  Share2,
  X,
  Stethoscope,
  ChevronLeft,
  CalendarCheck,
  Award,
  User,
  Plus,
  Check
} from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  qualification: string;
  location: string;
  hospitalName: string;
  image: string;
  consultationFee: number;
  gender: "Male" | "Female";
  workingHours?: {
    [key: string]: {
      isWorking: boolean;
      startTime: string;
      endTime: string;
      breakStart?: string;
      breakEnd?: string;
    };
  };
}

interface DoctorBookingProps {
  doctors: Doctor[];
  onBookAppointment: (doctorId: string, date?: Date, time?: string) => void;
  onViewAppointments: () => void;
  onViewCalendar: () => void;
  onEditAppointment: (appointment: any) => void;
  appointments: any[];
}

export function DoctorBooking({
  doctors,
  onBookAppointment,
  onViewAppointments,
  onViewCalendar,
  onEditAppointment,
  appointments = []
}: DoctorBookingProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(doctors[0]?.id || null);
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filters when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calendar States
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Reset selected internal states when doctor or date change
  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDoctorId, selectedDate]);

  const specialties = [
    "General Dentistry", "Orthodontics", "Oral Surgery", 
    "Cosmetology & Plastic Surgery", "Endodontics", "Periodontics",
    "Prosthodontics", "Pediatric Dentistry"
  ];

  const cities = ["Ahmedabad", "Aragonda", "Bangalore", "Bhopal", "Bhubaneswar"];

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty.length === 0 ||
      selectedSpecialty.includes(doctor.specialization);
    const matchesCity =
      selectedCity.length === 0 ||
      selectedCity.some((city) => doctor.location.includes(city));
    const matchesGender =
      selectedGender.length === 0 || selectedGender.includes(doctor.gender);
    return matchesSearch && matchesSpecialty && matchesCity && matchesGender;
  });

  const toggleFilter = (list: string[], setList: (val: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  // Calendar Logic
  const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getAppointmentsForDay = (day: number) => {
    return appointments.filter(a => {
        const d = new Date(a.date);
        return d.getDate() === day && d.getMonth() === calendarDate.getMonth() && d.getFullYear() === calendarDate.getFullYear() && a.doctorId === selectedDoctorId;
    });
  };

  const getSelectedDayAppointments = () => {
    return appointments.filter(a => {
        const d = new Date(a.date);
        return d.toDateString() === selectedDate.toDateString() && a.doctorId === selectedDoctorId;
    });
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    if (time.includes('AM') || time.includes('PM')) return time;
    const cleanTime = time.replace('.', ':');
    const [hourStr, minute] = cleanTime.split(':');
    let hour = parseInt(hourStr);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
  };

  const isPastDate = (day: number) => {
    const today = new Date();
    const date = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    today.setHours(0,0,0,0);
    date.setHours(0,0,0,0);
    return date < today;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 18 && minute > 0) break;
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
        slots.push({ time24, time12 });
      }
    }
    return slots;
  };

  const isPastTime = (time24: string) => {
    const now = new Date();
    const [h, m] = time24.split(':');
    const slotTime = new Date(selectedDate);
    slotTime.setHours(parseInt(h), parseInt(m), 0, 0);
    return slotTime < now;
  };

  const getAvailableTimeSlots = () => {
    if (!selectedDoctor || !selectedDoctor.workingHours || !selectedDate) return [];

    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = selectedDoctor.workingHours[dayName];

    if (!daySchedule || !daySchedule.isWorking) return [];

    const allSlots = generateTimeSlots();
    const startHour = parseInt(daySchedule.startTime.split(':')[0]);
    const endHour = parseInt(daySchedule.endTime.split(':')[0]);
    const endMinute = parseInt(daySchedule.endTime.split(':')[1]);

    const bookedSlots = getSelectedDayAppointments().map(a => a.time);

    return allSlots.filter(slot => {
      const slotHour = parseInt(slot.time24.split(':')[0]);
      const slotMinute = parseInt(slot.time24.split(':')[1]);

      if (slotHour < startHour) return false;
      if (slotHour > endHour) return false;
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
    }).map(slot => ({
      ...slot,
      isBooked: bookedSlots.includes(slot.time24),
      isPast: isPastTime(slot.time24)
    }));
  };

  const availableSlots = getAvailableTimeSlots();

  return (
    <div className="flex flex-col xl:flex-row gap-4 animate-in fade-in duration-500 relative">
      {/* ── LEFT COLUMN: FILTERS & DOCTOR LIST ── */}
      <div className="flex-1 space-y-6">
        
        {/* Search & Filter Header */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium"
            />
          </div>
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-2xl transition-all shadow-sm border ${showFilters ? 'bg-blue-600 text-white border-blue-600 shadow-blue-100' : 'bg-white text-gray-500 border-gray-200 hover:text-blue-600'}`}
            >
               <Filter className="w-5 h-5" />
            </button>

            {/* Filter Dropdown Popover */}
            {showFilters && (
               <div className="absolute right-0 top-[calc(100%+12px)] w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 p-6 animate-in fade-in zoom-in slide-in-from-top-4 duration-200">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-bold text-gray-900 leading-none">Global Filters</h4>
                    <button 
                      onClick={() => { setSelectedSpecialty([]); setSelectedCity([]); setSelectedGender([]); }}
                      className="text-[10px] font-bold text-blue-600 hover:underline uppercase"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Specialty */}
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Specialty</p>
                      <div className="flex flex-wrap gap-2">
                        {specialties.slice(0, 4).map(s => (
                          <button
                            key={s}
                            onClick={() => toggleFilter(selectedSpecialty, setSelectedSpecialty, s)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${selectedSpecialty.includes(s) ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-transparent text-gray-500'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Gender Preference</p>
                      <div className="flex gap-2">
                        {["Male", "Female"].map(g => (
                          <button
                            key={g}
                            onClick={() => toggleFilter(selectedGender, setSelectedGender, g)}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-2 ${selectedGender.includes(g) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-gray-50 border-transparent text-gray-500'}`}
                          >
                            {selectedGender.includes(g) && <Check className="w-3 h-3" />}
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* City */}
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">City / Location</p>
                      <div className="grid grid-cols-2 gap-2">
                        {cities.map(c => (
                          <label key={c} className="flex items-center gap-2 cursor-pointer group">
                             <input 
                               type="checkbox" 
                               checked={selectedCity.includes(c)}
                               onChange={() => toggleFilter(selectedCity, setSelectedCity, c)}
                               className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                             />
                             <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-900">{c}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* Quick Department Filter Bar */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button 
            onClick={() => setSelectedSpecialty([])}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${selectedSpecialty.length === 0 ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}
          >
            All Departments
          </button>
          {specialties.map(s => (
            <button 
              key={s}
              onClick={() => toggleFilter(selectedSpecialty, setSelectedSpecialty, s)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${selectedSpecialty.includes(s) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Doctor List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-hide px-1 py-1 transition-all">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              onClick={() => setSelectedDoctorId(doctor.id)}
              className={`group relative p-3 rounded-[1.75rem] border-2 transition-all cursor-pointer flex items-center gap-4
                ${selectedDoctorId === doctor.id ? 'bg-blue-50 border-blue-600 shadow-lg shadow-blue-100/50' : 'bg-white border-gray-100 hover:border-blue-200 shadow-sm'}`}
            >
              <div className="w-16 h-16 rounded-[1.25rem] overflow-hidden flex-shrink-0 shadow-inner ring-4 ring-gray-50 group-hover:ring-blue-100 transition-all">
                <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="flex-1 py-0.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">{doctor.name}</h3>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded-full mt-0.5">
                      {doctor.specialization}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-lg">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span className="text-[9px] font-bold">4.9</span>
                  </div>
                </div>
                
                <div className="mt-2 flex items-center gap-4 text-[9px] font-semibold text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-300" />
                    {doctor.experience}
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-gray-300" />
                    {doctor.location}
                  </div>
                </div>
              </div>
              {selectedDoctorId === doctor.id && (
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md shadow-blue-200 animate-in fade-in zoom-in slide-in-from-right-4 transition-all">
                   <ChevronRight className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {filteredDoctors.length === 0 && (
            <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <Search className="w-8 h-8 text-gray-300" />
               </div>
               <p className="text-sm font-bold text-gray-900">No Experts Found</p>
               <p className="text-[10px] font-semibold text-gray-400 mt-1">Try adjusting your filters or department selection</p>
               <button 
                 onClick={() => { setSelectedSpecialty([]); setSelectedCity([]); setSelectedGender([]); setSearchTerm(''); }}
                 className="mt-6 text-blue-600 font-bold text-[10px] uppercase hover:underline"
               >
                 Clear all filters
               </button>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT COLUMN: FULL-LOGIC BOOKING CALENDAR ── */}
      <div className="w-full xl:w-[420px] flex flex-col gap-6 h-full">
        <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-2xl shadow-blue-500/5 flex flex-col overflow-hidden">
          {selectedDoctor ? (
            <div className="flex flex-col h-full">
              {/* Header: Doctor Info */}
              <div className="p-8 border-b border-gray-50 bg-gradient-to-br from-white to-gray-50/50">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-[1.75rem] overflow-hidden shadow-xl ring-4 ring-blue-50 flex-shrink-0">
                    <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900">{selectedDoctor.name}</h3>
                    <p className="text-xs font-semibold text-blue-600 flex items-center gap-2">
                       <Award className="w-4 h-4" />
                       Experience: {selectedDoctor.experience}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-Header: Calendar Nav */}
              <div className="px-8 py-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}</h4>
                    <p className="text-[10px] font-semibold text-gray-400 mt-0.5">Select a consultation date</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={onViewCalendar}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold hover:bg-blue-100 transition-all border border-blue-100"
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      Full Calendar
                    </button>
                    <div className="w-px h-6 bg-gray-100 mx-1" />
                    <button 
                      onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))}
                      className="p-2.5 hover:bg-white border border-gray-100 rounded-xl transition-all shadow-sm text-gray-600"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))}
                      className="p-2.5 hover:bg-white border border-gray-100 rounded-xl transition-all shadow-sm text-gray-600"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid with Logic */}
                <div className="grid grid-cols-7 gap-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                    <div key={idx} className="text-center text-[10px] font-bold text-gray-400 py-2">{day}</div>
                  ))}
                  {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const dayAppointments = getAppointmentsForDay(day);
                    const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === calendarDate.getMonth() && selectedDate.getFullYear() === calendarDate.getFullYear();
                    const isToday = new Date().getDate() === day && new Date().getMonth() === calendarDate.getMonth() && new Date().getFullYear() === calendarDate.getFullYear();
                    const past = isPastDate(day);
                    
                    return (
                      <button
                        key={day}
                        disabled={past}
                        onClick={() => setSelectedDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day))}
                        className={`group relative h-14 flex flex-col items-center justify-center rounded-2xl border-2 transition-all p-1
                          ${past ? 'bg-gray-50 text-gray-300 border-transparent cursor-not-allowed' : 
                            isSelected ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200' : 
                            isToday ? 'border-blue-200 bg-white text-blue-600' : 'border-transparent hover:border-blue-100 hover:bg-blue-50/50'}`}
                      >
                        <span className={`text-sm font-bold ${past ? 'text-gray-300' : isSelected ? 'text-white' : 'text-gray-900'}`}>{day}</span>
                        {!past && dayAppointments.length > 0 && (
                           <div className={`mt-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold leading-none
                             ${isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600 animate-pulse'}`}>
                             {dayAppointments.length}
                           </div>
                        )}
                        {isToday && !isSelected && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                      </button>
                    );
                  })}
                </div>

                {/* Day's Agenda (Integrated sidebar logic) */}
                <div className="pt-6 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-[10px] font-bold text-gray-400 flex items-center gap-2">
                       <Clock className="w-3.5 h-3.5 text-blue-600" />
                       Agenda • {selectedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </h5>
                    {getSelectedDayAppointments().length > 0 && (
                       <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                         {getSelectedDayAppointments().length} Scheduled
                       </span>
                    )}
                  </div>
                  
                  <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {getSelectedDayAppointments().length > 0 ? (
                      getSelectedDayAppointments().map((apt, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => onEditAppointment(apt)}
                          className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-blue-200 transition-all cursor-pointer"
                        >
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 border border-gray-100 group-hover:border-blue-200">
                                 <User className="w-4 h-4" />
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{apt.patientName}</p>
                                 <p className="text-[9px] font-semibold text-gray-400">{formatTime(apt.time)} • {apt.treatment || 'Consultation'}</p>
                              </div>
                           </div>
                           <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-blue-400 translate-x-0 group-hover:translate-x-1 transition-all" />
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                         <CalendarIcon className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                         <p className="text-[10px] font-semibold text-gray-400">All slots available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Available Time Slots */}
                <div className="pt-6 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-[10px] font-bold text-gray-400 flex items-center gap-2">
                       <CalendarCheck className="w-3.5 h-3.5 text-green-500" />
                       Available Slots
                    </h5>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot, idx) => {
                        const isDisabled = slot.isBooked || slot.isPast;
                        
                        return (
                          <button 
                            key={idx}
                            disabled={isDisabled}
                            onClick={() => setSelectedTime(slot.time24)}
                            className={`px-2 py-2 rounded-xl text-[10px] font-bold text-center border transition-all relative
                              ${selectedTime === slot.time24 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                                : isDisabled
                                  ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                  : 'bg-green-50 text-green-700 border-green-100 hover:border-green-200 hover:bg-green-100'}`}
                          >
                            {slot.time12}
                            {slot.isBooked && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full border border-white" />
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="col-span-4 py-4 text-center bg-red-50/50 rounded-2xl border border-dashed border-red-100">
                        <p className="text-[10px] font-semibold text-red-400">No slots available for this day</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-6">

                  <button
                    onClick={() => onBookAppointment(selectedDoctor.id, selectedDate, selectedTime || undefined)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-[1.5rem] shadow-2xl shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-sm"
                  >
                    Confirm & Schedule
                    <ChevronRight className="w-5 h-5 font-bold" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-40 px-10 text-center animate-in fade-in zoom-in duration-700">
               <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <Stethoscope className="w-12 h-12 text-blue-300" />
               </div>
               <h3 className="text-2xl font-bold text-gray-900">Select Your Expert</h3>
               <p className="text-sm font-semibold text-gray-400 mt-4 max-w-xs">Pick a specialist from the left to access their real-time clinical calendar and schedule.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
