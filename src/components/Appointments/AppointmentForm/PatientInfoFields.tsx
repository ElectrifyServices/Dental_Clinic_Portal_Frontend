import { Label } from "@/components/ui/Label";
import React, { useState, useRef, useEffect } from "react";
import { User, Search } from "lucide-react";
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
  patients?: any[];
  onSelectPatient?: (name: string, phone: string) => void;
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
  patients = [],
  onSelectPatient,
}) => {
  const [focusedField, setFocusedField] = useState<"name" | "phone" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFocusedField(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [debouncedName, setDebouncedName] = useState(patientName);
  const [debouncedPhone, setDebouncedPhone] = useState(patientPhone);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedName(patientName);
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [patientName]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPhone(patientPhone);
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [patientPhone]);

  const searchTerm = debouncedName.toLowerCase();
  const searchPhone = debouncedPhone;

  // Filter patients based on debounced name or phone if typing
  let filteredPatients = patients.filter((p: any) => {
    const pName = (p.name || "").toLowerCase();
    const pPhone = p.phone || "";
    if (focusedField === "name" && searchTerm && pName.includes(searchTerm)) return true;
    if (focusedField === "phone" && searchPhone && pPhone.includes(searchPhone)) return true;
    return false;
  });

  // Limit to top 5 results for performance and UI compactness
  filteredPatients = filteredPatients.slice(0, 5);

  const handleSelect = (p: any) => {
    if (onSelectPatient) {
      onSelectPatient(p.name, p.phone || "");
    }
    setFocusedField(null);
  };

  const Dropdown = () => {
    if (!focusedField || (!searchTerm && !searchPhone) || isFollowUp || isConsulted) return null;
    return (
      <div className="absolute top-[72px] left-0 w-full z-50 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-2 bg-muted/30 border-b border-border/40 text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-2">
          <Search className="w-3 h-3" /> Select existing patient or keep typing to add new
        </div>
        
        {filteredPatients.length > 0 ? (
          <ul className="max-h-48 overflow-y-auto p-1">
            {filteredPatients.map((p: any, idx: number) => (
              <li
                key={p.id || idx}
                className="px-3 py-2 flex justify-between items-center hover:bg-muted rounded-lg cursor-pointer transition-colors"
                onClick={() => handleSelect(p)}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground truncate">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.phone}</span>
                </div>
                <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md uppercase shrink-0">
                  Select
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No matching patients found. A new patient will be created.
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="space-y-3 relative" ref={dropdownRef}>
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
        <div className="space-y-1.5 relative">
          <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
            Patient Name <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              name="patientName"
              value={patientName}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                onChange(e);
                setFocusedField("name");
              }}
              onFocus={() => setFocusedField("name")}
              required
              autoComplete="off"
              disabled={isFollowUp || isConsulted}
              placeholder="Search or enter name"
              className="h-11 rounded-xl bg-muted/50 border-border focus:bg-card"
            />
          </div>
          {focusedField === "name" && <Dropdown />}
          {errors?.patientName && (
            <p className="text-[10px] text-destructive font-bold mt-1 ml-1 uppercase tracking-wider">
              {errors.patientName.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5 relative">
          <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            name="patientPhone"
            value={patientPhone}
            onChange={(e) => {
              onPhoneChange(e.target.value.replace(/[a-zA-Z]/g, ""));
              setFocusedField("phone");
            }}
            onFocus={() => setFocusedField("phone")}
            required
            autoComplete="off"
            disabled={isFollowUp || isConsulted}
            placeholder="98765 43210"
            className="h-11 rounded-xl bg-muted/50 border-border focus:bg-card"
          />
          {focusedField === "phone" && <Dropdown />}
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
