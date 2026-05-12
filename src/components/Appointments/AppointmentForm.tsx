import React, { useState } from "react";
import { X, Calendar, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Appointment } from "../../types";
import { Button } from "@/components/ui/Button";
import { PatientInfoFields } from "./AppointmentForm/PatientInfoFields";
import { ScheduleFields } from "./AppointmentForm/ScheduleFields";
import { TreatmentFields } from "./AppointmentForm/TreatmentFields";
import { useFormFieldOptions, useFormTitle, useSubmitLabel } from "../../hooks/useFormConfig";
import { appointmentSchema, type AppointmentFormData } from "@/lib/schemas/appointment.schema";

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
  const formTitle        = useFormTitle('appointment', isFollowUp ? 'followUp' : appointment?.id ? 'edit' : 'create');
  const submitLabel      = useSubmitLabel('appointment', appointment?.id ? 'edit' : 'create');

  const formatDateLocal = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const safeDate = selectedDate ? new Date(selectedDate) : new Date();

  const [suggestion, setSuggestion] = useState<{ name: string, phone: string } | null>(null);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientName: appointment?.patientName ?? "",
      patientPhone: appointment?.patientPhone ?? "",
      treatment: appointment?.treatment ?? "",
      doctorId: appointment?.doctorId ?? "1",
      doctorName: appointment?.doctorName ?? "Dr. Sharma",
      date: appointment?.date instanceof Date ? formatDateLocal(appointment.date) : appointment?.date ?? formatDateLocal(safeDate),
      time: appointment?.time ?? "09:00",
      duration: appointment?.duration ?? "",
      type: appointment?.type ?? "consultation",
      notes: appointment?.notes ?? "",
      fee: appointment?.fee ?? 500,
      patientConcern: appointment?.patientConcern ?? "",
      treatmentType: appointment?.treatmentType ?? "",
    },
  });

  const formData = form.watch();

  const onSubmit = (data: AppointmentFormData) => {
    if (appointment?.status === "checked-in" && data.patientPhone !== appointment.patientPhone) {
      form.setError("patientPhone", { message: "Phone cannot be changed after consultation" });
      return;
    }
    const conflict = appointments.find(a => {
      if (a.doctorId !== data.doctorId || a.date !== data.date || a.id === appointment?.id) return false;
      const nStart = parseInt(data.time.split(':')[0]) * 60 + parseInt(data.time.split(':')[1]);
      const nEnd = nStart + (data.duration ? parseInt(data.duration.toString()) : 15);
      const eStart = parseInt(a.time.split(':')[0]) * 60 + parseInt(a.time.split(':')[1]);
      const eEnd = eStart + (a.duration ? parseInt(a.duration.toString()) : 15);
      return (nStart < eEnd) && (nEnd > eStart);
    });
    if (conflict) {
      form.setError("time", { message: `Conflict with ${conflict.patientName} at ${conflict.time}` });
      return;
    }
    onSave({ ...data, id: appointment?.id || Date.now().toString(), patientId: appointment?.patientId || Date.now().toString(), status: appointment?.status || "scheduled" });
  };

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    form.setValue(name as keyof AppointmentFormData, value, { shouldValidate: true });
    if (name === "patientName" && value.trim().length > 2) {
      const found = patients.find((p: any) => p.name.toLowerCase() === value.toLowerCase().trim());
      setSuggestion(found ? { name: found.name, phone: found.phone } : null);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-4xl">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-card border-b border-border p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="modal-title text-lg">{formTitle}</h2>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {isFollowUp ? "Schedule next visit" : "Complete booking details"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground/60 hover:text-muted-foreground p-2 hover:bg-muted rounded-xl transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
          <form className="space-y-10" onSubmit={form.handleSubmit(onSubmit)}>
            <PatientInfoFields
              patientName={formData.patientName}
              patientPhone={formData.patientPhone ?? ''}
              isFollowUp={isFollowUp}
              isConsulted={appointment?.status === "checked-in"}
              suggestion={suggestion}
              onChange={handleChange}
              onPhoneChange={(val) => form.setValue('patientPhone', val, { shouldValidate: true })}
              onAcceptSuggestion={() => { form.setValue('patientPhone', suggestion!.phone); setSuggestion(null); }}
            />
            <ScheduleFields
              date={formData.date}
              time={formData.time}
              duration={formData.duration ?? ''}
              doctorId={formData.doctorId}
              doctors={doctors}
              onDateChange={handleChange}
              onTimeChange={handleChange}
              onDurationChange={(val) => form.setValue('duration', val)}
              onDoctorChange={(val) => {
                form.setValue('doctorId', val);
                form.setValue('doctorName', doctors.find((d: any) => d.id === val)?.name);
              }}
            />
            <TreatmentFields
              treatment={formData.treatment ?? ''}
              treatmentType={formData.treatmentType ?? ''}
              fee={formData.fee ?? 0}
              patientConcern={formData.patientConcern ?? ''}
              notes={formData.notes ?? ''}
              appointmentTypes={appointmentTypes}
              onChange={handleChange}
            />
          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-muted/80 backdrop-blur-sm border-t border-border p-6 flex justify-between items-center rounded-b-2xl">
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground">Cancel</Button>
          <Button onClick={form.handleSubmit(onSubmit)} className="px-10 shadow-lg">
            <Save className="w-4 h-4 mr-2" />
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

