import React from 'react';
import { User, Mail, Phone, Upload } from 'lucide-react';
import { LabeledField } from '@/components/ui';

interface Step1Props {
  formData: any;
  onChange: (e: any) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onImageUpload: (e: any) => void;
  isEdit?: boolean;
  errors?: any;
}

export function Step1Personal({ formData, onChange, fileInputRef, onImageUpload, isEdit, errors = {} }: Step1Props) {
  const getInitials = (name: string) => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col items-center">
        <div className="relative group">
          <div className="w-32 h-32 bg-primary/5 rounded-[2.5rem] border-2 border-dashed border-primary/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/40 shadow-inner">
            {formData.avatar ? (
              <img src={formData.avatar} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-3xl font-black text-primary/20">{formData.name ? getInitials(formData.name) : <User className="w-12 h-12" />}</div>
            )}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer backdrop-blur-[2px]"
            >
              <Upload className="w-6 h-6 text-white mb-1" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Upload Photo</span>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Identity Details</h3>
          <p className="text-xs text-muted-foreground font-medium">Configure primary contact and profile visuals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LabeledField label="Full Name *" required error={errors.name?.message}>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" name="name" value={formData.name} onChange={onChange} required
              className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none ${errors.name ? 'border-destructive ring-destructive/20' : ''}`}
              placeholder="e.g. Dr. Sameer Khan" />
          </div>
        </LabeledField>

        <LabeledField label="Email Address *" required error={errors.email?.message}>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="email" name="email" value={formData.email} onChange={onChange} required
              className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none ${errors.email ? 'border-destructive ring-destructive/20' : ''}`}
              placeholder="sameer@clinic.com" />
          </div>
        </LabeledField>

        <LabeledField label="Phone Number *" required error={errors.phone?.message}>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="tel" name="phone" value={formData.phone} onChange={onChange} required
              className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none ${errors.phone ? 'border-destructive ring-destructive/20' : ''}`}
              placeholder="+91 98765 43210" />
          </div>
        </LabeledField>

        <LabeledField label="Staff ID (Unique)" error={errors.uniqueId?.message}>
          <input type="text" name="uniqueId" value={formData.uniqueId} readOnly
            className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono font-bold bg-muted/50 cursor-not-allowed" />
        </LabeledField>
      </div>

      {!isEdit && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dashed">
          <LabeledField label="Secure Password *" required error={errors.password?.message}>
            <input type="password" name="password" value={formData.password} onChange={onChange} required
              className={`w-full px-4 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none ${errors.password ? 'border-destructive ring-destructive/20' : ''}`}
              placeholder="••••••••" />
          </LabeledField>
          <LabeledField label="Confirm Password *" required error={errors.confirmPassword?.message}>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={onChange} required
              className={`w-full px-4 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none ${errors.confirmPassword ? 'border-destructive ring-destructive/20' : ''}`}
              placeholder="••••••••" />
          </LabeledField>
        </div>
      )}
    </div>
  );
}
