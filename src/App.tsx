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
import { MedicalRecordsPage } from "./pages/MedicalRecordsPage";

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
import { DoctorScheduleManager } from "./components/Staff/DoctorScheduleManager";
import { SalaryPaymentModal } from "./components/Staff/SalaryPaymentModal";
import { SalaryHistoryModal } from "./components/Staff/SalaryHistoryModal";
import { TreatmentViewer } from "./components/Treatments/TreatmentViewer";
import { TreatmentSessionManager } from "./components/Treatments/TreatmentSessionManager";
import { EMRForm } from "./components/EMR/EMRForm";
import { EMRViewer } from "./components/EMR/EMRViewer";

// Icons & Utils
import {
  X,
  Calendar as CalendarIcon,
  Users,
  Plus,
  AlertTriangle,
  CheckCircle,
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
    staffMembers,
    handleSaveStaff,
    handleDeleteStaff,
    emrRecords,
    handleSaveEMR,
    handleDeleteEMR,
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
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTreatmentViewer, setShowTreatmentViewer] = useState(false);
  const [showTreatmentSessionManager, setShowTreatmentSessionManager] =
    useState(false);
  const [showEMRForm, setShowEMRForm] = useState(false);
  const [showEMRViewer, setShowEMRViewer] = useState(false);
  const [selectedEMRId, setSelectedEMRId] = useState("");
  const [selectedEMRRecord, setSelectedEMRRecord] = useState<any>(null);
  const [selectedStaffForSalary, setSelectedStaffForSalary] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showPatientNotFound, setShowPatientNotFound] = useState(false);
  const [pendingCheckInAppt, setPendingCheckInAppt] = useState<any>(null);

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

  // Handlers
  const handleAddNewPatient = () => {
    setSelectedPatientId("");
    setPreFilledPatientData(null);
    setShowPatientForm(true);
  };

  const handleExportPatient = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;

    const patientAppointments = appointments.filter(
      (a) => a.patientId === patient.id || a.patientPhone === patient.phone,
    );
    const patientTreatments = treatments.filter(
      (t) => t.patientId === patient.id,
    );
    const patientInvoices = invoices.filter(
      (inv) => inv.patientId === patient.id,
    );
    const prescriptions = patient.prescriptionHistory || [];

    const printContent = `
      <html>
        <head>
          <title>Patient Full Report - ${patient.name}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #333;
              line-height: 1.4;
              margin: 0;
              padding: 0;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 { color: #1e40af; margin: 0; font-size: 28px; }
            .header p { margin: 5px 0; color: #666; font-size: 14px; }
            
            .section { margin-bottom: 25px; }
            .section-title {
              font-size: 16px;
              font-bold: bold;
              color: #1e40af;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
              margin-bottom: 15px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
            .info-item { margin-bottom: 10px; }
            .info-label { font-size: 12px; color: #666; font-weight: 600; }
            .info-value { font-size: 14px; color: #111; font-weight: 500; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { text-align: left; background: #f8fafc; padding: 10px; font-size: 12px; font-weight: 600; border-bottom: 1px solid #e2e8f0; color: #475569; }
            td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            
            .alert-box {
              background: #fff7ed;
              border: 1px solid #ffedd5;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .alert-title { color: #9a3412; font-weight: bold; font-size: 14px; margin-bottom: 5px; }
            .alert-text { color: #c2410c; font-size: 13px; }

            .footer-sig {
              margin-top: 60px;
              display: flex;
              justify-content: flex-end;
              padding-right: 50px;
            }
            .sig-container { text-align: center; }
            .sig-line { border-top: 1px solid #333; width: 200px; margin-bottom: 8px; }
            .sig-name { font-weight: bold; font-size: 15px; color: #111; }
            .sig-title { font-size: 12px; color: #666; }

            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 100px;
              color: rgba(226, 232, 240, 0.4);
              z-index: -1;
              pointer-events: none;
              white-space: nowrap;
            }
          </style>
        </head>
        <body>
          <div class="watermark">DENTALCARE PRO</div>
          
          <div class="header">
            <h1>🦷 DentalCare Pro</h1>
            <p>Advanced Multispeciality Dental Clinic & Implant Centre</p>
            <p>#102, C Block, South Extension, New Delhi | Ph: 9204972991</p>
          </div>

          <div class="section">
            <div class="section-title">Personal Information</div>
            <div class="grid">
              <div class="info-item">
                <div class="info-label">Patient Name</div>
                <div class="info-value">${patient.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Patient ID</div>
                <div class="info-value">${patient.id}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone Number</div>
                <div class="info-value">${patient.phone}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email Address</div>
                <div class="info-value">${patient.email || "N/A"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Date of Birth</div>
                <div class="info-value">${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "N/A"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Gender</div>
                <div class="info-value">${patient.gender || "N/A"}</div>
              </div>
              <div class="info-item" style="grid-column: span 2;">
                <div class="info-label">Residential Address</div>
                <div class="info-value">${patient.address || "N/A"}</div>
              </div>
            </div>
          </div>

          ${
            patient.medicalHistory?.length > 0 || patient.allergies?.length > 0
              ? `
            <div class="section">
              <div class="section-title">Medical Alerts</div>
              <div class="alert-box">
                ${
                  patient.allergies?.length > 0
                    ? `
                  <div class="alert-title">ALLERGIES</div>
                  <div class="alert-text">${patient.allergies.join(", ")}</div>
                  <div style="margin-bottom: 10px;"></div>
                `
                    : ""
                }
                ${
                  patient.medicalHistory?.length > 0
                    ? `
                  <div class="alert-title">MEDICAL CONDITIONS</div>
                  <div class="alert-text">${patient.medicalHistory.join(", ")}</div>
                `
                    : ""
                }
              </div>
            </div>
          `
              : ""
          }

          ${
            patientAppointments.length > 0
              ? `
            <div class="section">
              <div class="section-title">Appointment History</div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Treatment / Purpose</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${patientAppointments
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                    )
                    .map(
                      (a) => `
                    <tr>
                      <td>${new Date(a.date).toLocaleDateString()}</td>
                      <td>${a.time}</td>
                      <td>${a.treatment || a.type || "General Consultation"}</td>
                      <td>${a.status.toUpperCase()}</td>
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

          ${
            patientTreatments.length > 0
              ? `
            <div class="section">
              <div class="section-title">Treatment History</div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Treatment Name</th>
                    <th>Notes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${patientTreatments
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                    )
                    .map(
                      (t) => `
                    <tr>
                      <td>${new Date(t.date).toLocaleDateString()}</td>
                      <td>${t.name || t.treatmentName || "N/A"}</td>
                      <td>${t.notes || "—"}</td>
                      <td>${(t.status || "completed").toUpperCase()}</td>
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

          ${
            prescriptions.length > 0
              ? `
            <div class="section">
              <div class="section-title">Prescription History</div>
              ${prescriptions
                .map(
                  (p) => `
                <div style="margin-bottom: 15px; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: bold; font-size: 13px;">${p.treatment}</span>
                    <span style="color: #666; font-size: 12px;">${new Date(p.date).toLocaleDateString()}</span>
                  </div>
                  <table style="margin-top: 0;">
                    <thead>
                      <tr>
                        <th style="padding: 5px 10px;">Medicine</th>
                        <th style="padding: 5px 10px;">Dosage</th>
                        <th style="padding: 5px 10px;">Frequency</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${p.prescriptions
                        .map(
                          (m: any) => `
                        <tr>
                          <td style="padding: 5px 10px;">${m.medicine}</td>
                          <td style="padding: 5px 10px;">${m.dosage}</td>
                          <td style="padding: 5px 10px;">${m.frequency}</td>
                        </tr>
                      `,
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `,
                )
                .join("")}
            </div>
          `
              : ""
          }

          ${
            patientInvoices.length > 0
              ? `
            <div class="section">
              <div class="section-title">Billing Summary</div>
              <table>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${patientInvoices
                    .map(
                      (inv) => `
                    <tr>
                      <td>${inv.id}</td>
                      <td>${new Date(inv.date).toLocaleDateString()}</td>
                      <td>₹${inv.totalAmount.toLocaleString()}</td>
                      <td style="color: ${inv.status === "paid" ? "#16a34a" : "#dc2626"}">${inv.status.toUpperCase()}</td>
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

          <div class="footer-sig">
            <div class="sig-container">
              <div class="sig-line"></div>
              <div class="sig-name">Dr. Rajesh Sharma</div>
              <div class="sig-title">BDS, MDS (Oral Surgery)</div>
              <div class="sig-title">Reg No: 12345/A</div>
            </div>
          </div>

          <div style="position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 10px; color: #999;">
            This is a computer-generated medical report. Generated on ${new Date().toLocaleString()}
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

  const handleCheckInPatient = (appointment: any) => {
    console.log(
      "Check-in attempt for:",
      appointment.patientName,
      "Phone:",
      appointment.patientPhone || appointment.phone,
    );
    const searchName = (appointment.patientName || appointment.patient || "")
      .toLowerCase()
      .trim();
    const searchPhone = (
      appointment.patientPhone ||
      appointment.phone ||
      ""
    ).trim();

    const existingPatient = patients.find((p) => {
      const pName = (p.name || "").toLowerCase().trim();
      const pPhone = (p.phone || "").trim();
      return pPhone === searchPhone && pName === searchName;
    });

    if (!existingPatient) {
      console.log(
        "No matching patient found for name:",
        searchName,
        "and phone:",
        searchPhone,
      );
      setPendingCheckInAppt(appointment);
      setShowPatientNotFound(true);
      return;
    }

    console.log("Matched existing patient:", existingPatient.name);

    const queuedPatient = {
      id: appointment.id,
      patientId: existingPatient.id,
      patientName: existingPatient.name, // Use the name from the database
      patientPhone: existingPatient.phone, // Use the phone from the database
      appointmentTime: appointment.time,
      status: "waiting",
      treatmentType: appointment.treatment || appointment.type,
    };
    setQueuedPatients((prev) => [...prev, queuedPatient]);
    handleUpdateAppointmentStatus(appointment.id, "checked-in");
    alert(`Patient "${existingPatient.name}" checked in successfully.`);
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
            handleExportPatient={handleExportPatient}
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
                  status: "in-consultation",
                  doctorId: doctorId || "1",
                  doctorName: doctorName || "Dr. Rajesh Sharma",
                  appointmentTime: time || new Date().toLocaleTimeString(),
                  patientHistory: {
                    medicalHistory: existingPatient.medicalHistory || [],
                    allergies: existingPatient.allergies || [],
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
            doctors={doctorsWithSchedules}
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
            onDeleteDoctor={(id) => handleDeleteStaff(id)}
            onUpdateStaff={(staff) => handleSaveStaff(staff)}
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
            doctorsWithSchedules={doctorsWithSchedules}
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
          onClose={() => {
            setShowPatientForm(false);
            setPreFilledPatientData(null);
          }}
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
              };
              setQueuedPatients((prev) => [...prev, queuedPatient]);
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

      {showTreatmentViewer && selectedItemId && (
        <TreatmentViewer
          treatment={treatments.find((t) => t.id === selectedItemId)}
          onClose={() => {
            setShowTreatmentViewer(false);
            setSelectedItemId("");
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
          doctors={doctorsWithSchedules}
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
            className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === "success"
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
