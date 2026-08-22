import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, LayoutGrid, ListFilter, MessageCircle } from "lucide-react";
import { useAppointmentData } from "../hooks/useAppointmentData";
import { usePatientData } from "../hooks/usePatientData";
import { useModal } from "../contexts/ModalContext";
import { AppointmentCalendar } from "../components/Appointments/AppointmentCalendar";
import { AppointmentList } from "../components/Appointments/AppointmentList";
import { AppointmentStats } from "../components/Appointments/AppointmentList/AppointmentStats";
import { useDoctorsListQuery } from "../hooks/staff/useDoctorsListQuery";
import { useCheckInAppointmentMutation } from "../hooks/appointments/useCheckInAppointmentMutation";
import { useCheckInAfterRegistrationMutation } from "../hooks/appointments/useCheckInAfterRegistrationMutation";
import { toast, PageHeader } from "../components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/Dialog";
import { Label } from "../components/ui/Label";
import { useDebounce } from "../hooks/useDebounce";
import { getLocalDateString } from "../utils/dateUtils";

export const AppointmentsPage: React.FC = () => {
  const {
    appointments,
    noShowAppointments,
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
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = useAppointmentData({ loadAll: true });

  const { patients, setQueuedPatients } = usePatientData();
  const {
    setActiveModal,
    setSelectedAppointment,
    confirmDelete,
    setPendingCheckInAppt,
    setSelectedPatientId,
    setWhatsappPhone,
    setWhatsappPatientName,
  } = useModal();

  const [viewMode, setViewMode] = useState("calendar");
  const [checkingInApptId, setCheckingInApptId] = useState<string | null>(null);
  const [specialistSearch, setSpecialistSearch] = useState("");
  const debouncedSpecialistSearch = useDebounce(specialistSearch, 500);

  const [specialistPage, setSpecialistPage] = useState(1);
  const [specialistLimit, setSpecialistLimit] = useState(5);

  const [noShowApptId, setNoShowApptId] = useState<string | null>(null);
  const [noShowReason, setNoShowReason] = useState("");

  const handleUpdateStatusWrapper = async (id: string, status: string, reason?: string) => {
    if (status === 'no-show') {
      setNoShowApptId(id);
      setNoShowReason("");
    } else {
      await handleUpdateAppointmentStatus(id, status, reason);
    }
  };

  const {
    doctors: activeDoctors,
    refetch: refetchDoctors,
    total: totalSpecialists,
    totalPages: totalSpecialistPages
  } = useDoctorsListQuery(debouncedSpecialistSearch, specialistPage, specialistLimit);

  useEffect(() => {
    setSpecialistPage(1);
  }, [debouncedSpecialistSearch]);

  useEffect(() => {
    if (refetchAppointments) {
      refetchAppointments();
    }
    if (refetchDoctors) {
      refetchDoctors();
    }
  }, [refetchAppointments, refetchDoctors]);

  // Sync selectedDate from Calendar view to startDate
  useEffect(() => {
    if (viewMode === "calendar" && selectedDate) {
      setStartDate(selectedDate);
      setEndDate("");
    }
  }, [selectedDate, viewMode]);



  const isMatchingDate = (dateStr: string) => {
    if (!selectedDate) return true;
    const aDateString = typeof dateStr === 'string' && dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
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
    try {
      const response = await checkInAppointment({ id: appt.id });
      setPendingCheckInAppt(appt);
      
      const responseData = response?.data ?? response;
      const requiresRegistration = responseData?.requires_registration ?? responseData?.requiresRegistration ?? true;
      const patientId = responseData?.patient_id ?? responseData?.patientId;

      if (!requiresRegistration && patientId) {
        setSelectedPatientId(patientId);
        setActiveModal("patientForm");
        toast.success("Please verify patient details before check-in");
      } else {
        setActiveModal("patientNotFound");
      }
    } catch (err) {
      toast.error("Failed to update appointment check-in status");
    }
  };

  const { mutateAsync: checkInAfterRegistration } = useCheckInAfterRegistrationMutation();

  const handleDirectCheckInPatient = async (appt: any) => {
    setCheckingInApptId(appt.id);
    try {
      // First update the appointment status
      const response = await checkInAppointment({ id: appt.id });
      
      const rawName = appt.patientName || (typeof appt.patient === 'object' ? appt.patient?.name : appt.patient) || "";
      const sName = String(rawName).toLowerCase().trim();
      const sPhone = (appt.patientPhone || appt.phone || "").trim();
      
      const responseData = response?.data ?? response;
      let patientId = responseData?.patient_id ?? responseData?.patientId ?? appt.patientId ?? appt.patient_id;
      const requiresRegistration = responseData?.requires_registration ?? responseData?.requiresRegistration ?? false;

      if (!patientId && !requiresRegistration) {
        const existing = patients.find(
          (p: any) =>
            (p.phone || "").trim() === sPhone &&
            (p.name || "").toLowerCase().trim() === sName,
        );
        if (existing) {
          patientId = existing.id;
        }
      }

      if (patientId && !requiresRegistration) {
        // Add to local queue
        setQueuedPatients((prev: any[]) => [
          ...prev,
          {
            id: appt.id,
            patientId: patientId,
            patientName: rawName,
            patientPhone: sPhone,
            appointmentTime: appt.time,
            status: "waiting",
            treatmentType: appt.treatment || appt.type,
            patientConcern: appt.patientConcern || "",
          },
        ]);
        
        // Notify backend of the checkin to create consultation
        try {
          await checkInAfterRegistration({
            id: appt.id,
            patient_id: patientId
          });
        } catch (err) {
          toast.error("Failed to add patient to consultation queue");
        }
        
        toast.success("Patient checked in directly");
      } else {
        setPendingCheckInAppt(appt);
        setActiveModal("patientNotFound");
      }
    } catch (err) {
      toast.error("Failed to check in patient directly");
    } finally {
      setCheckingInApptId(null);
    }
  };

  return (
    <div className="space-y-3">
      <PageHeader
        title="Appointments"
        subtitle="Schedule and manage patient visits"
      >
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center justify-between gap-1 bg-muted/50 p-1 rounded-xl sm:rounded-2xl shrink-0">
            <Button
              variant="ghost"
              onClick={() => setViewMode("calendar")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all ${viewMode === "calendar" ? "bg-card text-primary shadow-sm hover:bg-card/90" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="truncate">Calendar</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setViewMode("list")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all ${viewMode === "list" ? "bg-card text-primary shadow-sm hover:bg-card/90" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="truncate">List View ({listCount})</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setViewMode("no-show")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all ${viewMode === "no-show" ? "bg-destructive/10 text-destructive shadow-sm hover:bg-destructive/20" : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"}`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="truncate">No Show ({noShowCount})</span>
            </Button>
          </div>
        </div>
      </PageHeader>

      <AppointmentStats appointments={appointments} startDate={startDate} endDate={endDate} doctorId={selectedDoctorId} />

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
            specialistPage={specialistPage}
            setSpecialistPage={setSpecialistPage}
            specialistLimit={specialistLimit}
            setSpecialistLimit={setSpecialistLimit}
            totalSpecialists={totalSpecialists}
            totalSpecialistPages={totalSpecialistPages}
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
                date: getLocalDateString(date),
                time,
              });
              setActiveModal("appointmentForm");
            }}
            onEditAppointment={(apt: any) => {
              setSelectedAppointment(apt);
              setActiveModal("appointmentForm");
            }}
            onDirectCheckIn={handleDirectCheckInPatient}
            checkingInApptId={checkingInApptId}
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
            onUpdateStatus={handleUpdateStatusWrapper}
            onCheckInPatient={handleCheckInPatient}
            onDirectCheckIn={handleDirectCheckInPatient}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            searchValue={apptSearch}
            onSearchChange={setApptSearch}
            apptFilter={apptFilter}
            onFilterChange={setApptFilter}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            checkingInApptId={checkingInApptId}
          />
        )}
      </div>

      {noShowApptId && (
        <Dialog open={!!noShowApptId} onOpenChange={(open) => !open && setNoShowApptId(null)}>
          <DialogContent className="sm:max-w-[425px] rounded-2xl border border-border bg-card shadow-2xl p-6">
            <DialogHeader className="text-left">
              <DialogTitle className="text-base font-bold text-foreground">Mark as No-Show</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Please enter the reason for marking this appointment as No-Show.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-xs font-bold text-muted-foreground">
                  No-Show Reason <span className="text-destructive font-black">*</span>
                </Label>
                <textarea
                  id="reason"
                  placeholder="Enter reason (e.g. Patient didn't answer call, emergency, etc.)"
                  value={noShowReason}
                  onChange={(e) => setNoShowReason(e.target.value)}
                  className="w-full min-h-[100px] px-3.5 py-2.5 text-sm border border-border rounded-xl bg-muted/40 focus:bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium resize-none"
                  required
                />
              </div>
            </div>
            <DialogFooter className="flex flex-row justify-end gap-2 mt-2">
              <Button
                variant="outline"
                onClick={() => setNoShowApptId(null)}
                className="h-10 rounded-xl px-4 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                disabled={!noShowReason.trim()}
                onClick={async () => {
                  if (noShowReason.trim()) {
                    await handleUpdateAppointmentStatus(noShowApptId, 'no-show', noShowReason.trim());
                    setNoShowApptId(null);
                  }
                }}
                className="h-10 rounded-xl px-4 text-xs font-semibold bg-destructive hover:bg-destructive/90 text-white"
              >
                Mark No-Show
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
