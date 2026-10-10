import type { ApiAny } from "../../../types/api";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import React, { useState, useEffect } from "react";
import { Stethoscope, IndianRupee } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Button } from "@/components/ui/Button";
import { sanitizeNumericString } from "@/utils/inputUtils";

const TREATMENT_OPTIONS = [
  "Consultation / Check-up",
  "follow up visit",
  "X-ray review",
  "Teeth Cleaning",
  "Tooth Pain / Emergency",
  "Filling",
  "Root Canal Treatment",
  "Extraction / Wisdom Tooth",
  "Braces / Aligners",
  "Implants",
  "full mouth rehabilitation",
  "Veneers/Cosmetic Dentistry",
  "Child Dentistry",
  "Crown",
  "Denture",
  "Toothache",
  "Swelling / Infection",
  "Broken Tooth",
  "Trauma / Injury",
  "other/ not sure"
];

interface TreatmentFieldsProps {
  treatment: string;
  treatmentType: string;
  fee: number;
  patientConcern: string;
  notes: string;
  appointmentTypes: ApiAny[];
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  onTreatmentTypeChange?: (val: string) => void;
}

export const TreatmentFields: React.FC<TreatmentFieldsProps> = ({
  treatment,
  treatmentType,
  fee,
  patientConcern,
  notes,
  onChange,
  onTreatmentTypeChange,
}) => {
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");

  useEffect(() => {
    if (treatmentType && !TREATMENT_OPTIONS.includes(treatmentType) && !customOptions.includes(treatmentType) && treatmentType !== "other/ not sure") {
      setCustomOptions(prev => [...prev, treatmentType]);
    }
  }, [treatmentType, customOptions]);

  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = sanitizeNumericString(e.target.value);
    if (val === '') {
      val = '0';
    }
    e.target.value = val;
    onChange(e);
  };

  const allOptions = [...TREATMENT_OPTIONS, ...customOptions];
  const isOtherSelected = treatmentType === "other/ not sure";

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-5 h-5 rounded-md bg-secondary flex items-center justify-center">
          <Stethoscope className="w-3 h-3 text-primary" />
        </div>
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">
          Treatment Details
        </h4>
        <div className="flex-1 h-px bg-muted ml-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 sm:gap-2.5">
        <div className="md:col-span-2 space-y-1">
          <Label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider ml-0.5">
            Appointment Type
          </Label>
          {isOtherSelected ? (
            <div className="flex gap-1.5">
              <Input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter custom type..."
                className="h-8.5 sm:h-9 flex-1 text-xs rounded-xl bg-muted/40 border-border focus:bg-card font-medium"
                autoFocus
              />
              <Button 
                type="button"
                onClick={() => {
                  const val = customInput.trim();
                  if (val) {
                    setCustomOptions(prev => [...prev, val]);
                    if (onTreatmentTypeChange) {
                      onTreatmentTypeChange(val);
                    } else {
                      onChange({ target: { name: "treatmentType", value: val } } as ApiAny);
                    }
                  }
                }}
                className="h-8.5 px-3 text-xs bg-primary text-primary-foreground rounded-xl"
              >
                Add
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setCustomInput("");
                  if (onTreatmentTypeChange) {
                    onTreatmentTypeChange("");
                  } else {
                    onChange({ target: { name: "treatmentType", value: "" } } as ApiAny);
                  }
                }}
                className="h-8.5 px-2.5 text-xs rounded-xl"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <SearchableSelect
              value={treatmentType}
              onChange={(val: string) => {
                if (val === "other/ not sure") setCustomInput("");
                if (onTreatmentTypeChange) {
                  onTreatmentTypeChange(val);
                } else {
                  onChange({
                    target: { name: "treatmentType", value: val }
                  } as ApiAny);
                }
              }}
              options={allOptions.map(opt => ({ label: opt, value: opt }))}
              placeholder="Select Appointment Type..."
              className="h-8.5 sm:h-9 text-xs px-3 rounded-xl bg-muted/40"
            />
          )}
        </div>
        <div className="md:col-span-2 space-y-1">
          <Label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider ml-0.5">
            Specific Treatment
          </Label>
          <Input
            name="treatment"
            value={treatment}
            onChange={onChange}
            placeholder="e.g. Tooth scaling"
            className="h-8.5 sm:h-9 text-xs rounded-xl bg-muted/40 border-border focus:bg-card font-medium"
          />
        </div>
        <div className="md:col-span-1 space-y-1">
          <Label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider ml-0.5">
            Fee (₹)
          </Label>
          <div className="relative">
            <Input
              type="number"
              name="fee"
              value={fee}
              onChange={handleFeeChange}
              className="h-8.5 sm:h-9 pl-7 text-xs rounded-xl bg-muted/40 border-border focus:bg-card font-bold"
            />
            <IndianRupee className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider ml-0.5">
            Patient Concern
          </Label>
          <Textarea
            name="patientConcern"
            value={patientConcern}
            onChange={onChange}
            required
            rows={2}
            placeholder="Main concern or symptoms..."
            className="w-full p-2.5 text-xs border border-border rounded-xl bg-muted/40 focus:bg-card focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all font-medium"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider ml-0.5">
            Additional Notes
          </Label>
          <Textarea
            name="notes"
            value={notes}
            onChange={onChange}
            rows={2}
            placeholder="Any special instructions..."
            className="w-full p-2.5 text-xs border border-border rounded-xl bg-muted/40 focus:bg-card focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all font-medium"
          />
        </div>
      </div>
    </section>
  );
};
