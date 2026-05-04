import React from 'react';
import { PatientQueue } from '../components/Doctor/PatientQueue';

interface QueuePageProps {
  doctorName: string;
  queuedPatients: any[];
  onSelectPatient: (patient: any) => void;
  onUpdatePatientStatus: (id: string, status: string) => void;
  onDirectConsultation: (name: string, phone: string, doctorId?: string, doctorName?: string, time?: string) => void;
  onRegisterNew: (name: string, phone: string) => void;
  patients: any[];
  doctors: any[];
  appointments: any[];
  doctorAvailability: { [key: string]: boolean };
}

export const QueuePage: React.FC<QueuePageProps> = ({
  doctorName,
  queuedPatients,
  onSelectPatient,
  onUpdatePatientStatus,
  onDirectConsultation,
  onRegisterNew,
  patients,
  doctors,
  appointments,
  doctorAvailability
}) => {
  return (
    <div className="space-y-6">
      {/* <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Patient Diagnosis Queue
        </h1>
        <p className="text-gray-600 mt-1">
          Manage patients waiting for consultation
        </p>
      </div> */}
      <PatientQueue
        doctorName={doctorName}
        queuedPatients={queuedPatients}
        onSelectPatient={onSelectPatient}
        onUpdatePatientStatus={onUpdatePatientStatus}
        onDirectConsultation={onDirectConsultation}
        onRegisterNew={onRegisterNew}
        patients={patients}
        doctors={doctors}
        appointments={appointments}
        doctorAvailability={doctorAvailability}
      />
    </div>
  );
};
