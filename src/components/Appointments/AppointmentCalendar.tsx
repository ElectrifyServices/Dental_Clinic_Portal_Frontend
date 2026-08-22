import { useState, useMemo, useEffect } from "react";
import { DoctorSidebar } from "./AppointmentCalendar/DoctorSidebar";
import { CalendarGrid } from "./AppointmentCalendar/CalendarGrid";
import { DayAgenda } from "./AppointmentCalendar/DayAgenda";
import { BookingSlots } from "./AppointmentCalendar/BookingSlots";
import { useAvailableSlotsQuery } from "../../hooks/appointments/useAvailableSlotsQuery";
import { useAppointmentCalendarQuery } from "../../hooks/appointments/useAppointmentCalendarQuery";
import { useDoctorScheduleQuery, mapApiResponseToScheduleState } from "../../hooks/staff/useDoctorScheduleQuery";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  qualification: string;
  location: string;
  image: string;
}

interface CalendarProps {
  onNewAppointment: (date?: Date) => void;
  appointments?: any[];
  doctors?: Doctor[];
  onBookAppointment?: (doctorId: string, date: Date, time: string) => void;
  onEditAppointment?: (appointment: any) => void;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  selectedDoctorId?: string | null;
  setSelectedDoctorId?: (id: string | null) => void;
  selectedDate?: string;
  setSelectedDate?: (date: string) => void;
  onDirectCheckIn?: (appointment: any) => void;
  checkingInApptId?: string | null;
  specialistPage?: number;
  setSpecialistPage?: (p: number) => void;
  specialistLimit?: number;
  setSpecialistLimit?: (l: number) => void;
  totalSpecialists?: number;
  totalSpecialistPages?: number;
}

export function AppointmentCalendar({
  appointments = [],
  doctors = [],
  onBookAppointment,
  onEditAppointment,
  searchTerm,
  setSearchTerm,
  selectedDoctorId,
  setSelectedDoctorId,
  selectedDate: propSelectedDate,
  setSelectedDate: propSetSelectedDate,
  onDirectCheckIn,
  checkingInApptId,
  specialistPage = 1,
  setSpecialistPage,
  specialistLimit = 5,
  setSpecialistLimit,
  totalSpecialists = 0,
  totalSpecialistPages = 1,
}: CalendarProps) {
  const [localSearch, setLocalSearch] = useState("");
  const currentSearch = searchTerm !== undefined ? searchTerm : localSearch;
  const currentSetSearch = setSearchTerm ?? setLocalSearch;

  const [localDoctorId, setLocalDoctorId] = useState<string | null>(null);
  const currentDoctorId = selectedDoctorId !== undefined ? selectedDoctorId : localDoctorId;
  const currentSetDoctorId = setSelectedDoctorId ?? setLocalDoctorId;

  const [localDate, setLocalDate] = useState(() => new Date());
  const selectedDateObj = useMemo(() => {
    if (propSelectedDate) {
      const [y, m, d] = propSelectedDate.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    return localDate;
  }, [propSelectedDate, localDate]);

  const handleSetSelectedDateObj = (date: Date) => {
    if (propSetSelectedDate) {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      propSetSelectedDate(dateStr);
    } else {
      setLocalDate(date);
    }
  };

  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const formattedDate = useMemo(() => {
    if (!selectedDateObj) return "";
    return `${selectedDateObj.getFullYear()}-${String(selectedDateObj.getMonth() + 1).padStart(2, "0")}-${String(selectedDateObj.getDate()).padStart(2, "0")}`;
  }, [selectedDateObj]);

  const referenceDate = useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  }, [monthOffset]);

  const { data: calendarDataResponse } = useAppointmentCalendarQuery(
    referenceDate.getMonth() + 1,
    referenceDate.getFullYear(),
    currentDoctorId
  );

  const { data: availableSlotsResponse, isLoading: isLoadingSlots, refetch: refetchAvailableSlots } = useAvailableSlotsQuery(
    currentDoctorId,
    formattedDate
  );

  const { data: scheduleData } = useDoctorScheduleQuery(currentDoctorId);
  const scheduleState = useMemo(() => mapApiResponseToScheduleState(scheduleData), [scheduleData]);

  // Reset selected slot and trigger automatic refresh of available slots when appointments list changes
  useEffect(() => {
    refetchAvailableSlots();
    setSelectedTime(null);
  }, [appointments, refetchAvailableSlots]);

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
    if (!time) return "—";
    const upper = time.toUpperCase();
    if (upper.includes("AM") || upper.includes("PM")) return upper;
    const [h, m] = time.split(":");
    let hr = parseInt(h);
    const ap = hr >= 12 ? "PM" : "AM";
    hr = hr % 12 || 12;
    return `${hr.toString().padStart(2, "0")}:${m} ${ap}`;
  };

  const rollingDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    const referenceDate = new Date(
      today.getFullYear(),
      today.getMonth() + monthOffset,
      1,
    );
    const startDate =
      monthOffset === 0 ? new Date(today) : new Date(referenceDate);
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
    if (!availableSlotsResponse?.data?.slots) return [];
    
    // Convert 12-hour time format (e.g., "10:00 AM") to 24-hour time format (e.g., "10:00") for internal logic.
    const convert12to24 = (time12: string) => {
      const [time, modifier] = time12.split(" ");
      let [hours, minutes] = time.split(":");
      if (hours === "12") {
        hours = "00";
      }
      if (modifier === "PM") {
        hours = (parseInt(hours, 10) + 12).toString();
      }
      return `${hours.padStart(2, "0")}:${minutes}`;
    };

    return availableSlotsResponse.data.slots.map((slot) => {
      const time24 = convert12to24(slot.time);
      const appointmentCount = slot.appointment_count || 0;
      
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const slotTime = new Date(selectedDateObj);
      const [sh, sm] = time24.split(":");
      slotTime.setHours(parseInt(sh, 10), parseInt(sm, 10), 0, 0);
      
      return {
        time24,
        time12: slot.time,
        appointmentCount,
        isPast: slotTime < now,
        disabled: slot.disabled === true,
      };
    });
  }, [availableSlotsResponse, selectedDateObj]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:h-[calc(100vh-280px)] xl:overflow-hidden">
      <DoctorSidebar
        doctors={doctors}
        searchTerm={currentSearch}
        setSearchTerm={currentSetSearch}
        selectedDoctorId={currentDoctorId}
        setSelectedDoctorId={currentSetDoctorId}
        page={specialistPage}
        onPageChange={setSpecialistPage || (() => {})}
        perPage={specialistLimit}
        onPerPageChange={setSpecialistLimit}
        totalItems={totalSpecialists}
        totalPages={totalSpecialistPages}
      />

      <CalendarGrid
        monthOffset={monthOffset}
        setMonthOffset={setMonthOffset}
        rollingDates={rollingDates}
        selectedDate={selectedDateObj}
        setSelectedDate={handleSetSelectedDateObj}
        appointmentsByDate={calendarDataResponse?.data?.appointments_by_date || {}}
        getDayAppointmentsForDate={(date) => {
          const targetStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          return appointments.filter((a) => {
            const aDateStr = typeof a.date === 'string' && a.date.includes('T') ? a.date.split('T')[0] : a.date;
            return aDateStr === targetStr &&
              (!currentDoctorId || String(a.doctorId) === String(currentDoctorId));
          });
        }}
        monthNames={monthNames}
        currentDoctorId={currentDoctorId}
        scheduleState={scheduleState}
        onRefetchSlots={() => refetchAvailableSlots()}
      />

      <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden xl:h-full">
        <DayAgenda
          selectedDate={selectedDateObj}
          appointments={appointments.filter((a) => {
            const aDateStr = typeof a.date === 'string' && a.date.includes('T') ? a.date.split('T')[0] : a.date;
            return aDateStr === formattedDate &&
              (!currentDoctorId || String(a.doctorId) === String(currentDoctorId));
          })}
          onEditAppointment={onEditAppointment}
          onDirectCheckIn={onDirectCheckIn}
          formatTime={formatTime}
          checkingInApptId={checkingInApptId}
        />
        <BookingSlots
          selectedDoctorId={currentDoctorId}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          availableSlots={availableSlots}
          isLoading={isLoadingSlots}
          onBookAppointment={(doctorId, time) =>
            onBookAppointment?.(doctorId, selectedDateObj, time)
          }
        />
      </div>
    </div>
  );
}
