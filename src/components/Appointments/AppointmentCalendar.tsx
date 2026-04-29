import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  Search,
  Filter,
  Star,
  MapPin,
  Stethoscope,
  CalendarCheck,
  Check,
} from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  qualification: string;
  location: string;
  image: string;
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

interface CalendarProps {
  onNewAppointment: (date?: Date) => void;
  appointments?: any[];
  doctors?: Doctor[];
  onBookAppointment?: (doctorId: string, date: Date, time: string) => void;
  onEditAppointment?: (appointment: any) => void;
}

export function AppointmentCalendar({
  onNewAppointment,
  appointments = [],
  doctors = [],
  onBookAppointment,
  onEditAppointment,
}: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const formatTime = (time: string) => {
    if (!time) return "";
    if (time.includes("AM") || time.includes("PM")) return time;
    const cleanTime = time.replace(".", ":");
    const [hourStr, minute] = cleanTime.split(":");
    let hour = parseInt(hourStr);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, "0")}:${minute} ${ampm}`;
  };

  const [monthOffset, setMonthOffset] = useState(0);

  const generateRollingDates = () => {
    const dates = [];
    const today = new Date();

    // Calculate reference date based on offset
    const referenceDate = new Date(
      today.getFullYear(),
      today.getMonth() + monthOffset,
      1,
    );

    let startDate;
    if (monthOffset === 0) {
      // Current month: Start 5 days before today
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 5);
    } else {
      // Other months: Start from the 1st of that month
      startDate = new Date(referenceDate);
    }

    // Align to the start of the week (Sunday) for a clean grid
    const dayOfWeek = startDate.getDay();
    const calendarStart = new Date(startDate);
    calendarStart.setDate(startDate.getDate() - dayOfWeek);

    // Generate 35 days (5 weeks)
    for (let i = 0; i < 35; i++) {
      const d = new Date(calendarStart);
      d.setDate(calendarStart.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const rollingDates = generateRollingDates();
  const firstVisibleMonth = rollingDates[0].getMonth();
  const lastVisibleMonth = rollingDates[rollingDates.length - 1].getMonth();
  const firstVisibleYear = rollingDates[0].getFullYear();
  const lastVisibleYear = rollingDates[rollingDates.length - 1].getFullYear();

  const getCalendarTitle = () => {
    if (
      firstVisibleMonth === lastVisibleMonth &&
      firstVisibleYear === lastVisibleYear
    ) {
      return `${monthNames[firstVisibleMonth]} ${firstVisibleYear}`;
    }

    if (firstVisibleYear === lastVisibleYear) {
      return `${monthNames[firstVisibleMonth]} - ${monthNames[lastVisibleMonth]} ${firstVisibleYear}`;
    }

    return `${monthNames[firstVisibleMonth]} ${firstVisibleYear} - ${monthNames[lastVisibleMonth]} ${lastVisibleYear}`;
  };

  const getDayAppointmentsForDate = (date: Date) => {
    return appointments.filter((a) => {
      const d = new Date(a.date);
      const matchesDate = d.toDateString() === date.toDateString();
      const matchesDoctor =
        !selectedDoctorId || a.doctorId === selectedDoctorId;
      return matchesDate && matchesDoctor;
    });
  };

  const getSelectedDateAppointments = () => {
    return appointments.filter((a) => {
      const d = new Date(a.date);
      const matchesDate = d.toDateString() === selectedDate.toDateString();
      const matchesDoctor =
        !selectedDoctorId || a.doctorId === selectedDoctorId;
      return matchesDate && matchesDoctor;
    });
  };

  const isPastActualDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isTodayDate = (date: Date) => {
    return new Date().toDateString() === date.toDateString();
  };

  // Doctor filtering
  const filteredDoctors = doctors.filter((doctor) => {
    return (
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  // Time slot logic
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

  const isPastTime = (time24: string) => {
    const now = new Date();
    const [h, m] = time24.split(":");
    const slotTime = new Date(selectedDate);
    slotTime.setHours(parseInt(h), parseInt(m), 0, 0);
    return slotTime < now;
  };

  const availableSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDoctor.workingHours || !selectedDate)
      return [];

    const dayName = selectedDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const daySchedule = selectedDoctor.workingHours[dayName];

    if (!daySchedule || !daySchedule.isWorking) return [];

    const allSlots = generateTimeSlots();
    const startHour = parseInt(daySchedule.startTime.split(":")[0]);
    const endHour = parseInt(daySchedule.endTime.split(":")[0]);
    const endMinute = parseInt(daySchedule.endTime.split(":")[1]);

    const relevantAppointments = appointments.filter(
      (a) =>
        new Date(a.date).toDateString() === selectedDate.toDateString() &&
        a.doctorId === selectedDoctorId,
    );

    return allSlots
      .filter((slot) => {
        const slotHour = parseInt(slot.time24.split(":")[0]);
        const slotMinute = parseInt(slot.time24.split(":")[1]);

        if (slotHour < startHour) return false;
        if (slotHour > endHour) return false;
        if (slotHour === endHour && slotMinute > endMinute) return false;

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
      })
      .map((slot) => {
        const slotStart = parseInt(slot.time24.split(":")[0]) * 60 + parseInt(slot.time24.split(":")[1]);

        const isBooked = relevantAppointments.some(a => {
          const aStart = parseInt(a.time.split(":")[0]) * 60 + parseInt(a.time.split(":")[1]);
          const aDuration = a.duration ? parseInt(a.duration.toString()) : 15;
          const aEnd = aStart + aDuration;
          return slotStart >= aStart && slotStart < aEnd;
        });

        return {
          ...slot,
          isBooked,
          isPast: isPastTime(slot.time24),
        };
      });
  }, [selectedDoctor, selectedDate, appointments, selectedDoctorId]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:h-[calc(100vh-240px)] xl:overflow-hidden pb-10 xl:pb-0">
      {/* Column 1: Doctor Selection (Left Sidebar) */}
      <div className="xl:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden h-[400px] xl:h-full">
        <div className="p-5 border-b border-gray-50 bg-gray-50/30">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            Select Specialist
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search experts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <button
            onClick={() => setSelectedDoctorId(null)}
            className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center gap-3 text-left
              ${selectedDoctorId === null ? "bg-blue-50 border-blue-600 shadow-md" : "bg-white border-transparent hover:border-gray-100"}`}
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">
                All Appointments
              </p>
              <p className="text-[10px] text-gray-400">
                View combined schedule
              </p>
            </div>
          </button>

          {filteredDoctors.map((doctor) => (
            <button
              key={doctor.id}
              onClick={() => setSelectedDoctorId(doctor.id)}
              className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center gap-3 text-left
                ${selectedDoctorId === doctor.id ? "bg-blue-50 border-blue-600 shadow-md" : "bg-white border-transparent hover:bg-gray-50"}`}
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-gray-50 flex-shrink-0">
                <img
                  src={doctor.avatar || doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {doctor.name}
                </p>
                <p className="text-[10px] text-blue-600 font-medium truncate">
                  {doctor.specialization}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Column 2: Rolling Calendar (Center) */}
      <div className="xl:col-span-6 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col overflow-hidden h-[500px] xl:h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">
              {getCalendarTitle()}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMonthOffset((prev) => prev - 1)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-100 text-gray-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMonthOffset(0)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${monthOffset === 0
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
            >
              Today
            </button>
            <button
              onClick={() => setMonthOffset((prev) => prev + 1)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-100 text-gray-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 rounded-lg"
              >
                {day}
              </div>
            ))}

            {rollingDates.map((date, index) => {
              const dayAppointments = getDayAppointmentsForDate(date);
              const isSelected =
                selectedDate.toDateString() === date.toDateString();
              const isToday = isTodayDate(date);
              const isPast = isPastActualDate(date);
              const isNextMonth = date.getMonth() !== new Date().getMonth();

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (isPast) return;
                    setSelectedDate(date);
                    setSelectedTime(null);
                  }}
                  className={`aspect-square p-2 text-center rounded-2xl transition-all duration-200 border-2 flex flex-col items-center justify-center relative
                    ${isToday
                      ? "bg-blue-600 text-white shadow-lg border-blue-600"
                      : isSelected
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : isPast
                          ? "bg-gray-50 text-gray-300 border-transparent opacity-60 cursor-not-allowed"
                          : "bg-white border-transparent hover:border-gray-100 cursor-pointer"
                    }`}
                >
                  <span
                    className={`text-sm md:text-base font-black ${isToday
                        ? "text-white"
                        : isPast
                          ? "text-blue-900/40"
                          : "text-blue-900"
                      }`}
                  >
                    {date.getDate()}
                  </span>
                  {dayAppointments.length > 0 && (
                    <div
                      className={`mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${isToday
                          ? "bg-white/20 text-white"
                          : "bg-blue-100 text-blue-600"
                        }`}
                    >
                      {dayAppointments.length}
                    </div>
                  )}
                  {date.getDate() === 1 && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-600 text-white text-[8px] font-black rounded-md shadow-sm uppercase tracking-tighter">
                      {monthNames[date.getMonth()].slice(0, 3)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Column 3: Day Agenda & Booking (Right) */}
      <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden xl:h-full">
        {/* Day Agenda */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">
              {selectedDate.toLocaleDateString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            {getSelectedDateAppointments().length > 0 ? (
              getSelectedDateAppointments().map((apt, index) => (
                <div
                  key={index}
                  onClick={() => onEditAppointment?.(apt)}
                  className="p-3 bg-gray-50 hover:bg-blue-50/50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(apt.time)}
                    </span>
                    <span
                      className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${apt.status === "checked-in" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}
                    >
                      {apt.status || "Booked"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-gray-400 group-hover:text-blue-500 border border-gray-100 group-hover:border-blue-100 transition-all">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-gray-900 truncate">
                        {apt.patientName}
                      </p>
                      <p className="text-[9px] text-gray-400 truncate">
                        {apt.treatment || "Consultation"}
                      </p>
                      <p className="text-[8px] font-bold text-blue-600/60 mt-0.5">
                        Est. Duration: {apt.duration || 15} mins
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-40">
                <CalendarIcon className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-[10px] font-bold text-gray-500">
                  No appointments
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Booking Slots (Visible only if a doctor is selected) */}
        <div
          className={`bg-white rounded-3xl border border-gray-100 p-5 shadow-sm transition-all duration-300 ${selectedDoctorId ? "opacity-100 h-[280px]" : "opacity-50 h-[100px] pointer-events-none"}`}
        >
          {selectedDoctorId ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-green-500" />
                  Available Slots
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2 custom-scrollbar pr-1">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot, idx) => {
                    const isDisabled = slot.isBooked || slot.isPast;
                    return (
                      <button
                        key={idx}
                        disabled={isDisabled}
                        onClick={() => setSelectedTime(slot.time24)}
                        className={`py-2 rounded-xl text-[9px] font-bold text-center border transition-all relative
                          ${selectedTime === slot.time24
                            ? "bg-blue-600 border-blue-600 text-white shadow-md"
                            : isDisabled
                              ? "bg-gray-50 text-gray-200 border-transparent cursor-not-allowed"
                              : "bg-green-50 text-green-700 border-green-100 hover:border-green-200 hover:bg-green-100"
                          }`}
                      >
                        {slot.time12}
                        {slot.isBooked && (
                          <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-400 rounded-full border border-white" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-3 py-4 text-center">
                    <p className="text-[10px] font-semibold text-red-400">
                      No slots available
                    </p>
                  </div>
                )}
              </div>

              <button
                disabled={!selectedTime}
                onClick={() =>
                  onBookAppointment?.(
                    selectedDoctorId,
                    selectedDate,
                    selectedTime!,
                  )
                }
                className={`w-full mt-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all
                  ${selectedTime
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Schedule Now
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Stethoscope className="w-6 h-6 text-gray-200 mb-2" />
              <p className="text-[10px] font-bold text-gray-400">
                Select an expert to book
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
