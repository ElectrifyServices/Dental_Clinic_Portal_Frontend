import React, { useState, useMemo } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { useAppData } from "./hooks/useAppData";
import { doctorsWithSchedules } from "./data/doctors";

// Layout
import { Header } from "./components/Layout/Header";
import { Sidebar } from "./components/Layout/Sidebar";
import { MobileNav } from "./components/Layout/MobileNav";
import { LoginForm } from "./components/Auth/LoginForm";

// Pages
import { DashboardPage } from "./pages/DashboardPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { PatientsPage } from "./pages/PatientsPage";
import { QueuePage } from "./pages/QueuePage";
import { TreatmentsPage } from "./pages/TreatmentsPage";
import { BillingPage } from "./pages/BillingPage";
import { StaffPage } from "./pages/StaffPage";
import { ProfitSharingPage } from "./pages/ProfitSharingPage";
import { MedicalRecordsPage } from "./pages/MedicalRecordsPage";
import { ConsentPage } from "./pages/ConsentPage";
import { ReportsPage } from "./pages/ReportsPage";
import { InventoryPage } from "./pages/InventoryPage";
import { CorporatePlansPage } from "./pages/CorporatePlansPage";

// Modals
import { AppointmentForm } from "./components/Appointments/AppointmentForm";
import { PatientForm } from "./components/Patients/PatientForm";
import { InvoiceForm } from "./components/Billing/InvoiceForm";
import { CorporateManagement } from "./components/Patients/CorporateManagement";
import { InvoiceViewer } from "./components/Billing/InvoiceViewer";
import { TreatmentForm } from "./components/Treatments/TreatmentForm";
import { DoctorForm } from "./components/Staff/DoctorForm";
import { PatientConsultation } from "./components/Doctor/PatientConsultation";
import { PatientDetails } from "./components/Patients/PatientDetails";
import { TodaySchedulePopup } from "./components/Appointments/TodaySchedulePopup";
import { DoctorScheduleManager } from "./components/Staff/DoctorScheduleManager";
import { SalaryPaymentModal } from "./components/Staff/SalaryPaymentModal";
import { SalaryHistoryModal } from "./components/Staff/SalaryHistoryModal";
import { TreatmentViewer } from "./components/Treatments/TreatmentViewer";
import { TreatmentSessionManager } from "./components/Treatments/TreatmentSessionManager";
import { EMRForm } from "./components/EMR/EMRForm";
import { EMRViewer } from "./components/EMR/EMRViewer";
import { ConsentForm } from "./components/Consent/ConsentForm";
import { ConsentFormViewer } from "./components/Consent/ConsentFormViewer";
import { InventoryForm } from "./components/Inventory/InventoryForm";
import { RestockForm } from "./components/Inventory/RestockForm";

// Icons & Utils
import {
  X,
  Calendar as CalendarIcon,
  Users,
  Plus,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import { exportPatientReport } from "./utils/exportPatient";
import { processPatientCheckIn } from "./utils/patientCheckIn";

function MainApp() {
  const {
    patients,
    setPatients,
    appointments,
    setAppointments,
    queuedPatients,
    invoices,
    treatments,
    emrRecords,
    completedConsultations,
    staffMembers,
    consentForms,
    inventory,
    setQueuedPatients,
    handleSaveAppointment,
    handleDeleteAppointment,
    handleUpdateAppointmentStatus,
    handleSavePatient,
    handleDeletePatient,
    handleSaveInvoice,
    handleDeleteInvoice,
    handleUpdateInvoiceStatus,
    handleSaveStaff,
    handleDeleteStaff,
    handleSaveTreatment,
    handleCompleteConsultation,
    handleUpdateConsultation,
    handleSaveEMR,
    handleSaveConsentForm,
    handleDeleteConsentForm,
    handleSaveInventoryItem,
    handleDeleteInventoryItem,
    corporatePlans,
    corporateEmployees,
    handleSaveCorporatePlan,
    handleDeleteCorporatePlan,
    handleToggleCorporatePlan,
    handleSaveEmployee,
    handleDeleteEmployee,
    handleBulkSaveEmployees,
    handleChangeEmployeePlan,
    handleBulkSavePatients,
    handleDeleteCorporateEmployee,
    handleUpdateCorporateEmployee,
  } = useAppData();

  const activeDoctors = useMemo(() =>
    staffMembers.filter(s => s.role === 'doctor' || s.role === 'admin'),
    [staffMembers]
  );

  const { state } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");

  // UI State
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [showDiagnoseForm, setShowDiagnoseForm] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [showTodaySchedulePopup, setShowTodaySchedulePopup] = useState(false);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTreatmentViewer, setShowTreatmentViewer] = useState(false);
  const [showTreatmentSessionManager, setShowTreatmentSessionManager] =
    useState(false);
  const [showEMRForm, setShowEMRForm] = useState(false);
  const [showEMRViewer, setShowEMRViewer] = useState(false);
  const [showConsentForm, setShowConsentForm] = useState(false);
  const [showConsentViewer, setShowConsentViewer] = useState(false);
  const [selectedEMRId, setSelectedEMRId] = useState("");
  const [selectedEMRRecord, setSelectedEMRRecord] = useState<any>(null);
  const [selectedConsentForm, setSelectedConsentForm] = useState<any>(null);
  const [selectedStaffForSalary, setSelectedStaffForSalary] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showPatientNotFound, setShowPatientNotFound] = useState(false);
  const [pendingCheckInAppt, setPendingCheckInAppt] = useState<any>(null);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showRestockForm, setShowRestockForm] = useState(false);
  const [showCorporateModal, setShowCorporateModal] = useState(false);
  const [selectedItemForRestock, setSelectedItemForRestock] = useState<any>(null);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [preFilledPatientData, setPreFilledPatientData] = useState<{
    name: string;
    phone: string;
  } | null>(null);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedPatientForDiagnose, setSelectedPatientForDiagnose] =
    useState<any>(null);
  const [patientFormType, setPatientFormType] = useState<"normal" | "person">(
    "normal",
  );
  const [parentPatientId, setParentPatientId] = useState("");

  const [doctorAvailability, setDoctorAvailability] = useState(
    doctorsWithSchedules.reduce(
      (acc, d) => ({ ...acc, [d.id]: d.isAvailableToday }),
      {},
    ),
  );

  const [bookedFollowUp, setBookedFollowUp] = useState<{ date: string; time: string } | null>(null);
  const [draftConsultations, setDraftConsultations] = useState<Record<string, any>>({});
  const [isFollowUpBooking, setIsFollowUpBooking] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDraftUpdate = React.useCallback((patientId: string, data: any) => {
    setDraftConsultations(prev => {
      // Only update if data actually changed to avoid unnecessary renders
      if (JSON.stringify(prev[patientId]) === JSON.stringify(data)) return prev;
      return { ...prev, [patientId]: data };
    });
  }, []);

  // Handlers
  const handleAddNewPatient = () => {
    setSelectedPatientId("");
    setPreFilledPatientData(null);
    setShowPatientForm(true);
  };

  const handleExportPatient = (patientId: string) => {
    exportPatientReport(patientId, patients, appointments, treatments, invoices);
  };

  const handleTogglePatientStatus = (patientId: string, newStatus: 'active' | 'inactive') => {
    const targetPatient = patients.find(p => p.id === patientId);
    if (targetPatient) {
      handleSavePatient({
        ...targetPatient,
        status: newStatus,
        deactivatedAt: newStatus === 'inactive' ? new Date().toISOString() : undefined
      });
      showToast(`Patient marked as ${newStatus}!`);
    }
  };

  const handleCheckInPatient = (appointment: any) => {
    const searchName = (appointment.patientName || appointment.patient || "").toLowerCase().trim();
    const searchPhone = (appointment.patientPhone || appointment.phone || "").trim();

    const existingPatient = patients.find((p) => {
      const pName = (p.name || "").toLowerCase().trim();
      const pPhone = (p.phone || "").trim();
      return pPhone === searchPhone && pName === searchName;
    });

    setPendingCheckInAppt(appointment);

    if (existingPatient) {
      // Patient exists: Show their form for verification/edit
      setSelectedPatientId(existingPatient.id);
      setShowPatientForm(true);
      alert("Please verify patient details before check-in");
    } else {
      // Patient not found: Show registration modal
      setShowPatientNotFound(true);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            appointments={appointments}
            onAddPatient={handleAddNewPatient}
          />
        );
      case "appointments":
        return (
          <AppointmentsPage
            appointments={appointments}
            doctorsWithSchedules={activeDoctors}
            doctorAvailability={doctorAvailability}
            handleNewAppointment={() => {
              setSelectedAppointment(null);
              setShowAppointmentForm(true);
            }}
            handleDeleteAppointment={handleDeleteAppointment}
            handleUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            handleCheckInPatient={handleCheckInPatient}
            setSelectedAppointment={setSelectedAppointment}
            setShowAppointmentForm={setShowAppointmentForm}
          />
        );
      case "patients":
        return (
          <PatientsPage
            patients={patients}
            handleViewPatient={(id) => {
              setSelectedPatientId(id);
              setShowPatientDetails(true);
            }}
            handleEditPatient={(id) => {
              setSelectedPatientId(id);
              setShowPatientForm(true);
            }}
            handleDeletePatient={handleDeletePatient}
            setShowPatientForm={setShowPatientForm}
            setPatientFormType={setPatientFormType}
            setParentPatientId={setParentPatientId}
            setSelectedPatientId={setSelectedPatientId}
            handleExportPatient={handleExportPatient}
            handleToggleStatus={handleTogglePatientStatus}
            onShowCorporateManagement={() => setShowCorporateModal(true)}
          />
        );
      case "inventory":
        return (
          <InventoryPage
            inventory={inventory}
            onAddItem={() => {
              setSelectedItemId("");
              setShowInventoryForm(true);
            }}
            onEditItem={(id) => {
              setSelectedItemId(id);
              setShowInventoryForm(true);
            }}
            onDeleteItem={handleDeleteInventoryItem}
            onRestock={(item) => {
              setSelectedItemForRestock(item);
              setShowRestockForm(true);
            }}
          />
        );
      case "patient-queue":
      case "doctor-queue":
        return (
          <QueuePage
            doctorName={state.user?.name || "Doctor"}
            queuedPatients={queuedPatients}
            onSelectPatient={(p) => {
              const backgroundPatient = patients.find(
                (bp) => bp.phone === p.patientPhone,
              );
              setSelectedPatientForDiagnose({
                ...p,
                phone: p.patientPhone,
                patientHistory: backgroundPatient
                  ? {
                    medicalHistory: backgroundPatient.medicalHistory || [],
                    allergies: backgroundPatient.allergies || [],
                    gender: backgroundPatient.gender || "",
                    dateOfBirth: backgroundPatient.dateOfBirth || "",
                    bloodGroup: backgroundPatient.bloodGroup || "",
                  }
                  : undefined,
              });
              setShowDiagnoseForm(true);
            }}
            onUpdatePatientStatus={(id, s) =>
              setQueuedPatients((prev) =>
                prev.map((p) => (p.id === id ? { ...p, status: s } : p)),
              )
            }
            onDirectConsultation={(name, phone, doctorId, doctorName, time) => {
              const existingPatient = patients.find(
                (p) =>
                  p.name.toLowerCase() === name.toLowerCase().trim() &&
                  p.phone.replace(/\D/g, "") === phone.replace(/\D/g, ""),
              );
              if (existingPatient) {
                setSelectedPatientForDiagnose({
                  id: `WALK-${Date.now()}`,
                  patientId: existingPatient.id,
                  patientName: existingPatient.name,
                  patientPhone: existingPatient.phone,
                  phone: existingPatient.phone,
                  treatmentType: existingPatient.treatmentType || "General Consultation",
                  patientConcern: "",
                  status: "in-consultation",
                  doctorId: doctorId || "1",
                  doctorName: doctorName || "Dr. Rajesh Sharma",
                  appointmentTime: time || new Date().toLocaleTimeString(),
                  patientHistory: {
                    medicalHistory: existingPatient.medicalHistory || [],
                    allergies: existingPatient.allergies || [],
                    gender: existingPatient.gender || "",
                    dateOfBirth: existingPatient.dateOfBirth || "",
                    bloodGroup: existingPatient.bloodGroup || "",
                  },
                });
                setShowDiagnoseForm(true);
              }
            }}
            onRegisterNew={(name, phone) => {
              setPatientFormType("patient");
              setSelectedPatientId("");
              setPreFilledPatientData({ name, phone });
              setShowPatientForm(true);
            }}
            patients={patients}
            doctors={activeDoctors}
            appointments={appointments}
            doctorAvailability={doctorAvailability}
            onUpdateConsultation={(updatedConsultation) => {
              handleUpdateConsultation?.(updatedConsultation);
              // Also sync to patient's record
              const prescriptions = updatedConsultation.prescriptions || [];
              const patientId = updatedConsultation.patientId;
              const patientPhone = updatedConsultation.patientContact;

              const targetPatient = patients.find(
                (p) => p.id === patientId || p.phone === patientPhone,
              );
              if (targetPatient) {
                const newRecord = {
                  id:
                    updatedConsultation.id?.toString() || Date.now().toString(),
                  date:
                    updatedConsultation.completedAt || new Date().toISOString(),
                  treatment:
                    updatedConsultation.treatmentProcedure ||
                    updatedConsultation.diagnosis ||
                    "Consultation",
                  prescriptions: prescriptions.filter(
                    (pr: any) => pr.medicine && pr.medicine.trim() !== "",
                  ),
                };

                const otherPrescriptions = (
                  targetPatient.prescriptionHistory || []
                ).filter((r: any) => r.id !== newRecord.id);

                handleSavePatient({
                  ...targetPatient,
                  prescriptionHistory: [newRecord, ...otherPrescriptions],
                });
              }
            }}
          />
        );
      case "billing":
        return (
          <BillingPage
            invoices={invoices}
            onCreateInvoice={() => setShowInvoiceForm(true)}
            onViewInvoice={(id) => {
              setSelectedItemId(id);
            }}
            onDeleteInvoice={handleDeleteInvoice}
            onUpdateStatus={handleUpdateInvoiceStatus}
          />
        );
      case "treatments":
        return (
          <TreatmentsPage
            treatments={treatments}
            onAddTreatment={() => {
              setSelectedItemId("");
              setShowTreatmentForm(true);
            }}
            onViewTreatment={(id) => {
              setSelectedItemId(id);
              setShowTreatmentViewer(true);
            }}
            onEditTreatment={(id) => {
              setSelectedItemId(id);
              setShowTreatmentForm(true);
            }}
            onManageSessions={(id) => {
              setSelectedItemId(id);
              setShowTreatmentSessionManager(true);
            }}
            onMarkCompleted={(id) => {
              const treatment = treatments.find((t) => t.id === id);
              if (treatment) {
                handleSaveTreatment({ ...treatment, status: "completed" });
                showToast("Treatment marked as completed!");
              }
            }}
            onStartTreatment={(id) => {
              const treatment = treatments.find((t) => t.id === id);
              if (treatment) {
                handleSaveTreatment({ ...treatment, status: "in-progress" });
                showToast("Treatment started!");
              }
            }}
          />
        );
      case "emr":
        return (
          <MedicalRecordsPage
            patients={patients}
            treatments={treatments}
            invoices={invoices}
            appointments={appointments}
            emrRecords={emrRecords}
            onAddRecord={() => setShowEMRForm(true)}
            onViewRecord={(record) => {
              setSelectedEMRRecord(record);
              setShowEMRViewer(true);
            }}
            onExportRecord={(record) => {
              // Basic export logic similar to EMRViewer
              const printContent = `
                <html>
                  <body>
                    <h1>${record.title}</h1>
                    <p>Patient: ${record.patientName}</p>
                    <p>Date: ${new Date(record.date).toLocaleDateString()}</p>
                    <p>Doctor: ${record.doctorName}</p>
                    <hr/>
                    <div style="white-space: pre-wrap;">${record.content}</div>
                  </body>
                </html>
              `;
              const blob = new Blob([printContent], { type: 'text/html' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `emr-${record.patientName}-${record.date}.html`;
              a.click();
              URL.revokeObjectURL(url);
              showToast("Record exported successfully!");
            }}
          />
        );
      case "staff":
        return (
          <StaffPage
            staffMembers={staffMembers}
            onAddDoctor={() => setShowDoctorForm(true)}
            onEditDoctor={(id) => {
              setSelectedItemId(id);
              setShowDoctorForm(true);
            }}
            onDeleteDoctor={(id) => {
              const staff = staffMembers.find(s => s.id === id);
              if (window.confirm(`Are you sure you want to delete ${staff?.name}? This action cannot be undone.`)) {
                handleDeleteStaff(id);
                showToast("Staff member deleted successfully!", "error");
              }
            }}
            onUpdateStaff={(staff) => {
              handleSaveStaff(staff);
              showToast("Staff member status updated!");
            }}
            onManageSchedule={(id) => {
              setSelectedItemId(id);
              setShowScheduleManager(true);
            }}
            onPaySalary={(id, name) => {
              setSelectedStaffForSalary({ id, name });
              setShowSalaryModal(true);
            }}
            onViewSalaryHistory={(id, name) => {
              setSelectedStaffForSalary({ id, name });
              setShowHistoryModal(true);
            }}
          />
        );
      case "profit-sharing":
        return (
          <ProfitSharingPage
            treatments={treatments}
            doctorsWithSchedules={activeDoctors}
          />
        );
      case "consent":
        return (
          <ConsentPage
            forms={consentForms}
            onAddForm={() => setShowConsentForm(true)}
            onViewForm={(id) => {
              const form = consentForms.find(f => f.id === id);
              if (form) {
                setSelectedConsentForm(form);
                setShowConsentViewer(true);
              }
            }}
            onDeleteForm={handleDeleteConsentForm}
          />
        );
      case "reports":
        return (
          <ReportsPage
            patients={patients}
            appointments={appointments}
            treatments={treatments}
            invoices={invoices}
          />
        );
      case "corporate-plans":
        return (
          <CorporatePlansPage
            plans={corporatePlans}
            employees={corporateEmployees}
            onSavePlan={handleSaveCorporatePlan}
            onDeletePlan={handleDeleteCorporatePlan}
            onTogglePlan={handleToggleCorporatePlan}
            onSaveEmployee={handleSaveEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onBulkSaveEmployees={handleBulkSaveEmployees}
            onChangePlan={handleChangeEmployeePlan}
          />
        );
      default:
        return (
          <DashboardPage
            appointments={appointments}
            onAddPatient={handleAddNewPatient}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          onShowTodaySchedule={() => setShowTodaySchedulePopup(true)}
          onQuickAppointment={() => {
            setSelectedAppointment(null);
            setShowAppointmentForm(true);
          }}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar pb-20 md:pb-6">
          <div className="w-full mx-auto px-2">{renderPage()}</div>
        </main>
      </div>

      <MobileNav currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* Shared Modals */}
      {showAppointmentForm && (
        <AppointmentForm
          onClose={() => setShowAppointmentForm(false)}
          onSave={(apt) => {
            handleSaveAppointment(apt);
            setShowAppointmentForm(false);
            setSelectedAppointment(null);
            setIsFollowUpBooking(false);
            if (showDiagnoseForm) {
              setBookedFollowUp({ date: apt.date as string, time: apt.time as string });
            }
            alert("Appointment saved successfully!");
          }}
          onClose={() => {
            setShowAppointmentForm(false);
            setSelectedAppointment(null);
            setIsFollowUpBooking(false);
          }}
          appointment={selectedAppointment}
          isFollowUp={isFollowUpBooking}
          doctors={activeDoctors}
          doctorAvailability={doctorAvailability}
          appointments={appointments}
          patients={patients}
        />
      )}

      {showPatientForm && (
        <PatientForm
          onClose={() => {
            setShowPatientForm(false);
            setPreFilledPatientData(null);
          }}
          isCheckIn={!!pendingCheckInAppt}
          onSave={(patient) => {
            handleSavePatient(patient, patientFormType, parentPatientId);
            const wasDirectConsultation = !!preFilledPatientData;
            const hasPendingCheckIn = !!pendingCheckInAppt;

            setShowPatientForm(false);
            setSelectedPatientId("");
            setParentPatientId("");
            setPreFilledPatientData(null);

            if (hasPendingCheckIn) {
              const queuedPatient = {
                id: pendingCheckInAppt.id,
                patientId: patient.id,
                patientName: patient.name,
                patientPhone: patient.phone,
                appointmentTime: pendingCheckInAppt.time,
                status: "waiting",
                treatmentType:
                  pendingCheckInAppt.treatment || pendingCheckInAppt.type,
                patientConcern: pendingCheckInAppt.patientConcern || pendingCheckInAppt.notes || "",
              };
              setQueuedPatients((prev) => {
                const exists = prev.some(p => p.id === queuedPatient.id);
                if (exists) return prev;
                return [...prev, queuedPatient];
              });
              handleUpdateAppointmentStatus(pendingCheckInAppt.id, "checked-in");
              setPendingCheckInAppt(null);
              showToast("Patient registered and checked-in successfully!");
            } else if (wasDirectConsultation) {
              showToast("Patient registered successfully!");
            } else {
              showToast("Patient registered successfully!");
            }
          }}
          patient={
            selectedPatientId
              ? patients.find((p) => p.id === selectedPatientId)
              : preFilledPatientData
                ? {
                  name: preFilledPatientData.name,
                  phone: preFilledPatientData.phone,
                }
                : undefined
          }
          type={patientFormType}
          parentId={parentPatientId}
          corporateEmployees={corporateEmployees}
          corporatePlans={corporatePlans}
        />
      )}

      {showDiagnoseForm && selectedPatientForDiagnose && (
        <PatientConsultation
          patient={selectedPatientForDiagnose}
          doctors={activeDoctors}
          doctorAvailability={doctorAvailability}
          appointments={appointments}
          bookedFollowUp={bookedFollowUp}
          initialData={draftConsultations[selectedPatientForDiagnose.patientId || selectedPatientForDiagnose.id]}
          onDraftUpdate={(data) => {
            handleDraftUpdate(selectedPatientForDiagnose.patientId || selectedPatientForDiagnose.id, data);
          }}
          onScheduleFollowUp={(data) => {
            setSelectedAppointment(data);
            setShowAppointmentForm(true);
            setIsFollowUpBooking(true);
          }}
          onClose={() => {
            setShowDiagnoseForm(false);
            setBookedFollowUp(null);
          }}
          onCompleteConsultation={(data) => {
            handleCompleteConsultation({
              ...data,
              id: Date.now(),
              patientName: selectedPatientForDiagnose.patientName,
              completedAt: data.consultationDate || new Date().toISOString(),
              patientId:
                selectedPatientForDiagnose.patientId ||
                selectedPatientForDiagnose.id,
              patientContact: selectedPatientForDiagnose.patientPhone,
            });

            // Update patient's prescription history
            const targetPatient = patients.find(
              (p) =>
                p.id === selectedPatientForDiagnose.patientId ||
                p.id === selectedPatientForDiagnose.id ||
                p.phone === selectedPatientForDiagnose.patientPhone,
            );

            if (targetPatient) {
              const filledPrescriptions = (data.prescriptions || []).filter(
                (pr: any) => pr.medicine && pr.medicine.trim() !== "",
              );

              if (filledPrescriptions.length > 0) {
                const newRecord = {
                  id: Date.now().toString(),
                  date: data.consultationDate || new Date().toISOString(),
                  treatment:
                    data.treatmentProcedure || data.diagnosis || "Consultation",
                  observations: data.observations,
                  diagnosis: data.diagnosis,
                  vitals: {
                    bp: data.bp || "",
                    height: data.height || "",
                    weight: data.weight || "",
                    bmi: data.bmi || "",
                  },
                  consultationNotes: data.consultationNotes,
                  tests: data.tests,
                  nextVisit: data.nextVisit,
                  prescriptions: filledPrescriptions,
                };

                handleSavePatient({
                  ...targetPatient,
                  prescriptionHistory: [
                    newRecord,
                    ...(targetPatient.prescriptionHistory || []),
                  ],
                });
              }
            }

            setQueuedPatients((prev) =>
              prev.filter((p) => p.id !== selectedPatientForDiagnose.id),
            );

            // Clear draft after completion
            const patientId = selectedPatientForDiagnose.patientId || selectedPatientForDiagnose.id;
            setDraftConsultations(prev => {
              const next = { ...prev };
              delete next[patientId];
              return next;
            });

            // Modal will be closed by the user from the success screen in PatientConsultation
            console.log("Consultation completed and saved to history!");
          }}
          onCreateTreatment={(treatment) => {
            handleSaveTreatment?.(treatment);
          }}
        />
      )}

      {showInvoiceForm && (
        <InvoiceForm
          onClose={() => setShowInvoiceForm(false)}
          onSave={(invoice) => {
            handleSaveInvoice(invoice);
            setShowInvoiceForm(false);
            alert("Invoice created successfully!");
          }}
          patients={patients}
          treatments={treatments}
          consultations={completedConsultations}
          corporatePlans={corporatePlans}
        />
      )}
      {showTreatmentForm && (
        <TreatmentForm
          onClose={() => {
            setShowTreatmentForm(false);
            setSelectedItemId("");
          }}
          onSave={(treatment) => {
            handleSaveTreatment(treatment);
            setShowTreatmentForm(false);
            setSelectedItemId("");
            showToast("Treatment plan saved successfully!");
          }}
          treatment={
            selectedItemId
              ? treatments.find((t) => t.id === selectedItemId)
              : null
          }
          patients={patients}
          doctors={activeDoctors}
          treatments={treatments}
        />
      )}

      {selectedItemId && invoices.find((i) => i.id === selectedItemId) && (
        <InvoiceViewer
          invoiceId={selectedItemId}
          onClose={() => setSelectedItemId("")}
          onUpdateStatus={handleUpdateInvoiceStatus}
        />
      )}

      {showPatientDetails && (
        <PatientDetails
          patient={patients.find((p) => p.id === selectedPatientId)}
          familyMembers={patients.filter(
            (p) => p.parentId === selectedPatientId,
          )}
          appointments={appointments}
          treatments={treatments}
          invoices={invoices}
          onClose={() => setShowPatientDetails(false)}
          onSendReminder={(id, amount) =>
            alert(`Reminder sent to ${id} for ₹${amount}`)
          }
          onExport={handleExportPatient}
        />
      )}

      {showCorporateModal && (
        <CorporateManagement
          corporatePlans={corporatePlans}
          corporateEmployees={corporateEmployees}
          onSavePlan={handleSaveCorporatePlan}
          onDeletePlan={handleDeleteCorporatePlan}
          onBulkAddPatients={(patients) => {
            handleBulkSavePatients(patients);
            showToast(`Successfully registered ${patients.length} employees!`);
          }}
          onDeleteEmployee={handleDeleteCorporateEmployee}
          onUpdateEmployee={handleUpdateCorporateEmployee}
          onClose={() => setShowCorporateModal(false)}
        />
      )}

      {showTreatmentViewer && selectedItemId && (
        <TreatmentViewer
          treatment={treatments.find((t) => t.id === selectedItemId)}
          onClose={() => {
            setShowTreatmentViewer(false);
          }}
          onEditTreatment={(id) => {
            setShowTreatmentViewer(false);
            setSelectedItemId(id);
            setShowTreatmentForm(true);
          }}
          onMarkCompleted={(id) => {
            const treatment = treatments.find((t) => t.id === id);
            if (treatment) {
              handleSaveTreatment({ ...treatment, status: "completed" });
              showToast("Treatment marked as completed!");
            }
          }}
          onStartTreatment={(id) => {
            const treatment = treatments.find((t) => t.id === id);
            if (treatment) {
              handleSaveTreatment({ ...treatment, status: "in-progress" });
              showToast("Treatment started!");
            }
          }}
        />
      )}

      {showTreatmentSessionManager && selectedItemId && (
        <TreatmentSessionManager
          treatmentId={selectedItemId}
          patientName={
            treatments.find((t) => t.id === selectedItemId)?.patientName || ""
          }
          procedure={
            treatments.find((t) => t.id === selectedItemId)?.procedure || ""
          }
          sessions={
            treatments.find((t) => t.id === selectedItemId)?.sessions || []
          }
          onUpdateSessions={(updatedSessions) => {
            const treatment = treatments.find((t) => t.id === selectedItemId);
            if (treatment) {
              handleSaveTreatment({ ...treatment, sessions: updatedSessions });
              showToast("Treatment sessions updated!");
            }
          }}
          onClose={() => {
            setShowTreatmentSessionManager(false);
            setSelectedItemId("");
          }}
          onScheduleAppointment={(sessionData) => {
            handleSaveAppointment({
              ...sessionData,
              id: Date.now().toString(),
              status: "scheduled",
            });
            showToast("Appointment scheduled for session!");
          }}
        />
      )}

      {showEMRForm && (
        <EMRForm
          onClose={() => setShowEMRForm(false)}
          onSave={(record) => {
            handleSaveEMR(record);
            setShowEMRForm(false);
            showToast("Medical record saved successfully!");
          }}
          patients={patients}
        />
      )}

      {showEMRViewer && selectedEMRRecord && (
        <EMRViewer
          record={selectedEMRRecord}
          onClose={() => {
            setShowEMRViewer(false);
            setSelectedEMRRecord(null);
          }}
        />
      )}

      {showTodaySchedulePopup && (
        <TodaySchedulePopup
          onClose={() => setShowTodaySchedulePopup(false)}
          appointments={appointments}
          doctors={activeDoctors}
          doctorAvailability={doctorAvailability}
          patients={patients}
          onToggleDoctorAvailability={(id) =>
            setDoctorAvailability((prev) => ({ ...prev, [id]: !prev[id] }))
          }
        />
      )}

      {showDoctorForm && (
        <DoctorForm
          onClose={() => {
            setShowDoctorForm(false);
            setSelectedItemId("");
          }}
          onSave={(doctorData) => {
            handleSaveStaff(doctorData);
            setShowDoctorForm(false);
            setSelectedItemId("");
            showToast("Staff member saved successfully!");
          }}
          doctor={
            selectedItemId
              ? staffMembers.find((s) => s.id === selectedItemId)
              : null
          }
        />
      )}

      {showScheduleManager && selectedItemId && (
        <DoctorScheduleManager
          doctorId={selectedItemId}
          doctorName={
            staffMembers.find((s) => s.id === selectedItemId)?.name || ""
          }
          onClose={() => {
            setShowScheduleManager(false);
            setSelectedItemId("");
          }}
          onSave={(scheduleData) => {
            const staff = staffMembers.find((s) => s.id === selectedItemId);
            if (staff) {
              handleSaveStaff({
                ...staff,
                workingHours: scheduleData.workingHours,
                timeSlots: scheduleData.timeSlots,
              });
            }
            setShowScheduleManager(false);
            setSelectedItemId("");
            showToast("Schedule updated successfully!");
          }}
          currentSchedule={
            staffMembers.find((s) => s.id === selectedItemId)?.workingHours
          }
        />
      )}

      {showSalaryModal && selectedStaffForSalary && (
        <SalaryPaymentModal
          staffId={selectedStaffForSalary.id}
          staffName={selectedStaffForSalary.name}
          pendingAmount={parseFloat(
            staffMembers
              .find((s) => s.id === selectedStaffForSalary.id)
              ?.salaryPending?.replace(/,/g, "") || "0",
          )}
          onClose={() => {
            setShowSalaryModal(false);
            setSelectedStaffForSalary(null);
          }}
          onSave={(paymentData) => {
            const staff = staffMembers.find(
              (s) => s.id === paymentData.staffId,
            );
            if (staff) {
              const currentPaid = parseFloat(
                staff.salaryPaid?.replace(/,/g, "") || "0",
              );
              const currentPending = parseFloat(
                staff.salaryPending?.replace(/,/g, "") || "0",
              );
              const payAmount = parseFloat(paymentData.amount);

              handleSaveStaff({
                ...staff,
                salaryPaid: (currentPaid + payAmount).toLocaleString("en-IN"),
                salaryPending: Math.max(
                  0,
                  currentPending - payAmount,
                ).toLocaleString("en-IN"),
                salaryHistory: [
                  {
                    amount: payAmount,
                    date: paymentData.date,
                    mode: paymentData.mode,
                    note: paymentData.note,
                  },
                  ...(staff.salaryHistory || []),
                ],
              });
            }
            setShowSalaryModal(false);
            setSelectedStaffForSalary(null);
            showToast("Salary payment recorded successfully!");
          }}
        />
      )}

      {showHistoryModal && selectedStaffForSalary && (
        <SalaryHistoryModal
          staffName={selectedStaffForSalary.name}
          history={
            staffMembers.find((s) => s.id === selectedStaffForSalary.id)
              ?.salaryHistory || []
          }
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedStaffForSalary(null);
          }}
        />
      )}

      {showConsentForm && (
        <ConsentForm
          onClose={() => setShowConsentForm(false)}
          onSave={(form) => {
            handleSaveConsentForm(form);
            setShowConsentForm(false);
            showToast("Consent form generated successfully!");
          }}
          patients={patients}
          doctors={activeDoctors}
        />
      )}

      {showConsentViewer && selectedConsentForm && (
        <ConsentFormViewer
          form={selectedConsentForm}
          onClose={() => {
            setShowConsentViewer(false);
            setSelectedConsentForm(null);
          }}
        />
      )}

      {showInventoryForm && (
        <InventoryForm
          item={inventory.find((i) => i.id === selectedItemId)}
          onClose={() => {
            setShowInventoryForm(false);
            setSelectedItemId("");
          }}
          onSave={(item) => {
            handleSaveInventoryItem(item);
            setShowInventoryForm(false);
            setSelectedItemId("");
          }}
        />
      )}

      {showRestockForm && selectedItemForRestock && (
        <RestockForm
          item={selectedItemForRestock}
          onClose={() => {
            setShowRestockForm(false);
            setSelectedItemForRestock(null);
          }}
          onSave={(updatedItem) => {
            handleSaveInventoryItem(updatedItem);
            setShowRestockForm(false);
            setSelectedItemForRestock(null);
            showToast(`${updatedItem.name} stock updated successfully!`, "success");
          }}
        />
      )}

      {showPatientNotFound && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl transform transition-all duration-300 scale-100">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Patient Not Found
            </h3>
            <p className="text-gray-600 text-center mb-8">
              No record found for{" "}
              <span className="font-semibold text-gray-900">
                {pendingCheckInAppt?.patientName}
              </span>
              . Please register the patient before checking in.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setPatientFormType("normal");
                  setSelectedPatientId("");
                  setPreFilledPatientData({
                    name: pendingCheckInAppt?.patientName || "",
                    phone: pendingCheckInAppt?.patientPhone || pendingCheckInAppt?.phone || "",
                  });
                  setShowPatientNotFound(false);
                  setShowPatientForm(true);
                }}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Register New Patient
              </button>
              <button
                onClick={() => setShowPatientNotFound(false)}
                className="w-full py-4 text-gray-500 font-semibold hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300`}
        >
          <div
            className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === "success"
              ? "bg-green-600 border-green-500"
              : "bg-red-600 border-red-500"
              } text-white`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span className="font-bold text-sm tracking-wide">
              {toast.message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthenticatedApp() {
  const { state } = useAuth();
  if (!state.isAuthenticated) return <LoginForm />;
  return <MainApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AuthenticatedApp />
      </AppProvider>
    </AuthProvider>
  );
}
