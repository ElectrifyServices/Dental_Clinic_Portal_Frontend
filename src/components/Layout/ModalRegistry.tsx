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
import { PatientDetailsModal } from "./PatientDetailsModal";
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
import { usePatientDetailQuery } from "../../hooks/patients/usePatientDetailQuery";
import { useCreateAppointmentMutation } from "../../hooks/appointments/useCreateAppointmentMutation";
import { useUpdateAppointmentMutation } from "../../hooks/appointments/useUpdateAppointmentMutation";
import { useCheckInAfterRegistrationMutation } from "../../hooks/appointments/useCheckInAfterRegistrationMutation";

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
    confirmConfig,
    setConfirmConfig,
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

  const { data: apiPatientDetail } = usePatientDetailQuery(
    selectedPatientId,
    activeModal === "patientDetails" || activeModal === "patientForm"
  );

  const handleExportPatient = (id: string) =>
    exportPatientReport(id, patients, appointments, treatments, invoices);

  const { mutateAsync: createAppointmentMutation } = useCreateAppointmentMutation();
  const { mutateAsync: updateAppointmentMutation } = useUpdateAppointmentMutation();
  const { mutateAsync: checkInAfterRegistration } = useCheckInAfterRegistrationMutation();

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
          onSave={async (apt: any) => {
            try {
              const payload = {
                doctor_id: apt.doctorId,
                patient_name: apt.patientName,
                patient_phone: apt.patientPhone,
                date: apt.date,
                start_time: apt.time,
                specific_treatment: apt.treatment || "General",
                treatment_type: apt.treatmentType || "",
                slot_duration_mins: Number(apt.duration) || 15,
                treatment_cost: Number(apt.fee) || 0,
                concern: apt.patientConcern || "",
                notes: apt.notes || "",
                status: apt.status || "BOOKED"
              };

              if (!apt.id || apt.id.length > 20 === false) { // Assuming new if ID is a timestamp
                // Only attach patient_id if it's a valid uuid (length > 20)
                if (apt.patientId && apt.patientId.length > 20) {
                  (payload as any).patient_id = apt.patientId;
                }

                const response = await createAppointmentMutation(payload);
                // Optionally update apt ID from response
                apt.id = response.id || apt.id;
              } else {
                // Call edit/update API via PUT request
                await updateAppointmentMutation({
                  id: apt.id,
                  payload: payload
                });
              }

              handleSaveAppointment(apt);
              setActiveModal(null);
              setSelectedAppointment(null);
              setIsFollowUpBooking(false);
              showToast("Appointment saved!");
            } catch (error: any) {
              const msg = error?.response?.data?.message || error?.message || "Failed to save appointment";
              showToast(Array.isArray(msg) ? msg.join(', ') : msg, "error");
            }
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
              ? apiPatientDetail || patients.find((p: any) => p.id === selectedPatientId)
              : preFilledPatientData
          }
          onSave={async (p: any) => {
            try {
              await handleSavePatient(p, patientFormType, parentPatientId);
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
                
                try {
                  await checkInAfterRegistration({
                    id: pendingCheckInAppt.id,
                    patient_id: p.id
                  });
                } catch (err) {
                  console.error("Failed to check-in after registration:", err);
                }

                handleUpdateAppointmentStatus(
                  pendingCheckInAppt.id,
                  "checked-in",
                );
                setPendingCheckInAppt(null);
                showToast("Patient checked-in successfully!");
              } else {
                showToast("Patient saved successfully!");
              }
            } catch (err: any) {
              const errorObj = err?.response?.data || err;
              const errorMessage = errorObj.message || err?.message || "Failed to save patient";
              const msg = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
              showToast(msg, "error");
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

      {activeModal === "patientDetails" && (
        <PatientDetailsModal
          patients={patients}
          selectedPatientId={selectedPatientId}
          apiPatientDetail={apiPatientDetail}
          appointments={appointments}
          treatments={treatments}
          invoices={invoices}
          onClose={() => setActiveModal(null)}
          onExport={handleExportPatient}
        />
      )}

      {activeModal === "corporateModal" && (
        <CorporateManagement
          corporatePlans={corporatePlans}
          corporateEmployees={corporateEmployees}
          onSavePlan={handleSaveCorporatePlan}
          onDeletePlan={handleDeleteCorporatePlan}
          onBulkAddPatients={async (ps: any[]) => {
            try {
              await handleBulkSavePatients(ps);
              showToast(`Registered ${ps.length} employees successfully!`);
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.message || "Bulk registration failed";
              showToast(Array.isArray(msg) ? msg.join(', ') : msg, "error");
            }
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

      {activeModal === "scheduleManager" && selectedItemId && (
        <DoctorScheduleManager
          doctorId={selectedItemId}
          doctorName={
            staffMembers.find((s: any) => s.id === selectedItemId)?.name || ""
          }
          onClose={() => {
            setActiveModal(null);
            setSelectedItemId("");
          }}
          onSave={() => {
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
              ?.salaryPending?.toString().replace(/,/g, "") || "0"
          )}
          onClose={() => {
            setActiveModal(null);
            setSelectedStaffForSalary(null);
          }}
          onSave={(pd: any) => {
            const s = staffMembers.find((x: any) => x.id === pd.staffId);
            if (s) {
              const paid = parseFloat(s.salaryPaid?.toString().replace(/,/g, "") || "0");
              const pending = parseFloat(
                s.salaryPending?.toString().replace(/,/g, "") || "0"
              );
              const amt = parseFloat(pd.amount);
              const newPending = pd.pending_dues !== undefined ? parseFloat(pd.pending_dues) : Math.max(0, pending - amt);
              const newBase = pd.base_salary !== undefined ? parseFloat(pd.base_salary) : parseFloat(s.monthlySalary?.toString().replace(/,/g, "") || "0");
              const newPaid = newBase - newPending;

              handleSaveStaff({
                ...s,
                salaryPaid: newPaid >= 0 ? newPaid : paid + amt,
                salaryPending: newPending,
                monthlySalary: newBase > 0 ? newBase : s.monthlySalary,
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
          staffId={selectedStaffForSalary.id}
          staffName={selectedStaffForSalary.name}
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

      {confirmConfig.show && (
        <ConfirmModal
          title={confirmConfig.title}
          message={confirmConfig.message}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() =>
            setConfirmConfig((prev: any) => ({ ...prev, show: false }))
          }
          confirmLabel={confirmConfig.confirmLabel}
          variant={confirmConfig.variant}
          isLoading={confirmConfig.isLoading}
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
