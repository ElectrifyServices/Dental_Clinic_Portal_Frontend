import React, { useState, useRef } from 'react';
import { Save, User, Shield, FileText, Stethoscope, ChevronRight, ChevronLeft } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import { Step1Personal } from './StaffForm/Step1Personal';
import { Step2Role } from './StaffForm/Step2Role';
import { Step3Documentation } from './StaffForm/Step3Documentation';
import { Step4Professional } from './StaffForm/Step4Professional';

interface DoctorFormProps {
  onClose: () => void;
  onSave: (doctor: any) => void;
  doctor?: any;
}

const STEPS = [
  { number: 1, title: 'Personal', icon: User },
  { number: 2, title: 'Access', icon: Shield },
  { number: 3, title: 'Legal', icon: FileText },
  { number: 4, title: 'Clinical', icon: Stethoscope }
];

export function DoctorForm({ onClose, onSave, doctor }: DoctorFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: doctor?.name || '',
    email: doctor?.email || '',
    phone: doctor?.phone || '',
    role: doctor?.role || 'doctor',
    specialization: doctor?.specialization || '',
    password: '',
    confirmPassword: '',
    permissions: doctor?.permissions || ['appointments', 'patients', 'treatments', 'emr'],
    uniqueId: doctor?.uniqueId || `STAFF${Date.now().toString().slice(-6)}`,
    documents: doctor?.documents || [],
    profitSharing: doctor?.profitSharing || false,
    profitPercentage: doctor?.profitPercentage || 0,
    licenseNumber: doctor?.licenseNumber || '',
    monthlySalary: doctor?.monthlySalary || '',
    salaryPaid: doctor?.salaryPaid || '0',
    salaryPending: doctor?.salaryPending || '0',
    education: doctor?.education || '',
    experience: doctor?.experience || '',
    department: doctor?.department || '',
    designation: doctor?.designation || '',
    qualification: doctor?.qualification || '',
    consultationFee: doctor?.consultationFee || '',
    isActive: doctor?.isActive !== undefined ? doctor.isActive : true,
    avatar: doctor?.avatar || doctor?.image || ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }

    if (!doctor && formData.password !== formData.confirmPassword) return alert('Passwords do not match');
    if (!doctor && !formData.password) return alert('Password is required');

    onSave({
      ...formData,
      id: doctor?.id || Date.now().toString(),
      salaryPending: !doctor ? (parseFloat(formData.monthlySalary) || 0).toLocaleString('en-IN') : formData.salaryPending,
      permissions: formData.role === 'admin' ? ['all'] : formData.permissions,
      workingHours: doctor?.workingHours || {
        monday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        thursday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        friday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        saturday: { isWorking: false, startTime: '09:00', endTime: '18:00' },
        sunday: { isWorking: false, startTime: '09:00', endTime: '18:00' }
      },
      timeSlots: doctor?.timeSlots || { duration: 30, bufferTime: 5 }
    });
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePermissionChange = (id: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked ? [...prev.permissions, id] : prev.permissions.filter(p => p !== id)
    }));
  };

  const handleDocumentUpload = (docType: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        documents: [
          ...prev.documents.filter((d: any) => d.type !== docType),
          { type: docType, name: file.name, url: reader.result, size: file.size }
        ]
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentRemove = (docType: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((d: any) => d.type !== docType)
    }));
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return <Step1Personal formData={formData} onChange={handleChange} fileInputRef={fileInputRef} onImageUpload={handleImageUpload} isEdit={!!doctor} />;
      case 2: return <Step2Role formData={formData} onChange={(role) => setFormData(p => ({ ...p, role }))} onPermissionChange={handlePermissionChange} />;
      case 3: return <Step3Documentation role={formData.role} documents={formData.documents} onUpload={handleDocumentUpload} onRemove={handleDocumentRemove} />;
      case 4: return <Step4Professional formData={formData} onChange={handleChange} />;
      default: return null;
    }
  };

  return (
    <Modal
      title={doctor ? 'Update Staff Member' : 'Staff Onboarding'}
      onClose={onClose}
      size="2xl"
      icon={<User className="w-4 h-4" />}
      footer={
        <div className="flex justify-between items-center w-full">
          <Button variant="outline" onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()} disabled={currentStep === 1 && !doctor} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> {currentStep === 1 ? 'Cancel' : 'Previous Step'}
          </Button>
          <div className="flex gap-3">
            <Button onClick={handleSubmit} className="gap-2">
              {currentStep < 4 ? <><ChevronRight className="w-4 h-4" /> Next Step</> : <><Save className="w-4 h-4" /> {doctor ? 'Save Changes' : 'Register Member'}</>}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = currentStep === s.number;
            const isDone = currentStep > s.number;
            return (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center gap-1.5 relative group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-muted text-muted-foreground'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : isDone ? 'text-emerald-600' : 'text-muted-foreground'}`}>{s.title}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded-full mx-2 ${isDone ? 'bg-emerald-500' : 'bg-muted'}`} />}
              </React.Fragment>
            );
          })}
        </div>
        <div className="min-h-[400px]">{renderCurrentStep()}</div>
      </div>
    </Modal>
  );
}