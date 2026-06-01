import React from "react";
import { User, Phone, Heart, ClipboardCheck, CheckCircle } from "lucide-react";
import { calculateAge } from "./utils";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useMedicalHistoriesQuery } from "../../../hooks/patients/useMedicalHistoriesQuery";
import { useAllergiesQuery } from "../../../hooks/patients/useAllergiesQuery";

interface Step4Props {
  formData: any;
  isCheckIn?: boolean;
}

const DentalFileThumbnail: React.FC<{ file: any; index: number }> = ({ file, index }) => {
  const [failed, setFailed] = React.useState(false);
  const src = file.data || file.url || file;
  const isImage = typeof src === 'string' && (src.startsWith('data:image/') || src.match(/\.(jpeg|jpg|gif|png)$/i));

  return (
    <div className="relative border border-secondary rounded-lg overflow-hidden h-16 bg-background flex items-center justify-center group shadow-sm">
      {isImage && !failed ? (
        <img
          src={src}
          alt={file.name || `Dental File ${index + 1}`}
          className="w-full h-full object-cover animate-in fade-in duration-200"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-1 text-center animate-in fade-in duration-200">
          <ClipboardCheck className="w-5 h-5 text-primary/40 mb-0.5" />
          {failed && (
            <span className="text-[7px] text-destructive font-bold uppercase tracking-wider">
              Load Failed
            </span>
          )}
        </div>
      )}
      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] truncate px-1 text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {file.name || `File ${index + 1}`}
      </span>
    </div>
  );
};

export const Step4Review: React.FC<Step4Props> = ({ formData, isCheckIn }) => {
  const { data: rawMedicalHistories } = useMedicalHistoriesQuery();
  const { data: rawAllergies } = useAllergiesQuery();

  const extractList = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as any).all)) return (data as any).all;
    if (data && Array.isArray((data as any).data?.all)) return (data as any).data.all;
    if (data && Array.isArray((data as any).data)) return (data as any).data;
    if (data && Array.isArray((data as any).responseObject?.data?.all)) return (data as any).responseObject.data.all;
    if (data && Array.isArray((data as any).responseObject?.data)) return (data as any).responseObject.data;
    if (data?.allergies && Array.isArray(data.allergies)) return data.allergies;
    if (data?.history && Array.isArray(data.history)) return data.history;
    if (data?.medicalHistories && Array.isArray(data.medicalHistories)) return data.medicalHistories;
    return [];
  };

  const getAllergyName = (id: string) => {
    const list = extractList(rawAllergies);
    const found = list.find((a: any) => a.id === id);
    return found ? (found.allergy_name || found.name || id) : id;
  };

  const getMedicalHistoryName = (id: string) => {
    const list = extractList(rawMedicalHistories);
    const found = list.find((m: any) => m.id === id);
    return found ? (found.name || found.history_name || id) : id;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-24 h-24 bg-gradient-to-r from-secondary to-ternary/20 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
          {formData.avatar ? (
            <img
              src={formData.avatar}
              alt="Patient Profile"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="w-12 h-12 text-primary" />
          )}
        </div>
        <h3 className="text-xl font-bold text-foreground">
          {isCheckIn ? "Verify & Confirm Check-in" : "Review & Finalize"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isCheckIn
            ? "Review patient history and details before checking in"
            : "Please review all information before saving"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-secondary bg-card shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Patient Personal Details
              </h4>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary font-bold"
              >
                {formData.patientId}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  Full Name
                </span>
                <p className="font-semibold text-foreground">{formData.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  Phone Number
                </span>
                <p className="font-semibold text-foreground flex items-center gap-2">
                  {formData.phone}

                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  Email Address
                </span>
                <p className="font-semibold text-foreground truncate">
                  {formData.email || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  Gender / Age
                </span>
                <p className="font-semibold text-foreground capitalize">
                  {formData.gender || "N/A"} /{" "}
                  {calculateAge(formData.dateOfBirth)}Y
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  Blood Group
                </span>
                <p className="font-semibold text-foreground">
                  {formData.bloodGroup || "Not provided"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  Marital Status
                </span>
                <p className="font-semibold text-foreground capitalize">
                  {formData.maritalStatus || "N/A"}
                </p>
              </div>
              <div className="col-span-2 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  Occupation
                </span>
                <p className="font-semibold text-foreground">
                  {formData.occupation || "N/A"}
                </p>
              </div>
              <div className="col-span-2 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  Residential Address
                </span>
                <p className="font-semibold text-foreground text-sm">
                  {formData.address || "N/A"}
                </p>
              </div>
              <div className="col-span-2 p-3 bg-secondary/20 border border-secondary rounded-xl">
                <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest block mb-1">
                  Emergency Contact
                </span>
                <p className="font-bold text-foreground text-sm">
                  {formData.emergencyName ? (
                    <>
                      {formData.emergencyName}
                      {formData.emergencyRelation ? ` (${formData.emergencyRelation})` : ""}
                    </>
                  ) : (
                    formData.emergencyRelation || "Not provided"
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />{" "}
                  {formData.emergencyContact || "Not provided"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-secondary bg-card shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-destructive" />
                Medical Status
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-destructive/5 border border-destructive/10 rounded-xl">
                    <span className="text-[10px] font-bold text-destructive/60 uppercase tracking-widest block mb-1">
                      Allergies
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {formData.allergies
                        .split("\n")
                        .filter((a: string) => a.trim()).length > 0 ? (
                        formData.allergies
                          .split("\n")
                          .filter((a: string) => a.trim())
                          .map((a: string) => (
                            <Badge
                              key={a}
                              variant="destructive"
                              className="text-[10px] px-2 py-0"
                            >
                              {getAllergyName(a)}
                            </Badge>
                          ))
                      ) : (
                        <span className="text-xs text-muted-foreground/60">
                          None reported
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/20 border border-secondary rounded-xl">
                    <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest block mb-1">
                      Medical Conditions
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {formData.medicalHistory
                        .split("\n")
                        .filter((m: string) => m.trim()).length > 0 ? (
                        formData.medicalHistory
                          .split("\n")
                          .filter((m: string) => m.trim())
                          .map((m: string) => (
                            <Badge
                              key={m}
                              variant="secondary"
                              className="text-[10px] px-2 py-0"
                            >
                              {getMedicalHistoryName(m)}
                            </Badge>
                          ))
                      ) : (
                        <span className="text-xs text-muted-foreground/60">
                          No conditions
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-primary/5 border-2 border-primary/20 border-l-primary border-l-4 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:bg-primary/10">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1.5">
                    Past Dental History
                  </span>
                  <p className="text-sm text-foreground font-semibold leading-relaxed">
                    {formData.pastDentalHistory ||
                      "No previous history provided"}
                  </p>
                  
                  {formData.dentalFiles && formData.dentalFiles.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-primary/10">
                      <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest block mb-2">
                        Uploaded Images / X-rays
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        {formData.dentalFiles.map((file: any, index: number) => (
                          <DentalFileThumbnail key={index} file={file} index={index} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-secondary bg-card shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-primary" />
                Declarations & Consents
              </h4>
              {formData.previousDoctorName ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      Doctor / Clinic
                    </span>
                    <p className="font-semibold text-foreground text-sm">
                      {formData.previousDoctorName}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/60 italic">
                  No previous dentist details provided
                </p>
              )}
              <div className="p-3 bg-secondary/20 border border-secondary rounded-xl mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">
                    {formData.guardianSignature ? "Guardian Signature" : "Patient Signature"}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-bold border-primary/20 ${formData.patientSignature || formData.guardianSignature ? "text-primary" : "text-destructive border-destructive"}`}
                  >
                    {formData.patientSignature || formData.guardianSignature ? "SIGNED" : "PENDING"}
                  </Badge>
                </div>
                <div className="bg-card rounded-lg p-2 border border-secondary shadow-inner min-h-[4.5rem] flex items-center justify-center">
                  {(() => {
                    const signature = formData.patientSignature || formData.guardianSignature;
                    const isValidSig = signature && signature !== "null" && signature !== "undefined" && signature !== "";
                    if (isValidSig) {
                      return (
                        <div className="relative w-full flex items-center justify-center">
                          <img
                            src={signature}
                            alt="Signature"
                            className="h-16 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                const fallback = document.createElement('p');
                                fallback.className = "text-xs text-destructive text-center py-4 font-semibold animate-in fade-in duration-200";
                                fallback.innerText = "Signature image failed to load / Invalid format";
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        </div>
                      );
                    }
                    return (
                      <p className="text-xs text-destructive text-center py-4">
                        Signature not captured
                      </p>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
