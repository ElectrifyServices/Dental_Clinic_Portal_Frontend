import React, { useState, useMemo, useCallback } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { TenantProvider } from "./contexts/TenantContext";
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

import {
  X, Calendar as CalendarIcon, Users, Plus, AlertTriangle, CheckCircle, Trash2
} from "lucide-react";
import { ConfirmModal, Modal, Button } from "./components/ui";
import { exportPatientReport } from "./utils/exportPatient";

function MainApp() {
  const data = useAppData();
  const {
    patients, appointments, queuedPatients, invoices, treatments, emrRecords,
    completedConsultations, staffMembers, consentForms, inventory,
    setQueuedPatients, handleSaveAppointment, handleDeleteAppointment,
    handleUpdateAppointmentStatus, handleSavePatient, handleDeletePatient,
    handleSaveInvoice, handleDeleteInvoice, handleUpdateInvoiceStatus,
    handleSaveStaff, handleDeleteStaff, handleSaveTreatment,
    handleCompleteConsultation, handleUpdateConsultation, handleSaveEMR,
    handleSaveConsentForm, handleDeleteConsentForm, handleSaveInventoryItem,
    handleDeleteInventoryItem, corporatePlans, corporateEmployees,
    handleSaveCorporatePlan, handleDeleteCorporatePlan, handleToggleCorporatePlan,
    handleSaveEmployee, handleDeleteEmployee, handleBulkSaveEmployees,
    handleChangeEmployeePlan, handleBulkSavePatients, handleDeleteCorporateEmployee,
    handleUpdateCorporateEmployee,
  } = data;

  const { state } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Selection & Form State
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedEMRRecord, setSelectedEMRRecord] = useState<any>(null);
  const [selectedConsentForm, setSelectedConsentForm] = useState<any>(null);
  const [selectedStaffForSalary, setSelectedStaffForSalary] = useState<any>(null);
  const [selectedPatientForDiagnose, setSelectedPatientForDiagnose] = useState<any>(null);
  const [selectedItemForRestock, setSelectedItemForRestock] = useState<any>(null);
  
  const [preFilledPatientData, setPreFilledPatientData] = useState<any>(null);
  const [patientFormType, setPatientFormType] = useState<"normal" | "person">("normal");
  const [parentPatientId, setParentPatientId] = useState("");
  const [pendingCheckInAppt, setPendingCheckInAppt] = useState<any>(null);

  const [deleteConfig, setDeleteConfig] = useState<any>({ show: false, title: "", message: "", onConfirm: () => { } });
  const [toast, setToast] = useState<any>(null);
  const [bookedFollowUp, setBookedFollowUp] = useState<any>(null);
  const [draftConsultations, setDraftConsultations] = useState<Record<string, any>>({});
  const [isFollowUpBooking, setIsFollowUpBooking] = useState(false);
  const [doctorAvailability, setDoctorAvailability] = useState(
    doctorsWithSchedules.reduce((acc, d) => ({ ...acc, [d.id]: d.isAvailableToday }), {})
  );

  const activeDoctors = useMemo(() =>
    staffMembers.filter(s => s.role === 'doctor' || s.role === 'admin'),
    [staffMembers]
  );

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const confirmDelete = (title: string, message: string, onConfirm: () => void) => {
    setDeleteConfig({
      show: true, title, message,
      onConfirm: () => {
        onConfirm();
        setDeleteConfig((prev: any) => ({ ...prev, show: false }));
        showToast("Record deleted successfully!", "error");
      }
    });
  };

  const handleDraftUpdate = useCallback((patientId: string, data: any) => {
    setDraftConsultations(prev => {
      if (JSON.stringify(prev[patientId]) === JSON.stringify(data)) return prev;
      return { ...prev, [patientId]: data };
    });
  }, []);

  // Page specific handlers
  const handleAddNewPatient = () => { setSelectedPatientId(""); setPreFilledPatientData(null); setActiveModal('patientForm'); };
  const handleExportPatient = (id: string) => exportPatientReport(id, patients, appointments, treatments, invoices);
  
  const handleTogglePatientStatus = (id: string, s: 'active' | 'inactive') => {
    const p = patients.find(x => x.id === id);
    if (p) {
      handleSavePatient({ ...p, status: s, deactivatedAt: s === 'inactive' ? new Date().toISOString() : undefined });
      showToast(`Patient marked as ${s}!`);
    }
  };

  const handleCheckInPatient = (appt: any) => {
    const sName = (appt.patientName || appt.patient || "").toLowerCase().trim();
    const sPhone = (appt.patientPhone || appt.phone || "").trim();
    const existing = patients.find(p => (p.phone || "").trim() === sPhone && (p.name || "").toLowerCase().trim() === sName);
    setPendingCheckInAppt(appt);
    if (existing) {
      setSelectedPatientId(existing.id);
      setActiveModal('patientForm');
      alert("Please verify patient details before check-in");
    } else {
      setActiveModal('patientNotFound');
    }
  };

  const renderCurrentPage = () => {
    const commonProps = { appointments, patients, activeDoctors, doctorAvailability, confirmDelete, showToast, setActiveModal, setSelectedAppointment, setSelectedPatientId, setSelectedItemId, setPatientFormType, setParentPatientId, handleExportPatient };
    
    switch (currentPage) {
      case "dashboard": return <DashboardPage appointments={appointments} onAddPatient={handleAddNewPatient} />;
      case "appointments":
        return <AppointmentsPage {...commonProps} doctorsWithSchedules={activeDoctors} 
          handleNewAppointment={() => { setSelectedAppointment(null); setActiveModal('appointmentForm'); }}
          handleDeleteAppointment={(id) => {
            const apt = appointments.find(a => a.id === id);
            confirmDelete("Delete Appointment", `Delete appointment for ${apt?.patientName || 'this patient'}?`, () => handleDeleteAppointment(id));
          }}
          handleUpdateAppointmentStatus={handleUpdateAppointmentStatus} handleCheckInPatient={handleCheckInPatient}
        />;
      case "patients":
        return <PatientsPage {...commonProps}
          handleViewPatient={(id) => { setSelectedPatientId(id); setActiveModal('patientDetails'); }}
          handleEditPatient={(id) => { setSelectedPatientId(id); setActiveModal('patientForm'); }}
          handleDeletePatient={(id) => {
            const p = patients.find(x => x.id === id);
            confirmDelete("Delete Patient", `Delete patient ${p?.name}? All history will be removed.`, () => handleDeletePatient(id));
          }}
          handleToggleStatus={handleTogglePatientStatus} onShowCorporateManagement={() => setActiveModal('corporateModal')}
        />;
      case "inventory":
        return <InventoryPage inventory={inventory}
          onAddItem={() => { setSelectedItemId(""); setActiveModal('inventoryForm'); }}
          onEditItem={(id) => { setSelectedItemId(id); setActiveModal('inventoryForm'); }}
          onDeleteItem={(id) => {
            const item = inventory.find(i => i.id === id);
            confirmDelete("Delete Inventory Item", `Delete ${item?.name} from inventory?`, () => handleDeleteInventoryItem(id));
          }}
          onRestock={(item) => { setSelectedItemForRestock(item); setActiveModal('restockForm'); }}
        />;
      case "patient-queue":
      case "doctor-queue":
        return <QueuePage {...commonProps} doctorName={state.user?.name || "Doctor"} queuedPatients={queuedPatients}
          onSelectPatient={(p) => {
            const bg = patients.find(bp => bp.phone === p.patientPhone);
            setSelectedPatientForDiagnose({ ...p, phone: p.patientPhone, patientHistory: bg ? { medicalHistory: bg.medicalHistory || [], allergies: bg.allergies || [], gender: bg.gender || "", dateOfBirth: bg.dateOfBirth || "", bloodGroup: bg.bloodGroup || "" } : undefined });
            setActiveModal('diagnoseForm');
          }}
          onUpdatePatientStatus={(id, s) => setQueuedPatients(prev => prev.map(p => p.id === id ? { ...p, status: s } : p))}
          onDirectConsultation={(name, phone, dId, dName, time) => {
            const ex = patients.find(p => p.name.toLowerCase() === name.toLowerCase().trim() && p.phone.replace(/\D/g, "") === phone.replace(/\D/g, ""));
            if (ex) {
              setSelectedPatientForDiagnose({ id: `WALK-${Date.now()}`, patientId: ex.id, patientName: ex.name, patientPhone: ex.phone, phone: ex.phone, treatmentType: ex.treatmentType || "General Consultation", patientConcern: "", status: "in-consultation", doctorId: dId || "1", doctorName: dName || "Dr. Rajesh Sharma", appointmentTime: time || new Date().toLocaleTimeString(), patientHistory: { medicalHistory: ex.medicalHistory || [], allergies: ex.allergies || [], gender: ex.gender || "", dateOfBirth: ex.dateOfBirth || "", bloodGroup: ex.bloodGroup || "" } });
              setActiveModal('diagnoseForm');
            }
          }}
          onRegisterNew={(name, phone) => { setPatientFormType("patient"); setSelectedPatientId(""); setPreFilledPatientData({ name, phone }); setActiveModal('patientForm'); }}
          doctors={activeDoctors} onUpdateConsultation={handleUpdateConsultation}
        />;
      case "billing": return <BillingPage invoices={invoices} onCreateInvoice={() => setActiveModal('invoiceForm')} onViewInvoice={setSelectedItemId} onDeleteInvoice={(id) => confirmDelete("Delete Invoice", `Delete invoice ${id}?`, () => handleDeleteInvoice(id))} onUpdateStatus={handleUpdateInvoiceStatus} />;
      case "treatments":
        return <TreatmentsPage treatments={treatments}
          onAddTreatment={() => { setSelectedItemId(""); setActiveModal('treatmentForm'); }}
          onViewTreatment={(id) => { setSelectedItemId(id); setActiveModal('treatmentViewer'); }}
          onEditTreatment={(id) => { setSelectedItemId(id); setActiveModal('treatmentForm'); }}
          onManageSessions={(id) => { setSelectedItemId(id); setActiveModal('sessionManager'); }}
          onMarkCompleted={(id) => { const t = treatments.find(x => x.id === id); if (t) { handleSaveTreatment({ ...t, status: "completed" }); showToast("Treatment completed!"); } }}
          onStartTreatment={(id) => { const t = treatments.find(x => x.id === id); if (t) { handleSaveTreatment({ ...t, status: "in-progress" }); showToast("Treatment started!"); } }}
        />;
      case "emr": return <MedicalRecordsPage patients={patients} treatments={treatments} invoices={invoices} appointments={appointments} emrRecords={emrRecords} onAddRecord={() => setActiveModal('emrForm')} onViewRecord={(r) => { setSelectedEMRRecord(r); setActiveModal('emrViewer'); }} onExportRecord={(r) => showToast("Record exported successfully!")} />;
      case "staff":
        return <StaffPage staffMembers={staffMembers} onAddDoctor={() => setActiveModal('doctorForm')}
          onEditDoctor={(id) => { setSelectedItemId(id); setActiveModal('doctorForm'); }}
          onDeleteDoctor={(id) => { const s = staffMembers.find(x => x.id === id); confirmDelete("Delete Staff", `Delete ${s?.name}?`, () => handleDeleteStaff(id)); }}
          onUpdateStaff={handleSaveStaff} onManageSchedule={(id) => { setSelectedItemId(id); setActiveModal('scheduleManager'); }}
          onPaySalary={(id, name) => { setSelectedStaffForSalary({ id, name }); setActiveModal('salaryModal'); }}
          onViewSalaryHistory={(id, name) => { setSelectedStaffForSalary({ id, name }); setActiveModal('salaryHistory'); }}
        />;
      case "profit-sharing": return <ProfitSharingPage treatments={treatments} doctorsWithSchedules={activeDoctors} />;
      case "consent":
        return <ConsentPage forms={consentForms} onAddForm={() => setActiveModal('consentForm')}
          onViewForm={(id) => { const f = consentForms.find(x => x.id === id); if (f) { setSelectedConsentForm(f); setActiveModal('consentViewer'); } }}
          onDeleteForm={(id) => confirmDelete("Delete Consent Form", "Delete this consent form?", () => handleDeleteConsentForm(id))}
        />;
      case "reports": return <ReportsPage patients={patients} appointments={appointments} treatments={treatments} invoices={invoices} />;
      case "corporate-plans": return <CorporatePlansPage plans={corporatePlans} employees={corporateEmployees} onSavePlan={handleSaveCorporatePlan} onDeletePlan={(id) => confirmDelete("Delete Corporate Plan", "Delete this plan?", () => handleDeleteCorporatePlan(id))} onTogglePlan={handleToggleCorporatePlan} onSaveEmployee={handleSaveEmployee} onDeleteEmployee={(id) => confirmDelete("Delete Employee", "Delete employee?", () => handleDeleteEmployee(id))} onBulkSaveEmployees={handleBulkSaveEmployees} onChangePlan={handleChangeEmployeePlan} />;
      default: return <DashboardPage appointments={appointments} onAddPatient={handleAddNewPatient} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header onShowTodaySchedule={() => setActiveModal('todaySchedule')} onQuickAppointment={() => { setSelectedAppointment(null); setActiveModal('appointmentForm'); }} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar pb-20 md:pb-6">
          <div className="w-full mx-auto px-2">{renderCurrentPage()}</div>
        </main>
      </div>
      <MobileNav currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* Modal Registry */}
      {activeModal === 'appointmentForm' && (
        <AppointmentForm onClose={() => setActiveModal(null)} isFollowUp={isFollowUpBooking} appointment={selectedAppointment} doctors={activeDoctors} doctorAvailability={doctorAvailability} appointments={appointments} patients={patients}
          onSave={(apt) => { handleSaveAppointment(apt); setActiveModal(null); setSelectedAppointment(null); setIsFollowUpBooking(false); if (activeModal === 'diagnoseForm') setBookedFollowUp({ date: apt.date, time: apt.time }); showToast("Appointment saved!"); }}
        />
      )}

      {activeModal === 'patientForm' && (
        <PatientForm onClose={() => { setActiveModal(null); setPreFilledPatientData(null); }} isCheckIn={!!pendingCheckInAppt} type={patientFormType} parentId={parentPatientId} corporateEmployees={corporateEmployees} corporatePlans={corporatePlans}
          patient={selectedPatientId ? patients.find(p => p.id === selectedPatientId) : preFilledPatientData}
          onSave={(p) => {
            handleSavePatient(p, patientFormType, parentPatientId);
            const hasCheckIn = !!pendingCheckInAppt;
            setActiveModal(null); setSelectedPatientId(""); setParentPatientId(""); setPreFilledPatientData(null);
            if (hasCheckIn) {
              setQueuedPatients(prev => [...prev, { id: pendingCheckInAppt.id, patientId: p.id, patientName: p.name, patientPhone: p.phone, appointmentTime: pendingCheckInAppt.time, status: "waiting", treatmentType: pendingCheckInAppt.treatment || pendingCheckInAppt.type, patientConcern: pendingCheckInAppt.patientConcern || "" }]);
              handleUpdateAppointmentStatus(pendingCheckInAppt.id, "checked-in");
              setPendingCheckInAppt(null);
              showToast("Patient checked-in successfully!");
            } else { showToast("Patient saved successfully!"); }
          }}
        />
      )}

      {activeModal === 'diagnoseForm' && selectedPatientForDiagnose && (
        <PatientConsultation patient={selectedPatientForDiagnose} doctors={activeDoctors} doctorAvailability={doctorAvailability} appointments={appointments} bookedFollowUp={bookedFollowUp} initialData={draftConsultations[selectedPatientForDiagnose.patientId || selectedPatientForDiagnose.id]}
          onDraftUpdate={(d) => handleDraftUpdate(selectedPatientForDiagnose.patientId || selectedPatientForDiagnose.id, d)}
          onScheduleFollowUp={(d) => { setSelectedAppointment(d); setActiveModal('appointmentForm'); setIsFollowUpBooking(true); }}
          onClose={() => { setActiveModal(null); setBookedFollowUp(null); }}
          onCompleteConsultation={(d) => {
            handleCompleteConsultation({ ...d, id: Date.now(), patientName: selectedPatientForDiagnose.patientName, completedAt: d.consultationDate || new Date().toISOString(), patientId: selectedPatientForDiagnose.patientId || selectedPatientForDiagnose.id, patientContact: selectedPatientForDiagnose.patientPhone });
            const target = patients.find(p => p.id === (selectedPatientForDiagnose.patientId || selectedPatientForDiagnose.id));
            if (target) {
              const meds = (d.prescriptions || []).filter((pr: any) => pr.medicine?.trim());
              if (meds.length) handleSavePatient({ ...target, prescriptionHistory: [{ id: Date.now().toString(), date: d.consultationDate || new Date().toISOString(), treatment: d.treatmentProcedure || d.diagnosis || "Consultation", observations: d.observations, diagnosis: d.diagnosis, vitals: { bp: d.bp || "", height: d.height || "", weight: d.weight || "", bmi: d.bmi || "" }, consultationNotes: d.consultationNotes, tests: d.tests, nextVisit: d.nextVisit, prescriptions: meds }, ...(target.prescriptionHistory || [])] });
            }
            setQueuedPatients(prev => prev.filter(p => p.id !== selectedPatientForDiagnose.id));
            const pId = selectedPatientForDiagnose.patientId || selectedPatientForDiagnose.id;
            setDraftConsultations(prev => { const n = { ...prev }; delete n[pId]; return n; });
          }}
          onCreateTreatment={handleSaveTreatment}
        />
      )}

      {activeModal === 'invoiceForm' && <InvoiceForm onClose={() => setActiveModal(null)} onSave={(inv) => { handleSaveInvoice(inv); setActiveModal(null); showToast("Invoice created!"); }} patients={patients} treatments={treatments} consultations={completedConsultations} corporatePlans={corporatePlans} />}
      {activeModal === 'treatmentForm' && <TreatmentForm onClose={() => { setActiveModal(null); setSelectedItemId(""); }} onSave={(t) => { handleSaveTreatment(t); setActiveModal(null); setSelectedItemId(""); showToast("Treatment saved!"); }} treatment={selectedItemId ? treatments.find(t => t.id === selectedItemId) : null} patients={patients} doctors={activeDoctors} treatments={treatments} />}
      {selectedItemId && invoices.find(i => i.id === selectedItemId) && <InvoiceViewer invoiceId={selectedItemId} onClose={() => setSelectedItemId("")} onUpdateStatus={handleUpdateInvoiceStatus} />}
      {activeModal === 'patientDetails' && (() => {
        const p = patients.find(x => x.id === selectedPatientId);
        if (!p) return null;
        
        // Find family members:
        // 1. If patient is a parent: get all children (where parentId === p.id)
        // 2. If patient is a child: get parent (id === p.parentId) AND siblings (parentId === p.parentId, excluding self)
        let family: any[] = [];
        if (p.parentId) {
          const parent = patients.find(x => x.id === p.parentId);
          const siblings = patients.filter(x => x.parentId === p.parentId && x.id !== p.id);
          if (parent) family.push({ ...parent, relation: parent.isPerson ? (parent.relation || 'Parent') : 'Head of Family' });
          family = [...family, ...siblings];
        } else {
          family = patients.filter(x => x.parentId === p.id);
        }

        return (
          <PatientDetails 
            patient={p} 
            familyMembers={family} 
            appointments={appointments} 
            treatments={treatments} 
            invoices={invoices} 
            onClose={() => setActiveModal(null)} 
            onSendReminder={(id, amt) => alert(`Reminder sent for ₹${amt}`)} 
            onExport={handleExportPatient} 
          />
        );
      })()}
      {activeModal === 'corporateModal' && <CorporateManagement corporatePlans={corporatePlans} corporateEmployees={corporateEmployees} onSavePlan={handleSaveCorporatePlan} onDeletePlan={handleDeleteCorporatePlan} onBulkAddPatients={(ps) => { handleBulkSavePatients(ps); showToast(`Registered ${ps.length} employees!`); }} onDeleteEmployee={handleDeleteCorporateEmployee} onUpdateEmployee={handleUpdateCorporateEmployee} onClose={() => setActiveModal(null)} />}
      {activeModal === 'treatmentViewer' && <TreatmentViewer treatment={treatments.find(t => t.id === selectedItemId)} onClose={() => setActiveModal(null)} onEditTreatment={(id) => { setActiveModal('treatmentForm'); setSelectedItemId(id); }} onMarkCompleted={(id) => { const t = treatments.find(x => x.id === id); if (t) { handleSaveTreatment({ ...t, status: "completed" }); showToast("Treatment completed!"); } }} onStartTreatment={(id) => { const t = treatments.find(x => x.id === id); if (t) { handleSaveTreatment({ ...t, status: "in-progress" }); showToast("Treatment started!"); } }} />}
      {activeModal === 'sessionManager' && <TreatmentSessionManager treatmentId={selectedItemId} patientName={treatments.find(t => t.id === selectedItemId)?.patientName || ""} procedure={treatments.find(t => t.id === selectedItemId)?.procedure || ""} sessions={treatments.find(t => t.id === selectedItemId)?.sessions || []} onUpdateSessions={(us) => { const t = treatments.find(x => x.id === selectedItemId); if (t) { handleSaveTreatment({ ...t, sessions: us }); showToast("Sessions updated!"); } }} onClose={() => { setActiveModal(null); setSelectedItemId(""); }} onScheduleAppointment={(sd) => { handleSaveAppointment({ ...sd, id: Date.now().toString(), status: "scheduled" }); showToast("Appointment scheduled!"); }} />}
      {activeModal === 'emrForm' && <EMRForm onClose={() => setActiveModal(null)} onSave={(r) => { handleSaveEMR(r); setActiveModal(null); showToast("EMR saved!"); }} patients={patients} />}
      {activeModal === 'emrViewer' && selectedEMRRecord && <EMRViewer record={selectedEMRRecord} onClose={() => { setActiveModal(null); setSelectedEMRRecord(null); }} />}
      {activeModal === 'todaySchedule' && <TodaySchedulePopup onClose={() => setActiveModal(null)} appointments={appointments} doctors={activeDoctors} doctorAvailability={doctorAvailability} patients={patients} onToggleDoctorAvailability={(id) => setDoctorAvailability(prev => ({ ...prev, [id]: !prev[id] }))} />}
      {activeModal === 'doctorForm' && <DoctorForm onClose={() => { setActiveModal(null); setSelectedItemId(""); }} onSave={(d) => { handleSaveStaff(d); setActiveModal(null); setSelectedItemId(""); showToast("Staff saved!"); }} doctor={selectedItemId ? staffMembers.find(s => s.id === selectedItemId) : null} />}
      {activeModal === 'scheduleManager' && <DoctorScheduleManager doctorId={selectedItemId} doctorName={staffMembers.find(s => s.id === selectedItemId)?.name || ""} onClose={() => { setActiveModal(null); setSelectedItemId(""); }} currentSchedule={staffMembers.find(s => s.id === selectedItemId)?.workingHours} onSave={(sd) => { const s = staffMembers.find(x => x.id === selectedItemId); if (s) handleSaveStaff({ ...s, workingHours: sd.workingHours, timeSlots: sd.timeSlots }); setActiveModal(null); setSelectedItemId(""); showToast("Schedule updated!"); }} />}
      {activeModal === 'salaryModal' && selectedStaffForSalary && <SalaryPaymentModal staffId={selectedStaffForSalary.id} staffName={selectedStaffForSalary.name} pendingAmount={parseFloat(staffMembers.find(s => s.id === selectedStaffForSalary.id)?.salaryPending?.replace(/,/g, "") || "0")} onClose={() => { setActiveModal(null); setSelectedStaffForSalary(null); }} onSave={(pd) => { const s = staffMembers.find(x => x.id === pd.staffId); if (s) { const paid = parseFloat(s.salaryPaid?.replace(/,/g, "") || "0"); const pending = parseFloat(s.salaryPending?.replace(/,/g, "") || "0"); const amt = parseFloat(pd.amount); handleSaveStaff({ ...s, salaryPaid: (paid + amt).toLocaleString("en-IN"), salaryPending: Math.max(0, pending - amt).toLocaleString("en-IN"), salaryHistory: [{ amount: amt, date: pd.date, mode: pd.mode, note: pd.note }, ...(s.salaryHistory || [])] }); } setActiveModal(null); setSelectedStaffForSalary(null); showToast("Salary paid!"); }} />}
      {activeModal === 'salaryHistory' && selectedStaffForSalary && <SalaryHistoryModal staffName={selectedStaffForSalary.name} history={staffMembers.find(s => s.id === selectedStaffForSalary.id)?.salaryHistory || []} onClose={() => { setActiveModal(null); setSelectedStaffForSalary(null); }} />}
      {activeModal === 'consentForm' && <ConsentForm onClose={() => setActiveModal(null)} onSave={(f) => { handleSaveConsentForm(f); setActiveModal(null); showToast("Consent generated!"); }} patients={patients} doctors={activeDoctors} />}
      {activeModal === 'consentViewer' && selectedConsentForm && <ConsentFormViewer form={selectedConsentForm} onClose={() => { setActiveModal(null); setSelectedConsentForm(null); }} />}
      {activeModal === 'inventoryForm' && <InventoryForm item={inventory.find(i => i.id === selectedItemId)} onClose={() => { setActiveModal(null); setSelectedItemId(""); }} onSave={(i) => { handleSaveInventoryItem(i); setActiveModal(null); setSelectedItemId(""); }} />}
      {activeModal === 'restockForm' && selectedItemForRestock && <RestockForm item={selectedItemForRestock} onClose={() => { setActiveModal(null); setSelectedItemForRestock(null); }} onSave={(ui) => { handleSaveInventoryItem(ui); setActiveModal(null); setSelectedItemForRestock(null); showToast(`${ui.name} restocked!`); }} />}

      {activeModal === 'patientNotFound' && (
        <Modal title="Patient Not Found" onClose={() => setActiveModal(null)} size="md" icon={<AlertTriangle className="w-6 h-6 text-amber-500" />}
          footer={
            <div className="flex flex-col gap-2 w-full">
              <Button onClick={() => { setPatientFormType("normal"); setSelectedPatientId(""); setPreFilledPatientData({ name: pendingCheckInAppt?.patientName || "", phone: pendingCheckInAppt?.patientPhone || pendingCheckInAppt?.phone || "" }); setActiveModal('patientForm'); }} className="w-full py-6">Register New Patient</Button>
              <Button variant="outline" onClick={() => setActiveModal(null)} className="w-full">Cancel</Button>
            </div>
          }
        >
          <p className="text-sm text-muted-foreground text-center px-4">
            No record found for <span className="font-bold text-foreground">{pendingCheckInAppt?.patientName}</span>. Please register the patient before checking in.
          </p>
        </Modal>
      )}

      {deleteConfig.show && (
        <ConfirmModal title={deleteConfig.title} message={deleteConfig.message} onConfirm={deleteConfig.onConfirm} onCancel={() => setDeleteConfig((prev: any) => ({ ...prev, show: false }))} confirmLabel="Delete" variant="danger" />
      )}

      {/* Optimized Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === "success" ? "bg-emerald-600 border-emerald-500" : "bg-red-600 border-red-500"} text-white`}>
            {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span className="font-black text-xs uppercase tracking-widest">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthenticatedApp() {
  const { state } = useAuth();
  return state.isAuthenticated ? <MainApp /> : <LoginForm />;
}

export default function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <AppProvider>
          <AuthenticatedApp />
        </AppProvider>
      </AuthProvider>
    </TenantProvider>
  );
}
