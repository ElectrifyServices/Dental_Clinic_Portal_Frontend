import React from "react";
import { Stethoscope, IndianRupee } from "lucide-react";
import { Input } from "@/components/ui/Input";

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
}

export const TreatmentFields: React.FC<TreatmentFieldsProps> = ({
  treatment,
  treatmentType,
  fee,
  patientConcern,
  notes,
  appointmentTypes,
  onChange,
}) => {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
          <Stethoscope className="w-4 h-4 text-primary" />
        </div>
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
          Treatment Details
        </h4>
        <div className="flex-1 h-px bg-muted ml-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
            Treatment Type
          </label>
          <select
            name="treatmentType"
            value={treatmentType}
            onChange={onChange}
            className="w-full h-11 px-3 text-sm border border-border rounded-xl bg-muted/50 focus:bg-card focus:ring-2 focus:ring-primary/20 outline-none font-medium"
          >
            <option value="">General Consultation</option>
            {appointmentTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
