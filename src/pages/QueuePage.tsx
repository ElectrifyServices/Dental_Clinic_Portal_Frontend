import React from 'react';
import { PatientQueue } from '../components/Doctor/PatientQueue';

interface QueuePageProps {
  doctorName: string;
  queuedPatients: any[];
  onSelectPatient: (patient: any) => void;
  onUpdatePatientStatus: (id: string, status: string) => void;
}

export const QueuePage: React.FC<QueuePageProps> = ({
  doctorName,
  queuedPatients,
  onSelectPatient,
  onUpdatePatientStatus
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Patient Diagnosis Queue
        </h1>
        <p className="text-gray-600 mt-1">
          Manage patients waiting for consultation
        </p>
      </div>
      <PatientQueue
        doctorName={doctorName}
        queuedPatients={queuedPatients}
        onSelectPatient={onSelectPatient}
        onUpdatePatientStatus={onUpdatePatientStatus}
      />
    </div>
  );
};
