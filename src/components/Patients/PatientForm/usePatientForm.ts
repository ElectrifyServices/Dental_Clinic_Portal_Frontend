import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  patientSchema,
  type PatientFormData,
} from "@/lib/schemas/patient.schema";
import { generatePatientId, generateBarcode, calculateAge } from "./utils";
import { useCheckEmployeeQuery } from "@/hooks/patients/useCheckEmployeeQuery";

const REVERSE_BLOOD_GROUP_MAP: Record<string, string> = {
  "A_POSITIVE": "A+",
  "A_NEGATIVE": "A-",
  "B_POSITIVE": "B+",
  "B_NEGATIVE": "B-",
  "AB_POSITIVE": "AB+",
  "AB_NEGATIVE": "AB-",
  "O_POSITIVE": "O+",
  "O_NEGATIVE": "O-",
};

export const usePatientForm = (patient: any, corporateEmployees: any[]) => {
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [lastAutoFilledEmpId, setLastAutoFilledEmpId] = useState<string | null>(
    null,
  );
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
    patientSignature: "",
    guardianName: "",
    guardianSignature: "",
    category: "regular" as
      | "regular"
      | "family"
      | "staff"
      | "vip"
      | "complimentary"
      | "corporate",
    defaultDiscount: 0,
    corporatePlanId: "",
    corporatePlanName: "",
    corporateMemberId: "",
    isFOC: false,
    rawAvatarFile: null as File | null,
    rawDentalFiles: [] as File[],
    rawConsentFormFile: null as File | null,
    consentFormUrl: "",
  });

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      emergencyContact: "",
      emergencyName: "",
      emergencyRelation: "",
      customEmergencyRelation: "",
      medicalHistory: "",
      pastDentalHistory: "",
      allergies: "",
      allergyOther: "",
      allergyNotes: "",
      patientId: generatePatientId(),
      barcode: "",
      bloodGroup: "",
      relation: "",
      customRelation: "",
      occupation: "",
      maritalStatus: "",
      insuranceProvider: "",
      insuranceNumber: "",
      referredBy: "",
      avatar: "",
      dentalFiles: [],
      previousDoctorName: "",
      previousClinicName: "",
      previousDoctorPhone: "",
      previousClinicAddress: "",
      previousLastVisitDate: "",
      previousReason: "",
      previousTreatments: [],
    },
  });

  // Provide a formData-compatible object for all sub-components
  const formData = { ...form.watch(), ...extraData } as any;
  const setFormData = (updater: any) => {
    const current = form.getValues();
    const updated =
      typeof updater === "function"
        ? updater({ ...current, ...extraData })
        : updater;
    // Split schema fields vs extra fields
    const schemaKeys = Object.keys(patientSchema.shape);
    const schemaUpdates: Partial<PatientFormData> = {};
    const extraUpdates: Partial<typeof extraData> = {};
    for (const [k, v] of Object.entries(updated)) {
      if (schemaKeys.includes(k)) (schemaUpdates as any)[k] = v;
      else (extraUpdates as any)[k] = v;
    }
    if (Object.keys(schemaUpdates).length) {
      Object.entries(schemaUpdates).forEach(([k, v]) =>
        form.setValue(k as keyof PatientFormData, v as any),
      );
    }
    if (Object.keys(extraUpdates).length) {
      setExtraData((prev) => ({ ...prev, ...extraUpdates }));
    }
  };

  useEffect(() => {
    if (patient) {
      const schemaKeys = Object.keys(patientSchema.shape);
      const schemaUpdates: Partial<PatientFormData> = {};
      const extraUpdates: Partial<typeof extraData> = {};

      const getHistoryString = (historyField: any) => {
        if (!historyField) return "";
        if (typeof historyField === "string") return historyField;
        if (Array.isArray(historyField)) {
          return historyField.map((m: any) => {
            if (typeof m === "object" && m !== null) {
              return m.history_id || m.medical_history_id || m.id || m.name || "";
            }
            return String(m);
          }).join("\n");
        }
        return "";
      };

      const getAllergiesString = (allergiesField: any) => {
        if (!allergiesField) return "";
        if (typeof allergiesField === "string") return allergiesField;
        if (Array.isArray(allergiesField)) {
          return allergiesField.map((a: any) => {
            if (typeof a === "object" && a !== null) {
              return a.allergy_id || a.id || a.allergy_name || a.name || "";
            }
            return String(a);
          }).join("\n");
        }
        return "";
      };

      const merged = {
        ...patient,
        name: patient.name || patient.full_name || "",
        email: patient.email || "",
        phone: patient.phone || patient.mobile || "",
        avatar: patient.profile_picture || patient.avatar || "",
        gender: patient.gender ? patient.gender.toLowerCase() : "",
        dateOfBirth: (patient.date_of_birth || patient.dateOfBirth) ? (patient.date_of_birth || patient.dateOfBirth).split("T")[0] : "",
        previousLastVisitDate: (patient.last_visit_date || patient.previousLastVisitDate) ? (patient.last_visit_date || patient.previousLastVisitDate).split("T")[0] : "",
        patientSignature: patient.consent_signature_url || patient.consent_signature_image || patient.patientSignature || "",
        consentFormUrl: patient.consent_form_url || patient.consent_form_image || patient.consentFormUrl || "",
        patientId: patient.patient_id || patient.patientId || generatePatientId(),
        medicalHistory: getHistoryString(patient.medicalHistories || patient.medical_histories || patient.medicalHistory),
        allergies: getAllergiesString(patient.allergies),
        dentalFiles: patient.dentalFiles || patient.dental_files || [],
        pastDentalHistory: patient.past_dental_history || patient.pastDentalHistory || "",
        previousTreatments: (patient.previous_treatments || patient.previousTreatments || []).map((t: any) => typeof t === 'object' ? (t.treatment_name || t.name || t.id || '') : t),
        previousDoctorName: patient.previous_doctor_name || patient.previousDoctorName || "",
        previousClinicName: patient.clinic_name || patient.previousClinicName || "",
        previousDoctorPhone: patient.doctor_phone || patient.previousDoctorPhone || "",
        previousClinicAddress: patient.clinic_address || patient.previousClinicAddress || "",
        previousReason: patient.reason_for_treatment || patient.previousReason || "",
        emergencyName: patient.emergency_contact_name || patient.emergencyName || "",
        emergencyContact: patient.emergency_contact_phone || patient.emergencyContact || "",
        emergencyRelation: patient.emergency_contact_relation || patient.emergencyRelation || "",
        bloodGroup: REVERSE_BLOOD_GROUP_MAP[patient.blood_group] || patient.blood_group || patient.bloodGroup || "",
        maritalStatus: patient.marital_status ? patient.marital_status.toLowerCase() : (patient.maritalStatus ? patient.maritalStatus.toLowerCase() : ""),
        referredBy: patient.referred_by || patient.referredBy || "",
        category: patient.patient_category ? patient.patient_category.toLowerCase() : (patient.category || "regular"),
        defaultDiscount: patient.discount_percentage !== undefined ? patient.discount_percentage : (patient.defaultDiscount !== undefined ? patient.defaultDiscount : 0),
        isFOC: patient.is_foc || patient.isFOC || false,
      };

      for (const [k, v] of Object.entries(merged)) {
        if (schemaKeys.includes(k)) (schemaUpdates as any)[k] = v;
        else (extraUpdates as any)[k] = v;
      }
      Object.entries(schemaUpdates).forEach(([k, v]) =>
        form.setValue(k as keyof PatientFormData, v as any),
      );
      if (Object.keys(extraUpdates).length)
        setExtraData((prev) => ({ ...prev, ...extraUpdates }));
    }
  }, [patient]);

  useEffect(() => {
    const patientId = form.watch("patientId");
    if (!form.getValues("barcode") && patientId) {
      form.setValue("barcode", generateBarcode(patientId));
    }
  }, [form.watch("patientId")]);

  const searchPhone = form.watch("phone")?.trim();
  const phoneToSearch = searchPhone && searchPhone.length >= 10 ? searchPhone : "";
  const { data: checkEmployeeResponse } = useCheckEmployeeQuery(phoneToSearch);

  // Corporate Lookup logic using API
  useEffect(() => {
    // We get response wrapped in responseObject.data
    const data = checkEmployeeResponse?.responseObject?.data || checkEmployeeResponse?.data || checkEmployeeResponse;
    const emp = data?.employee || data?.member || (data?.is_member === undefined && data?.is_employee === undefined && Object.keys(data || {}).length > 0 ? data : null);
    const isEmployee = data?.is_employee ?? data?.is_member ?? !!emp;
    
    if (phoneToSearch && emp && isEmployee && !emp.error && Object.keys(emp).length > 0) {
      setMatchedCorporateEmp(emp);
    } else {
      setMatchedCorporateEmp(null);
      setLastAutoFilledEmpId(null);
    }
  }, [checkEmployeeResponse, phoneToSearch]);

  const acceptCorporateEmployee = () => {
    if (!matchedCorporateEmp) return;
    const emp = matchedCorporateEmp;
    
    if (emp.name || emp.full_name) form.setValue("name", emp.name || emp.full_name);
    if (emp.gender) form.setValue("gender", emp.gender.toLowerCase());
    if (emp.date_of_birth) form.setValue("dateOfBirth", emp.date_of_birth.split("T")[0]);
    if (emp.designation) form.setValue("occupation", emp.designation);
    if (emp.email) form.setValue("email", emp.email);
    
    const plan = emp.corporate_plan || emp.membership || {};
    
    setExtraData((prev) => ({
      ...prev,
      category: "corporate",
      corporatePlanId: plan.plan_id || plan.id || emp.corporate_plan_id || emp.corporatePlanId || emp.company_id,
      corporatePlanName: plan.plan_name || emp.company_name || emp.companyName || "Corporate Plan",
      corporateMemberId: emp.id || emp.emp_id || emp.employee_id || emp.employeeId,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    const schemaKeys = Object.keys(patientSchema.shape);
    if (schemaKeys.includes(name)) {
      form.setValue(name as keyof PatientFormData, val as any, {
        shouldValidate: true,
      });
    } else {
      setExtraData((prev) => ({ ...prev, [name]: val }));
    }
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
  };

  const validateStep = (stepNumber: number) => {
    const errors: { [key: string]: string } = {};
    if (stepNumber === 1) {
      if (!form.getValues("name")?.trim()) errors.name = "Name is required";
      if (!form.getValues("phone")?.trim())
        errors.phone = "Phone number is required";
      const email = form.getValues("email");
      if (email && !/\S+@\S+\.\S+/.test(email))
        errors.email = "Please enter a valid email address";
    }
    if (stepNumber === 2) {
      const prevDocName = form.getValues("previousDoctorName")?.trim();
      const prevClinicName = form.getValues("previousClinicName")?.trim();
      const prevPhone = form.getValues("previousDoctorPhone")?.trim();
      const prevAddress = form.getValues("previousClinicAddress")?.trim();
      const prevDate = form.getValues("previousLastVisitDate")?.trim();
      const anyFilled = prevDocName || prevClinicName || prevPhone || prevAddress || prevDate;
      
      if (anyFilled) {
        if (!prevDocName) errors.previousDoctorName = "Previous Doctor Name is required";
        if (!prevClinicName) errors.previousClinicName = "Clinic Name is required";
        if (!prevAddress) errors.previousClinicAddress = "Clinic Address is required";
        if (!prevDate) errors.previousLastVisitDate = "Last Visit Date is required";
      }
    }
    if (stepNumber === 3) {
      const age = calculateAge(form.getValues("dateOfBirth") ?? "");
      if (age > 0 && age < 18) {
        if (!extraData.guardianName?.trim())
          errors.guardianName = "Guardian name is required";
        if (!extraData.guardianSignature)
          errors.guardianSignature = "Guardian signature is required";
      } else {
        if (!extraData.patientSignature)
          errors.patientSignature = "Patient signature is required";
      }
    }
    return errors;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const modalContainers = document.querySelectorAll(".overflow-y-auto");
    modalContainers.forEach((el) => {
      el.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleNext = (step: number, setStep: (s: number) => void) => {
    const errors = validateStep(step);
    setValidationErrors(errors);
    if (Object.keys(errors).length === 0) {
      setStep(step + 1);
      setTimeout(scrollToTop, 50);
    }
  };

  const handlePrevious = (step: number, setStep: (s: number) => void) => {
    setStep(step - 1);
    setTimeout(scrollToTop, 50);
  };

  const applyCustomRelation = () => {
    const customRelation = form.getValues("customRelation") ?? "";
    if (customRelation.trim()) {
      form.setValue("relation", customRelation);
      form.setValue("customRelation", "");
    }
  };

  const handleCustomRelation = (value: string) => {
    form.setValue("customRelation", value);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExtraData((prev) => ({ ...prev, rawAvatarFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("avatar", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConsentFormUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExtraData((prev) => ({ ...prev, rawConsentFormFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setExtraData((prev) => ({ ...prev, consentFormUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDentalFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setExtraData((prev) => ({
      ...prev,
      rawDentalFiles: [...(prev.rawDentalFiles || []), ...files],
    }));
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const current = form.getValues("dentalFiles") ?? [];
        form.setValue("dentalFiles", [
          ...current,
          { name: file.name, type: file.type, data: reader.result },
        ]);
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
    acceptCorporateEmployee,
    handleChange,
    handleNext,
    handlePrevious,
    applyCustomRelation,
    handleCustomRelation,
    handleImageUpload,
    handleConsentFormUpload,
    handleDentalFilesUpload,
  };
};
