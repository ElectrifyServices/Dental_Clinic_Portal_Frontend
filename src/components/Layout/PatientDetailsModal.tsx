import React from "react";
import { PatientDetails } from "../Patients/PatientDetails";

interface PatientDetailsModalProps {
  patients: any[];
  selectedPatientId: string;
  apiPatientDetail: any;
  appointments: any[];
  treatments: any[];
  invoices: any[];
  onClose: () => void;
  onExport: (id: string) => void;
}

export function PatientDetailsModal({
  patients,
  selectedPatientId,
  apiPatientDetail,
  appointments,
  treatments,
  invoices,
  onClose,
  onExport,
}: PatientDetailsModalProps) {
  const localPatient = patients.find((x: any) => x.id === selectedPatientId);
  const p = apiPatientDetail || localPatient;
  if (!p) return null;

  let family: any[] = [];
  if (p.parentId) {
    const parent = patients.find((x: any) => x.id === p.parentId);
    const siblings = patients.filter(
      (x: any) => x.parentId === p.parentId && x.id !== p.id
    );
    if (parent)
      family.push({
        ...parent,
        relation: parent.isPerson
          ? parent.relation || "Parent"
          : "Head of Family",
      });
    family = [...family, ...siblings];
  } else {
    family = patients.filter((x: any) => x.parentId === p.id);
  }

  return (
    <PatientDetails
      patient={p}
      familyMembers={family}
      appointments={appointments}
      treatments={treatments}
      invoices={invoices}
      onClose={onClose}
      onSendReminder={(_id: string, amt: number) =>
        alert(`Reminder sent for ₹${amt}`)
      }
      onExport={onExport}
    />
  );
}
