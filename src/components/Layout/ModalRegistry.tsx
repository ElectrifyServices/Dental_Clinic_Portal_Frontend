import { useMemo } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

import { useModal } from "../../contexts/ModalContext";
import { useAppData } from "../../hooks/useAppData";
import { exportPatientReport } from "../../utils/exportPatient";

import { AppointmentForm } from "../Appointments/AppointmentForm";
import { PatientForm } from "../Patients/PatientForm";
import { InvoiceForm } from "../Billing/InvoiceForm";
import { CorporateManagement } from "../Patients/CorporateManagement";
import { InvoiceViewer } from "../Billing/InvoiceViewer";
import { TreatmentForm } from "../Treatments/TreatmentForm";
import { DoctorForm } from "../Staff/DoctorForm";
import { PatientConsultation } from "../Doctor/PatientConsultation";
import { PatientDetails } from "../Patients/PatientDetails";
import { TodaySchedulePopup } from "../Appointments/TodaySchedulePopup";
import { DoctorScheduleManager } from "../Staff/DoctorScheduleManager";
import { SalaryPaymentModal } from "../Staff/SalaryPaymentModal";
import { SalaryHistoryModal } from "../Staff/SalaryHistoryModal";
import { TreatmentViewer } from "../Treatments/TreatmentViewer";
import { TreatmentSessionManager } from "../Treatments/TreatmentSessionManager";
import { EMRForm } from "../EMR/EMRForm";
import { EMRViewer } from "../EMR/EMRViewer";
import { ConsentForm } from "../Consent/ConsentForm";
import { ConsentFormViewer } from "../Consent/ConsentFormViewer";
import { InventoryForm } from "../Inventory/InventoryForm";
import { RestockForm } from "../Inventory/RestockForm";
import { ConfirmModal, Modal, Button } from "../ui";

export function ModalRegistry() {
  const {
    activeModal,
    setActiveModal,
    selectedAppointment,
    setSelectedAppointment,
    selectedPatientId,
    setSelectedPatientId,
    selectedItemId,
    setSelectedItemId,
    selectedEMRRecord,
    setSelectedEMRRecord,
    selectedConsentForm,
    setSelectedConsentForm,
    selectedStaffForSalary,
    setSelectedStaffForSalary,
    selectedPatientForDiagnose,
    selectedItemForRestock,
    setSelectedItemForRestock,
    preFilledPatientData,
    setPreFilledPatientData,
    patientFormType,
    setPatientFormType,
    parentPatientId,
    setParentPatientId,
    pendingCheckInAppt,
    setPendingCheckInAppt,
    isFollowUpBooking,
    setIsFollowUpBooking,
    bookedFollowUp,
    setBookedFollowUp,
    draftConsultations,
    setDraftConsultations,
    handleDraftUpdate,
    doctorAvailability,
    setDoctorAvailability,
    toast,
    showToast,
    deleteConfig,
    setDeleteConfig,
  } = useModal();

  const {
    patients,
    appointments,
    invoices,
    treatments,
    completedConsultations,
    staffMembers,
    inventory,
    corporatePlans,
    corporateEmployees,
    setQueuedPatients,
    handleSaveAppointment,
    handleSavePatient,
    handleSaveInvoice,
    handleSaveTreatment,
    handleSaveStaff,
    handleSaveEMR,
    handleSaveConsentForm,
    handleSaveInventoryItem,
    handleUpdateAppointmentStatus,
    handleUpdateInvoiceStatus,
    handleCompleteConsultation,
    handleSaveCorporatePlan,
    handleDeleteCorporatePlan,
    handleBulkSavePatients,
    handleDeleteCorporateEmployee,
    handleUpdateCorporateEmployee,
  } = useAppData();

  const activeDoctors = useMemo(
    () =>
      staffMembers.filter(
        (s: any) => s.role === "doctor" || s.role === "admin",
      ),
    [staffMembers],
  );

  const handleExportPatient = (id: string) =>
    exportPatientReport(id, patients, appointments, treatments, invoices);

  return (
    <>
      {activeModal === "appointmentForm" && (
        <AppointmentForm
          onClose={() => setActiveModal(null)}
          isFollowUp={isFollowUpBooking}
          appointment={selectedAppointment}
          doctors={activeDoctors}
          doctorAvailability={doctorAvailability}
          appointments={appointments}
          patients={patients}
          onSave={(apt: any) => {
            handleSaveAppointment(apt);
            setActiveModal(null);
            setSelectedAppointment(null);
            setIsFollowUpBooking(false);
            showToast("Appointment saved!");
          }}
        />
      )}

      {activeModal === "patientForm" && (
        <PatientForm
          onClose={() => {
            setActiveModal(null);
            setPreFilledPatientData(null);
          }}
          isCheckIn={!!pendingCheckInAppt}
          type={patientFormType}
          parentId={parentPatientId}
          corporateEmployees={corporateEmployees}
          corporatePlans={corporatePlans}
          patient={
            selectedPatientId
              ? patients.find((p: any) => p.id === selectedPatientId)
              : preFilledPatientData
          }
          onSave={(p: any) => {
            handleSavePatient(p, patientFormType, parentPatientId);
            const hasCheckIn = !!pendingCheckInAppt;
            setActiveModal(null);
            setSelectedPatientId("");
            setParentPatientId("");
            setPreFilledPatientData(null);
            if (hasCheckIn) {
              setQueuedPatients((prev: any[]) => [
                ...prev,
                {
                  id: pendingCheckInAppt.id,
                  patientId: p.id,
                  patientName: p.name,
                  patientPhone: p.phone,
                  appointmentTime: pendingCheckInAppt.time,
                  status: "waiting",
                  treatmentType:
                    pendingCheckInAppt.treatment || pendingCheckInAppt.type,
                  patientConcern: pendingCheckInAppt.patientConcern || "",
                },
              ]);
              handleUpdateAppointmentStatus(
                pendingCheckInAppt.id,
                "checked-in",
              );
              setPendingCheckInAppt(null);
              showToast("Patient checked-in successfully!");
            } else {
              showToast("Patient saved successfully!");
            }
          }}
        />
      )}

      {activeModal === "diagnoseForm" && selectedPatientForDiagnose && (
        <PatientConsultation
          patient={selectedPatientForDiagnose}
          doctors={activeDoctors}
          doctorAvailability={doctorAvailability}
          appointments={appointments}
          bookedFollowUp={bookedFollowUp}
          initialData={
            draftConsultations[
              selectedPatientForDiagnose.patientId ||
                selectedPatientForDiagnose.id
            ]
          }
          onDraftUpdate={(d: any) =>
            handleDraftUpdate(
              selectedPatientForDiagnose.patientId ||
                selectedPatientForDiagnose.id,
              d,
            )
          }
          onScheduleFollowUp={(d: any) => {
            setSelectedAppointment(d);
            setActiveModal("appointmentForm");
            setIsFollowUpBooking(true);
          }}
          onClose={() => {
            setActiveModal(null);
            setBookedFollowUp(null);
          }}
          onCompleteConsultation={(d: any) => {
            handleCompleteConsultation({
              ...d,
              id: Date.now(),
              patientName: selectedPatientForDiagnose.patientName,
              completedAt: d.consultationDate || new Date().toISOString(),
              patientId:
                selectedPatientForDiagnose.patientId ||
                selectedPatientForDiagnose.id,
              patientContact: selectedPatientForDiagnose.patientPhone,
            });
            const target = patients.find(
              (p: any) =>
                p.id ===
                (selectedPatientForDiagnose.patientId ||
                  selectedPatientForDiagnose.id),
            );
            if (target) {
              const meds = (d.prescriptions || []).filter((pr: any) =>
                pr.medicine?.trim(),
              );
              if (meds.length) {
                handleSavePatient({
                  ...target,
                  prescriptionHistory: [
                    {
                      id: Date.now().toString(),
                      date: d.consultationDate || new Date().toISOString(),
                      treatment:
                        d.treatmentProcedure || d.diagnosis || "Consultation",
                      observations: d.observations,
                      diagnosis: d.diagnosis,
                      vitals: {
                        bp: d.bp || "",
                        height: d.height || "",
                        weight: d.weight || "",
                        bmi: d.bmi || "",
                      },
                      consultationNotes: d.consultationNotes,
                      tests: d.tests,
                      nextVisit: d.nextVisit,
                      prescriptions: meds,
                    },
                    ...(target.prescriptionHistory || []),
                  ],
                });
              }
            }
            setQueuedPatients((prev: any[]) =>
              prev.filter((p: any) => p.id !== selectedPatientForDiagnose.id),
            );
            const pId =
              selectedPatientForDiagnose.patientId ||
              selectedPatientForDiagnose.id;
            setDraftConsultations((prev: Record<string, any>) => {
              const n = { ...prev };
              delete n[pId];
              return n;
            });
          }}
          onCreateTreatment={handleSaveTreatment}
        />
      )}

      {activeModal === "invoiceForm" && (
        <InvoiceForm
          onClose={() => setActiveModal(null)}
          onSave={(inv: any) => {
            handleSaveInvoice(inv);
            setActiveModal(null);
            showToast("Invoice created!");
          }}
          patients={patients}
          treatments={treatments}
          consultations={completedConsultations}
          corporatePlans={corporatePlans}
        />
      )}

      {activeModal === "treatmentForm" && (
        <TreatmentForm
          onClose={() => {
            setActiveModal(null);
            setSelectedItemId("");
          }}
          onSave={(t: any) => {
            handleSaveTreatment(t);
            setActiveModal(null);
            setSelectedItemId("");
            showToast("Treatment saved!");
          }}
          treatment={
            selectedItemId
              ? treatments.find((t: any) => t.id === selectedItemId)
              : null
          }
          patients={patients}
          doctors={activeDoctors}
          treatments={treatments}
        />
      )}

      {selectedItemId && invoices.find((i: any) => i.id === selectedItemId) && (
        <InvoiceViewer
          invoiceId={selectedItemId}
          onClose={() => setSelectedItemId("")}
          onUpdateStatus={handleUpdateInvoiceStatus}
        />
      )}

      {activeModal === "patientDetails" &&
        (() => {
          const p = patients.find((x: any) => x.id === selectedPatientId);
          if (!p) return null;
          let family: any[] = [];
          if (p.parentId) {
            const parent = patients.find((x: any) => x.id === p.parentId);
            const siblings = patients.filter(
              (x: any) => x.parentId === p.parentId && x.id !== p.id,
            );
            if (parent)
              family.push({
                ...parent,
                relation: parent.isPerson
                  ? parent.relation || "Parent"
                  : "Head of Family",
              });
            family = [...family, ...siblings];
          } else {
            family = patients.filter((x: any) => x.parentId === p.id);
          }
          return (
            <PatientDetails
              patient={p}
              familyMembers={family}
              appointments={appointments}
              treatments={treatments}
              invoices={invoices}
              onClose={() => setActiveModal(null)}
              onSendReminder={(_id: string, amt: number) =>
                alert(`Reminder sent for ₹${amt}`)
              }
              onExport={handleExportPatient}
            />
          );
        })()}

      {activeModal === "corporateModal" && (
        <CorporateManagement
          corporatePlans={corporatePlans}
          corporateEmployees={corporateEmployees}
          onSavePlan={handleSaveCorporatePlan}
          onDeletePlan={handleDeleteCorporatePlan}
          onBulkAddPatients={(ps: any[]) => {
            handleBulkSavePatients(ps);
            showToast(`Registered ${ps.length} employees!`);
          }}
          onDeleteEmployee={handleDeleteCorporateEmployee}
          onUpdateEmployee={handleUpdateCorporateEmployee}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "treatmentViewer" && (
        <TreatmentViewer
          treatment={treatments.find((t: any) => t.id === selectedItemId)}
          onClose={() => setActiveModal(null)}
          onEditTreatment={(id: string) => {
            setActiveModal("treatmentForm");
            setSelectedItemId(id);
          }}
          onMarkCompleted={(id: string) => {
            const t = treatments.find((x: any) => x.id === id);
            if (t) {
              handleSaveTreatment({ ...t, status: "completed" });
              showToast("Treatment completed!");
            }
          }}
          onStartTreatment={(id: string) => {
            const t = treatments.find((x: any) => x.id === id);
            if (t) {
              handleSaveTreatment({ ...t, status: "in-progress" });
              showToast("Treatment started!");
            }
          }}
        />
      )}

      {activeModal === "sessionManager" && (
        <TreatmentSessionManager
          treatmentId={selectedItemId}
          patientName={
            treatments.find((t: any) => t.id === selectedItemId)?.patientName ||
            ""
          }
          procedure={
            treatments.find((t: any) => t.id === selectedItemId)?.procedure ||
            ""
          }
          sessions={
            treatments.find((t: any) => t.id === selectedItemId)?.sessions || []
          }
          onUpdateSessions={(us: any) => {
            const t = treatments.find((x: any) => x.id === selectedItemId);
            if (t) {
              handleSaveTreatment({ ...t, sessions: us });
              showToast("Sessions updated!");
            }
          }}
          onClose={() => {
            setActiveModal(null);
            setSelectedItemId("");
          }}
          onScheduleAppointment={(sd: any) => {
            handleSaveAppointment({
              ...sd,
              id: Date.now().toString(),
              status: "scheduled",
            });
            showToast("Appointment scheduled!");
          }}
        />
      )}

      {activeModal === "emrForm" && (
        <EMRForm
          onClose={() => setActiveModal(null)}
          onSave={(r: any) => {
            handleSaveEMR(r);
            setActiveModal(null);
            showToast("EMR saved!");
          }}
          patients={patients}
        />
      )}

      {activeModal === "emrViewer" && selectedEMRRecord && (
        <EMRViewer
          record={selectedEMRRecord}
          onClose={() => {
            setActiveModal(null);
            setSelectedEMRRecord(null);
          }}
        />
      )}

      {activeModal === "todaySchedule" && (
        <TodaySchedulePopup
          onClose={() => setActiveModal(null)}
          appointments={appointments}
          doctors={activeDoctors}
          doctorAvailability={doctorAvailability}
          onToggleDoctorAvailability={(id: string) =>
            setDoctorAvailability((prev: Record<string, boolean>) => ({
              ...prev,
              [id]: !prev[id],
            }))
          }
        />
      )}

      {activeModal === "doctorForm" && (
        <DoctorForm
          onClose={() => {
            setActiveModal(null);
            setSelectedItemId("");
          }}
          onSave={(d: any) => {
            handleSaveStaff(d);
            setActiveModal(null);
            setSelectedItemId("");
            showToast("Staff saved!");
          }}
          doctor={
            selectedItemId
              ? staffMembers.find((s: any) => s.id === selectedItemId)
              : null
          }
        />
      )}

      {activeModal === "scheduleManager" && (
        <DoctorScheduleManager
          doctorId={selectedItemId}
          doctorName={
            staffMembers.find((s: any) => s.id === selectedItemId)?.name || ""
          }
          onClose={() => {
            setActiveModal(null);
            setSelectedItemId("");
          }}
          currentSchedule={
            staffMembers.find((s: any) => s.id === selectedItemId)?.workingHours
          }
          onSave={(sd: any) => {
            const s = staffMembers.find((x: any) => x.id === selectedItemId);
            if (s)
              handleSaveStaff({
                ...s,
                workingHours: sd.workingHours,
                timeSlots: sd.timeSlots,
              });
            setActiveModal(null);
            setSelectedItemId("");
            showToast("Schedule updated!");
          }}
        />
      )}

      {activeModal === "salaryModal" && selectedStaffForSalary && (
        <SalaryPaymentModal
          staffId={selectedStaffForSalary.id}
          staffName={selectedStaffForSalary.name}
          pendingAmount={parseFloat(
            staffMembers
              .find((s: any) => s.id === selectedStaffForSalary.id)
              ?.salaryPending?.replace(/,/g, "") || "0",
          )}
          onClose={() => {
            setActiveModal(null);
            setSelectedStaffForSalary(null);
          }}
          onSave={(pd: any) => {
            const s = staffMembers.find((x: any) => x.id === pd.staffId);
            if (s) {
              const paid = parseFloat(s.salaryPaid?.replace(/,/g, "") || "0");
              const pending = parseFloat(
                s.salaryPending?.replace(/,/g, "") || "0",
              );
              const amt = parseFloat(pd.amount);
              handleSaveStaff({
                ...s,
                salaryPaid: (paid + amt).toLocaleString("en-IN"),
                salaryPending: Math.max(0, pending - amt).toLocaleString(
                  "en-IN",
                ),
                salaryHistory: [
                  { amount: amt, date: pd.date, mode: pd.mode, note: pd.note },
                  ...(s.salaryHistory || []),
                ],
              });
            }
            setActiveModal(null);
            setSelectedStaffForSalary(null);
            showToast("Salary paid!");
          }}
        />
      )}

      {activeModal === "salaryHistory" && selectedStaffForSalary && (
        <SalaryHistoryModal
          staffName={selectedStaffForSalary.name}
          history={
            staffMembers.find((s: any) => s.id === selectedStaffForSalary.id)
              ?.salaryHistory || []
          }
          onClose={() => {
            setActiveModal(null);
            setSelectedStaffForSalary(null);
          }}
        />
      )}

      {activeModal === "consentForm" && (
        <ConsentForm
          onClose={() => setActiveModal(null)}
          onSave={(f: any) => {
            handleSaveConsentForm(f);
            setActiveModal(null);
            showToast("Consent generated!");
          }}
          patients={patients}
          doctors={activeDoctors}
        />
      )}

      {activeModal === "consentViewer" && selectedConsentForm && (
        <ConsentFormViewer
          form={selectedConsentForm}
          onClose={() => {
            setActiveModal(null);
            setSelectedConsentForm(null);
          }}
        />
      )}

      {activeModal === "inventoryForm" && (
        <InventoryForm
          item={inventory.find((i: any) => i.id === selectedItemId)}
          onClose={() => {
            setActiveModal(null);
            setSelectedItemId("");
          }}
          onSave={(i: any) => {
            handleSaveInventoryItem(i);
            setActiveModal(null);
            setSelectedItemId("");
          }}
        />
      )}

      {activeModal === "restockForm" && selectedItemForRestock && (
        <RestockForm
          item={selectedItemForRestock}
          onClose={() => {
            setActiveModal(null);
            setSelectedItemForRestock(null);
          }}
          onSave={(ui: any) => {
            handleSaveInventoryItem(ui);
            setActiveModal(null);
            setSelectedItemForRestock(null);
            showToast(`${ui.name} restocked!`);
          }}
        />
      )}

      {activeModal === "patientNotFound" && (
        <Modal
          title="Patient Not Found"
          onClose={() => setActiveModal(null)}
          size="md"
          icon={<AlertTriangle className="w-6 h-6 text-amber-500" />}
          footer={
            <div className="flex flex-col gap-2 w-full">
              <Button
                onClick={() => {
                  setPatientFormType("normal");
                  setSelectedPatientId("");
                  setPreFilledPatientData({
                    name: pendingCheckInAppt?.patientName || "",
                    phone:
                      pendingCheckInAppt?.patientPhone ||
                      pendingCheckInAppt?.phone ||
                      "",
                  });
                  setActiveModal("patientForm");
                }}
                className="w-full py-6"
              >
                Register New Patient
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveModal(null)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          }
        >
          <p className="text-sm text-muted-foreground text-center px-4">
            No record found for{" "}
            <span className="font-bold text-foreground">
              {pendingCheckInAppt?.patientName}
            </span>
            . Please register the patient before checking in.
          </p>
        </Modal>
      )}

      {deleteConfig.show && (
        <ConfirmModal
          title={deleteConfig.title}
          message={deleteConfig.message}
          onConfirm={deleteConfig.onConfirm}
          onCancel={() =>
            setDeleteConfig((prev: any) => ({ ...prev, show: false }))
          }
          confirmLabel="Delete"
          variant="danger"
        />
      )}

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4">
          <div
            className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === "success"
                ? "bg-emerald-600 border-emerald-500"
                : "bg-destructive border-destructive"
            } text-white`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span className="font-black text-xs uppercase tracking-widest">
              {toast.message}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
