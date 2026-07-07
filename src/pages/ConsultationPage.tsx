// pages/ConsultationPage.tsx
import React, { useMemo, useEffect, useState } from "react";
import { useConsultationData } from "../hooks/useConsultationData";
import { useModal } from "../contexts/ModalContext";
import { useAuth } from "../contexts/AuthContext";
import { usePatientData } from "../hooks/usePatientData";
import { useStaffData } from "../hooks/useStaffData";
import { useAppointmentData } from "../hooks/useAppointmentData";
import { PatientQueue } from "../components/Doctor/PatientQueue";
import { useDebounce } from "../hooks/useDebounce";
import { Loader2 } from "lucide-react";
import { Loading } from "@/components/ui";

export const ConsultationPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { patients } = usePatientData();
  const { staffMembers } = useStaffData();
  const { appointments } = useAppointmentData();

  const {
    consultations,
    handleUpdatePatientStatus,
    handleSaveConsultation,
    handleCompleteConsultation,
    isLoading,
    refetch,
    updateFilters,
    totalItems,
    totalPages,
    currentPage,
    handlePageChange
  } = useConsultationData();

  const queuedPatients = useMemo(() => {
    return consultations.map((c: any) => {
      let status = (c.status || "").toUpperCase();
      if (status === "WAITING" || status === "SCHEDULED") status = "PENDING";
      else if (status === "IN-CONSULTATION" || status === "CONSULTING") status = "IN_PROGRESS";

      return {
        id: c.id,
        patientId: c.patientId || c.patient_id,
        appointmentId: c.appointmentId || c.appointment_id || "",
        patientName: c.patientName,
        patientPhone: c.patientPhone,
        appointmentTime: c.appointmentTime || new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        treatmentType: c.treatmentType || c.diagnosis || "General Consultation",
        patientConcern: c.patientConcern || c.observations || "",
        checkInTime: new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: status,
        slotDurationMins: c.slotDurationMins,
        specificTreatment: c.specificTreatment,
        appointmentNotes: c.appointmentNotes,
        appointmentCost: c.appointmentCost,
      };
    });
  }, [consultations]);

  const {
    setActiveModal,
    setSelectedPatientForDiagnose,
    setPatientFormType,
    setSelectedPatientId,
    setPreFilledPatientData,
    doctorAvailability,
    showToast,
  } = useModal();

  const { state } = useAuth();

  // Fetch consultations and sync filter updates with useConsultationData
  useEffect(() => {
    const apiStatus = filterStatus === "ALL"
      ? undefined
      : filterStatus === "PENDING"
        ? ["PENDING"]
        : filterStatus === "IN_PROGRESS"
          ? ["IN_PROGRESS"]
          : filterStatus === "COMPLETED"
            ? ["COMPLETED"]
            : undefined;

    updateFilters({
      search: debouncedSearch || undefined,
      filters: apiStatus ? { status: apiStatus } : undefined
    });
  }, [debouncedSearch, filterStatus, updateFilters]);

  const activeDoctors = useMemo(
    () => staffMembers.filter((s: any) => s.role === "doctor" || s.role === "admin"),
    [staffMembers]
  );

  const handleSelectPatient = (p: any) => {
    const bg = patients.find((bp: any) => bp.phone === p.patientPhone);
    setSelectedPatientForDiagnose({
      ...p,
      phone: p.patientPhone,
      patientHistory: bg
        ? {
          medicalHistory: bg.medicalHistory || [],
          allergies: bg.allergies || [],
          gender: bg.gender || "",
          dateOfBirth: bg.dateOfBirth || "",
          bloodGroup: bg.bloodGroup || "",
        }
        : undefined,
    });
    setActiveModal("diagnoseForm");
  };

  const handleEditConsultation = (p: any) => {
    const bg = patients.find((bp: any) => bp.phone === p.patientPhone);
    setSelectedPatientForDiagnose({
      ...p,
      consultationId: p.id,
      isEditMode: true,
      phone: p.patientPhone,
      patientHistory: bg
        ? {
          medicalHistory: bg.medicalHistory || [],
          allergies: bg.allergies || [],
          gender: bg.gender || "",
          dateOfBirth: bg.dateOfBirth || "",
          bloodGroup: bg.bloodGroup || "",
        }
        : undefined,
    });
    setActiveModal("diagnoseForm");
  };

  const handleDirectConsultation = (
    name: string,
    phone: string,
    dId?: string,
    dName?: string,
    time?: string
  ) => {
    const trimmedName = (name || "").trim();
    const cleanPhone = (phone || "").replace(/\D/g, "");

    const ex = (trimmedName && cleanPhone) ? patients.find(
      (p: any) =>
        p.name.toLowerCase() === trimmedName.toLowerCase() &&
        p.phone.replace(/\D/g, "") === cleanPhone
    ) : null;

    if (ex) {
      setSelectedPatientForDiagnose({
        id: `WALK-${Date.now()}`,
        patientId: ex.id,
        patientName: ex.name,
        patientPhone: ex.phone,
        phone: ex.phone,
        treatmentType: ex.treatmentType || "General Consultation",
        patientConcern: "",
        status: "in-consultation",
        doctorId: dId || state.user?.id || "1",
        doctorName: dName || state.user?.name || "Doctor",
        appointmentTime: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        patientHistory: {
          medicalHistory: ex.medicalHistory || [],
          allergies: ex.allergies || [],
          gender: ex.gender || "",
          dateOfBirth: ex.dateOfBirth || "",
          bloodGroup: ex.bloodGroup || "",
        },
      });
      setActiveModal("diagnoseForm");
    } else {
      setSelectedPatientForDiagnose({
        id: `WALK-${Date.now()}`,
        patientId: "",
        patientName: trimmedName,
        patientPhone: phone || "",
        phone: phone || "",
        treatmentType: "General Consultation",
        patientConcern: "",
        status: "in-consultation",
        doctorId: dId || state.user?.id || "1",
        doctorName: dName || state.user?.name || "Doctor",
        appointmentTime: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDirect: true,
        patientHistory: {
          medicalHistory: [],
          allergies: [],
        },
      });
      setActiveModal("diagnoseForm");
    }
  };

  const handleRegisterNew = (name: string, phone: string) => {
    setPatientFormType("normal");
    setSelectedPatientId("");
    setPreFilledPatientData({ name, phone });
    setActiveModal("patientForm");
  };

  // Called when the doctor completes a consultation from the modal
  const onCompleteConsultation = async (consultationData: any) => {
    try {
      // Map tooth chart state to tooth_findings array
      const tooth_findings = Object.entries(consultationData.toothChartState || {}).map(([toothNum, condition]) => ({
        tooth_number: parseInt(toothNum),
        condition: condition
      }));

      // Map treatment plans to treatments array
      const treatments = (consultationData.treatmentPlans || []).map((tp: any) => ({
        tooth_number: parseInt(tp.tooth),
        procedure: tp.procedure,
        total_sessions: parseInt(tp.sessions || tp.total_sessions || tp.totalSessions) || 1,
        est_cost: parseFloat(tp.cost) || 0,
        is_active: tp.isActive ?? true
      }));

      // Map prescriptions array
      const prescriptions = (consultationData.prescriptions || [])
        .filter((p: any) => p.medicine)
        .map((p: any) => ({
          medicine_name: p.medicine,
          dosage: p.dosage,
          timing: p.timing,
          frequency: p.frequency,
          duration: parseInt(p.duration) || 1,
          duration_type: p.durationUnit || 'days',
          qty: parseInt(p.qty) || 1,
          instructions: p.instructions || ''
        }));

      const resolvedPatientId = consultationData.patientId;
      const isWalkIn = resolvedPatientId && String(resolvedPatientId).startsWith("WALK-");
      const apiPayload: any = {
        patientId: isWalkIn ? undefined : resolvedPatientId,
        patient_name: isWalkIn
          ? (consultationData.patientName || consultationData.name || consultationData.directPatientName)
          : (consultationData.isDirect && !resolvedPatientId ? consultationData.directPatientName : undefined),
        patient_phone: isWalkIn
          ? (consultationData.patientPhone || consultationData.phone || consultationData.directPatientPhone)
          : (consultationData.isDirect && !resolvedPatientId ? consultationData.directPatientPhone : undefined),
        appointmentId: consultationData.appointmentId,
        observations: consultationData.observations,
        diagnosis: consultationData.diagnosis,
        treatmentPlan: consultationData.treatmentPlan,
        treatmentCost: consultationData.treatmentCost,
        followUpRequired: consultationData.followUpRequired,
        consultationNotes: consultationData.consultationNotes,
        status: "COMPLETED",
        toothFindings: tooth_findings,
        treatments: treatments,
        prescriptions: prescriptions
      };

      if (consultationData.followUpRequired) {
        apiPayload.appointment_info = {
          patient_id: isWalkIn ? undefined : resolvedPatientId,
          doctor_id: consultationData.followUpDoctorId,
          date: consultationData.followUpDate,
          start_time: consultationData.followUpTime,
          slot_duration_mins: 15
        };
      }

      // Create the consultation using POST by passing the payload without an ID
      await handleSaveConsultation(apiPayload);

      showToast("Consultation completed successfully", "success");
      setActiveModal(null);
    } catch (err: any) {
      let errorMessage = "Failed to save consultation";
      if (err?.response?.data?.message) {
        errorMessage = Array.isArray(err.response.data.message)
          ? err.response.data.message.join(", ")
          : err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      showToast(errorMessage, "error");
      throw err;
    }
  };

  if (isLoading) {
    return <Loading type="spinner" text="Loading consultations..." />;
  }

  return (
    <div className="space-y-6">
      <PatientQueue
        doctorName={state.user?.name || "Doctor"}
        queuedPatients={queuedPatients}
        onSelectPatient={handleSelectPatient}
        onEditConsultation={handleEditConsultation}
        onUpdatePatientStatus={handleUpdatePatientStatus}
        onDirectConsultation={handleDirectConsultation}
        onRegisterNew={handleRegisterNew}
        patients={patients}
        doctors={activeDoctors}
        appointments={appointments}
        doctorAvailability={doctorAvailability}
        onUpdateConsultation={onCompleteConsultation}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ConsultationPage;