import React from "react";
import { ClipboardCheck, PenTool, AlertTriangle } from "lucide-react";
import { SignaturePad } from "../../Consent/SignaturePad";
import { calculateAge } from "./utils";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";

interface Step3Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}

export const Step3Consent: React.FC<Step3Props> = ({
  formData,
  setFormData,
  handleChange,
}) => {
  const age = calculateAge(formData.dateOfBirth);
  const isMinor = age > 0 && age < 18;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-secondary to-ternary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClipboardCheck className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground">
          Patient Consent & Declaration
        </h3>
        <p className="text-sm text-muted-foreground">
          Please review and confirm the following statements
        </p>
      </div>

      <Card className="border-secondary bg-card overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">
            Required Consents
          </h4>
          <div className="space-y-4">
            {[
              {
                id: "consentCorrectDetails",
                label: "I confirm details entered are correct",
              },
              {
                id: "consentExamination",
                label: "I agree to dental examination",
              },
              {
                id: "consentRisks",
                label: "I understand treatment risks explained later by doctor",
              },
              {
                id: "consentStorage",
                label: "I allow clinic to store records securely",
              },
              {
                id: "consentEmergency",
                label: "Emergency treatment allowed if required",
              },
            ].map((consent) => (
              <label
                key={consent.id}
                className="flex items-start gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-muted transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData[consent.id] || false}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      [consent.id]: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 mt-0.5 rounded border-input text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground font-medium">
                  {consent.label}
                </span>
              </label>
            ))}
          </div>

          <h4 className="text-xs font-bold text-primary uppercase tracking-wider mt-8 mb-4">
            Optional Preferences
          </h4>
          <div className="space-y-4">
            {[
              { id: "optWhatsApp", label: "Allow WhatsApp reminders" },
              { id: "optPhotos", label: "Allow before/after photos" },
            ].map((opt) => (
              <label
                key={opt.id}
                className="flex items-start gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-muted transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData[opt.id] || false}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      [opt.id]: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 mt-0.5 rounded border-input text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground font-medium">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-secondary bg-card">
        <CardContent className="p-6 space-y-6">
          {!isMinor ? (
            <div>
              <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <PenTool className="w-4 h-4 text-primary" />
                Patient Signature Section *
              </h4>
              <div className="border border-border rounded-2xl p-4">
                <SignaturePad
                  onSave={(dataUrl) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      patientSignature: dataUrl,
                    }))
                  }
                  defaultValue={formData.patientSignature}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-900">
                    Guardian Authorization Required
                  </p>
                  <p className="text-xs text-amber-700">
                    Patient is under 18 years old ({age} years). Guardian
                    details and signature are mandatory.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-2">
                  Guardian Full Name *
                </label>
                <Input
                  type="text"
                  name="guardianName"
                  value={formData.guardianName || ""}
                  onChange={handleChange}
                  placeholder="Full name of guardian"
                />
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-primary" />
                  Guardian Signature *
                </h4>
                <div className="border border-border rounded-2xl p-4">
                  <SignaturePad
                    onSave={(dataUrl) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        guardianSignature: dataUrl,
                      }))
                    }
                    defaultValue={formData.guardianSignature}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
