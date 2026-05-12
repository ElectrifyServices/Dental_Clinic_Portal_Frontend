import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import {
  downloadConsultationPDF,
  PDFReportType,
} from "../../utils/pdfGenerator";
import { Modal, Button } from "@/components/ui";

import { ClinicalImages } from "./PatientConsultation/ClinicalImages";
import { ObservationsAndToothChart } from "./PatientConsultation/ObservationsAndToothChart";
import { TreatmentPlanning } from "./PatientConsultation/TreatmentPlanning";
import { PrescriptionForm } from "./PatientConsultation/PrescriptionForm";
import { FollowUpScheduler } from "./PatientConsultation/FollowUpScheduler";
import { AdditionalNotes } from "./PatientConsultation/AdditionalNotes";
import { CompletionView } from "./PatientConsultation/CompletionView";

interface PatientConsultationProps {
  patient: {
    id: string;
    patientName: string;
    phone?: string;
    treatmentType: string;
    patientConcern: string;
    doctorId?: string;
    doctorName?: string;
    category?: string;
    defaultDiscount?: number;
    patientHistory?: {
      medicalHistory: string[];
      allergies: string[];
      gender?: string;
      dateOfBirth?: string;
      bloodGroup?: string;
      maritalStatus?: string;
      occupation?: string;
      address?: string;
      emergencyName?: string;
      emergencyContact?: string;
      emergencyRelation?: string;
    };
  };
  doctors?: any[];
  doctorAvailability?: { [key: string]: boolean };
  appointments?: any[];
  bookedFollowUp?: { date: string; time: string } | null;
  onScheduleFollowUp?: (data: any) => void;
  initialData?: any;
  onDraftUpdate?: (data: any) => void;
  onClose: () => void;
  onCompleteConsultation: (consultationData: any) => void;
  onCreateTreatment?: (treatmentData: any) => void;
}

interface ConsultationData {
  observations: string;
  diagnosis: string;
  treatmentPlan: string;
  recommendations: string;
  treatmentCost: number;
  followUpRequired: boolean;
  followUpDate: string;
  consultationDate: string;
  requiresTreatment: boolean;
  treatmentProcedure: string;
  treatmentTooth: string;
  treatmentSessions: number;
  startTreatmentToday: boolean;
  bp: string;
  height: string;
  weight: string;
  bmi: string;
  tests: string;
  consultationNotes: string;
  nextVisit: string;
  prescriptions: any[];
  images: string[];
  xrayFiles: string[];
  labFiles: { name: string; url: string; type: string }[];
  selectedTeeth: string[];
  treatmentPlans: any[];
}

export function PatientConsultation({
  patient,
  doctors = [],
  doctorAvailability = {},
  appointments = [],
  bookedFollowUp = null,
  onScheduleFollowUp,
  initialData,
  onDraftUpdate,
  onClose,
  onCompleteConsultation,
}: PatientConsultationProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toothChartState, setToothChartState] = useState<
    Record<number, string>
  >(initialData?.toothChartState || {});

  const [consultationData, setConsultationData] = useState<ConsultationData>(
    initialData?.consultationData || {
      observations: "",
      diagnosis: "",
      treatmentPlan: "",
      recommendations: "",
      treatmentCost: 0,
      followUpRequired: false,
      followUpDate: "",
      consultationDate: new Date().toISOString().split("T")[0],
      requiresTreatment: false,
      treatmentProcedure: "",
      treatmentTooth: "",
      treatmentSessions: 1,
      startTreatmentToday: false,
      bp: "",
      height: "",
      weight: "",
      bmi: "",
      tests: "",
      consultationNotes: "",
      nextVisit: "",
      prescriptions: [
        {
          id: "1",
          medicine: "",
          dosage: "",
          timing: "",
          frequency: "",
          duration: "",
          durationUnit: "Days",
          qty: "",
        },
      ],
      images: [] as string[],
      xrayFiles: [] as string[],
      labFiles: [] as { name: string; url: string; type: string }[],
      selectedTeeth: [] as string[],
      treatmentPlans: [] as any[],
    },
  );

  useEffect(() => {
    onDraftUpdate?.({
      consultationData,
      toothChartState,
    });
  }, [consultationData, toothChartState]);

  // Sync toothChartState with treatmentPlans
  useEffect(() => {
    const selectedToothNums = Object.keys(toothChartState).map(Number);

    setConsultationData((prev) => {
      const existingPlans = prev.treatmentPlans || [];
      const filteredPlans = existingPlans.filter((plan: any) =>
        selectedToothNums.includes(parseInt(plan.tooth)),
      );

      const newTeeth = selectedToothNums.filter(
        (num) => !filteredPlans.find((p: any) => parseInt(p.tooth) === num),
      );

      const newPlans = newTeeth.map((num) => ({
        id: `plan-${num}-${Date.now()}`,
        tooth: num.toString(),
        procedure: "",
        sessions: 1,
        cost: 0,
        isActive: true,
        status: "planned",
      }));

      const updatedPlans = [...filteredPlans, ...newPlans].sort(
        (a, b) => parseInt(a.tooth) - parseInt(b.tooth),
      );

      if (JSON.stringify(updatedPlans) === JSON.stringify(existingPlans)) {
        return prev;
      }

      return {
        ...prev,
        requiresTreatment: updatedPlans.length > 0,
        treatmentPlans: updatedPlans,
      };
    });
  }, [toothChartState]);

  // ── Follow-up state ────────────────────────────────────────────────────────
  const [followUpDoctorId, setFollowUpDoctorId] = useState(
    patient.doctorId || "1",
  );
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 18 && minute > 0) break;
        const time24 = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        const time12 = `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
        slots.push({ time24, time12 });
      }
    }
    return slots;
  };

  const getAvailableTimeSlots = () => {
    const selDoctor = doctors.find((d) => d.id === followUpDoctorId);
    if (!selDoctor || !followUpDate) return [];

    const selDate = new Date(followUpDate);
    const dayName = selDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const daySchedule = selDoctor.workingHours?.[dayName];

    if (
      !daySchedule ||
      !daySchedule.isWorking ||
      !doctorAvailability[followUpDoctorId]
    )
      return [];

    const allSlots = generateTimeSlots();
    const startHour = parseInt(daySchedule.startTime.split(":")[0]);
    const endHour = parseInt(daySchedule.endTime.split(":")[0]);
    const endMinute = parseInt(daySchedule.endTime.split(":")[1]);

    return allSlots.filter((slot) => {
      const slotHour = parseInt(slot.time24.split(":")[0]);
      const slotMinute = parseInt(slot.time24.split(":")[1]);

      if (
        slotHour < startHour ||
        slotHour > endHour ||
        (slotHour === endHour && slotMinute > endMinute)
      )
        return false;

      if (daySchedule.breakStart && daySchedule.breakEnd) {
        const bsH = parseInt(daySchedule.breakStart.split(":")[0]);
        const bsM = parseInt(daySchedule.breakStart.split(":")[1]);
        const beH = parseInt(daySchedule.breakEnd.split(":")[0]);
        const beM = parseInt(daySchedule.breakEnd.split(":")[1]);
        if (
          (slotHour > bsH || (slotHour === bsH && slotMinute >= bsM)) &&
          (slotHour < beH || (slotHour === beH && slotMinute < beM))
        )
          return false;
      }

      const slotStart = slotHour * 60 + slotMinute;
      const isBooked = (appointments || []).some((a) => {
        if (a.doctorId !== followUpDoctorId || a.date !== followUpDate)
          return false;
        const aStart =
          parseInt(a.time.split(":")[0]) * 60 + parseInt(a.time.split(":")[1]);
        const aEnd = aStart + (a.duration || 15);
        return slotStart >= aStart && slotStart < aEnd;
      });

      return !isBooked;
    });
  };

  const availableSlots = getAvailableTimeSlots();

  const handleScheduleFollowUp = () => {
    if (!onScheduleFollowUp) return;
    const selDoctor = doctors.find((d) => d.id === followUpDoctorId);
    onScheduleFollowUp({
      patientName: patient.patientName,
      patientPhone: patient.phone,
      doctorId: followUpDoctorId,
      doctorName: selDoctor?.name || "Doctor",
      date: followUpDate,
      time: selectedSlot || availableSlots[0]?.time24 || "09:00",
      treatmentType: "consultation",
      patientConcern: `Follow-up for ${patient.treatmentType}`,
      patientId: patient.id,
    });
  };

  const handleDownloadPDF = async (type: PDFReportType = "FULL") => {
    await downloadConsultationPDF({
      type,
      patient,
      consultationData,
      toothChartState,
    });
  };

  const addPrescription = () => {
    setConsultationData((prev) => ({
      ...prev,
      prescriptions: [
        ...prev.prescriptions,
        {
          id: Date.now().toString(),
          medicine: "",
          dosage: "",
          timing: "",
          frequency: "",
          duration: "",
          durationUnit: "Days",
          qty: "",
        },
      ],
    }));
  };

  const removePrescription = (id: string) => {
    setConsultationData((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((p) => p.id !== id),
    }));
  };

  const updatePrescription = (id: string, field: string, value: string) => {
    const dosageMappings: Record<
      string,
      { timing: string; frequency: string }
    > = {
      "1-0-0": { timing: "Before Food", frequency: "Once daily" },
      "0-1-0": { timing: "After Food", frequency: "Once daily" },
      "0-0-1": { timing: "After Food", frequency: "Once daily" },
      "1-1-0": { timing: "After Food", frequency: "Twice daily" },
      "1-0-1": { timing: "After Food", frequency: "Twice daily" },
      "0-1-1": { timing: "After Food", frequency: "Twice daily" },
      "1-1-1": { timing: "After Food", frequency: "Thrice daily" },
    };

    setConsultationData((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: value };
          if (field === "dosage" && dosageMappings[value]) {
            updated.timing = dosageMappings[value].timing;
            updated.frequency = dosageMappings[value].frequency;
          }
          return updated;
        }
        return p;
      }),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setConsultationData((prev) => ({
      ...prev,
      images: [...prev.images, ...imageUrls],
    }));
  };

  const handleXrayUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setConsultationData((prev) => ({
      ...prev,
      xrayFiles: [...prev.xrayFiles, ...imageUrls],
    }));
  };

  const removeImage = (index: number) => {
    setConsultationData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removeXrayFile = (index: number) => {
    setConsultationData((prev) => ({
      ...prev,
      xrayFiles: prev.xrayFiles.filter((_, i) => i !== index),
    }));
  };

  const updateTreatmentPlan = (index: number, field: string, value: any) => {
    const updatedPlans = [...consultationData.treatmentPlans];
    updatedPlans[index] = { ...updatedPlans[index], [field]: value };
    setConsultationData({ ...consultationData, treatmentPlans: updatedPlans });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setConsultationData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    onCompleteConsultation({
      patientId: patient.id,
      ...consultationData,
      toothChartState,
      consultationDate: new Date().toISOString(),
      doctorId: patient.doctorId || "1",
      doctorName: patient.doctorName || "Dr. Sharma",
      status: "completed",
    });
    setIsCompleted(true);
    setLoading(false);
  };

  return (
    <Modal
      title={`Consultation: ${patient.patientName}`}
      subtitle={patient.patientConcern || patient.treatmentType}
      onClose={onClose}
      size="5xl"
      icon={<CheckCircle className="w-5 h-5" />}
      footer={
        <div className="flex justify-end space-x-4 w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="px-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-3" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Complete Consultation
              </>
            )}
          </Button>
        </div>
      }
    >
      <div id="consultation-form">
        {isCompleted ? (
          <CompletionView onDownloadPDF={handleDownloadPDF} onClose={onClose} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <ClinicalImages
              images={consultationData.images}
              xrayFiles={consultationData.xrayFiles}
              onImageUpload={handleImageUpload}
              onXrayUpload={handleXrayUpload}
              onRemoveImage={removeImage}
              onRemoveXray={removeXrayFile}
            />

            <ObservationsAndToothChart
              toothChartState={toothChartState}
              onChartChange={setToothChartState}
              observations={consultationData.observations}
              diagnosis={consultationData.diagnosis}
              onChange={handleChange}
            />

            <TreatmentPlanning
              requiresTreatment={consultationData.requiresTreatment}
              treatmentPlans={consultationData.treatmentPlans}
              treatmentPlanText={consultationData.treatmentPlan}
              treatmentCost={
                consultationData.treatmentCost === 0
                  ? ""
                  : consultationData.treatmentCost
              }
              onRequiresTreatmentChange={handleChange}
              onUpdatePlan={updateTreatmentPlan}
              onTreatmentPlanTextChange={handleChange}
              onTreatmentCostChange={handleChange}
              onTreatmentCostFocus={() => {
                if (consultationData.treatmentCost === 0) {
                  setConsultationData((prev) => ({
                    ...prev,
                    treatmentCost: "" as any,
                  }));
                }
              }}
              onTreatmentCostBlur={(val) => {
                if (val === "") {
                  setConsultationData((prev) => ({
                    ...prev,
                    treatmentCost: 0,
                  }));
                }
              }}
            />

            <FollowUpScheduler
              followUpRequired={consultationData.followUpRequired}
              bookedFollowUp={bookedFollowUp}
              followUpDoctorId={followUpDoctorId}
              followUpDate={followUpDate}
              selectedSlot={selectedSlot}
              availableSlots={availableSlots}
              doctors={doctors}
              onFollowUpRequiredChange={handleChange}
              onDoctorChange={setFollowUpDoctorId}
              onDateChange={setFollowUpDate}
              onSlotSelect={setSelectedSlot}
              onSchedule={handleScheduleFollowUp}
            />

            <PrescriptionForm
              prescriptions={consultationData.prescriptions}
              onAddPrescription={addPrescription}
              onRemovePrescription={removePrescription}
              onUpdatePrescription={updatePrescription}
            />

            <AdditionalNotes
              consultationNotes={consultationData.consultationNotes}
              onChange={handleChange}
            />
          </form>
        )}
      </div>
    </Modal>
  );
}
