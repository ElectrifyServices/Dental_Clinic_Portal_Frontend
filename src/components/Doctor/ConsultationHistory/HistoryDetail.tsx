import type { ApiAny } from "../../../types/api";
import { DatePicker } from "@/components/ui/DatePicker";
import React, { useState, useEffect, useMemo } from "react";
import {
  Phone, Clock, Printer, Activity, Stethoscope, Pill, FileText,
  AlertCircle, IndianRupee, Calendar, Edit, Save, Check, Loader2, CheckCircle,
  HeartPulse, FileSpreadsheet, Send
} from "lucide-react";
import apiClient, { getFileUrl } from "../../../services/apiClient";
import { parseApiResponse } from "../../../services/parseApiResponse";
import { useDoctorsListQuery } from "../../../hooks/staff/useDoctorsListQuery";
import { useAvailableSlotsQuery } from "../../../hooks/appointments/useAvailableSlotsQuery";
import { useUpdateAppointmentMutation } from "../../../hooks/appointments/useUpdateAppointmentMutation";
import { SearchableSelect, Button, Label, Loading, Card, CardContent } from "@/components/ui";
import { getConsultationReportAvailability } from "../../../utils/consultationReportUtils";

interface HistoryDetailProps {
  record: ApiAny;
  onDownloadPDF: (record: ApiAny, type: ApiAny) => void;
  onSendPDF: (record: ApiAny, type: ApiAny) => void;
  onDeleteClick: (id: number, e: React.MouseEvent) => void;
}

export function HistoryDetail({ record, onDownloadPDF, onSendPDF, onDeleteClick: _onDeleteClick }: HistoryDetailProps) {
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [showSendMenu, setShowSendMenu] = useState(false);
  const [fullRecord, setFullRecord] = useState<ApiAny>(record);
  const [isLoadingFull, setIsLoadingFull] = useState(false);
  const [appointment, setAppointment] = useState<ApiAny>(null);
  const [isLoadingAppt, setIsLoadingAppt] = useState(false);
  const reportAvailability = getConsultationReportAvailability(fullRecord);

  useEffect(() => {
    const handleGlobalClick = () => {
      setShowPrintMenu(false);
      setShowSendMenu(false);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const getMedicalHistoryText = () => {
    if (fullRecord.conditions) return fullRecord.conditions;
    const p = fullRecord.patient;
    if (!p) return "";
    const list = p.medicalHistoryNames || p.medicalHistory || p.medical_histories || p.medicalHistories || [];
    return list.map((item: ApiAny) => typeof item === 'object' ? (item.name || item.history?.name || item.condition || item.history_name) : item).filter(Boolean).join(", ");
  };

  const getAllergiesText = () => {
    if (fullRecord.allergies) return fullRecord.allergies;
    const p = fullRecord.patient;
    if (!p) return "";
    const list = p.allergyNames || p.allergies || [];
    return list.map((item: ApiAny) => typeof item === 'object' ? (item.allergy_name || item.name) : item).filter(Boolean).join(", ");
  };

  // Edit Appointment States
  const [editMode, setEditMode] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [isSavingAppt, setIsSavingAppt] = useState(false);

  const { doctors: apiDoctors } = useDoctorsListQuery();
  const doctorsList = apiDoctors || [];

  const { data: slotsData, isLoading: isLoadingSlots } = useAvailableSlotsQuery(
    editMode ? selectedDoctorId : null,
    editMode ? selectedDate : null
  );

  const availableSlots = useMemo(() => {
    if (!slotsData?.data?.slots) return [];
    return slotsData.data.slots.map((s: ApiAny) => {
      const time24 = s.time;
      let time12 = time24;
      if (!time24.includes("AM") && !time24.includes("PM")) {
        const [h, m] = time24.split(":");
        const hour = parseInt(h);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        time12 = `${hour12}:${m} ${ampm}`;
      }
      return { time24, time12, appointmentCount: s.appointment_count || 0 };
    });
  }, [slotsData]);

  const updateMutation = useUpdateAppointmentMutation();

  // Fetch full detailed record and search for associated appointment
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoadingFull(true);
        const response = await apiClient.get(`/consultations/${record.id}`);
        const parsed = parseApiResponse(response.data);
        if (parsed.data) {
          const detailedData = (parsed.data as ApiAny).data || parsed.data;
          setFullRecord({ ...record, ...detailedData });

          // Try to get associated appointment directly from the response or record
          const pData: ApiAny = detailedData;
          const rec: ApiAny = record;

          // Helper to check if an object is non-empty
          const isNonEmptyObj = (x: ApiAny) => x && typeof x === 'object' && Object.keys(x).length > 0;

          let appt = null;

          // 1. Prioritize follow-up arrays
          if (Array.isArray(pData?.follow_up_appointments) && pData.follow_up_appointments.length > 0) {
            appt = pData.follow_up_appointments.find(isNonEmptyObj) || null;
          }
          if (!appt && Array.isArray(rec?.follow_up_appointments) && rec.follow_up_appointments.length > 0) {
            appt = rec.follow_up_appointments.find(isNonEmptyObj) || null;
          }

          // 2. Prioritize singular follow-up fields
          if (!appt) {
            const followUpKeys = [
              pData?.['follow-up-appointment'],
              pData?.follow_up_appointment,
              pData?.followup_appointment,
              pData?.followUpAppointment,
              pData?.follow_up_appointment_info,
              rec?.['follow-up-appointment'],
              rec?.follow_up_appointment,
              rec?.followup_appointment,
              rec?.followUpAppointment,
              rec?.follow_up_appointment_info
            ];
            appt = followUpKeys.find(isNonEmptyObj) || null;
          }

          const hasExplicitFollowUpArray = Array.isArray(pData?.follow_up_appointments) || Array.isArray(rec?.follow_up_appointments);

          if (appt) {
            setAppointment(appt);
          } else if (!hasExplicitFollowUpArray) {
            // Search appointment using patient ID and follow-up date if no array was provided
            const patientId = (parsed.data as ApiAny).patient_id || (parsed.data as ApiAny).patientId || record.patient_id || record.patientId;
            if (patientId) {
              setIsLoadingAppt(true);
              const apptListRes = await apiClient.post("/appointment/list", {
                filters: { patient_id: patientId }
              });
              const appts = apptListRes.data?.responseObject?.appointments ||
                (Array.isArray(apptListRes.data?.responseObject) ? apptListRes.data.responseObject : null) ||
                apptListRes.data?.responseObject?.data ||
                apptListRes.data?.data?.appointments ||
                apptListRes.data?.appointments || [];
              if (Array.isArray(appts) && appts.length > 0) {
                const followUpDateStr = (parsed.data as ApiAny).follow_up_date || record.follow_up_date;
                if (followUpDateStr) {
                  const targetDate = followUpDateStr.includes("T") ? followUpDateStr.split("T")[0] : followUpDateStr;
                  const match = appts.find((a: ApiAny) => {
                    const aDateStr = typeof a.date === 'string' && a.date.includes('T') ? a.date.split('T')[0] : a.date;
                    return aDateStr === targetDate;
                  });
                  if (match) {
                    setAppointment(match);
                  } else {
                    setAppointment(appts[0]); // fallback
                  }
                } else {
                  setAppointment(appts[0]);
                }
              }
              setIsLoadingAppt(false);
            }
          } else {
            setAppointment(null);
          }
        }
      } catch (_err) { /* leave the appointment as it was; `finally` stops the spinner */
      } finally {
        setIsLoadingFull(false);
      }
    };
    fetchDetails();
  // keyed on the id on purpose: `record` is a fresh object on every parent
  // render, so depending on it would refetch the details continuously
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.id]);

  const extractTime24 = (timeStr: string) => {
    if (!timeStr) return "";
    if (timeStr.includes("T")) {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        const hrs = date.getHours().toString().padStart(2, "0");
        const mins = date.getMinutes().toString().padStart(2, "0");
        return `${hrs}:${mins}`;
      }
    }
    return timeStr;
  };

  const getDoctorName = () => {
    if (appointment?.doctor?.name) return appointment.doctor.name;
    if (appointment?.personal_profile?.staff?.name) return appointment.personal_profile.staff.name;
    const docId = appointment?.doctor_id || appointment?.personal_profile?.staff?.id;
    const doc = doctorsList.find((d: ApiAny) => d.id === docId);
    return doc ? doc.name : "Doctor";
  };

  // Sync edit state values when appointment loads
  useEffect(() => {
    if (appointment) {
      const docId = appointment.doctor_id || appointment?.personal_profile?.staff?.id || "";
      setSelectedDoctorId(docId);
      let dateStr = "";
      if (appointment.date) {
        try {
          const d = new Date(appointment.date);
          if (!isNaN(d.getTime())) {
            dateStr = d.toISOString().split("T")[0];
          }
        } catch (_e) { /* unparseable date - keep the fallback string */ }
      }
      setSelectedDate(dateStr);
      setSelectedSlot(appointment.start_time ? extractTime24(appointment.start_time) : "");
    }
  }, [appointment]);

  try {
    const handleSaveAppointment = async () => {
      if (!appointment || !appointment.id) return;
      try {
        setIsSavingAppt(true);
        await updateMutation.mutateAsync({
          id: appointment.id,
          payload: {
            doctor_id: selectedDoctorId,
            date: selectedDate,
            start_time: selectedSlot
          }
        });
        // Refresh local display state
        setAppointment((prev: ApiAny) => ({
          ...prev,
          doctor_id: selectedDoctorId,
          date: selectedDate,
          start_time: selectedSlot,
          doctor: doctorsList.find((d: ApiAny) => d.id === selectedDoctorId) || prev.doctor
        }));
        setEditMode(false);
      } catch (_err) { /* save failed; `finally` clears the saving flag */
      } finally {
        setIsSavingAppt(false);
      }
    };

    const fmt = (d: ApiAny) => {
      if (!d) return "—";
      const date = new Date(d);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const fmtShort = (d: ApiAny) => {
      if (!d) return "—";
      const date = new Date(d);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    };

    const formatSlotTime = (timeStr: string) => {
      if (!timeStr) return "";
      const time24 = extractTime24(timeStr);
      if (time24.includes("AM") || time24.includes("PM")) return time24;
      const parts = time24.split(":");
      if (parts.length < 2) return timeStr;
      const h = parts[0];
      const m = parts[1];
      const hr = parseInt(h);
      if (isNaN(hr)) return timeStr;
      const ampm = hr >= 12 ? "PM" : "AM";
      const h12 = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
      return `${h12}:${m.substring(0, 2)} ${ampm}`;
    };

    const getMedName = (x: ApiAny) => {
      if (!x) return "";
      if (typeof x.medicine_name === "string") return x.medicine_name;
      if (typeof x.medicine === "string") return x.medicine;
      if (x.medicine?.name) return String(x.medicine.name);
      if (x.medicine_name?.name) return String(x.medicine_name.name);
      return String(x.medicine_name || x.medicine || "");
    };

    const hasValidPrescriptions = (p?: ApiAny[]) =>
      p && p.some(x => getMedName(x).trim() !== "");

    const formatTeeth = (toothInput: ApiAny) => {
      if (toothInput === undefined || toothInput === null) return "General";
      
      let teethArray: ApiAny[] = [];
      if (Array.isArray(toothInput)) {
        teethArray = toothInput;
      } else if (typeof toothInput === "string") {
        teethArray = toothInput.split(",").map(s => s.trim()).filter(Boolean);
      } else {
        teethArray = [toothInput];
      }
      
      const mapped = teethArray.map((t) => {
        const key = String(t).trim();
        if (key === "-1" || key.toUpperCase() === "FM" || key.includes("Full Mouth")) {
          return "Full Mouth";
        }
        return `Tooth #${key}`;
      });
      
      if (mapped.includes("Full Mouth") && mapped.length === 1) {
        return "Full Mouth";
      }
      
      return `${mapped.join(", ")}`;
    };

    const getToothConditionBadgeStyle = (condition: string) => {
      const cond = condition.toUpperCase();
      if (cond.includes("HEALTHY")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
      if (cond.includes("CARIES")) return "bg-red-50 text-red-700 border-red-200";
      if (cond.includes("MISSING")) return "bg-slate-100 text-slate-700 border-slate-300";
      if (cond.includes("ENDO") || cond.includes("RCT")) return "bg-purple-50 text-purple-700 border-purple-200";
      if (cond.includes("CROWN")) return "bg-amber-50 text-amber-700 border-amber-200";
      if (cond.includes("EXTRACTION")) return "bg-rose-50 text-rose-700 border-rose-200";
      return "bg-blue-50 text-blue-700 border-blue-200";
    };

    if (isLoadingFull) {
      return (
        <Loading type="spinner" text="Loading detailed report..." />
      );
    }

    return (
      <div className="space-y-4" onClick={() => setShowPrintMenu(false)}>
        {/* Patient Header Card */}
        <Card className="border-border bg-card rounded-2xl shadow-sm">
          <CardContent className="p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-lg shrink-0 overflow-hidden">
                {fullRecord.patient?.profile_picture_url || fullRecord.patient?.avatar ? (
                  <img
                    src={getFileUrl(fullRecord.patient.profile_picture_url || fullRecord.patient.avatar)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const fallbackText = parent.querySelector('.fallback-text');
                        if (fallbackText) (fallbackText as HTMLElement).style.display = 'block';
                      }
                    }}
                  />
                ) : null}
                <span
                  className="fallback-text"
                  style={{
                    display: (fullRecord.patient?.profile_picture_url || fullRecord.patient?.avatar) ? 'none' : 'block'
                  }}
                >
                  {fullRecord.patient?.name ? fullRecord.patient.name.charAt(0).toUpperCase() : "P"}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-foreground tracking-tight leading-snug mb-1.5 truncate">
                  {fullRecord.patient?.name || "Unknown Patient"}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                  {fullRecord.patient && (
                    <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full font-mono text-[10px] font-bold" title="Patient Code">
                      {fullRecord.patient.patient_code || String(fullRecord.patient.id).split("-")[0]}
                    </span>
                  )}
                  {fullRecord.patient?.phone && (
                    <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full">
                      <Phone className="w-3 h-3 text-muted-foreground/70" /> {fullRecord.patient.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full" title="Consultation Date">
                    <Clock className="w-3 h-3 text-muted-foreground/70" />
                    {fmt(fullRecord.created_at || fullRecord.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0">
              <div className="relative flex-1 sm:flex-initial min-w-0">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPrintMenu(!showPrintMenu);
                    setShowSendMenu(false);
                  }}
                  className={`w-full sm:w-auto gap-2 ${showPrintMenu ? "border-primary bg-primary/10 text-primary" : ""}`}
                >
                  <Printer className="w-4 h-4" /> Download Report
                </Button>
                {showPrintMenu && (
                  <div className="absolute left-0 top-full mt-2 w-56 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-xl z-30 py-2 animate-in fade-in zoom-in-95 duration-200 text-left">
                    <Button
                       onClick={(e) => {
                         if (!reportAvailability.clinical) return;
                         e.stopPropagation();
                         onDownloadPDF(fullRecord, "CLINICAL");
                         setShowPrintMenu(false);
                       }}
                       className={`w-full px-4 py-2.5 text-left text-xs font-bold flex justify-start items-center gap-3 transition-colors bg-transparent border-transparent h-auto rounded-none ${reportAvailability.clinical ? "text-muted-foreground hover:bg-muted cursor-pointer" : "opacity-50 cursor-not-allowed text-muted-foreground/60 hover:bg-transparent"}`}
                     >
                       <Activity className="w-4 h-4 text-primary shrink-0" /> Clinical Observations
                     </Button>
                    <Button
                      onClick={(e) => {
                        if (!reportAvailability.treatment) return;
                        e.stopPropagation();
                        onDownloadPDF(fullRecord, "TREATMENT");
                        setShowPrintMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs font-bold flex justify-start items-center gap-3 transition-colors bg-transparent border-transparent h-auto rounded-none ${reportAvailability.treatment ? "text-muted-foreground hover:bg-muted cursor-pointer" : "opacity-50 cursor-not-allowed text-muted-foreground/60 hover:bg-transparent"}`}
                    >
                      <Stethoscope className="w-4 h-4 text-primary shrink-0" /> Treatment Planning
                    </Button>
                    <Button
                      onClick={(e) => {
                        if (!reportAvailability.prescription) return;
                        e.stopPropagation();
                        onDownloadPDF(fullRecord, "PRESCRIPTION");
                        setShowPrintMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs font-bold flex justify-start items-center gap-3 transition-colors bg-transparent border-transparent h-auto rounded-none ${reportAvailability.prescription ? "text-muted-foreground hover:bg-muted cursor-pointer" : "opacity-50 cursor-not-allowed text-muted-foreground/60 hover:bg-transparent"}`}
                    >
                      <Pill className="w-4 h-4 text-primary shrink-0" /> Prescription Only
                    </Button>
                    <div className="h-px bg-border my-1.5" />
                     <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadPDF(fullRecord, "FULL");
                        setShowPrintMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-foreground hover:bg-muted flex justify-start items-center gap-3 transition-colors bg-transparent border-transparent h-auto rounded-none"
                    >
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" /> Full Summary
                     </Button>
                  </div>
                )}
              </div>

              <div className="relative flex-1 sm:flex-initial min-w-0">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSendMenu(!showSendMenu);
                    setShowPrintMenu(false);
                  }}
                  className={`w-full sm:w-auto gap-2 ${showSendMenu ? "border-primary bg-primary/10 text-primary" : ""}`}
                >
                  <Send className="w-4 h-4" /> Send Report
                </Button>
                {showSendMenu && (
                  <div className="absolute left-0 top-full mt-2 w-56 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-xl z-30 py-2 animate-in fade-in zoom-in-95 duration-200 text-left">
                    <Button
                      onClick={(e) => {
                        if (!reportAvailability.clinical) return;
                        e.stopPropagation();
                        onSendPDF(fullRecord, "CLINICAL");
                        setShowSendMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs font-bold flex justify-start items-center gap-3 transition-colors bg-transparent border-transparent h-auto rounded-none ${reportAvailability.clinical ? "text-muted-foreground hover:bg-muted cursor-pointer" : "opacity-50 cursor-not-allowed text-muted-foreground/60 hover:bg-transparent"}`}
                    >
                      <Activity className="w-4 h-4 text-primary shrink-0" /> Clinical Observations
                    </Button>
                    <Button
                      onClick={(e) => {
                        if (!reportAvailability.treatment) return;
                        e.stopPropagation();
                        onSendPDF(fullRecord, "TREATMENT");
                        setShowSendMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs font-bold flex justify-start items-center gap-3 transition-colors bg-transparent border-transparent h-auto rounded-none ${reportAvailability.treatment ? "text-muted-foreground hover:bg-muted cursor-pointer" : "opacity-50 cursor-not-allowed text-muted-foreground/60 hover:bg-transparent"}`}
                    >
                      <Stethoscope className="w-4 h-4 text-primary shrink-0" /> Treatment Planning
                    </Button>
                    <Button
                      onClick={(e) => {
                        if (!reportAvailability.prescription) return;
                        e.stopPropagation();
                        onSendPDF(fullRecord, "PRESCRIPTION");
                        setShowSendMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs font-bold flex justify-start items-center gap-3 transition-colors bg-transparent border-transparent h-auto rounded-none ${reportAvailability.prescription ? "text-muted-foreground hover:bg-muted cursor-pointer" : "opacity-50 cursor-not-allowed text-muted-foreground/60 hover:bg-transparent"}`}
                    >
                      <Pill className="w-4 h-4 text-primary shrink-0" /> Prescription Only
                    </Button>
                    <div className="h-px bg-border my-1.5" />
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendPDF(fullRecord, "FULL");
                        setShowSendMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-foreground hover:bg-muted flex justify-start items-center gap-3 transition-colors bg-transparent border-transparent h-auto rounded-none"
                    >
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" /> Full Summary
                    </Button>
                  </div>
                )}
              </div>
              {/* This button can be enabled in the future, so for now it's just been commented out. */}
              {/* <Button
              onClick={(e) => onDeleteClick(fullRecord.id, e)}
              className="flex items-center justify-center gap-2 text-sm font-bold text-red-600 hover:text-white px-5 py-2.5 rounded-xl hover:bg-red-600 transition-all border border-red-200 hover:border-red-600 shadow-sm bg-white flex-1 md:flex-initial h-auto"
            >
              <Trash2 className="w-4.5 h-4.5" /> Delete
            </Button> */}
            </div>
          </CardContent>
        </Card>

        {/* Main two-column layout: clinical narrative + quick-facts sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-4 min-w-0">
            {/* Observations & Diagnosis */}
            {(fullRecord.observations_desc || fullRecord.diagnosis_desc) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fullRecord.observations_desc && (
                  <Card className="border-border bg-card rounded-2xl shadow-sm">
                    <CardContent className="p-4 space-y-2.5">
                      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                        <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Observations</h4>
                      </div>
                      <p className="text-foreground text-sm font-medium leading-relaxed whitespace-pre-wrap">
                        {fullRecord.observations_desc}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {fullRecord.diagnosis_desc && (
                  <Card className="border-border bg-card rounded-2xl shadow-sm">
                    <CardContent className="p-4 space-y-2.5">
                      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                        <Stethoscope className="w-3.5 h-3.5 text-primary shrink-0" />
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Diagnosis</h4>
                      </div>
                      <p className="text-foreground text-sm font-medium leading-relaxed whitespace-pre-wrap">
                        {fullRecord.diagnosis_desc}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Tooth Chart Findings */}
            {fullRecord.tooth_findings && fullRecord.tooth_findings.length > 0 && (
              <Card className="border-border bg-card rounded-2xl shadow-sm">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                    <Activity className="w-3.5 h-3.5 text-primary shrink-0" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Tooth Chart Findings</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {fullRecord.tooth_findings.map((finding: ApiAny) => (
                      <div
                        key={finding.id || finding.tooth_number}
                        className={`border rounded-full px-3 py-1.5 text-xs flex items-center gap-2 font-semibold ${getToothConditionBadgeStyle(finding.condition)}`}
                      >
                        <span className="font-black">{finding.tooth_number === "FM" || String(finding.tooth_number) === "-1" ? "Full Mouth" : `Tooth #${finding.tooth_number}`}</span>
                        <span className="opacity-90">
                          {finding.condition === 'OTHER' && finding.other_condition ? finding.other_condition : finding.condition.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Treatment Plan & Cost Card */}
            {((fullRecord.treatment_plans && fullRecord.treatment_plans.length > 0) ||
              (fullRecord.treatments && fullRecord.treatments.length > 0) ||
              fullRecord.treatment_plan_description ||
              fullRecord.treatmentPlan ||
              fullRecord.treatment_plan) && (
                <Card className="border-border bg-card rounded-2xl shadow-sm">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-primary shrink-0" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Treatment Planning</h4>
                    </div>
                    {(fullRecord.treatment_plan_description || fullRecord.treatmentPlan || fullRecord.treatment_plan) && (
                      <p className="text-foreground text-sm font-medium leading-relaxed">
                        {fullRecord.treatment_plan_description || fullRecord.treatmentPlan || fullRecord.treatment_plan}
                      </p>
                    )}
                    {((fullRecord.treatment_plans || fullRecord.treatments || []).length > 0) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(fullRecord.treatment_plans || fullRecord.treatments || []).map((tp: ApiAny, index: number) => (
                          <div key={tp.id || tp.tooth_number || index} className="bg-muted/40 border border-border/60 rounded-lg px-3 py-2 text-sm flex justify-between items-center font-semibold">
                            <span className="text-foreground truncate">
                              {formatTeeth(tp.tooth_number !== undefined ? tp.tooth_number : tp.tooth)}: <span className="font-medium text-muted-foreground">{tp.treatment_name || tp.procedure}</span>
                            </span>
                            {(tp.cost > 0 || tp.est_cost > 0) && (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-xs font-bold shrink-0 ml-2">₹{(tp.cost || tp.est_cost).toLocaleString()}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

            {/* Prescriptions */}
            {hasValidPrescriptions(fullRecord.prescriptions) && (
              <Card className="border-border bg-card rounded-2xl shadow-sm">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                    <Pill className="w-3.5 h-3.5 text-primary shrink-0" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Prescribed Medicines</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {fullRecord.prescriptions?.map((p: ApiAny) => {
                      const medName = getMedName(p);
                      return medName.trim() ? (
                        <div key={p.id} className="bg-muted/40 border border-border/60 rounded-lg p-3 text-sm flex flex-col justify-between gap-1.5">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-foreground text-sm">{medName}</span>
                            {p.qty && <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">Qty: {p.qty}</span>}
                          </div>
                          <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground font-medium">
                            {p.dosage && <span className="bg-card px-1.5 py-0.5 rounded border border-border/60">Dosage: {p.dosage}</span>}
                            {p.timing && <span className="bg-card px-1.5 py-0.5 rounded border border-border/60">{p.timing}</span>}
                            {p.frequency && <span className="bg-card px-1.5 py-0.5 rounded border border-border/60">{p.frequency}</span>}
                            {p.duration && <span className="bg-card px-1.5 py-0.5 rounded border border-border/60">Duration: {p.duration} {p.duration_type || p.durationUnit || "Days"}</span>}
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations, Tests & Next Visit */}
            {(fullRecord.recommendations || fullRecord.tests || fullRecord.next_visit || fullRecord.nextVisit) && (
              <Card className="border-border bg-card rounded-2xl shadow-sm">
                <CardContent className="p-4 space-y-3">
                  {fullRecord.recommendations && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Recommendations</h4>
                      </div>
                      <p className="text-foreground text-sm font-medium leading-relaxed">{fullRecord.recommendations}</p>
                    </div>
                  )}
                  {fullRecord.tests && (
                    <div className={`space-y-1.5 ${fullRecord.recommendations ? "pt-2 border-t border-border/60" : ""}`}>
                      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                        <Activity className="w-3.5 h-3.5 text-primary shrink-0" />
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Prescribed Tests</h4>
                      </div>
                      <p className="text-foreground text-sm font-medium">{fullRecord.tests}</p>
                    </div>
                  )}
                  {(fullRecord.next_visit || fullRecord.nextVisit) && (
                    <div className={`space-y-1.5 ${(fullRecord.recommendations || fullRecord.tests) ? "pt-2 border-t border-border/60" : ""}`}>
                      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Next Visit Note</h4>
                      </div>
                      <p className="text-foreground text-sm font-medium">{fullRecord.next_visit || fullRecord.nextVisit}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {fullRecord.additional_notes && (
              <Card className="border-border bg-card rounded-2xl shadow-sm">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                    <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Additional Notes</h4>
                  </div>
                  <p className="text-foreground text-sm font-medium leading-relaxed whitespace-pre-wrap">{fullRecord.additional_notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Files & Reports (Lab Reports, Clinical Images, Attachments, X-Rays combined) */}
            {(() => {
              const labFiles = fullRecord.labFiles || fullRecord.lab_files || [];
              const hasLab = labFiles.length > 0;
              const hasImages = fullRecord.images && fullRecord.images.length > 0;
              const hasAttachments = fullRecord.attachments && fullRecord.attachments.length > 0;
              const hasXray = fullRecord.xrayFiles && fullRecord.xrayFiles.length > 0;
              if (!hasLab && !hasImages && !hasAttachments && !hasXray) return null;
              return (
                <Card className="border-border bg-card rounded-2xl shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                      <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Files &amp; Reports</h4>
                    </div>

                    {hasLab && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lab Reports</span>
                        <div className="flex flex-wrap gap-2">
                          {labFiles.map((file: ApiAny, idx: number) => {
                            const url = typeof file === 'string' ? file : file.url;
                            const name = typeof file === 'string' ? `Lab Report ${idx + 1}` : file.name || `Report ${idx + 1}`;
                            return (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-muted/40 hover:bg-muted border border-border/60 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2 font-bold text-primary hover:underline transition-all duration-200"
                              >
                                <FileText className="w-3.5 h-3.5" /> {name}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {hasImages && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Clinical Images</span>
                        <div className="flex flex-wrap gap-2.5">
                          {fullRecord.images.map((imgUrl: string, idx: number) => (
                            <img
                              key={idx}
                              src={imgUrl}
                              alt={`Clinical ${idx + 1}`}
                              className="w-16 h-16 rounded-lg object-cover border border-border cursor-pointer hover:scale-105 hover:shadow-md transition-all duration-300"
                              onClick={() => window.open(imgUrl, "_blank")}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {hasAttachments && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Attachments</span>
                        <div className="flex flex-wrap gap-2.5">
                          {fullRecord.attachments.map((attachment: ApiAny, idx: number) => {
                            const isImage = attachment.file_type?.startsWith("image/") || attachment.file_name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                            return isImage ? (
                              <img
                                key={attachment.id || idx}
                                src={attachment.file_url}
                                alt={attachment.file_name}
                                title={attachment.file_name}
                                className="w-16 h-16 rounded-lg object-cover border border-border cursor-pointer hover:scale-105 hover:shadow-md transition-all duration-300"
                                onClick={() => window.open(attachment.file_url, "_blank")}
                              />
                            ) : (
                              <a
                                key={attachment.id || idx}
                                href={attachment.file_url}
                                target="_blank"
                                rel="noreferrer"
                                title={attachment.file_name}
                                className="bg-muted/40 hover:bg-muted border border-border/60 rounded-lg w-16 h-16 flex flex-col items-center justify-center gap-1 p-1.5 text-center text-[10px] font-bold text-primary hover:underline transition-all duration-200"
                              >
                                <FileText className="w-4 h-4" />
                                <span className="truncate w-full">{attachment.file_name}</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {hasXray && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">X-Ray Reports</span>
                        <div className="flex flex-wrap gap-2.5">
                          {fullRecord.xrayFiles.map((imgUrl: string, idx: number) => (
                            <img
                              key={idx}
                              src={imgUrl}
                              alt={`X-Ray ${idx + 1}`}
                              className="w-16 h-16 rounded-lg object-cover border border-border cursor-pointer hover:scale-105 hover:shadow-md transition-all duration-300"
                              onClick={() => window.open(imgUrl, "_blank")}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
          </div>

          {/* Sidebar: quick facts */}
          <div className="space-y-4 min-w-0">
            {/* Medical History Card */}
            {(() => {
              const conditionsText = getMedicalHistoryText();
              const allergiesText = getAllergiesText();
              const hasHistory = allergiesText || conditionsText || fullRecord.visits || fullRecord.lastVisit;
              if (!hasHistory) return null;
              return (
                <Card className="border-border bg-card rounded-2xl shadow-sm">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                      <Stethoscope className="w-3.5 h-3.5 text-primary shrink-0" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Medical History</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      {allergiesText && (
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground block mb-0.5 uppercase tracking-wider">Allergies</span>
                          <span className="text-foreground font-medium">{allergiesText}</span>
                        </div>
                      )}
                      {conditionsText && (
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground block mb-0.5 uppercase tracking-wider">Medical Conditions</span>
                          <span className="text-foreground font-medium">{conditionsText}</span>
                        </div>
                      )}
                      {(fullRecord.visits || fullRecord.lastVisit) && (
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground pt-2 border-t border-border/60 font-semibold">
                          {fullRecord.visits && <span className="bg-muted px-2 py-0.5 rounded-full">Total Visits: {fullRecord.visits}</span>}
                          {fullRecord.lastVisit && <span className="bg-muted px-2 py-0.5 rounded-full">Last Visit: {fullRecord.lastVisit}</span>}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Vitals Card */}
            {(fullRecord.bp || fullRecord.height || fullRecord.weight || fullRecord.bmi) && (
              <Card className="border-border bg-card rounded-2xl shadow-sm">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                    <HeartPulse className="w-3.5 h-3.5 text-primary shrink-0" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Patient Vitals</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {fullRecord.bp && (
                      <div className="bg-muted/40 p-2.5 rounded-lg border border-border/60">
                        <span className="text-[9px] font-black text-muted-foreground block mb-0.5 uppercase tracking-widest">BP</span>
                        <span className="text-foreground text-sm font-bold">{fullRecord.bp} <span className="text-[10px] font-semibold text-muted-foreground">mmHg</span></span>
                      </div>
                    )}
                    {fullRecord.height && (
                      <div className="bg-muted/40 p-2.5 rounded-lg border border-border/60">
                        <span className="text-[9px] font-black text-muted-foreground block mb-0.5 uppercase tracking-widest">Height</span>
                        <span className="text-foreground text-sm font-bold">{fullRecord.height} <span className="text-[10px] font-semibold text-muted-foreground">cm</span></span>
                      </div>
                    )}
                    {fullRecord.weight && (
                      <div className="bg-muted/40 p-2.5 rounded-lg border border-border/60">
                        <span className="text-[9px] font-black text-muted-foreground block mb-0.5 uppercase tracking-widest">Weight</span>
                        <span className="text-foreground text-sm font-bold">{fullRecord.weight} <span className="text-[10px] font-semibold text-muted-foreground">kg</span></span>
                      </div>
                    )}
                    {fullRecord.bmi && (
                      <div className="bg-muted/40 p-2.5 rounded-lg border border-border/60">
                        <span className="text-[9px] font-black text-muted-foreground block mb-0.5 uppercase tracking-widest">BMI</span>
                        <span className="text-foreground text-sm font-bold">{fullRecord.bmi}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cost & Follow-up quick facts */}
            {(fullRecord.total_estimated_cost > 0 || (fullRecord.is_follow_up && fullRecord.follow_up_date && !appointment)) && (
              <Card className="border-border bg-card rounded-2xl shadow-sm">
                <CardContent className="p-4 space-y-3">
                  {fullRecord.total_estimated_cost !== undefined && fullRecord.total_estimated_cost > 0 && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-primary shrink-0" /> Procedure Fee
                      </span>
                      <span className="text-base font-black text-foreground">₹{fullRecord.total_estimated_cost.toLocaleString()}</span>
                    </div>
                  )}
                  {fullRecord.is_follow_up && fullRecord.follow_up_date && !appointment && (
                    <div className={fullRecord.total_estimated_cost > 0 ? "pt-3 border-t border-border/60 flex items-center justify-between gap-2" : "flex items-center justify-between gap-2"}>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" /> Follow-up Date
                      </span>
                      <span className="text-sm font-bold text-foreground">{fmtShort(fullRecord.follow_up_date)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Associated Appointment & Scheduling Section */}
        {isLoadingAppt ? (
          <Card className="border-border bg-card rounded-2xl shadow-sm">
            <CardContent className="p-4 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-xs font-semibold text-muted-foreground">Checking scheduled appointments...</span>
            </CardContent>
          </Card>
        ) : appointment ? (
          <Card className="border-border bg-card rounded-2xl shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Follow-up Appointment Scheduling</h4>
                </div>
                {!editMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(true)}
                    className="gap-1.5"
                  >
                    <Edit className="w-3 h-3" /> Edit Appointment
                  </Button>
                )}
              </div>

              {!editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-muted/40 border border-border/60 p-3 rounded-lg">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-0.5">Assigned Doctor</span>
                    <span className="text-foreground text-sm font-bold">{getDoctorName()}</span>
                  </div>
                  <div className="bg-muted/40 border border-border/60 p-3 rounded-lg">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-0.5">Appointment Date</span>
                    <span className="text-foreground text-sm font-bold">{fmtShort(appointment.date)}</span>
                  </div>
                  <div className="bg-muted/40 border border-border/60 p-3 rounded-lg">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-0.5">Time Slot</span>
                    <span className="text-foreground text-sm font-bold">{formatSlotTime(appointment.start_time)}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="block text-xs font-semibold mb-1.5 text-muted-foreground">
                        Assign Doctor
                      </Label>
                      <SearchableSelect
                        value={selectedDoctorId}
                        onChange={(val) => {
                          setSelectedDoctorId(val);
                          setSelectedSlot("");
                        }}
                        options={doctorsList.map((d: ApiAny) => ({
                          label: `${d.name} (${d.specialization || "Doctor"})`,
                          value: d.id
                        }))}
                        placeholder="Select Doctor"
                        className="h-10 bg-muted/50"
                      />
                    </div>

                    <div>
                      <Label className="block text-xs font-semibold mb-1.5 text-muted-foreground">
                        Preferred Date
                      </Label>
                      <DatePicker
                        value={selectedDate}
                        onChange={(val) => {
                          setSelectedDate(val);
                          setSelectedSlot("");
                        }}
                        min={new Date().toISOString().split("T")[0]}
                        className="h-10 bg-muted/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="block text-xs font-semibold mb-1.5 text-muted-foreground">
                      Available Slots
                    </Label>
                    {isLoadingSlots ? (
                      <div className="flex items-center gap-2 py-3">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        <span className="text-xs text-muted-foreground">Checking slot availability...</span>
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-3 border border-border/60 rounded-lg bg-muted/20">
                        {availableSlots.map((slot) => {
                          const isSelected = selectedSlot === slot.time24;
                          return (
                            <Button
                              key={slot.time24}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedSlot(slot.time24)}
                              className="gap-1.5"
                            >
                              {isSelected && <CheckCircle className="w-3 h-3 shrink-0" />}
                              {slot.time12} ({slot.appointmentCount})
                            </Button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-5 bg-muted/20 border border-dashed border-border rounded-lg">
                        <p className="text-xs text-muted-foreground italic">No slots available for this doctor on this date.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2.5 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveAppointment}
                      disabled={isSavingAppt || !selectedSlot}
                      size="sm"
                      className="gap-1.5"
                    >
                      {isSavingAppt ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" /> Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    );
  } catch (error: ApiAny) {
    console.error("Error in HistoryDetail render:", error);
    return (
      <div className="p-6 text-center space-y-2 bg-red-50/20 border border-red-100 rounded-xl">
        <p className="text-red-500 font-bold">Failed to display history details.</p>
        <p className="text-xs text-muted-foreground font-mono">{error?.stack || error?.message || String(error)}</p>
      </div>
    );
  }
}
