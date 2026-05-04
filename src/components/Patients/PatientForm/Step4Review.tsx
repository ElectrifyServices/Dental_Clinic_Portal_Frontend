import React from 'react';
import { User, Phone, Heart, History, ClipboardCheck, CheckCircle, AlertTriangle } from 'lucide-react';
import { calculateAge } from './utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Step4Props {
  formData: any;
  isCheckIn?: boolean;
}

export const Step4Review: React.FC<Step4Props> = ({
  formData,
  isCheckIn
}) => {
  const age = calculateAge(formData.dateOfBirth);
  const isMinor = age > 0 && age < 18;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-secondary to-ternary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{isCheckIn ? 'Verify & Confirm Check-in' : 'Review & Finalize'}</h3>
        <p className="text-sm text-gray-500">{isCheckIn ? 'Review patient history and details before checking in' : 'Please review all information before saving'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-secondary bg-white shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Patient Personal Details
              </h4>
              <Badge variant="secondary" className="bg-primary/10 text-primary font-bold">
                {formData.patientId}
              </Badge>
            </div>
          
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</span>
              <p className="font-semibold text-gray-900">{formData.name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</span>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                {formData.phone}
                <CheckCircle className="w-3.5 h-3.5 text-primary" />
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</span>
              <p className="font-semibold text-gray-900 truncate">{formData.email || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender / Age</span>
              <p className="font-semibold text-gray-900 capitalize">{formData.gender || 'N/A'} / {calculateAge(formData.dateOfBirth)}Y</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Blood Group</span>
              <p className="font-semibold text-gray-900">{formData.bloodGroup || 'Not provided'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Marital Status</span>
              <p className="font-semibold text-gray-900 capitalize">{formData.maritalStatus || 'N/A'}</p>
            </div>
            <div className="col-span-2 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Occupation</span>
              <p className="font-semibold text-gray-900">{formData.occupation || 'N/A'}</p>
            </div>
            <div className="col-span-2 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Residential Address</span>
              <p className="font-semibold text-gray-900 text-sm">{formData.address || 'N/A'}</p>
            </div>
            <div className="col-span-2 p-3 bg-secondary/20 border border-secondary rounded-xl">
              <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest block mb-1">Emergency Contact</span>
              <p className="font-bold text-gray-900 text-sm">{formData.emergencyName} ({formData.emergencyRelation})</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Phone className="w-3 h-3" /> {formData.emergencyContact || 'Not provided'}
              </p>
            </div>
          </div>
        </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-secondary bg-white shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-destructive" />
                Medical Status
              </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-destructive/5 border border-destructive/10 rounded-xl">
                  <span className="text-[10px] font-bold text-destructive/60 uppercase tracking-widest block mb-1">Allergies</span>
                  <div className="flex flex-wrap gap-1">
                    {formData.allergies.split('\n').filter((a: string) => a.trim()).length > 0 ? (
                      formData.allergies.split('\n').filter((a: string) => a.trim()).map((a: string) => (
                        <Badge key={a} variant="destructive" className="text-[10px] px-2 py-0">
                          {a}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">None reported</span>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-secondary/20 border border-secondary rounded-xl">
                  <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest block mb-1">Medical Conditions</span>
                  <div className="flex flex-wrap gap-1">
                    {formData.medicalHistory.split('\n').filter((m: string) => m.trim()).length > 0 ? (
                      formData.medicalHistory.split('\n').filter((m: string) => m.trim()).map((m: string) => (
                        <Badge key={m} variant="secondary" className="text-[10px] px-2 py-0">
                          {m}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No conditions</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Past Dental History</span>
                <p className="text-sm text-gray-700 leading-relaxed">{formData.pastDentalHistory || 'No previous history provided'}</p>
              </div>
            </div>
          </CardContent>
          </Card>

          <Card className="border-secondary bg-white shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-primary" />
                Declarations & Consents
              </h4>
            {formData.previousDoctorName ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doctor / Clinic</span>
                  <p className="font-semibold text-gray-900 text-sm">{formData.previousDoctorName}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No previous dentist details provided</p>
            )}
              <div className="p-3 bg-secondary/20 border border-secondary rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Signature</span>
                  <Badge variant="outline" className="text-[9px] font-bold border-primary/20 text-primary">SIGNED</Badge>
                </div>
                <div className="bg-white rounded-lg p-2 border border-secondary shadow-inner">
                  {formData.patientSignature ? (
                    <img src={formData.patientSignature} alt="Signature" className="h-16 mx-auto object-contain" />
                  ) : (
                    <p className="text-xs text-destructive text-center py-4">Signature not captured</p>
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
