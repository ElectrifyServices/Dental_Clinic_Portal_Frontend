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
import { ConsumeForm } from "../Inventory/ConsumeForm";
import { AdjustForm } from "../Inventory/AdjustForm";
import { InventoryHistoryViewer } from "../Inventory/InventoryHistoryViewer";
import { ConfirmModal, Modal, Button, toast } from "../ui";
import { usePatientDetailQuery } from "../../hooks/patients/usePatientDetailQuery";
import { useCreateAppointmentMutation } from "../../hooks/appointments/useCreateAppointmentMutation";
import { useUpdateAppointmentMutation } from "../../hooks/appointments/useUpdateAppointmentMutation";
import { useCheckInAfterRegistrationMutation } from "../../hooks/appointments/useCheckInAfterRegistrationMutation";
import { useCreateConsentFormMutation } from "../../hooks/patients/useCreateConsentFormMutation";
import { useConsentFormDetailQuery } from "../../hooks/patients/useConsentFormDetailQuery";
import { useUpdateConsentFormMutation } from "../../hooks/patients/useUpdateConsentFormMutation";
import { useCreateInventoryItemMutation } from "../../hooks/inventory/useCreateInventoryItemMutation";
import { useInventoryItemQuery } from "../../hooks/inventory/useInventoryItemQuery";
import { useUpdateInventoryItemMutation } from "../../hooks/inventory/useUpdateInventoryItemMutation";
import { useRestockInventoryItemMutation } from "../../hooks/inventory/useRestockInventoryItemMutation";
import { useConsumeInventoryItemMutation } from "../../hooks/inventory/useConsumeInventoryItemMutation";
import { useAdjustInventoryItemMutation } from "../../hooks/inventory/useAdjustInventoryItemMutation";
import { useCreateConsultationMutation } from "../../hooks/consultation/useCreateConsultationMutation";
import { useUpdateConsultationMutation } from "../../hooks/consultation/useUpdateConsultationMutation";
import { toApiCreateConsultation, toApiUpdateConsultation } from "../../utils/consultationUtils";
import { useCreateEMRMutation } from "../../hooks/emr/useCreateEMRMutation";

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
  const { mutateAsync: createEMR } = useCreateEMRMutation();
  const createConsentMutation = useCreateConsentFormMutation();
  const { mutateAsync: createInventoryMutation } = useCreateInventoryItemMutation();
  const { mutateAsync: updateInventoryMutation } = useUpdateInventoryItemMutation();
  const { mutateAsync: restockInventoryMutation } = useRestockInventoryItemMutation();
  const { mutateAsync: consumeInventoryMutation } = useConsumeInventoryItemMutation();
  const { mutateAsync: adjustInventoryMutation } = useAdjustInventoryItemMutation();
  const { mutateAsync: createConsultationMutation } = useCreateConsultationMutation();
  const { mutateAsync: updateConsultationMutation } = useUpdateConsultationMutation();

  const isInventoryAction = ["inventoryForm", "restockForm", "consumeForm", "adjustForm"].includes(activeModal || "");
  const currentInvItemId = selectedItemId || selectedItemForRestock?.id;

  const { data: apiInventoryItem, isLoading: isInventoryItemLoading } = useInventoryItemQuery(
    isInventoryAction && currentInvItemId ? currentInvItemId : ""
  );

  const mappedInventoryItem = useMemo(() => {
    if (!currentInvItemId) return null;
    const raw: any = apiInventoryItem;
    if (!raw) return inventory.find((i: any) => i.id === currentInvItemId);

    const itemData = raw.data || raw;

    return {
      id: itemData.id,
      name: itemData.name,
      category: itemData.category?.toLowerCase() || "instruments",
      currentStock: itemData.current_stock ?? itemData.currentStock ?? 0,
      minStock: itemData.min_stock ?? itemData.minStock ?? 0,
      maxStock: itemData.max_stock ?? itemData.maxStock ?? 100,
      unit: itemData.unit?.toLowerCase() || "pieces",
      supplier: itemData.supplier ?? "Unknown",
      lastRestocked: itemData.last_restocked ?? itemData.lastRestocked ?? "",
      cost: itemData.unit_cost ?? itemData.cost ?? 0,
      expiryDate: (itemData.expiry_date ?? itemData.expiryDate ?? "").split("T")[0],
      batchNumber: itemData.batch_number ?? itemData.batchNumber ?? "",
      description: itemData.description ?? "",
      warranty: itemData.warranty ?? "",
    };
  }, [apiInventoryItem, currentInvItemId, inventory]);

  function dataURLtoFile(dataurl: string, filename: string): File | null {
    if (!dataurl || !dataurl.startsWith("data:")) return null;
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const updateConsentMutation = useUpdateConsentFormMutation();

  const { data: apiConsentDetail, isLoading: isConsentDetailLoading } = useConsentFormDetailQuery(
    selectedConsentForm?.id,
    (activeModal === "consentForm" || activeModal === "consentViewer") && !!selectedConsentForm?.id
  );

  const mappedEditForm = useMemo(() => {
    if (!apiConsentDetail) return selectedConsentForm;
    const form = apiConsentDetail?.data || apiConsentDetail;
    const doctorObj = staffMembers.find((s: any) => s.id === form.doctor_id);
    return {
      id: form.id,
      patientId: form.patient_id || "",
      patientName: form.patient_name || "",
      treatmentType: form.procedure_type || "",
      content: form.consent_declaration || "",
      riskDisclosure: form.clinical_risks || "",
      alternativeTreatments: form.alternative_risks || "",
      witnessName: form.witness_name || "",
      patientSignature: form.patient_signature || "",
      witnessSignature: form.witness_signature || "",
      doctorName: doctorObj?.name || form.doctor_name || "",
      doctorId: form.doctor_id || "",
    };
  }, [apiConsentDetail, selectedConsentForm, staffMembers]);

  const mappedViewerForm = useMemo(() => {
    if (!apiConsentDetail) return selectedConsentForm;
    const form = apiConsentDetail?.data || apiConsentDetail;
    const doctorObj = staffMembers.find((s: any) => s.id === form.doctor_id);
    return {
      id: form.id,
      patientId: form.patient_id || "",
      patientName: form.patient_name || "",
      treatmentType: form.procedure_type || "",
      content: form.consent_declaration || "",
      riskDisclosure: form.clinical_risks || "",
      alternativeTreatments: form.alternative_risks || "",
      postTreatmentCare: form.post_treatment_care || "Follow doctor's post-treatment guidelines carefully.",
      witnessName: form.witness_name || "",
      patientSignature: form.patient_signature || "",
      witnessSignature: form.witness_signature || "",
      doctorName: doctorObj?.name || form.doctor_name || "Attending Dentist",
      doctorId: form.doctor_id || "",
      date: form.created_at || new Date().toISOString(),
      createdDate: form.created_at || form.createdAt || null,
      signedDate: form.signed_on || null,
      status: !form.signed_on ? "PENDING" : (form.status || "PENDING"),
      signature: form.patient_signature || "",
    };
  }, [apiConsentDetail, selectedConsentForm, staffMembers]);

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
              const statusMap: Record<string, string> = {
                'scheduled': 'BOOKED',
                'booked': 'BOOKED',
                'checked-in': 'CHECKED_IN',
                'completed': 'COMPLETED',
                'cancelled': 'CANCELLED',
                'no-show': 'NO_SHOW',
                'follow-up': 'FOLLOW_UP',
              };

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
                status: statusMap[(apt.status || "").toLowerCase()] || "BOOKED"
              };

              const isNew = !apt.id || apt.id.length > 20 === false;
              if (isNew) {
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
              toast.success(isNew ? "Appointment created successfully!" : "Appointment updated successfully!");
            } catch (error: any) {
              const msg = error?.response?.data?.responseStatusList?.statusList?.[0]?.statusDesc ||
                          error?.response?.data?.statusDesc ||
                          error?.response?.data?.message ||
                          error?.status?.statusDesc ||
                          error?.message ||
                          "Failed to save appointment";
              toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
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
              const savedPatientResponse = await handleSavePatient(p, patientFormType, parentPatientId);
              const patientId = p.id || savedPatientResponse?.data?.id || savedPatientResponse?.id;
              const hasCheckIn = !!pendingCheckInAppt;
              setActiveModal(null);
              setSelectedPatientId("");
              setParentPatientId("");
              setPreFilledPatientData(null);
              if (hasCheckIn && patientId) {
                setQueuedPatients((prev: any[]) => [
                  ...prev,
                  {
                    id: pendingCheckInAppt.id,
                    patientId: patientId,
                    patientName: p.name || savedPatientResponse?.data?.name || savedPatientResponse?.name || "",
                    patientPhone: p.phone || savedPatientResponse?.data?.phone || savedPatientResponse?.phone || "",
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
                    patient_id: patientId
                  });
                } catch (err) {
                  /* console.error removed */
                  throw err;
                }

                setPendingCheckInAppt(null);
                toast.success("Patient checked-in successfully!");
              } else {
                toast.success("Patient saved successfully!");
              }
            } catch (err: any) {
              const apiError = err?.response?.data?.responseStatusList?.statusList?.[0]?.statusDesc ||
                err?.response?.data?.message ||
                err?.message ||
                "Failed to save patient";
              const msg = Array.isArray(apiError) ? apiError.join(', ') : apiError;
              toast.error(msg);
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
          onCompleteConsultation={async (d: any) => {
            try {
              // Map tooth chart state to tooth_findings array
              const tooth_findings = Object.entries(d.toothChartState || {}).map(([toothNum, condition]) => {
                const condStr = typeof condition === 'string' ? condition.toLowerCase() : '';
                let mappedCondition = condStr.toUpperCase();
                if (condStr === 'endo') mappedCondition = 'ENDO_RCT';
                else if (condStr === 'extract') mappedCondition = 'FOR_EXTRACTION';
                else if (condStr === 'normal') mappedCondition = 'HEALTHY';
                return {
                  tooth_number: parseInt(toothNum),
                  condition: mappedCondition
                };
              });

              // Map treatment plans to treatments array
              const treatments = (d.treatmentPlans || []).map((tp: any) => ({
                tooth_number: parseInt(tp.tooth),
                procedure: tp.procedure,
                total_sessions: parseInt(tp.sessions || tp.total_sessions || tp.totalSessions) || 1,
                est_cost: parseFloat(tp.cost) || 0,
                is_active: tp.isActive ?? true
              }));

              // Map prescriptions array
              const prescriptions = (d.prescriptions || [])
                .filter((p: any) => p.medicine)
                .map((p: any) => ({
                  medicine_name: p.medicine,
                  dosage: p.dosage,
                  timing: p.timing,
                  frequency: p.frequency,
                  duration: parseInt(p.duration) || 1,
                  duration_type: (p.durationUnit || 'days').toUpperCase(),
                  qty: parseInt(p.qty) || 1,
                  instructions: p.instructions || ''
                }));

              const validDoctorId = selectedPatientForDiagnose.doctorId && selectedPatientForDiagnose.doctorId !== "1"
                ? selectedPatientForDiagnose.doctorId
                : (activeDoctors.length > 0 ? activeDoctors[0].id : undefined);

              const apiPayload: any = {
                patientId: selectedPatientForDiagnose.patientId || selectedPatientForDiagnose.id,
                appointmentId: selectedPatientForDiagnose.appointmentId,
                doctorId: validDoctorId,
                observations: d.observations,
                diagnosis: d.diagnosis,
                treatmentPlan: d.treatmentPlan,
                treatmentCost: d.treatmentCost,
                followUpRequired: d.followUpRequired,
                consultationNotes: d.consultationNotes,
                status: "COMPLETED",
                toothFindings: tooth_findings,
                treatments: treatments,
                prescriptions: prescriptions
              };

              if (d.followUpRequired) {
                apiPayload.appointment_info = {
                  patient_id: selectedPatientForDiagnose.patientId || selectedPatientForDiagnose.id,
                  doctor_id: d.followUpDoctorId,
                  date: d.followUpDate,
                  start_time: d.followUpTime,
                  slot_duration_mins: 15
                };
              }

              const consultationId = selectedPatientForDiagnose.id;
              const isExistingBackendConsultation = consultationId && !String(consultationId).startsWith("WALK-");

              if (isExistingBackendConsultation) {
                // Update existing consultation via PATCH
                await updateConsultationMutation(toApiUpdateConsultation({
                  ...apiPayload,
                  id: consultationId
                }));
              } else {
                // Make the actual POST /consultations API call
                await createConsultationMutation(toApiCreateConsultation(apiPayload));
              }

              // Cleanup local queue and draft
              setQueuedPatients((prev: any[]) =>
                prev.filter((p: any) => p.id !== selectedPatientForDiagnose.id),
              );
              const pId = selectedPatientForDiagnose.patientId || selectedPatientForDiagnose.id;
              setDraftConsultations((prev: Record<string, any>) => {
                const n = { ...prev };
                delete n[pId];
                return n;
              });
              showToast("Consultation completed successfully", "success");
            } catch (err: any) {
              const message = err?.response?.data?.message || err?.message || "Failed to complete consultation";
              showToast(message, "error");
              throw err;
            }
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
            toast.success("Appointment scheduled!");
          }}
        />
      )}

      {activeModal === "emrForm" && (
        <EMRForm
          onClose={() => setActiveModal(null)}
          onSave={async (r: any) => {
            try {
              const formData = new FormData();

              // Find the selected patient ID from patients list
              const selectedPatient = patients.find((p: any) => p.name === r.patientName);
              const pId = selectedPatient?.id || r.patientId || "59ff70ab-0adf-443b-be94-f8defa47dfba";
              formData.append("patient_id", pId);

              formData.append("record_type", (r.type || "CONSULTATION").toUpperCase());
              formData.append("title", r.title);
              formData.append("content", r.content);

              if (r.files && r.files.length > 0) {
                r.files.forEach((file: File) => {
                  formData.append("attachments", file);
                });
              }

              await createEMR(formData);
              setActiveModal(null);
              showToast("EMR saved!");
            } catch (err: any) {
              /* console.error removed */
              showToast(err?.response?.data?.message || err?.message || "Failed to save EMR", "error");
            }
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
          onClose={() => {
            setActiveModal(null);
            setSelectedConsentForm(null);
          }}
          patients={patients}
          doctors={activeDoctors}
          form={mappedEditForm || undefined}
          isLoading={isConsentDetailLoading}
          onSave={async (f: any) => {
            try {
              const payload = new FormData();
              payload.append("patient_name", f.patientName || "Ram");
              payload.append("doctor_id", f.doctorId || "d11a6adb-2420-4ca6-8b10-a798edbbfce9");
              payload.append("procedure_type", f.treatmentType || "Root Canal Treatment");
              payload.append("patient_id", f.patientId || "96609aed-e06b-42ac-ac8a-8ea978315ce2");
              payload.append("consent_declaration", f.content || "I understand the procedure");
              payload.append("procedure_declaration", f.procedure_declaration || f.content || "I understand the procedure");
              payload.append("clinical_risks", f.riskDisclosure || "Infection");
              payload.append("alternative_risks", f.alternativeTreatments || "Tooth extraction");
              if (f.witnessName) {
                payload.append("witness_name", f.witnessName);
              }

              if (f.patientSignature && f.patientSignature.startsWith("data:")) {
                const patientFile = dataURLtoFile(f.patientSignature, "patient_signature.png");
                if (patientFile) {
                  payload.append("patient_signature", patientFile);
                }
              }

              if (f.witnessSignature && f.witnessSignature.startsWith("data:")) {
                const witnessFile = dataURLtoFile(f.witnessSignature, "witness_signature.png");
                if (witnessFile) {
                  payload.append("witness_signature", witnessFile);
                }
              }

              if (f.id && !f.id.startsWith("CONSENT-")) {
                await updateConsentMutation.mutateAsync({ id: f.id, formData: payload });
                showToast("Consent updated successfully!");
              } else {
                await createConsentMutation.mutateAsync(payload);
                showToast("Consent generated!");
              }
              setActiveModal(null);
              setSelectedConsentForm(null);
            } catch (err: any) {
              /* console.error removed */
              showToast(err?.response?.data?.message || err?.message || "Failed to save consent form", "error");
            }
          }}
        />
      )}

      {activeModal === "consentViewer" && mappedViewerForm && (
        <ConsentFormViewer
          form={mappedViewerForm}
          isLoading={isConsentDetailLoading}
          onClose={() => {
            setActiveModal(null);
            setSelectedConsentForm(null);
          }}
        />
      )}

      {activeModal === "inventoryForm" && (
        <InventoryForm
          item={selectedItemId ? mappedInventoryItem : undefined}
          isLoading={isInventoryItemLoading}
          onClose={() => {
            setActiveModal(null);
            setSelectedItemId("");
          }}
          onSave={async (i: any) => {
            try {
              if (!selectedItemId) {
                const payload = {
                  name: i.name,
                  category: i.category ? i.category.toUpperCase() : "INSTRUMENTS",
                  description: i.description || "",
                  current_stock: Number(i.currentStock) || 0,
                  min_stock: Number(i.minStock) || 0,
                  max_stock: Number(i.maxStock) || 100,
                  unit: i.unit ? i.unit.toUpperCase() : "PIECES",
                  batch_number: i.batchNumber || "",
                  expiry_date: i.expiryDate || "",
                  unit_cost: Number(i.cost) || 0,
                  supplier: i.supplier || "",
                  warranty: i.warranty || "",
                };
                const res = await createInventoryMutation(payload);
                if (res?.id) i.id = res.id;
              } else {
                await updateInventoryMutation({ id: selectedItemId, ...payload });
              }
              handleSaveInventoryItem(i);
              setActiveModal(null);
              setSelectedItemId("");
              showToast(selectedItemId ? "Item updated!" : "Item added successfully!");
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.message || "Failed to save item";
              showToast(Array.isArray(msg) ? msg.join(', ') : msg, "error");
            }
          }}
        />
      )}

      {activeModal === "restockForm" && selectedItemForRestock && (
        <RestockForm
          item={mappedInventoryItem || selectedItemForRestock}
          onClose={() => {
            setActiveModal(null);
            setSelectedItemForRestock(null);
          }}
          onSave={async (ui: any) => {
            try {
              await restockInventoryMutation({
                id: ui.id,
                quantity: ui.quantity,
                reason: ui.reason,
                reference_id: ui.reference_id,
              });
              handleSaveInventoryItem(ui); // optimistic update if needed, but react-query invalidates anyway
              setActiveModal(null);
              setSelectedItemForRestock(null);
              showToast(`${ui.name || 'Item'} restocked successfully!`);
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.message || "Failed to restock item";
              showToast(Array.isArray(msg) ? msg.join(', ') : msg, "error");
            }
          }}
        />
      )}

      {activeModal === "consumeForm" && selectedItemForRestock && (
        <ConsumeForm
          item={mappedInventoryItem || selectedItemForRestock}
          onClose={() => {
            setActiveModal(null);
            setSelectedItemForRestock(null);
          }}
          onSave={async (ui: any) => {
            try {
              await consumeInventoryMutation({
                id: ui.id,
                quantity: ui.quantity,
                reason: ui.reason,
                reference_id: ui.reference_id,
              });
              handleSaveInventoryItem(ui);
              setActiveModal(null);
              setSelectedItemForRestock(null);
              showToast(`${ui.name || 'Item'} consumed successfully!`);
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.message || "Failed to consume item";
              showToast(Array.isArray(msg) ? msg.join(', ') : msg, "error");
            }
          }}
        />
      )}

      {activeModal === "adjustForm" && selectedItemForRestock && (
        <AdjustForm
          item={mappedInventoryItem || selectedItemForRestock}
          onClose={() => {
            setActiveModal(null);
            setSelectedItemForRestock(null);
          }}
          onSave={async (ui: any) => {
            try {
              await adjustInventoryMutation({
                id: ui.id,
                quantity: ui.quantity,
                reason: ui.reason,
                reference_id: ui.reference_id,
              });
              handleSaveInventoryItem(ui);
              setActiveModal(null);
              setSelectedItemForRestock(null);
              showToast(`${ui.name || 'Item'} adjusted successfully!`);
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.message || "Failed to adjust item";
              showToast(Array.isArray(msg) ? msg.join(', ') : msg, "error");
            }
          }}
        />
      )}

      {activeModal === "inventoryHistory" && selectedItemForRestock && (
        <InventoryHistoryViewer
          itemId={selectedItemForRestock.id}
          itemName={selectedItemForRestock.name || "Item"}
          onClose={() => {
            setActiveModal(null);
            setSelectedItemForRestock(null);
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
    </>
  );
}
