import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import React from "react";
import { Save, Stethoscope } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { procedures, teeth } from "@/constants/treatment.constants";
import type { TreatmentFormProps } from "@/types/treatment.types";
import { useTreatmentForm } from "@/hooks/treatment/useTreatmentForm";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useDebounce } from "@/hooks/useDebounce";
import { getFileUrl } from "@/services/apiClient";
import { BasicInfoSection } from "./TreatmentForm/BasicInfoSection";
import { SessionPlannerSection } from "./TreatmentForm/SessionPlannerSection";
import { PrescriptionSection } from "./TreatmentForm/PrescriptionSection";
import { ImageUploadSection } from "./TreatmentForm/ImageUploadSection";

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    form.setValue(name as keyof typeof formData, value as any, {
      shouldValidate: true,
    });

    if (name === "patientName") {
      const patient = allPatients.find(
        (p) => (typeof p === "string" ? p : p.name) === value
      );
      form.setValue(
        "patientId",
        typeof patient === "object" ? patient.id : form.getValues("patientId") || ""
      );
    }

    if (name === "procedure") {
      handleProcedureChange(value);
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
            onClick={form.handleSubmit(handleSubmit(onSave))}
            className="gap-2 shadow-lg shadow-primary/10"
          >
            <Save className="w-4 h-4" /> Save Treatment Plan
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
            procedures={procedures}
            teeth={teeth}
            pendingPlans={pendingPlans}
            onLoadPlan={handleLoadPlan}
            isEdit={!!treatment}
            onPatientSearch={setPatientSearch}
            onDoctorSearch={setDoctorSearch}
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
    </Modal>
  );
}
