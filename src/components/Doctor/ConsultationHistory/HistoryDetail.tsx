import { Input } from "@/components/ui/Input";
import React, { useState, useEffect, useMemo } from "react";
import {
  Phone, Clock, Printer, Activity, Stethoscope, Pill, FileText, Trash2,
  AlertCircle, IndianRupee, Calendar, Image as ImageIcon, Camera, Edit, Save, X, Check, Loader2, CheckCircle,
  FileCode, User, HeartPulse, FileSpreadsheet, Send
} from "lucide-react";
import apiClient from "../../../services/apiClient";
import { parseApiResponse } from "../../../services/parseApiResponse";
import { useDoctorsListQuery } from "../../../hooks/staff/useDoctorsListQuery";
import { useAvailableSlotsQuery } from "../../../hooks/appointments/useAvailableSlotsQuery";
import { useUpdateAppointmentMutation } from "../../../hooks/appointments/useUpdateAppointmentMutation";
import { SearchableSelect, Button, Label, Loading, Card, CardContent } from "@/components/ui";

interface HistoryDetailProps {
  record: any;
  onDownloadPDF: (record: any, type: any) => void;
  onSendPDF: (record: any, type: any) => void;
  onDeleteClick: (id: number, e: React.MouseEvent) => void;
}

export function HistoryDetail({ record, onDownloadPDF, onSendPDF, onDeleteClick }: HistoryDetailProps) {
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [showSendMenu, setShowSendMenu] = useState(false);
  const [fullRecord, setFullRecord] = useState<any>(record);
  const [isLoadingFull, setIsLoadingFull] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);
  const [isLoadingAppt, setIsLoadingAppt] = useState(false);

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
    return list.map((item: any) => typeof item === 'object' ? (item.name || item.history?.name || item.condition || item.history_name) : item).filter(Boolean).join(", ");
  };

  const getAllergiesText = () => {
    if (fullRecord.allergies) return fullRecord.allergies;
    const p = fullRecord.patient;
    if (!p) return "";
    const list = p.allergyNames || p.allergies || [];
    return list.map((item: any) => typeof item === 'object' ? (item.allergy_name || item.name) : item).filter(Boolean).join(", ");
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
          const detailedData = parsed.data.data || parsed.data;
          setFullRecord({ ...record, ...detailedData });

          // Try to get associated appointment directly from the response or record
          const pData: any = detailedData;
          const rec: any = record;

          // Helper to check if an object is non-empty
          const isNonEmptyObj = (x: any) => x && typeof x === 'object' && Object.keys(x).length > 0;

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
            const patientId = parsed.data.patient_id || parsed.data.patientId || record.patient_id || record.patientId;
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
                const followUpDateStr = parsed.data.follow_up_date || record.follow_up_date;
                if (followUpDateStr) {
                  const targetDate = new Date(followUpDateStr).toDateString();
                  const match = appts.find((a: any) => new Date(a.date).toDateString() === targetDate);
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
      } catch (err) {
      } finally {
        setIsLoadingFull(false);
      }
    };
    fetchDetails();
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
    const doc = doctorsList.find((d: any) => d.id === docId);
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
        } catch (e) { }
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
        setAppointment((prev: any) => ({
          ...prev,
          doctor_id: selectedDoctorId,
          date: selectedDate,
          start_time: selectedSlot,
          doctor: doctorsList.find((d: any) => d.id === selectedDoctorId) || prev.doctor
        }));
        setEditMode(false);
      } catch (err) {
      } finally {
        setIsSavingAppt(false);
      }
    };

    const fmt = (d: any) => {
      if (!d) return "—";
      const date = new Date(d);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const fmtShort = (d: any) => {
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

    const getMedName = (x: any) => {
      if (!x) return "";
      if (typeof x.medicine_name === "string") return x.medicine_name;
      if (typeof x.medicine === "string") return x.medicine;
      if (x.medicine?.name) return String(x.medicine.name);
      if (x.medicine_name?.name) return String(x.medicine_name.name);
      return String(x.medicine_name || x.medicine || "");
    };

    const hasValidPrescriptions = (p?: any[]) =>
      p && p.some(x => getMedName(x).trim() !== "");


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
      <div className="space-y-1.5" onClick={() => setShowPrintMenu(false)}>
        {/* Patient Header Card */}
        <Card className="bg-gradient-to-r from-blue-50/60 via-indigo-50/30 to-card border-border/70 rounded-xl shadow-sm">
          <CardContent className="p-2.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-12 h-12 bg-gradient-to-tr from-primary to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shrink-0 shadow-md shadow-indigo-100">
                {fullRecord.patient?.name ? fullRecord.patient.name.charAt(0).toUpperCase() : "P"}
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground tracking-tight leading-none mb-1.5">
                  {fullRecord.patient?.name || "Unknown Patient"}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-bold text-muted-foreground">
                  {fullRecord.patient && (
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-mono text-[10px] font-bold" title="Patient Code">
                      Code: {fullRecord.patient.patient_code || String(fullRecord.patient.id).split("-")[0]}
                    </span>
                  )}
                  {fullRecord.patient?.phone && (
                    <span className="flex items-center gap-1 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded text-[11px]">
                      <Phone className="w-3 h-3 text-primary/70" /> {fullRecord.patient.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded text-[11px]" title="Consultation Date">
                    <Clock className="w-3 h-3 text-primary/70" />
                    <span className="font-semibold text-foreground/80">Date:</span> {fmt(fullRecord.created_at || fullRecord.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
              <div className="relative flex-1 md:flex-initial">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPrintMenu(!showPrintMenu);
                  }}
                  className={`w-full md:w-auto flex items-center justify-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all border shadow-sm ${showPrintMenu
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-primary border-primary/20 hover:bg-primary/5 hover:border-primary/45"
                    }`}
                >
                  <Printer className="w-4.5 h-4.5" /> Download Report
                </Button>
                {showPrintMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border/80 rounded-2xl shadow-xl z-30 py-2 animate-in fade-in zoom-in-95 duration-200 text-left">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadPDF(fullRecord, "CLINICAL");
                        setShowPrintMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-muted-foreground hover:bg-primary/5 flex justify-start items-center gap-3 transition-colors bg-transparent border-transparent h-auto rounded-none"
                    >
                      <Activity className="w-4.5 h-4.5 text-primary shrink-0" /> Clinical Observations
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadPDF(fullRecord, "TREATMENT");
                        setShowPrintMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-muted-foreground hover:bg-purple-50 flex justify-start items-center gap-3 transition-colors bg-transparent border-transparent h-auto rounded-none"
                    >
                      <Stethoscope className="w-4.5 h-4.5 text-purple-600 shrink-0" /> Treatment Planning
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadPDF(fullRecord, "PRESCRIPTION");
                        setShowPrintMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-muted-foreground hover:bg-emerald-50 flex justify-start items-center gap-3 transition-colors bg-transparent border-transparent h-auto rounded-none"
                    >
                      <Pill className="w-4.5 h-4.5 text-emerald-600 shrink-0" /> Prescription Only
                    </Button>
                    <div className="h-px bg-muted my-1.5" />
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadPDF(fullRecord, "FULL");
                        setShowPrintMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-foreground hover:bg-slate-50 flex justify-start items-center gap-3 transition-colors bg-transparent border-transparent h-auto rounded-none"
                    >
                      <FileText className="w-4.5 h-4.5 text-muted-foreground shrink-0" /> Full Summary
                    </Button>
                  </div>
                )}
              </div>

              <div className="relative flex-1 md:flex-initial">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSendMenu(!showSendMenu);
                    setShowPrintMenu(false);
                  }}
                  className={`w-full md:w-auto flex items-center justify-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all border shadow-sm ${showSendMenu
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-primary border-primary/20 hover:bg-primary/5 hover:border-primary/45"
                    }`}
                >
                  <Send className="w-4.5 h-4.5" /> Send Report
                </Button>
                {showSendMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border/80 rounded-2xl shadow-xl z-30 py-2 animate-in fade-in zoom-in-95 duration-200 text-left">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendPDF(fullRecord, "CLINICAL");
                        setShowSendMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-muted-foreground hover:bg-primary/5 flex justify-start items-center gap-3 transition-colors bg-transparent border-transparent h-auto rounded-none"
                    >
                      <Activity className="w-4.5 h-4.5 text-primary shrink-0" /> Clinical Observations
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendPDF(fullRecord, "TREATMENT");
                        setShowSendMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-muted-foreground hover:bg-purple-50 flex justify-start items-center gap-3 transition-colors bg-transparent border-transparent h-auto rounded-none"
                    >
                      <Stethoscope className="w-4.5 h-4.5 text-purple-600 shrink-0" /> Treatment Planning
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendPDF(fullRecord, "PRESCRIPTION");
                        setShowSendMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-muted-foreground hover:bg-emerald-50 flex justify-start items-center gap-3 transition-colors bg-transparent border-transparent h-auto rounded-none"
                    >
                      <Pill className="w-4.5 h-4.5 text-emerald-600 shrink-0" /> Prescription Only
                    </Button>
                    <div className="h-px bg-muted my-1.5" />
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendPDF(fullRecord, "FULL");
                        setShowSendMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-foreground hover:bg-slate-50 flex justify-start items-center gap-3 transition-colors bg-transparent border-transparent h-auto rounded-none"
                    >
                      <FileText className="w-4.5 h-4.5 text-muted-foreground shrink-0" /> Full Summary
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

        {/* Grid containing Vitals, Medical History & General findings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {/* Medical History Card */}
          {(() => {
            const conditionsText = getMedicalHistoryText();
            const allergiesText = getAllergiesText();
            const hasHistory = allergiesText || conditionsText || fullRecord.visits || fullRecord.lastVisit;
            if (!hasHistory) return null;
            return (
              <Card className="border-border/70 rounded-xl shadow-sm">
                <CardContent className="p-2.5 space-y-1.5">
                  <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                    <Stethoscope className="w-4.5 h-4.5 text-primary" />
                    <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">Medical History</h4>
                  </div>
                  <div className="space-y-1.5 text-sm font-semibold">
                    {allergiesText && (
                      <div>
                        <span className="text-[10px] font-bold text-red-500 block mb-0.5 uppercase tracking-wider">Allergies</span>
                        <span className="text-foreground bg-red-50/40 px-3 py-1 rounded-lg border border-red-100 block">{allergiesText}</span>
                      </div>
                    )}
                    {conditionsText && (
                      <div>
                        <span className="text-[10px] font-bold text-blue-500 block mb-0.5 uppercase tracking-wider">Medical Conditions</span>
                        <span className="text-foreground bg-blue-50/30 px-3 py-1 rounded-lg border border-blue-100 block">{conditionsText}</span>
                      </div>
                    )}
                    {(fullRecord.visits || fullRecord.lastVisit) && (
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1.5 pt-2 border-t border-border/40 font-bold">
                        {fullRecord.visits && <span className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">🩺 Total Visits: {fullRecord.visits}</span>}
                        {fullRecord.lastVisit && <span className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">📅 Last Visit: {fullRecord.lastVisit}</span>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Vitals Card */}
          {(fullRecord.bp || fullRecord.height || fullRecord.weight || fullRecord.bmi) && (
            <Card className="border-border/70 rounded-xl shadow-sm">
              <CardContent className="p-2.5 space-y-1.5">
                <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                  <HeartPulse className="w-4.5 h-4.5 text-blue-600" />
                  <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">Patient Vitals</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm font-semibold">
                  {fullRecord.bp && (
                    <div className="bg-slate-50/50 p-3 rounded-lg border border-border/30">
                      <span className="text-[9px] font-black text-muted-foreground block mb-0.5 uppercase tracking-widest">Blood Pressure</span>
                      <span className="text-foreground text-base font-bold">{fullRecord.bp} <span className="text-xs font-semibold text-muted-foreground">mmHg</span></span>
                    </div>
                  )}
                  {fullRecord.height && (
                    <div className="bg-slate-50/50 p-3 rounded-lg border border-border/30">
                      <span className="text-[9px] font-black text-muted-foreground block mb-0.5 uppercase tracking-widest">Height</span>
                      <span className="text-foreground text-base font-bold">{fullRecord.height} <span className="text-xs font-semibold text-muted-foreground">cm</span></span>
                    </div>
                  )}
                  {fullRecord.weight && (
                    <div className="bg-slate-50/50 p-3 rounded-lg border border-border/30">
                      <span className="text-[9px] font-black text-muted-foreground block mb-0.5 uppercase tracking-widest">Weight</span>
                      <span className="text-foreground text-base font-bold">{fullRecord.weight} <span className="text-xs font-semibold text-muted-foreground">kg</span></span>
                    </div>
                  )}
                  {fullRecord.bmi && (
                    <div className="bg-slate-50/50 p-3 rounded-lg border border-border/30">
                      <span className="text-[9px] font-black text-muted-foreground block mb-0.5 uppercase tracking-widest">BMI</span>
                      <span className="text-foreground text-base font-bold">{fullRecord.bmi}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Observations & Diagnosis */}
        {(fullRecord.observations_desc || fullRecord.diagnosis_desc) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {fullRecord.observations_desc && (
              <Card className="border-border/70 rounded-xl shadow-sm">
                <CardContent className="p-2.5 space-y-1.5">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border/40 pb-2">
                    <AlertCircle className="w-4 h-4 text-primary" /> Observations
                  </p>
                  <div className="text-foreground text-sm font-medium leading-relaxed whitespace-pre-wrap border-l-4 border-primary/45 pl-3 py-0.5">
                    {fullRecord.observations_desc}
                  </div>
                </CardContent>
              </Card>
            )}
            {fullRecord.diagnosis_desc && (
              <Card className="border-border/70 rounded-xl shadow-sm">
                <CardContent className="p-2.5 space-y-1.5">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border/40 pb-2">
                    <Stethoscope className="w-4.5 h-4.5 text-primary" /> Diagnosis
                  </p>
                  <div className="text-foreground text-sm font-medium leading-relaxed whitespace-pre-wrap border-l-4 border-indigo-500/45 pl-3 py-0.5">
                    {fullRecord.diagnosis_desc}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Tooth Chart Findings */}
        {fullRecord.tooth_findings && fullRecord.tooth_findings.length > 0 && (
          <Card className="border-border/70 rounded-xl shadow-sm">
            <CardContent className="p-2.5 space-y-1.5">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-2 flex items-center">
                <Activity className="w-4.5 h-4.5 mr-2 text-primary" /> Tooth Chart Findings
              </p>
              <div className="flex flex-wrap gap-2">
                {fullRecord.tooth_findings.map((finding: any) => (
                  <div
                    key={finding.id || finding.tooth_number}
                    className={`border rounded-lg px-3 py-1.5 text-xs flex items-center gap-2.5 shadow-sm font-bold ${getToothConditionBadgeStyle(finding.condition)}`}
                  >
                    <span className="font-black">{finding.tooth_number === "FM" ? "Full Mouth" : `Tooth #${finding.tooth_number}`}</span>
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
            <Card className="border-border/70 rounded-xl shadow-sm">
              <CardContent className="p-2.5 space-y-1.5">
                <p className="text-xs font-black text-emerald-800 uppercase tracking-widest border-b border-border/40 pb-2 flex items-center gap-2">
                  <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-600" /> Treatment Planning
                </p>
                {(fullRecord.treatment_plan_description || fullRecord.treatmentPlan || fullRecord.treatment_plan) && (
                  <p className="text-foreground text-sm font-semibold leading-relaxed bg-emerald-50/20 p-3 rounded-lg border border-emerald-100/30">
                    {fullRecord.treatment_plan_description || fullRecord.treatmentPlan || fullRecord.treatment_plan}
                  </p>
                )}
                {((fullRecord.treatment_plans || fullRecord.treatments || []).length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(fullRecord.treatment_plans || fullRecord.treatments || []).map((tp: any, index: number) => (
                      <div key={tp.id || tp.tooth_number || index} className="bg-slate-50 border border-border/40 rounded-lg p-3 text-sm flex justify-between items-center font-bold">
                        <span className="text-foreground">
                          {(tp.tooth_number !== undefined ? tp.tooth_number : tp.tooth) === "FM" ? "Full Mouth" : `Tooth #${tp.tooth_number !== undefined ? tp.tooth_number : tp.tooth}`}: <span className="font-semibold text-muted-foreground">{tp.treatment_name || tp.procedure}</span>
                        </span>
                        {(tp.cost > 0 || tp.est_cost > 0) && (
                          <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">₹{(tp.cost || tp.est_cost).toLocaleString()}</span>
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
          <Card className="border-border/70 rounded-xl shadow-sm">
            <CardContent className="p-2.5 space-y-1.5">
              <p className="text-xs font-black text-indigo-800 uppercase tracking-widest border-b border-border/40 pb-2 flex items-center gap-2">
                <Pill className="w-4.5 h-4.5 text-indigo-600" /> Prescribed Medicines
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fullRecord.prescriptions?.map((p: any) => {
                  const medName = getMedName(p);
                  return medName.trim() ? (
                    <div key={p.id} className="bg-indigo-50/10 border border-indigo-100/40 rounded-xl p-3 text-sm font-semibold flex flex-col justify-between space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-black text-foreground text-sm">{medName}</span>
                        {p.qty && <span className="bg-indigo-100/60 text-indigo-800 border border-indigo-200/50 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Qty: {p.qty}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground font-semibold">
                        {p.dosage && <span className="bg-white px-1.5 py-0.5 rounded border border-border/50">Dosage: {p.dosage}</span>}
                        {p.timing && <span className="bg-white px-1.5 py-0.5 rounded border border-border/50">{p.timing}</span>}
                        {p.frequency && <span className="bg-white px-1.5 py-0.5 rounded border border-border/50">{p.frequency}</span>}
                        {p.duration && <span className="bg-white px-1.5 py-0.5 rounded border border-border/50">Duration: {p.duration} {p.duration_type || p.durationUnit || "Days"}</span>}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {fullRecord.recommendations && (
              <Card className="border-border/70 rounded-xl shadow-sm">
                <CardContent className="p-2.5 space-y-1.5">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border/40 pb-2">
                    <Check className="w-4 h-4 text-primary" /> Recommendations
                  </p>
                  <p className="text-foreground text-sm font-medium leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-border/40">{fullRecord.recommendations}</p>
                </CardContent>
              </Card>
            )}
            {(fullRecord.tests || fullRecord.next_visit || fullRecord.nextVisit) && (
              <Card className="border-border/70 rounded-xl shadow-sm">
                <CardContent className="p-2.5 space-y-1.5">
                  {fullRecord.tests && (
                    <div>
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border/40 pb-2 mb-2">
                        🔬 Prescribed Tests
                      </p>
                      <p className="text-foreground text-sm font-medium bg-slate-50/50 p-2.5 rounded-lg border border-border/40">{fullRecord.tests}</p>
                    </div>
                  )}
                  {(fullRecord.next_visit || fullRecord.nextVisit) && (
                    <div className="border-t border-border/30 pt-3 mt-3">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border/40 pb-2 mb-2">
                        📅 Next Visit Note
                      </p>
                      <p className="text-foreground text-sm font-medium bg-slate-50/50 p-2.5 rounded-lg border border-border/40">{fullRecord.next_visit || fullRecord.nextVisit}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Lab Reports */}
        {((fullRecord.labFiles && fullRecord.labFiles.length > 0) || (fullRecord.lab_files && fullRecord.lab_files.length > 0)) && (
          <Card className="border-border/70 rounded-xl shadow-sm">
            <CardContent className="p-2.5 space-y-1.5">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-2 flex items-center gap-2">
                🔬 Lab Reports
              </p>
              <div className="flex flex-wrap gap-2">
                {(fullRecord.labFiles || fullRecord.lab_files || []).map((file: any, idx: number) => {
                  const url = typeof file === 'string' ? file : file.url;
                  const name = typeof file === 'string' ? `Lab Report ${idx + 1}` : file.name || `Report ${idx + 1}`;
                  return (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white hover:bg-primary/5 border border-border rounded-lg px-3 py-2 text-xs flex items-center gap-2 shadow-sm font-bold text-primary hover:underline transition-all duration-200"
                    >
                      📁 {name}
                    </a>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {fullRecord.additional_notes && (
          <Card className="border-border/70 rounded-xl shadow-sm">
            <CardContent className="p-2.5 space-y-1.5">
              <p className="text-xs font-black text-amber-800 uppercase tracking-widest border-b border-border/40 pb-2 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-amber-600" /> Additional Notes
              </p>
              <p className="text-foreground text-sm font-medium leading-relaxed whitespace-pre-wrap border-l-4 border-amber-500/45 pl-3 py-0.5">{fullRecord.additional_notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Cost & Follow-up Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {fullRecord.total_estimated_cost !== undefined && fullRecord.total_estimated_cost > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between shadow-sm">
              <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
                <IndianRupee className="w-4.5 h-4.5 text-emerald-600" /> Total Procedure Fee
              </span>
              <span className="text-xl font-black text-emerald-700">₹ {fullRecord.total_estimated_cost.toLocaleString()}</span>
            </div>
          )}
          {fullRecord.is_follow_up && fullRecord.follow_up_date && !appointment && (
            <div className="bg-gradient-to-r from-purple-50 to-white border border-purple-200 rounded-xl p-2.5 flex items-center gap-3 shadow-sm">
              <Calendar className="w-4.5 h-4.5 text-purple-600 flex-shrink-0" />
              <div>
                <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest block mb-0.5">Follow-up Date</span>
                <span className="text-base font-bold text-purple-900">{fmtShort(fullRecord.follow_up_date)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Associated Appointment & Scheduling Section */}
        {isLoadingAppt ? (
          <div className="border border-purple-200 bg-purple-50/10 p-3 rounded-xl flex items-center justify-center gap-2 shadow-sm">
            <Loader2 className="w-4.5 h-4.5 text-purple-600 animate-spin" />
            <span className="text-xs font-bold text-purple-700">Checking scheduled appointments...</span>
          </div>
        ) : appointment ? (
          <div className="border border-purple-200 bg-purple-50/10 p-2 rounded-xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between border-b border-purple-200/50 pb-2.5">
              <h4 className="text-xs font-black text-purple-800 flex items-center uppercase tracking-widest">
                <Calendar className="w-4.5 h-4.5 mr-2 text-purple-600" />
                Follow-up Appointment Scheduling
              </h4>
              {!editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  className="gap-1.5 h-8 border-purple-300 text-purple-700 hover:bg-purple-100/50 font-bold px-3 rounded-lg"
                >
                  <Edit className="w-3 h-3" /> Edit Appointment
                </Button>
              )}
            </div>

            {!editMode ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-sm font-semibold">
                <div className="bg-white border border-purple-100 p-3 rounded-lg shadow-sm">
                  <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest block mb-0.5">Assigned Doctor</span>
                  <span className="text-foreground text-sm font-bold">{getDoctorName()}</span>
                </div>
                <div className="bg-white border border-purple-100 p-3 rounded-lg shadow-sm">
                  <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest block mb-0.5">Appointment Date</span>
                  <span className="text-foreground text-sm font-bold">{fmtShort(appointment.date)}</span>
                </div>
                <div className="bg-white border border-purple-100 p-3 rounded-lg shadow-sm">
                  <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest block mb-0.5">Time Slot</span>
                  <span className="text-foreground text-sm font-bold">{formatSlotTime(appointment.start_time)}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <Label className="block text-[10px] font-black text-purple-700 uppercase tracking-widest mb-1">
                      Assign Doctor
                    </Label>
                    <SearchableSelect
                      value={selectedDoctorId}
                      onChange={(val) => {
                        setSelectedDoctorId(val);
                        setSelectedSlot("");
                      }}
                      options={doctorsList.map((d: any) => ({
                        label: `${d.name} (${d.specialization || "Doctor"})`,
                        value: d.id
                      }))}
                      placeholder="Select Doctor"
                      className="h-10 border-purple-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <Label className="block text-[10px] font-black text-purple-700 uppercase tracking-widest mb-1">
                      Preferred Date
                    </Label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedSlot("");
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full h-10 px-3 bg-white border border-purple-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="block text-[10px] font-black text-purple-700 uppercase tracking-widest mb-1">
                    Available Slots
                  </Label>
                  {isLoadingSlots ? (
                    <div className="flex items-center gap-2 py-3">
                      <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                      <span className="text-xs text-muted-foreground">Checking slot availability...</span>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-3 border border-purple-100 rounded-lg bg-white shadow-inner">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedSlot === slot.time24;
                        return (
                          <Button
                            key={slot.time24}
                            type="button"
                            onClick={() => setSelectedSlot(slot.time24)}
                            className={`
                              relative px-3 py-2 rounded-lg text-[10px] font-black transition-all border-2 flex items-center gap-1 h-auto
                              ${isSelected
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-105"
                                : "bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-400 cursor-pointer"
                              }
                            `}
                          >
                            {isSelected && <CheckCircle className="w-3 h-3 text-white shrink-0" />}
                            {slot.time12} ({slot.appointmentCount})
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-5 bg-white border border-dashed border-purple-200 rounded-lg">
                      <p className="text-xs text-muted-foreground italic">No slots available for this doctor on this date.</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2.5 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(false)}
                    className="h-9 border-purple-200 text-purple-700 hover:bg-purple-50 font-bold px-4 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveAppointment}
                    disabled={isSavingAppt || !selectedSlot}
                    size="sm"
                    className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 gap-1.5 font-bold px-5 rounded-lg"
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
          </div>
        ) : null}

        {/* Clinical Images */}
        {fullRecord.images && fullRecord.images.length > 0 && (
          <Card className="border-border/70 rounded-xl shadow-sm">
            <CardContent className="p-2.5 space-y-1.5">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-2 flex items-center gap-2">
                <ImageIcon className="w-4.5 h-4.5 text-primary/70" /> Clinical Images
              </p>
              <div className="flex flex-wrap gap-3">
                {fullRecord.images.map((imgUrl: string, idx: number) => (
                  <img
                    key={idx}
                    src={imgUrl}
                    alt={`Clinical ${idx + 1}`}
                    className="w-20 h-20 rounded-xl object-cover border border-border cursor-pointer hover:scale-105 hover:shadow-md transition-all duration-300"
                    onClick={() => window.open(imgUrl, "_blank")}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attachments */}
        {fullRecord.attachments && fullRecord.attachments.length > 0 && (
          <Card className="border-border/70 rounded-xl shadow-sm">
            <CardContent className="p-2.5 space-y-1.5">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-2 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-primary/70" /> Attachments
              </p>
              <div className="flex flex-wrap gap-3">
                {fullRecord.attachments.map((attachment: any, idx: number) => {
                  const isImage = attachment.file_type?.startsWith("image/") || attachment.file_name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                  return isImage ? (
                    <img
                      key={attachment.id || idx}
                      src={attachment.file_url}
                      alt={attachment.file_name}
                      title={attachment.file_name}
                      className="w-20 h-20 rounded-xl object-cover border border-border cursor-pointer hover:scale-105 hover:shadow-md transition-all duration-300"
                      onClick={() => window.open(attachment.file_url, "_blank")}
                    />
                  ) : (
                    <a
                      key={attachment.id || idx}
                      href={attachment.file_url}
                      target="_blank"
                      rel="noreferrer"
                      title={attachment.file_name}
                      className="bg-muted hover:bg-primary/5 border border-border rounded-xl w-20 h-20 flex flex-col items-center justify-center gap-1.5 p-2 text-center text-xs shadow-sm font-bold text-primary hover:underline transition-all duration-200"
                    >
                      <FileText className="w-5 h-5" />
                      <span className="truncate w-full">{attachment.file_name}</span>
                    </a>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* X-Ray Reports */}
        {fullRecord.xrayFiles && fullRecord.xrayFiles.length > 0 && (
          <Card className="border-border/70 rounded-xl shadow-sm">
            <CardContent className="p-2.5 space-y-1.5">
              <p className="text-xs font-black text-primary uppercase tracking-widest border-b border-border/40 pb-2 flex items-center gap-2">
                <Camera className="w-4.5 h-4.5 text-primary/70" /> X-Ray Reports
              </p>
              <div className="flex flex-wrap gap-3">
                {fullRecord.xrayFiles.map((imgUrl: string, idx: number) => (
                  <img
                    key={idx}
                    src={imgUrl}
                    alt={`X-Ray ${idx + 1}`}
                    className="w-20 h-20 rounded-xl object-cover border border-primary/20 cursor-pointer hover:scale-105 hover:shadow-md transition-all duration-300"
                    onClick={() => window.open(imgUrl, "_blank")}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error: any) {
    console.error("Error in HistoryDetail render:", error);
    return (
      <div className="p-6 text-center space-y-2 bg-red-50/20 border border-red-100 rounded-xl">
        <p className="text-red-500 font-bold">Failed to display history details.</p>
        <p className="text-xs text-muted-foreground font-mono">{error?.stack || error?.message || String(error)}</p>
      </div>
    );
  }
}
