import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import React from "react";
import { Save, Stethoscope, CheckCircle, Loader2, Paperclip, Upload, FileText, X } from "lucide-react";
import { Modal, Button, toast } from "@/components/ui";
import { teeth } from "@/constants/treatment.constants";
import { useCompleteTreatmentSessionMutation, useAddTreatmentSessionMutation } from "@/hooks/treatment/useTreatmentSessionHooks";
import type { TreatmentFormProps } from "@/types/treatment.types";
import { useTreatmentForm } from "@/hooks/treatment/useTreatmentForm";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useDebounce } from "@/hooks/useDebounce";
import { getFileUrl } from "@/services/apiClient";
import { useProcedureQuery } from "@/hooks/procedures/useProcedureQuery";
import { useCreateProcedureMutation } from "@/hooks/procedures/useCreateProcedureMutation";
import { useUpdateProcedureMutation } from "@/hooks/procedures/useUpdateProcedureMutation";
import { useDeleteProcedureMutation } from "@/hooks/procedures/useDeleteProcedureMutation";
import { useModal } from "@/contexts/ModalContext";
import { BasicInfoSection } from "./TreatmentForm/BasicInfoSection";
import { SessionPlannerSection } from "./TreatmentForm/SessionPlannerSection";
import { PrescriptionSection } from "./TreatmentForm/PrescriptionSection";
import { ImageUploadSection } from "./TreatmentForm/ImageUploadSection";
import { getLocalDateString } from "../../utils/dateUtils";

export function TreatmentForm({
  onClose,
  onSave,
  treatment,
  patients: allPatients,
  doctors,
  treatments: allTreatments,
}: TreatmentFormProps) {
  const [patientSearch, setPatientSearch] = React.useState("");
  const debouncedPatientSearch = useDebounce(patientSearch, 300);

  const { data: apiPatientsData } = useApiQuery<any[]>({
    queryKey: ["treatment-form-patients", debouncedPatientSearch],
    endpoint: "/patient/list",
    method: "post",
    data: {
      page: 1,
      limit: 50,
      search: debouncedPatientSearch || undefined,
    }
  });

  const apiPatients = React.useMemo(() => {
    let rawList: any[] = [];
    const dataObj: any = apiPatientsData;
    if (Array.isArray(dataObj)) {
      rawList = dataObj;
    } else if (dataObj && Array.isArray(dataObj.patients)) {
      rawList = dataObj.patients;
    } else if (dataObj && Array.isArray(dataObj.data?.patients)) {
      rawList = dataObj.data.patients;
    } else if (dataObj && Array.isArray(dataObj.data?.data)) {
      rawList = dataObj.data.data;
    } else if (dataObj && Array.isArray(dataObj.data)) {
      rawList = dataObj.data;
    }

    const mapped = rawList.map((p: any) => ({
      ...p,
      id: p.id,
      name: p.name || p.full_name || '',
      phone: p.phone || p.mobile || '',
      country_code: p.country_code || '',
      avatar: getFileUrl(p.profile_picture_url) || getFileUrl(p.profile_picture) || getFileUrl(p.avatar) || '',
    }));

    if (mapped.length === 0 && !debouncedPatientSearch) {
      return (allPatients || []).map((p) => {
        const name = typeof p === "string" ? p : p.name;
        return typeof p === "object" ? p : { id: name, name, phone: "", avatar: "" };
      });
    }
    return mapped;
  }, [apiPatientsData, allPatients, debouncedPatientSearch]);

  const [doctorSearch, setDoctorSearch] = React.useState("");
  const debouncedDoctorSearch = useDebounce(doctorSearch, 300);

  const { data: apiStaffData } = useApiQuery<any[]>({
    queryKey: ["treatment-form-doctors", debouncedDoctorSearch],
    endpoint: "/staff/list",
    method: "post",
    data: {
      all: true,
      search: debouncedDoctorSearch || undefined,
    }
  });

  const apiDoctors = React.useMemo(() => {
    let rawList: any[] = [];
    const dataObj: any = apiStaffData;
    if (Array.isArray(dataObj)) {
      rawList = dataObj;
    } else if (dataObj && Array.isArray(dataObj.staffs)) {
      rawList = dataObj.staffs;
    } else if (dataObj && Array.isArray(dataObj.data?.staffs)) {
      rawList = dataObj.data.staffs;
    } else if (dataObj && Array.isArray(dataObj.data?.staff)) {
      rawList = dataObj.data.staff;
    } else if (dataObj && Array.isArray(dataObj.data?.data)) {
      rawList = dataObj.data.data;
    } else if (dataObj && Array.isArray(dataObj.data)) {
      rawList = dataObj.data;
    }

    const mapped = rawList.map((s: any) => {
      let normalizedRole = 'staff';
      let rawRole = s.role?.name || s.role_id || s.role || 'staff';
      if (typeof rawRole !== 'string') rawRole = String(rawRole);
      const lowerRole = rawRole.toLowerCase();

      if (lowerRole.includes('super')) normalizedRole = 'super_admin';
      else if (lowerRole.includes('admin')) normalizedRole = 'admin';
      else if (lowerRole.includes('doctor')) normalizedRole = 'doctor';
      else if (lowerRole.includes('reception')) normalizedRole = 'receptionist';
      else if (lowerRole.includes('nurse')) normalizedRole = 'nurse';
      else if (lowerRole.includes('assist')) normalizedRole = 'assistant';
      else normalizedRole = 'staff';

      return {
        ...s,
        id: s.id,
        name: s.name,
        phone: s.phone,
        country_code: s.country_code || '',
        role: normalizedRole,
        specialization: s.personal_profile?.specialization?.name || s.specialization || '',
        avatar: getFileUrl(s.profile_picture_url) || getFileUrl(s.profile_picture) || getFileUrl(s.avatar) || getFileUrl(s.personal_profile?.profile_picture_url) || getFileUrl(s.personal_profile?.profile_picture) || '',
      };
    });

    const filtered = mapped.filter(
      (s: any) => s.role === "doctor" || s.role === "admin"
    );

    if (filtered.length === 0 && !debouncedDoctorSearch) {
      return (doctors || []);
    }
    return filtered;
  }, [apiStaffData, doctors, debouncedDoctorSearch]);

  const { confirmDelete } = useModal();
  const createProcedureMutation = useCreateProcedureMutation();
  const updateProcedureMutation = useUpdateProcedureMutation();
  const deleteProcedureMutation = useDeleteProcedureMutation();

  const getRawProceduresList = (raw: any): any[] => {
    if (!raw) return [];
    const target = raw.responseObject !== undefined ? raw.responseObject : raw;
    if (Array.isArray(target)) return target;
    if (target && typeof target === "object") {
      if (Array.isArray(target.data?.data)) return target.data.data;
      if (Array.isArray(target.data)) return target.data;
      if (Array.isArray(target.procedures)) return target.procedures;
    }
    return [];
  };

  const handleCreateProcedure = async (newProcedureName: string) => {
    try {
      const created = await createProcedureMutation.mutateAsync({ name: newProcedureName });
      return created?.name || newProcedureName;
    } catch (error) {
      // handled
    }
  };

  const handleUpdateProcedure = async (oldName: string, newName: string) => {
    try {
      const rawList = getRawProceduresList(rawProceduresData);
      const matched = rawList.find((p: any) => p.name === oldName);
      if (matched?.id) {
        await updateProcedureMutation.mutateAsync({ id: matched.id, name: newName });
      }
    } catch (error) {
      // handled
    }
  };

  const handleDeleteProcedure = async (name: string) => {
    confirmDelete(
      "Delete Procedure",
      `Are you sure you want to delete procedure "${name}"?`,
      async () => {
        try {
          const rawList = getRawProceduresList(rawProceduresData);
          const matched = rawList.find((p: any) => p.name === name);
          if (matched?.id) {
            await deleteProcedureMutation.mutateAsync({ id: matched.id });
          }
        } catch (error) {
          // handled
        }
      }
    );
  };

  const {
    form,
    formData,
    prescriptions,
    treatmentSessions,
    pendingPlans,
    handleProcedureChange,
    handleLoadPlan,
    updateSession,
    addSession,
    removeSession,
    updatePrescription,
    addPrescription,
    removePrescription,
    handleSubmit,
  } = useTreatmentForm(treatment, allPatients, allTreatments);

  const [procedureSearch, setProcedureSearch] = React.useState("");
  const debouncedProcedureSearch = useDebounce(procedureSearch, 300);

  const effectivePatientId = formData.patientId && !formData.patientId.startsWith("WALK-") ? formData.patientId : undefined;

  const { data: rawProceduresData, isLoading: isProceduresLoading, isError: isProceduresError } = useProcedureQuery({
    all: true,
    patient_id: effectivePatientId,
    search: debouncedProcedureSearch || undefined
  });

  const apiProcedures = React.useMemo(() => {
    if (isProceduresLoading) {
      return [{ label: "Loading procedures...", value: "", disabled: true }];
    }
    if (isProceduresError) {
      return [{ label: "Error loading procedures", value: "", disabled: true }];
    }

    const rawList = getRawProceduresList(rawProceduresData);
    return rawList.map((proc: any) => ({
      label: proc.name,
      value: proc.name,
      is_free: proc.is_free,
      isFree: proc.is_free || proc.isFree,
      from_plan_benefit: proc.from_plan_benefit || proc.fromPlanBenefit,
    }));
  }, [rawProceduresData, isProceduresLoading, isProceduresError]);

  // Complete Session Modal states
  const completeSessionMutation = useCompleteTreatmentSessionMutation();
  const addSessionMutation = useAddTreatmentSessionMutation();

  const [completingSession, setCompletingSession] = React.useState<any | null>(null);
  const [completeForm, setCompleteForm] = React.useState({
    work_done: "",
    session_findings: "",
    discount_type: "" as "" | "PERCENTAGE" | "FLAT",
    discount_value: 0,
    paid_amount: 0,
    create_invoice: false,
  });
  const [scheduleNext, setScheduleNext] = React.useState(false);
  const [nextSessionDraft, setNextSessionDraft] = React.useState({
    date: "",
    time: "09:00 AM",
    duration: 45,
    cost: 0,
    clinical_objectives: "",
  });
  const [sessionAttachments, setSessionAttachments] = React.useState<File[]>([]);

  const handleOpenCompleteSession = (session: any) => {
    // Find previous completed sessions in treatmentSessions
    const completedList = treatmentSessions.filter(s => s.status === "completed" || s.status === "COMPLETED");
    const lastCompleted = completedList.length > 0 ? completedList[completedList.length - 1] : null;

    const fallbackFee = lastCompleted ? (Number(lastCompleted.session_fee || lastCompleted.cost) || 0) : 0;
    const fallbackDiscount = lastCompleted ? (Number((lastCompleted as any).discount_percentage || (lastCompleted as any).discount) || 0) : 0;
    const fallbackPaid = lastCompleted ? (Number(lastCompleted.paid_amount) || 0) : 0;

    const currentFee = Number(session.session_fee || session.cost) || fallbackFee;
    const planDiscount = Number(formData.discount_value) || 0;
    const currentDiscount = planDiscount || fallbackDiscount || 0;
    const currentPaid = Number(session.paid_amount || (session as any).paidAmount) || (currentFee - (currentFee * currentDiscount) / 100);

    setCompleteForm({
      work_done: session.work_done || session.workDone || "",
      session_findings: session.session_findings || session.findings || "",
      discount_type: currentDiscount > 0 ? "PERCENTAGE" : "",
      discount_value: currentDiscount,
      paid_amount: currentPaid,
    });
    setSessionAttachments([]);
    setScheduleNext(false);
    setNextSessionDraft({
      date: getLocalDateString(),
      time: "09:00 AM",
      duration: 45,
      cost: currentFee,
      clinical_objectives: "",
    });
    setCompletingSession(session);
  };

  const handleSaveCompletedSession = async () => {
    if (!completingSession) return;
    
    // If it's a saved treatment plan on the backend, trigger API call
    if (treatment?.id && !String(completingSession.id).startsWith("session-")) {
      // try/catch block handles async API failures and date parsing errors,
      // preventing unhandled promise rejections/app crashes while providing
      // user-facing toast error notifications without using console logs.
      try {
        const nextSessionPayload = (scheduleNext && nextSessionDraft.date)
          ? {
              schedule_next_session: true,
              next_visit_date: nextSessionDraft.date,
              next_start_time: nextSessionDraft.time || "10:00 AM",
              next_duration_min: Number(nextSessionDraft.duration) || 60,
              next_clinical_objectives: nextSessionDraft.clinical_objectives || "",
            }
          : {
              schedule_next_session: false,
            };

        await completeSessionMutation.mutateAsync({
          planId: treatment.id,
          sessionId: completingSession.id,
          work_done: completeForm.work_done,
          session_findings: completeForm.session_findings,
          paid_amount: completeForm.paid_amount,
          create_invoice: completeForm.create_invoice,
          discount_type: completeForm.discount_type || null,
          discount_value: completeForm.discount_value || 0,
          ...nextSessionPayload,
          attachments: sessionAttachments.length > 0 ? sessionAttachments : undefined,
        });
      } catch (err: any) {
        // Catch backend API errors & display user-friendly UI error toast without console logs
        const msg = err?.response?.data?.responseStatusList?.statusList?.[0]?.statusDesc ||
                    err?.response?.data?.message ||
                    err?.message || 
                    "Failed to complete session on backend";
        toast.error(msg);
      }
    }

    // Always update the session in the local treatmentForm state
    updateSession(completingSession.id, {
      status: "completed",
      workDone: completeForm.work_done,
      work_done: completeForm.work_done,
      findings: completeForm.session_findings,
      session_findings: completeForm.session_findings,
      paid_amount: completeForm.paid_amount,
    });

    // If next session was scheduled locally, add it to the local treatmentSessions list
    if (scheduleNext && nextSessionDraft.date) {
      const newSessionNumber = treatmentSessions.length + 1;
      const newSess = {
        id: `session-${Date.now()}-${Math.random()}`,
        sessionNumber: newSessionNumber,
        name: `Session ${newSessionNumber}`,
        description: nextSessionDraft.clinical_objectives || "Next session",
        suggestedDate: nextSessionDraft.date,
        scheduledDate: nextSessionDraft.date,
        duration: nextSessionDraft.duration,
        status: "scheduled",
        isFlexible: true,
        isRequired: false,
        isOptional: true,
        cost: nextSessionDraft.cost,
        session_fee: nextSessionDraft.cost,
        isModified: true,
        notes: nextSessionDraft.clinical_objectives,
        clinical_objectives: nextSessionDraft.clinical_objectives,
      };
      
      // Update form sessions value
      form.setValue("sessions", [...treatmentSessions, newSess] as any);
    }

    setCompletingSession(null);
  };

  const handleSessionAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSessionAttachments((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeSessionAttachment = (index: number) => {
    setSessionAttachments((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    let val: any = value;
    if (name === "cost" || name === "discount_value") {
      val = value === "" ? "" : Number(value);
      if (typeof val === "number" && isNaN(val)) {
        val = 0;
      }
    }
    form.setValue(name as keyof typeof formData, val as any, {
      shouldValidate: true,
    });

    if (name === "patientName") {
      const patient = apiPatients.find(
        (p: any) => (p.name || p.full_name || p) === value
      );
      if (patient && typeof patient === "object") {
        form.setValue("patientId", patient.id);
      }
    }

    if (name === "procedure") {
      handleProcedureChange(value);
      const selectedProc = apiProcedures.find((p) => p.value === value);
      if (selectedProc?.isFree || selectedProc?.is_free) {
        form.setValue("cost", 0);
        form.setValue("discount_value", 0);
      }
    }
  };

  const [isSaving, setIsSaving] = React.useState(false);

  const handleSaveForm = async (formDataVal: any) => {
    const submitData = {
      ...formDataVal,
      id: treatment?.id,
      prescriptions: prescriptions
        .filter((p) => p.medicine?.trim() !== "")
        .map((p) => {
          const { id, ...rest } = p;
          if (id && id.length === 36 && id.includes("-")) {
            return { id, ...rest };
          }
          return rest;
        }),
      sessions: treatmentSessions.map((s) => {
        const { id, ...rest } = s;
        if (id && id.length === 36 && id.includes("-")) {
          return { id, ...rest };
        }
        return rest;
      }),
      cost: parseFloat(String(formDataVal.cost)),
    };

    setIsSaving(true);
    try {
      await onSave(submitData);
    } catch (error: any) {
      const msg = error?.response?.data?.responseStatusList?.statusList?.[0]?.statusDesc ||
                  error?.responseStatusList?.statusList?.[0]?.statusDesc ||
                  error?.response?.data?.message ||
                  error?.message ||
                  "Failed to save treatment plan";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      title={treatment ? "Edit Treatment Plan" : "Create Treatment Plan"}
      onClose={onClose}
      size="5xl"
      icon={<Stethoscope className="w-4 h-4" />}
      footer={
        <div className="flex justify-between items-center w-full px-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(handleSaveForm)}
            disabled={isSaving}
            className="gap-2 shadow-lg shadow-primary/10"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Treatment Plan
          </Button>
        </div>
      }
    >
      <form className="space-y-8 py-2">
        <div className="bg-muted/30 p-6 rounded-2xl border border-border">
          <BasicInfoSection
            formData={formData}
            handleChange={handleChange}
            doctorError={form.formState.errors.doctorId?.message}
            allPatients={apiPatients}
            doctors={apiDoctors}
            procedures={apiProcedures}
            teeth={teeth}
            pendingPlans={pendingPlans}
            onLoadPlan={handleLoadPlan}
            isEdit={!!treatment}
            onPatientSearch={setPatientSearch}
            onDoctorSearch={setDoctorSearch}
            onProcedureSearch={setProcedureSearch}
            onCreateProcedure={handleCreateProcedure}
            isCreatingProcedure={createProcedureMutation.isPending}
            onDeleteProcedure={handleDeleteProcedure}
            onEditProcedure={handleUpdateProcedure}
          />
        </div>

        <div className="h-px bg-border/50" />

        <div className="bg-muted/30 p-6 rounded-2xl border border-border">
          <SessionPlannerSection
            sessions={treatmentSessions}
            onAddSession={addSession}
            onRemoveSession={removeSession}
            onUpdateSession={updateSession}
            baseDate={formData.date}
            onCompleteSessionTrigger={handleOpenCompleteSession}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="bg-muted/30 p-6 rounded-2xl border border-border h-full">
            <PrescriptionSection
              prescriptions={prescriptions}
              onAddPrescription={addPrescription}
              onRemovePrescription={removePrescription}
              onUpdatePrescription={updatePrescription}
            />
          </div>
          <div className="bg-muted/30 p-6 rounded-2xl border border-border h-full">
            <Label className="text-xs font-black text-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              Clinical Case Notes
            </Label>
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium resize-none"
              placeholder="Enter detailed treatment observations, history, and special instructions..."
            />
          </div>
        </div>

        <ImageUploadSection
          images={formData.images}
          onUpload={(e) => {
            const files = Array.from(e.target.files || []);
            const urls = files.map((f) => URL.createObjectURL(f));
            form.setValue("images", [...(formData.images || []), ...urls]);

            const currentFiles = form.getValues("rawFiles") || [];
            form.setValue("rawFiles", [...currentFiles, ...files]);
          }}
          onRemove={(index) => {
            const urlToRemove = formData.images[index];
            const updatedPreviews = formData.images.filter((_, i) => i !== index);
            form.setValue("images", updatedPreviews);

            if (urlToRemove && urlToRemove.startsWith("blob:")) {
              let blobIndex = 0;
              for (let i = 0; i < index; i++) {
                if (formData.images[i] && formData.images[i].startsWith("blob:")) {
                  blobIndex++;
                }
              }
              const currentFiles = form.getValues("rawFiles") || [];
              form.setValue("rawFiles", currentFiles.filter((_, i) => i !== blobIndex));
            } else if (urlToRemove) {
              const currentExisting = form.getValues("existingImages") || [];
              form.setValue("existingImages", currentExisting.filter((url) => url !== urlToRemove));
            }
          }}
        />
      </form>

      {completingSession && (
        <Modal
          title={`Complete Session ${completingSession.visit_number || completingSession.sessionNumber || ""}`}
          subtitle="Record what was done today"
          onClose={() => setCompletingSession(null)}
          size="5xl"
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          footer={
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setCompletingSession(null);
                  setSessionAttachments([]);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCompletedSession}
                disabled={
                  completeSessionMutation.isPending ||
                  (!completeForm.work_done && !completeForm.session_findings)
                }
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2 text-white"
              >
                {completeSessionMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <CheckCircle className="w-4 h-4" />}
                Complete Session
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-left">
            <div>
              <Label className="text-sm font-semibold block mb-2">Work Done <span className="text-red-500">*</span></Label>
              <Textarea rows={3} placeholder="Describe the procedures performed..." value={completeForm.work_done}
                onChange={(e) => setCompleteForm(p => ({ ...p, work_done: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none resize-none" />
            </div>
            <div>
              <Label className="text-sm font-semibold block mb-2">Clinical Findings <span className="text-red-500">*</span></Label>
              <Textarea rows={3} placeholder="Observations, measurements, patient response..." value={completeForm.session_findings}
                onChange={(e) => setCompleteForm(p => ({ ...p, session_findings: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
              <div>
                <Label className="text-sm font-semibold block mb-2">Discount Type</Label>
                <select
                  value={completeForm.discount_type || ""}
                  onChange={(e) => setCompleteForm(p => ({ ...p, discount_type: e.target.value as any, discount_value: 0 }))}
                  className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none font-semibold bg-white text-sm h-10"
                >
                  <option value="">No Discount</option>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (₹)</option>
                </select>
              </div>
              {completeForm.discount_type && (
                <div>
                  <Label className="text-sm font-semibold block mb-2">
                    {completeForm.discount_type === "PERCENTAGE" ? "Discount (%)" : "Discount Amount (₹)"}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max={completeForm.discount_type === "PERCENTAGE" ? 100 : undefined}
                    placeholder={completeForm.discount_type === "PERCENTAGE" ? "e.g. 10" : "e.g. 500"}
                    value={completeForm.discount_value || ""}
                    onChange={(e) => setCompleteForm(p => ({ ...p, discount_value: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none font-semibold bg-white"
                  />
                </div>
              )}
              <div>
                <Label className="text-sm font-semibold block mb-2">Paid Amount (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Amount paid at this visit"
                  value={completeForm.paid_amount || ""}
                  onChange={(e) => setCompleteForm(p => ({ ...p, paid_amount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none font-semibold text-emerald-700 bg-emerald-50/30"
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="create-invoice"
                  checked={completeForm.create_invoice || false}
                  onChange={(e) => setCompleteForm(p => ({ ...p, create_invoice: e.target.checked }))}
                  className="w-4 h-4 text-emerald-600 border-border rounded focus:ring-emerald-500 cursor-pointer"
                />
                <Label htmlFor="create-invoice" className="text-sm font-bold text-foreground cursor-pointer">
                  Create Invoice for this Session
                </Label>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="schedule-next-session"
                  checked={scheduleNext}
                  onChange={(e) => setScheduleNext(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-border rounded focus:ring-emerald-500 cursor-pointer"
                />
                <Label htmlFor="schedule-next-session" className="text-sm font-bold text-muted-foreground cursor-pointer">
                  Schedule Next Session (Optional)
                </Label>
              </div>

              {scheduleNext && (
                <div className="bg-muted/30 p-4 rounded-2xl border border-border space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs font-semibold block mb-2">Next Session Date</Label>
                      <Input
                        type="date"
                        min={(() => {
                          const today = new Date();
                          const year = today.getFullYear();
                          const month = String(today.getMonth() + 1).padStart(2, "0");
                          const day = String(today.getDate()).padStart(2, "0");
                          return `${year}-${month}-${day}`;
                        })()}
                        value={nextSessionDraft.date}
                        onChange={(e) => setNextSessionDraft(p => ({ ...p, date: e.target.value }))}
                        className="w-full !inline-flex items-center justify-between px-3 py-1.5 text-sm rounded-xl border focus:ring-2 focus:ring-emerald-200 bg-white font-medium cursor-pointer [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold block mb-2">Time</Label>
                      <Select
                        value={nextSessionDraft.time || "10:00 AM"}
                        onValueChange={(val) => setNextSessionDraft(p => ({ ...p, time: val }))}
                      >
                        <SelectTrigger className="w-full px-3 py-1.5 text-sm rounded-xl border focus:ring-2 focus:ring-emerald-200 bg-white font-medium">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
                            "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
                            "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
                            "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
                            "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
                            "07:00 PM", "07:30 PM", "08:00 PM"
                          ].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold block mb-2">Duration (Min)</Label>
                      <Select
                        value={String(nextSessionDraft.duration || 45)}
                        onValueChange={(val) => setNextSessionDraft(p => ({ ...p, duration: parseInt(val) || 45 }))}
                      >
                        <SelectTrigger className="w-full px-3 py-1.5 text-sm rounded-xl border focus:ring-2 focus:ring-emerald-200 bg-white font-medium">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {[15, 30, 45, 60, 90, 120].map((d) => (
                            <SelectItem key={d} value={d.toString()}>{d} minutes</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold block mb-2">Session Fee (₹)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={nextSessionDraft.cost}
                        onChange={(e) => setNextSessionDraft(p => ({ ...p, cost: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-1.5 text-sm rounded-xl border focus:ring-2 focus:ring-emerald-200 bg-white font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold block mb-2">Clinical Objectives / Next Session Plan</Label>
                    <Textarea
                      rows={2}
                      placeholder="Next session targets..."
                      value={nextSessionDraft.clinical_objectives}
                      onChange={(e) => setNextSessionDraft(p => ({ ...p, clinical_objectives: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-200 bg-white resize-none font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-emerald-600" />
                <Label className="text-sm font-semibold">Attachments</Label>
              </div>
              <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-4">
                <Input
                  id="form-session-attachments"
                  type="file"
                  multiple
                  onChange={handleSessionAttachmentUpload}
                  className="hidden"
                />
                <Label
                  htmlFor="form-session-attachments"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-white px-4 py-5 text-center transition-colors hover:bg-emerald-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Upload files</p>
                    <p className="text-xs text-muted-foreground">
                      Select one or more files to attach with this completed session
                    </p>
                  </div>
                </Label>

                {sessionAttachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {sessionAttachments.map((file, idx) => (
                      <div
                        key={`${file.name}-${idx}`}
                        className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white px-3 py-2"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{file.name}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeSessionAttachment(idx)}
                          className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
