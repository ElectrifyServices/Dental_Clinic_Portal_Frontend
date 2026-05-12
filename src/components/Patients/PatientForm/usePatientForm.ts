import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, type PatientFormData } from '@/lib/schemas/patient.schema';
import { generatePatientId, generateBarcode, calculateAge } from './utils';

export const usePatientForm = (patient: any, corporateEmployees: any[], onSave: (patient: any) => void) => {
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [lastAutoFilledEmpId, setLastAutoFilledEmpId] = useState<string | null>(null);
  const [matchedCorporateEmp, setMatchedCorporateEmp] = useState<any>(null);

  // Extra non-schema fields needed by the form
  const [extraData, setExtraData] = useState({
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

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
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
      dentalFiles: [],
      previousDoctorName: '',
      previousClinicName: '',
      previousDoctorPhone: '',
      previousClinicAddress: '',
      previousLastVisitDate: '',
      previousReason: '',
      previousTreatments: [],
    },
  });

  // Provide a formData-compatible object for all sub-components
  const formData = { ...form.watch(), ...extraData } as any;
  const setFormData = (updater: any) => {
    const current = form.getValues();
    const updated = typeof updater === 'function' ? updater({ ...current, ...extraData }) : updater;
    // Split schema fields vs extra fields
    const schemaKeys = Object.keys(patientSchema.shape);
    const schemaUpdates: Partial<PatientFormData> = {};
    const extraUpdates: Partial<typeof extraData> = {};
    for (const [k, v] of Object.entries(updated)) {
      if (schemaKeys.includes(k)) (schemaUpdates as any)[k] = v;
      else (extraUpdates as any)[k] = v;
    }
    if (Object.keys(schemaUpdates).length) {
      Object.entries(schemaUpdates).forEach(([k, v]) => form.setValue(k as keyof PatientFormData, v as any));
    }
    if (Object.keys(extraUpdates).length) {
      setExtraData(prev => ({ ...prev, ...extraUpdates }));
    }
  };

  useEffect(() => {
    if (patient) {
      const schemaKeys = Object.keys(patientSchema.shape);
      const schemaUpdates: Partial<PatientFormData> = {};
      const extraUpdates: Partial<typeof extraData> = {};
      const merged = {
        ...patient,
        patientId: patient.id || generatePatientId(),
        medicalHistory: patient.medicalHistory?.join('\n') ?? '',
        allergies: patient.allergies?.join('\n') ?? '',
        dentalFiles: patient.dentalFiles ?? [],
        pastDentalHistory: patient.pastDentalHistory ?? '',
        previousTreatments: patient.previousTreatments ?? [],
      };
      for (const [k, v] of Object.entries(merged)) {
        if (schemaKeys.includes(k)) (schemaUpdates as any)[k] = v;
        else (extraUpdates as any)[k] = v;
      }
      Object.entries(schemaUpdates).forEach(([k, v]) => form.setValue(k as keyof PatientFormData, v as any));
      if (Object.keys(extraUpdates).length) setExtraData(prev => ({ ...prev, ...extraUpdates }));
    }
  }, [patient]);

  useEffect(() => {
    const patientId = form.watch('patientId');
    if (!form.getValues('barcode') && patientId) {
      form.setValue('barcode', generateBarcode(patientId));
    }
  }, [form.watch('patientId')]);

  // Corporate Lookup logic
  useEffect(() => {
    const searchPhone = form.getValues('phone')?.trim();
    const searchEmail = form.getValues('email')?.trim().toLowerCase();
    if ((searchPhone && searchPhone.length >= 10) || (searchEmail && searchEmail.includes('@'))) {
      const emp = corporateEmployees.find(e =>
        (searchPhone && e.phone === searchPhone) ||
        (searchEmail && e.email?.toLowerCase() === searchEmail)
      );
      if (emp) {
        setMatchedCorporateEmp(emp);
        if (lastAutoFilledEmpId !== emp.id) {
          if (!form.getValues('name')) form.setValue('name', emp.name);
          if (!form.getValues('gender')) form.setValue('gender', emp.gender?.toLowerCase());
          if (!form.getValues('dateOfBirth')) form.setValue('dateOfBirth', emp.dateOfBirth);
          if (!form.getValues('occupation')) form.setValue('occupation', emp.designation);
          setExtraData(prev => ({
            ...prev,
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
  }, [form.watch('phone'), form.watch('email'), corporateEmployees]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    const schemaKeys = Object.keys(patientSchema.shape);
    if (schemaKeys.includes(name)) {
      form.setValue(name as keyof PatientFormData, val as any, { shouldValidate: true });
    } else {
      setExtraData(prev => ({ ...prev, [name]: val }));
    }
    if (validationErrors[name]) {
      setValidationErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const validateStep = (stepNumber: number) => {
    const errors: {[key: string]: string} = {};
    if (stepNumber === 1) {
      if (!form.getValues('name')?.trim()) errors.name = 'Name is required';
      if (!form.getValues('phone')?.trim()) errors.phone = 'Phone number is required';
      const email = form.getValues('email');
      if (email && !/\S+@\S+\.\S+/.test(email)) errors.email = 'Please enter a valid email address';
    }
    if (stepNumber === 3) {
      const age = calculateAge(form.getValues('dateOfBirth') ?? '');
      if (age > 0 && age < 18) {
        if (!extraData.guardianName?.trim()) errors.guardianName = 'Guardian name is required';
        if (!extraData.guardianSignature) errors.guardianSignature = 'Guardian signature is required';
      } else {
        if (!extraData.patientSignature) errors.patientSignature = 'Patient signature is required';
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
    const customRelation = form.getValues('customRelation') ?? '';
    if (customRelation.trim()) {
      form.setValue('relation', customRelation);
      form.setValue('customRelation', '');
    }
  };

  const handleCustomRelation = (value: string) => {
    form.setValue('customRelation', value);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { form.setValue('avatar', reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleDentalFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const current = form.getValues('dentalFiles') ?? [];
        form.setValue('dentalFiles', [...current, { name: file.name, type: file.type, data: reader.result }]);
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
