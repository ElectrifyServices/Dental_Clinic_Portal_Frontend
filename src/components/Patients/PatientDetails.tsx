import { useState } from "react";
import {
  User,
  Calendar,
  Stethoscope,
  Download,
  QrCode,
  Pill,
  FileText,
  Heart,
  CreditCard,
} from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { OverviewTab } from "./PatientDetails/OverviewTab";
import {
  MedicalInfoTab,
  AppointmentsTab,
  TreatmentsTab,
  BillingTab,
  PrescriptionsTab,
  DocumentsTab,
  FamilyTab,
} from "./PatientDetails/TabComponents";
import { PrescriptionPrintModal } from "./PatientDetails/PrescriptionPrintModal";
import { translations } from "./PatientDetails/translateUtils";
import {
  getPrescriptionHTML,
  getBarcodeHTML,
} from "./PatientDetails/PrintTemplates";

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
  onSendReminder = () => {},
  onExport = () => {},
}: PatientDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printLanguage, setPrintLanguage] = useState<"en" | "gu">("en");
  const [customSections, setCustomSections] = useState<any[]>([]);
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

  if (!patient) return null;

  const patientAppointments = appointments.filter(
    (a) => a.patientId === patient.id || a.patientPhone === patient.phone,
  );
  const patientTreatments = treatments.filter(
    (t) => t.patientId === patient.id,
  );
  const patientInvoices = invoices.filter(
    (inv) => inv.patientId === patient.id,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-primary/10 text-primary";
      default:
        return "bg-muted text-foreground";
    }
  };

  const handleSendReminder = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
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
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(
        getPrescriptionHTML({
          t,
          localizedClinicName: "DentalCare Pro Clinic",
          localizedDoctorName: "Dr. Rajesh Sharma",
          localizedDoctorDegrees: "BDS, MDS",
          localizedPatientName: patient.name,
          previewData,
          localizedGender: patient.gender,
          localizedData: previewData,
          historyContent: "",
          customContent: "",
          printLanguage,
          patientId: patient.id,
        }),
      );
      win.document.close();
      setTimeout(() => {
        win.print();
        win.close();
      }, 500);
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
    <Modal
      title={patient.name}
      subtitle={`Member ID: ${patient.id} • Registered ${new Date(patient.registrationDate || Date.now()).toLocaleDateString()}`}
      onClose={onClose}
      size="5xl"
      icon={
        patient.avatar ? (
          <img
            src={patient.avatar}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <User className="w-5 h-5 text-primary" />
        )
      }
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2">
            <Button
              onClick={() => onExport?.(patient.id)}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/10"
            >
              <Download className="w-4 h-4 mr-2" /> Export Dossier
            </Button>
            <Button
              onClick={handlePrintBarcode}
              className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/10"
            >
              <QrCode className="w-4 h-4 mr-2" /> Generate Barcode
            </Button>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground font-black uppercase tracking-widest text-[10px]"
          >
            Close Profile
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        <div className="flex p-1.5 bg-muted/30 rounded-2xl gap-1 overflow-x-auto scrollbar-hide border border-border/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap
                  ${
                    isActive
                      ? "bg-white text-primary shadow-xl shadow-primary/5 ring-1 ring-border/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                  }
                `}
              >
                <Icon
                  className={`w-3.5 h-3.5 mr-2 ${isActive ? "text-primary" : "text-muted-foreground/60"}`}
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="min-h-[60vh]">
          {activeTab === "overview" && (
            <OverviewTab
              patient={patient}
              patientAppointments={patientAppointments}
            />
          )}
          {activeTab === "medical" && <MedicalInfoTab patient={patient} />}
          {activeTab === "appointments" && (
            <AppointmentsTab
              patientAppointments={patientAppointments}
              getStatusColor={getStatusColor}
            />
          )}
          {activeTab === "treatments" && (
            <TreatmentsTab patientTreatments={patientTreatments} />
          )}
          {activeTab === "billing" && (
            <BillingTab
              patient={patient}
              patientInvoices={patientInvoices}
              getStatusColor={getStatusColor}
              handleSendReminder={handleSendReminder}
            />
          )}
          {activeTab === "prescriptions" && (
            <PrescriptionsTab
              patient={patient}
              handlePrintDocument={handleOpenPrintModal}
            />
          )}
          {activeTab === "documents" && (
            <DocumentsTab patient={patient} loading={loading} />
          )}
          {activeTab === "family" && (
            <FamilyTab familyMembers={familyMembers} />
          )}
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
    </Modal>
  );
}
