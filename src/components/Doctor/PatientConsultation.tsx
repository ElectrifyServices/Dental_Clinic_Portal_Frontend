import React, { useState } from "react";
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
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface PatientConsultationProps {
  patient: {
    id: string;
    patientName: string;
    treatmentType: string;
    patientConcern: string;
    doctorId?: string;
    doctorName?: string;
    patientHistory?: {
      medicalHistory: string[];
      allergies: string[];
    };
  };
  onClose: () => void;
  onCompleteConsultation: (consultationData: any) => void;
  onCreateTreatment?: (treatmentData: any) => void;
}

export function PatientConsultation({
  patient,
  onClose,
  onCompleteConsultation,
  onCreateTreatment,
}: PatientConsultationProps) {
  const downloadConsultationPDF = async () => {
    const pdfContainer = document.createElement("div");
    pdfContainer.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: 794px; background: white; 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

    const filledPrescriptions = consultationData.prescriptions.filter(
      (p) => p.medicine.trim() !== "",
    );

    pdfContainer.innerHTML = `
    <div style="width:794px; background:#fff; margin:0; padding:0; color: #1f2937;">
      <!-- Professional Medical Header -->
      <div style="padding: 30px 50px 20px; border-bottom: 2px solid #3b82f6;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:28px; font-weight:800; color:#1e40af; letter-spacing:-0.5px;">DentalCare Pro</div>
            <div style="font-size:12px; color:#6b7280; font-weight:500; margin-top:4px;">Advanced Dental Clinic & Implant Centre</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:14px; font-weight:700; color:#111827;">${patient.doctorName || "Dr. Rajesh Sharma"}</div>
            <div style="font-size:11px; color:#6b7280; margin-top:2px;">BDS, MDS (Oral & Maxillofacial Surgery)</div>
            <div style="font-size:11px; color:#6b7280;">Reg No: 123456/78</div>
          </div>
        </div>
      </div>

      <!-- Report Title & Date -->
      <div style="padding: 10px 50px; background:#f8fafc; border-bottom: 1px solid #e2e8f0;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:16px; font-weight:700; color:#1e40af; text-transform:uppercase; letter-spacing:1px;">Consultation Report</div>
          <div style="text-align:right; font-size:11px; color:#64748b; display:flex; gap:15px;">
          <span><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
          <span><strong>Time:</strong> ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>

      <div style="padding: 20px 50px 30px;">
        <!-- Patient Info Card -->
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; padding:15px; background:#fff; border:1px solid #e2e8f0; border-radius:12px; margin-bottom:20px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          <div>
            <div style="font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:4px;">Patient Name</div>
            <div style="font-size:15px; font-weight:700; color:#1e293b;">${patient.patientName || "—"}</div>
          </div>
          <div>
            <div style="font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:4px;">Patient ID</div>
            <div style="font-size:14px; font-weight:500; color:#334155;">${patient.id || "—"}</div>
          </div>
          <div>
            <div style="font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:4px;">Treatment Type</div>
            <div style="font-size:14px; font-weight:500; color:#334155;">${patient.treatmentType || "General Consultation"}</div>
          </div>
        </div>

        <!-- Medical Alerts / History -->
        ${
          patient.patientHistory &&
          (patient.patientHistory.allergies.length > 0 ||
            patient.patientHistory.medicalHistory.length > 0)
            ? `
        <div style="margin-bottom:20px; border:1px solid #fee2e2; border-radius:8px; overflow:hidden;">
          <div style="background:#fef2f2; padding:8px 15px; border-bottom:1px solid #fee2e2; display:flex; align-items:center; gap:8px;">
            <span style="color:#dc2626; font-size:14px;">⚠️</span>
            <span style="font-size:10px; font-weight:700; color:#991b1b; text-transform:uppercase; letter-spacing:0.5px;">Medical Alerts & History</span>
          </div>
          <div style="padding:12px 15px; background:#fff;">
            ${patient.patientHistory.allergies.length > 0 ? `<div style="font-size:12px; color:#991b1b; margin-bottom:4px;"><strong>Allergies:</strong> ${patient.patientHistory.allergies.join(", ")}</div>` : ""}
            ${patient.patientHistory.medicalHistory.length > 0 ? `<div style="font-size:12px; color:#991b1b;"><strong>Medical History:</strong> ${patient.patientHistory.medicalHistory.join(", ")}</div>` : ""}
          </div>
        </div>
        `
            : ""
        }

        <!-- Clinical Assessment Section -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px; margin-bottom:20px;">
          <div style="border-left: 3px solid #3b82f6; padding-left:15px;">
            <div style="font-size:11px; font-weight:700; color:#1e40af; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">Clinical Observations</div>
            <div style="font-size:13px; line-height:1.6; color:#374151;">
              ${consultationData.observations || '<span style="color:#9ca3af;">No observations recorded.</span>'}
            </div>
          </div>
          <div style="border-left: 3px solid #10b981; padding-left:15px;">
            <div style="font-size:11px; font-weight:700; color:#065f46; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">Diagnosis</div>
            <div style="font-size:13px; line-height:1.6; color:#374151;">
              ${consultationData.diagnosis || '<span style="color:#9ca3af;">No diagnosis provided.</span>'}
            </div>
          </div>
        </div>

        <!-- Treatment Plan -->
        <div style="margin-bottom:25px; background:#f1f5f9; padding:15px 20px; border-radius:8px;">
          <div style="font-size:11px; font-weight:700; color:#334155; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px; border-bottom:1px solid #cbd5e1; padding-bottom:8px;">Treatment Plan & Procedures</div>
          <div style="font-size:13px; line-height:1.6; color:#334155;">
            ${consultationData.treatmentPlan || '<span style="color:#9ca3af;">—</span>'}
          </div>
        </div>

        <!-- Prescriptions -->
        ${
          filledPrescriptions.length > 0
            ? `
        <div style="margin-bottom:25px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
            <div style="width:24px; height:24px; background:#ecfdf5; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#059669; font-weight:bold;">💊</div>
            <div style="font-size:14px; font-weight:700; color:#111827;">Prescribed Medications</div>
          </div>
          <table style="width:100%; border-collapse:collapse; overflow:hidden; border-radius:8px; border:1px solid #e2e8f0;">
            <thead>
              <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0;">
                <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">#</th>
                <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Medicine</th>
                <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Dosage</th>
                <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Timing</th>
                <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Freq</th>
                <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Days</th>
                <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${filledPrescriptions
                .map(
                  (p, i) => `
                <tr style="border-bottom:1px solid #f1f5f9; ${i % 2 === 0 ? "" : "background:#fafafa;"}">
                  <td style="padding:12px 15px; font-size:12px; color:#94a3b8;">${i + 1}</td>
                  <td style="padding:12px 15px; font-size:13px; font-weight:600; color:#1e293b;">${p.medicine || "-"}</td>
                  <td style="padding:12px 15px; font-size:12px; color:#475569;">${p.dosage || "-"}</td>
                  <td style="padding:12px 15px; font-size:12px; color:#475569;">${p.timing || "-"}</td>
                  <td style="padding:12px 15px; font-size:12px; color:#475569;">${p.frequency || "-"}</td>
                  <td style="padding:12px 15px; font-size:12px; color:#475569;">${p.duration || "-"}</td>
                  <td style="padding:12px 15px; font-size:12px; font-weight:600; color:#1e293b;">${p.qty || "-"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        <!-- Recommendations & Notes -->
        <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:30px; margin-bottom:25px;">
          <div>
            <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Advice & Recommendations</div>
            <div style="font-size:12px; line-height:1.6; color:#334155; padding:15px; background:#fff; border:1px solid #e2e8f0; border-radius:8px;">
              ${consultationData.recommendations || consultationData.consultationNotes || "Take care and follow instructions."}
            </div>
          </div>
          <div>
            <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Follow-up Details</div>
            <div style="padding:15px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; display:flex; align-items:center; gap:10px;">
              <span style="font-size:20px;">📅</span>
              <div>
                <div style="font-size:13px; font-weight:700; color:#0369a1;">
                  ${
                    consultationData.followUpRequired
                      ? consultationData.followUpDate
                        ? new Date(
                            consultationData.followUpDate,
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "To be scheduled"
                      : "Not required"
                  }
                </div>
                <div style="font-size:10px; color:#0369a1; margin-top:2px;">Scheduled Follow-up</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer / Signature Area -->
        <div style="margin-top:40px; padding-top:20px; border-top:1px solid #e2e8f0;">
          <div style="display:flex; justify-content:space-between; align-items:flex-end;">
            <div>
              <div style="font-size:10px; color:#94a3b8; font-style:italic;">This is a computer-generated report and does not require a physical signature for digital purposes.</div>
              <div style="font-size:10px; color:#94a3b8; margin-top:4px;">Report Generated: ${new Date().toLocaleString("en-IN")}</div>
            </div>
            <div style="text-align:center;">
              <div style="width:180px; border-top:1px solid #1e293b; padding-top:10px;">
                <div style="font-size:13px; font-weight:700; color:#1e293b;">${patient.doctorName || "Dr. Rajesh Sharma"}</div>
                <div style="font-size:10px; color:#64748b; margin-top:2px;">Dental Surgeon</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Clinic Address Footer -->
      <div style="background:#1e40af; padding:15px 50px; color:white; font-size:10px; display:flex; justify-content:space-between;">
        <div>📍 123 Dental Street, Medical Hub, New Delhi - 110001</div>
        <div>📞 +91 98765 43210 | 🌐 www.dentalcarepro.com</div>
      </div>
    </div>
  `;

    document.body.appendChild(pdfContainer);

    try {
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 794,
        windowWidth: 794,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(
        `${patient.patientName}_consultation_${new Date().toISOString().split("T")[0]}.pdf`,
      );
    } finally {
      document.body.removeChild(pdfContainer);
    }
  };
  const [consultationData, setConsultationData] = useState({
    diagnosis: "",
    treatmentPlan: "",
    observations: "",
    recommendations: "",
    followUpRequired: false,
    followUpDate: "",
    prescriptions: [
      {
        id: "1",
        medicine: "",
        dosage: "",
        timing: "",
        frequency: "",
        duration: "",
        qty: "",
        // instructions: "",
      },
    ],
    images: [] as string[],
    labFiles: [] as { name: string; url: string; type: string }[],
    nextAppointment: "",
    consultationNotes: "",
    treatmentCost: 0,
    requiresTreatment: false,
    treatmentProcedure: "",
    treatmentTooth: "",
    treatmentSessions: 1,
    startTreatmentToday: false,
  });

  const [loading, setLoading] = useState(false);

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
          qty: "",
          // instructions: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create treatment if required
    if (consultationData.requiresTreatment && onCreateTreatment) {
      const treatmentData = {
        id: `TR-${Date.now()}`,
        patientId: patient.patientId || patient.id,
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
      consultationDate: new Date().toISOString(),
      doctorId: patient.doctorId || "1",
      doctorName: patient.doctorName || "Dr. Sharma",
      status: "completed",
    });
    await downloadConsultationPDF();
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
        className="bg-white rounded-2xl max-w-5xl w-full max-h-screen overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
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
          {/* Patient Information */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Patient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-700 font-medium">
                  Patient Concern:
                </p>
                <p className="text-blue-800 bg-white p-3 rounded-lg border border-blue-200 mt-1">
                  {patient.patientConcern}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">
                  Treatment Type:
                </p>
                <p className="text-blue-800 bg-white p-3 rounded-lg border border-blue-200 mt-1">
                  {patient.treatmentType}
                </p>
              </div>
            </div>

            {/* Medical Alerts */}
            {patient.patientHistory &&
              (patient.patientHistory.allergies.length > 0 ||
                patient.patientHistory.medicalHistory.length > 0) && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-800">
                      Medical Alerts
                    </span>
                  </div>
                  {patient.patientHistory.allergies.length > 0 && (
                    <div className="text-xs text-red-700 mb-1">
                      <strong>Allergies:</strong>{" "}
                      {patient.patientHistory.allergies.join(", ")}
                    </div>
                  )}
                  {patient.patientHistory.medicalHistory.length > 0 && (
                    <div className="text-xs text-red-700">
                      <strong>Medical History:</strong>{" "}
                      {patient.patientHistory.medicalHistory.join(", ")}
                    </div>
                  )}
                </div>
              )}
          </div>



          {/* Clinical Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Clinical Observations *
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

          {/* Treatment Plan */}
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

          {/* Lab Results Section */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <FlaskConical className="w-5 h-5 mr-2 text-blue-600" />
                Lab Investigations
              </h3>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  onChange={handleLabFileUpload}
                  className="hidden"
                  id="lab-file-upload"
                />
                <label
                  htmlFor="lab-file-upload"
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 cursor-pointer flex items-center text-sm font-medium transition-all duration-200 shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Attach Lab Files
                </label>
              </div>
            </div>

            {consultationData.labFiles.length === 0 ? (
              <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl text-center bg-white/50">
                <p className="text-sm text-gray-400 italic">
                  No lab files attached yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {consultationData.labFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm group hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <File className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                        {file.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newList = consultationData.labFiles.filter(
                          (_, i) => i !== index,
                        );
                        setConsultationData((prev) => ({
                          ...prev,
                          labFiles: newList,
                        }));
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prescriptions */}
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
                    <input
                      type="text"
                      value={prescription.duration}
                      onChange={(e) =>
                        updatePrescription(
                          prescription.id,
                          "duration",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5 days"
                    />
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
                  {/* 
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructions
                    </label>
                    <input
                      type="text"
                      value={prescription.instructions}
                      onChange={(e) =>
                        updatePrescription(
                          prescription.id,
                          "instructions",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Special notes"
                    />
                  </div>
                  */}
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

          {/* Follow-up and Next Steps */}
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
                  value={consultationData.treatmentCost}
                  onChange={handleChange}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={consultationData.followUpDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Treatment Planning */}
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
          {/* Clinical Images */}
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
          {/* Additional Notes */}
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
      </div>
    </div>
  );
}
