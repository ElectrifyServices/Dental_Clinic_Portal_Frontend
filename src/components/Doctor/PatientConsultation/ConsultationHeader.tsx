import React from "react";
import { X, Stethoscope, User } from "lucide-react";

interface Patient {
  id: string;
  patientName: string;
  phone?: string;
  treatmentType: string;
  patientConcern: string;
  category?: string;
  defaultDiscount?: number;
  patientHistory?: {
    medicalHistory: string[];
    allergies: string[];
    gender?: string;
    dateOfBirth?: string;
  };
}

interface ConsultationHeaderProps {
  patient: Patient;
  onClose: () => void;
}

export function ConsultationHeader({ patient, onClose }: ConsultationHeaderProps) {
  const calculateAge = (dob: string): string => {
    if (!dob) return "?";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age.toString();
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mr-4">
              <Stethoscope className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Patient Consultation
              </h2>
              <p className="text-gray-600">
                {patient.patientName} - {patient.treatmentType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="px-6 pt-6 space-y-6">
        {patient.category && patient.category !== 'regular' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="bg-amber-100 p-3 rounded-full text-amber-600">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 uppercase tracking-widest">
                {patient.category.toUpperCase()} PATIENT DETECTED
              </h4>
              <p className="text-xs text-amber-700 font-medium">
                Eligible for {patient.defaultDiscount || 100}% discount. Please manage billing accordingly.
              </p>
            </div>
            <div className="ml-auto bg-amber-200/50 px-3 py-1 rounded-lg text-[10px] font-bold text-amber-800 uppercase border border-amber-300">
              Special Category
            </div>
          </div>
        )}

        {/* Patient Information Summary */}
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">Patient Name</p>
              <p className="text-lg font-bold text-blue-900">{patient.patientName}</p>
              <div className="flex gap-4 mt-2">
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase">Age / Gender</p>
                  <p className="text-sm font-bold text-blue-900">
                    {patient.patientHistory?.dateOfBirth ? calculateAge(patient.patientHistory.dateOfBirth) : "?"}Y / {patient.patientHistory?.gender || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase">Phone</p>
                  <p className="text-sm font-bold text-blue-900">{patient.phone || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Treatment & Concern */}
            <div>
              <div className="mb-3">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">Treatment Type</p>
                <p className="text-sm font-bold text-blue-900">{patient.treatmentType || "General Consultation"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">Patient Concern</p>
                <p className="text-sm font-medium text-blue-800 italic leading-tight">"{patient.patientConcern || "No concern recorded"}"</p>
              </div>
            </div>

            {/* Medical Alerts */}
            <div className="md:col-span-2 lg:col-span-1">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">Medical Alerts & History</p>
              {patient.patientHistory && (patient.patientHistory.allergies.length > 0 || patient.patientHistory.medicalHistory.length > 0) ? (
                <div className="bg-red-50 p-3 rounded-xl border border-red-100 space-y-1">
                  {patient.patientHistory.allergies.length > 0 && (
                    <div className="text-[11px] text-red-700">
                      <strong className="uppercase text-[9px] mr-1">Allergies:</strong> {patient.patientHistory.allergies.join(", ")}
                    </div>
                  )}
                  {patient.patientHistory.medicalHistory.length > 0 && (
                    <div className="text-[11px] text-red-700">
                      <strong className="uppercase text-[9px] mr-1">History:</strong> {patient.patientHistory.medicalHistory.join(", ")}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm font-medium text-blue-400 italic">No medical history recorded</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
