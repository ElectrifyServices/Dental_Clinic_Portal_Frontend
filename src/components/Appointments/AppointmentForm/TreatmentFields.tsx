import React from "react";
import { Stethoscope, IndianRupee } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

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
  appointmentTypes: any[];
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
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
          <Stethoscope className="w-4 h-4 text-primary" />
        </div>
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
          Treatment Details
        </h4>
        <div className="flex-1 h-px bg-muted ml-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
            Treatment Type
          </label>
          <SearchableSelect
            value={treatmentType}
            onChange={(val: string) => {
              if (onTreatmentTypeChange) {
                onTreatmentTypeChange(val);
              } else {
                onChange({
                  target: { name: "treatmentType", value: val }
                } as any);
              }
            }}
            options={TREATMENT_OPTIONS.map(opt => ({ label: opt, value: opt }))}
            placeholder="Select Treatment Type..."
          />
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
            Specific Treatment
          </label>
          <Input
            name="treatment"
            value={treatment}
            onChange={onChange}
            placeholder="e.g. Tooth scaling"
            className="h-11 rounded-xl bg-muted/50 border-border focus:bg-card font-medium"
          />
        </div>
        <div className="md:col-span-1 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
            Fee (₹)
          </label>
          <div className="relative">
            <Input
              type="number"
              name="fee"
              value={fee}
              onChange={onChange}
              className="h-11 pl-8 rounded-xl bg-muted/50 border-border focus:bg-card font-bold"
            />
            <IndianRupee className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
            Patient Concern
          </label>
          <textarea
            name="patientConcern"
            value={patientConcern}
            onChange={onChange}
            required
            rows={3}
            placeholder="Main concern or symptoms..."
            className="w-full p-4 text-sm border border-border rounded-2xl bg-muted/50 focus:bg-card focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all font-medium"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={notes}
            onChange={onChange}
            rows={3}
            placeholder="Any special instructions..."
            className="w-full p-4 text-sm border border-border rounded-2xl bg-muted/50 focus:bg-card focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all font-medium"
          />
        </div>
      </div>
    </section>
  );
};
