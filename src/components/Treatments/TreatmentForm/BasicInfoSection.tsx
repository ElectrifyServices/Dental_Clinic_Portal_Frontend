import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import React from "react";
import { Info, AlertCircle, Calendar } from "lucide-react";
import { SearchableSelect } from "@/components/ui";

interface BasicInfoSectionProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  doctorError?: string;
  allPatients: any[];
  doctors: any[];
  procedures: string[];
  teeth: string[];
  pendingPlans: any[];
  onLoadPlan: (plan: any) => void;
  isEdit: boolean;
  onPatientSearch?: (query: string) => void;
  onDoctorSearch?: (query: string) => void;
}

export function BasicInfoSection({
  formData,
  handleChange,
  doctorError,
  allPatients,
  doctors,
  procedures,
  teeth,
  pendingPlans,
  onLoadPlan,
  isEdit,
  onPatientSearch,
  onDoctorSearch,
}: BasicInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <Label className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-primary" />
          Patient Details
        </Label>
        <SearchableSelect
          value={formData.patientName}
          onChange={(val) => {
            const selectedPat = allPatients.find(
              (p) => (typeof p === "string" ? p : p.name) === val
            );
            handleChange({ target: { name: "patientName", value: val } } as any);
            if (selectedPat) {
              handleChange({ target: { name: "patientId", value: selectedPat.id } } as any);
            }
          }}
          options={allPatients.map((p) => {
            const name = typeof p === "string" ? p : p.name;
            return {
              label: name,
              value: name,
              phone: typeof p === "object" ? p.phone : "",
              avatar: typeof p === "object" ? p.avatar : "",
              searchLabel: `${name} ${typeof p === "object" ? p.phone || "" : ""}`
            };
          })}
          onSearchChange={onPatientSearch}
          renderOption={(pat: any) => (
            <div className="flex items-center gap-3 py-1">
              {pat.avatar ? (
                <img
                  src={pat.avatar}
                  alt={pat.label}
                  className="w-8 h-8 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {pat.label.charAt(0)}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-foreground text-xs">{pat.label}</span>
                {pat.phone && (
                  <span className="text-[10px] text-muted-foreground">{pat.phone}</span>
                )}
              </div>
            </div>
          )}
          renderValue={(option: any) => (
            <div className="flex items-center gap-2">
              {option.avatar ? (
                <img
                  src={option.avatar}
                  alt={option.label}
                  className="w-5 h-5 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                  {option.label.charAt(0)}
                </div>
              )}
              <span className="font-bold text-foreground">{option.label}</span>
            </div>
          )}
          placeholder="Select Patient"
          disabled={isEdit}
        />
        {pendingPlans.length > 0 && !isEdit && (
          <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-400">
                  Pending Treatment Plans
                </p>
                {pendingPlans.map((plan) => (
                  <Button
                    key={plan.id}
                    variant="link"
                    size="xs"
                    onClick={() => onLoadPlan(plan)}
                    className="text-xs text-yellow-700 dark:text-yellow-500 hover:text-yellow-800 dark:hover:text-yellow-400 hover:underline block mt-1 p-0 h-auto font-semibold"
                  >
                    {plan.procedure} (₹{plan.cost})
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black text-foreground uppercase tracking-widest">
          Treatment Details
        </Label>
        <SearchableSelect
          value={formData.procedure}
          onChange={(val) => handleChange({ target: { name: "procedure", value: val } } as any)}
          options={procedures.map((proc) => ({ label: proc, value: proc }))}
          placeholder="Select Procedure"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black text-foreground uppercase tracking-widest">
          Tooth / Area
        </Label>
        <SearchableSelect
          value={formData.tooth}
          onChange={(val) => handleChange({ target: { name: "tooth", value: val } } as any)}
          options={teeth.map((tooth) => ({ label: tooth, value: tooth }))}
          placeholder="Select Tooth"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black text-foreground uppercase tracking-widest">
          Start Date
        </Label>
        <div className="relative">
          <Input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full pl-4 pr-10 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm font-semibold h-11 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
          <Calendar className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black text-foreground uppercase tracking-widest">
          Estimated Cost (₹)
        </Label>
        <Input
          type="number"
          name="cost"
          value={formData.cost === 0 ? "" : formData.cost}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm font-semibold h-11"
          placeholder="0"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black text-foreground uppercase tracking-widest">
          Status
        </Label>
        <SearchableSelect
          value={formData.status}
          onChange={(val) => handleChange({ target: { name: "status", value: val } } as any)}
          options={[
            { label: "Planned", value: "planned" },
            { label: "In Progress", value: "in-progress" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" },
          ]}
          placeholder="Select Status"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black text-foreground uppercase tracking-widest">
          Assigned Doctor
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <SearchableSelect
          value={formData.doctorId}
          displayValue={formData.doctorName}
          onChange={(val) => {
            const selectedDoc = doctors.find((d) => d.id === val);
            handleChange({ target: { name: "doctorId", value: val } } as any);
            handleChange({ target: { name: "doctorName", value: selectedDoc ? selectedDoc.name : "" } } as any);
          }}
          options={doctors.map((doc) => ({
            label: doc.name,
            value: doc.id,
            phone: doc.phone,
            avatar: doc.avatar,
            specialization: doc.specialization,
            searchLabel: `${doc.name} ${doc.phone || ""}`
          }))}
          onSearchChange={onDoctorSearch}
          renderOption={(doc: any) => (
            <div className="flex items-center gap-3 py-1">
              {doc.avatar ? (
                <img
                  src={doc.avatar}
                  alt={doc.label}
                  className="w-8 h-8 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {doc.label.charAt(0)}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-foreground text-xs">{doc.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  {doc.specialization ? `${doc.specialization} • ` : ""}{doc.phone || "No phone"}
                </span>
              </div>
            </div>
          )}
          renderValue={(option: any) => (
            <div className="flex items-center gap-2">
              {option.avatar ? (
                <img
                  src={option.avatar}
                  alt={option.label}
                  className="w-5 h-5 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                  {option.label.charAt(0)}
                </div>
              )}
              <span className="font-bold text-foreground">{option.label}</span>
            </div>
          )}
          placeholder="Select Doctor"
        />
        {doctorError && (
          <p className="text-xs font-medium text-red-500 mt-1">{doctorError}</p>
        )}
      </div>
    </div>
  );
}
