import React from "react";

export const processPatientCheckIn = (
  appointment: any,
  patients: any[],
  setQueuedPatients: React.Dispatch<React.SetStateAction<any[]>>,
  handleUpdateAppointmentStatus: (id: string, status: string) => void,
  setPendingCheckInAppt: React.Dispatch<any>,
  setShowPatientNotFound: React.Dispatch<React.SetStateAction<boolean>>
) => {
  console.log(
    "Check-in attempt for:",
    appointment.patientName,
    "Phone:",
    appointment.patientPhone || appointment.phone,
  );
  const searchName = (appointment.patientName || appointment.patient || "")
    .toLowerCase()
    .trim();
  const searchPhone = (
    appointment.patientPhone ||
    appointment.phone ||
    ""
  ).trim();

  const existingPatient = patients.find((p) => {
    const pName = (p.name || "").toLowerCase().trim();
    const pPhone = (p.phone || "").trim();
    return pPhone === searchPhone && pName === searchName;
  });

  if (!existingPatient) {
    console.log(
      "No matching patient found for name:",
      searchName,
      "and phone:",
      searchPhone,
    );
    setPendingCheckInAppt(appointment);
    setShowPatientNotFound(true);
    return;
  }

  const queuedPatient = {
    id: appointment.id,
    patientId: existingPatient.id,
    patientName: existingPatient.name, // Use the name from the database
    patientPhone: existingPatient.phone, // Use the phone from the database
    appointmentTime: appointment.time,
    status: "waiting",
    treatmentType: appointment.treatment || appointment.type,
  };
  setQueuedPatients((prev) => {
    const exists = prev.some(p => p.id === queuedPatient.id);
    if (exists) return prev;
    return [...prev, queuedPatient];
  });
  handleUpdateAppointmentStatus(appointment.id, "checked-in");
  alert(`Patient "${existingPatient.name}" checked in successfully.`);
};
