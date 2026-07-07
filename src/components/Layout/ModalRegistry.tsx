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
import { QuickRegistrationModal } from "../CorporatePlans/QuickRegistration/QuickRegistrationModal";
import { EmployeeFormModal } from "../CorporatePlans/Employee/EmployeeFormModal";
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
import { useConsultationQuery } from "../../hooks/consultation/useConsultationQuery";
import { useCreateConsultationMutation } from "../../hooks/consultation/useCreateConsultationMutation";
import { useUpdateConsultationMutation } from "../../hooks/consultation/useUpdateConsultationMutation";
import { toApiCreateConsultation, toApiUpdateConsultation } from "../../utils/consultationUtils";
import { useCreateEMRMutation } from "../../hooks/emr/useCreateEMRMutation";
import { useCreateInvoiceMutation, CreateInvoiceVariables } from "../../hooks/billing/useCreateInvoiceMutation";
import { useQueryClient } from "@tanstack/react-query";

function ModalRegistryContent() {
  const queryClient = useQueryClient();
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

  const { data: editConsultationRaw, isLoading: isEditLoading } = useConsultationQuery(
    selectedPatientForDiagnose?.consultationId,
    { enabled: !!selectedPatientForDiagnose?.isEditMode && !!selectedPatientForDiagnose?.consultationId }
  );

  const editConsultationData = useMemo(() => {
    if (!editConsultationRaw) return null;
    const data = editConsultationRaw.data || editConsultationRaw;

    // Map to toothChartState format
    const toothChartState: any = {};
    const toothFindingsRaw = data.tooth_findings || data.toothFindings || [];
    const availableConditionsByTooth: any = {};

    toothFindingsRaw.forEach((tf: any) => {
      if (!toothChartState[tf.tooth_number]) {
        toothChartState[tf.tooth_number] = [];
        availableConditionsByTooth[tf.tooth_number] = [];
      }
      let mappedCond = tf.condition.toLowerCase();
      if (mappedCond === 'endo_rct') mappedCond = 'endo';
      else if (mappedCond === 'for_extraction') mappedCond = 'extract';
      else if (mappedCond === 'healthy') mappedCond = 'normal';

      toothChartState[tf.tooth_number].push(mappedCond);
      availableConditionsByTooth[tf.tooth_number].push(mappedCond);
    });

    const treatments = (data.treatment_plans || data.treatments || []).map((t: any) => {
      let condition = '';
      if (availableConditionsByTooth[t.tooth_number] && availableConditionsByTooth[t.tooth_number].length > 0) {
        condition = availableConditionsByTooth[t.tooth_number].shift();
      }
      return {
        id: t.id || `plan-${t.tooth_number}-${Date.now()}`,
        tooth: t.tooth_number?.toString() || "",
        condition: condition,
        procedure: t.procedure || "",
        sessions: t.sessions?.length || t.total_sessions || 1,
        duration: t.duration ? `${t.duration} mins` : "15 mins",
        cost: t.est_cost || 0,
        isActive: t.is_active ?? true,
        planDate: t.treatment_date ? t.treatment_date.split('T')[0] : new Date().toISOString().split('T')[0],
      };
    });

    const prescriptions = (data.prescriptions || []).map((p: any) => {
      let dUnit = "Days";
      if (p.duration_type) {
        dUnit = p.duration_type.charAt(0).toUpperCase() + p.duration_type.slice(1).toLowerCase();
      }
      return {
        id: p.id || Math.random().toString(),
        medicine: p.medicine_id || p.medicine_name || "",
        medicineName: p.medicine_name || "",
        dosage: p.dosage || "",
        timing: p.timing || "",
        frequency: p.frequency || "",
        duration: p.duration?.toString() || "1",
        durationUnit: dUnit,
        qty: p.qty?.toString() || "1",
        instructions: p.instructions || ""
      };
    });

    return {
      toothChartState,
      consultationData: {
        observations: data.observations_desc || data.observations || "",
        diagnosis: data.diagnosis_desc || data.diagnosis || "",
        treatmentPlan: data.treatment_plan_desc || data.treatmentPlan || "",
        treatmentCost: data.total_estimated_cost || data.treatmentCost || 0,
        followUpRequired: data.is_follow_up || data.followUpRequired || false,
        consultationNotes: data.additional_notes || data.consultationNotes || "",
        requiresTreatment: treatments.length > 0,
        treatmentPlans: treatments,
        prescriptions: prescriptions.length > 0 ? prescriptions : [
          {
            id: "1",
            medicine: "",
            dosage: "",
            timing: "",
            frequency: "",
            duration: "",
            durationUnit: "Days",
            qty: "",
          }
        ],
        images: (data.attachments || data.images || data.clinical_images || []).map((a: any) => typeof a === 'string' ? a : a.file_url).filter(Boolean),
        xrayFiles: (data.xrayFiles || data.xray_files || []).map((a: any) => typeof a === 'string' ? a : a.file_url).filter(Boolean),
        labFiles: data.labFiles || data.lab_files || [],
        selectedTeeth: data.selectedTeeth || data.selected_teeth || [],
        bp: data.bp || "",
        height: data.height || "",
        weight: data.weight || "",
        bmi: data.bmi || "",
        tests: data.tests || "",
        nextVisit: data.nextVisit || data.next_visit || "",
        consultationDate: data.consultationDate || data.consultation_date || new Date().toISOString().split("T")[0],
        followUpDate: data.followUpDate || data.follow_up_date || "",
        startTreatmentToday: data.startTreatmentToday || data.start_treatment_today || false,
      }
    };
  }, [editConsultationRaw]);

  const enabledFlags = useMemo(() => ({
    patients: ["appointmentForm", "invoiceForm", "patientDetails", "diagnoseForm", "consentForm", "consentViewer"].includes(activeModal || ""),
    appointments: ["appointmentForm"].includes(activeModal || ""),
    invoices: ["invoiceViewer", "invoiceForm"].includes(activeModal || ""),
    treatments: ["treatmentForm", "diagnoseForm"].includes(activeModal || ""),
    staff: ["appointmentForm", "doctorSchedule", "salaryModal", "salaryHistory", "diagnoseForm", "consentForm", "consentViewer"].includes(activeModal || ""),
    inventory: ["inventoryForm", "restockForm", "consumeForm", "adjustForm"].includes(activeModal || ""),
    corporate: ["addCorporateMember", "patientForm"].includes(activeModal || ""),
  }), [activeModal]);

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
    handleUpdateStaffStatus,
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
  } = useAppData({ enabled: enabledFlags });

  const matchingInvoice = useMemo(() => {
    if (!selectedItemId) return null;
    return invoices.find((i: any) =>
      String(i.id) === String(selectedItemId) ||
      String(i.invoice_number) === String(selectedItemId) ||
      String(i.invoiceNumber) === String(selectedItemId)
    ) || null;
  }, [invoices, selectedItemId]);

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
    exportPatientReport(id);

  const { mutateAsync: createAppointmentMutation } = useCreateAppointmentMutation();
  const { mutateAsync: updateAppointmentMutation } = useUpdateAppointmentMutation();
  const { mutateAsync: checkInAfterRegistration } = useCheckInAfterRegistrationMutation();
  const { mutateAsync: createEMRMutation } = useCreateEMRMutation();
  const { mutateAsync: createInvoiceMutation } = useCreateInvoiceMutation();

  // Queries for detail views
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
    if (!raw) return (inventory || []).find((i: any) => i.id === currentInvItemId);

    const itemData = raw.data || raw;
    if (!itemData) return null;

    const rawExpiry = itemData.expiry_date ?? itemData.expiryDate;
    const safeExpiry = typeof rawExpiry === 'string' ? rawExpiry.split("T")[0] : "";

    const cat = itemData.category?.id || itemData.category_id || itemData.category || "instruments";
    const categoryString = typeof cat === 'string' ? cat.toLowerCase() : "instruments";

    return {
      id: itemData.id,
      name: itemData.name,
      category: categoryString,
      currentStock: itemData.current_stock ?? itemData.currentStock ?? 0,
      minStock: itemData.min_stock ?? itemData.minStock ?? 0,
      maxStock: itemData.max_stock ?? itemData.maxStock ?? 100,
      unit: typeof itemData.unit === 'string' ? itemData.unit.toLowerCase() : "pieces",
      supplier: itemData.supplier ?? "Unknown",
      lastRestocked: itemData.last_restocked ?? itemData.lastRestocked ?? "",
      cost: itemData.unit_cost ?? itemData.cost ?? 0,
      expiryDate: safeExpiry,
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
      // patientName: form.patient_name || "",
      treatmentType: form.procedure_type || "",
      content: form.consent_declaration || "",
      riskDisclosure: form.clinical_risks || "",
      alternativeTreatments: form.alternative_risks || "",
      witnessName: form.witness_name || "",
      patientSignature: form.patient_signature || "",
      witnessSignature: form.witness_signature || "",
      doctorName: doctorObj?.name || form.doctor_name || "",
      doctorId: form.doctor_id || "",
      consentFormUrl: form.offline_consent_image_url || form.offlineConsentImageUrl || form.consent_form_image || form.consent_form_url || form.consentFormUrl || "",
    };
  }, [apiConsentDetail, selectedConsentForm, staffMembers]);

  const mappedViewerForm = useMemo(() => {
    if (!apiConsentDetail) return selectedConsentForm;
    const form = apiConsentDetail?.data || apiConsentDetail;
    const doctorObj = staffMembers.find((s: any) => s.id === form.doctor_id);
    const patientObj = patients.find((p: any) => p.id === (form.patient?.id || form.patient_id));
    return {
      id: form.id,
      patientId: form.patient_id || "",
      patientName: form.patient?.name || form.patient_name || patientObj?.name || "Unknown",
      treatmentType: form.procedure_type || "",
      content: form.consent_declaration || "",
      riskDisclosure: form.clinical_risks || "",
      alternativeTreatments: form.alternative_risks || "",
      postTreatmentCare: form.post_treatment_care || "Follow doctor's post-treatment guidelines carefully.",
      witnessName: form.witness_name || "",
      patientSignature: form.patient_signature_url || form.patient_signature || "",
      witnessSignature: form.witness_signature_url || form.witness_signature || "",
      doctorName: doctorObj?.name || form.doctor_name || "Attending Dentist",
      doctorId: form.doctor_id || "",
      date: form.created_at || new Date().toISOString(),
      createdDate: form.created_at || form.createdAt || null,
      signedDate: form.signed_on || null,
      status: !form.signed_on ? "PENDING" : (form.status || "PENDING"),
      signature: form.patient_signature_url || form.patient_signature || "",
      consentFormUrl: form.offline_consent_image_url || form.offlineConsentImageUrl || form.consent_form_image || form.consent_form_url || form.consentFormUrl || "",
    };
  }, [apiConsentDetail, selectedConsentForm, staffMembers, patients]);

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

      {activeModal === "diagnoseForm" && selectedPatientForDiagnose && (!selectedPatientForDiagnose.isEditMode || editConsultationData) && (
        <PatientConsultation
          key={selectedPatientForDiagnose.appointmentId || selectedPatientForDiagnose.id}
          patient={selectedPatientForDiagnose}
          doctors={activeDoctors}
          doctorAvailability={doctorAvailability}
          appointments={appointments}
          bookedFollowUp={bookedFollowUp}
          initialData={
            selectedPatientForDiagnose.isEditMode
              ? editConsultationData
              : draftConsultations[
              selectedPatientForDiagnose.patientId || selectedPatientForDiagnose.id
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
            setSelectedPatientForDiagnose(null);
          }}
          onCompleteConsultation={async (d: any) => {
            try {
              let resolvedPatientId = selectedPatientForDiagnose.patientId || selectedPatientForDiagnose.id;

              if (d.isDirect) {
                resolvedPatientId = undefined;
              }

              // Map tooth chart state to tooth_findings array
              const tooth_findings = Object.entries(d.toothChartState || {}).flatMap(([toothNum, conditions]) => {
                if (!Array.isArray(conditions)) return [];
                return conditions.map((cond: string) => {
                  const condStr = typeof cond === 'string' ? cond.toLowerCase() : '';
                  let mappedCondition = condStr.toUpperCase();
                  if (condStr === 'endo') mappedCondition = 'ENDO_RCT';
                  else if (condStr === 'extract') mappedCondition = 'FOR_EXTRACTION';
                  else if (condStr === 'normal') mappedCondition = 'HEALTHY';

                  const n = parseInt(toothNum);
                  let cType = "ADULT";
                  if ((n >= 51 && n <= 55) || (n >= 61 && n <= 65) || (n >= 71 && n <= 75) || (n >= 81 && n <= 85)) {
                    cType = "PEDIATRIC";
                  }

                  return {
                    tooth_number: parseInt(toothNum),
                    condition: mappedCondition,
                    chart_type: cType
                  };
                });
              });

              // Map treatment plans to treatments array
              const treatments = (d.treatmentPlans || []).map((tp: any) => ({
                tooth_number: parseInt(tp.tooth),
                procedure: tp.procedure,
                total_sessions: parseInt(tp.sessions || tp.total_sessions || tp.totalSessions) || 1,
                duration_min: parseInt((tp.duration || "15").replace(/\D/g, "")) || 15,
                est_cost: parseFloat(tp.cost) || 0,
                treatment_date: tp.planDate || tp.treatmentDate || tp.treatment_date || new Date().toISOString().split('T')[0]
              }));

              // Map prescriptions array
              const prescriptions = (d.prescriptions || [])
                .filter((p: any) => p.medicine)
                .map((p: any) => ({
                  medicine_id: p.medicine,
                  // medicine_name: p.medicineName || undefined,
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

              const isWalkIn = resolvedPatientId && String(resolvedPatientId).startsWith("WALK-");
              const apiPayload: any = {
                id: selectedPatientForDiagnose.isEditMode ? selectedPatientForDiagnose.consultationId : undefined,
                patientId: isWalkIn ? undefined : resolvedPatientId,
                patient_name: isWalkIn
                  ? (selectedPatientForDiagnose.patientName || selectedPatientForDiagnose.name || d.patientName || d.directPatientName)
                  : (d.isDirect && !resolvedPatientId ? d.directPatientName : undefined),
                patient_phone: isWalkIn
                  ? (selectedPatientForDiagnose.phone || selectedPatientForDiagnose.patientPhone || d.patientPhone || d.directPatientPhone)
                  : (d.isDirect && !resolvedPatientId ? d.directPatientPhone : undefined),
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
                prescriptions: prescriptions,
                attachments: d.attachments || []
              };

              if (d.followUpRequired) {
                apiPayload.appointment_info = {
                  patient_id: isWalkIn ? undefined : resolvedPatientId,
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
          onSave={async (inv: any) => {
            try {
              const payload: CreateInvoiceVariables = {
                due_date: inv.dueDate,
                payment_method: "CASH",
                complimentary_reason: inv.complimentaryNote || undefined,
                discount: inv.discount || 0,
                tax_percentage: inv.tax || 0,
                items: inv.items.map((item: any) => {
                  let type: "CONSULTATION" | "TREATMENT_SESSION" | "MEMBERSHIP";
                  if (item.linkedType) {
                    if (item.linkedType.toLowerCase().includes("consultation")) type = "CONSULTATION";
                    else if (item.linkedType.toLowerCase().includes("treatment")) type = "TREATMENT_SESSION";
                    else if (item.linkedType.toLowerCase().includes("membership")) type = "MEMBERSHIP";
                  }

                  return {
                    item_type: type,
                    consultation_id: type === "CONSULTATION" ? item.linkedId : undefined,
                    treatment_session_id: type === "TREATMENT_SESSION" ? item.linkedId : undefined,
                    membership_id: type === "MEMBERSHIP" ? item.linkedId : undefined,
                    description: item.description,
                    total_amount: item.amount,
                    billed_amount: item.amount,
                  };
                }),
              };

              if (inv.memberId) {
                payload.member_id = inv.memberId;
              } else {
                payload.patient_id = inv.patientId;
              }

              const response = await createInvoiceMutation(payload);
              const invoiceId = response?.data?.id || inv.id;

              handleSaveInvoice({ ...inv, id: invoiceId });
              queryClient.invalidateQueries({ queryKey: ["invoices"] });
              queryClient.invalidateQueries({ queryKey: ["unbilledItems"] });
              setActiveModal(null);
              showToast("Invoice created successfully!", "success");
            } catch (err: any) {
              const message = err?.response?.data?.message || err?.message || "Failed to create invoice";
              showToast(message, "error");
            }
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

      {selectedItemId && (activeModal === "invoiceViewer" || matchingInvoice || String(selectedItemId).startsWith("INV-")) && (
        <InvoiceViewer
          invoiceId={matchingInvoice ? String(matchingInvoice.id) : selectedItemId}
          patientId={
            matchingInvoice?.patientId ||
            matchingInvoice?.patient_id ||
            matchingInvoice?.memberId ||
            matchingInvoice?.member_id
          }
          isMember={matchingInvoice?.isMemberInvoice}
          onClose={() => { setSelectedItemId(""); setActiveModal(null); }}
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
          treatmentId={selectedItemId}
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
          onManageSessions={(id: string) => {
            setActiveModal("sessionManager");
            setSelectedItemId(id);
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

              await createEMRMutation(formData);
              setActiveModal(null);
              showToast("EMR saved!");
            } catch (err: any) {
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
          onToggleDoctorAvailability={async (id: string) => {
            const doc = staffMembers.find((s: any) => s.id === id);
            const currentIsActive = doc ? (doc.status === "ACTIVE" || doc.isActive) : !!doctorAvailability[id];
            const newStatus = currentIsActive ? "INACTIVE" : "ACTIVE";
            try {
              setDoctorAvailability((prev: Record<string, boolean>) => ({
                ...prev,
                [id]: newStatus === "ACTIVE",
              }));
              await handleUpdateStaffStatus(id, newStatus);
              toast.success(`Doctor status updated to ${newStatus}`);
            } catch (err: any) {
              setDoctorAvailability((prev: Record<string, boolean>) => ({
                ...prev,
                [id]: currentIsActive,
              }));
              toast.error(err?.message || "Failed to update doctor status");
            }
          }}
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
              payload.append("doctor_id", f.doctorId || "d11a6adb-2420-4ca6-8b10-a798edbbfce9");
              payload.append("patient_id", f.patientId || "96609aed-e06b-42ac-ac8a-8ea978315ce2");

              const isOffline = !!f.rawConsentFormFile;

              if (isOffline) {
                // Only send minimal fields for offline consent upload
                if (f.treatmentType) {
                  payload.append("procedure_type", f.treatmentType);
                }
                payload.append("offline_consent_image", f.rawConsentFormFile);
                payload.append("status", "COMPLETED");
              } else {
                payload.append("patient_name", f.patientName || "Ram");
                // Standard manual consent fields
                payload.append("procedure_type", f.treatmentType || "Root Canal Treatment");
                payload.append("consent_declaration", f.content || "I understand the procedure");
                payload.append("procedure_declaration", f.procedure_declaration || f.content || "I understand the procedure");
                payload.append("clinical_risks", f.riskDisclosure || "Infection");
                payload.append("alternative_risks", f.alternativeTreatments || "Tooth extraction");

                if (f.postTreatmentCare) {
                  payload.append("post_treatment_care", f.postTreatmentCare);
                }

                if (f.witnessName) {
                  payload.append("witness_name", f.witnessName);
                }

                const isSigned = !!f.patientSignature;
                payload.append("status", isSigned ? "COMPLETED" : "PENDING");
                if (isSigned) {
                  payload.append("signed_on", new Date().toISOString());
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
              const payload: any = {
                name: i.name,
                category_id: i.category,
                description: i.description || "",
                current_stock: Number(i.currentStock) || 0,
                min_stock: Number(i.minStock) || 0,
                max_stock: Number(i.maxStock) || 100,
                unit: i.unit ? i.unit.toUpperCase() : "PIECES",
                batch_number: i.batchNumber || "",
                unit_cost: Number(i.cost) || 0,
                supplier: i.supplier || "",
                warranty: i.warranty || "",
              };
              if (i.expiryDate && !isNaN(Date.parse(i.expiryDate))) {
                payload.expiry_date = new Date(i.expiryDate).toISOString();
              }
              if (!selectedItemId) {
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
                quantity_delta: ui.quantity_delta,
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

      {activeModal === "quickRegister" && (
        <QuickRegistrationModal />
      )}

      {activeModal === "addCorporateMember" && (
        <EmployeeFormModal
          showForm={true}
          setShowForm={(val) => { if (!val) setActiveModal(null); }}
          editEmp={null}
          activePlans={corporatePlans}
          onSave={() => {
            toast.success("Member added successfully!");
            setActiveModal(null);
          }}
          refetch={() => { }}
        />
      )}

    </>
  );
}

export function ModalRegistry() {
  const { activeModal, confirmConfig, setConfirmConfig } = useModal();
  return (
    <>
      {activeModal && <ModalRegistryContent />}

      {confirmConfig?.show && (
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
