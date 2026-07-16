import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  AlertTriangle,
  Calendar,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Upload,
  User,
  Camera,
  X,
  CheckCircle,
} from "lucide-react";

interface Step1Props {
  formData: any;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  validationErrors: { [key: string]: string };
  matchedCorporateEmp: any;
  acceptCorporateEmployee: () => void;
  corporatePlans: any[];
  type?: string;
  handleCustomRelation: (value: string) => void;
  applyCustomRelation: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Step1BasicInfo: React.FC<Step1Props> = ({
  formData,
  handleChange,
  setFormData,
  validationErrors,
  matchedCorporateEmp,
  acceptCorporateEmployee,
  corporatePlans,
  type,
  handleCustomRelation,
  applyCustomRelation,
  handleImageUpload,
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 320, facingMode: "user" }
      });
      setCameraStream(stream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 320;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(320, 0);
        ctx.scale(-1, 1); // mirror capture
        ctx.drawImage(videoRef.current, 0, 0, 320, 320);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setFormData((prev: any) => ({ ...prev, avatar: dataUrl }));
        stopCamera();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Avatar moved to Step 3 */}
      <div className="text-center">
        <div className="relative inline-block">
          <div
            onClick={() => setShowPhotoOptions(true)}
            className="w-24 h-24 bg-gradient-to-r from-secondary to-ternary/20 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200 relative group"
          >
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Avatar"
                className="w-24 h-24 object-cover rounded-full"
              />
            ) : (
              <User className="w-12 h-12 text-primary" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setShowPhotoOptions(true)}
            className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-all duration-200 shadow-lg border-2 border-white h-auto"
            title="Update photo"
          >
            <Camera className="w-4 h-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              handleImageUpload(e);
              setShowPhotoOptions(false);
            }}
            className="hidden"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Click to update photo (Max 2MB)
        </p>
      </div>

      {showPhotoOptions && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-foreground uppercase tracking-wider">Select Photo Source</h4>
              <Button type="button" variant="ghost" onClick={() => setShowPhotoOptions(false)} className="p-1 h-auto hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowPhotoOptions(false); startCamera(); }}
                className="flex flex-col items-center justify-center gap-3 p-4 h-auto border border-border hover:border-primary hover:bg-primary/5 rounded-2xl group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-foreground text-center">Take Photo</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowPhotoOptions(false); fileInputRef.current?.click(); }}
                className="flex flex-col items-center justify-center gap-3 p-4 h-auto border border-border hover:border-primary hover:bg-primary/5 rounded-2xl group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-foreground text-center">Choose File</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-foreground uppercase tracking-wider">Capture Patient Photo</h4>
              <Button type="button" variant="ghost" onClick={stopCamera} className="p-1 h-auto hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="aspect-square w-full bg-black rounded-xl overflow-hidden relative border border-border">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={stopCamera}>
                Cancel
              </Button>
              <Button type="button" className="flex-1 gap-1.5" onClick={capturePhoto}>
                <Camera className="w-4 h-4" /> Capture
              </Button>
            </div>
          </div>
        </div>
      )}

      {matchedCorporateEmp &&
        (() => {
          let plan = null;

          if (matchedCorporateEmp.corporate_plan || matchedCorporateEmp.membership) {
            const cp = matchedCorporateEmp.corporate_plan || matchedCorporateEmp.membership;
            
            // Try to find the detailed plan from corporatePlans to get full benefits if not in cp
            const actualPlan = corporatePlans?.find((p: any) => p.id === cp.plan_id || p.id === cp.id);
            const benefitsSrc = cp.benefits || actualPlan?.benefits || [];
            
            plan = {
              name: cp.plan_name || actualPlan?.name || "Membership Plan",
              code: cp.plan_code || actualPlan?.code || "MEMBERSHIP",
              validTo: cp.valid_till || cp.expiry_date ? new Date(cp.valid_till || cp.expiry_date).toLocaleDateString("en-IN") : "Lifetime",
              benefits: benefitsSrc.map((b: any) => ({
                id: b.id || Math.random().toString(),
                description: b.benifit_label || b.description || `${b.discount_percentage}% off`,
              })),
              companyName: matchedCorporateEmp.company_name || cp.company_name || "Membership Plan",
              enrollmentId: cp.enrollment_id || matchedCorporateEmp.emp_id || matchedCorporateEmp.employeeId || matchedCorporateEmp.id
            };
          } else {
            const planId = matchedCorporateEmp.corporatePlanId || matchedCorporateEmp.companyId;
            const actualPlan = corporatePlans.find((cp: any) => cp.id === planId);
            if (actualPlan) {
              plan = {
                name: actualPlan.name,
                code: actualPlan.code || "MEMBERSHIP",
                validTo: "Lifetime",
                benefits: actualPlan.benefits?.map((b: any) => ({
                  id: b.id || Math.random().toString(),
                  description: b.benifit_label || b.description || `${b.discount_percentage}% off`,
                })) || [],
                companyName: actualPlan.companyName || actualPlan.name,
                enrollmentId: matchedCorporateEmp.emp_id || matchedCorporateEmp.employeeId || matchedCorporateEmp.id
              };
            }
          }

          return (
            <Card
              onClick={acceptCorporateEmployee}
              className="mx-6 overflow-hidden border-secondary bg-secondary/30 cursor-pointer hover:bg-secondary/40 select-none shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.01] hover:border-primary/50 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-primary">
                <ShieldCheck className="w-5 h-5 text-white flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    Membership/Corporate Found
                    <span className="text-[10px] bg-white text-primary px-2 py-0.5 rounded-full font-bold animate-pulse">
                      Click to Auto-Fill
                    </span>
                  </p>
                  <p className="text-xs text-primary-foreground/80 truncate">
                    {plan?.companyName} · ID: {plan?.enrollmentId}
                  </p>
                </div>
                {plan && (
                  <Badge
                    variant="outline"
                    className="bg-card/20 text-white border-white/30"
                  >
                    {plan.code}
                  </Badge>
                )}
              </div>
              {plan ? (
                <CardContent className="px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-primary">
                      {plan.name}
                    </p>
                    <span className="text-xs text-ternary font-medium">
                      Valid till {plan.validTo}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(plan.benefits || []).map((b: any) => (
                      <Badge
                        key={b.id}
                        variant="secondary"
                        className="bg-card text-primary border-primary/10"
                      >
                        {b.description}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-primary/70 font-medium italic">
                    ✓ Click anywhere on this card to auto-fill details. Discount will be applied automatically in billing.
                  </p>
                </CardContent>
              ) : (
                <CardContent className="px-4 py-3">
                  <p className="text-xs text-amber-700 font-medium">
                    Employee found but no active plan assigned. Click to fill available info.
                  </p>
                </CardContent>
              )}
            </Card>
          );
        })()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm font-semibold text-muted-foreground mb-1">
            <User className="w-4 h-4 inline mr-2" />
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
              handleChange(e);
            }}
            className={
              validationErrors.name ? "border-destructive bg-destructive/5" : ""
            }
            placeholder="Enter patient's full name"
          />
          {validationErrors.name && (
            <p className="text-destructive text-xs mt-1 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {validationErrors.name}
            </p>
          )}
        </div>

        <div className="relative">
          <Label className="block text-sm font-semibold text-muted-foreground mb-1">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            className={
              validationErrors.phone
                ? "border-destructive bg-destructive/5"
                : ""
            }
            placeholder="e.g. +1 (980) 333-2381"
          />
          {validationErrors.phone && (
            <p className="text-destructive text-xs mt-1 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {validationErrors.phone}
            </p>
          )}
        </div>

        <div>
          <Label className="block text-sm font-semibold text-muted-foreground mb-1">
            <Mail className="w-4 h-4 inline mr-2" />
            Email Address
          </Label>
          <Input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            className={
              validationErrors.email
                ? "border-destructive bg-destructive/5"
                : ""
            }
            placeholder="Enter email address"
          />
          {validationErrors.email && (
            <p className="text-destructive text-xs mt-1 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {validationErrors.email}
            </p>
          )}
        </div>

        <div>
          <Label className="block text-sm font-semibold text-muted-foreground mb-1">
            <Calendar className="w-4 h-4 inline mr-2" />
            Date of Birth
          </Label>
          <div className="relative">
            <Input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth || ""}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              className="focus:ring-primary w-full pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:z-10"
            />
            <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
          </div>
        </div>

        <div>
          <Label className="block text-sm font-semibold text-muted-foreground mb-1">
            Gender
          </Label>
          <Select
            value={formData.gender || ""}
            onValueChange={(val) => {
              setFormData((prev: any) => ({ ...prev, gender: val }));
            }}
          >
            <SelectTrigger className="w-full h-10 px-4 border border-input rounded-md focus:ring-2 focus:ring-primary bg-card text-sm text-left flex items-center justify-between">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="block text-sm font-semibold text-muted-foreground mb-1">
            Blood Group
          </Label>
          <Select
            value={formData.bloodGroup || ""}
            onValueChange={(val) => {
              setFormData((prev: any) => ({ ...prev, bloodGroup: val }));
            }}
          >
            <SelectTrigger className="w-full h-10 px-4 border border-input rounded-md focus:ring-2 focus:ring-primary bg-card text-sm text-left flex items-center justify-between">
              <SelectValue placeholder="Select Blood Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="O-">O-</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {type === "person" && (
          <div>
            <Label className="block text-sm font-semibold text-muted-foreground mb-1">
              Relation
            </Label>
            <Select
              value={formData.relation || ""}
              onValueChange={(val) => {
                setFormData((prev: any) => ({
                  ...prev,
                  relation: val,
                  customRelation: val === "OTHER" ? prev.customRelation : "",
                }));
              }}
            >
              <SelectTrigger className="w-full h-10 px-4 border border-input rounded-md focus:ring-2 focus:ring-primary bg-card text-sm text-left flex items-center justify-between">
                <SelectValue placeholder="Select Relation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SELF">Self</SelectItem>
                <SelectItem value="SPOUSE">Spouse</SelectItem>
                <SelectItem value="CHILD">Child</SelectItem>
                <SelectItem value="PARENT">Parent</SelectItem>
                <SelectItem value="SIBLING">Sibling</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
                {formData.relation &&
                  !["", "SELF", "SPOUSE", "CHILD", "PARENT", "SIBLING", "OTHER"].includes(formData.relation) && (
                    <SelectItem value={formData.relation}>
                      {formData.relation}
                    </SelectItem>
                  )}
              </SelectContent>
            </Select>
            {formData.relation === "OTHER" && (
              <div className="flex mt-3">
                <Input
                  type="text"
                  value={formData.customRelation || ""}
                  onChange={(e) => handleCustomRelation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyCustomRelation();
                    }
                  }}
                  placeholder="Enter custom relation"
                  className="rounded-r-none"
                />
                <Button
                  type="button"
                  onClick={applyCustomRelation}
                  className="px-4 bg-primary text-white rounded-r-md hover:bg-primary/90 transition-colors"
                >
                  →
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Membership Plan Selection */}
      {!matchedCorporateEmp && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
          <Label className="block text-sm font-bold text-primary flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Enroll in a Membership Plan (Optional)
          </Label>
          <p className="text-xs text-muted-foreground">
            Select a membership plan to automatically enroll the patient and apply exclusive benefits.
          </p>
          <SearchableSelect
            value={formData.selectedMembershipPlanId || "none"}
            onChange={(val) => {
              setFormData((prev: any) => ({
                ...prev,
                selectedMembershipPlanId: val === "none" ? undefined : val,
                category: val !== "none" ? "membership" : (prev.category === "corporate" || prev.category === "membership" ? "regular" : prev.category),
                defaultDiscount: val !== "none" ? 0 : prev.defaultDiscount,
              }));
            }}
            options={[
              { label: "No Membership Plan", value: "none", description: "Proceed without enrolling in any membership plan." },
              ...corporatePlans.filter((p: any) => p.isActive !== false).map((plan: any) => {
                const fee = plan.annual_fee || plan.annualFee || plan.fee || "0";
                const limit = plan.family_coverage_limit || plan.familyCoverageLimit || plan.limit;
                const benefits = plan.benefits || [];
                return {
                  label: `${plan.name}`,
                  value: plan.id,
                  planData: plan,
                  fee,
                  limit,
                  benefits
                };
              })
            ]}
            renderValue={(opt: any) => {
              if (opt.value === "none") return <span className="font-semibold text-muted-foreground">{opt.label}</span>;
              const { planData, fee, limit } = opt;
              return (
                <div className="flex items-center gap-2 truncate pr-2 w-full">
                  <span className="font-bold text-sm truncate">{planData.name}</span>
                  {planData.planType && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${planData.planType.toUpperCase() === 'INDIVIDUAL'
                        ? 'bg-purple-100 text-purple-700 border-purple-200'
                        : 'bg-amber-100 text-amber-700 border-amber-200'
                      } whitespace-nowrap`}>
                      {planData.planType}
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-100/50 text-green-700 whitespace-nowrap border border-green-200">
                    Fee: ₹{fee}/yr
                  </span>
                  {limit && limit > 1 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100/50 text-blue-700 whitespace-nowrap border border-blue-200">
                      Up to {limit} Members
                    </span>
                  )}
                </div>
              );
            }}
            renderOption={(opt: any) => {
              if (opt.value === "none") {
                return (
                  <div className="flex flex-col gap-1 w-full min-w-0 p-2 border border-transparent rounded-lg hover:bg-muted/50">
                    <span className="font-bold text-foreground text-sm">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.description}</span>
                  </div>
                );
              }

              const { planData, fee, limit, benefits } = opt;
              return (
                <div className="flex flex-col w-full min-w-0 p-3 border border-border rounded-lg bg-card shadow-sm hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <span className="font-bold text-foreground text-base leading-tight">{planData.name}</span>
                    <div className="flex gap-2 flex-wrap justify-end">
                      {planData.planType && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${planData.planType.toUpperCase() === 'INDIVIDUAL'
                            ? 'bg-purple-100 text-purple-700 border-purple-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                          } whitespace-nowrap`}>
                          {planData.planType}
                        </span>
                      )}
                      {fee !== undefined && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-100/80 text-green-800 border border-green-200 whitespace-nowrap">
                          Fee: ₹{fee}/yr
                        </span>
                      )}
                      {limit && limit > 1 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100/80 text-blue-800 border border-blue-200 whitespace-nowrap">
                          Up to {limit} Members
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">
                    <p className="font-semibold mb-1 text-foreground/80">Benefits included:</p>
                    <ul className="space-y-1">
                      {benefits.length > 0 ? benefits.map((b: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          <span className="leading-snug">{b.description || b.benifit_label}</span>
                        </li>
                      )) : (
                        <li className="italic">No specific benefits listed</li>
                      )}
                    </ul>
                  </div>
                </div>
              );
            }}
            placeholder="Select a plan..."
            searchPlaceholder="Search plans..."
            className="w-full bg-white"
          />
        </div>
      )}

      {/* Address */}
      <div>
        <Label className="block text-sm font-semibold text-muted-foreground mb-1">
          <MapPin className="w-4 h-4 inline mr-2" />
          Address
        </Label>
        <Textarea
          name="address"
          value={formData.address || ""}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 border border-input rounded-md focus:ring-2 focus:ring-primary bg-card text-sm"
          placeholder="Enter complete address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm font-semibold text-muted-foreground mb-1">
            Occupation
          </Label>
          <Input
            type="text"
            name="occupation"
            value={formData.occupation || ""}
            onChange={handleChange}
            placeholder="Enter occupation"
          />
        </div>

        <div>
          <Label className="block text-sm font-semibold text-muted-foreground mb-1">
            Marital Status
          </Label>
          <Select
            value={formData.maritalStatus || ""}
            onValueChange={(val) => {
              setFormData((prev: any) => ({ ...prev, maritalStatus: val }));
            }}
          >
            <SelectTrigger className="w-full h-10 px-4 border border-input rounded-md focus:ring-2 focus:ring-primary bg-card text-sm text-left flex items-center justify-between">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(() => {
          // Lock the category dropdown only if a plan or employee is actually attached
          const isCorporate = !!matchedCorporateEmp || !!formData.selectedMembershipPlanId || !!formData.corporatePlanId;
          return (
            <>
              <div>
                <Label className="block text-sm font-semibold text-muted-foreground mb-2">
                  Patient Category
                </Label>
                <Select
                  value={isCorporate ? "membership" : (formData.category?.toLowerCase() || "regular")}
                  onValueChange={(val) => {
                    setFormData((prev: any) => ({
                      ...prev,
                      category: val as any,
                      defaultDiscount: 0,
                    }));
                  }}
                  disabled={isCorporate}
                >
                  <SelectTrigger className="w-full h-10 px-4 border border-input rounded-md focus:ring-2 focus:ring-primary bg-card text-sm text-left flex items-center justify-between disabled:opacity-80 disabled:bg-muted">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="membership">Membership</SelectItem>
                    <SelectItem value="family">Family (Doctor's House)</SelectItem>
                    <SelectItem value="staff">Clinic Staff</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="complimentary">Complimentary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="block text-sm font-semibold text-muted-foreground">
                    Default Discount (%)
                  </Label>
                </div>
                <Input
                  type="number"
                  name="defaultDiscount"
                  value={formData.defaultDiscount === "" ? "" : (formData.defaultDiscount ?? 0)}
                  onChange={(e) => {
                    const val = e.target.value === "" ? "" : parseInt(e.target.value, 10);
                    setFormData((prev: any) => ({ ...prev, defaultDiscount: val }));
                  }}
                  disabled={isCorporate}
                  min="0"
                  max="100"
                  placeholder="e.g. 10 for 10% discount"
                  className="disabled:opacity-80 disabled:bg-muted"
                />
              </div>
            </>
          );
        })()}
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm font-semibold text-muted-foreground mb-1">
            <User className="w-4 h-4 inline mr-2" />
            Emergency Contact Name
          </Label>
          <Input
            type="text"
            name="emergencyName"
            value={formData.emergencyName || ""}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^A-Za-z\s-]/g, "");
              setFormData((prev: any) => ({ ...prev, emergencyName: cleaned }));
            }}
            placeholder="Emergency contact person name"
          />
        </div>
        <div>
          <Label className="block text-sm font-semibold text-muted-foreground mb-1">
            <User className="w-4 h-4 inline mr-2" />
            Emergency Contact Relation
          </Label>
          <div className="space-y-3">
            <Select
              value={formData.emergencyRelation || ""}
              onValueChange={(val) => {
                setFormData((prev: any) => ({
                  ...prev,
                  emergencyRelation: val,
                  customEmergencyRelation:
                    val === "Other" ? prev.customEmergencyRelation : "",
                }));
              }}
            >
              <SelectTrigger className="w-full h-10 px-4 border border-input rounded-md focus:ring-2 focus:ring-primary bg-card text-sm text-left flex items-center justify-between">
                <SelectValue placeholder="Select Relation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Father">Father</SelectItem>
                <SelectItem value="Mother">Mother</SelectItem>
                <SelectItem value="Brother">Brother</SelectItem>
                <SelectItem value="Sister">Sister</SelectItem>
                <SelectItem value="Husband">Husband</SelectItem>
                <SelectItem value="Wife">Wife</SelectItem>
                <SelectItem value="Guardian">Guardian</SelectItem>
                <SelectItem value="Friend">Friend</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                {formData.emergencyRelation &&
                  ![
                    "",
                    "Father",
                    "Mother",
                    "Brother",
                    "Sister",
                    "Husband",
                    "Wife",
                    "Guardian",
                    "Friend",
                    "Other",
                  ].includes(formData.emergencyRelation) && (
                    <SelectItem value={formData.emergencyRelation}>
                      {formData.emergencyRelation}
                    </SelectItem>
                  )}
              </SelectContent>
            </Select>
            {formData.emergencyRelation === "Other" && (
              <div className="flex animate-in fade-in slide-in-from-top-2">
                <Input
                  type="text"
                  value={formData.customEmergencyRelation || ""}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      customEmergencyRelation: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (formData.customEmergencyRelation?.trim()) {
                        setFormData((prev: any) => ({
                          ...prev,
                          emergencyRelation: prev.customEmergencyRelation,
                          customEmergencyRelation: "",
                        }));
                      }
                    }
                  }}
                  className="rounded-r-none"
                  placeholder="Enter custom relation"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (formData.customEmergencyRelation.trim()) {
                      setFormData((prev: any) => ({
                        ...prev,
                        emergencyRelation: prev.customEmergencyRelation,
                        customEmergencyRelation: "",
                      }));
                    }
                  }}
                  className="px-4 bg-primary text-white rounded-r-md hover:bg-primary/90 transition-colors"
                >
                  →
                </Button>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label className="block text-sm font-semibold text-muted-foreground mb-1">
            <Phone className="w-4 h-4 inline mr-2" />
            Emergency Contact Number
          </Label>
          <Input
            type="tel"
            name="emergencyContact"
            value={formData.emergencyContact || ""}
            onChange={(e) => {
              const digits = e.target.value.replace(/[a-zA-Z]/g, '');
              setFormData((prev: any) => ({ ...prev, emergencyContact: digits }));
            }}
            placeholder="Emergency contact phone number"
          />
        </div>
      </div>
    </div>
  );
};
