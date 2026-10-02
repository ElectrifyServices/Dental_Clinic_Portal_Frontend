import type { ApiAny } from "../../types/api";
import React from "react";
import { PatientDetails } from "../Patients/PatientDetails";

interface PatientDetailsModalProps {
  patients: ApiAny[];
  selectedPatientId: string;
  apiPatientDetail: ApiAny;
  appointments: ApiAny[];
  treatments: ApiAny[];
  invoices: ApiAny[];
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
  const localPatient = patients.find((x: ApiAny) => x.id === selectedPatientId);
  const p = apiPatientDetail || localPatient;
  if (!p) return null;

  let family: ApiAny[] = [];
  if (p.parentId) {
    const parent = patients.find((x: ApiAny) => x.id === p.parentId);
    const siblings = patients.filter(
      (x: ApiAny) => x.parentId === p.parentId && x.id !== p.id
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
    family = patients.filter((x: ApiAny) => x.parentId === p.id);
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
