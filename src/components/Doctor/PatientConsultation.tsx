import React, { useState, useEffect } from "react";
import { CheckCircle, History, ArrowLeft } from "lucide-react";
import {
  downloadConsultationPDF,
  PDFReportType,
} from "../../utils/pdfGenerator";
import { Modal, Button, Input, Label, SearchableSelect } from "@/components/ui";
import { fetchConsultationDetail } from "../../hooks/consultation/useConsultationQuery";

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
import { useSendConsultationMutation } from "../../hooks/consultation/useSendConsultationMutation";
import { useDebounce } from "../../hooks/useDebounce";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

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
  onCompleteConsultation: (consultationData: any) => Promise<any>;
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
  rawImages: File[];
  xrayFiles: string[];
  rawXrays: File[];
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
  const { state } = useAuth();
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdConsultationId, setCreatedConsultationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"form" | "history">("form");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [directPatientName, setDirectPatientName] = useState((patient as any).isDirect ? (patient.patientName || "") : "");
  const [directPatientPhone, setDirectPatientPhone] = useState((patient as any).isDirect ? (patient.phone || "") : "");
  const [directDoctorId, setDirectDoctorId] = useState(
    (patient as any).isDirect ? (patient.doctorId || "") : "",
  );
  const [historySearch, setHistorySearch] = useState("");
  const [historyDateFrom, setHistoryDateFrom] = useState("");
  const [historyDateTo, setHistoryDateTo] = useState("");
  const debouncedHistorySearch = useDebounce(historySearch, 400);
  const debouncedDateFrom = useDebounce(historyDateFrom, 300);
  const debouncedDateTo = useDebounce(historyDateTo, 300);
  const [toothChartState, setToothChartState] = useState<
    Record<string, string[]>
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
      rawImages: [] as File[],
      xrayFiles: [] as string[],
      rawXrays: [] as File[],
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

  const patientDOB = patient.patientHistory?.dateOfBirth || (patient as any).dateOfBirth || "";
  const calculatedAge = React.useMemo(() => {
    if (!patientDOB) return null;
    try {
      const birthDate = new Date(patientDOB);
      if (isNaN(birthDate.getTime())) return null;
      let age = new Date().getFullYear() - birthDate.getFullYear();
      const m = new Date().getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && new Date().getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (e) {
      return null;
    }
  }, [patientDOB]);

  const defaultChartType = calculatedAge !== null && calculatedAge <= 12 ? "pediatric" : "adult";

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
    const pairs = Object.entries(toothChartState).flatMap(([toothNum, conditions]) => {
      const condArray = Array.isArray(conditions) ? conditions : [conditions];
      return condArray
        .filter((c) => c !== "normal")
        .map((cond) => ({
          tooth: toothNum,
          condition: cond,
        }));
    });

    setConsultationData((prev) => {
      const existingPlans = prev.treatmentPlans || [];
      const filteredPlans = existingPlans.filter((plan: any) =>
        pairs.some((pair) => pair.tooth === plan.tooth && pair.condition === plan.condition),
      );

      const newPairs = pairs.filter(
        (pair) => !filteredPlans.some((p: any) => p.tooth === pair.tooth && p.condition === pair.condition),
      );

      const newPlans = newPairs.map((pair) => ({
        id: `plan-${pair.tooth}-${pair.condition}-${Date.now()}`,
        tooth: pair.tooth,
        condition: pair.condition,
        procedure: "",
        sessions: 1,
        duration: "15 mins",
        cost: 0,
        isActive: true,
        planDate: new Date().toISOString().split("T")[0],
        status: "planned",
      }));

      const updatedPlans = [...filteredPlans, ...newPlans].sort((a, b) => {
        if (a.tooth === "FM") return -1;
        if (b.tooth === "FM") return 1;
        const toothDiff = parseInt(a.tooth) - parseInt(b.tooth);
        if (toothDiff !== 0) return toothDiff;
        return a.condition.localeCompare(b.condition);
      });

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
    if (!(patient as any).isDirect || !formDoctors?.length) return;

    const loggedInUserId = state.user?.id || "";
    const loggedInUserRole = String(state.user?.role || "").toLowerCase();
    const hasSelectedDoctor = formDoctors.some((d: any) => d.id === directDoctorId);

    if (hasSelectedDoctor) return;

    if (loggedInUserRole === "doctor") {
      const matchingDoctor = formDoctors.find((d: any) => d.id === loggedInUserId);
      if (matchingDoctor) {
        setDirectDoctorId(matchingDoctor.id);
        return;
      }
    }

    if (patient.doctorId && formDoctors.some((d: any) => d.id === patient.doctorId)) {
      setDirectDoctorId(patient.doctorId);
    }
  }, [patient, formDoctors, directDoctorId, state.user]);

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
    const idToUse = patient.patientId || patient.id;
    if (idToUse && !idToUse.startsWith("WALK-")) {
      refetchConsultations();
    }
  }, [patient.id, patient.patientId, refetchConsultations]);

  const { data: slotsData, isLoading: isLoadingSlots } = useAvailableSlotsQuery(
    consultationData.followUpRequired ? followUpDoctorId : null,
    consultationData.followUpRequired ? followUpDate : null
  );

  const sendMutation = useSendConsultationMutation();

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
      return { time24, time12, appointmentCount: s.appointment_count || 0, disabled: s.disabled === true };
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
    const toastId = toast.loading("Generating PDF report...");
    try {
      let finalConsultationData = { ...consultationData };
      try {
        const consultationId = createdConsultationId || initialData?.id || (patient as any).consultationId || patient.id;
        // Only fetch if it looks like a valid UUID (36 chars)
        if (consultationId && consultationId.length === 36) {
          const detailData = await fetchConsultationDetail(consultationId, type);
          if (detailData) {
            finalConsultationData = { ...finalConsultationData, ...detailData };
          }
        }
      } catch (fetchErr) {
        console.warn("Could not fetch extra details, using local state:", fetchErr);
      }

      await downloadConsultationPDF({
        type,
        patient: {
          ...patient,
          gender: patient.patientHistory?.gender || (patient as any).gender || "-",
          bloodGroup: patient.patientHistory?.bloodGroup || (patient as any).bloodGroup || (patient as any).blood_group || "-",
        },
        consultationData: finalConsultationData,
        toothChartState,
      });

      // Fire and forget the send API call so the user receives the document
      try {
        const cId = createdConsultationId || initialData?.id || (patient as any).consultationId || patient.id;
        if (cId && cId.length === 36 && !cId.startsWith("WALK-")) {
          await sendMutation.mutateAsync({ id: cId, type });
        }
      } catch (sendErr) {
        console.warn("Could not trigger send API call:", sendErr);
      }

      toast.success("PDF Downloaded successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to generate PDF", { id: toastId });
    }
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
      "2-1-1": { timing: "After Food", frequency: "Four times daily" },
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
          
          const dosageStr = updated.dosage || "";
          const durationVal = parseFloat(updated.duration) || 0;
          const durationUnit = updated.durationUnit || "Days";
          let multiplier = 1;
          if (durationUnit === "Weeks") multiplier = 7;
          else if (durationUnit === "Months") multiplier = 30;
          else if (durationUnit === "Years") multiplier = 365;

          const parts = dosageStr.split("-");
          let dosageSum = 0;
          if (parts.length === 3) {
            dosageSum = parts.reduce((sum, part) => sum + (parseFloat(part) || 0), 0);
          }
          
          if (field !== "qty" && dosageSum > 0 && durationVal > 0) {
            updated.qty = String(Math.round(dosageSum * durationVal * multiplier));
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
      rawImages: [...(prev.rawImages || []), ...files],
    }));
  };

  const handleXrayUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setConsultationData((prev) => ({
      ...prev,
      xrayFiles: [...prev.xrayFiles, ...imageUrls],
      rawXrays: [...(prev.rawXrays || []), ...files],
    }));
  };

  const removeImage = (index: number) => {
    setConsultationData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      rawImages: prev.rawImages ? prev.rawImages.filter((_, i) => i !== index) : [],
    }));
  };

  const removeXrayFile = (index: number) => {
    setConsultationData((prev) => ({
      ...prev,
      xrayFiles: prev.xrayFiles.filter((_, i) => i !== index),
      rawXrays: prev.rawXrays ? prev.rawXrays.filter((_, i) => i !== index) : [],
    }));
  };

  const updateTreatmentPlan = (index: number, field: string, value: any) => {
    const updatedPlans = [...consultationData.treatmentPlans];
    updatedPlans[index] = { ...updatedPlans[index], [field]: value };
    setConsultationData({ ...consultationData, treatmentPlans: updatedPlans });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if ((patient as any).isDirect && !directDoctorId) {
      newErrors.directDoctorId = "Doctor is required.";
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
    if ((patient as any).isDirect) {
      if (!directPatientName.trim()) {
        alert("Patient name is required for direct consultation.");
        return;
      }
      if (!directPatientPhone.trim()) {
        alert("Patient phone number is required for direct consultation.");
        return;
      }
      if (!directDoctorId) {
        setErrors((prev) => ({ ...prev, directDoctorId: "Doctor is required." }));
        return;
      }
    }
    if (!validateForm()) return;
    setLoading(true);
    try {
      const selectedDoctor = formDoctors.find((d: any) => d.id === directDoctorId);
      const res = await onCompleteConsultation({
        id: patient.id,
        patientId: patient.patientId || patient.id,
        patientName: patient.patientName || (patient as any).name || "",
        patientPhone: patient.phone || (patient as any).patientPhone || "",
        appointmentId: patient.appointmentId,
        ...consultationData,
        attachments: [...(consultationData.rawImages || []), ...(consultationData.rawXrays || [])],
        toothChartState,
        consultationDate: new Date().toISOString(),
        doctorId: (patient as any).isDirect ? directDoctorId : (patient.doctorId || "1"),
        doctorName: (patient as any).isDirect
          ? (selectedDoctor?.name || "")
          : (patient.doctorName || "Dr. Sharma"),
        status: "completed",
        followUpDoctorId,
        followUpDate,
        followUpTime: selectedSlot,
        directPatientName,
        directPatientPhone,
        isDirect: (patient as any).isDirect,
      });
      if (res && res.id) {
        setCreatedConsultationId(res.id);
      }
      setIsCompleted(true);
      const idToUse = patient.patientId || patient.id;
      if (idToUse && !idToUse.startsWith("WALK-")) {
        refetchConsultations();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        viewMode === "history"
          ? `Previous Consultations: ${(patient as any).isDirect ? (directPatientName || "New Patient") : patient.patientName}`
          : `Consultation: ${(patient as any).isDirect ? (directPatientName || "New Patient") : patient.patientName}`
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
            patient={patient}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {(patient as any).isDirect ? (
              <div className="mx-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <div className="space-y-1 text-left">
                  <Label className="text-xs font-bold text-primary">Patient Name <span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    placeholder="Enter Patient Name"
                    value={directPatientName}
                    onChange={(e) => setDirectPatientName(e.target.value)}
                    className="bg-background text-sm font-bold border-border/80"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <Label className="text-xs font-bold text-primary">Phone Number <span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    placeholder="Enter Phone Number"
                    value={directPatientPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[a-zA-Z]/g, "");
                      setDirectPatientPhone(val);
                    }}
                    className="bg-background text-sm font-bold border-border/80"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <Label className="text-xs font-bold text-primary">Doctor <span className="text-red-500">*</span></Label>
                  <SearchableSelect
                    value={directDoctorId}
                    onChange={(val) => {
                      setDirectDoctorId(val);
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.directDoctorId;
                        return next;
                      });
                    }}
                    options={formDoctors.map((doc: any) => ({
                      label: doc.name,
                      value: doc.id,
                      phone: doc.phone,
                      specialization: doc.specialization,
                      searchLabel: `${doc.name} ${doc.phone || ""}`,
                    }))}
                    renderOption={(doc: any) => (
                      <div className="flex flex-col min-w-0 py-1">
                        <span className="font-bold text-foreground text-xs">{doc.label}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {doc.specialization ? `${doc.specialization} • ` : ""}{doc.phone || "No phone"}
                        </span>
                      </div>
                    )}
                    renderValue={(option: any) => (
                      <span className="font-bold text-foreground">{option.label}</span>
                    )}
                    placeholder="Select Doctor"
                  />
                  {errors.directDoctorId && (
                    <p className="text-xs font-medium text-red-500 mt-1">{errors.directDoctorId}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mx-6 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-primary/5 p-4 rounded-2xl border border-primary/10 gap-3">
                <div>
                  <span className="text-xs font-bold text-muted-foreground">Patient Records:</span>
                  <div className="text-sm font-black text-foreground">Phone: {patient.phone || "-"}</div>
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
            )}

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
              defaultChartType={defaultChartType}
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
              recommendations={consultationData.recommendations}
              onChange={handleChange}
            />
          </form>
        )}
      </div>
    </Modal>
  );
}
