import React from "react";
import { Pill, Plus, Trash2 } from "lucide-react";

interface Prescription {
  id: string;
  medicine: string;
  dosage: string;
  timing: string;
  frequency: string;
  duration: string;
  durationUnit: string;
  qty: string;
}

interface PrescriptionFormProps {
  prescriptions: Prescription[];
  onAddPrescription: () => void;
  onRemovePrescription: (id: string) => void;
  onUpdatePrescription: (id: string, field: string, value: string) => void;
}

export function PrescriptionForm({
  prescriptions,
  onAddPrescription,
  onRemovePrescription,
  onUpdatePrescription
}: PrescriptionFormProps) {
  return (
    <div className="px-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center">
          <Pill className="w-5 h-5 mr-2 text-green-600" />
          Prescriptions
        </h3>
        <button
          type="button"
          onClick={onAddPrescription}
          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 flex items-center text-sm font-medium transition-all duration-200 shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Medicine
        </button>
      </div>

      <div className="space-y-4">
        {prescriptions.map((prescription) => (
          <div
            key={prescription.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-green-50 rounded-xl border border-green-200 shadow-sm animate-in fade-in zoom-in duration-200"
          >
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wider">
                Medicine Name
              </label>
              <input
                type="text"
                value={prescription.medicine}
                onChange={(e) => onUpdatePrescription(prescription.id, "medicine", e.target.value)}
                className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-card"
                placeholder="e.g. Paracetamol"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wider">
                Dosage
              </label>
              <select
                value={prescription.dosage}
                onChange={(e) => onUpdatePrescription(prescription.id, "dosage", e.target.value)}
                className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-card"
              >
                <option value="">Select</option>
                <option value="1-0-0">1 - 0 - 0</option>
                <option value="0-1-0">0 - 1 - 0</option>
                <option value="0-0-1">0 - 0 - 1</option>
                <option value="1-1-0">1 - 1 - 0</option>
                <option value="1-0-1">1 - 0 - 1</option>
                <option value="0-1-1">0 - 1 - 1</option>
                <option value="1-1-1">1 - 1 - 1</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wider">
                Timing
              </label>
              <input
                type="text"
                value={prescription.timing}
                onChange={(e) => onUpdatePrescription(prescription.id, "timing", e.target.value)}
                className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-card"
                placeholder="After meals"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wider">
                Frequency
              </label>
              <input
                type="text"
                value={prescription.frequency}
                onChange={(e) => onUpdatePrescription(prescription.id, "frequency", e.target.value)}
                className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-card"
                placeholder="3 times daily"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wider">
                Duration
              </label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={prescription.duration}
                  onChange={(e) => onUpdatePrescription(prescription.id, "duration", e.target.value)}
                  min="1"
                  className="w-16 px-2 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-card text-center"
                  placeholder="5"
                />
                <select
                  value={prescription.durationUnit || 'Days'}
                  onChange={(e) => onUpdatePrescription(prescription.id, "durationUnit", e.target.value)}
                  className="flex-1 px-2 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-card text-sm"
                >
                  <option value="Days">Days</option>
                  <option value="Weeks">Weeks</option>
                  <option value="Months">Months</option>
                  <option value="Years">Years</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-1 flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wider">
                  Qty
                </label>
                <input
                  type="text"
                  value={prescription.qty}
                  onChange={(e) => onUpdatePrescription(prescription.id, "qty", e.target.value)}
                  className="w-full px-2 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-card"
                  placeholder="10"
                />
              </div>
              {prescriptions.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemovePrescription(prescription.id)}
                  className="p-2 mt-6 text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
