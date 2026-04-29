import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  User,
  Clock,
  Stethoscope,
  FileText,
  Camera,
  Pill,
  Plus,
  Trash2,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  FlaskConical,
  File,
  Activity,
  Calendar as CalendarIcon,
} from "lucide-react";
import { ToothChart } from "./ToothChart";
import { downloadConsultationPDF, PDFReportType } from "../../utils/pdfGenerator";

interface PatientConsultationProps {
  patient: {
    id: string;
    patientName: string;
    phone?: string;
    treatmentType: string;
    patientConcern: string;
    doctorId?: string;
    doctorName?: string;
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
  onCreateTreatment,
}: PatientConsultationProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleDownloadPDF = async (type: PDFReportType = 'FULL') => {
    await downloadConsultationPDF({
      type,
      patient,
      consultationData,
      toothChartState
    });
  };

  const calculateAge = (dob: string): string => {
    if (!dob) return "?";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age.toString();
  };

  const [consultationData, setConsultationData] = useState(initialData?.consultationData || {
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
  });

  const [loading, setLoading] = useState(false);
  const [toothChartState, setToothChartState] = useState<Record<number, string>>(initialData?.toothChartState || {});

  useEffect(() => {
    onDraftUpdate?.({
      consultationData,
      toothChartState
    });
  }, [consultationData, toothChartState]);

  // ── Follow-up state ────────────────────────────────────────────────────────
  const [followUpDoctorId, setFollowUpDoctorId] = useState(patient.doctorId || "1");
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
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

      if (slotHour < startHour) return false;
      if (slotHour > endHour) return false;
      if (slotHour === endHour && slotMinute > endMinute) return false;

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
      const isBooked = (appointments || []).some(a => {
        if (a.doctorId !== followUpDoctorId || a.date !== followUpDate) return false;
        const aStart = parseInt(a.time.split(':')[0]) * 60 + parseInt(a.time.split(':')[1]);
        const aEnd = aStart + (a.duration || 15);
        return slotStart >= aStart && slotStart < aEnd;
      });

      return !isBooked;
    });
  };

  const availableSlots = getAvailableTimeSlots();

  const handleScheduleFollowUp = () => {
    if (!onScheduleFollowUp) return;

    const selDoctor = doctors.find(d => d.id === followUpDoctorId);
    onScheduleFollowUp({
      patientName: patient.patientName,
      patientPhone: patient.phone,
      doctorId: followUpDoctorId,
      doctorName: selDoctor?.name || "Doctor",
      date: followUpDate,
      time: selectedSlot || (availableSlots[0]?.time24 || "09:00"),
      treatmentType: "consultation",
      patientConcern: `Follow-up for ${patient.treatmentType}`,
      patientId: patient.id
    });
  };

  const formatFollowUpDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long'
      });
    } catch {
      return dateStr;
    }
  };

  const formatSlotTime = (time24: string) => {
    const [h, m] = time24.split(':');
    const hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const h12 = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
    return `${h12}:${m} ${ampm}`;
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

  const handleLabFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    }));
    setConsultationData((prev) => ({
      ...prev,
      labFiles: [...prev.labFiles, ...newFiles],
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

  const removeXrayFile = (index: number) => {
    setConsultationData((prev) => ({
      ...prev,
      xrayFiles: prev.xrayFiles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create treatment if required
    if (consultationData.requiresTreatment && onCreateTreatment) {
      const treatmentData = {
        id: `TR-${Date.now()}`,
        patientId: patient.id,
        patientName: patient.patientName,
        procedure: consultationData.treatmentProcedure,
        tooth: consultationData.treatmentTooth,
        date: new Date().toISOString().split("T")[0],
        notes: `Treatment recommended during consultation: ${consultationData.treatmentPlan}`,
        cost: consultationData.treatmentCost || 0,
        status: consultationData.startTreatmentToday
          ? "in-progress"
          : "planned",
        doctorId: patient.doctorId || "1",
        doctorName: patient.doctorName || "Dr. Sharma",
        prescriptions: consultationData.prescriptions.filter(
          (p) => p.medicine.trim() !== "",
        ),
        sessions: consultationData.treatmentSessions,
      };

      onCreateTreatment(treatmentData);
    }

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        id="consultation-form"
        className="bg-white rounded-2xl max-w-5xl w-full max-h-screen overflow-y-auto shadow-2xl relative"
      >
        {isCompleted ? (
          <div className="p-12 text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
              <CheckCircle className="w-12 h-12" />
            </div>
            
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Consultation Completed!</h2>
              <p className="text-gray-500 mt-2 text-lg">All clinical data has been saved to patient history.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <button
                onClick={() => handleDownloadPDF('CLINICAL')}
                className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-2xl hover:bg-blue-100 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <div className="font-bold text-blue-900">Clinical Report</div>
                    <div className="text-xs text-blue-600">Observations & Tooth Chart</div>
                  </div>
                </div>
                <File className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={() => handleDownloadPDF('TREATMENT')}
                className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-2xl hover:bg-purple-100 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-6 h-6 text-purple-600" />
                  <div className="text-left">
                    <div className="font-bold text-purple-900">Treatment Plan</div>
                    <div className="text-xs text-purple-600">Procedures & Planning</div>
                  </div>
                </div>
                <File className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={() => handleDownloadPDF('PRESCRIPTION')}
                className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-2xl hover:bg-emerald-100 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Pill className="w-6 h-6 text-emerald-600" />
                  <div className="text-left">
                    <div className="font-bold text-emerald-900">Prescription</div>
                    <div className="text-xs text-emerald-600">Medicines & Instructions</div>
                  </div>
                </div>
                <File className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={() => handleDownloadPDF('FULL')}
                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-gray-600" />
                  <div className="text-left">
                    <div className="font-bold text-gray-900">Full Report</div>
                    <div className="text-xs text-gray-600">Complete Consultation File</div>
                  </div>
                </div>
                <File className="w-5 h-5 text-gray-400 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <button
                onClick={onClose}
                className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl hover:shadow-2xl active:scale-95"
              >
                Done & Close Window
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mr-4">
                <Stethoscope className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Patient Consultation
                </h2>
                <p className="text-gray-600">
                  {patient.patientName} - {patient.treatmentType}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 1. Patient Information (Simplified) */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <div>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">Patient Name</p>
                <p className="text-lg font-bold text-blue-900">{patient.patientName}</p>
                <div className="flex gap-4 mt-2">
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase">Age / Gender</p>
                    <p className="text-sm font-bold text-blue-900">
                      {patient.patientHistory?.dateOfBirth ? calculateAge(patient.patientHistory.dateOfBirth) : "?"}Y / {patient.patientHistory?.gender || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase">Phone</p>
                    <p className="text-sm font-bold text-blue-900">{patient.phone || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Treatment & Concern */}
              <div>
                <div className="mb-3">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">Treatment Type</p>
                  <p className="text-sm font-bold text-blue-900">{patient.treatmentType || "General Consultation"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">Patient Concern</p>
                  <p className="text-sm font-medium text-blue-800 italic leading-tight">"{patient.patientConcern || "No concern recorded"}"</p>
                </div>
              </div>

              {/* Medical Alerts */}
              <div className="md:col-span-2 lg:col-span-1">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">Medical Alerts & History</p>
                {patient.patientHistory && (patient.patientHistory.allergies.length > 0 || patient.patientHistory.medicalHistory.length > 0) ? (
                  <div className="bg-red-50 p-3 rounded-xl border border-red-100 space-y-1">
                    {patient.patientHistory.allergies.length > 0 && (
                      <div className="text-[11px] text-red-700">
                        <strong className="uppercase text-[9px] mr-1">Allergies:</strong> {patient.patientHistory.allergies.join(", ")}
                      </div>
                    )}
                    {patient.patientHistory.medicalHistory.length > 0 && (
                      <div className="text-[11px] text-red-700">
                        <strong className="uppercase text-[9px] mr-1">History:</strong> {patient.patientHistory.medicalHistory.join(", ")}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-blue-400 italic">No medical history recorded</p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Clinical Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Camera className="w-4 h-4 inline mr-2" />
              Clinical Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">
                Upload clinical photos, X-rays, or other relevant images
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-flex items-center"
              >
                <Camera className="w-4 h-4 mr-2" />
                Upload Images
              </label>
            </div>

            {consultationData.images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Uploaded Images:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {consultationData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Clinical ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = consultationData.images.filter(
                            (_, i) => i !== index,
                          );
                          setConsultationData((prev) => ({
                            ...prev,
                            images: newImages,
                          }));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Clinical Observations & Tooth Chart */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Clinical Observations & Tooth Chart</h3>
                <p className="text-sm text-gray-500">Select affected teeth and record your findings</p>
              </div>
            </div>

            <div className="space-y-6">
              <ToothChart
                initialState={toothChartState as any}
                onChartChange={(state) => setToothChartState(state)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Detailed Observations *
                  </label>
                  <textarea
                    name="observations"
                    value={consultationData.observations}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Record your clinical observations and examination findings..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Stethoscope className="w-4 h-4 inline mr-2" />
                    Diagnosis *
                  </label>
                  <textarea
                    name="diagnosis"
                    value={consultationData.diagnosis}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your diagnosis based on examination..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Treatment Planning */}
          <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
            <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
              <Stethoscope className="w-5 h-5 mr-2" />
              Treatment Planning
            </h3>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="requiresTreatment"
                checked={consultationData.requiresTreatment}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm font-medium text-purple-700">
                Patient requires treatment
              </span>
            </div>

            {consultationData.requiresTreatment && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Treatment Procedure
                  </label>
                  <select
                    name="treatmentProcedure"
                    value={consultationData.treatmentProcedure}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Procedure</option>
                    <option value="Dental Filling">Dental Filling</option>
                    <option value="Root Canal Treatment">
                      Root Canal Treatment
                    </option>
                    <option value="Crown Placement">Crown Placement</option>
                    <option value="Tooth Extraction">Tooth Extraction</option>
                    <option value="Teeth Cleaning">Teeth Cleaning</option>
                    <option value="Orthodontic Treatment">
                      Orthodontic Treatment
                    </option>
                    <option value="Dental Implant">Dental Implant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Tooth/Area
                  </label>
                  <input
                    type="text"
                    name="treatmentTooth"
                    value={consultationData.treatmentTooth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 16 (Upper Right First Molar)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Estimated Sessions
                  </label>
                  <input
                    type="number"
                    name="treatmentSessions"
                    value={consultationData.treatmentSessions}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="startTreatmentToday"
                    checked={consultationData.startTreatmentToday}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm font-medium text-purple-700">
                    Start treatment today
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 5. Treatment Plan Textarea */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Treatment Plan *
            </label>
            <textarea
              name="treatmentPlan"
              value={consultationData.treatmentPlan}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Outline the recommended treatment plan and procedures..."
            />
          </div>

          {/* 6 & 7. Recommendations & Instructions + Treatment Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Recommendations & Instructions
              </label>
              <textarea
                name="recommendations"
                value={consultationData.recommendations}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Post-treatment care instructions and recommendations..."
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Treatment Cost (₹)
                </label>
                <input
                  type="number"
                  name="treatmentCost"
                  value={consultationData.treatmentCost === 0 ? "" : consultationData.treatmentCost}
                  onChange={handleChange}
                  onFocus={(e) => {
                    if (consultationData.treatmentCost === 0) {
                      setConsultationData(prev => ({ ...prev, treatmentCost: "" as any }));
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      setConsultationData(prev => ({ ...prev, treatmentCost: 0 }));
                    }
                  }}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter treatment cost"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="followUpRequired"
                  checked={consultationData.followUpRequired}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Follow-up appointment required
                </span>
              </div>

              {consultationData.followUpRequired && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-blue-900 flex items-center uppercase tracking-wider">
                      <Clock className="w-4 h-4 mr-2" />
                      Follow-up Booking
                    </h4>
                    {bookedFollowUp ? (
                      <div className="flex items-center text-emerald-600 font-bold text-sm bg-white px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Follow-up booked for {formatFollowUpDate(bookedFollowUp.date)}, {formatSlotTime(bookedFollowUp.time)}
                      </div>
                    ) : (
                      <div className="text-xs font-medium text-blue-600 bg-blue-100/50 px-2 py-1 rounded-lg">
                        Select a slot to schedule
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-blue-700 mb-1.5 uppercase tracking-widest">
                        Assign Doctor
                      </label>
                      <select
                        value={followUpDoctorId}
                        onChange={(e) => setFollowUpDoctorId(e.target.value)}
                        disabled={!!bookedFollowUp}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        {doctors.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.specialization})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-blue-700 mb-1.5 uppercase tracking-widest">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        disabled={!!bookedFollowUp}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {!bookedFollowUp && (
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-blue-700 uppercase tracking-widest">
                        Available Slots
                      </label>
                      {availableSlots.length > 0 ? (
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-blue-100 rounded-lg bg-blue-50/50 custom-scrollbar">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.time24}
                              type="button"
                              onClick={() => setSelectedSlot(slot.time24)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedSlot === slot.time24
                                  ? "bg-blue-600 text-white shadow-md scale-105"
                                  : "bg-white text-blue-700 border border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                                }`}
                            >
                              {slot.time12}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-white/50 border border-dashed border-blue-200 rounded-xl">
                          <p className="text-xs text-gray-500 italic">No slots available for this doctor on this date.</p>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleScheduleFollowUp}
                        disabled={!selectedSlot && availableSlots.length === 0}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-indigo-200 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Schedule Now
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 8. Prescriptions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Pill className="w-5 h-5 mr-2" />
                Prescriptions
              </h3>
              <button
                type="button"
                onClick={addPrescription}
                className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 flex items-center text-sm font-medium transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Medicine
              </button>
            </div>

            <div className="space-y-4">
              {consultationData.prescriptions.map((prescription, index) => (
                <div
                  key={prescription.id}
                  className="grid grid-cols-12 gap-4 items-end p-4 bg-green-50 rounded-xl border border-green-200"
                >
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medicine
                    </label>
                    <input
                      type="text"
                      value={prescription.medicine}
                      onChange={(e) =>
                        updatePrescription(
                          prescription.id,
                          "medicine",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Medicine name"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dosage
                    </label>
                    <select
                      value={prescription.dosage}
                      onChange={(e) =>
                        updatePrescription(
                          prescription.id,
                          "dosage",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="1-0-0">1 - 0 - 0</option>
                      <option value="0-1-0">0 - 1 - 0</option>
                      <option value="0-0-1">0 - 0 - 1</option>
                      <option value="1-1-0">1 - 1 - 0</option>
                      <option value="1-0-1">1 - 0 - 1</option>
                      <option value="0-1-1">0 - 1 - 1</option>
                      <option value="1-1-1">1 - 1 - 1</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timing
                    </label>
                    <input
                      type="text"
                      value={prescription.timing}
                      onChange={(e) =>
                        updatePrescription(
                          prescription.id,
                          "timing",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="After meals"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <input
                      type="text"
                      value={prescription.frequency}
                      onChange={(e) =>
                        updatePrescription(
                          prescription.id,
                          "frequency",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3 times daily"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        value={prescription.duration}
                        onChange={(e) =>
                          updatePrescription(
                            prescription.id,
                            "duration",
                            e.target.value,
                          )
                        }
                        min="1"
                        className="w-16 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                        placeholder="5"
                      />
                      <select
                        value={(prescription as any).durationUnit || 'Days'}
                        onChange={(e) =>
                          updatePrescription(
                            prescription.id,
                            "durationUnit",
                            e.target.value,
                          )
                        }
                        className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="Days">Days</option>
                        <option value="Weeks">Weeks</option>
                        <option value="Months">Months</option>
                        <option value="Years">Years</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qty
                    </label>
                    <input
                      type="text"
                      value={prescription.qty}
                      onChange={(e) =>
                        updatePrescription(
                          prescription.id,
                          "qty",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="10"
                    />
                  </div>
                  <div className="col-span-1">
                    {consultationData.prescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePrescription(prescription.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 9. X-Ray Files Section */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center">
                <Camera className="w-4 h-4 mr-2 text-blue-600" />
                Add File X-Ray
              </label>
              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
                <Plus className="w-3 h-3" /> Upload X-Ray
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleXrayUpload}
                  className="hidden"
                />
              </label>
            </div>

            {consultationData.xrayFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {consultationData.xrayFiles.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-white shadow-md">
                    <img src={url} alt={`X-Ray ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeXrayFile(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 10. Additional Consultation Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Additional Consultation Notes
            </label>
            <textarea
              name="consultationNotes"
              value={consultationData.consultationNotes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Any additional notes or observations..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 font-semibold transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold flex items-center shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Completing Consultation...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Consultation
                </>
              )}
            </button>
          </div>
        </form>
      </>
    )}
      </div>
    </div>
  );
}
