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
import { Modal, Button, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
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
import { usePatientAppointmentHistoryQuery } from "../../hooks/patients/usePatientAppointmentHistoryQuery";
import { usePatientFamilyTreeQuery } from "../../hooks/patients/usePatientFamilyTreeQuery";
import { toTitleCase } from "@/utils/stringUtils";

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

  const { data: historyData } = usePatientAppointmentHistoryQuery(patient?.id || "");
  const { data: familyTreeData } = usePatientFamilyTreeQuery(patient?.id || "");

  // Extract family members from API response
  const apiData = familyTreeData?.responseObject?.data || familyTreeData?.data;
  
  let allFamilyMembers: any[] = [];
  if (apiData) {
    if (apiData.primary) {
      allFamilyMembers.push(apiData.primary);
    }
    if (Array.isArray(apiData.dependents)) {
      allFamilyMembers = [...allFamilyMembers, ...apiData.dependents];
    }
  }

  // Filter out the current patient so they don't see themselves in their own family list
  const otherFamilyMembers = allFamilyMembers.filter((m: any) => m.id !== patient.id);

  const resolvedFamilyMembers = (otherFamilyMembers.length > 0 || apiData)
    ? otherFamilyMembers.map((m: any) => ({
        id: m.id,
        patientCode: m.patient_code || m.patientCode || m.id,
        name: m.name,
        // If it's the primary patient, we label them as PRIMARY, otherwise use their relation
        relation: m.id === apiData?.primary?.id 
          ? "PRIMARY" 
          : (m.relation_type || m.relation || m.relationship || "Family"),
        phone: m.phone,
        email: m.email,
        dateOfBirth: m.date_of_birth || m.dateOfBirth || m.dob,
        gender: m.gender,
        bloodGroup: m.blood_group || m.bloodGroup,
        status: m.is_active ? "active" : "inactive",
        lastVisit: m.last_visit_date || m.lastVisit || null,
        outstandingBalance: m.outstanding_balance || m.outstandingBalance || 0,
        totalVisits: m.total_visits || 0,
        profilePicture: m.profile_picture_url || null,
      }))
    : familyMembers;

  const formatAppointmentDate = (dateVal?: string | number | Date) => {
    if (!dateVal) return "—";
    try {
      const d = new Date(dateVal);
      return !isNaN(d.getTime())
        ? d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : String(dateVal);
    } catch (e) {
      return String(dateVal);
    }
  };

  const localPatientAppointments = appointments.filter(
    (a) => a.patientId === patient.id || a.patientPhone === patient.phone,
  );

  let patientAppointments = localPatientAppointments;
  if (historyData) {
    // Navigate the exact API structure: responseObject.data.history[]
    const rawAppointments: any[] =
      historyData?.responseObject?.data?.history ||
      historyData?.data?.history ||
      historyData?.history ||
      (Array.isArray(historyData) ? historyData : []);

    if (rawAppointments.length > 0) {
      patientAppointments = rawAppointments.map((a: any) => {
        let dateVal = a.date_ist || a.date;
        let formattedDate = formatAppointmentDate(dateVal);

        let timeStr = a.start_time_ist || a.time || a.start_time || "";
        if (timeStr) {
          if (timeStr.includes("T")) {
            try {
              timeStr = new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch(e) {}
          } else if (timeStr.match(/^\d{2}:\d{2}$/) || timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
            try {
              const [h, m] = timeStr.split(":");
              let hr = parseInt(h, 10);
              const ampm = hr >= 12 ? "PM" : "AM";
              hr = hr % 12 || 12;
              timeStr = `${String(hr).padStart(2, '0')}:${m} ${ampm}`;
            } catch(e) {}
          }
        }

        const doctorName =
          a.personalProfile?.staff?.name ||
          a.doctorName ||
          a.doctor_name ||
          a.doctor ||
          "Assigned Doctor";

        return {
          id: a.id,
          treatmentType: a.specific_treatment || a.treatmentType || a.type || "General Checkup",
          type: a.type || a.treatmentType,
          date: formattedDate,
          time: timeStr,
          doctorName,
          doctor: doctorName,
          status: (a.status || "scheduled").toLowerCase().replace(/_/g, '-'),
          cost: a.treatment_cost || a.cost || 0,
          concern: a.concern || "",
          notes: a.notes || "",
          duration: a.duration || 15,
        };
      });
    } else if (historyData?.responseObject?.data) {
      // API returned a valid response with empty history
      patientAppointments = [];
    }
  }
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
          localizedClinicName: "Opal Smiles Dental Studio",
          localizedDoctorName: "Dr. Rajesh Sharma",
          localizedDoctorDegrees: "BDS, MDS",
          localizedPatientName: toTitleCase(patient.name),
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
      title={toTitleCase(patient.name)}
      subtitle={`Patient Code: ${patient.patient_code || patient.patientCode || patient.id} • Registered ${new Date(patient.created_at || patient.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`}
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
            variant="outline"
            onClick={onClose}
            className="font-bold uppercase tracking-wider text-xs"
          >
            Close Profile
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="min-h-[60vh] mt-6">
            <TabsContent value="overview" className="m-0 focus-visible:outline-none">
              <OverviewTab
                patient={patient}
                patientAppointments={patientAppointments}
              />
            </TabsContent>
            <TabsContent value="medical" className="m-0 focus-visible:outline-none">
              <MedicalInfoTab patient={patient} />
            </TabsContent>
            <TabsContent value="appointments" className="m-0 focus-visible:outline-none">
              <AppointmentsTab
                patientAppointments={patientAppointments}
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            <TabsContent value="treatments" className="m-0 focus-visible:outline-none">
              <TreatmentsTab patientTreatments={patientTreatments} />
            </TabsContent>
            <TabsContent value="billing" className="m-0 focus-visible:outline-none">
              <BillingTab
                patient={patient}
                patientInvoices={patientInvoices}
                getStatusColor={getStatusColor}
                handleSendReminder={handleSendReminder}
              />
            </TabsContent>
            <TabsContent value="prescriptions" className="m-0 focus-visible:outline-none">
              <PrescriptionsTab
                patient={patient}
                handlePrintDocument={handleOpenPrintModal}
              />
            </TabsContent>
            <TabsContent value="documents" className="m-0 focus-visible:outline-none">
              <DocumentsTab patient={patient} loading={loading} />
            </TabsContent>
            <TabsContent value="family" className="m-0 focus-visible:outline-none">
              <FamilyTab familyMembers={resolvedFamilyMembers} />
            </TabsContent>
          </div>
        </Tabs>
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
