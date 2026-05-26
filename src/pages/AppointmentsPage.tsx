import React, { useState, useMemo } from "react";
import { AlertTriangle, LayoutGrid, ListFilter } from "lucide-react";
import { useAppData } from "../hooks/useAppData";
import { useModal } from "../contexts/ModalContext";
import { AppointmentCalendar } from "../components/Appointments/AppointmentCalendar";
import { AppointmentList } from "../components/Appointments/AppointmentList";
import { AppointmentStats } from "../components/Appointments/AppointmentList/AppointmentStats";
import { useDoctorsListQuery } from "../hooks/staff/useDoctorsListQuery";

export const AppointmentsPage: React.FC = () => {
  const {
    appointments,
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
  } = useModal();

  const [viewMode, setViewMode] = useState("calendar");

  const { doctors: activeDoctors } = useDoctorsListQuery();

  const listCount = appointments.filter(
    (a: any) => a.status !== "no-show",
  ).length;

  const handleNewAppointment = (date?: any) => {
    setSelectedAppointment(date ? { date } : null);
    setActiveModal("appointmentForm");
  };

  const handleDeleteAppt = (id: string) => {
    const apt = appointments.find((a: any) => a.id === id);
    confirmDelete(
      "Delete Appointment",
      `Delete appointment for ${apt?.patientName || "this patient"}?`,
      () => handleDeleteAppointment(id),
    );
  };

  const handleCheckInPatient = (appt: any) => {
    const sName = (appt.patientName || appt.patient || "").toLowerCase().trim();
    const sPhone = (appt.patientPhone || appt.phone || "").trim();
    const existing = patients.find(
      (p: any) =>
        (p.phone || "").trim() === sPhone &&
        (p.name || "").toLowerCase().trim() === sName,
    );
    setPendingCheckInAppt(appt);
    if (existing) {
      setSelectedPatientId(existing.id);
      setActiveModal("patientForm");
      alert("Please verify patient details before check-in");
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
            No Show
          </button>
        </div>
      </div>

      <AppointmentStats appointments={appointments} />

      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        {viewMode === "calendar" && (
          <AppointmentCalendar
            onNewAppointment={handleNewAppointment}
            appointments={appointments}
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
            appointments={appointments.filter((apt: any) =>
              viewMode === "list"
                ? apt.status !== "no-show"
                : apt.status === "no-show",
            )}
            onEditAppointment={(id: string) => {
              const apt = appointments.find((a: any) => a.id === id);
              setSelectedAppointment(apt);
              setActiveModal("appointmentForm");
            }}
            onDeleteAppointment={handleDeleteAppt}
            onUpdateStatus={handleUpdateAppointmentStatus}
            onCheckInPatient={handleCheckInPatient}
          />
        )}
      </div>
    </div>
  );
};
