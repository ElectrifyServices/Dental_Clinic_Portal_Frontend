import React from "react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  AlertTriangle,
  Calendar,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Upload,
  User,
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
  return (
    <div className="space-y-6">
      {/* Avatar moved to Step 3 */}
       <div className="text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gradient-to-r from-secondary to-ternary/20 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Avatar"
                className="w-24 h-24 object-cover rounded-full"
              />
            ) : (
              <User className="w-12 h-12 text-primary" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-all duration-200 shadow-lg border-2 border-white">
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Upload patient photo (optional)
        </p>
      </div>

      {matchedCorporateEmp &&
        (() => {
          let plan = null;
          
          if (matchedCorporateEmp.corporate_plan) {
            const cp = matchedCorporateEmp.corporate_plan;
            plan = {
              name: cp.plan_name,
              code: cp.plan_code || "CORP",
              validTo: cp.valid_till ? new Date(cp.valid_till).toLocaleDateString() : "Lifetime",
              benefits: cp.benefits?.map((b: any) => ({
                id: b.id || Math.random().toString(),
                description: b.benifit_label || b.description || `${b.discount_percentage}% off`,
              })) || [],
              companyName: matchedCorporateEmp.company_name
            };
          } else {
            const planId = matchedCorporateEmp.corporatePlanId || matchedCorporateEmp.companyId;
            plan = corporatePlans.find((cp: any) => cp.id === planId);
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
                    Corporate Employee Identified
                    <span className="text-[10px] bg-white text-primary px-2 py-0.5 rounded-full font-bold animate-pulse">
                      Click to Auto-Fill
                    </span>
                  </p>
                  <p className="text-xs text-primary-foreground/80">
                    {matchedCorporateEmp.company_name || plan?.companyName} ·
                    EMP:{" "}
                    {matchedCorporateEmp.emp_id || matchedCorporateEmp.employeeId || matchedCorporateEmp.id}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Full Name *
          </label>
          <Input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
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
          <label className="block text-sm font-semibold text-muted-foreground mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number *
          </label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone || ""}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              setFormData((prev: any) => ({ ...prev, phone: digits }));
            }}
            disabled={!!formData.id}
            className={
              validationErrors.phone
                ? "border-destructive bg-destructive/5"
                : (!!formData.id ? "bg-muted cursor-not-allowed opacity-70" : "")
            }
            placeholder="e.g. 9876543210"
          />
          {validationErrors.phone && (
            <p className="text-destructive text-xs mt-1 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {validationErrors.phone}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email Address
          </label>
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
          <label className="block text-sm font-semibold text-muted-foreground mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Date of Birth
          </label>
          <Input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth || ""}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
            className="focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2">
            Gender
          </label>
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
          <label className="block text-sm font-semibold text-muted-foreground mb-2">
            Blood Group
          </label>
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
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              Relation
            </label>
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
                <button
                  type="button"
                  onClick={applyCustomRelation}
                  className="px-4 bg-primary text-white rounded-r-md hover:bg-primary/90 transition-colors"
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-muted-foreground mb-2">
          <MapPin className="w-4 h-4 inline mr-2" />
          Address
        </label>
        <textarea
          name="address"
          value={formData.address || ""}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 border border-input rounded-md focus:ring-2 focus:ring-primary bg-card text-sm"
          placeholder="Enter complete address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2">
            Occupation
          </label>
          <Input
            type="text"
            name="occupation"
            value={formData.occupation || ""}
            onChange={handleChange}
            placeholder="Enter occupation"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2">
            Marital Status
          </label>
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
          const isCorporate = !!matchedCorporateEmp || formData.category === 'corporate';
          return (
            <>
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-2">
                  Patient Category
                </label>
                <Select
                  value={isCorporate ? "corporate" : (formData.category?.toLowerCase() || "regular")}
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
                    {isCorporate && <SelectItem value="corporate">Corporate</SelectItem>}
                    <SelectItem value="family">Family (Doctor's House)</SelectItem>
                    <SelectItem value="staff">Clinic Staff</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="complimentary">Complimentary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-muted-foreground">
                    Default Discount (%)
                  </label>
                  <label className={`flex items-center gap-1.5 cursor-pointer bg-primary/5 px-2 py-0.5 rounded border border-primary/20 hover:bg-primary/10 transition-colors ${isCorporate ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input
                      type="checkbox"
                      name="isFOC"
                      checked={formData.isFOC || false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData((prev: any) => ({
                          ...prev,
                          isFOC: checked,
                          defaultDiscount: checked ? 100 : 0,
                        }));
                      }}
                      disabled={isCorporate}
                      className="w-3.5 h-3.5 accent-primary cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-primary tracking-wide uppercase">FOC (Free)</span>
                  </label>
                </div>
                <Input
                  type="number"
                  name="defaultDiscount"
                  value={formData.defaultDiscount || 0}
                  onChange={(e) => {
                    const val = e.target.value === "" ? "" : parseInt(e.target.value, 10);
                    setFormData((prev: any) => ({ ...prev, defaultDiscount: val }));
                  }}
                  disabled={isCorporate || formData.isFOC}
                  min="0"
                  max="100"
                  placeholder="e.g. 100 for full free"
                  className="disabled:opacity-80 disabled:bg-muted"
                />
              </div>
            </>
          );
        })()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Emergency Contact Name
          </label>
          <Input
            type="text"
            name="emergencyName"
            value={formData.emergencyName || ""}
            onChange={handleChange}
            placeholder="Emergency contact person name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Emergency Contact Relation
          </label>
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
                <button
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
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Emergency Contact Number
          </label>
            <Input
              type="tel"
              name="emergencyContact"
              value={formData.emergencyContact || ""}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                setFormData((prev: any) => ({ ...prev, emergencyContact: digits }));
              }}
              placeholder="Emergency contact phone number"
            />
        </div>
      </div>
    </div>
  );
};
