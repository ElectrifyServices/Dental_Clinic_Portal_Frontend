import React, { useState, useEffect } from "react";
import { CheckCircle, History, ArrowLeft } from "lucide-react";
import {
  downloadConsultationPDF,
  PDFReportType,
} from "../../utils/pdfGenerator";
import { Modal, Button } from "@/components/ui";
import apiClient from "../../services/apiClient";
import { parseApiResponse } from "../../services/parseApiResponse";

import { ClinicalImages } from "./PatientConsultation/ClinicalImages";
import { ObservationsAndToothChart } from "./PatientConsultation/ObservationsAndToothChart";
import { TreatmentPlanning } from "./PatientConsultation/TreatmentPlanning";
import { PrescriptionForm } from "./PatientConsultation/PrescriptionForm";
import { FollowUpScheduler } from "./PatientConsultation/FollowUpScheduler";
import { AdditionalNotes } from "./PatientConsultation/AdditionalNotes";
import { CompletionView } from "./PatientConsultation/CompletionView";
import { PreviousConsultationsView } from "./PatientConsultation/PreviousConsultationsView";

import { useDoctorsListQuery } from "../../hooks/staff/useDoctorsListQuery";
import { useAvailableSlotsQuery } from "../../hooks/appointments/useAvailableSlotsQuery";
import { usePatientConsultationsQuery } from "../../hooks/consultation/usePatientConsultationsQuery";
import { useDebounce } from "../../hooks/useDebounce";

interface PatientConsultationProps {
  patient: {
    id: string;
    patientId?: string;
    appointmentId?: string;
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
  const [viewMode, setViewMode] = useState<"form" | "history">("form");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [historySearch, setHistorySearch] = useState("");
  const [historyDateFrom, setHistoryDateFrom] = useState("");
  const [historyDateTo, setHistoryDateTo] = useState("");
  const debouncedHistorySearch = useDebounce(historySearch, 400);
  const debouncedDateFrom = useDebounce(historyDateFrom, 300);
  const debouncedDateTo = useDebounce(historyDateTo, 300);
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
  // ── Follow-up state ────────────────────────────────────────────────────────
  const [followUpDoctorId, setFollowUpDoctorId] = useState(
    initialData?.followUpDoctorId || (patient.doctorId && patient.doctorId !== "1" ? patient.doctorId : "1"),
  );
  const [followUpDate, setFollowUpDate] = useState(
    initialData?.followUpDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(
    initialData?.selectedSlot || null
  );

  useEffect(() => {
    onDraftUpdate?.({
      consultationData,
      toothChartState,
      followUpDoctorId,
      followUpDate,
      selectedSlot,
    });
  }, [consultationData, toothChartState, followUpDoctorId, followUpDate, selectedSlot]);

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


  const { doctors: apiDoctors } = useDoctorsListQuery();
  const formDoctors = apiDoctors && apiDoctors.length > 0 ? apiDoctors : doctors;

  useEffect(() => {
    if (formDoctors && formDoctors.length > 0) {
      const isValid = formDoctors.some((d: any) => d.id === followUpDoctorId);
      if (!isValid) {
        setFollowUpDoctorId(formDoctors[0].id);
      }
    }
  }, [formDoctors, followUpDoctorId]);

  const { data: consultations, isLoading: isLoadingHistory, isError: isHistoryError, refetch: refetchConsultations } = usePatientConsultationsQuery(
    patient.patientId || patient.id,
    {
      search: debouncedHistorySearch || undefined,
      dateFrom: debouncedDateFrom || undefined,
      dateTo: debouncedDateTo || undefined,
    }
  );

  useEffect(() => {
    refetchConsultations();
  }, [patient.id, refetchConsultations]);

  const { data: slotsData, isLoading: isLoadingSlots } = useAvailableSlotsQuery(
    consultationData.followUpRequired ? followUpDoctorId : null,
    consultationData.followUpRequired ? followUpDate : null
  );

  const availableSlots = React.useMemo(() => {
    if (!slotsData?.data?.slots) return [];
    return slotsData.data.slots.map((s: any) => {
      const time24 = s.time;
      let time12 = time24;
      if (!time24.includes("AM") && !time24.includes("PM")) {
        const [h, m] = time24.split(":");
        const hour = parseInt(h);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        time12 = `${hour12}:${m} ${ampm}`;
      }
      return { time24, time12, isAvailable: s.is_available };
    });
  }, [slotsData]);

  const handleScheduleFollowUp = () => {
    if (!onScheduleFollowUp) return;
    const selDoctor = formDoctors.find((d: any) => d.id === followUpDoctorId);
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
    let finalConsultationData = { ...consultationData };
    let endpoint = "";

    if (type === "CLINICAL") {
      endpoint = `/consultations/${patient.id}/observations`;
    } else if (type === "TREATMENT") {
      endpoint = `/consultations/${patient.id}/treatment-plan`;
    } else if (type === "PRESCRIPTION") {
      endpoint = `/consultations/${patient.id}/prescriptions`;
    } else {
      endpoint = `/consultations/${patient.id}`;
    }

    try {
      const response = await apiClient.get(endpoint);
      const parsed = parseApiResponse(response.data);
      if (parsed.data) {
        finalConsultationData = { ...finalConsultationData, ...parsed.data };
      }
    } catch (error) {
      console.error(`Failed to fetch consultation details for ${type}:`, error);
    }

    await downloadConsultationPDF({
      type,
      patient: {
        ...patient,
        gender: patient.patientHistory?.gender || (patient as any).gender || "—",
        bloodGroup: patient.patientHistory?.bloodGroup || (patient as any).bloodGroup || (patient as any).blood_group || "—",
      },
      consultationData: finalConsultationData,
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!consultationData.observations.trim()) {
      newErrors.observations = "Detailed Observations are required.";
    }
    if (!consultationData.diagnosis.trim()) {
      newErrors.diagnosis = "Diagnosis is required.";
    }
    if (consultationData.requiresTreatment && !consultationData.treatmentPlan.trim()) {
      newErrors.treatmentPlan = "Treatment Plan Description is required when treatment is needed.";
    }
    if (consultationData.followUpRequired && !selectedSlot) {
      newErrors.followUpSlot = "Please select a follow-up time slot.";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      // Scroll to first error field
      const firstKey = Object.keys(newErrors)[0];
      const el = document.querySelector(`[name="${firstKey}"]`) as HTMLElement;
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus();
      return false;
    }
    return true;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    // Clear error for this field on change
    if (name && errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
    setConsultationData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await onCompleteConsultation({
        id: patient.id,
        patientId: patient.patientId || patient.id,
        appointmentId: patient.appointmentId,
        ...consultationData,
        toothChartState,
        consultationDate: new Date().toISOString(),
        doctorId: patient.doctorId || "1",
        doctorName: patient.doctorName || "Dr. Sharma",
        status: "completed",
        followUpDoctorId,
        followUpDate,
        followUpTime: selectedSlot,
      });
      setIsCompleted(true);
      refetchConsultations();
    } catch (error) {
      console.error("Failed to complete consultation", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        viewMode === "history"
          ? `Previous Consultations: ${patient.patientName}`
          : `Consultation: ${patient.patientName}`
      }
      subtitle={
        viewMode === "history"
          ? "Complete dental checkup records and prescription history"
          : (patient.patientConcern || patient.treatmentType)
      }
      onClose={onClose}
      size="5xl"
      icon={
        viewMode === "history" ? (
          <History className="w-5 h-5 text-primary" />
        ) : (
          <CheckCircle className="w-5 h-5 text-primary" />
        )
      }
      footer={
        isCompleted ? null : viewMode === "history" ? (
          <div className="flex justify-between items-center w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewMode("form")}
              className="gap-2 font-bold"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Consultation
            </Button>
          </div>
        ) : (
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
              className="px-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg font-bold"
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
        )
      }
    >
      <div id="consultation-form">
        {isCompleted ? (
          <CompletionView onDownloadPDF={handleDownloadPDF} onClose={onClose} />
        ) : viewMode === "history" ? (
          <PreviousConsultationsView
            consultations={consultations}
            isLoading={isLoadingHistory}
            isError={isHistoryError}
            searchVal={historySearch}
            onSearchChange={setHistorySearch}
            dateFrom={historyDateFrom}
            dateTo={historyDateTo}
            onDateFromChange={setHistoryDateFrom}
            onDateToChange={setHistoryDateTo}
            onClearFilters={() => {
              setHistorySearch("");
              setHistoryDateFrom("");
              setHistoryDateTo("");
            }}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="mx-6 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-primary/5 p-4 rounded-2xl border border-primary/10 gap-3">
              <div>
                <span className="text-xs font-bold text-muted-foreground">Patient Records:</span>
                <div className="text-sm font-black text-foreground">Phone: {patient.phone || "—"}</div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewMode("history")}
                className="gap-2 font-bold hover:bg-primary hover:text-white transition-all shadow-sm border-primary/30 text-primary w-full sm:w-auto justify-center"
              >
                <History className="w-4 h-4" />
                Previous Consultations
              </Button>
            </div>

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
              errors={errors}
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
              followUpRequired={consultationData.followUpRequired}
              onFollowUpRequiredChange={handleChange}
              errors={errors}
            />

            <FollowUpScheduler
              followUpRequired={consultationData.followUpRequired}
              bookedFollowUp={bookedFollowUp}
              followUpDoctorId={followUpDoctorId}
              followUpDate={followUpDate}
              selectedSlot={selectedSlot}
              availableSlots={availableSlots}
              doctors={formDoctors}
              onFollowUpRequiredChange={handleChange}
              onDoctorChange={setFollowUpDoctorId}
              onDateChange={setFollowUpDate}
              onSlotSelect={setSelectedSlot}
              onSchedule={handleScheduleFollowUp}
              errors={errors}
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
