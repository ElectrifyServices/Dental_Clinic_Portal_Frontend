import { useState, useRef, useEffect } from "react";
import { Award, IndianRupee, GraduationCap, Search, Plus, Check, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { LabeledField, SearchableSelect } from "@/components/ui";
import { useSpecializationsQuery } from "@/hooks/specializations/useSpecializationsQuery";
import { useCreateSpecializationMutation } from "@/hooks/specializations/useCreateSpecializationMutation";
import { useDeleteSpecializationMutation } from "@/hooks/specializations/useDeleteSpecializationMutation";

interface Step4Props {
  formData: any;
  onChange: (e: any) => void;
  errors?: any;
}

const SPECIALIZATIONS = [
  "General Dentistry",
  "Orthodontics",
  "Oral Surgery",
  "Periodontics",
  "Endodontics",
  "Prosthodontics",
  "Pediatric Dentistry",
  "Oral Pathology",
  "Cosmetic Dentistry",
];

export function Step4Professional({ formData, onChange, errors = {} }: Step4Props) {
  const { data: apiSpecs, isLoading: isSpecsLoading } = useSpecializationsQuery();
  const createMutation = useCreateSpecializationMutation();
  const deleteMutation = useDeleteSpecializationMutation();
  const queryClient = useQueryClient();
  const [deletingName, setDeletingName] = useState<string | null>(null);

  let rawSpecs: any[] | null = null;
  if (Array.isArray(apiSpecs)) {
    rawSpecs = apiSpecs;
  } else if (apiSpecs && Array.isArray((apiSpecs as any).specializations)) {
    rawSpecs = (apiSpecs as any).specializations;
  } else if (apiSpecs && (apiSpecs as any).data && Array.isArray((apiSpecs as any).data.specializations)) {
    rawSpecs = (apiSpecs as any).data.specializations;
  } else if (apiSpecs && Array.isArray((apiSpecs as any).data)) {
    rawSpecs = (apiSpecs as any).data;
  }

  const specsList = rawSpecs
    ? rawSpecs.map((s: any) => (typeof s === "string" ? s : s.name || ""))
    : SPECIALIZATIONS;

  const handleCreateSpecialization = async (createdValue: string) => {
    try {
      await createMutation.mutateAsync({
        name: createdValue,
        description: "",
      });

      // Refresh updated list
      await queryClient.invalidateQueries({
        queryKey: ["specializations"],
      });

      // Auto select created specialization
      onChange({
        target: {
          name: "specialization",
          value: createdValue,
        },
      });
    } catch (err) {
      console.error("Failed to create specialization:", err);
    }
  };

  const handleDeleteSpecialization = async (valueName: string) => {
    if (!rawSpecs) return;
    const spec = rawSpecs.find((s: any) => s.name === valueName || s === valueName);
    if (!spec || !spec.id) return; // Cannot delete if there's no ID

    try {
      setDeletingName(valueName);
      await deleteMutation.mutateAsync(spec.id);
      
      await queryClient.invalidateQueries({
        queryKey: ["specializations"],
      });
      
      // If the deleted specialization is currently selected, clear it
      if (formData.specialization === valueName) {
        onChange({
          target: { name: "specialization", value: "" }
        });
      }
    } catch (err) {
      console.error("Failed to delete specialization:", err);
    } finally {
      setDeletingName(null);
    }
  };

  const isDoctor =
    formData.role === "doctor" || formData.role === "admin_doctor";
  const isAdmin = formData.role === "admin";
  const isSupport =
    formData.role === "assistant" || formData.role === "receptionist";

  return (
    <div className="space-y-8 py-4">
      <div className="text-center">
        <h3 className="text-lg font-black text-foreground uppercase tracking-tight">
          Professional Credentials
        </h3>
        <p className="text-xs text-muted-foreground font-medium">
          Configure clinical expertise and financial terms
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isDoctor && (
          <>
            <LabeledField label="Clinical Specialization">
              <SearchableSelect
                value={formData.specialization || ""}
                onChange={(value) => {
                  onChange({
                    target: {
                      name: "specialization",
                      value,
                    },
                  });
                }}
                options={specsList}
                placeholder="Search or select specialization..."
                searchPlaceholder="Search specializations..."
                isLoading={isSpecsLoading}
                onCreateOption={handleCreateSpecialization}
                createLabel="Create specialization"
                isCreating={createMutation.isPending}
                onDeleteOption={handleDeleteSpecialization}
                isDeletingValue={deletingName}
              />
            </LabeledField>

            <LabeledField label="Consultation Fee (₹)" error={errors.consultationFee?.message}>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={onChange}
                  min="0"
                  className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none ${errors.consultationFee ? 'border-destructive ring-destructive/20' : ''}`}
                />
              </div>
            </LabeledField>

            <LabeledField label="Qualification">
              <div className="relative">
                <GraduationCap className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={onChange}
                  className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. BDS, MDS"
                />
              </div>
            </LabeledField>

            <LabeledField label="Exp (Years)">
              <div className="relative">
                <Award className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={onChange}
                  min="0"
                  className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </LabeledField>

            <div className="md:col-span-2">
              <LabeledField label="Medical License Number">
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={onChange}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="REG-XXXXXXXX"
                />
              </LabeledField>
            </div>
          </>
        )}

        {isSupport && (
          <>
            <LabeledField label="Education Level">
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={onChange}
                className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Graduate"
              />
            </LabeledField>
            <LabeledField label="Experience (Years)">
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={onChange}
                className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20"
              />
            </LabeledField>
            {formData.role === "assistant" && (
              <div className="md:col-span-2">
                <LabeledField label="Primary Department">
                  <select
                    name="department"
                    value={formData.department}
                    onChange={onChange}
                    className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select Department</option>
                    <option value="Surgery">Surgery Support</option>
                    <option value="General">General Dentistry</option>
                    <option value="Lab">Laboratory</option>
                    <option value="Sterilization">Sterilization</option>
                  </select>
                </LabeledField>
              </div>
            )}
          </>
        )}

        {isAdmin && (
          <>
            <LabeledField label="Department">
              <select
                name="department"
                value={formData.department}
                onChange={onChange}
                className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Department</option>
                <option value="HR">Human Resources</option>
                <option value="Finance">Finance / Accounting</option>
                <option value="Operations">Operations</option>
                <option value="IT">IT Support</option>
              </select>
            </LabeledField>
            <LabeledField label="Designation">
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={onChange}
                className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Operations Manager"
              />
            </LabeledField>
          </>
        )}
      </div>

      <div className="pt-4 border-t border-dashed space-y-6">
        <LabeledField label="Monthly Salary (₹) *" required error={errors.monthlySalary?.message}>
          <div className="relative">
            <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
            <input
              type="number"
              name="monthlySalary"
              value={formData.monthlySalary}
              onChange={onChange}
              required
              min="0"
              className={`w-full pl-10 pr-4 py-3 border border-emerald-100 bg-emerald-50/20 rounded-2xl text-lg font-black text-emerald-700 focus:ring-2 focus:ring-emerald-500/20 outline-none shadow-sm ${errors.monthlySalary ? 'border-destructive ring-destructive/20 bg-destructive/5 text-destructive' : ''}`}
            />
          </div>
        </LabeledField>

        {formData.role === "doctor" && (
          <div
            className={`p-5 rounded-2xl border transition-all ${formData.profitSharing ? "bg-primary/5 border-primary/20 shadow-inner" : "bg-muted/30 border-border"}`}
          >
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                name="profitSharing"
                checked={formData.profitSharing}
                onChange={onChange}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-sm font-black text-foreground uppercase tracking-tight">
                Enable Performance Profit Sharing
              </span>
            </label>
            {formData.profitSharing && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                  Sharing Percentage (%)
                </p>
                <input
                  type="number"
                  name="profitPercentage"
                  value={formData.profitPercentage}
                  onChange={onChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border rounded-xl text-xl font-black text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            )}
          </div>
        )}

        <label className="flex items-center gap-3 p-4 bg-muted/20 border border-border rounded-2xl cursor-pointer hover:bg-muted/30 transition-colors">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={onChange}
            className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">
              Active Member
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase">
              Staff member can currently access the portal
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
