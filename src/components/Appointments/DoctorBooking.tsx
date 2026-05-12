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
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const nextDates = generateDates();

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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-2xl shadow-sm focus:ring-2 focus:ring-primary outline-none text-sm font-medium"
            />
          </div>
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-2xl transition-all shadow-sm border ${showFilters ? 'bg-primary text-white border-primary shadow-blue-100' : 'bg-card text-muted-foreground border-border hover:text-primary'}`}
            >
              <Filter className="w-5 h-5" />
            </button>

            {/* Filter Dropdown Popover */}
            {showFilters && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-80 bg-card rounded-2xl shadow-2xl border border-border z-50 p-6 animate-in fade-in zoom-in slide-in-from-top-4 duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-sm font-bold text-foreground leading-none">Global Filters</h4>
                  <button
                    onClick={() => { setSelectedSpecialty([]); setSelectedCity([]); setSelectedGender([]); }}
                    className="text-[10px] font-bold text-primary hover:underline uppercase"
                  >
                    Reset
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Specialty */}
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-3">Specialty</p>
                    <div className="flex flex-wrap gap-2">
                      {specialties.slice(0, 4).map(s => (
                        <button
                          key={s}
                          onClick={() => toggleFilter(selectedSpecialty, setSelectedSpecialty, s)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${selectedSpecialty.includes(s) ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted border-transparent text-muted-foreground'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-3">Gender Preference</p>
                    <div className="flex gap-2">
                      {["Male", "Female"].map(g => (
                        <button
                          key={g}
                          onClick={() => toggleFilter(selectedGender, setSelectedGender, g)}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-2 ${selectedGender.includes(g) ? 'bg-primary border-primary text-white shadow-md' : 'bg-muted border-transparent text-muted-foreground'}`}
                        >
                          {selectedGender.includes(g) && <Check className="w-3 h-3" />}
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-3">City / Location</p>
                    <div className="grid grid-cols-2 gap-2">
                      {cities.map(c => (
                        <label key={c} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCity.includes(c)}
                            onChange={() => toggleFilter(selectedCity, setSelectedCity, c)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground">{c}</span>
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
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${selectedSpecialty.length === 0 ? 'bg-slate-900 border-slate-900 text-white' : 'bg-card border-border text-muted-foreground hover:border-border'}`}
          >
            All Departments
          </button>
          {specialties.map(s => (
            <button
              key={s}
              onClick={() => toggleFilter(selectedSpecialty, setSelectedSpecialty, s)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${selectedSpecialty.includes(s) ? 'bg-primary border-primary text-white' : 'bg-card border-border text-muted-foreground hover:border-border'}`}
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
                ${selectedDoctorId === doctor.id ? 'bg-primary/10 border-primary shadow-lg shadow-blue-100/50' : 'bg-card border-border hover:border-primary/30 shadow-sm'}`}
            >
              <div className="w-16 h-16 rounded-[1.25rem] overflow-hidden flex-shrink-0 shadow-inner ring-4 ring-gray-50 group-hover:ring-blue-100 transition-all">
                <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="flex-1 py-0.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">{doctor.name}</h3>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded-full mt-0.5">
                      {doctor.specialization}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-lg">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span className="text-[9px] font-bold">4.9</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-4 text-[9px] font-semibold text-muted-foreground/60">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground/40" />
                    {doctor.experience}
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground/40" />
                    {doctor.location}
                  </div>
                </div>
              </div>
              {selectedDoctorId === doctor.id && (
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md shadow-blue-200 animate-in fade-in zoom-in slide-in-from-right-4 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {filteredDoctors.length === 0 && (
            <div className="py-20 text-center bg-muted rounded-2xl border-2 border-dashed border-border">
              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Search className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-bold text-foreground">No Experts Found</p>
              <p className="text-[10px] font-semibold text-muted-foreground/60 mt-1">Try adjusting your filters or department selection</p>
              <button
                onClick={() => { setSelectedSpecialty([]); setSelectedCity([]); setSelectedGender([]); setSearchTerm(''); }}
                className="mt-6 text-primary font-bold text-[10px] uppercase hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT COLUMN: FULL-LOGIC BOOKING CALENDAR ── */}
      <div className="w-full xl:w-[420px] flex flex-col gap-6 h-full">
        <div className="bg-card rounded-2xl border border-border shadow-2xl shadow-blue-500/5 flex flex-col overflow-hidden">
          {selectedDoctor ? (
            <div className="flex flex-col h-full">
              {/* Header: Doctor Info */}
              <div className="p-8 border-b border-border bg-gradient-to-br from-white to-gray-50/50">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-[1.75rem] overflow-hidden shadow-xl ring-4 ring-blue-50 flex-shrink-0">
                    <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-foreground">{selectedDoctor.name}</h3>
                    <p className="text-xs font-semibold text-primary flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Experience: {selectedDoctor.experience}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-Header: Horizontal Date Picker */}
              <div className="px-8 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">
                      {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h4>
                    <div className="w-1 h-1 bg-muted rounded-full" />
                    <p className="text-[10px] font-semibold text-muted-foreground/60">Consultation Schedule</p>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <div className="relative group">
                      <button className="p-1.5 hover:bg-muted rounded-lg border border-border transition-all text-muted-foreground">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <input
                          type="date"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            if (e.target.value) {
                              const newDate = new Date(e.target.value);
                              setSelectedDate(newDate);
                              // Calculate index and scroll
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const diffTime = Math.abs(newDate.getTime() - today.getTime());
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              const el = document.getElementById('date-strip');
                              if (el) el.scrollTo({ left: diffDays * 64, behavior: 'smooth' }); // 64px is approx width of date card
                            }
                          }}
                        />
                      </button>
                    </div>
                    <div className="w-px h-4 bg-muted mx-0.5" />
                    <button
                      onClick={() => {
                        const el = document.getElementById('date-strip');
                        if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
                      }}
                      className="p-1.5 hover:bg-muted rounded-lg border border-border transition-all text-muted-foreground"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById('date-strip');
                        if (el) el.scrollBy({ left: 200, behavior: 'smooth' });
                      }}
                      className="p-1.5 hover:bg-muted rounded-lg border border-border transition-all text-muted-foreground"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div
                  id="date-strip"
                  className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2 scroll-smooth"
                >
                  {nextDates.map((date, idx) => {
                    const isSelected = selectedDate.toDateString() === date.toDateString();
                    const isToday = new Date().toDateString() === date.toDateString();
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNum = date.getDate();

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 w-14 h-16 flex flex-col items-center justify-center rounded-2xl border-2 transition-all
                          ${isSelected
                            ? 'border-primary bg-primary text-white shadow-lg shadow-blue-100'
                            : 'border-border bg-card text-muted-foreground hover:border-primary/20 hover:bg-primary/50'}`}
                      >
                        <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-blue-100' : 'text-muted-foreground/60'}`}>{dayName}</span>
                        <span className={`text-base font-bold ${isSelected ? 'text-white' : 'text-foreground'}`}>{dayNum}</span>
                        {isToday && !isSelected && <div className="w-1 h-1 bg-primary rounded-full mt-0.5" />}
                      </button>
                    );
                  })}
                </div>

                {/* Day's Agenda */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-[10px] font-bold text-muted-foreground/60 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      Agenda • {selectedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </h5>
                    {getSelectedDayAppointments().length > 0 && (
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
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
                          className="p-3 bg-muted rounded-2xl border border-border flex items-center justify-between group hover:bg-card hover:border-primary/30 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-primary border border-border group-hover:border-primary/30">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{apt.patientName}</p>
                              <p className="text-[9px] font-semibold text-muted-foreground/60">{formatTime(apt.time)} • {apt.treatment || 'Consultation'}</p>
                              <p className="text-[8px] font-bold text-primary/60 mt-0.5">Est. Duration: {apt.duration || 15} mins</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-blue-400 translate-x-0 group-hover:translate-x-1 transition-all" />
                        </div>
                      ))
                    ) : (
                      <div className="py-3 text-center bg-muted/40 rounded-2xl border border-dashed border-border">
                        <p className="text-[10px] font-bold text-muted-foreground/60">All slots available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Available Time Slots */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-[10px] font-bold text-muted-foreground/60 flex items-center gap-2">
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
                                ? 'bg-primary border-primary text-white shadow-md'
                                : isDisabled
                                  ? 'bg-muted text-muted-foreground/40 border-border cursor-not-allowed'
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
                      <div className="col-span-4 py-4 text-center bg-destructive/50 rounded-2xl border border-dashed border-destructive/20">
                        <p className="text-[10px] font-semibold text-red-400">No slots available for this day</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-6">

                  <button
                    onClick={() => onBookAppointment(selectedDoctor.id, selectedDate, selectedTime || undefined)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-2xl shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-sm"
                  >
                    Confirm & Schedule
                    <ChevronRight className="w-5 h-5 font-bold" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-40 px-10 text-center animate-in fade-in zoom-in duration-700">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Stethoscope className="w-12 h-12 text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Select Your Expert</h3>
              <p className="text-sm font-semibold text-muted-foreground/60 mt-4 max-w-xs">Pick a specialist from the left to access their real-time clinical calendar and schedule.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
