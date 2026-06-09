import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, LayoutGrid, ListFilter } from "lucide-react";
import { useAppData } from "../hooks/useAppData";
import { useModal } from "../contexts/ModalContext";
import { AppointmentCalendar } from "../components/Appointments/AppointmentCalendar";
import { AppointmentList } from "../components/Appointments/AppointmentList";
import { AppointmentStats } from "../components/Appointments/AppointmentList/AppointmentStats";
import { useDoctorsListQuery } from "../hooks/staff/useDoctorsListQuery";
import { useCheckInAppointmentMutation } from "../hooks/appointments/useCheckInAppointmentMutation";
import { useDebounce } from "../hooks/useDebounce";
import { toast } from "../components/ui";

export const AppointmentsPage: React.FC = () => {
  const {
    appointments,
    noShowAppointments,
    staffMembers,
    patients,
    handleDeleteAppointment,
    handleUpdateAppointmentStatus,
    apptSearch,
    setApptSearch,
    selectedDate,
    setSelectedDate,
    apptFilter,
    setApptFilter,
    selectedDoctorId,
    setSelectedDoctorId,
    refetchAppointments,
  } = useAppData();
  const {
    setActiveModal,
    setSelectedAppointment,
    confirmDelete,
    setPendingCheckInAppt,
    setSelectedPatientId,
  } = useModal();

  useEffect(() => {
    if (refetchAppointments) {
      refetchAppointments();
    }
  }, [refetchAppointments]);

  const [viewMode, setViewMode] = useState("calendar");
  const [specialistSearch, setSpecialistSearch] = useState("");
  const debouncedSpecialistSearch = useDebounce(specialistSearch, 500);

  const { doctors: activeDoctors } = useDoctorsListQuery(debouncedSpecialistSearch);

  const isMatchingDate = (dateStr: string) => {
    if (!selectedDate) return true;
    const aDate = new Date(dateStr);
    const aDateString = `${aDate.getFullYear()}-${String(aDate.getMonth() + 1).padStart(2, '0')}-${String(aDate.getDate()).padStart(2, '0')}`;
    return aDateString === selectedDate;
  };

  const listCount = appointments.filter(
    (a: any) => a.status !== "no-show" && isMatchingDate(a.date),
  ).length;

  const noShowCount = (noShowAppointments || []).filter((a: any) => isMatchingDate(a.date)).length;
  
  const calendarCount = appointments.filter((a: any) => isMatchingDate(a.date)).length + noShowCount;

  const handleNewAppointment = (date?: any) => {
    setSelectedAppointment(date ? { date } : null);
    setActiveModal("appointmentForm");
  };

  const handleDeleteAppt = (id: string) => {
    const apt = appointments.find((a: any) => a.id === id) || noShowAppointments?.find((a: any) => a.id === id);
    confirmDelete(
      "Delete Appointment",
      `Delete appointment for ${apt?.patientName || "this patient"}?`,
      () => handleDeleteAppointment(id),
    );
  };

  const { mutateAsync: checkInAppointment } = useCheckInAppointmentMutation();

  const handleCheckInPatient = async (appt: any) => {
    const rawName = appt.patientName || (typeof appt.patient === 'object' ? appt.patient?.name : appt.patient) || "";
    const sName = String(rawName).toLowerCase().trim();
    const sPhone = (appt.patientPhone || appt.phone || "").trim();
    const existing = patients.find(
      (p: any) =>
        (p.phone || "").trim() === sPhone &&
        (p.name || "").toLowerCase().trim() === sName,
    );
    try {
      await checkInAppointment({ id: appt.id });
    } catch (err) {
      /* console.error removed */
    }
    setPendingCheckInAppt(appt);
    if (existing) {
      setSelectedPatientId(existing.id);
      setActiveModal("patientForm");
      toast.success("Please verify patient details before check-in");
    } else {
      setActiveModal("patientNotFound");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/50 shadow-sm -mt-3 md:-mt-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Appointments
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Schedule and manage patient visits
          </p>
        </div>
        <div className="flex items-center justify-between w-full md:w-auto gap-1 bg-muted/50 p-1 rounded-xl sm:rounded-2xl">
          <Button
            variant={viewMode === "calendar" ? "default" : "ghost"}
            onClick={() => setViewMode("calendar")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all ${viewMode === "calendar" ? "bg-card text-primary shadow-sm hover:bg-card/90" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="truncate">Calendar</span>
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            onClick={() => setViewMode("list")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all ${viewMode === "list" ? "bg-card text-primary shadow-sm hover:bg-card/90" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="truncate">List View ({listCount})</span>
          </Button>
          <Button
            variant={viewMode === "no-show" ? "default" : "ghost"}
            onClick={() => setViewMode("no-show")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all ${viewMode === "no-show" ? "bg-destructive/10 text-destructive shadow-sm" : "text-muted-foreground hover:text-red-500 hover:bg-muted/50"}`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="truncate">No Show ({noShowCount})</span>
          </Button>
        </div>
      </div>

      <AppointmentStats appointments={appointments} />

      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        {viewMode === "calendar" && (
          <AppointmentCalendar
            onNewAppointment={handleNewAppointment}
            appointments={[...appointments, ...(noShowAppointments || [])]}
            doctors={activeDoctors}
            searchTerm={specialistSearch}
            setSearchTerm={setSpecialistSearch}
            selectedDoctorId={selectedDoctorId}
            setSelectedDoctorId={setSelectedDoctorId}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onBookAppointment={(
              doctorId: string,
              date: Date,
              time: string,
            ) => {
              const doctor = activeDoctors.find((d: any) => d.id === doctorId);
              setSelectedAppointment({
                doctorId,
                doctorName: doctor?.name,
                date: date.toISOString().split("T")[0],
                time,
              });
              setActiveModal("appointmentForm");
            }}
            onEditAppointment={(apt: any) => {
              setSelectedAppointment(apt);
              setActiveModal("appointmentForm");
            }}
          />
        )}
        {(viewMode === "list" || viewMode === "no-show") && (
          <AppointmentList
            appointments={viewMode === "list" ? appointments.filter((apt: any) => apt.status !== "no-show") : noShowAppointments}
            onEditAppointment={(id: string) => {
              const apt = appointments.find((a: any) => a.id === id) || noShowAppointments?.find((a: any) => a.id === id);
              setSelectedAppointment(apt);
              setActiveModal("appointmentForm");
            }}
            onDeleteAppointment={handleDeleteAppt}
            onUpdateStatus={handleUpdateAppointmentStatus}
            onCheckInPatient={handleCheckInPatient}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            searchValue={apptSearch}
            onSearchChange={setApptSearch}
            apptFilter={apptFilter}
            onFilterChange={setApptFilter}
          />
        )}
      </div>
    </div>
  );
};
