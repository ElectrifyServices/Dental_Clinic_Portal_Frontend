import React, { useState, useEffect, useMemo } from "react";
import { Calendar, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Appointment } from "../../types";
import { Button, Modal } from "@/components/ui";
import { PatientInfoFields } from "./AppointmentForm/PatientInfoFields";
import { ScheduleFields } from "./AppointmentForm/ScheduleFields";
import { TreatmentFields } from "./AppointmentForm/TreatmentFields";
import {
  useFormFieldOptions,
  useFormTitle,
  useSubmitLabel,
} from "../../hooks/useFormConfig";
import {
  appointmentSchema,
  type AppointmentFormData,
} from "@/lib/schemas/appointment.schema";
import { useAppointmentQuery } from "../../hooks/appointments/useAppointmentQuery";
import { usePatientQuery } from "../../hooks/patients/usePatientQuery";
import { useDebounce } from "../../hooks/useDebounce";
import { getLocalDateString } from "../../utils/dateUtils";
import { useDoctorsListQuery } from "../../hooks/staff/useDoctorsListQuery";

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

export function AppointmentForm({
  onClose,
  onSave,
  appointment,
  doctors = [],
  appointments = [],
  selectedDate,
  patients = [],
  isFollowUp = false,
}: AppointmentFormProps) {
  const appointmentTypes = useFormFieldOptions("appointment", "treatmentType");
  const formTitle = useFormTitle(
    "appointment",
    isFollowUp ? "followUp" : appointment?.id ? "edit" : "create",
  );
  const submitLabel = useSubmitLabel(
    "appointment",
    appointment?.id ? "edit" : "create",
  );

  const safeDate = selectedDate ? new Date(selectedDate) : new Date();

  const [suggestion, setSuggestion] = useState<{
    name: string;
    phone: string;
  } | null>(null);

  const initialDoctorId = appointment?.doctorId ?? appointment?.doctor_id ?? (doctors && doctors.length > 0 ? doctors[0].id : "1");
  const initialDoctor = doctors?.find((d: any) => String(d.id) === String(initialDoctorId));
  const defaultFee = appointment?.fee ?? appointment?.treatment_cost ?? 0;
  const defaultDoctorName = appointment?.doctorName ?? appointment?.doctor_name ?? (initialDoctor?.name || "Dr. Sharma");

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema) as any,
    defaultValues: {
      patientName: appointment?.patientName ?? appointment?.patient_name ?? "",
      country_code: (appointment as any)?.country_code ?? "+91",
      patientPhone: appointment?.patientPhone ?? appointment?.patient_phone ?? "",
      treatment: appointment?.treatment ?? appointment?.specific_treatment ?? "",
      doctorId: initialDoctorId,
      doctorName: defaultDoctorName,
      date: appointment?.date
        ? getLocalDateString(appointment.date)
        : getLocalDateString(safeDate),
      time: (() => {
        const rawTime = appointment?.start_time_ist || appointment?.time || appointment?.start_time;
        if (!rawTime) return "09:00";
        if (typeof rawTime === "string" && (rawTime.toLowerCase().includes("am") || rawTime.toLowerCase().includes("pm"))) {
          const match = rawTime.match(/(\d+):(\d+)\s*(am|pm)/i);
          if (match) {
            let hrs = parseInt(match[1], 10);
            const mins = match[2];
            const period = match[3].toLowerCase();
            
            if (period === "pm" && hrs < 12) hrs += 12;
            if (period === "am" && hrs === 12) hrs = 0;
            
            return `${String(hrs).padStart(2, '0')}:${mins}`;
          }
        }
        if (rawTime.includes("T")) {
          const dObj = new Date(rawTime);
          const hrs = String(dObj.getUTCHours()).padStart(2, '0');
          const mins = String(dObj.getUTCMinutes()).padStart(2, '0');
          return `${hrs}:${mins}`;
        }
        return rawTime;
      })(),
      duration: appointment?.duration?.toString() ?? appointment?.slot_duration_mins?.toString() ?? "15",
      type: appointment?.type ?? "consultation",
      notes: appointment?.notes ?? "",
      fee: defaultFee,
      patientConcern: appointment?.patientConcern ?? appointment?.concern ?? "",
      treatmentType: appointment?.treatmentType ?? appointment?.treatment_type ?? "",
    },
  });

  const { data: fetchedAppointmentResponse, isPending: isFetchingAppointment } = useAppointmentQuery(appointment?.id);

  useEffect(() => {
    if (fetchedAppointmentResponse) {
      // The API might wrap the data in response.data or response.data.data
      const fetchedAppointment = fetchedAppointmentResponse.data?.data || fetchedAppointmentResponse.data || fetchedAppointmentResponse;
      
      form.reset({
        patientName: fetchedAppointment?.patientName ?? fetchedAppointment?.patient_name ?? form.getValues().patientName,
        patientPhone: fetchedAppointment?.patientPhone ?? fetchedAppointment?.patient_phone ?? form.getValues().patientPhone,
        treatment: fetchedAppointment?.treatment ?? fetchedAppointment?.specific_treatment ?? form.getValues().treatment,
        doctorId: fetchedAppointment?.doctorId ?? fetchedAppointment?.doctor_id ?? form.getValues().doctorId,
        doctorName: fetchedAppointment?.doctorName ?? fetchedAppointment?.doctor_name ?? form.getValues().doctorName,
        date: fetchedAppointment?.date
          ? getLocalDateString(fetchedAppointment.date)
          : form.getValues().date,
        time: (() => {
          const rawTime = fetchedAppointment?.start_time_ist || fetchedAppointment?.time || fetchedAppointment?.start_time;
          if (!rawTime) return form.getValues().time;
          if (typeof rawTime === "string" && (rawTime.toLowerCase().includes("am") || rawTime.toLowerCase().includes("pm"))) {
            const match = rawTime.match(/(\d+):(\d+)\s*(am|pm)/i);
            if (match) {
              let hrs = parseInt(match[1], 10);
              const mins = match[2];
              const period = match[3].toLowerCase();
              
              if (period === "pm" && hrs < 12) hrs += 12;
              if (period === "am" && hrs === 12) hrs = 0;
              
              return `${String(hrs).padStart(2, '0')}:${mins}`;
            }
          }
          if (rawTime.includes("T")) {
            const dObj = new Date(rawTime);
            const hrs = String(dObj.getUTCHours()).padStart(2, '0');
            const mins = String(dObj.getUTCMinutes()).padStart(2, '0');
            return `${hrs}:${mins}`;
          }
          return rawTime;
        })(),
        duration: fetchedAppointment?.duration?.toString() ?? fetchedAppointment?.slot_duration_mins?.toString() ?? form.getValues().duration,
        type: fetchedAppointment?.type ?? form.getValues().type,
        notes: fetchedAppointment?.notes ?? form.getValues().notes,
        fee: fetchedAppointment?.fee ?? fetchedAppointment?.treatment_cost ?? form.getValues().fee,
        patientConcern: fetchedAppointment?.patientConcern ?? fetchedAppointment?.concern ?? form.getValues().patientConcern,
        treatmentType: fetchedAppointment?.treatmentType ?? fetchedAppointment?.treatment_type ?? form.getValues().treatmentType,
      });
    }
  }, [fetchedAppointmentResponse, form]);

  const formData = form.watch();
  const { formState: { errors } } = form;

  const onSubmit = (data: AppointmentFormData) => {
    if (
      appointment?.status === "checked-in" &&
      data.patientPhone !== appointment.patientPhone
    ) {
      form.setError("patientPhone", {
        message: "Phone cannot be changed after consultation",
      });
      return;
    }
    const conflict = appointments.find((a) => {
      if (
        a.doctorId !== data.doctorId ||
        a.date !== data.date ||
        a.id === appointment?.id
      )
        return false;
      const nStart =
        parseInt(data.time.split(":")[0]) * 60 +
        parseInt(data.time.split(":")[1]);
      const nEnd =
        nStart + (data.duration ? parseInt(data.duration.toString()) : 15);
      const eStart =
        parseInt(a.time.split(":")[0]) * 60 + parseInt(a.time.split(":")[1]);
      const eEnd = eStart + (a.duration ? parseInt(a.duration.toString()) : 15);
      return nStart < eEnd && nEnd > eStart;
    });
    if (conflict) {
      form.setError("time", {
        message: `Conflict with ${conflict.patientName} at ${conflict.time}`,
      });
      return;
    }
    onSave({
      ...data,
      duration: Number(data.duration || 15),
      id: appointment?.id || Date.now().toString(),
      patientId: appointment?.patientId || Date.now().toString(),
      status: appointment?.status || "scheduled",
    });
  };

  const patientNameVal = form.watch("patientName");
  const patientPhoneVal = form.watch("patientPhone");
  const activeSearchTerm = (patientNameVal || patientPhoneVal || "").trim();
  const debouncedSearch = useDebounce(activeSearchTerm, 400);

  const { data: rawPatientsData, isLoading: isPatientsLoading, isFetching: isPatientsFetching, refetch: refetchPatients } = usePatientQuery({
    page: 1,
    limit: 100,
    search: debouncedSearch || undefined,
    filters: { isDropdown: [true] as any },
  });

  useEffect(() => {
    refetchPatients();
  }, [refetchPatients]);

  const apiPatients = useMemo(() => {
    let rawList: any[] = [];
    const dataObj: any = rawPatientsData;

    const target = dataObj?.responseObject !== undefined ? dataObj.responseObject : dataObj;

    if (Array.isArray(target)) {
      rawList = target;
    } else if (target && typeof target === "object") {
      if (Array.isArray(target.data?.data)) rawList = target.data.data;
      else if (Array.isArray(target.data)) rawList = target.data;
      else if (Array.isArray(target.patients)) rawList = target.patients;
      else if (Array.isArray(target.data?.patients)) rawList = target.data.patients;
      else if (Array.isArray(target.data?.data?.data)) rawList = target.data.data.data;
    }

    // Only fall back to all patients list if we are not actively searching
    const activeSearch = (debouncedSearch || "").trim();
    if (rawList.length === 0 && !activeSearch && Array.isArray(patients) && patients.length > 0) {
      rawList = patients;
    }

    return rawList.map((p: any) => ({
      ...p,
      id: p.id || p.patient_id,
      name: p.name || p.full_name || p.patient_name || "",
      phone: p.phone || p.mobile || p.mobile_number || p.patient_phone || "",
    }));
  }, [rawPatientsData, patients, debouncedSearch]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    form.setValue(name as keyof AppointmentFormData, value, {
      shouldValidate: true,
    });
    if (name === "patientName" && value.trim().length > 2) {
      const found = apiPatients.find(
        (p: any) => p.name.toLowerCase() === value.toLowerCase().trim(),
      );
      setSuggestion(found ? { name: found.name, phone: found.phone } : null);
    }
  };

  const [formDoctorSearch, setFormDoctorSearch] = useState("");
  const debouncedFormDoctorSearch = useDebounce(formDoctorSearch, 500);

  const {
    doctors: formDoctorsList
  } = useDoctorsListQuery(debouncedFormDoctorSearch);

  const selectedDoctorIdInForm = form.watch("doctorId");

  const finalDoctorsList = useMemo(() => {
    const list = [...formDoctorsList];
    if (selectedDoctorIdInForm) {
      const exists = list.some((d) => String(d.id) === String(selectedDoctorIdInForm));
      if (!exists) {
        const selectedDoc = doctors.find((d) => String(d.id) === String(selectedDoctorIdInForm));
        if (selectedDoc) {
          list.push(selectedDoc);
        }
      }
    }
    return list;
  }, [formDoctorsList, selectedDoctorIdInForm, doctors]);

  return (
    <Modal
      title={formTitle}
      subtitle={isFollowUp ? "Schedule next visit" : "Complete booking details"}
      onClose={onClose}
      size="5xl"
      icon={<Calendar className="w-5 h-5" />}
      footer={
        <div className="flex justify-between items-center w-full">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
          {appointment?.status !== "checked-in" && appointment?.status?.toLowerCase() !== "completed" && (
            <Button
              onClick={form.handleSubmit(onSubmit)}
              className="px-10 shadow-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {submitLabel}
            </Button>
          )}
        </div>
      }
    >
      <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset disabled={appointment?.status === "checked-in" || appointment?.status?.toLowerCase() === "completed"} className="space-y-3 border-none p-0 m-0">
          <PatientInfoFields
            patientName={formData.patientName}
            patientPhone={formData.patientPhone ?? ""}
            countryCode={formData.country_code ?? "+91"}
            onCountryCodeChange={(val) => form.setValue("country_code", val)}
            isFollowUp={isFollowUp}
            isConsulted={appointment?.status === "checked-in"}
            suggestion={suggestion}
            onChange={handleChange}
            onPhoneChange={(val) =>
              form.setValue("patientPhone", val, { shouldValidate: true })
            }
            onAcceptSuggestion={() => {
              form.setValue("patientPhone", suggestion!.phone);
              setSuggestion(null);
            }}
            errors={errors}
            patients={apiPatients}
            isLoadingPatients={isPatientsLoading || isPatientsFetching}
            onSelectPatient={(name, phone, countryCode) => {
              form.setValue("patientName", name, { shouldValidate: true });
              form.setValue("patientPhone", phone, { shouldValidate: true });
              if (countryCode) {
                form.setValue("country_code", countryCode, { shouldValidate: true });
              }
              setSuggestion(null);
            }}
          />
          <ScheduleFields
            date={formData.date}
            time={formData.time}
            duration={formData.duration ?? ""}
            doctorId={formData.doctorId}
            doctors={finalDoctorsList}
            doctorSearch={formDoctorSearch}
            setDoctorSearch={setFormDoctorSearch}
            onDateChange={handleChange}
            onTimeChange={handleChange}
            onDurationChange={(val) => form.setValue("duration", val)}
            onDoctorChange={(val) => {
              form.setValue("doctorId", val);
              const selectedDoctor = doctors.find((d: any) => d.id === val);
              form.setValue("doctorName", selectedDoctor?.name);
            }}
          />
          <TreatmentFields
            treatment={formData.treatment ?? ""}
            treatmentType={formData.treatmentType ?? ""}
            fee={formData.fee ?? 0}
            patientConcern={formData.patientConcern ?? ""}
            notes={formData.notes ?? ""}
            appointmentTypes={appointmentTypes}
            onChange={handleChange}
            onTreatmentTypeChange={(val) => {
              form.setValue("treatmentType", val, { shouldValidate: true });
            }}
          />
        </fieldset>
      </form>
    </Modal>
  );
}
