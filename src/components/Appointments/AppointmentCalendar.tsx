import React, { useState, useMemo } from "react";
import { DoctorSidebar } from "./AppointmentCalendar/DoctorSidebar";
import { CalendarGrid } from "./AppointmentCalendar/CalendarGrid";
import { DayAgenda } from "./AppointmentCalendar/DayAgenda";
import { BookingSlots } from "./AppointmentCalendar/BookingSlots";

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
  appointments = [],
  doctors = [],
  onBookAppointment,
  onEditAppointment,
}: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const formatTime = (time: string) => {
    if (!time || time.includes("AM") || time.includes("PM")) return time || "—";
    const [h, m] = time.split(":");
    let hr = parseInt(h);
    const ap = hr >= 12 ? "PM" : "AM";
    hr = hr % 12 || 12;
    return `${hr.toString().padStart(2, "0")}:${m} ${ap}`;
  };

  const rollingDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    const referenceDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const startDate = monthOffset === 0 ? new Date(today) : new Date(referenceDate);
    if (monthOffset === 0) startDate.setDate(today.getDate() - 5);
    const calendarStart = new Date(startDate);
    calendarStart.setDate(startDate.getDate() - startDate.getDay());
    for (let i = 0; i < 35; i++) {
      const d = new Date(calendarStart);
      d.setDate(calendarStart.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [monthOffset]);

  const availableSlots = useMemo(() => {
    const selDoctor = doctors.find((d) => d.id === selectedDoctorId);
    if (!selDoctor?.workingHours || !selectedDate) return [];
    const daySchedule = selDoctor.workingHours[selectedDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()];
    if (!daySchedule?.isWorking) return [];

    const slots = [];
    for (let h = 9; h <= 18; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === 18 && m > 0) break;
        const t24 = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
        const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
        slots.push({ time24: t24, time12: `${h12}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}` });
      }
    }

    const startH = parseInt(daySchedule.startTime.split(":")[0]);
    const endH = parseInt(daySchedule.endTime.split(":")[0]);
    const endM = parseInt(daySchedule.endTime.split(":")[1]);

    return slots.filter(s => {
      const sh = parseInt(s.time24.split(":")[0]);
      const sm = parseInt(s.time24.split(":")[1]);
      if (sh < startH || sh > endH || (sh === endH && sm > endM)) return false;
      if (daySchedule.breakStart && daySchedule.breakEnd) {
        const bsH = parseInt(daySchedule.breakStart.split(":")[0]);
        const bsM = parseInt(daySchedule.breakStart.split(":")[1]);
        const beH = parseInt(daySchedule.breakEnd.split(":")[0]);
        const beM = parseInt(daySchedule.breakEnd.split(":")[1]);
        if ((sh > bsH || (sh === bsH && sm >= bsM)) && (sh < beH || (sh === beH && sm < beM))) return false;
      }
      return true;
    }).map(s => {
      const sStart = parseInt(s.time24.split(":")[0]) * 60 + parseInt(s.time24.split(":")[1]);
      const isBooked = appointments.some(a => {
        if (a.doctorId !== selectedDoctorId || new Date(a.date).toDateString() !== selectedDate.toDateString()) return false;
        const aStart = parseInt(a.time.split(":")[0]) * 60 + parseInt(a.time.split(":")[1]);
        return sStart >= aStart && sStart < (aStart + (a.duration || 15));
      });
      const now = new Date();
      const slotTime = new Date(selectedDate);
      slotTime.setHours(parseInt(s.time24.split(":")[0]), parseInt(s.time24.split(":")[1]), 0, 0);
      return { ...s, isBooked, isPast: slotTime < now };
    });
  }, [selectedDoctorId, selectedDate, appointments, doctors]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:h-[calc(100vh-280px)] xl:overflow-hidden">
      <DoctorSidebar
        doctors={doctors}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedDoctorId={selectedDoctorId}
        setSelectedDoctorId={setSelectedDoctorId}
      />

      <CalendarGrid
        monthOffset={monthOffset}
        setMonthOffset={setMonthOffset}
        rollingDates={rollingDates}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        getDayAppointmentsForDate={(date) => appointments.filter(a => new Date(a.date).toDateString() === date.toDateString() && (!selectedDoctorId || a.doctorId === selectedDoctorId))}
        monthNames={monthNames}
      />

      <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden xl:h-full">
        <DayAgenda
          selectedDate={selectedDate}
          appointments={appointments.filter(a => new Date(a.date).toDateString() === selectedDate.toDateString() && (!selectedDoctorId || a.doctorId === selectedDoctorId))}
          onEditAppointment={onEditAppointment}
          formatTime={formatTime}
        />
        <BookingSlots
          selectedDoctorId={selectedDoctorId}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          availableSlots={availableSlots}
          onBookAppointment={(doctorId, time) => onBookAppointment?.(doctorId, selectedDate, time)}
        />
      </div>
    </div>
  );
}
