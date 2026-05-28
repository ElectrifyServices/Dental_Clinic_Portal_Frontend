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
        <div className="w-20 h-20 bg-gradient-to-r from-secondary to-ternary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-primary" />
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
                  <CheckCircle className="w-3.5 h-3.5 text-primary" />
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
                  {formData.emergencyName} ({formData.emergencyRelation})
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
                <div className="p-3 bg-muted border border-border rounded-xl">
                  <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest block mb-1">
                    Past Dental History
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {formData.pastDentalHistory ||
                      "No previous history provided"}
                  </p>
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
                <div className="bg-card rounded-lg p-2 border border-secondary shadow-inner">
                  {formData.patientSignature || formData.guardianSignature ? (
                    <img
                      src={formData.patientSignature || formData.guardianSignature}
                      alt="Signature"
                      className="h-16 mx-auto object-contain"
                    />
                  ) : (
                    <p className="text-xs text-destructive text-center py-4">
                      Signature not captured
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
