import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import React, { useState } from 'react';
import { User, Mail, Phone, Upload, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const generatePassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";
    const all = uppercase + lowercase + numbers + symbols;
    
    // Ensure we have at least one of each type for a strong password
    let pass = "";
    pass += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    pass += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    pass += numbers.charAt(Math.floor(Math.random() * numbers.length));
    pass += symbols.charAt(Math.floor(Math.random() * symbols.length));
    
    for (let i = 0; i < 6; i++) {
      pass += all.charAt(Math.floor(Math.random() * all.length));
    }
    
    // Shuffle the characters
    return pass.split('').sort(() => 0.5 - Math.random()).join('');
  };

  const handleGenerate = (e: React.MouseEvent) => {
    e.preventDefault();
    const newPass = generatePassword();
    onChange({ target: { name: 'password', value: newPass } });
    onChange({ target: { name: 'confirmPassword', value: newPass } });
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col items-center">
        <div className="relative group">
          <div className="w-32 h-32 bg-primary/5 rounded-[2.5rem] border-2 border-dashed border-primary/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/40 shadow-inner">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className="text-3xl font-black text-primary/20 flex items-center justify-center w-full h-full"
              style={{ display: formData.avatar ? 'none' : 'flex' }}
            >
              {formData.name ? getInitials(formData.name) : <User className="w-12 h-12" />}
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer backdrop-blur-[2px]"
            >
              <Upload className="w-6 h-6 text-white mb-1" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Upload Photo</span>
            </div>
          </div>
          <Input ref={fileInputRef} type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Identity Details</h3>
          <p className="text-xs text-muted-foreground font-medium">Configure primary contact and profile visuals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LabeledField label="Full Name" required error={errors.name?.message}>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="text" name="name" value={formData.name} onChange={onChange} required
               className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none ${errors.name ? 'border-destructive ring-destructive/20' : ''}`}
              placeholder="e.g. Dr. Sameer Khan" />
          </div>
        </LabeledField>

        <LabeledField label="Email Address" error={errors.email?.message}>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="email" name="email" value={formData.email} onChange={onChange}
               className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none ${errors.email ? 'border-destructive ring-destructive/20' : ''}`}
              placeholder="sameer@clinic.com" />
          </div>
        </LabeledField>

        <div className="md:col-span-2">
          <LabeledField label="Phone Number" required error={errors.phone?.message}>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input type="tel" name="phone" value={formData.phone}
                maxLength={10}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  e.target.value = val;
                  onChange(e);
                }}
                required
                 className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none ${errors.phone ? 'border-destructive ring-destructive/20' : ''}`}
                placeholder="9876543210" />
            </div>
          </LabeledField>
        </div>
      </div>

      {!isEdit && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dashed">
          <LabeledField label="Secure Password" required error={errors.password?.message}>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={onChange}
                required
                className={`w-full px-4 pr-24 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none ${errors.password ? 'border-destructive ring-destructive/20' : ''}`}
                placeholder="••••••••"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-lg transition-colors"
                >
                  Generate
                </button>
                <Button
                  variant="ghost"
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </LabeledField>

          <LabeledField label="Confirm Password" required error={errors.confirmPassword?.message}>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={onChange}
                required
                className={`w-full px-4 pr-10 py-2.5 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none ${errors.confirmPassword ? 'border-destructive ring-destructive/20' : ''}`}
                placeholder="••••••••"
              />
              <Button
                variant="ghost"
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </LabeledField>
        </div>
      )}
    </div>
  );
}
