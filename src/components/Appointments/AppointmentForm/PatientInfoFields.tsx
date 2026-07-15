import { Label } from "@/components/ui/Label";
import React from "react";
import { User } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface PatientInfoFieldsProps {
  patientName: string;
  patientPhone: string;
  isFollowUp: boolean;
  isConsulted: boolean;
  suggestion: { name: string; phone: string } | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (val: string) => void;
  onAcceptSuggestion: () => void;
  errors?: any;
}

export const PatientInfoFields: React.FC<PatientInfoFieldsProps> = ({
  patientName,
  patientPhone,
  isFollowUp,
  isConsulted,
  suggestion,
  onChange,
  onPhoneChange,
  onAcceptSuggestion,
  errors,
}) => {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
          Patient Information
        </h4>
        <div className="flex-1 h-px bg-muted ml-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
            Patient Name <span className="text-destructive">*</span>
          </Label>
          <Input
            name="patientName"
            value={patientName}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
              onChange(e);
            }}
            required
            disabled={isFollowUp || isConsulted}
            placeholder="Search or enter name"
            className="h-11 rounded-xl bg-muted/50 border-border focus:bg-card"
          />
          {errors?.patientName && (
            <p className="text-[10px] text-destructive font-bold mt-1 ml-1 uppercase tracking-wider">
              {errors.patientName.message}
            </p>
          )}
          {suggestion && (
            <div
              className="mt-2 p-2 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2 cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={onAcceptSuggestion}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-primary">
                  {suggestion.phone}
                </span>
              </div>
              <span className="text-[10px] font-bold text-blue-500 uppercase">
                Auto-fill
              </span>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            name="patientPhone"
            value={patientPhone}
            onChange={(e) => onPhoneChange(e.target.value.replace(/[a-zA-Z]/g, ""))}
            required
            disabled={isFollowUp || isConsulted}
            placeholder="98765 43210"
            className="h-11 rounded-xl bg-muted/50 border-border focus:bg-card"
          />
          {errors?.patientPhone && (
            <p className="text-[10px] text-destructive font-bold mt-1 ml-1 uppercase tracking-wider">
              {errors.patientPhone.message}
            </p>
          )}
        </div>
      </div>
      {isConsulted && (
        <p className="text-[10px] text-amber-600 font-medium ml-1 mt-1 flex items-center gap-1.5 bg-amber-50 p-2 rounded-lg border border-amber-100">
          <span className="bg-amber-600 text-white w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold">
            !
          </span>
          Note: Patient name and phone number cannot be modified after check-in
          has been completed.
        </p>
      )}
    </section>
  );
};
