import React from "react";
import { ClipboardCheck, PenTool, AlertTriangle, Camera, Upload } from "lucide-react";
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
  handleConsentFormUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Step3Consent: React.FC<Step3Props> = ({
  formData,
  setFormData,
  handleChange,
  handleConsentFormUpload,
}) => {
  const age = calculateAge(formData.dateOfBirth);
  const isMinor = age > 0 && age < 18;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-foreground">
          Patient Consent & Declaration
        </h3>
        <p className="text-sm text-muted-foreground">
          Please review and confirm the following statements
        </p>
      </div>

      <Card className="border border-border bg-card shadow-sm rounded-2xl">
        <CardContent className="p-6 space-y-6">
          
          {/* Consent Form Section */}
          <div className="border border-border rounded-xl p-5 bg-card shadow-sm">
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />
              Patient Consent Form
            </h4>
            <label className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:bg-muted/30 hover:border-primary/50 transition-all block group relative bg-background">
              <input 
                type="file" 
                accept="image/*,.pdf" 
                onChange={handleConsentFormUpload} 
                className="hidden" 
              />
              {formData.consentFormUrl ? (
                <div className="relative inline-block">
                   <img src={formData.consentFormUrl} alt="Consent Form" className="h-32 object-contain mx-auto rounded-lg shadow-sm" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center">
                      <Upload className="w-6 h-6 text-white mb-2" />
                      <span className="text-white text-xs font-bold">Change Form</span>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3">
                    <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-bold text-foreground">Click to upload consent form</p>
                  <p className="text-[11px] text-muted-foreground mt-1">JPEG, PNG, PDF supported</p>
                </div>
              )}
            </label>
          </div>

          {/* Signature Section */}
          <div className="border border-border rounded-xl p-5 bg-card shadow-sm">
            {!isMinor ? (
              <div>
                <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-primary" />
                  Patient Signature Section <span className="text-foreground">*</span>
                </h4>
                <div className="p-0">
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
                  <div className="p-0">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
