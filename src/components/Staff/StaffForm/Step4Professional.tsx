import { useState, useRef, useEffect, useMemo } from "react";
import { Award, IndianRupee, GraduationCap, Search, Plus, Check, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { LabeledField } from "@/components/ui";
import { useSpecializationsQuery } from "@/hooks/specializations/useSpecializationsQuery";
import { useCreateSpecializationMutation } from "@/hooks/specializations/useCreateSpecializationMutation";
import { useSearch } from "@/hooks/useSearch";

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
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const rawSpecs = Array.isArray(apiSpecs)
    ? apiSpecs
    : (apiSpecs && Array.isArray((apiSpecs as any).data) ? (apiSpecs as any).data : null);

  const specsList = rawSpecs
    ? rawSpecs.map((s: any) => (typeof s === "string" ? s : s.name || ""))
    : SPECIALIZATIONS;

  const {
    searchQuery,
    setSearchQuery,
    filteredData: filteredSpecs,
  } = useSearch<string>({
    data: specsList,
  });

  const exactMatchExists = useMemo(() => {
    return specsList.some(
      (s: string) => s.toLowerCase() === searchQuery.toLowerCase()
    );
  }, [specsList, searchQuery]);

  useEffect(() => {
    setSearchQuery(formData.specialization || "");
  }, [formData.specialization, setSearchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateSpecialization = async () => {
    if (!searchQuery.trim()) return;

    try {
      const createdValue = searchQuery.trim();

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

      setSearchQuery(createdValue);

      // Close dropdown
      setTimeout(() => {
        setIsOpen(false);
      }, 100);

    } catch (err) {
      console.error("Failed to create specialization:", err);
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
              <div ref={dropdownRef} className="relative w-full">
                <div className="relative">
                  <input
                    type="text"
                    name="specialization"
                    placeholder={isSpecsLoading ? "Loading Specializations..." : "Search or type specialization..."}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsOpen(true);
                      onChange({
                        target: {
                          name: "specialization",
                          value: e.target.value,
                        },
                      });
                    }}
                    onFocus={() => setIsOpen(true)}
                    disabled={isSpecsLoading}
                    className="w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
                  />
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setIsOpen(true);
                        onChange({
                          target: {
                            name: "specialization",
                            value: "",
                          },
                        });
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div className="
absolute
z-50
w-full
mt-1.5
bg-card
border
border-border/80
rounded-2xl
shadow-2xl
shadow-black/5
max-h-60
overflow-y-auto
py-1.5
backdrop-blur-md
animate-in
fade-in
zoom-in-95
slide-in-from-top-2
duration-200
">
                    {filteredSpecs.length > 0 ? (
                      filteredSpecs.map((s: string) => {
                        const isSelected = formData.specialization === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              onChange({
                                target: {
                                  name: "specialization",
                                  value: s,
                                },
                              });
                              setSearchQuery(s);
                              setIsOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-left hover:bg-muted/50 ${isSelected ? "text-primary bg-primary/5" : "text-foreground"
                              }`}
                          >
                            <span>{s}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-2 text-xs font-medium text-muted-foreground text-center">
                        No matching specializations found.
                      </div>
                    )}

                    {!exactMatchExists &&
                      searchQuery.trim().length >= 2 && (
                        <div className="border-t border-dashed border-border/60 mt-2 pt-2 px-2">
                          <button
                            type="button"
                            disabled={createMutation.isPending}
                            onClick={handleCreateSpecialization}
                            className="
      w-full
      flex
      items-center
      justify-between
      px-4
      py-3
      rounded-xl
      bg-primary/5
      hover:bg-primary/10
      border
      border-primary/10
      transition-all
      duration-200
      group
      disabled:opacity-50
    "
                          >
                            {createMutation.isPending ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />

                                <span className="text-xs font-black text-primary">
                                  Creating...
                                </span
                                >
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Plus className="w-4 h-4 text-primary" />
                                  </div>

                                  <div className="flex flex-col text-left">
                                    <span className="text-xs font-black text-primary">
                                      Create New Specialization
                                    </span>

                                    <span className="text-[10px] text-muted-foreground font-semibold">
                                      "{searchQuery.trim()}"
                                    </span>
                                  </div>
                                </div>

                                <Plus className="w-4 h-4 text-primary" />
                              </>
                            )}
                          </button>
                        </div>
                      )}
                  </div>
                )}
              </div>
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
