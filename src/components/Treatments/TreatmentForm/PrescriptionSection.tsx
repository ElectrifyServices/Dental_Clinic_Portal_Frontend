import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Prescription {
  id: string;
  medicine: string;
  dosage: string;
  timing: string;
  frequency: string;
  duration: string;
  qty: string;
}

interface PrescriptionSectionProps {
  prescriptions: Prescription[];
  onAddPrescription: () => void;
  onRemovePrescription: (id: string) => void;
  onUpdatePrescription: (id: string, field: string, value: string) => void;
}

export function PrescriptionSection({
  prescriptions,
  onAddPrescription,
  onRemovePrescription,
  onUpdatePrescription
}: PrescriptionSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Prescriptions</h3>
        <button
          type="button"
          onClick={onAddPrescription}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 flex items-center text-sm font-semibold transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Medicine
        </button>
      </div>

      <div className="space-y-4">
        {prescriptions.map((prescription) => (
          <div key={prescription.id} className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 relative group transition-all hover:shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1.5 block">Medicine Name</label>
                <input
                  type="text"
                  value={prescription.medicine}
                  onChange={(e) => onUpdatePrescription(prescription.id, 'medicine', e.target.value)}
                  className="w-full px-4 py-2.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white outline-none text-sm font-semibold"
                  placeholder="e.g. Amoxicillin"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1.5 block">Dosage</label>
                <select
                  value={prescription.dosage}
                  onChange={(e) => onUpdatePrescription(prescription.id, 'dosage', e.target.value)}
                  className="w-full px-4 py-2.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white outline-none text-sm font-semibold"
                >
                  <option value="">Select Dosage</option>
                  <option value="1-0-0">1 - 0 - 0 (Morning)</option>
                  <option value="0-1-0">0 - 1 - 0 (Afternoon)</option>
                  <option value="0-0-1">0 - 0 - 1 (Night)</option>
                  <option value="1-1-0">1 - 1 - 0</option>
                  <option value="1-0-1">1 - 0 - 1</option>
                  <option value="0-1-1">0 - 1 - 1</option>
                  <option value="1-1-1">1 - 1 - 1</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1.5 block">Timing</label>
                <input
                  type="text"
                  value={prescription.timing}
                  onChange={(e) => onUpdatePrescription(prescription.id, 'timing', e.target.value)}
                  className="w-full px-4 py-2.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white outline-none text-sm font-semibold"
                  placeholder="After food"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1.5 block">Frequency</label>
                <input
                  type="text"
                  value={prescription.frequency}
                  onChange={(e) => onUpdatePrescription(prescription.id, 'frequency', e.target.value)}
                  className="w-full px-4 py-2.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white outline-none text-sm font-semibold"
                  placeholder="3 times daily"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1.5 block">Duration</label>
                <input
                  type="text"
                  value={prescription.duration}
                  onChange={(e) => onUpdatePrescription(prescription.id, 'duration', e.target.value)}
                  className="w-full px-4 py-2.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white outline-none text-sm font-semibold"
                  placeholder="5 days"
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1.5 block">Qty</label>
                  <input
                    type="text"
                    value={prescription.qty}
                    onChange={(e) => onUpdatePrescription(prescription.id, 'qty', e.target.value)}
                    className="w-full px-4 py-2.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white outline-none text-sm font-semibold"
                    placeholder="10"
                  />
                </div>
                {prescriptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemovePrescription(prescription.id)}
                    className="p-2.5 text-red-500 hover:bg-red-100 rounded-xl transition-all"
                    title="Remove Medicine"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
