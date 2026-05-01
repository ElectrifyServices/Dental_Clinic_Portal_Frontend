import React, { useState, useEffect } from 'react';
import { generatePatientId, generateBarcode, calculateAge } from './utils';

export const usePatientForm = (patient: any, corporateEmployees: any[], onSave: (patient: any) => void) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    emergencyName: '',
    emergencyRelation: '',
    customEmergencyRelation: '',
    medicalHistory: '',
    pastDentalHistory: '',
    allergies: '',
    allergyOther: '',
    allergyNotes: '',
    patientId: generatePatientId(),
    barcode: '',
    bloodGroup: '',
    relation: '',
    customRelation: '',
    occupation: '',
    maritalStatus: '',
    insuranceProvider: '',
    insuranceNumber: '',
    referredBy: '',
    avatar: '',
    dentalFiles: [] as any[],
    previousDoctorName: '',
    previousClinicName: '',
    previousDoctorPhone: '',
    previousClinicAddress: '',
    previousLastVisitDate: '',
    previousReason: '',
    previousTreatments: [] as string[],
    consentCorrectDetails: false,
    consentExamination: false,
    consentRisks: false,
    consentStorage: false,
    consentEmergency: false,
    optWhatsApp: true,
    optPhotos: false,
    patientSignature: '',
    guardianName: '',
    guardianSignature: '',
    category: 'regular' as 'regular' | 'family' | 'staff' | 'vip' | 'complimentary' | 'corporate',
    defaultDiscount: 0,
    corporatePlanId: '',
    corporatePlanName: '',
    corporateMemberId: '',
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [lastAutoFilledEmpId, setLastAutoFilledEmpId] = useState<string | null>(null);
  const [matchedCorporateEmp, setMatchedCorporateEmp] = useState<any>(null);

  useEffect(() => {
    if (patient) {
      setFormData(prev => ({
        ...prev,
        ...patient,
        patientId: patient.id || generatePatientId(),
        medicalHistory: patient.medicalHistory?.join('\n') || '',
        allergies: patient.allergies?.join('\n') || '',
        dentalFiles: patient.dentalFiles || [],
        pastDentalHistory: patient.pastDentalHistory || '',
        previousTreatments: patient.previousTreatments || [],
      }));
    }
  }, [patient]);

  useEffect(() => {
    if (!formData.barcode && formData.patientId) {
      setFormData(prev => ({ ...prev, barcode: generateBarcode(prev.patientId) }));
    }
  }, [formData.patientId]);

  // Corporate Lookup logic
  useEffect(() => {
    const searchPhone = formData.phone?.trim();
    const searchEmail = formData.email?.trim().toLowerCase();

    if ((searchPhone && searchPhone.length >= 10) || (searchEmail && searchEmail.includes('@'))) {
      const emp = corporateEmployees.find(e => 
        (searchPhone && e.phone === searchPhone) || 
        (searchEmail && e.email?.toLowerCase() === searchEmail)
      );

      if (emp) {
        setMatchedCorporateEmp(emp);
        if (lastAutoFilledEmpId !== emp.id) {
          setFormData(prev => ({
            ...prev,
            name: prev.name || emp.name,
            gender: prev.gender || emp.gender?.toLowerCase(),
            dateOfBirth: prev.dateOfBirth || emp.dateOfBirth,
            occupation: prev.occupation || emp.designation,
            category: 'corporate',
            corporatePlanId: emp.corporatePlanId || emp.companyId,
            corporatePlanName: emp.companyName,
            corporateMemberId: emp.employeeId || emp.id,
          }));
          setLastAutoFilledEmpId(emp.id);
        }
      } else {
        setMatchedCorporateEmp(null);
        setLastAutoFilledEmpId(null);
      }
    } else {
      setMatchedCorporateEmp(null);
      setLastAutoFilledEmpId(null);
    }
  }, [formData.phone, formData.email, corporateEmployees]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateStep = (stepNumber: number) => {
    const errors: {[key: string]: string} = {};
    
    if (stepNumber === 1) {
      if (!formData.name.trim()) errors.name = 'Name is required';
      if (!formData.phone.trim()) errors.phone = 'Phone number is required';
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    if (stepNumber === 3) {
      const age = calculateAge(formData.dateOfBirth);
      if (age > 0 && age < 18) {
        if (!formData.guardianName.trim()) errors.guardianName = 'Guardian name is required';
        if (!formData.guardianSignature) errors.guardianSignature = 'Guardian signature is required';
      } else {
        if (!formData.patientSignature) {
          errors.patientSignature = 'Patient signature is required';
        }
      }
    }
    
    return errors;
  };

  const handleNext = (step: number, setStep: (s: number) => void) => {
    const errors = validateStep(step);
    setValidationErrors(errors);
    if (Object.keys(errors).length === 0) {
      setStep(step + 1);
    }
  };

  const handlePrevious = (step: number, setStep: (s: number) => void) => {
    setStep(step - 1);
  };

  const applyCustomRelation = () => {
    if (formData.customRelation.trim()) {
      setFormData(prev => ({
        ...prev,
        relation: prev.customRelation,
        customRelation: ''
      }));
    }
  };

  const handleCustomRelation = (value: string) => {
    setFormData(prev => ({
      ...prev,
      customRelation: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDentalFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          dentalFiles: [...(prev.dentalFiles || []), { name: file.name, type: file.type, data: reader.result }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  return {
    formData,
    setFormData,
    loading,
    setLoading,
    validationErrors,
    matchedCorporateEmp,
    handleChange,
    handleNext,
    handlePrevious,
    applyCustomRelation,
    handleCustomRelation,
    handleImageUpload,
    handleDentalFilesUpload,
  };
};
