import React, { useState } from "react";
import { Save, Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import { usePatientForm } from "./PatientForm/usePatientForm";
import { Step1BasicInfo } from "./PatientForm/Step1BasicInfo";
import { Step2MedicalHistory } from "./PatientForm/Step2MedicalHistory";
import { Step3Consent } from "./PatientForm/Step3Consent";
import { Step4Review } from "./PatientForm/Step4Review";
import { PatientData } from "@/types";
import { useCorporatePlansQuery } from "@/hooks/corporate/useCorporatePlansQuery";
import { Button, Modal } from "@/components/ui";

interface PatientFormProps {
  onClose: () => void;
  onSave: (patient: any) => void;
  patient?: any;
  type?: "normal" | "person";
  parentId?: string;
  isCheckIn?: boolean;
  corporateEmployees?: any[];
  corporatePlans?: any[];
}

export function PatientForm({
  onClose,
  onSave,
  patient,
  type,
  parentId,
  isCheckIn,
  corporateEmployees = [],
  corporatePlans = [],
}: PatientFormProps) {
  const {
    formData,
    setFormData,
    loading,
    setLoading,
    validationErrors,
    matchedCorporateEmp,
    handleChange,
    handleNext,
    handlePrevious,
    applyCustomRelation,
    handleCustomRelation,
    handleImageUpload,
    handleDentalFilesUpload,
  } = usePatientForm(patient, corporateEmployees);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Fetch corporate plans when adding/editing patient
  useCorporatePlansQuery({ enabled: true });

  const [step, setStep] = useState(1);
  const [medicalSearch, setMedicalSearch] = useState("");
  const [allergySearch, setAllergySearch] = useState("");
  const [selectedMedicalHistory, setSelectedMedicalHistory] = useState<
    string[]
  >(patient?.medicalHistory || []);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(
    patient?.allergies || [],
  );
  const [showOtherTreatment, setShowOtherTreatment] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 4 || loading) return;
    setLoading(true);

    try {
      // Pass the raw formData to onSave; the consumer (ModalRegistry → handleSavePatient)
      // is responsible for mapping fields to the API payload via mapFormDataToCreatePayload.
      // We preserve the `id` field so callers can distinguish create vs. update.
      await onSave({
        ...formData,
        // Keep id from existing patient for edit mode; undefined for new patients
        id: patient?.id ?? undefined,
        parentId: type === "person" ? parentId : undefined,
      });
    } catch (err) {
      console.error("Patient save failed", err);
      setFormErrors({ submit: "Failed to save patient. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const getStepIndicator = (stepNumber: number) => {
    if (stepNumber < step) {
      return <CheckCircle className="w-6 h-6 text-primary" />;
    } else if (stepNumber === step) {
      return (
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">
          {stepNumber}
        </div>
      );
    } else {
      return (
        <div className="w-6 h-6 bg-secondary text-primary/40 rounded-full flex items-center justify-center font-bold text-xs">
          {stepNumber}
        </div>
      );
    }
  };

  return (
    <Modal
      title={
        patient && patient.id
          ? "Edit Patient Information"
          : "New Patient Registration"
      }
      subtitle="Complete patient registration"
      onClose={onClose}
      size="5xl"
      icon={<Calendar className="w-5 h-5" />}
      footer={
        <div className="flex justify-between items-center w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={step === 1 ? onClose : () => handlePrevious(step, setStep)}
            className="text-muted-foreground"
          >
            {step === 1 ? "Cancel" : "Previous Step"}
          </Button>

          <div className="flex gap-3">
            {step < 4 ? (
              <Button
                type="button"
                onClick={() => handleNext(step, setStep)}
                className="px-8 shadow-md"
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                variant="default"
                onClick={handleSubmit}
                className="px-10 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Confirm & Save
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-8">
        <div className="flex items-center gap-12 pb-6 border-b border-border">
          {[
            { num: 1, label: "Basic Info" },
            { num: 2, label: "Medical History" },
            { num: 3, label: "Consent" },
            { num: 4, label: "Review" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-3 relative">
              {getStepIndicator(s.num)}
              <span
                className={`text-xs font-bold uppercase tracking-widest ${step === s.num ? "text-primary" : "text-muted-foreground/60"}`}
              >
                {s.label}
              </span>
              {s.num < 4 && (
                <div
                  className={`absolute -right-8 w-4 h-0.5 ${step > s.num ? "bg-primary" : "bg-muted"}`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <Step1BasicInfo
              formData={formData}
              handleChange={handleChange}
              setFormData={setFormData}
              validationErrors={validationErrors}
              matchedCorporateEmp={matchedCorporateEmp}
              corporatePlans={corporatePlans}
              type={type}
              handleCustomRelation={handleCustomRelation}
              applyCustomRelation={applyCustomRelation}
              handleImageUpload={handleImageUpload}
            />
          )}
          {step === 2 && (
            <Step2MedicalHistory
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              matchedCorporateEmp={matchedCorporateEmp}
              corporatePlans={corporatePlans}
              medicalSearch={medicalSearch}
              setMedicalSearch={setMedicalSearch}
              selectedMedicalHistory={selectedMedicalHistory}
              setSelectedMedicalHistory={setSelectedMedicalHistory}
              allergySearch={allergySearch}
              setAllergySearch={setAllergySearch}
              selectedAllergies={selectedAllergies}
              setSelectedAllergies={setSelectedAllergies}
              handleDentalFilesUpload={handleDentalFilesUpload}
              showOtherTreatment={showOtherTreatment}
              setShowOtherTreatment={setShowOtherTreatment}
            />
          )}
          {step === 3 && (
            <Step3Consent
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
            />
          )}
          {step === 4 && (
            <Step4Review formData={formData} isCheckIn={isCheckIn} />
          )}
        </form>

        {Object.keys(validationErrors).length > 0 && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive font-medium">
              Please fill all required fields before proceeding.
            </p>
          </div>
        )}

        {formErrors.submit && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive font-medium">
              {formErrors.submit}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
