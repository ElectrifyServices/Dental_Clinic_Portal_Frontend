import React, { useState, useMemo, useEffect } from "react";
import { AlertTriangle, LayoutGrid, ListFilter } from "lucide-react";
import { useAppData } from "../hooks/useAppData";
import { useModal } from "../contexts/ModalContext";
import { AppointmentCalendar } from "../components/Appointments/AppointmentCalendar";
import { AppointmentList } from "../components/Appointments/AppointmentList";
import { AppointmentStats } from "../components/Appointments/AppointmentList/AppointmentStats";
import { useDoctorsListQuery } from "../hooks/staff/useDoctorsListQuery";
import { useCheckInAppointmentMutation } from "../hooks/appointments/useCheckInAppointmentMutation";

export const AppointmentsPage: React.FC = () => {
  const {
    appointments,
    noShowAppointments,
    staffMembers,
    patients,
    handleDeleteAppointment,
    handleUpdateAppointmentStatus,
  } = useAppData();
  const {
    setActiveModal,
    setSelectedAppointment,
    confirmDelete,
    setPendingCheckInAppt,
    setSelectedPatientId,
    showToast,
  } = useModal();

  const [viewMode, setViewMode] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const { doctors: activeDoctors } = useDoctorsListQuery();

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
    const sName = (appt.patientName || appt.patient || "").toLowerCase().trim();
    const sPhone = (appt.patientPhone || appt.phone || "").trim();
    const existing = patients.find(
      (p: any) =>
        (p.phone || "").trim() === sPhone &&
        (p.name || "").toLowerCase().trim() === sName,
    );
    try {
      await checkInAppointment({ id: appt.id });
    } catch (err) {
      console.error("Failed to check-in appointment:", err);
    }
    setPendingCheckInAppt(appt);
    if (existing) {
      setSelectedPatientId(existing.id);
      setActiveModal("patientForm");
      showToast("Please verify patient details before check-in");
    } else {
      setActiveModal("patientNotFound");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/40 backdrop-blur-md p-4 rounded-[2rem] border border-white/50 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Appointments
          </h1>
          <p className="text-muted-foreground font-medium">
            Schedule and manage patient visits
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl">
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === "calendar" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="w-4 h-4" />
            Calendar
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === "list" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <ListFilter className="w-4 h-4" />
            List View ({listCount})
          </button>
          <button
            onClick={() => setViewMode("no-show")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === "no-show" ? "bg-destructive/10 text-destructive shadow-sm" : "text-muted-foreground hover:text-red-500"}`}
          >
            <AlertTriangle className="w-4 h-4" />
            No Show ({noShowCount})
          </button>
        </div>
      </div>

      <AppointmentStats appointments={appointments} />

      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        {viewMode === "calendar" && (
          <AppointmentCalendar
            onNewAppointment={handleNewAppointment}
            appointments={[...appointments, ...(noShowAppointments || [])]}
            doctors={activeDoctors}
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
          />
        )}
      </div>
    </div>
  );
};
