import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Patient } from "../../types";
import { SignaturePad } from "./SignaturePad";
import { Modal, Button, Badge, Label, Textarea, Input, Loading } from "@/components/ui";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useDoctorsListQuery } from "../../hooks/staff/useDoctorsListQuery";
import { usePatientQuery } from "../../hooks/patients/usePatientQuery";
import { CONSENT_TEMPLATES } from "../../constants/consent.constants";

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

  const isPatientInfoValid = () => {
    return !!(formData.patientId && formData.doctorName && formData.treatmentType);
  };

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
    date: form?.date
      ? form.date.includes("T")
        ? form.date.split("T")[0]
        : form.date
      : new Date().toISOString().split("T")[0],
  });

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
        date: form.date
          ? form.date.includes("T")
            ? form.date.split("T")[0]
            : form.date
          : new Date().toISOString().split("T")[0],
      });
    }
  }, [form]);

  // Auto-fill template when procedure changes (new form only)
  useEffect(() => {
    if (!form && formData.treatmentType && CONSENT_TEMPLATES[formData.treatmentType]) {
      const key = formData.treatmentType;
      setFormData((prev) => ({
        ...prev,
        content: buildContentText(key),
        riskDisclosure: buildRisksText(key),
        alternativeTreatments: buildAlternativesText(key),
        postTreatmentCare: buildResponsibilitiesText(key),
      }));
    }
  }, [formData.treatmentType, form]);

  const handleSubmit = () => {
    if (
      !formData.patientId ||
      !formData.treatmentType ||
      !formData.doctorName
    ) {
      alert("Required fields: Patient, Doctor, and Procedure.");
      return;
    }

    onSave({
      ...formData,
      procedure_declaration: formData.content,
      id: form?.id || `CONSENT-${Date.now()}`,
      status: formData.patientSignature ? "COMPLETED" : "PENDING",
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

  // Handle procedure selection
  const handleProcedureChange = (value: string) => {
    setFormData((prev) => ({ ...prev, treatmentType: value }));
  };

  const selectedTemplate = formData.treatmentType
    ? CONSENT_TEMPLATES[formData.treatmentType]
    : null;

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
        {activeTab !== "patient" && !isLoading && (
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
          (activeTab !== "sign" ? (
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
                        options={(apiPatients.length > 0 ? apiPatients : patients).map((p: any) => ({ label: p.name, value: p.id }))}
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
                        options={(apiDoctors?.length ? apiDoctors : doctors).map((d: any) => ({ label: d.name, value: d.name }))}
                        placeholder="Select Doctor..."
                        isLoading={isDoctorsLoading}
                        className={showErrors && !formData.doctorName ? "border-red-400 bg-red-50/15 focus:border-red-400 focus:ring-red-100" : ""}
                      />
                      {showErrors && !formData.doctorName && (
                        <span className="text-[10px] text-red-500 font-bold ml-1 block">Attending Doctor is required</span>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">
                        Clinical Procedure Type <span className="text-red-500">*</span>
                      </Label>
                      <SearchableSelect
                        value={formData.treatmentType}
                        onChange={handleProcedureChange}
                        options={Object.keys(CONSENT_TEMPLATES).map((type) => ({ label: type, value: type }))}
                        placeholder="Select Procedure Template..."
                        className={showErrors && !formData.treatmentType ? "border-red-400 bg-red-50/15 focus:border-red-400 focus:ring-red-100" : ""}
                      />
                      {showErrors && !formData.treatmentType && (
                        <span className="text-[10px] text-red-500 font-bold ml-1 block">Clinical Procedure Type is required</span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex gap-3">
                    <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] text-primary/80 font-bold leading-relaxed uppercase tracking-tight">
                      Select a procedure to auto-load legal terms, risks, and consent content. You can review and edit them in the next step.
                    </p>
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
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
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
