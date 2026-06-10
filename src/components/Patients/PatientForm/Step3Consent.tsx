import { Label } from "@/components/ui/Label";
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
            <Label className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:bg-muted/30 hover:border-primary/50 transition-all block group relative bg-background">
              <Input 
                type="file" 
                accept="image/*,.pdf" 
                onChange={handleConsentFormUpload} 
                className="hidden" 
              />
              {formData.consentFormUrl && formData.consentFormUrl !== "null" && formData.consentFormUrl !== "undefined" && formData.consentFormUrl !== "" ? (
                <div className="relative inline-block">
                   {formData.consentFormUrl.endsWith(".pdf") || formData.consentFormUrl.startsWith("data:application/pdf") ? (
                     <div className="h-32 w-48 bg-muted rounded-lg border border-border flex flex-col items-center justify-center p-4">
                       <ClipboardCheck className="w-8 h-8 text-primary mb-2 animate-pulse" />
                       <span className="text-xs font-semibold text-foreground text-center truncate w-full">Consent Form (PDF)</span>
                     </div>
                   ) : (
                     <img
                       src={formData.consentFormUrl}
                       alt="Consent Form"
                       className="h-32 object-contain mx-auto rounded-lg shadow-sm"
                       onError={(e) => {
                         // Fallback in case of broken image URL
                         (e.target as HTMLImageElement).style.display = 'none';
                         const parent = (e.target as HTMLImageElement).parentElement;
                         if (parent) {
                           const fallback = document.createElement('div');
                           fallback.className = "h-32 w-48 bg-muted rounded-lg border border-border flex flex-col items-center justify-center p-4";
                           fallback.innerHTML = `<svg class="w-8 h-8 text-muted-foreground mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg><span class="text-xs font-semibold text-muted-foreground text-center">Image Load Failed</span>`;
                           parent.appendChild(fallback);
                         }
                       }}
                     />
                   )}
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
            </Label>
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
                  <Label className="block text-sm font-semibold text-muted-foreground mb-2">
                    Guardian Full Name *
                  </Label>
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
