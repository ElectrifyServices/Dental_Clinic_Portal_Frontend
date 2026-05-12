import React, { useState } from "react";
import { X, Calendar, Save } from "lucide-react";
import { Appointment } from "../../types";
import { Button } from "@/components/ui/Button";
import { PatientInfoFields } from "./AppointmentForm/PatientInfoFields";
import { ScheduleFields } from "./AppointmentForm/ScheduleFields";
import { TreatmentFields } from "./AppointmentForm/TreatmentFields";
import { useFormConfig, useFormFieldOptions, useFormTitle, useSubmitLabel } from "../../hooks/useFormConfig";

interface AppointmentFormProps {
  onClose: () => void;
  onSave: (appointment: Partial<Appointment>) => void;
  appointment?: Appointment;
  isQuickBooking?: boolean;
  doctors?: any[];
  doctorAvailability?: { [key: string]: boolean };
  appointments?: any[];
  selectedDate?: Date | null;
  patients?: any[];
  isFollowUp?: boolean;
}

export function AppointmentForm({ onClose, onSave, appointment, doctors = [], appointments = [], selectedDate, patients = [], isFollowUp = false }: AppointmentFormProps) {
  const appointmentTypes = useFormFieldOptions('appointment', 'treatmentType');
  const durationOptions  = useFormFieldOptions('appointment', 'duration');
  const formTitle        = useFormTitle('appointment', isFollowUp ? 'followUp' : appointment?.id ? 'edit' : 'create');
  const submitLabel      = useSubmitLabel('appointment', appointment?.id ? 'edit' : 'create');

  const formatDateLocal = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const safeDate = selectedDate ? new Date(selectedDate) : new Date();

  const [formData, setFormData] = useState({
    patientName: appointment?.patientName || "",
    patientPhone: appointment?.patientPhone || "",
    treatment: appointment?.treatment || "",
    doctorId: appointment?.doctorId || "1",
    doctorName: appointment?.doctorName || "Dr. Sharma",
    date: appointment?.date instanceof Date ? formatDateLocal(appointment.date) : appointment?.date || formatDateLocal(safeDate),
    time: appointment?.time || "09:00",
    duration: appointment?.duration || "",
    type: appointment?.type || "consultation",
    notes: appointment?.notes || "",
    fee: appointment?.fee || 500,
    patientConcern: appointment?.patientConcern || "",
    treatmentType: appointment?.treatmentType || "",
  });

  const [suggestion, setSuggestion] = useState<{ name: string, phone: string } | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (appointment?.status === "checked-in" && formData.patientPhone !== appointment.patientPhone) return alert("Phone cannot be changed after consultation");
    
    const conflict = appointments.find(a => {
      if (a.doctorId !== formData.doctorId || a.date !== formData.date || a.id === appointment?.id) return false;
      const nStart = parseInt(formData.time.split(':')[0]) * 60 + parseInt(formData.time.split(':')[1]);
      const nEnd = nStart + (formData.duration ? parseInt(formData.duration.toString()) : 15);
      const eStart = parseInt(a.time.split(':')[0]) * 60 + parseInt(a.time.split(':')[1]);
      const eEnd = eStart + (a.duration ? parseInt(a.duration.toString()) : 15);
      return (nStart < eEnd) && (nEnd > eStart);
    });

    if (conflict) return alert(`❌ Conflict with ${conflict.patientName} at ${conflict.time}`);
    onSave({ ...formData, id: appointment?.id || Date.now().toString(), patientId: appointment?.patientId || Date.now().toString(), status: appointment?.status || "scheduled" });
  };

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const upd = { ...prev, [name]: value };
      if (name === "treatmentType") upd.fee = APPOINTMENT_TYPES.find(t => t.value === value)?.fee || upd.fee;
      if (name === "patientName" && value.trim().length > 2) {
        const found = patients.find(p => p.name.toLowerCase() === value.toLowerCase().trim());
        setSuggestion(found ? { name: found.name, phone: found.phone } : null);
      }
      return upd;
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-4xl">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="modal-title text-lg">
                  {formTitle}
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  {isFollowUp ? "Schedule next visit" : "Complete booking details"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
          <form className="space-y-10">
            <PatientInfoFields
              patientName={formData.patientName}
              patientPhone={formData.patientPhone}
              isFollowUp={isFollowUp}
              isConsulted={appointment?.status === "checked-in"}
              suggestion={suggestion}
              onChange={handleChange}
              onPhoneChange={(val) => setFormData(p => ({ ...p, patientPhone: val }))}
              onAcceptSuggestion={() => { setFormData(p => ({ ...p, patientPhone: suggestion!.phone })); setSuggestion(null); }}
            />
            <ScheduleFields
              date={formData.date}
              time={formData.time}
              duration={formData.duration}
              doctorId={formData.doctorId}
              doctors={doctors}
              onDateChange={handleChange}
              onTimeChange={handleChange}
              onDurationChange={(val) => setFormData(p => ({ ...p, duration: val }))}
              onDoctorChange={(val) => setFormData(p => ({ ...p, doctorId: val, doctorName: doctors.find(d => d.id === val)?.name }))}
            />
            <TreatmentFields
              treatment={formData.treatment}
              treatmentType={formData.treatmentType}
              fee={formData.fee}
              patientConcern={formData.patientConcern}
              notes={formData.notes}
              appointmentTypes={appointmentTypes}
              onChange={handleChange}
            />
          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50/80 backdrop-blur-sm border-t border-gray-200 p-6 flex justify-between items-center rounded-b-2xl">
          <Button variant="ghost" onClick={onClose} className="text-gray-500">
            Cancel
          </Button>
          <Button 
            onClick={() => handleSubmit()} 
            className="px-10 shadow-lg"
          >
            <Save className="w-4 h-4 mr-2" />
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
