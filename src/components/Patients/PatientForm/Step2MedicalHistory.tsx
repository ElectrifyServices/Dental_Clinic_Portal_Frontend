import React from 'react';
import { CorporatePlanSelector } from '../../CorporatePlans/CorporatePlanSelector';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { SearchableSelect, Button } from '@/components/ui';
import { AlertTriangle, Heart, History, ShieldCheck, Upload, User, X, Trash2, Plus } from 'lucide-react';
import { useStep2MedicalHistory } from './useStep2MedicalHistory';

interface Step2Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  matchedCorporateEmp: any;
  corporatePlans: any[];
  medicalSearch: string;
  setMedicalSearch: (val: string) => void;
  selectedMedicalHistory: string[];
  setSelectedMedicalHistory: (val: string[]) => void;
  allergySearch: string;
  setAllergySearch: (val: string) => void;
  selectedAllergies: string[];
  setSelectedAllergies: (val: string[]) => void;
  handleDentalFilesUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showOtherTreatment: boolean;
  setShowOtherTreatment: (val: boolean) => void;
}

export const Step2MedicalHistory: React.FC<Step2Props> = ({
  formData,
  setFormData,
  handleChange,
  matchedCorporateEmp,
  corporatePlans,
  selectedMedicalHistory,
  setSelectedMedicalHistory,
  selectedAllergies,
  setSelectedAllergies,
  handleDentalFilesUpload,
  showOtherTreatment,
  setShowOtherTreatment
}) => {
  const {
    medicalHistories,
    allergies,
    handleCreateMedicalHistory,
    handleDeleteMedicalHistory,
    handleCreateAllergy,
    handleDeleteAllergy,
  } = useStep2MedicalHistory({
    selectedMedicalHistory,
    setSelectedMedicalHistory,
    selectedAllergies,
    setSelectedAllergies,
    setFormData,
  });

  return (
    <div className="space-y-4">
      <div className="text-center mb-3">
        <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <Heart className="w-6 h-6 text-destructive" />
        </div>
        <h3 className="text-base font-bold text-foreground leading-none">Medical Information</h3>
        <p className="text-[10px] text-primary/60 mt-1 uppercase font-bold tracking-widest">History & Allergies</p>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 px-1">
          Referred By
        </label>
        <Input
          type="text"
          name="referredBy"
          value={formData.referredBy}
          onChange={handleChange}
          placeholder="Doctor name or referral source"
        />
      </div>

      {(matchedCorporateEmp || formData.category === 'corporate') && (
        <>
          {matchedCorporateEmp ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <p className="text-xs font-bold text-primary uppercase tracking-wide">Corporate Plan (Auto-assigned)</p>
                </div>
                <p className="text-xs text-primary/70 mb-2 font-medium">
                  Plan is automatically assigned from the employee record.
                </p>
                <div className="bg-card rounded-lg px-3 py-2 border border-primary/10 text-sm text-primary font-bold">
                  {formData.corporatePlanName || 'Plan assigned — see details above'}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-secondary bg-secondary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">Corporate Plan</p>
                    <p className="text-xs text-primary/70">Manually assign a corporate plan to this patient.</p>
                  </div>
                </div>
                <CorporatePlanSelector
                  plans={corporatePlans}
                  selectedPlanId={formData.corporatePlanId}
                  memberId={formData.corporateMemberId}
                  onChange={(planId, planName, memberId) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      corporatePlanId: planId,
                      corporatePlanName: planName,
                      corporateMemberId: memberId,
                    }))
                  }
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2">
            <Heart className="w-4 h-4 inline mr-2 text-red-500" />
            Medical History
          </label>
          <div className="space-y-3">
            <SearchableSelect
              isMulti
              value={selectedMedicalHistory}
              onChange={(values: string[]) => {
                setSelectedMedicalHistory(values);
                setFormData((prev: any) => ({ ...prev, medicalHistory: values.join('\n') }));
              }}
              options={medicalHistories.filter((h: any) => h && h.name).map((h: any) => ({ label: h.name, value: h.id || h.name }))}
              placeholder="Select medical conditions..."
              searchPlaceholder="Search conditions..."
              onCreateOption={handleCreateMedicalHistory}
              createLabel="Create condition"
              onDeleteOption={handleDeleteMedicalHistory}
            />
            {selectedMedicalHistory.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedMedicalHistory.map((item) => {
                  const condition = medicalHistories.find((h: any) => (h.id || h.name) === item);
                  const displayName = condition ? condition.name : item;
                  return (
                    <Badge key={item} variant="secondary" className="pl-3 pr-2 py-1 gap-1 border-primary/20 bg-primary/5 text-primary">
                      <span className="truncate max-w-[200px]">{displayName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = selectedMedicalHistory.filter((i) => i !== item);
                          setSelectedMedicalHistory(updated);
                          setFormData((prev: any) => ({ ...prev, medicalHistory: updated.join('\n') }));
                        }}
                        className="ml-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2">
            <AlertTriangle className="w-4 h-4 inline mr-2 text-amber-500" />
            Allergies
          </label>
          <div className="space-y-3">
            <SearchableSelect
              isMulti
              value={selectedAllergies}
              onChange={(values: string[]) => {
                setSelectedAllergies(values);
                setFormData((prev: any) => ({ ...prev, allergies: values.join('\n') }));
              }}
              options={allergies.filter((a: any) => a && (a.allergy_name || a.name)).map((a: any) => {
                const name = a.allergy_name || a.name;
                return { label: name, value: a.id || name };
              })}
              placeholder="Select allergies..."
              searchPlaceholder="Search allergies..."
              onCreateOption={handleCreateAllergy}
              createLabel="Create allergy"
              onDeleteOption={handleDeleteAllergy}
            />
            {selectedAllergies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedAllergies.map((item) => {
                  const allergy = allergies.find((a: any) => (a.id || a.allergy_name || a.name) === item);
                  const displayName = allergy ? (allergy.allergy_name || allergy.name) : item;
                  return (
                    <Badge key={item} variant="secondary" className="pl-3 pr-2 py-1 gap-1 border-destructive/20 bg-destructive/5 text-destructive">
                      <span className="truncate max-w-[200px]">{displayName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = selectedAllergies.filter((i) => i !== item);
                          setSelectedAllergies(updated);
                          setFormData((prev: any) => ({ ...prev, allergies: updated.join('\n') }));
                        }}
                        className="ml-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Past Dental History
            </h3>
          </div>
        </div>
        <textarea
          name="pastDentalHistory"
          value={formData.pastDentalHistory}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-input rounded-md focus:ring-2 focus:ring-primary bg-card text-sm"
          placeholder="Previous dental treatments, issues, or positive/negative experiences"
        />
        <label className="border-2 border-dashed border-input rounded-md p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-all block group">
          <Upload className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2 group-hover:text-primary transition-colors" />
          <p className="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors uppercase tracking-widest">Upload Clinical Images / X-rays</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Select multiple files (JPEG, PNG, DICOM)</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleDentalFilesUpload}
            className="hidden"
          />
        </label>
        {formData.dentalFiles?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.dentalFiles.map((file: any, index: number) => (
              <Badge key={index} variant="secondary" className="pr-1 pl-2 py-1 gap-1 border-primary/10">
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev: any) => ({
                      ...prev,
                      dentalFiles: prev.dentalFiles.filter((_: any, i: number) => i !== index),
                      rawDentalFiles: prev.rawDentalFiles ? prev.rawDentalFiles.filter((_: any, i: number) => i !== index) : []
                    }));
                  }}
                  className="p-0.5 hover:bg-primary/10 rounded-full text-primary"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Previous Dentist / Doctor Details
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1">Previous Doctor Name</label>
            <Input
              type="text"
              name="previousDoctorName"
              value={formData.previousDoctorName}
              onChange={handleChange}
              placeholder="Doctor or Clinic name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1">Clinic Name</label>
            <Input
              type="text"
              name="previousClinicName"
              value={formData.previousClinicName}
              onChange={handleChange}
              placeholder="Clinic Name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1">Doctor Phone</label>
            <Input
              type="tel"
              name="previousDoctorPhone"
              value={formData.previousDoctorPhone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                setFormData((prev: any) => ({ ...prev, previousDoctorPhone: digits }));
              }}
              placeholder="Digits only"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1">Last Visit Date</label>
            <Input
              type="date"
              name="previousLastVisitDate"
              value={formData.previousLastVisitDate}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-1">Clinic Address</label>
          <textarea
            name="previousClinicAddress"
            value={formData.previousClinicAddress}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-2 text-sm border border-input rounded-md focus:ring-2 focus:ring-primary"
            placeholder="Complete Address"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-1">Reason for Previous Treatment</label>
          <Input
            type="text"
            name="previousReason"
            value={formData.previousReason}
            onChange={handleChange}
            placeholder="e.g. Pain, Checkup"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2">Previous Treatments</label>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(['Root Canal', 'Extraction', 'Braces', 'Implant', 'Crown', 'Filling', 'Surgery', ...(formData.previousTreatments || [])])).map((treatment) => (
              <Badge
                key={treatment}
                onClick={() => {
                  const updated = formData.previousTreatments.includes(treatment)
                    ? formData.previousTreatments.filter((t: string) => t !== treatment)
                    : [...formData.previousTreatments, treatment];
                  setFormData((prev: any) => ({ ...prev, previousTreatments: updated }));
                }}
                variant={formData.previousTreatments.includes(treatment) ? "default" : "outline"}
                className="cursor-pointer text-xs"
              >
                {treatment}
              </Badge>
            ))}
            <Badge
              onClick={() => setShowOtherTreatment(!showOtherTreatment)}
              variant={showOtherTreatment ? "default" : "outline"}
              className="cursor-pointer text-xs border-dashed"
            >
              + Other
            </Badge>
          </div>
          {showOtherTreatment && (
            <div className="flex mt-2">
              <Input
                type="text"
                placeholder="Enter other treatment"
                className="rounded-r-none h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val && !formData.previousTreatments.includes(val)) {
                      setFormData((prev: any) => ({ ...prev, previousTreatments: [...prev.previousTreatments, val] }));
                      (e.target as HTMLInputElement).value = '';
                      setShowOtherTreatment(false);
                    }
                  }
                }}
                autoFocus
              />
              <Button
                type="button"
                size="xs"
                className="px-3 bg-primary text-white rounded-l-none rounded-r-md text-[10px] font-bold h-8 hover:bg-primary/95"
                onClick={() => {
                  const input = (document.querySelector('input[placeholder="Enter other treatment"]') as HTMLInputElement);
                  const val = input?.value?.trim();
                  if (val && !formData.previousTreatments.includes(val)) {
                    setFormData((prev: any) => ({ ...prev, previousTreatments: [...prev.previousTreatments, val] }));
                    input.value = '';
                    setShowOtherTreatment(false);
                  }
                }}
              >
                ADD
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-amber-900 mb-1">Important Medical Notice</h4>
          <p className="text-xs text-amber-800 leading-relaxed">
            Please ensure all medical conditions and allergies are accurately recorded.
            This information is critical for safe treatment planning and emergency situations.
          </p>
        </div>
      </div>
    </div>
  );
};
