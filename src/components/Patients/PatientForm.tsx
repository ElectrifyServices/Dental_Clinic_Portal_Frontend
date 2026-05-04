import React, { useState } from 'react';
import { X, Save, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { usePatientForm } from './PatientForm/usePatientForm';
import { Step1BasicInfo } from './PatientForm/Step1BasicInfo';
import { Step2MedicalHistory } from './PatientForm/Step2MedicalHistory';
import { Step3Consent } from './PatientForm/Step3Consent';
import { Step4Review } from './PatientForm/Step4Review';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface PatientFormProps {
  onClose: () => void;
  onSave: (patient: any) => void;
  patient?: any;
  type?: 'normal' | 'person';
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
  corporatePlans = []
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
  } = usePatientForm(patient, corporateEmployees, onSave);

  const [step, setStep] = useState(1);
  const [medicalSearch, setMedicalSearch] = useState('');
  const [allergySearch, setAllergySearch] = useState('');
  const [selectedMedicalHistory, setSelectedMedicalHistory] = useState<string[]>(patient?.medicalHistory || []);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(patient?.allergies || []);
  const [showOtherTreatment, setShowOtherTreatment] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 4 || loading) return;
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSave({
      ...formData,
      id: formData.patientId,
      medicalHistory: formData.medicalHistory.split('\n').filter(item => item.trim()),
      pastDentalHistory: formData.pastDentalHistory,
      allergies: formData.allergies.split('\n').filter(item => item.trim()),
      allergyOther: formData.allergyOther,
      allergyNotes: formData.allergyNotes,
      parentId: type === 'person' ? parentId : undefined,
      lastUpdated: new Date().toISOString(),
    });
    setLoading(false);
  };

  const getStepIndicator = (stepNumber: number) => {
    if (stepNumber < step) {
      return <CheckCircle className="w-6 h-6 text-primary" />;
    } else if (stepNumber === step) {
      return <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">{stepNumber}</div>;
    } else {
      return <div className="w-6 h-6 bg-secondary text-primary/40 rounded-full flex items-center justify-center font-bold text-xs">{stepNumber}</div>;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-4xl">
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="modal-title text-lg">
                {(patient && patient.id) ? 'Edit Patient Information' : 'New Patient Registration'}
              </h2>
              <p className="text-gray-600 mt-1">Complete patient registration</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-12">
            {[
              { num: 1, label: 'Basic Info' },
              { num: 2, label: 'Medical History' },
              { num: 3, label: 'Consent' },
              { num: 4, label: 'Review' }
            ].map(s => (
              <div key={s.num} className="flex items-center gap-3 relative">
                {getStepIndicator(s.num)}
                <span className={`text-xs font-bold uppercase tracking-widest ${step === s.num ? 'text-primary' : 'text-gray-400'}`}>
                  {s.label}
                </span>
                {s.num < 4 && (
                  <div className={`absolute -right-8 w-4 h-0.5 ${step > s.num ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
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
              <Step4Review 
                formData={formData}
                isCheckIn={isCheckIn}
              />
            )}
          </form>

          {Object.keys(validationErrors).length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700 font-medium">Please fill all required fields before proceeding.</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50/80 backdrop-blur-sm border-t border-gray-200 p-6 flex justify-between items-center rounded-b-2xl">
          <Button
            type="button"
            variant="ghost"
            onClick={step === 1 ? onClose : () => handlePrevious(step, setStep)}
            className="text-gray-500"
          >
            {step === 1 ? 'Cancel' : 'Previous Step'}
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
                variant="ternary"
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
      </div>
    </div>
  );
}