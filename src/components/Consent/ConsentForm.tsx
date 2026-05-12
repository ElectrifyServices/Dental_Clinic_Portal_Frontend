import React, { useState, useEffect } from "react";
import {
  Save,
  User,
  Shield,
  PenTool,
  AlertCircle,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { Patient } from "../../types";
import { SignaturePad } from "./SignaturePad";
import { Modal, Button, Badge } from "@/components/ui";

interface ConsentFormProps {
  onClose: () => void;
  onSave: (form: any) => void;
  form?: any;
  patients: Patient[];
  doctors: any[];
}

const CONSENT_TEMPLATES = {
  "General Dentistry": {
    content:
      "I hereby authorize Dr. Rajesh Sharma and associates to perform dental examinations, radiographs, and basic treatments (cleaning, fillings, fluoride). I understand that dental treatment involves risks and I have been informed of the nature and purpose of these procedures.",
    risks:
      "Sensitivity to hot/cold, gum irritation, local anesthesia reactions, minor bleeding.",
    alternatives:
      "No treatment, which may lead to further decay or tooth loss.",
    care: "Regular brushing and flossing. Follow specific instructions for fillings or cleanings.",
  },
  "Tooth Extraction / Oral Surgery": {
    content:
      "I consent to the extraction of the specified tooth/teeth. I understand that oral surgery involves risk of damage to adjacent teeth, bone, or nerves. I authorize the use of local anesthesia and/or sedation as deemed necessary.",
    risks:
      "Severe bleeding, dry socket, infection, temporary or permanent numbness of lip/tongue, jaw fracture, sinus involvement.",
    alternatives:
      "Root canal treatment (if applicable), periodontal therapy, or leaving the tooth (risk of pain/infection spread).",
    care: "Do not spit, smoke, or use a straw for 24 hours. Bite on gauze for 45 mins. Soft diet for 3 days.",
  },
  "Root Canal Treatment (Endodontics)": {
    content:
      "I authorize root canal treatment on the specified tooth. I understand that this procedure is an attempt to save a tooth that might otherwise require extraction. Success cannot be guaranteed 100% due to complex canal anatomy.",
    risks:
      "Post-op pain/swelling, instrument breakage in canal, root perforation, need for additional surgery (Apicoectomy).",
    alternatives:
      "Extraction followed by bridge or implant, or no treatment (leading to abscess/severe pain).",
    care: "Avoid hard foods until permanent restoration (crown) is placed. Complete full course of prescribed antibiotics.",
  },
  "Dental Implants": {
    content:
      "I consent to the surgical placement of dental implants. I understand this is a multi-stage process involving surgery into the jawbone. I confirm I have disclosed all medical conditions including bone disorders and smoking habits.",
    risks:
      "Implant failure, nerve damage, sinus perforation, infection, bone loss around implant.",
    alternatives: "Partial dentures, fixed bridges, or no treatment.",
    care: "Meticulous oral hygiene is mandatory. Regular professional cleaning every 4-6 months.",
  },
  "Orthodontic Braces / Clear Aligners": {
    content:
      "I authorize orthodontic treatment to correct dental irregularities. I understand that successful results depend on my cooperation in wearing appliances and attending regular appointments.",
    risks:
      "Root resorption, decalcification (white spots), relapse after treatment, gum recession.",
    alternatives:
      "Accepting current dental position, or cosmetic veneers/crowns.",
    care: "Clean around brackets carefully. Wear retainers as directed after active treatment.",
  },
};

export function ConsentForm({
  onClose,
  onSave,
  form,
  patients,
  doctors,
}: ConsentFormProps) {
  const [activeTab, setActiveTab] = useState<"patient" | "terms" | "sign">(
    "patient",
  );
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
    date: form?.date || new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (
      !form &&
      formData.treatmentType &&
      CONSENT_TEMPLATES[
        formData.treatmentType as keyof typeof CONSENT_TEMPLATES
      ]
    ) {
      const template =
        CONSENT_TEMPLATES[
          formData.treatmentType as keyof typeof CONSENT_TEMPLATES
        ];
      setFormData((prev) => ({
        ...prev,
        content: template.content,
        riskDisclosure: template.risks,
        alternativeTreatments: template.alternatives,
        postTreatmentCare: template.care,
      }));
    }
  }, [formData.treatmentType, form]);

  const handleSubmit = () => {
    if (
      !formData.patientId ||
      !formData.treatmentType ||
      !formData.patientSignature ||
      !formData.doctorName
    ) {
      alert("Required fields: Patient, Doctor, Procedure, and Signature.");
      return;
    }

    onSave({
      ...formData,
      id: form?.id || `CONSENT-${Date.now()}`,
      status: "signed",
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
        {activeTab !== "patient" && (
          <Button
            variant="outline"
            onClick={() =>
              setActiveTab(activeTab === "sign" ? "terms" : "patient")
            }
          >
            Previous Step
          </Button>
        )}

        {activeTab !== "sign" ? (
          <Button
            onClick={() =>
              setActiveTab(activeTab === "patient" ? "terms" : "sign")
            }
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
        )}
      </div>
    </div>
  );

  return (
    <Modal
      title={form ? "Verify Consent" : "Patient Authorization"}
      subtitle="Medical Legal Documentation & Consent"
      onClose={onClose}
      size="5xl"
      icon={<Shield className="w-4 h-4" />}
      footer={footer}
    >
      <div className="space-y-6">
        {/* Tab Header */}
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          {[
            { id: "patient", label: "Identity", icon: User },
            { id: "terms", label: "Legal Terms", icon: BookOpen },
            { id: "sign", label: "Auth", icon: PenTool },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="">
          {activeTab === "patient" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                    Patient Name *
                  </label>
                  <select
                    value={formData.patientId}
                    onChange={handlePatientChange}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                  >
                    <option value="">Select Patient...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                    Attending Doctor *
                  </label>
                  <select
                    value={formData.doctorName}
                    onChange={(e) =>
                      setFormData({ ...formData, doctorName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                  >
                    <option value="">Select Doctor...</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                    Clinical Procedure Type *
                  </label>
                  <select
                    value={formData.treatmentType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        treatmentType: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                  >
                    <option value="">Select Procedure Template...</option>
                    {Object.keys(CONSENT_TEMPLATES).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                <p className="text-[11px] text-primary/80 font-bold leading-relaxed uppercase tracking-tight">
                  Standard legal terminology and risk disclosures will be
                  auto-loaded based on the procedure type. You can review them
                  in the next step.
                </p>
              </div>
            </div>
          )}

          {activeTab === "terms" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                  Consent Declaration & Procedure Detail
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-destructive uppercase tracking-widest ml-1">
                    Clinical Risks & Disclosures
                  </label>
                  <textarea
                    value={formData.riskDisclosure}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        riskDisclosure: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl focus:ring-2 focus:ring-red-500/10 outline-none text-sm font-medium leading-relaxed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">
                    Alternatives & Refusal Risks
                  </label>
                  <textarea
                    value={formData.alternativeTreatments}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        alternativeTreatments: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm font-medium leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "sign" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Patient Signature *
                    </label>
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
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                    Witness Name (Optional)
                  </label>
                  <input
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
      </div>
    </Modal>
  );
}
