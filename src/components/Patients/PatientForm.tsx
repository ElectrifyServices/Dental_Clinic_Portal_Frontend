import React, { useState } from "react";
import { Save, Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import { usePatientForm } from "./PatientForm/usePatientForm";
import { Step1BasicInfo } from "./PatientForm/Step1BasicInfo";
import { Step2MedicalHistory } from "./PatientForm/Step2MedicalHistory";
import { Step3Consent } from "./PatientForm/Step3Consent";
import { Step4Review } from "./PatientForm/Step4Review";
import { PatientData } from "@/types";
import { useCorporatePlansQuery } from "@/hooks/corporate/useCorporatePlansQuery";
import { useMedicalHistoriesQuery } from "@/hooks/patients/useMedicalHistoriesQuery";
import { useAllergiesQuery } from "@/hooks/patients/useAllergiesQuery";
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
    acceptCorporateEmployee,
    handleChange,
    handleNext,
    handlePrevious,
    applyCustomRelation,
    handleCustomRelation,
    handleImageUpload,
    handleConsentFormUpload,
    handleDentalFilesUpload,
  } = usePatientForm(patient);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Fetch and refetch corporate plans, medical history, and allergies on mount
  const { refetch: refetchCorporatePlans } = useCorporatePlansQuery({ enabled: true, staleTime: 0 });
  const { refetch: refetchMedicalHistories } = useMedicalHistoriesQuery({ enabled: true, staleTime: 0 });
  const { refetch: refetchAllergies } = useAllergiesQuery({ enabled: true, staleTime: 0 });

  React.useEffect(() => {
    refetchCorporatePlans();
    refetchMedicalHistories();
    refetchAllergies();
  }, [refetchCorporatePlans, refetchMedicalHistories, refetchAllergies]);

  const [step, setStep] = useState(1);
  const [medicalSearch, setMedicalSearch] = useState("");
  const [allergySearch, setAllergySearch] = useState("");
  const extractIds = (field: any, idKeys: string[]) => {
    if (!field) return [];
    if (typeof field === "string") return field.split('\n').filter(Boolean);
    if (Array.isArray(field)) {
      return field.map((item: any) => {
        if (typeof item === "object" && item !== null) {
          for (const key of idKeys) {
            if (item[key]) return item[key];
          }
          return "";
        }
        return String(item);
      }).filter(Boolean);
    }
    return [];
  };

  const [selectedMedicalHistory, setSelectedMedicalHistory] = useState<string[]>(
    extractIds(patient?.medicalHistories || patient?.medical_histories || patient?.medicalHistory, ['history_id', 'medical_history_id', 'id', 'name'])
  );
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(
    extractIds(patient?.allergies, ['allergy_id', 'id', 'allergy_name', 'name'])
  );

  React.useEffect(() => {
    if (patient) {
      setSelectedMedicalHistory(
        extractIds(patient.medicalHistories || patient.medical_histories || patient.medicalHistory, ['history_id', 'medical_history_id', 'id', 'name'])
      );
      setSelectedAllergies(
        extractIds(patient.allergies, ['allergy_id', 'id', 'allergy_name', 'name'])
      );
    }
  }, [patient]);



  const requiredErrors: string[] = [];
  if (!formData.name?.trim()) {
    requiredErrors.push("Patient Name");
  } else if (formData.name.trim().length < 2) {
    requiredErrors.push("Patient Name (minimum 2 characters)");
  }
  if (!formData.phone?.trim()) {
    requiredErrors.push("Phone Number");
  }
  if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
    requiredErrors.push("Valid Email Address");
  }

  const isFormInvalid = requiredErrors.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 4 || loading || isFormInvalid) return;
    setLoading(true);

    try {
      // Pass the raw formData to onSave; the consumer (ModalRegistry → handleSavePatient)
      // is responsible for mapping fields to the API payload via mapFormDataToCreatePayload.
      // We preserve the `id` field so callers can distinguish create vs. update.
      await onSave({
        ...formData,
        // Keep id from existing patient for edit mode; undefined for new patients
        id: patient?.id ?? undefined,
        parentId: type === "person" ? parentId : (patient?.primary_patient_id || patient?.primaryPatientId || patient?.parentId || undefined),
      });
    } catch (err) {
      setFormErrors({ submit: "Failed to save patient. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const getStepIndicator = (stepNumber: number) => {
    if (stepNumber < step) {
      return <CheckCircle className="w-6 h-6 text-emerald-500" />;
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
            variant="outline"
            onClick={step === 1 ? onClose : () => handlePrevious(step, setStep)}
            className="text-foreground border-gray-300 bg-white hover:bg-muted/50 shadow-sm font-bold"
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
                disabled={loading || isFormInvalid}
                variant="default"
                onClick={handleSubmit}
                className="px-10 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-border px-2">
          {[
            { num: 1, label: "Basic Info" },
            { num: 2, label: "Medical History" },
            { num: 3, label: "Consent" },
            { num: 4, label: "Review" },
          ].map((s, i, arr) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <React.Fragment key={s.num}>
                <div 
                  className="flex items-center gap-2 shrink-0 cursor-pointer hover:opacity-85 transition-opacity duration-200"
                  onClick={() => setStep(s.num)}
                >
                  {getStepIndicator(s.num)}
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest hidden sm:inline-block ${isActive ? "text-primary" : isDone ? "text-emerald-600" : "text-muted-foreground/60"}`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] rounded-full mx-4 transition-all duration-300 ${isDone ? "bg-emerald-500" : "bg-gray-200"}`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <Step1BasicInfo
              formData={formData}
              handleChange={handleChange}
              setFormData={setFormData}
              validationErrors={validationErrors}
              matchedCorporateEmp={matchedCorporateEmp}
              acceptCorporateEmployee={acceptCorporateEmployee}
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
              validationErrors={validationErrors}
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
            />
          )}
          {step === 3 && (
            <Step3Consent
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              handleConsentFormUpload={handleConsentFormUpload}
            />
          )}
          {step === 4 && (
            <Step4Review formData={formData} isCheckIn={isCheckIn} corporatePlans={corporatePlans} />
          )}
        </form>

        {isFormInvalid && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-3 text-amber-800 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 animate-pulse" />
              <span>Missing Required Fields:</span>
            </div>
            <ul className="list-disc pl-8 text-xs text-amber-700 font-semibold space-y-1">
              {requiredErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
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
