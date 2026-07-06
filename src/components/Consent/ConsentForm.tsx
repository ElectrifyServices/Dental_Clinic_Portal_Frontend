import React, { useState, useEffect, useMemo } from "react";
import {
  Save,
  User,
  Shield,
  PenTool,
  AlertCircle,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  XCircle,
  HeartPulse,
  ClipboardList,
  Upload,
} from "lucide-react";
import { Patient } from "../../types";
import { SignaturePad } from "./SignaturePad";
import { Modal, Button, Badge, Label, Textarea, Input, Loading } from "@/components/ui";
import { Checkbox } from "@/components/ui/Checkbox";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useDoctorsListQuery } from "../../hooks/staff/useDoctorsListQuery";
import { usePatientQuery } from "../../hooks/patients/usePatientQuery";
import { CONSENT_TEMPLATES, CONSENT_CHECKBOX_TREATMENTS } from "../../constants/consent.constants";
import { cn } from "@/lib/utils";

interface ConsentFormProps {
  onClose: () => void;
  onSave: (form: any) => void;
  form?: any;
  patients: Patient[];
  doctors: any[];
  isLoading?: boolean;
}

// Helper: build flat text for legacy fields
function buildContentText(key: string) {
  const t = CONSENT_TEMPLATES[key];
  if (!t) return "";
  return `${t.consentDeclaration}\n\nProcedure: ${t.description}`;
}
function buildRisksText(key: string) {
  const t = CONSENT_TEMPLATES[key];
  if (!t) return "";
  return t.risks.map((r) => `• ${r}`).join("\n");
}
function buildAlternativesText(key: string) {
  const t = CONSENT_TEMPLATES[key];
  if (!t) return "";
  return t.alternatives.map((a) => `• ${a}`).join("\n");
}
function buildResponsibilitiesText(key: string) {
  const t = CONSENT_TEMPLATES[key];
  if (!t) return "";
  return t.responsibilities.map((r) => `• ${r}`).join("\n");
}

export function ConsentForm({
  onClose,
  onSave,
  form,
  patients = [],
  doctors = [], // fallback prop
  isLoading,
}: ConsentFormProps) {
  const { doctors: apiDoctors, isLoading: isDoctorsLoading } = useDoctorsListQuery();
  const { data: rawPatientsData, isLoading: isPatientsLoading } = usePatientQuery({ filters: { isDropdown: [true] as any } });
  
  const apiPatients = Array.isArray(rawPatientsData) 
    ? rawPatientsData 
    : (rawPatientsData as any)?.data?.data || (rawPatientsData as any)?.data || [];

  const [selectedTreatments, setSelectedTreatments] = useState<string[]>(() => {
    if (form?.treatmentType) {
      return form.treatmentType.split(", ").filter(Boolean);
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<"patient" | "terms" | "sign">(
    "patient",
  );
  const [showErrors, setShowErrors] = useState(false);
  const [formData, setFormData] = useState({
    patientId: form?.patientId || "",
    patientName: form?.patientName || "",
    treatmentType: form?.treatmentType || "",
    content: form?.content || "",
    riskDisclosure: form?.riskDisclosure || "",
    alternativeTreatments: form?.alternativeTreatments || "",
    postTreatmentCare: form?.postTreatmentCare || "",
    patientSignature: form?.patientSignature || "",
    witnessName: form?.witnessName || "",
    witnessSignature: form?.witnessSignature || "",
    doctorName: form?.doctorName || "",
    doctorId: form?.doctorId || "",
    consentFormUrl: form?.consentFormUrl || "",
    rawConsentFormFile: null as File | null,
    date: form?.date
      ? form.date.includes("T")
        ? form.date.split("T")[0]
        : form.date
      : new Date().toISOString().split("T")[0],
  });

  const isOfflineUploadOnly = !!formData.consentFormUrl;

  const isPatientInfoValid = () => {
    return !!(formData.patientId && formData.doctorName && selectedTreatments.length > 0);
  };

  useEffect(() => {
    if (form) {
      setFormData({
        patientId: form.patientId || "",
        patientName: form.patientName || "",
        treatmentType: form.treatmentType || "",
        content: form.content || "",
        riskDisclosure: form.riskDisclosure || "",
        alternativeTreatments: form.alternativeTreatments || "",
        postTreatmentCare: form.postTreatmentCare || "",
        patientSignature: form.patientSignature || "",
        witnessName: form.witnessName || "",
        witnessSignature: form.witnessSignature || "",
        doctorName: form.doctorName || "",
        doctorId: form.doctorId || "",
        consentFormUrl: form.consentFormUrl || "",
        rawConsentFormFile: null,
        date: form.date
          ? form.date.includes("T")
            ? form.date.split("T")[0]
            : form.date
          : new Date().toISOString().split("T")[0],
      });
      if (form.treatmentType) {
        setSelectedTreatments(form.treatmentType.split(", ").filter(Boolean));
      } else {
        setSelectedTreatments([]);
      }
    }
  }, [form]);

  // Auto-fill template when selectedTreatments changes (new form only)
  useEffect(() => {
    if (!form) {
      if (selectedTreatments.length > 0) {
        const combinedContent = selectedTreatments
          .map((key) => {
            const t = CONSENT_TEMPLATES[key];
            return t ? `--- ${key} ---\n${buildContentText(key)}` : "";
          })
          .join("\n\n");

        const combinedRisks = selectedTreatments
          .map((key) => {
            const t = CONSENT_TEMPLATES[key];
            return t ? `• ${key}:\n${buildRisksText(key)}` : "";
          })
          .join("\n\n");

        const combinedAlts = selectedTreatments
          .map((key) => {
            const t = CONSENT_TEMPLATES[key];
            return t ? `• ${key}:\n${buildAlternativesText(key)}` : "";
          })
          .join("\n\n");

        const combinedCare = selectedTreatments
          .map((key) => {
            const t = CONSENT_TEMPLATES[key];
            return t ? `• ${key}:\n${buildResponsibilitiesText(key)}` : "";
          })
          .join("\n\n");

        setFormData((prev) => ({
          ...prev,
          treatmentType: selectedTreatments.join(", "),
          content: combinedContent,
          riskDisclosure: combinedRisks,
          alternativeTreatments: combinedAlts,
          postTreatmentCare: combinedCare,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          treatmentType: "",
          content: "",
          riskDisclosure: "",
          alternativeTreatments: "",
          postTreatmentCare: "",
        }));
      }
    }
  }, [selectedTreatments, form]);

  const handleSubmit = () => {

    onSave({
      ...formData,
      treatmentType: selectedTreatments.join(", "),
      procedure_declaration: formData.content,
      id: form?.id || `CONSENT-${Date.now()}`,
      status: (formData.patientSignature || isOfflineUploadOnly) ? "COMPLETED" : "PENDING",
      signature: formData.patientSignature,
    });
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPatient = patients.find((p) => p.id === e.target.value);
    if (selectedPatient) {
      setFormData({
        ...formData,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
      });
    }
  };

  const handleTreatmentToggle = (key: string) => {
    setSelectedTreatments((prev) => {
      if (prev.includes(key)) {
        return prev.filter((item) => item !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const selectedTemplate = useMemo(() => {
    if (selectedTreatments.length === 0) return null;
    if (selectedTreatments.length === 1) {
      return CONSENT_TEMPLATES[selectedTreatments[0]] || null;
    }

    const descriptions: string[] = [];
    const declarations: string[] = [];
    const risks: string[] = [];
    const alternatives: string[] = [];
    const responsibilities: string[] = [];

    selectedTreatments.forEach((key) => {
      const template = CONSENT_TEMPLATES[key];
      if (template) {
        descriptions.push(`${key}: ${template.description}`);
        declarations.push(`${key}: ${template.consentDeclaration}`);
        risks.push(...template.risks);
        alternatives.push(...template.alternatives);
        responsibilities.push(...template.responsibilities);
      }
    });

    return {
      description: descriptions.join("\n\n"),
      consentDeclaration: declarations.join("\n\n"),
      risks: [risks.join("\n")],
      alternatives: [alternatives.join("\n")],
      responsibilities: [responsibilities.join("\n")],
    };
  }, [selectedTreatments]);

  const footer = (
    <div className="flex items-center justify-between w-full">
      <div className="hidden md:flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
            Signed On
          </span>
          <span className="text-xs font-bold text-foreground">
            {new Date(formData.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
            Attending Doctor
          </span>
          <span className="text-xs font-bold text-foreground">
            {formData.doctorName || "Not Selected"}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        {activeTab !== "patient" && !isOfflineUploadOnly && !isLoading && (
          <Button
            variant="outline"
            onClick={() =>
              setActiveTab(activeTab === "sign" ? "terms" : "patient")
            }
          >
            Previous Step
          </Button>
        )}

        {!isLoading &&
          (isOfflineUploadOnly ? (
            <Button
              onClick={handleSubmit}
              className="gap-2 shadow-lg shadow-primary/20"
            >
              <Save className="w-4 h-4" /> Finalize Consent (Upload)
            </Button>
          ) : activeTab !== "sign" ? (
            <Button
              onClick={() => {
                if (activeTab === "patient" && !isPatientInfoValid()) {
                  setShowErrors(true);
                  return;
                }
                setActiveTab(activeTab === "patient" ? "terms" : "sign");
              }}
              className="gap-2"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="gap-2 shadow-lg shadow-primary/20"
            >
              <Save className="w-4 h-4" /> Finish & Generate Form
            </Button>
          ))}
      </div>
    </div>
  );

  return (
    <Modal
      title={
        isLoading
          ? "Loading Authorization Form..."
          : form
          ? "Verify Consent"
          : "Patient Authorization"
      }
      subtitle={
        isLoading
          ? "Please wait while we fetch document data..."
          : "Medical Legal Documentation & Consent"
      }
      onClose={onClose}
      size="5xl"
      icon={<Shield className="w-4 h-4" />}
      footer={footer}
    >
      <div className="space-y-6">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {/* Tab Header */}
            {!isOfflineUploadOnly && (
              <div className="flex gap-2 p-1 bg-muted rounded-xl">
                {[
                  { id: "patient", label: "Identity", icon: User },
                  { id: "terms", label: "Legal Terms", icon: BookOpen },
                  { id: "sign", label: "Auth", icon: PenTool },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id !== "patient" && !isPatientInfoValid()) {
                        setShowErrors(true);
                        return;
                      }
                      setActiveTab(tab.id as any);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all h-auto border-transparent bg-transparent text-muted-foreground hover:bg-background/50 hover:text-foreground ${
                      activeTab === tab.id
                        ? "bg-background text-primary shadow-sm hover:bg-background hover:text-primary"
                        : ""
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </Button>
                ))}
              </div>
            )}

            <div>
              {/* ── Step 1: Identity ── */}
              {activeTab === "patient" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">
                        Patient Name <span className="text-red-500">*</span>
                      </Label>
                      <SearchableSelect
                        value={formData.patientId}
                        onChange={(val: string) => {
                          const pList = apiPatients.length > 0 ? apiPatients : patients;
                          const selectedPatient = pList.find((p: any) => p.id === val);
                          if (selectedPatient) {
                            setFormData({
                              ...formData,
                              patientId: selectedPatient.id,
                              patientName: selectedPatient.name,
                            });
                          }
                        }}
                        options={(apiPatients.length > 0 ? apiPatients : patients).map((p: any) => ({ 
                          label: p.name, 
                          value: p.id,
                          searchLabel: `${p.name} ${p.phone || ''}`,
                          patient: p
                        }))}
                        renderOption={(option: any) => {
                          const p = option.patient;
                          if (!p) return <span>{option.label}</span>;
                          const profilePic = p.profilePicture || p.avatar || p.profile_picture || p.image;
                          const initial = p.name ? p.name.charAt(0).toUpperCase() : "?";
                          return (
                            <div className="flex items-center gap-3 py-1">
                              {profilePic ? (
                                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0 bg-muted">
                                  <img
                                    src={profilePic}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as any).style.display = 'none';
                                      const parent = (e.target as any).parentElement;
                                      if (parent) {
                                        const fallback = parent.querySelector('.avatar-fallback');
                                        if (fallback) fallback.classList.remove('hidden');
                                      }
                                    }}
                                  />
                                  <div className="avatar-fallback hidden w-full h-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                                    {initial}
                                  </div>
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center border border-primary/20 flex-shrink-0">
                                  {initial}
                                </div>
                              )}
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-foreground text-xs leading-tight">{p.name}</span>
                                {p.phone && <span className="text-[10px] text-muted-foreground mt-0.5">{p.phone}</span>}
                              </div>
                            </div>
                          );
                        }}
                        renderValue={(option: any) => {
                          const p = option.patient;
                          if (!p) return option.label;
                          const profilePic = p.profilePicture || p.avatar || p.profile_picture || p.image;
                          const initial = p.name ? p.name.charAt(0).toUpperCase() : "?";
                          return (
                            <div className="flex items-center gap-2">
                              {profilePic ? (
                                <img src={profilePic} alt={p.name} className="w-5 h-5 rounded-full object-cover border border-border flex-shrink-0" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center border border-primary/20 flex-shrink-0">
                                  {initial}
                                </div>
                              )}
                              <span className="font-medium truncate">{p.name}</span>
                            </div>
                          );
                        }}
                        placeholder="Select Patient..."
                        isLoading={isPatientsLoading}
                        className={showErrors && !formData.patientId ? "border-red-400 bg-red-50/15 focus:border-red-400 focus:ring-red-100" : ""}
                      />
                      {showErrors && !formData.patientId && (
                        <span className="text-[10px] text-red-500 font-bold ml-1 block">Patient Name is required</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">
                        Attending Doctor <span className="text-red-500">*</span>
                      </Label>
                      <SearchableSelect
                        value={formData.doctorName}
                        onChange={(val: string) => {
                          const matched = apiDoctors?.find((d: any) => d.name === val) || doctors.find((d) => d.name === val);
                          setFormData({
                            ...formData,
                            doctorName: val,
                            doctorId: matched ? matched.id : "",
                          });
                        }}
                        options={(apiDoctors?.length ? apiDoctors : doctors).map((d: any) => ({ 
                          label: d.name, 
                          value: d.name,
                          searchLabel: `${d.name} ${d.specialization || d.role || ''}`,
                          doctor: d
                        }))}
                        renderOption={(option: any) => {
                          const d = option.doctor;
                          if (!d) return <span>{option.label}</span>;
                          const profilePic = d.avatar || d.profile_picture || d.image;
                          const initial = d.name ? d.name.charAt(0).toUpperCase() : "?";
                          return (
                            <div className="flex items-center gap-3 py-1">
                              {profilePic ? (
                                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0 bg-muted">
                                  <img
                                    src={profilePic}
                                    alt={d.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as any).style.display = 'none';
                                      const parent = (e.target as any).parentElement;
                                      if (parent) {
                                        const fallback = parent.querySelector('.avatar-fallback');
                                        if (fallback) fallback.classList.remove('hidden');
                                      }
                                    }}
                                  />
                                  <div className="avatar-fallback hidden w-full h-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                                    {initial}
                                  </div>
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 font-black text-xs flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                                  {initial}
                                </div>
                              )}
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-foreground text-xs leading-tight">{d.name}</span>
                                {(d.specialization || d.role) && (
                                  <span className="text-[10px] text-muted-foreground mt-0.5 capitalize">{d.specialization || d.role.replace(/_/g, ' ')}</span>
                                )}
                              </div>
                            </div>
                          );
                        }}
                        renderValue={(option: any) => {
                          const d = option.doctor;
                          if (!d) return option.label;
                          const profilePic = d.avatar || d.profile_picture || d.image;
                          const initial = d.name ? d.name.charAt(0).toUpperCase() : "?";
                          return (
                            <div className="flex items-center gap-2">
                              {profilePic ? (
                                <img src={profilePic} alt={d.name} className="w-5 h-5 rounded-full object-cover border border-border flex-shrink-0" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 font-bold text-[10px] flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                                  {initial}
                                </div>
                              )}
                              <span className="font-medium truncate">{d.name}</span>
                            </div>
                          );
                        }}
                        placeholder="Select Doctor..."
                        isLoading={isDoctorsLoading}
                        className={showErrors && !formData.doctorName ? "border-red-400 bg-red-50/15 focus:border-red-400 focus:ring-red-100" : ""}
                      />
                      {showErrors && !formData.doctorName && (
                        <span className="text-[10px] text-red-500 font-bold ml-1 block">Attending Doctor is required</span>
                      )}
                    </div>

                    <div className="space-y-3 md:col-span-2">
                      <div className="mb-2">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 block">
                          Select Treatment Consent(s) <span className="text-red-500">*</span> (Select up to 2)
                        </Label>
                        <span className="text-[10px] text-muted-foreground font-medium ml-1 block mt-1">
                          Select treatment consents to auto-load legal terms, risks, and post-care content. You can review and edit them in the next step. <b>OR</b> bypass this by uploading a signed document below.
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {CONSENT_CHECKBOX_TREATMENTS.map((item) => {
                          const isChecked = selectedTreatments.includes(item.key);
                          return (
                            <div
                              key={item.key}
                              onClick={() => handleTreatmentToggle(item.key)}
                              className={cn(
                                "border rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all duration-200 bg-background cursor-pointer hover:border-primary/50",
                                isChecked
                                  ? "border-primary bg-primary/[0.02] shadow-sm ring-1 ring-primary/20"
                                  : "border-border"
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-xs font-bold text-foreground block">
                                    {item.label}
                                  </span>
                                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mt-0.5 font-mono">
                                    {item.subtitle}
                                  </span>
                                </div>
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() => handleTreatmentToggle(item.key)}
                                />
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                                {item.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      {showErrors && selectedTreatments.length === 0 && (
                        <span className="text-[10px] text-red-500 font-bold ml-1 block">At least one treatment must be selected</span>
                      )}
                    </div>
                  </div>

                  <div className="border border-border rounded-2xl p-4 bg-muted/10 shadow-sm space-y-3 animate-in fade-in duration-300 md:col-span-2 mt-6">
                    <h4 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Offline Consent Form Upload
                    </h4>
                    {formData.consentFormUrl ? (
                      <div className="flex flex-col items-center justify-center gap-3 bg-card p-4 border border-dashed border-border rounded-xl">
                        <div className="relative group rounded-lg overflow-hidden shadow-sm">
                          {formData.consentFormUrl.toLowerCase().includes(".pdf") || formData.consentFormUrl.startsWith("data:application/pdf") ? (
                            <div className="h-24 w-36 bg-muted rounded-lg border border-border flex flex-col items-center justify-center p-3">
                              <BookOpen className="w-6 h-6 text-primary mb-1" />
                              <span className="text-[10px] font-bold text-foreground text-center truncate w-full">Consent PDF</span>
                            </div>
                          ) : (
                            <img
                              src={formData.consentFormUrl}
                              alt="Uploaded Consent Form"
                              className="h-24 object-contain mx-auto rounded-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://placehold.co/150x100?text=Consent+Form";
                              }}
                            />
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setFormData((prev: any) => ({
                                ...prev,
                                consentFormUrl: "",
                                rawConsentFormFile: null
                              }));
                            }}
                            className="h-7 text-[10px] px-3 font-bold"
                          >
                            Remove Form
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          const fileInput = document.getElementById("offline-consent-file-upload-step1");
                          fileInput?.click();
                        }}
                        className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/[0.01] transition-all bg-background"
                      >
                        <input
                          id="offline-consent-file-upload-step1"
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setFormData((prev: any) => ({
                                  ...prev,
                                  consentFormUrl: event.target?.result as string,
                                  rawConsentFormFile: file,
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <Upload className="w-6 h-6 text-muted-foreground/60 mx-auto mb-2" />
                        <p className="text-xs font-bold text-foreground">Click to upload signed document</p>
                        <p className="text-[10px] text-muted-foreground mt-1">JPEG, PNG, PDF supported. Max size: 5MB</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex gap-3 mt-6">
                    <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-[11px] text-primary/90 font-medium leading-relaxed tracking-tight">
                      <strong className="block mb-1 text-xs uppercase tracking-wider">Flow Information:</strong>
                      Select your Patient, Doctor, and Treatment(s). Then:
                      <ul className="mt-1 space-y-1 ml-1">
                        <li>• <b>Upload Consent:</b> If you upload a signed document below, you can finalize directly via the "Finalize Consent (Upload)" button.</li>
                        <li>• <b>Manual Consent:</b> If you do not upload a document, click "Next Step" to proceed to digital terms and signatures.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 2: Legal Terms (structured view) ── */}
              {activeTab === "terms" && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                  {selectedTemplate ? (
                    <>
                      {/* Procedure header badge */}
                      <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/15 rounded-xl">
                        <HeartPulse className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-xs font-black text-primary uppercase tracking-wider">
                          {formData.treatmentType}
                        </span>
                      </div>

                      {/* Procedure Description */}
                      <div className="bg-muted/30 border border-border/60 rounded-2xl p-5 space-y-2">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                          <ClipboardList className="w-3.5 h-3.5" />
                          Procedure Description
                        </h4>
                        <p className="text-sm text-foreground/80 font-medium leading-relaxed">
                          {selectedTemplate.description}
                        </p>
                      </div>

                      {/* Consent Declaration */}
                      <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 space-y-2">
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5" />
                          Consent Declaration
                        </h4>
                        <p className="text-sm text-foreground/80 font-medium leading-relaxed italic">
                          "{selectedTemplate.consentDeclaration}"
                        </p>
                      </div>

                      {/* Risks + Alternatives */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Clinical Risks */}
                        <div className="bg-destructive/5 border border-destructive/15 rounded-2xl p-5 space-y-3">
                          <h4 className="text-[10px] font-black text-destructive uppercase tracking-widest flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" />
                            Clinical Risks
                          </h4>
                          <ul className="space-y-1.5">
                            {formData.riskDisclosure.split('\n').filter(r => r.trim() !== '').map((risk, i) => {
                              const cleanRisk = risk.replace(/^•\s*/, '').trim();
                              return (
                                <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 font-semibold">
                                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-destructive/60 shrink-0" />
                                  {cleanRisk}
                                </li>
                              );
                            })}
                          </ul>
                          {/* Editable override */}
                          <details className="mt-2">
                            <summary className="text-[10px] font-bold text-muted-foreground cursor-pointer hover:text-foreground">
                              Edit risks text ↓
                            </summary>
                            <Textarea
                              value={formData.riskDisclosure}
                              onChange={(e) =>
                                setFormData({ ...formData, riskDisclosure: e.target.value })
                              }
                              rows={3}
                              className="mt-2 w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-xs font-medium"
                            />
                          </details>
                        </div>

                        {/* Alternatives */}
                        <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-5 space-y-3">
                          <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Alternatives
                          </h4>
                          <ul className="space-y-1.5">
                            {formData.alternativeTreatments.split('\n').filter(r => r.trim() !== '').map((alt, i) => {
                              const cleanAlt = alt.replace(/^•\s*/, '').trim();
                              return (
                                <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 font-semibold">
                                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500/60 shrink-0" />
                                  {cleanAlt}
                                </li>
                              );
                            })}
                          </ul>
                          <details className="mt-2">
                            <summary className="text-[10px] font-bold text-muted-foreground cursor-pointer hover:text-foreground">
                              Edit alternatives text ↓
                            </summary>
                            <Textarea
                              value={formData.alternativeTreatments}
                              onChange={(e) =>
                                setFormData({ ...formData, alternativeTreatments: e.target.value })
                              }
                              rows={3}
                              className="mt-2 w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-xs font-medium"
                            />
                          </details>
                        </div>
                      </div>

                      {/* Patient Responsibilities */}
                      <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-5 space-y-3">
                        <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          Patient Responsibilities
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {formData.postTreatmentCare.split('\n').filter(r => r.trim() !== '').map((r, i) => {
                            const cleanResp = r.replace(/^•\s*/, '').trim();
                            return (
                              <div key={i} className="flex items-start gap-2 text-xs text-foreground/80 font-semibold">
                                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500/60 shrink-0" />
                                {cleanResp}
                              </div>
                            );
                          })}
                        </div>
                        <details className="mt-2">
                          <summary className="text-[10px] font-bold text-muted-foreground cursor-pointer hover:text-foreground">
                            Edit responsibilities text ↓
                          </summary>
                          <Textarea
                            value={formData.postTreatmentCare}
                            onChange={(e) =>
                              setFormData({ ...formData, postTreatmentCare: e.target.value })
                            }
                            rows={3}
                            className="mt-2 w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-xs font-medium"
                          />
                        </details>
                      </div>
                    </>
                  ) : (
                    /* No procedure selected yet */
                    <div className="py-16 flex flex-col items-center justify-center text-center gap-3 bg-muted/20 border-2 border-dashed border-border rounded-2xl">
                      <BookOpen className="w-10 h-10 text-muted-foreground/40" />
                      <p className="text-sm font-bold text-muted-foreground">
                        No procedure selected
                      </p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Go back to the Identity step and select a Clinical Procedure Type to load the consent terms.
                      </p>
                      <Button
                        variant="link"
                        onClick={() => setActiveTab("patient")}
                        className="mt-2 text-xs font-bold text-primary underline underline-offset-2 p-0 h-auto"
                      >
                        ← Go to Identity
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 3: Signature ── */}
              {activeTab === "sign" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          Patient Signature
                        </Label>
                        {formData.patientSignature && (
                          <Badge
                            variant="green"
                            className="text-[8px] font-black tracking-widest"
                          >
                            SIGNED
                          </Badge>
                        )}
                      </div>
                      <div className="bg-muted/30 border border-border rounded-3xl p-4 overflow-hidden">
                        <SignaturePad
                          onSave={(sig) =>
                            setFormData({ ...formData, patientSignature: sig })
                          }
                          defaultValue={formData.patientSignature}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                        Witness Name (Optional)
                      </Label>
                      <Input
                        type="text"
                        placeholder="Full Name of Witness"
                        value={formData.witnessName}
                        onChange={(e) =>
                          setFormData({ ...formData, witnessName: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold"
                      />
                      <div className="bg-muted/30 border border-border rounded-3xl p-4 overflow-hidden">
                        <SignaturePad
                          onSave={(sig) =>
                            setFormData({ ...formData, witnessSignature: sig })
                          }
                          defaultValue={formData.witnessSignature}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex items-center gap-6 shadow-sm animate-in zoom-in-95 duration-500">
                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-1">
                        Legal Attestation & Commitment
                      </h4>
                      <p className="text-[11px] text-emerald-900/80 font-bold leading-relaxed">
                        By signing this electronic document, I acknowledge that I
                        have been informed of the procedure, risks, and
                        alternatives. I understand this constitutes a{" "}
                        <span className="text-emerald-900 underline decoration-2 underline-offset-2">
                          legally binding medical authorization
                        </span>{" "}
                        and part of my clinical record.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
