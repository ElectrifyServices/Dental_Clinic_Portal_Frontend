import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import React from "react";
import { Save, Stethoscope } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { procedures, teeth } from "@/constants/treatment.constants";
import type { TreatmentFormProps } from "@/types/treatment.types";
import { useTreatmentForm } from "@/hooks/treatment/useTreatmentForm";
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
            allPatients={allPatients}
            doctors={doctors}
            procedures={procedures}
            teeth={teeth}
            pendingPlans={pendingPlans}
            onLoadPlan={handleLoadPlan}
            isEdit={!!treatment}
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
            form.setValue("images", [...formData.images, ...urls]);
          }}
          onRemove={(index) =>
            form.setValue(
              "images",
              formData.images.filter((_, i) => i !== index)
            )
          }
        />
      </form>
    </Modal>
  );
}