import React, { useState, useEffect } from "react";
import { CheckCircle, History, ArrowLeft } from "lucide-react";
import {
  downloadConsultationPDF,
  PDFReportType,
} from "../../utils/pdfGenerator";
import { Modal, Button, Input, Label, SearchableSelect } from "@/components/ui";
import { CountryCodeSelect } from "@/components/ui/CountryCodeSelect";
import { fetchConsultationDetail } from "../../hooks/consultation/useConsultationQuery";
import { formatPhoneWithCountryCode } from "../../utils/phoneUtils";

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
import { usePatientQuery } from "../../hooks/patients/usePatientQuery";
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
  const findConsultationId = (payload: any, depth = 0): string | undefined => {
    if (!payload || depth > 4) return undefined;
    if (typeof payload.id === "string" && payload.id.length === 36) return payload.id;
    if (typeof payload.consultation_id === "string" && payload.consultation_id.length === 36) {
      return payload.consultation_id;
    }
    if (typeof payload !== "object") return undefined;
    for (const value of Object.values(payload)) {
      if (value && typeof value === "object") {
        const nestedId = findConsultationId(value, depth + 1);
        if (nestedId) return nestedId;
      }
    }
    return undefined;
  };

  const { state } = useAuth();
  const isEditMode = !!(patient as any).isEditMode;

  const originalSessionsMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    if (initialData?.consultationData?.treatmentPlans) {
      initialData.consultationData.treatmentPlans.forEach((plan: any) => {
        if (plan.id) {
          map[plan.id] = plan.sessions || 1;
        }
      });
    }
    return map;
  }, [initialData]);

  const [isCompleted, setIsCompleted] = useState(false);
  const [createdConsultationId, setCreatedConsultationId] = useState<string | null>(null);
  const [selectedExistingDirectPatientId, setSelectedExistingDirectPatientId] = useState<string | undefined>(
    (patient as any).isDirect ? ((patient as any).patientId || undefined) : undefined,
  );
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"form" | "history">("form");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [directPatientName, setDirectPatientName] = useState((patient as any).isDirect ? (patient.patientName || "") : "");
  const [directCountryCode, setDirectCountryCode] = useState((patient as any).isDirect ? ((patient as any).country_code || "+91") : "+91");
  const [directPatientPhone, setDirectPatientPhone] = useState((patient as any).isDirect ? (patient.phone || "") : "");
  const [directDoctorId, setDirectDoctorId] = useState(
    (patient as any).isDirect ? (patient.doctorId || "") : "",
  );
  const [directPatientId, setDirectPatientId] = useState<string | undefined>(
    (patient as any).isDirect ? ((patient as any).patientId || undefined) : undefined
  );
  const [focusedField, setFocusedField] = useState<"name" | "phone" | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const activeSearchTerm = (directPatientName || directPatientPhone || "").trim();
  const debouncedSearch = useDebounce(activeSearchTerm, 400);

  const { data: rawPatientsData, isLoading: isPatientsLoading, isFetching: isPatientsFetching } = usePatientQuery({
    page: 1,
    limit: 100,
    search: debouncedSearch || undefined,
    filters: { isDropdown: [true] as any },
  }, {
    enabled: !!debouncedSearch.trim()
  });

  const extractPatients = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const target = data.responseObject !== undefined ? data.responseObject : data;
    if (Array.isArray(target)) return target;
    if (target && typeof target === "object") {
      if (Array.isArray(target.data?.data?.data)) return target.data.data.data;
      if (Array.isArray(target.data?.data)) return target.data.data;
      if (Array.isArray(target.data)) return target.data;
      if (Array.isArray(target.patients)) return target.patients;
      if (Array.isArray(target.data?.patients)) return target.data.patients;
    }
    return [];
  };

  const apiPatients = React.useMemo(() => {
    const rawList = extractPatients(rawPatientsData);
    return rawList.map((p: any) => ({
      ...p,
      id: p.id || p.patient_id,
      name: p.name || p.full_name || p.patient_name || "",
      phone: p.phone || p.mobile || p.mobile_number || p.patient_phone || "",
    }));
  }, [rawPatientsData]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFocusedField(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPatient = (p: any) => {
    const pName = p.name || p.full_name || p.patient_name || "";
    const rawPhone = p.phone || p.mobile || p.mobile_number || p.patient_phone || "";
    
    let selectedCountryCode = p.country_code || p.countryCode || "";
    let cleanPhone = rawPhone.replace(/\D/g, "");

    if (!selectedCountryCode) {
      if (rawPhone.startsWith("+1")) selectedCountryCode = "+1";
      else if (rawPhone.startsWith("+91")) selectedCountryCode = "+91";
      else if (rawPhone.startsWith("+44")) selectedCountryCode = "+44";
      else if (rawPhone.startsWith("+971")) selectedCountryCode = "+971";
      else selectedCountryCode = "+91";
    }

    const codeDigits = selectedCountryCode.replace(/\D/g, "");
    if (codeDigits && cleanPhone.length > 10 && cleanPhone.startsWith(codeDigits)) {
      cleanPhone = cleanPhone.slice(codeDigits.length);
    }
    cleanPhone = cleanPhone.slice(-10);

    setDirectPatientName(pName);
    setDirectPatientPhone(cleanPhone);
    setDirectCountryCode(selectedCountryCode);
    setDirectPatientId(p.id);
    setSelectedExistingDirectPatientId(p.id);

    if (errors.directPatientName || errors.directPatientPhone) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.directPatientName;
        delete next.directPatientPhone;
        return next;
      });
    }

    setFocusedField(null);
  };

  const renderPatientDropdown = () => {
    if (!focusedField) return null;

    const searchTerm = focusedField === "name" 
      ? (directPatientName || "").toLowerCase().trim() 
      : (directPatientPhone || "").toLowerCase().trim();

    // The apiPatients list is already searched/filtered by the backend. Local filtering is disabled
    // to prevent mismatch from typos, fuzzy matching, or loading/debounce state.
    const filteredPatients = apiPatients.slice(0, 10);

    return (
      <div className="absolute top-[72px] left-0 w-full z-50 bg-card border border-border/80 rounded-xl shadow-modal overflow-hidden">
        <div className="p-2 bg-muted/45 border-b border-border/40 text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-primary">
             Select existing patient or keep typing to add new
          </span>
          {isPatientsFetching && (
            <span className="text-[10px] font-bold text-primary flex items-center gap-1">
              Searching...
            </span>
          )}
        </div>
        
        {isPatientsLoading && apiPatients.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground font-semibold">
            Loading...
          </div>
        ) : filteredPatients.length > 0 ? (
          <ul className="max-h-52 overflow-y-auto p-1 divide-y divide-border/20">
            {filteredPatients.map((p: any, idx: number) => {
              const pCode = p.country_code || p.countryCode || "+91";
              return (
                <li
                  key={p.id || p.patient_id || idx}
                  className="px-3 py-2 flex justify-between items-center hover:bg-muted/70 rounded-lg cursor-pointer transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectPatient(p);
                  }}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-sm font-bold text-foreground truncate">{p.name || p.full_name}</span>
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                      <span className="text-primary font-bold">{pCode}</span>
                      <span>{p.phone}</span>
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md uppercase shrink-0">
                    Select
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-4 text-center text-xs text-muted-foreground font-semibold">
            No matching patients found. A new patient will be created.
          </div>
        )}
      </div>
    );
  };

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
      treatmentPlans: initialData?.consultationData?.treatmentPlans || [
        {
          id: `plan-${Date.now()}`,
          tooth: "",
          procedure: "",
          sessions: 1,
          cost: 0,
          discount: 0,
          isActive: true,
          planDate: new Date().toISOString().split("T")[0],
          status: "planned",
        }
      ],
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

  // Removed auto-sync useEffect between toothChartState and treatmentPlans as per user request to manage treatments manually.

  const handleAddTreatmentPlan = () => {
    setConsultationData((prev) => ({
      ...prev,
      treatmentPlans: [
        ...(prev.treatmentPlans || []),
        {
          id: `plan-${Date.now()}`,
          tooth: "",
          procedure: "",
          sessions: 1,
          cost: 0,
          discount: 0,
          isActive: true,
          planDate: new Date().toISOString().split("T")[0],
          status: "planned",
        }
      ]
    }));
  };

  const handleRemoveTreatmentPlan = (index: number) => {
    setConsultationData((prev) => {
      const newPlans = [...(prev.treatmentPlans || [])];
      newPlans.splice(index, 1);
      return {
        ...prev,
        treatmentPlans: newPlans,
      };
    });
  };


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

  const handleDownloadPDF = async (
    type: PDFReportType = "FULL",
    consultationIdOverride?: string,
    skipSendApi?: boolean,
  ) => {
    const toastId = toast.loading("Generating PDF report...");
    try {
      let finalConsultationData = { ...consultationData };
      try {
        const consultationId =
          consultationIdOverride ||
          createdConsultationId ||
          initialData?.id ||
          (patient as any).consultationId ||
          patient.id;
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
        const cId =
          consultationIdOverride ||
          createdConsultationId ||
          initialData?.id ||
          (patient as any).consultationId ||
          patient.id;
        if (!skipSendApi && cId && cId.length === 36 && !cId.startsWith("WALK-")) {
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
    const files = Array.from(e.target.files || []).filter(file => {
      const isImageType = file.type.startsWith("image/");
      const isBmpExtension = file.name.toLowerCase().endsWith(".bmp");
      return isImageType || isBmpExtension;
    });
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

    if ((patient as any).isDirect) {
      if (!directPatientName.trim()) {
        newErrors.directPatientName = "Patient name is required.";
      }
      if (!directPatientPhone.trim()) {
        newErrors.directPatientPhone = "Phone number is required.";
      }
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
      const selectedDoctor = formDoctors.find((d: any) => d.id === directDoctorId);
      
      let cleanedNotes = consultationData.consultationNotes || "";
      cleanedNotes = cleanedNotes.replace(/(?:^|\n)\s*(?:\d+\.|[•\-])\s*$/, "").trimEnd();

      const validPrescriptions = (consultationData.prescriptions || []).filter(
        (p: any) => p.medicine && p.medicine.trim() !== ""
      );

      const mappedTreatmentPlans = consultationData.requiresTreatment
        ? (consultationData.treatmentPlans || [])
            .filter((plan: any) => plan.procedure && plan.procedure.trim() !== "")
            .map((plan: any) => {
              let toothArray: string[] = [];
              if (Array.isArray(plan.tooth)) {
                toothArray = plan.tooth;
              } else if (typeof plan.tooth === "string" && plan.tooth.trim()) {
                toothArray = plan.tooth.split(",").map((s: string) => s.trim()).filter(Boolean);
              }

              const discountPct = Number(plan.discount) || 0;

              return {
                ...plan,
                tooth: toothArray,
                discount_value: discountPct,
              };
            })
        : [];

      const res = await onCompleteConsultation({
        id: patient.id,
        patientId: directPatientId || patient.patientId || patient.id,
        patientName: patient.patientName || (patient as any).name || "",
        patientPhone: patient.phone || (patient as any).patientPhone || "",
        appointmentId: patient.appointmentId,
        ...consultationData,
        prescriptions: validPrescriptions,
        treatmentPlans: mappedTreatmentPlans,
        consultationNotes: cleanedNotes,
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
        directCountryCode,
        directPatientPhone,
        isDirect: (patient as any).isDirect,
      });
      const returnedConsultationId = findConsultationId(res);
      const completedConsultationId =
        returnedConsultationId ||
        createdConsultationId ||
        initialData?.id ||
        (patient as any).consultationId ||
        patient.id;
      if (completedConsultationId) {
        setCreatedConsultationId(String(completedConsultationId));
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
          : `${(patient as any).isEditMode ? "Edit Consultation" : "Consultation"}: ${(patient as any).isDirect ? (directPatientName || "New Patient") : patient.patientName}`
      }
      subtitle={
        viewMode === "history"
          ? "Complete dental checkup records and prescription history"
          : undefined
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
          <CompletionView onDownloadPDF={handleDownloadPDF} onClose={onClose} record={consultationData} />
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
              <div className="mx-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10" ref={dropdownRef}>
                <div className="space-y-1 text-left relative">
                  <Label className="text-xs font-bold text-primary">Patient Name <span className="text-red-500">*</span></Label>
                   <Input
                    type="text"
                    name="directPatientName"
                    placeholder="Enter Patient Name"
                    value={directPatientName}
                    onFocus={() => setFocusedField("name")}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      val = val.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
                      setDirectPatientName(val);
                      setDirectPatientId(undefined);
                      setSelectedExistingDirectPatientId(undefined);
                      setFocusedField("name");
                      if (errors.directPatientName) {
                        setErrors((prev) => { const n = { ...prev }; delete n.directPatientName; return n; });
                      }
                    }}
                    autoComplete="off"
                    className="bg-background text-sm font-bold border-border/80"
                  />
                  {focusedField === "name" && renderPatientDropdown()}
                  {errors.directPatientName && (
                    <p className="text-xs font-medium text-red-500 mt-1">{errors.directPatientName}</p>
                  )}
                </div>
                <div className="space-y-1 text-left relative">
                  <Label className="text-xs font-bold text-primary">Phone Number <span className="text-red-500">*</span></Label>
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <CountryCodeSelect
                      value={directCountryCode}
                      onChange={(val) => setDirectCountryCode(val)}
                      className="bg-background text-sm font-bold border-border/80 h-10"
                    />
                    <Input
                      type="text"
                      name="directPatientPhone"
                      maxLength={10}
                      placeholder="Enter Phone Number"
                      value={directPatientPhone}
                      onFocus={() => setFocusedField("phone")}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setDirectPatientPhone(val);
                        setDirectPatientId(undefined);
                        setSelectedExistingDirectPatientId(undefined);
                        setFocusedField("phone");
                        if (errors.directPatientPhone) {
                          setErrors((prev) => { const n = { ...prev }; delete n.directPatientPhone; return n; });
                        }
                      }}
                      autoComplete="off"
                      className="bg-background text-sm font-bold border-border/80 flex-1 h-10"
                    />
                  </div>
                  {focusedField === "phone" && renderPatientDropdown()}
                  {errors.directPatientPhone && (
                    <p className="text-xs font-medium text-red-500 mt-1">{errors.directPatientPhone}</p>
                  )}
                </div>
                {/* We have discussed this, it will be useful to us in the future */}
                {/* <div className="space-y-1 text-left">
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
                </div> */}
              </div>
            ) : (
              <div className="mx-6 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-primary/5 p-4 rounded-2xl border border-primary/10 gap-3">
                <div>
                  <span className="text-xs font-bold text-muted-foreground">Patient Records:</span>
                  <div className="text-sm font-black text-foreground">Phone: {formatPhoneWithCountryCode(patient.phone, (patient as any).country_code)}</div>
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
              toothChartState={toothChartState}
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
              onAddPlan={handleAddTreatmentPlan}
              onRemovePlan={handleRemoveTreatmentPlan}
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
              isEditMode={isEditMode}
              originalSessionsMap={originalSessionsMap}
            />

            <FollowUpScheduler
              followUpRequired={consultationData.followUpRequired}
              bookedFollowUp={bookedFollowUp}
              followUpDoctorId={followUpDoctorId}
              followUpDate={followUpDate}
              selectedSlot={selectedSlot}
              initialSelectedSlot={initialData?.selectedSlot}
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
