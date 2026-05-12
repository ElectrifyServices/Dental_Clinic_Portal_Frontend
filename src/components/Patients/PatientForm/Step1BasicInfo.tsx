import React from 'react';
import { CorporatePlanSelector } from '../../CorporatePlans/CorporatePlanSelector';
import { calculateAge } from './utils';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { AlertTriangle, Calendar, Mail, MapPin, Phone, ShieldCheck, Upload, User } from 'lucide-react';

interface Step1Props {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  validationErrors: { [key: string]: string };
  matchedCorporateEmp: any;
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
  corporatePlans,
  type,
  handleCustomRelation,
  applyCustomRelation,
  handleImageUpload
}) => {
  return (
    <div className="space-y-6">
      {/* Avatar Upload */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gradient-to-r from-secondary to-ternary/20 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
            {formData.avatar ? (
              <img src={formData.avatar} alt="Avatar" className="w-24 h-24 object-cover rounded-full" />
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
        <p className="text-sm text-muted-foreground mt-2">Upload patient photo (optional)</p>
      </div>

      {matchedCorporateEmp && (() => {
        const planId = matchedCorporateEmp.corporatePlanId || matchedCorporateEmp.companyId;
        const plan = corporatePlans.find((cp: any) => cp.id === planId);
        return (
          <Card className="mx-6 overflow-hidden border-secondary bg-secondary/30">
            <div className="flex items-center gap-3 px-4 py-3 bg-primary">
              <ShieldCheck className="w-5 h-5 text-white flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">Corporate Employee Identified</p>
                <p className="text-xs text-primary-foreground/80">{matchedCorporateEmp.companyName || plan?.companyName} · EMP: {matchedCorporateEmp.employeeId || matchedCorporateEmp.id}</p>
              </div>
              {plan && (
                <Badge variant="outline" className="bg-card/20 text-white border-white/30">
                  {plan.code}
                </Badge>
              )}
            </div>
            {plan ? (
              <CardContent className="px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-primary">{plan.name}</p>
                  <span className="text-xs text-ternary font-medium">Valid till {plan.validTo}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(plan.benefits || []).map((b: any) => (
                    <Badge key={b.id} variant="secondary" className="bg-card text-primary border-primary/10">
                      {b.description}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-primary/70 font-medium italic">
                  ✓ Discount will be applied automatically in billing.
                </p>
              </CardContent>
            ) : (
              <CardContent className="px-4 py-3">
                <p className="text-xs text-amber-700 font-medium">Employee found but no active plan assigned.</p>
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
            value={formData.name || ''}
            onChange={handleChange}
            className={validationErrors.name ? 'border-destructive bg-destructive/5' : ''}
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
            value={formData.phone || ''}
            onChange={handleChange}
            className={validationErrors.phone ? 'border-destructive bg-destructive/5' : ''}
            placeholder="+91 98765 43210"
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
            value={formData.email || ''}
            onChange={handleChange}
            className={validationErrors.email ? 'border-destructive bg-destructive/5' : ''}
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
            value={formData.dateOfBirth || ''}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className="focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender || ''}
            onChange={handleChange}
            className="w-full h-10 px-4 border border-input rounded-md focus:ring-2 focus:ring-primary bg-card text-sm"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2">
            Blood Group
          </label>
          <select
            name="bloodGroup"
            value={formData.bloodGroup || ''}
            onChange={handleChange}
            className="w-full h-10 px-4 border border-input rounded-md focus:ring-2 focus:ring-primary bg-card text-sm"
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        {type === 'person' && (
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              Relation
            </label>
            <select
              name="relation"
              value={formData.relation || ''}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev: any) => ({
                  ...prev,
                  relation: value,
                  customRelation: value === 'Other' ? prev.customRelation : ''
                }));
              }}
              className="w-full h-10 px-4 border border-input rounded-md focus:ring-2 focus:ring-primary bg-card text-sm"
            >
              <option value="">Select Relation</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Brother">Brother</option>
              <option value="Sister">Sister</option>
              <option value="Wife">Wife</option>
              <option value="Husband">Husband</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
              {formData.relation && !['', 'Father', 'Mother', 'Brother', 'Sister', 'Wife', 'Husband', 'Friend', 'Other'].includes(formData.relation) && (
                <option value={formData.relation}>{formData.relation}</option>
              )}
            </select>
            {formData.relation === 'Other' && (
              <div className="flex mt-3">
                <Input
                  type="text"
                  value={formData.customRelation || ''}
                  onChange={(e) => handleCustomRelation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
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
          value={formData.address || ''}
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
            value={formData.occupation || ''}
            onChange={handleChange}
            placeholder="Enter occupation"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2">
            Marital Status
          </label>
          <select
            name="maritalStatus"
            value={formData.maritalStatus || ''}
            onChange={handleChange}
            className="w-full h-10 px-4 border border-input rounded-md focus:ring-2 focus:ring-primary bg-card text-sm"
          >
            <option value="">Select Status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>

        {!matchedCorporateEmp && (
          <>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2">
                Patient Category
              </label>
              <select
                name="category"
                value={formData.category || 'regular'}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev: any) => ({
                    ...prev,
                    category: val as any,
                    defaultDiscount: (val === 'family' || val === 'staff') ? 100 : prev.defaultDiscount
                  }));
                }}
                className="w-full h-10 px-4 border border-input rounded-md focus:ring-2 focus:ring-primary bg-card text-sm"
              >
                <option value="regular">Regular</option>
                <option value="corporate">Corporate</option>
                <option value="family">Family (Doctor's House)</option>
                <option value="staff">Clinic Staff</option>
                <option value="vip">VIP</option>
                <option value="complimentary">Complimentary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2">
                Default Discount (%)
              </label>
              <Input
                type="number"
                name="defaultDiscount"
                value={formData.defaultDiscount || 0}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="e.g. 100 for full free"
              />
            </div>
          </>
        )}
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
            value={formData.emergencyName || ''}
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
            <select
              name="emergencyRelation"
              value={formData.emergencyRelation || ''}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev: any) => ({
                  ...prev,
                  emergencyRelation: val,
                  customEmergencyRelation: val === 'Other' ? prev.customEmergencyRelation : ''
                }));
              }}
              className="w-full h-10 px-4 border border-input rounded-md focus:ring-2 focus:ring-primary bg-card text-sm"
            >
              <option value="">Select Relation</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Brother">Brother</option>
              <option value="Sister">Sister</option>
              <option value="Husband">Husband</option>
              <option value="Wife">Wife</option>
              <option value="Guardian">Guardian</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
              {formData.emergencyRelation && !['', 'Father', 'Mother', 'Brother', 'Sister', 'Husband', 'Wife', 'Guardian', 'Friend', 'Other'].includes(formData.emergencyRelation) && (
                <option value={formData.emergencyRelation}>{formData.emergencyRelation}</option>
              )}
            </select>
            {formData.emergencyRelation === 'Other' && (
              <div className="flex animate-in fade-in slide-in-from-top-2">
                <Input
                  type="text"
                  value={formData.customEmergencyRelation || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, customEmergencyRelation: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (formData.customEmergencyRelation?.trim()) {
                        setFormData((prev: any) => ({ ...prev, emergencyRelation: prev.customEmergencyRelation, customEmergencyRelation: '' }));
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
                      setFormData((prev: any) => ({ ...prev, emergencyRelation: prev.customEmergencyRelation, customEmergencyRelation: '' }));
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
            value={formData.emergencyContact || ''}
            onChange={handleChange}
            placeholder="Emergency contact phone number"
          />
        </div>
      </div>
    </div>
  );
};
