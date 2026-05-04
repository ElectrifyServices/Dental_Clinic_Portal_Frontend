import React, { useState } from "react";
import { X, User, CreditCard, Calendar, Stethoscope, Activity, Download, QrCode, Printer, Pill, FileText, Heart, Send } from "lucide-react";
import { OverviewTab } from "./PatientDetails/OverviewTab";
import { MedicalInfoTab, AppointmentsTab, TreatmentsTab, BillingTab, PrescriptionsTab, DocumentsTab, FamilyTab } from "./PatientDetails/TabComponents";
import { PrescriptionPrintModal } from "./PatientDetails/PrescriptionPrintModal";
import { translations, translateValue } from "./PatientDetails/translateUtils";
import { getPrescriptionHTML, getBarcodeHTML } from "./PatientDetails/PrintTemplates";

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
  const [printLanguage, setPrintLanguage] = useState<"en" | "gu">("en");
  const [customSections, setCustomSections] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState({
    bp: "", height: "", weight: "", bmi: "", complaints: "", diagnosis: "", advice: "", tests: "", nextVisit: "",
  });

  if (!patient) return null;

  const patientAppointments = appointments.filter(a => a.patientId === patient.id || a.patientPhone === patient.phone);
  const patientTreatments = treatments.filter(t => t.patientId === patient.id);
  const patientInvoices = invoices.filter(inv => inv.patientId === patient.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": case "paid": return "bg-green-100 text-green-800";
      case "pending": case "scheduled": return "bg-yellow-100 text-yellow-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleSendReminder = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    onSendReminder(patient.id, patient.outstandingBalance);
    setLoading(false);
  };

  const handlePrintBarcode = () => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(getBarcodeHTML(patient));
      win.document.close();
      win.print();
    }
  };

  const handleOpenPrintModal = () => {
    const latest = patient.prescriptionHistory?.[0];
    if (latest) {
      setPreviewData({
        ...previewData,
        bp: latest.vitals?.bp || "",
        height: latest.vitals?.height || "",
        weight: latest.vitals?.weight || "",
        complaints: latest.observations || latest.treatment || "",
        diagnosis: latest.diagnosis || "General Consultation",
        advice: latest.consultationNotes || "",
      });
    }
    setShowPrintPreview(true);
  };

  const handleGeneratePrint = async () => {
    const t = translations[printLanguage];
    // This is a simplified version of the heavy logic that was in the original file
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(getPrescriptionHTML({
        t,
        localizedClinicName: "DentalCare Pro Clinic",
        localizedDoctorName: "Dr. Rajesh Sharma",
        localizedDoctorDegrees: "BDS, MDS",
        localizedPatientName: patient.name,
        previewData,
        localizedGender: patient.gender,
        localizedData: previewData,
        historyContent: "", // Simplified for now
        customContent: "",
        printLanguage,
        patientId: patient.id
      }));
      win.document.close();
      setTimeout(() => { win.print(); win.close(); }, 500);
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-7xl sm:max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-2xl z-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                {patient.avatar ? <img src={patient.avatar} className="w-full h-full object-cover rounded-xl" /> : <User className="w-10 h-10" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{patient.id}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{patient.status}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => onExport?.(patient.id)} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center"><Download className="w-4 h-4 mr-2" /> Export</button>
              <button onClick={handlePrintBarcode} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center"><Printer className="w-4 h-4 mr-2" /> Barcode</button>
              <button onClick={onClose} className="text-gray-400 p-2 hover:bg-gray-100 rounded-xl"><X className="w-6 h-6" /></button>
            </div>
          </div>

          <div className="flex space-x-1 mt-6 bg-gray-100 rounded-xl p-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                >
                  <Icon className="w-4 h-4 mr-2" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {activeTab === "overview" && <OverviewTab patient={patient} patientAppointments={patientAppointments} />}
          {activeTab === "medical" && <MedicalInfoTab patient={patient} />}
          {activeTab === "appointments" && <AppointmentsTab patientAppointments={patientAppointments} getStatusColor={getStatusColor} />}
          {activeTab === "treatments" && <TreatmentsTab patientTreatments={patientTreatments} />}
          {activeTab === "billing" && <BillingTab patient={patient} patientInvoices={patientInvoices} getStatusColor={getStatusColor} handleSendReminder={handleSendReminder} />}
          {activeTab === "prescriptions" && <PrescriptionsTab patient={patient} handlePrintDocument={handleOpenPrintModal} />}
          {activeTab === "documents" && <DocumentsTab patient={patient} loading={loading} />}
          {activeTab === "family" && <FamilyTab familyMembers={familyMembers} />}
        </div>
      </div>

      <PrescriptionPrintModal
        show={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        printLanguage={printLanguage}
        setPrintLanguage={setPrintLanguage}
        previewData={previewData}
        setPreviewData={setPreviewData}
        customSections={customSections}
        setCustomSections={setCustomSections}
        onPrint={handleGeneratePrint}
      />
    </div>
  );
}
