import React, { useState } from "react";
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

// Modals
import { AppointmentForm } from "./components/Appointments/AppointmentForm";
import { PatientForm } from "./components/Patients/PatientForm";
import { InvoiceForm } from "./components/Billing/InvoiceForm";
import { InvoiceViewer } from "./components/Billing/InvoiceViewer";
import { TreatmentForm } from "./components/Treatments/TreatmentForm";
import { DoctorForm } from "./components/Staff/DoctorForm";
import { PatientConsultation } from "./components/Doctor/PatientConsultation";
import { PatientDetails } from "./components/Patients/PatientDetails";
import { TodaySchedulePopup } from "./components/Appointments/TodaySchedulePopup";

// Icons & Utils
import {
  X,
  Calendar as CalendarIcon,
  Users,
  Plus,
  AlertTriangle,
} from "lucide-react";

function MainApp() {
  const {
    patients,
    setPatients,
    appointments,
    setAppointments,
    queuedPatients,
    setQueuedPatients,
    invoices,
    setInvoices,
    treatments,
    setTreatments,
    handleSaveAppointment,
    handleDeleteAppointment,
    handleUpdateAppointmentStatus,
    handleDeleteInvoice,
    handleUpdateInvoiceStatus,
    handleSavePatient,
    handleDeletePatient,
    handleSaveInvoice,
    handleSaveTreatment,
    completedConsultations,
    handleCompleteConsultation,
    handleUpdateConsultation,
  } = useAppData();

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
  const [showPatientNotFound, setShowPatientNotFound] = useState(false);
  const [pendingCheckInAppt, setPendingCheckInAppt] = useState<any>(null);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
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

  // Handlers
  const handleCheckInPatient = (appointment: any) => {
    const existingPatient = patients.find(
      (p) => p.phone === (appointment.patientPhone || appointment.phone),
    );
    if (!existingPatient) {
      setPendingCheckInAppt(appointment);
      setShowPatientNotFound(true);
      return;
    }
    const queuedPatient = {
      id: appointment.id,
      patientId: existingPatient.id,
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone || appointment.phone,
      appointmentTime: appointment.time,
      status: "waiting",
      treatmentType: appointment.treatment || appointment.type,
    };
    setQueuedPatients((prev) => [...prev, queuedPatient]);
    handleUpdateAppointmentStatus(appointment.id, "checked-in");
    alert(`${appointment.patientName} checked in.`);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage appointments={appointments} />;
      case "appointments":
        return (
          <AppointmentsPage
            appointments={appointments}
            doctorsWithSchedules={doctorsWithSchedules}
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
                patientHistory: backgroundPatient
                  ? {
                      medicalHistory: backgroundPatient.medicalHistory || [],
                      allergies: backgroundPatient.allergies || [],
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
            onAddTreatment={() => setShowTreatmentForm(true)}
            onViewTreatment={(id) => setSelectedItemId(id)}
            onEditTreatment={(id) => {
              setSelectedItemId(id);
              setShowTreatmentForm(true);
            }}
            onManageSessions={() => {}}
            onMarkCompleted={() => {}}
          />
        );
      case "staff":
        return (
          <StaffPage
            onAddDoctor={() => setShowDoctorForm(true)}
            onEditDoctor={(id) => {
              setSelectedItemId(id);
              setShowDoctorForm(true);
            }}
            onDeleteDoctor={() => {}}
            onManageSchedule={() => {}}
          />
        );
      case "profit-sharing":
        return (
          <ProfitSharingPage
            treatments={treatments}
            doctorsWithSchedules={doctorsWithSchedules}
          />
        );
      default:
        return <DashboardPage appointments={appointments} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header onShowTodaySchedule={() => setShowTodaySchedulePopup(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
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
            alert("Appointment saved successfully!");
          }}
          appointment={selectedAppointment}
          doctors={doctorsWithSchedules}
          doctorAvailability={doctorAvailability}
          appointments={appointments}
        />
      )}

      {showPatientForm && (
        <PatientForm
          onClose={() => setShowPatientForm(false)}
          onSave={(patient) => {
            handleSavePatient(patient, patientFormType, parentPatientId);
            setShowPatientForm(false);
            setSelectedPatientId("");
            setParentPatientId("");
            alert("Patient registered successfully!");
          }}
          patient={patients.find((p) => p.id === selectedPatientId)}
          type={patientFormType}
          parentId={parentPatientId}
        />
      )}

      {showDiagnoseForm && selectedPatientForDiagnose && (
        <PatientConsultation
          patient={selectedPatientForDiagnose}
          onClose={() => setShowDiagnoseForm(false)}
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
            setShowDiagnoseForm(false);
            alert("Consultation completed and saved to history!");
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
          onClose={() => setShowPatientDetails(false)}
          onSendReminder={(id, amount) =>
            alert(`Reminder sent to ${id} for ₹${amount}`)
          }
        />
      )}

      {showTodaySchedulePopup && (
        <TodaySchedulePopup
          onClose={() => setShowTodaySchedulePopup(false)}
          appointments={appointments}
          doctors={doctorsWithSchedules}
          doctorAvailability={doctorAvailability}
          patients={patients}
          onToggleDoctorAvailability={(id) =>
            setDoctorAvailability((prev) => ({ ...prev, [id]: !prev[id] }))
          }
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
