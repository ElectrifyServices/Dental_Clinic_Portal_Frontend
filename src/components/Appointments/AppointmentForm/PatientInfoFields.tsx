import { Label } from "@/components/ui/Label";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { User, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { CountryCodeSelect } from "@/components/ui/CountryCodeSelect";
import { Loading } from "@/components/ui/Loading";
import { isoFromDialingCode, getPhoneMaxLength, getPhonePlaceholder, sanitizePhoneInput } from "@/utils/phoneUtils";

interface PatientInfoFieldsProps {
  patientName: string;
  patientPhone: string;
  countryCode?: string;
  onCountryCodeChange?: (val: string) => void;
  isFollowUp: boolean;
  isConsulted: boolean;
  suggestion: { name: string; phone: string } | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (val: string) => void;
  onAcceptSuggestion: () => void;
  errors?: any;
  patients?: any[];
  isLoadingPatients?: boolean;
  onSelectPatient?: (name: string, phone: string, countryCode?: string, patientObj?: any) => void;
}

export const PatientInfoFields: React.FC<PatientInfoFieldsProps> = ({
  patientName,
  patientPhone,
  countryCode = "+91",
  onCountryCodeChange,
  isFollowUp,
  isConsulted,
  suggestion,
  onChange,
  onPhoneChange,
  onAcceptSuggestion,
  errors,
  patients = [],
  isLoadingPatients = false,
  onSelectPatient,
}) => {
  const [focusedField, setFocusedField] = useState<"name" | "phone" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const countryIso = useMemo(() => isoFromDialingCode(countryCode), [countryCode]);
  const phoneMaxLength = useMemo(() => getPhoneMaxLength(countryIso), [countryIso]);
  const phonePlaceholder = useMemo(() => getPhonePlaceholder(countryIso), [countryIso]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFocusedField(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (p: any) => {
    if (onSelectPatient) {
      const pName = p.name || p.full_name || p.patient_name || "";
      const rawPhone = p.phone || p.mobile || p.mobile_number || p.patient_phone || "";
      
      // Determine Country Code from API payload or phone string
      let selectedCountryCode = p.country_code || p.countryCode || "";
      let cleanPhone = rawPhone.replace(/\D/g, "");

      if (!selectedCountryCode) {
        if (rawPhone.startsWith("+1")) selectedCountryCode = "+1";
        else if (rawPhone.startsWith("+91")) selectedCountryCode = "+91";
        else if (rawPhone.startsWith("+44")) selectedCountryCode = "+44";
        else if (rawPhone.startsWith("+971")) selectedCountryCode = "+971";
        else selectedCountryCode = "+91";
      }

      // If cleanPhone contains country code digits prefix, slice it off to get 10-digit number
      const codeDigits = selectedCountryCode.replace(/\D/g, "");
      if (codeDigits && cleanPhone.length > 10 && cleanPhone.startsWith(codeDigits)) {
        cleanPhone = cleanPhone.slice(codeDigits.length);
      }
      cleanPhone = cleanPhone.slice(-10);

      onSelectPatient(pName, cleanPhone, selectedCountryCode, p);
    }
    setFocusedField(null);
  };

  const Dropdown = () => {
    if (!focusedField || isFollowUp || isConsulted) return null;

    const searchTerm = focusedField === "name" 
      ? (patientName || "").toLowerCase().trim() 
      : (patientPhone || "").toLowerCase().trim();

    // The patients list is already searched/filtered by the backend. Local filtering is disabled
    // to prevent mismatch from typos, fuzzy matching, or loading/debounce state.
    const filteredPatients = patients.slice(0, 10);

    return (
      <div className="absolute top-[72px] left-0 w-full z-50 bg-card border border-border/80 rounded-xl shadow-modal overflow-hidden">
        <div className="p-2 bg-muted/40 border-b border-border/40 text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-primary" /> Select existing patient or keep typing to add new
          </span>
          {isLoadingPatients && (
            <span className="text-[10px] font-bold text-primary flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Searching...
            </span>
          )}
        </div>
        
        {isLoadingPatients && patients.length === 0 ? (
          <div className="py-6">
            <Loading type="spinner" text="Searching patients list..." className="py-2" />
          </div>
        ) : filteredPatients.length > 0 ? (
          <ul className="max-h-52 overflow-y-auto p-1 divide-y divide-border/20">
            {filteredPatients.map((p: any, idx: number) => {
              const pCode = p.country_code || p.countryCode || "+91";
              return (
                <li
                  key={p.id || p.patient_id || idx}
                  className="px-3 py-2 flex justify-between items-center hover:bg-muted/70 rounded-lg cursor-pointer transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(p);
                  }}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-sm font-bold text-foreground truncate">{p.name || p.full_name}</span>
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                      <span className="text-primary font-bold">{pCode}</span>
                      <span>{p.phone}</span>
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md uppercase shrink-0">
                    Select
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-4 text-center text-xs text-muted-foreground font-semibold">
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
                let val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                val = val.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
                e.target.value = val;
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
          <div className="flex items-center gap-2 sm:gap-2.5">
            <CountryCodeSelect
              value={countryCode}
              onChange={(val) => {
                onCountryCodeChange?.(val);
              }}
              disabled={isFollowUp || isConsulted}
              className="h-11 rounded-xl bg-muted/50 border-border focus:bg-card"
            />
            <Input
              name="patientPhone"
              maxLength={phoneMaxLength}
              value={patientPhone}
              onChange={(e) => {
                const val = sanitizePhoneInput(e.target.value).slice(0, phoneMaxLength);
                onPhoneChange(val);
                setFocusedField("phone");
              }}
              onFocus={() => setFocusedField("phone")}
              required
              autoComplete="off"
              disabled={isFollowUp || isConsulted}
              placeholder={phonePlaceholder}
              className="h-11 rounded-xl bg-muted/50 border-border focus:bg-card flex-1"
            />
          </div>
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
