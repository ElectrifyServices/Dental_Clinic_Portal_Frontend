import React from 'react';
import { User, Phone } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface PatientInfoFieldsProps {
  patientName: string;
  patientPhone: string;
  isFollowUp: boolean;
  isConsulted: boolean;
  suggestion: { name: string, phone: string } | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (val: string) => void;
  onAcceptSuggestion: () => void;
}

export const PatientInfoFields: React.FC<PatientInfoFieldsProps> = ({
  patientName,
  patientPhone,
  isFollowUp,
  isConsulted,
  suggestion,
  onChange,
  onPhoneChange,
  onAcceptSuggestion,
}) => {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Patient Information</h4>
        <div className="flex-1 h-px bg-gray-100 ml-2" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Patient Name</label>
          <Input
            name="patientName"
            value={patientName}
            onChange={onChange}
            required
            disabled={isFollowUp}
            placeholder="Search or enter name"
            className="h-11 rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white"
          />
          {suggestion && (
            <div 
              className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={onAcceptSuggestion}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-blue-700">{suggestion.phone}</span>
              </div>
              <span className="text-[10px] font-bold text-blue-500 uppercase">Auto-fill</span>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
          <Input
            name="patientPhone"
            value={patientPhone}
            onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ''))}
            required
            disabled={isFollowUp || isConsulted}
            placeholder="98765 43210"
            className="h-11 rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white"
          />
        </div>
      </div>
    </section>
  );
};
