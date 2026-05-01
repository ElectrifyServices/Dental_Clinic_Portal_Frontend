import React, { useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  AlertTriangle,
  CreditCard,
  Send,
  FileText,
  Stethoscope,
  Image,
  Pill,
  Download,
  QrCode,
  Edit,
  Activity,
  TrendingUp,
  Printer,
  Plus,
  UserPlus,
  CheckCircle,
} from "lucide-react";

interface PatientDetailsProps {
  patient: any;
  familyMembers: any[];
  appointments: any[];
  treatments: any[];
  invoices: any[];
  onClose: () => void;
  onSendReminder: (patientId: string, amount: number) => void;
  onExport?: (patientId: string) => void;
}

interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export function PatientDetails({
  patient,
  onClose,
  familyMembers = [],
  appointments = [],
  treatments = [],
  invoices = [],
  onSendReminder = () => { },
  onExport = () => { },
}: PatientDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewData, setPreviewData] = useState({
    bp: "",
    height: "",
    weight: "",
    bmi: "",
    complaints: "",
    diagnosis: "",
    advice: "",
    tests: "",
    nextVisit: "",
  });
  const [printLanguage, setPrintLanguage] = useState<"en" | "gu">("en");
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);

  if (!patient) return null;

  // Filter real data for this patient
  const patientAppointments = appointments.filter(
    (a) => a.patientId === patient.id || a.patientPhone === patient.phone,
  );
  const patientTreatments = treatments.filter(
    (t) => t.patientId === patient.id,
  );
  const patientInvoices = invoices.filter(
    (inv) => inv.patientId === patient.id,
  );

  const handleSendReminder = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSendReminder(patient.id, patient.outstandingBalance);
    setLoading(false);
  };

  const handlePrintDocument = () => {
    // Pre-fill with latest prescription data if available
    const latest = patient.prescriptionHistory?.[0];
    if (latest) {
      setPreviewData({
        ...previewData,
        bp: latest.vitals?.bp === "—" ? "" : latest.vitals?.bp || "",
        height:
          latest.vitals?.height === "—" ? "" : latest.vitals?.height || "",
        weight:
          latest.vitals?.weight === "—" ? "" : latest.vitals?.weight || "",
        bmi: latest.vitals?.bmi === "—" ? "" : latest.vitals?.bmi || "",
        complaints: latest.observations || latest.treatment || "",
        diagnosis: latest.diagnosis || "General Consultation",
        advice: latest.consultationNotes || "",
        tests: latest.tests || "",
        nextVisit: latest.nextVisit || "",
        age:
          patient.age ||
          (patient.dateOfBirth
            ? Math.floor(
              (Date.now() - new Date(patient.dateOfBirth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000),
            )
            : ""),
      });
    }
    setCustomSections([]); // Reset custom sections on new print
    setShowPrintPreview(true);
  };

  const translations = {
    en: {
      rx: "Rx",
      medicine: "Medicine",
      dosage: "Dosage",
      timing: "Timing - Freq. - Duration",
      qty: "Qty",
      complaints: "Complaints",
      diagnosis: "Diagnosis",
      advice: "Advice",
      tests: "Tests Prescribed",
      nextVisit: "Next Visit",
      date: "Date",
      signature: "Signature",
      composition: "Composition",
      timingLabel: "Timing",
      prescribedOn: "Prescribed on",
    },
    gu: {
      rx: "Rx (દવાઓ)",
      medicine: "દવા",
      dosage: "માત્રા",
      timing: "સમય - આવર્તન - સમયગાળો",
      qty: "જથ્થો",
      complaints: "ફરિયાદ / લક્ષણો",
      diagnosis: "નિદાન",
      advice: "સલાહ",
      tests: "જરૂરી તપાસ (લેબ ટેસ્ટ)",
      nextVisit: "આગામી મુલાકાત",
      date: "તારીખ",
      signature: "સહી",
      composition: "સંયોજન",
      timingLabel: "સમય",
      prescribedOn: "તારીખે લખેલ",
      yrs: "વર્ષ",
      male: "પુરુષ",
      female: "સ્ત્રી",
      other: "અન્ય",
      bpUnit: "મીમી એચજી",
      heightUnit: "સેમી",
      weightUnit: "કિલો",
      bmiUnit: "કિલો/મી²",
      months: "મહિના",
      days: "દિવસ",
      dentalSurgeon: "કન્સલ્ટન્ટ ડેન્ટલ સર્જન",
      clinicName: "ડેન્ટલકેર પ્રો ક્લિનિક",
      doctorName: "ડો. રાજેશ શર્મા",
      clinicAddress: "#૧૦૨, સી બ્લોક, સાઉથ એક્સટેન્શન - ૧",
      clinicCity: "નવી દિલ્હી",
      doctorDegrees: "બી.ડી.એસ., એમ.ડી.એસ. (ઓરલ એન્ડ મેક્સિલોફેસિયલ સર્જરી)",
      phoneLabel: "ફોન",
      mobileLabel: "મોબાઈલ",
      emailLabel: "ઈમેલ",
      bpLabel: "બી.પી.",
      heightLabel: "ઊંચાઈ",
      weightLabel: "વજન",
      bmiLabel: "બી.એમ.આઈ.",
      patientNameLabel: "દર્દીનું નામ",
      appDownload:
        "તમારી ડિજિટલ પ્રિસ્ક્રિપ્શન જોવા અને ડોક્ટર સાથે ચેટ કરવા માટે ગૂગલ પ્લે સ્ટોર પરથી 'HealthPlix' એપ ડાઉનલોડ કરો અને QR કોડ સ્કેન કરો.",
    },
  };

  const translateValue = async (
    val: string,
    targetLang: string = printLanguage,
  ) => {
    if (!val || targetLang === "en") return val;

    try {
      // Use the Google Translate GTX API for full dynamic translation without hardcoded maps
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=gu&dt=t&q=${encodeURIComponent(val)}`,
      );
      const data = await response.json();
      // Join all segments to ensure full sentence translation
      return data[0].map((x: any) => x[0]).join("");
    } catch (error) {
      console.error("Translation error:", error);
      return val; // Fallback to original text if API fails
    }
  };

  const printAllPrescriptions = async () => {
    const t = translations[printLanguage];

    // Pre-translate everything if language is Gujarati
    let localizedData = { ...previewData };
    let localizedPatientName = patient.name;
    let localizedGender = patient.gender;
    let localizedClinicName = "DentalCare Pro Clinic";
    let localizedDoctorName = "Dr. Rajesh Sharma";
    let localizedDoctorDegrees = "BDS, MDS (Oral & Maxillofacial Surgery)";

    if (printLanguage === "gu") {
      const tasks = [
        translateValue(patient.name).then((res) => (localizedPatientName = res)),
        translateValue(patient.gender).then((res) => (localizedGender = res)),
        translateValue(previewData.complaints).then(
          (res) => (localizedData.complaints = res),
        ),
        translateValue(previewData.diagnosis).then(
          (res) => (localizedData.diagnosis = res),
        ),
        translateValue(previewData.advice).then(
          (res) => (localizedData.advice = res),
        ),
        translateValue(previewData.tests).then(
          (res) => (localizedData.tests = res),
        ),
        translateValue(translations.gu.clinicName).then(
          (res) => (localizedClinicName = res),
        ),
        translateValue(translations.gu.doctorName).then(
          (res) => (localizedDoctorName = res),
        ),
        translateValue(translations.gu.doctorDegrees).then(
          (res) => (localizedDoctorDegrees = res),
        ),
      ];
      await Promise.all(tasks);
    }

    const allPrescriptions = (patient.prescriptionHistory || []).flatMap(
      (record: any) =>
        (record.prescriptions || []).map((p: any) => ({
          ...p,
          date: record.date,
        })),
    );

    // Translate medicine names and details
    const translatedPrescriptions = await Promise.all(
      allPrescriptions.map(async (m: any) => {
        if (printLanguage === "gu") {
          return {
            ...m,
            medicine: await translateValue(m.medicine),
            timing: await translateValue(m.timing),
            frequency: await translateValue(m.frequency),
            duration: await translateValue(m.duration),
          };
        }
        return m;
      }),
    );

    const historyContent = `
      <div style="margin-top: 15px;">
        <div style="font-size: 18px; font-weight: 800; margin: 10px 0; color: #000; border-bottom: 2px solid #000; display: inline-block; padding-right: 20px;">${t.rx}</div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #e2e8f0; border-top: 1px solid #94a3b8; border-bottom: 1px solid #94a3b8;">
              <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #000; font-weight: 900; width: 45%;">${t.medicine}</th>
              <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #000; font-weight: 900;">${t.dosage}</th>
              <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #000; font-weight: 900;">${t.timing}</th>
              <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #000; font-weight: 900;">${t.qty}</th>
            </tr>
          </thead>
          <tbody>
            ${translatedPrescriptions
        .map(
          (m: any, i: number) => `
              <tr style="border-bottom: 1px solid #cbd5e1;">
                <td style="padding: 12px; font-size: 13px; width: 45%;">
                  <div style="font-weight: 800; color: #000;">${i + 1}) ${m.medicine.toUpperCase()}</div>
                  <div style="margin-top: 6px; padding-left: 20px;">
                    <div style="font-size: 11px; color: #475569; display: flex; gap: 10px;">
                      <span style="font-weight: 700; min-width: 70px;">${t.timingLabel}</span>
                      <span>: ${m.timing || "-"}</span>
                    </div>
                    ${m.composition
              ? `
                    <div style="font-size: 11px; color: #64748b; display: flex; gap: 10px; margin-top: 2px;">
                      <span style="font-weight: 700; min-width: 70px;">${t.composition}</span>
                      <span>: ${m.composition}</span>
                    </div>
                    `
              : ""
            }
                    <div style="font-size: 9px; color: #94a3b8; margin-top: 4px;">${t.prescribedOn}: ${new Date(m.date).toLocaleDateString()}</div>
                  </div>
                </td>
                <td style="padding: 12px; font-size: 14px; font-weight: 800; color: #000; text-align: center; letter-spacing: 2px;">
                  ${m.dosage ? m.dosage.split("-").join("  -  ") : "-"}
                </td>
                <td style="padding: 12px; font-size: 12px; color: #1e293b; font-weight: 700;">
                  ${m.timing || "-"} - ${m.frequency || "-"} - ${m.duration || "-"}
                </td>
                <td style="padding: 12px; font-size: 13px; font-weight: 800; color: #000; text-align: center;">
                  ${m.qty || "-"}
                </td>
              </tr>
            `,
        )
        .join("")}
          </tbody>
        </table>
      </div>
    `;

    // Translate custom sections
    const translatedCustomSections = await Promise.all(
      customSections.map(async (s) => ({
        ...s,
        title: printLanguage === "gu" ? await translateValue(s.title) : s.title,
        content:
          printLanguage === "gu" ? await translateValue(s.content) : s.content,
      })),
    );

    const customContent = translatedCustomSections
      .map(
        (section) => `
      <div style="margin-top: 15px;">
        <div style="font-size: 13px; font-weight: 800; color: #111827; margin-top: 10px;">${section.title}:</div>
        <div style="font-size: 13px; color: #374151;">${section.content}</div>
      </div>
    `,
      )
      .join("");

    const printContent = `
      <html>
        <head>
          <title>Prescription - ${patient.name}</title>
          <style>
            @page { size: A4; margin: 10mm 15mm; }
            body { font-family: 'Segoe UI', 'Arial', sans-serif; color: #1f2937; margin: 0; padding: 0; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 15px; margin-bottom: 10px; }
            .clinic-logo { width: 50px; height: 50px; background: #3b82f6; border-radius: 8px; margin-right: 15px; }
            .clinic-name { font-size: 20px; font-weight: 800; color: #1e40af; margin-bottom: 2px; }
            .clinic-info { font-size: 11px; color: #4b5563; }
            .doctor-name { font-size: 18px; font-weight: 800; color: #1e40af; text-align: right; }
            .degree { font-size: 11px; font-weight: 700; color: #4b5563; text-align: right; }
            
            .patient-bar { border-top: 2px solid #1e40af; border-bottom: 1px solid #e5e7eb; padding: 10px 0; display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 15px; font-weight: 700; color: #111827; }
            .vitals-grid { display: flex; gap: 30px; font-size: 13px; margin-bottom: 15px; color: #111827; }
            
            .section-label { font-size: 13px; font-weight: 800; color: #111827; margin-top: 10px; display: inline-block; min-width: 100px; }
            .section-content { font-size: 13px; color: #374151; display: inline-block; font-weight: 500; }
            
            .footer { position: fixed; bottom: 30px; left: 0; right: 0; border-top: 1px solid #1e40af; padding-top: 15px; display: flex; justify-content: space-between; align-items: flex-end; }
            .sig-area { text-align: right; }
            .sig-line { border-top: 1px solid #334155; width: 160px; margin-left: auto; margin-bottom: 5px; }
            .sig-name { font-weight: 800; font-size: 13px; color: #111827; }
            .sig-title { font-size: 11px; color: #4b5563; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display: flex; align-items: center;">
              <div class="clinic-logo"></div>
              <div>
                <div class="clinic-name">${localizedClinicName}</div>
                <div class="clinic-info">${printLanguage === "gu" ? t.clinicAddress : "#102, C Block, South Extension - 1"}</div>
                <div class="clinic-info">${printLanguage === "gu" ? t.clinicCity : "New Delhi"} | ${printLanguage === "gu" ? t.phoneLabel : "Ph"}: 9204972991 / 9934004494</div>
              </div>
            </div>
            <div>
              <div class="doctor-name">${localizedDoctorName}</div>
              <div class="degree">${localizedDoctorDegrees}</div>
              <div class="degree">${printLanguage === "gu" ? t.dentalSurgeon : "Consultant Dental Surgeon"}</div>
              <div class="clinic-info">${printLanguage === "gu" ? t.emailLabel : "Email"}: dr.rajesh@dentalcare.com</div>
              <div class="clinic-info">${printLanguage === "gu" ? t.mobileLabel : "Mobile"}: 9204972991</div>
            </div>
          </div>

          <div class="patient-bar">
            <span>${patient.id} : ${localizedPatientName.toUpperCase()} (${previewData.age || "—"} ${printLanguage === "gu" ? t.yrs : "yrs"}, ${localizedGender || "—"}) - ${patient.id}</span>
            <span>${t.date}: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>

          <div class="vitals-grid">
            <span><strong>${printLanguage === "gu" ? t.bpLabel : "BP"}</strong> ${previewData.bp} ${printLanguage === "gu" ? t.bpUnit : "mmHg"}</span>
            <span><strong>${printLanguage === "gu" ? t.heightLabel : "Height"}</strong> ${previewData.height} ${printLanguage === "gu" ? t.heightUnit : "cm"}</span>
            <span><strong>${printLanguage === "gu" ? t.weightLabel : "Weight"}</strong> ${previewData.weight} ${printLanguage === "gu" ? t.weightUnit : "kg"}</span>
            <span><strong>${printLanguage === "gu" ? t.bmiLabel : "BMI"}</strong> ${previewData.bmi} ${printLanguage === "gu" ? t.bmiUnit : "Kg/m²"}</span>
          </div>

          <div style="margin-bottom: 10px;">
            <div class="section-label">${t.complaints}:</div>
            <div class="section-content">${localizedData.complaints}</div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <div class="section-label">${t.diagnosis}:</div>
            <div class="section-content">${localizedData.diagnosis}</div>
          </div>

          ${historyContent}
          ${customContent}

          ${localizedData.advice
        ? `
            <div style="margin-top: 15px;">
              <div class="section-label" style="vertical-align: top;">${t.advice}:</div>
              <div class="section-content" style="padding-top: 10px;">${localizedData.advice}</div>
            </div>
          `
        : ""
      }

          ${localizedData.tests
        ? `
            <div style="margin-top: 15px;">
              <div class="section-label">${t.tests}:</div>
              <div class="section-content" style="font-weight: 700; color: #1e40af;">${localizedData.tests.toUpperCase()}</div>
            </div>
          `
        : ""
      }

          <div style="margin-top: 15px; font-size: 13px; font-weight: 700;">
            ${previewData.nextVisit ? `${t.nextVisit} : ${printLanguage === "gu" ? "૧ મહિના" : "1 months"} (${new Date(previewData.nextVisit).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })})` : ""}
          </div>

          <div class="footer">
            <div style="display: flex; align-items: center; gap: 15px;">
              <div style="width: 60px; height: 60px; border: 1px solid #e5e7eb; padding: 5px; background: white;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${patient.id}" style="width: 100%; height: 100%;" />
              </div>
              <div style="font-size: 10px; color: #6b7280; max-width: 300px;">
                ${printLanguage === "gu" ? t.appDownload : 'Download "HealthPlix" app from Google Play and scan the QR code to view digital prescription and chat with doctor.'}
              </div>
            </div>
            <div class="sig-area">
              <div style="font-size: 11px; font-style: italic; color: #6b7280; margin-bottom: 40px;">${t.signature}</div>
              <div class="sig-line"></div>
              <div class="sig-name">${localizedDoctorName}</div>
              <div class="sig-title">${localizedDoctorDegrees}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const printBarcode = () => {
    const printContent = `
      <html>
        <head>
          <title>Patient Barcode - ${patient.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              text-align: center;
              background: white;
            }
            .barcode-card {
              border: 2px solid #2563eb;
              border-radius: 12px;
              padding: 20px;
              margin: 20px auto;
              width: 300px;
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            }
            .clinic-header {
              color: #1e40af;
              margin-bottom: 15px;
            }
            .barcode {
              font-family: 'Courier New', monospace;
              font-size: 24px;
              font-weight: bold;
              letter-spacing: 2px;
              background: white;
              padding: 10px;
              border: 1px solid #ddd;
              margin: 15px 0;
              border-radius: 6px;
            }
            .patient-info {
              background: white;
              padding: 15px;
              border-radius: 8px;
              margin-top: 15px;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <div class="barcode-card">
            <div class="clinic-header">
              <h1>🦷 DentalCare Pro</h1>
              <p>Dr. Sharma's Dental Clinic</p>
            </div>
            <div class="barcode">${patient.barcode}</div>
            <div class="patient-info">
              <h3>Patient Information</h3>
              <p><strong>ID:</strong> ${patient.id}</p>
              <p><strong>Name:</strong> ${patient.name}</p>
              <p><strong>Phone:</strong> ${patient.phone}</p>
              <p><strong>DOB:</strong> ${new Date(patient.dateOfBirth).toLocaleDateString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "medical", label: "Medical Info", icon: Heart },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "treatments", label: "Treatments", icon: Stethoscope },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "family", label: "Family", icon: User },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-7xl sm:max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-2xl z-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:space-x-6 gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                {patient.avatar ? (
                  <img
                    src={patient.avatar}
                    alt={patient.name}
                    className="w-20 h-20 rounded-2xl object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-blue-600" />
                )}
              </div>
              <div className="text-center sm:text-left min-w-0 flex-1">
                <h2
                  className="text-xl font-bold text-gray-900 truncate"
                  title={patient.name}
                >
                  {patient.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {patient.id}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${patient.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {patient.status}
                  </span>
                  {patient.outstandingBalance > 0 && (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800">
                      ₹{patient.outstandingBalance.toLocaleString()} PENDING
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:space-x-3">
              {patient.outstandingBalance > 0 && (
                <button
                  onClick={handleSendReminder}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 flex items-center text-sm font-medium disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Reminder
                </button>
              )}
              <button
                onClick={() => onExport?.(patient.id)}
                className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 flex items-center text-sm font-medium transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Full Report
              </button>
              <button
                onClick={printBarcode}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 flex items-center text-sm font-medium transition-all duration-200"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Barcode
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-6 bg-gray-100 rounded-xl p-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="xl:col-span-2 bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900 break-all leading-tight">
                        {patient.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">
                        {patient.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium text-gray-900">
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {patient.gender}
                      </p>
                    </div>
                  </div>
                  {patient.bloodGroup && (
                    <div className="flex items-center">
                      <Heart className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Blood Group</p>
                        <p className="font-medium text-red-600">
                          {patient.bloodGroup}
                        </p>
                      </div>
                    </div>
                  )}
                  {patient.occupation && (
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Occupation</p>
                        <p className="font-medium text-gray-900">
                          {patient.occupation}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium text-gray-900">
                        {patient.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Emergency Contact</p>
                      <p className="font-medium text-gray-900">
                        {patient.emergencyContact}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats & Actions */}
              <div className="space-y-4">
                {/* Patient Stats */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Patient Statistics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                        <span className="text-sm text-gray-700">
                          Total Visits
                        </span>
                      </div>
                      <span className="text-xl font-bold text-blue-600">
                        {
                          patientAppointments.filter(
                            (a) => a.status === "completed",
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                      <div className="flex items-center">
                        <UserPlus className="w-5 h-5 text-blue-600 mr-3" />
                        <span className="text-sm text-gray-700">
                          Registered on
                        </span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'New Registration'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                      <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
                        <span className="text-sm text-gray-700">
                          Last Visit
                        </span>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        {patientAppointments.filter(
                          (a) => a.status === "completed",
                        ).length > 0
                          ? new Date(
                            Math.max(
                              ...patientAppointments
                                .filter((a) => a.status === "completed")
                                .map((a) => new Date(a.date).getTime()),
                            ),
                          ).toLocaleDateString()
                          : "No visits yet"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 text-purple-600 mr-3" />
                        <span className="text-sm text-gray-700">
                          Outstanding
                        </span>
                      </div>
                      <span
                        className={`text-lg font-bold ${patient.outstandingBalance > 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        ₹{patient.outstandingBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barcode Section */}
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200">
                  <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                    <QrCode className="w-5 h-5 mr-2" />
                    Patient Barcode
                  </h3>
                  <div className="bg-white rounded-xl p-4 text-center border border-purple-200">
                    <div className="font-mono text-xl text-purple-900 tracking-wider mb-3">
                      {patient.barcode}
                    </div>
                    <button
                      onClick={printBarcode}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium transition-all duration-200 flex items-center mx-auto"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Print Barcode
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "medical" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Medical History */}
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Medical History
                </h3>
                <div className="space-y-3">
                  {(patient?.medicalHistory || []).length > 0 ? (
                    patient.medicalHistory.map((condition, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm"
                      >
                        <p className="text-blue-800 font-medium">{condition}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                      <p className="text-blue-600">
                        No medical history recorded
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Allergies */}
              <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Allergies & Alerts
                </h3>
                <div className="space-y-3">
                  {(patient?.allergies || []).length > 0 ? (
                    patient.allergies.map((allergy, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl p-4 border border-red-200 shadow-sm"
                      >
                        <div className="flex items-center">
                          <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                          <p className="text-red-800 font-medium">{allergy}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-12 h-12 text-red-300 mx-auto mb-3" />
                      <p className="text-red-600">No allergies recorded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Medical Info */}
              <div className="lg:col-span-2 bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {patient.bloodGroup && (
                    <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                      <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Blood Group</p>
                      <p className="font-bold text-red-600">
                        {patient.bloodGroup}
                      </p>
                    </div>
                  )}
                  {patient.occupation && (
                    <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                      <User className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Occupation</p>
                      <p className="font-medium text-gray-900">
                        {patient.occupation}
                      </p>
                    </div>
                  )}
                  {patient.maritalStatus && (
                    <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                      <User className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Marital Status</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {patient.maritalStatus}
                      </p>
                    </div>
                  )}
                  {patient.insuranceProvider && (
                    <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                      <CreditCard className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Insurance</p>
                      <p className="font-medium text-gray-900">
                        {patient.insuranceProvider}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                Appointment History
              </h3>
              {patientAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {appointment.treatmentType || appointment.type}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.date).toLocaleDateString()} at{" "}
                          {appointment.time}
                        </p>
                        <p className="text-sm text-gray-600">
                          with {appointment.doctorName || appointment.doctor}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}
                    >
                      {appointment.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
              {patientAppointments.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No appointments found
                </div>
              )}
            </div>
          )}

          {activeTab === "treatments" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Treatment Journey
                </h3>
              </div>

              {/* In-Progress Treatments */}
              <div>
                <h4 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Active Treatments
                </h4>
                <div className="space-y-3">
                  {patientTreatments.filter(t => t.status === 'in-progress').map((treatment) => (
                    <div
                      key={treatment.id}
                      className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                            <Stethoscope className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{treatment.procedure}</p>
                            <p className="text-xs text-gray-600">Tooth: <span className="font-bold">#{treatment.tooth}</span></p>
                            <p className="text-[10px] text-gray-500 font-mono mt-1">{new Date(treatment.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-900">₹{treatment.cost.toLocaleString()}</p>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-600 text-white uppercase">IN-PROGRESS</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {patientTreatments.filter(t => t.status === 'in-progress').length === 0 && (
                    <p className="text-sm text-gray-400 italic py-2 px-4 bg-gray-50 rounded-xl border border-dashed">No active treatments today</p>
                  )}
                </div>
              </div>

              {/* Planned Treatments */}
              <div>
                <h4 className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Pending Plans (from Consultation)
                </h4>
                <div className="space-y-3">
                  {patientTreatments.filter(t => t.status === 'planned').map((treatment) => (
                    <div
                      key={treatment.id}
                      className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                            <Stethoscope className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{treatment.procedure}</p>
                            <p className="text-xs text-gray-600">Tooth: <span className="font-bold">#{treatment.tooth}</span></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-900">₹{treatment.cost.toLocaleString()}</p>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-200 text-purple-700 uppercase">PLANNED</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {patientTreatments.filter(t => t.status === 'planned').length === 0 && (
                    <p className="text-sm text-gray-400 italic py-2 px-4 bg-gray-50 rounded-xl border border-dashed">No pending plans recorded</p>
                  )}
                </div>
              </div>

              {/* Completed Treatments */}
              <div>
                <h4 className="text-sm font-bold text-green-600 uppercase tracking-widest mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed Treatments
                </h4>
                <div className="space-y-3">
                  {patientTreatments.filter(t => t.status === 'completed').map((treatment) => (
                    <div
                      key={treatment.id}
                      className="bg-green-50/30 rounded-2xl p-4 border border-green-100"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                          <div>
                            <p className="font-semibold text-gray-700">{treatment.procedure}</p>
                            <p className="text-xs text-gray-500">Tooth: #{treatment.tooth}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-gray-400">₹{treatment.cost.toLocaleString()}</p>
                          <p className="text-[10px] text-green-600 font-bold uppercase">{new Date(treatment.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Billing History
                </h3>
                {patient.outstandingBalance > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-red-900">
                          Outstanding Balance
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          ₹{patient.outstandingBalance.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={handleSendReminder}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Reminder
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {patientInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {invoice.id}
                        </p>
                        <p className="text-sm text-gray-600">
                          Issued: {new Date(invoice.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ₹
                        {(
                          invoice.amount ||
                          invoice.total ||
                          0
                        ).toLocaleString()}
                      </p>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}
                      >
                        {invoice.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {patientInvoices.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No invoices found
                </div>
              )}
            </div>
          )}
          {activeTab === "prescriptions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Prescription History
                </h3>
                {patient.prescriptionHistory &&
                  patient.prescriptionHistory.length > 0 && (
                    <button
                      onClick={handlePrintDocument}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 flex items-center text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-200"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print Document
                    </button>
                  )}
              </div>

              {patient.prescriptionHistory?.length > 0 ? (
                patient.prescriptionHistory.map((record) => (
                  <div
                    key={record.id}
                    className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-200 mb-4"
                  >
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mr-3">
                          <Pill className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-gray-900 leading-tight">
                            {record.treatment}
                          </h4>
                          <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider">
                            Date: {new Date(record.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {record.prescriptions?.map(
                        (prescription: any, index: number) => (
                          <div
                            key={index}
                            className="bg-gray-50/50 rounded-xl p-3 border border-gray-100/50"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-blue-400">
                                  #{index + 1}
                                </span>
                                <h5 className="font-bold text-gray-900 text-sm">
                                  {prescription.medicine}
                                </h5>
                                {prescription.instructions && (
                                  <span className="hidden md:inline-flex items-center text-[11px] text-gray-500 italic bg-white px-2 py-0.5 rounded border border-gray-100">
                                    <Activity className="w-3 h-3 mr-1 text-blue-300" />
                                    {prescription.instructions}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                  <span className="px-2 py-1 text-[10px] bg-gray-50 text-gray-500 border-r border-gray-200 font-bold uppercase">
                                    Dosage
                                  </span>
                                  <span className="px-2 py-1 text-[11px] text-blue-600 font-bold">
                                    {prescription.dosage}
                                  </span>
                                </div>
                                <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                  <span className="px-2 py-1 text-[10px] bg-gray-50 text-gray-500 border-r border-gray-200 font-bold uppercase">
                                    Freq
                                  </span>
                                  <span className="px-2 py-1 text-[11px] text-blue-600 font-bold">
                                    {prescription.frequency}
                                  </span>
                                </div>
                                <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                  <span className="px-2 py-1 text-[10px] bg-gray-50 text-gray-500 border-r border-gray-200 font-bold uppercase">
                                    Days
                                  </span>
                                  <span className="px-2 py-1 text-[11px] text-blue-600 font-bold">
                                    {prescription.duration}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Mobile only instructions */}
                            {prescription.instructions && (
                              <div className="md:hidden mt-2 text-[11px] text-gray-500 italic px-2">
                                Note: {prescription.instructions}
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>

                    {record.consultationNotes && (
                      <div className="mt-3 p-3 bg-amber-50/30 rounded-xl border border-amber-100/50 flex gap-3 items-start">
                        <FileText className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-0.5">
                            Clinical Advice
                          </p>
                          <p className="text-xs text-gray-700">
                            {record.consultationNotes}
                          </p>
                        </div>
                      </div>
                    )}

                    {(record.customFields || []).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-2">
                        {record.customFields.map((field: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-white px-3 py-1 rounded-lg border border-gray-100 flex items-center gap-2"
                          >
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                              {field.title}:
                            </span>
                            <span className="text-xs text-gray-900 font-bold">
                              {field.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No prescriptions found
                </div>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Patient Documents & Images
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patient.documents?.length > 0 &&
                    patient.documents.map((document) => (
                      <div
                        key={document.id}
                        className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Image className="w-5 h-5 text-blue-600 mr-2" />
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${document.type === "x-ray"
                                  ? "bg-purple-100 text-purple-800"
                                  : document.type === "lab-report"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                            >
                              {document.type.replace("-", " ").toUpperCase()}
                            </span>
                          </div>
                          <button
                            onClick={() => window.open(document.url, "_blank")}
                            disabled={loading}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium disabled:opacity-50"
                          >
                            {loading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Reminder
                              </>
                            )}
                          </button>
                        </div>
                        <img
                          src={document.url}
                          alt={document.name}
                          className="w-full h-40 object-cover rounded-lg mb-3 cursor-pointer hover:shadow-lg transition-all duration-200"
                          onClick={() => window.open(document.url, "_blank")}
                        />
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {document.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(document.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                </div>

                {(!patient.documents || patient.documents.length === 0) && (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No documents uploaded
                    </h3>
                    <p className="text-gray-600">
                      Medical images and documents will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === "family" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Family Members
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {familyMembers.length}{" "}
                  {familyMembers.length === 1 ? "Member" : "Members"}
                </span>
              </div>

              {familyMembers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p className="text-gray-500">No family members found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add your first family member to get started
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {familyMembers.map((member) => (
                    <div
                      key={member.id}
                      className="group bg-white rounded-2xl p-5 border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-indigo-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">
                              {member.name}
                            </p>
                            <p className="text-sm text-gray-500 font-mono">
                              {member.id}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="bg-gray-50 px-3 py-1.5 rounded-lg">
                            <span className="text-gray-500">Age:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {member.dateOfBirth
                                ? Math.floor(
                                  (Date.now() -
                                    new Date(member.dateOfBirth).getTime()) /
                                  (365.25 * 24 * 60 * 60 * 1000),
                                )
                                : "-"}
                            </span>
                          </div>
                          <div className="bg-gray-50 px-3 py-1.5 rounded-lg">
                            <span className="text-gray-500">Relation:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {member.relation || "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Print Preview & Edit Modal */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-600 text-white">
              <div className="flex items-center gap-3">
                <Printer className="w-6 h-6" />
                <div>
                  <h3 className="text-xl font-bold">
                    Prescription Preview & Edit
                  </h3>
                  <p className="text-xs text-blue-100">
                    Review and finalize clinical details before printing
                  </p>
                </div>
                <div className="flex bg-blue-700/50 p-1 rounded-xl border border-blue-400/30 ml-4">
                  <button
                    onClick={() => setPrintLanguage("en")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${printLanguage === "en"
                        ? "bg-white text-blue-600 shadow-lg"
                        : "text-blue-100 hover:text-white"
                      }`}
                  >
                    ENGLISH
                  </button>
                  <button
                    onClick={() => setPrintLanguage("gu")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${printLanguage === "gu"
                        ? "bg-white text-blue-600 shadow-lg"
                        : "text-blue-100 hover:text-white"
                      }`}
                  >
                    ગુજરાતી (GUJ)
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="hover:bg-white/10 p-2 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Vitals Form */}
                <div className="space-y-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b pb-2">
                    Clinical Vitals
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        BP (mmHg)
                      </label>
                      <input
                        type="text"
                        value={previewData.bp}
                        onChange={(e) =>
                          setPreviewData({ ...previewData, bp: e.target.value })
                        }
                        placeholder="120/80"
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Weight (Kg)
                      </label>
                      <input
                        type="text"
                        value={previewData.weight}
                        onChange={(e) =>
                          setPreviewData({
                            ...previewData,
                            weight: e.target.value,
                          })
                        }
                        placeholder="70"
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Height (cm)
                      </label>
                      <input
                        type="text"
                        value={previewData.height}
                        onChange={(e) =>
                          setPreviewData({
                            ...previewData,
                            height: e.target.value,
                          })
                        }
                        placeholder="170"
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        BMI
                      </label>
                      <input
                        type="text"
                        value={previewData.bmi}
                        onChange={(e) =>
                          setPreviewData({
                            ...previewData,
                            bmi: e.target.value,
                          })
                        }
                        placeholder="24.2"
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b pb-2 pt-4">
                    Clinical Observations
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Complaints
                      </label>
                      <textarea
                        rows={2}
                        value={previewData.complaints}
                        onChange={(e) =>
                          setPreviewData({
                            ...previewData,
                            complaints: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Diagnosis
                      </label>
                      <textarea
                        rows={2}
                        value={previewData.diagnosis}
                        onChange={(e) =>
                          setPreviewData({
                            ...previewData,
                            diagnosis: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Info Form */}
                <div className="space-y-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b pb-2">
                    Treatment Advice
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Advice/Notes
                      </label>
                      <textarea
                        rows={3}
                        value={previewData.advice}
                        onChange={(e) =>
                          setPreviewData({
                            ...previewData,
                            advice: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        placeholder="e.g., Avoid cold water, soft diet..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Tests Prescribed
                      </label>
                      <input
                        type="text"
                        value={previewData.tests}
                        onChange={(e) =>
                          setPreviewData({
                            ...previewData,
                            tests: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g., X-Ray, Blood Test..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Next Visit Date
                      </label>
                      <input
                        type="date"
                        value={previewData.nextVisit}
                        onChange={(e) =>
                          setPreviewData({
                            ...previewData,
                            nextVisit: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b pb-2 pt-4 flex items-center justify-between">
                    <span>Custom Sections</span>
                    <button
                      onClick={() =>
                        setCustomSections([
                          ...customSections,
                          {
                            id: Date.now().toString(),
                            title: "New Section",
                            content: "",
                          },
                        ])
                      }
                      className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg border border-blue-100 hover:bg-blue-100 transition-all"
                    >
                      + Add New
                    </button>
                  </h4>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {customSections.map((section, idx) => (
                      <div
                        key={section.id}
                        className="p-3 bg-gray-50 rounded-xl border border-gray-100 relative group"
                      >
                        <button
                          onClick={() =>
                            setCustomSections(
                              customSections.filter((s) => s.id !== section.id),
                            )
                          }
                          className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <input
                          type="text"
                          placeholder="Section Title (e.g., Follow-up)"
                          value={section.title}
                          onChange={(e) => {
                            const newSections = [...customSections];
                            newSections[idx].title = e.target.value;
                            setCustomSections(newSections);
                          }}
                          className="w-full bg-transparent text-xs font-bold text-gray-700 mb-2 border-b border-gray-200 focus:border-blue-400 outline-none pb-1"
                        />
                        <textarea
                          rows={2}
                          placeholder="Section content..."
                          value={section.content}
                          onChange={(e) => {
                            const newSections = [...customSections];
                            newSections[idx].content = e.target.value;
                            setCustomSections(newSections);
                          }}
                          className="w-full bg-transparent text-xs text-gray-600 outline-none resize-none"
                        />
                      </div>
                    ))}
                    {customSections.length === 0 && (
                      <p className="text-[10px] text-gray-400 text-center py-4 italic">
                        No custom sections added. Click "+ Add New" to include
                        more info like follow-up notes.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setShowPrintPreview(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  printAllPrescriptions();
                  setShowPrintPreview(false);
                }}
                className="bg-blue-600 text-white px-8 py-2.5 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-all flex items-center"
              >
                <Printer className="w-5 h-5 mr-2" />
                Confirm & Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
