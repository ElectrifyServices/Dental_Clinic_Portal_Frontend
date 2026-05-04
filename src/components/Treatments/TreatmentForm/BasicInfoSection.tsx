import React from 'react';
import { User, Calendar, DollarSign, Plus } from 'lucide-react';

interface BasicInfoSectionProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  allPatients: any[];
  doctors: any[];
  procedures: string[];
  teeth: string[];
  pendingPlans: any[];
  onLoadPlan: (plan: any) => void;
  isEdit: boolean;
}

export function BasicInfoSection({
  formData,
  handleChange,
  allPatients,
  doctors,
  procedures,
  teeth,
  pendingPlans,
  onLoadPlan,
  isEdit
}: BasicInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="form-label text-gray-700">
          <User className="w-4 h-4 inline mr-2 text-blue-600" />
          Patient Name *
        </label>
        <select
          name="patientName"
          value={formData.patientName}
          onChange={handleChange}
          required
          className="form-input py-3 font-medium"
        >
          <option value="">Select Patient</option>
          {allPatients.map((patient, i) => {
            const patientName = typeof patient === 'string' ? patient : patient.name;
            const patientId = typeof patient === 'object' ? patient.id : patientName;
            return (
              <option key={`${patientId}-${i}`} value={patientName}>
                {patientName}
              </option>
            );
          })}
        </select>
      </div>

      {/* Recommended Plans */}
      {pendingPlans.length > 0 && !isEdit && (
        <div className="col-span-1 md:col-span-2 p-4 bg-purple-50 rounded-2xl border border-purple-200 animate-in slide-in-from-top duration-500 shadow-sm">
          <p className="text-sm font-bold text-purple-900 mb-3 flex items-center">
            <Plus className="w-4 h-4 mr-1 text-purple-600" />
            Recommended Plans from Consultation:
          </p>
          <div className="flex flex-wrap gap-2">
            {pendingPlans.map((plan: any) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => onLoadPlan(plan)}
                className="px-3 py-2 bg-white text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors flex items-center border border-purple-200 shadow-sm"
              >
                {plan.procedure} (#{plan.tooth})
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="form-label text-gray-700 mb-2">Procedure *</label>
        <select
          name="procedure"
          value={formData.procedure}
          onChange={handleChange}
          required
          className="form-input py-3 font-medium"
        >
          <option value="">Select Procedure</option>
          {procedures.map(proc => (
            <option key={proc} value={proc}>{proc}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label text-gray-700 mb-2">Tooth/Area *</label>
        <select
          name="tooth"
          value={formData.tooth}
          onChange={handleChange}
          required
          className="form-input py-3 font-medium"
        >
          <option value="">Select Tooth</option>
          {teeth.map(tooth => (
            <option key={tooth} value={tooth}>{tooth}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label text-gray-700 mb-2">Assigned Doctor *</label>
        <select
          name="doctorId"
          value={formData.doctorId}
          onChange={handleChange}
          required
          className="form-input py-3 font-medium"
        >
          {doctors.map(doctor => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name} - {doctor.specialization}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-2 text-blue-600" />
          Treatment Date *
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="form-input py-3 font-medium"
        />
      </div>

      <div>
        <label className="form-label text-gray-700 mb-2">
          <DollarSign className="w-4 h-4 inline mr-2 text-blue-600" />
          Treatment Cost (₹)
        </label>
        <input
          type="number"
          name="cost"
          value={formData.cost}
          onChange={handleChange}
          min="0"
          className="form-input py-3 font-medium"
          placeholder="Enter treatment cost"
        />
      </div>

      <div>
        <label className="form-label text-gray-700 mb-2">Treatment Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="form-input py-3 font-medium"
        >
          <option value="planned">Planned</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div>
        <label className="form-label text-gray-700 mb-2">Next Appointment</label>
        <input
          type="date"
          name="nextAppointment"
          value={formData.nextAppointment}
          onChange={handleChange}
          className="form-input py-3 font-medium"
        />
      </div>
    </div>
  );
}
