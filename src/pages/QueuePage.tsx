import React, { useMemo } from "react";

/** A queue row exactly as PatientQueue defines it. */
type QueuedPatientRow = Parameters<
  React.ComponentProps<typeof PatientQueue>["onSelectPatient"]
>[0];

/** The same row while it is only held in local state, where `status` is still
 *  a plain string coming from the UI. */
interface QueueStateRow {
  id: string;
  [key: string]: unknown;
}

/** A staff member, narrowed to the fields this page filters on. */
interface StaffRow {
  role?: string;
}
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
    () => staffMembers.filter((s: StaffRow) => s.role === "doctor" || s.role === "admin"),
    [staffMembers]
  );

  const handleSelectPatient = (p: QueuedPatientRow) => {
    const bg = patients.find((bp) => bp.phone === p.patientPhone);
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
      (p) =>
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

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <PatientQueue
        doctorName={state.user?.name || "Doctor"}
        queuedPatients={queuedPatients}
        onSelectPatient={handleSelectPatient}
        onUpdatePatientStatus={async (id: string, s: string) => {
          setQueuedPatients((prev: QueueStateRow[]) =>
            prev.map((p) => (p.id === id ? { ...p, status: s } : p))
          );
          const isExistingBackend = id && !String(id).startsWith("WALK-");
          if (isExistingBackend) {
            try {
              await updateConsultation({ id, status: s } as Parameters<typeof updateConsultation>[0]);
            } catch {
              /* status is already updated locally; a failed sync is non-fatal */
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
