import React, { useMemo } from "react";
import { useAppData } from "../hooks/useAppData";
import { useModal } from "../contexts/ModalContext";
import { useAuth } from "../contexts/AuthContext";
import { PatientQueue } from "../components/Doctor/PatientQueue";
import { useUpdateConsultationMutation } from "../hooks/consultation/useUpdateConsultationMutation";

export const QueuePage: React.FC = () => {
  const {
    queuedPatients, setQueuedPatients,
    patients, appointments, staffMembers,
    handleUpdateConsultation,
  } = useAppData();
  const {
    setActiveModal, setSelectedPatientForDiagnose,
    setPatientFormType, setSelectedPatientId, setPreFilledPatientData,
    doctorAvailability,
  } = useModal();
  const { state } = useAuth();
  const { mutateAsync: updateConsultation } = useUpdateConsultationMutation();

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

  const handleDirectConsultation = (
    name: string, phone: string, dId?: string, dName?: string, time?: string
  ) => {
    const trimmedName = (name || "").trim();
    const cleanPhone = (phone || "").replace(/\D/g, "");

    const ex = (trimmedName && cleanPhone) ? patients.find(
      (p: any) =>
        p.name.toLowerCase() === trimmedName.toLowerCase() &&
        p.phone.replace(/\D/g, "") === cleanPhone
    ) : null;

    const fallbackDocId = dId || (activeDoctors.some((d: any) => d.id === state.user?.id) ? state.user?.id : activeDoctors[0]?.id) || "";
    const fallbackDocName = dName || (activeDoctors.find((d: any) => d.id === fallbackDocId)?.name) || state.user?.name || "Doctor";

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
        doctorId: fallbackDocId,
        doctorName: fallbackDocName,
        appointmentTime: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        // Was missing here (present in the "new patient" branch below) —
        // without it, PatientConsultation treats this as a regular queue
        // consultation and skips resolving the logged-in doctor, falling
        // back to whatever doctorId happens to be, including the "1" stub.
        isDirect: true,
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
        doctorId: fallbackDocId,
        doctorName: fallbackDocName,
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

  return (
    <div className="space-y-6">
      <PatientQueue
        doctorName={state.user?.name || "Doctor"}
        queuedPatients={queuedPatients}
        onSelectPatient={handleSelectPatient}
        onUpdatePatientStatus={async (id: string, s: string) => {
          setQueuedPatients((prev: any[]) =>
            prev.map((p: any) => (p.id === id ? { ...p, status: s } : p))
          );
          const isExistingBackend = id && !String(id).startsWith("WALK-");
          if (isExistingBackend) {
            try {
              await updateConsultation({ id, status: s } as any);
            } catch (err) {
            }
          }
        }}
        onDirectConsultation={handleDirectConsultation}
        onRegisterNew={handleRegisterNew}
        patients={patients}
        doctors={activeDoctors}
        appointments={appointments}
        doctorAvailability={doctorAvailability}
        onUpdateConsultation={handleUpdateConsultation}
      />
    </div>
  );
};
