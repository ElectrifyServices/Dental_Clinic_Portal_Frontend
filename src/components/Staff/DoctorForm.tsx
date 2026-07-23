import React, { useState, useRef } from "react";
import {
  Save,
  User,
  Shield,
  FileText,
  Stethoscope,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Modal, Button, Loading } from "@/components/ui";
import { Step1Personal } from "./StaffForm/Step1Personal";
import { Step2Role } from "./StaffForm/Step2Role";
import { Step3Documentation, REQUIRED_DOCS } from "./StaffForm/Step3Documentation";
import { Step4Professional } from "./StaffForm/Step4Professional";
import {
  useFormConfig,
  useFormTitle,
  useSubmitLabel,
} from "../../hooks/useFormConfig";
import {
  staffSchema,
  type StaffFormData,
  staffStep1Fields,
  staffStep2Fields,
  staffStep3Fields,
} from "@/lib/schemas/staff.schema";
import { useCreateStaffMutation } from "../../hooks/staff/useCreateStaffMutation";
import { useUpdateStaffMutation } from "../../hooks/staff/useUpdateStaffMutation";
import { useRolesQuery, fetchRolesList } from "@/hooks/roles/useRolesQuery";
import { useSpecializationsQuery } from "@/hooks/specializations/useSpecializationsQuery";
import { useSingleStaffQuery } from "../../hooks/staff/useSingleStaffQuery";
import { useModal } from "@/contexts/ModalContext";

interface DoctorFormProps {
  onClose: () => void;
  onSave: (doctor: any) => void;
  doctor?: any;
}

export function DoctorForm({ onClose, onSave, doctor }: DoctorFormProps) {
  const { showToast } = useModal();
  const staffFormCfg = useFormConfig("staff");
  const formTitle = useFormTitle("staff", doctor ? "edit" : "create");
  const submitLabel = useSubmitLabel("staff", doctor ? "edit" : "create");
  const STEPS = (staffFormCfg.steps ?? []).map((s) => ({
    number: s.number,
    title: s.title,
    icon: [User, Shield, FileText, Stethoscope][s.number - 1] ?? User,
  }));
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Fetch detailed staff details from API GET /staff/:id when editing
  const { data: singleStaffData, isLoading: isFetching } = useSingleStaffQuery(doctor?.id || undefined, {
    enabled: !!doctor?.id,
  });

  const normalizePermissions = (perms: string[]): string[] => {
    return perms.map((p: string) => {
      const norm = p.toLowerCase();
      if (norm === 'staff_management' || norm === 'staff') return 'staff';
      if (norm === 'analytics' || norm === 'reports') return 'reports';
      if (norm === 'corporate_plans' || norm === 'membership') return 'membership';
      if (norm === 'appointment' || norm === 'appointments' || norm === 'apppointment') return 'appointments';
      return norm;
    });
  };

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema) as any,
    defaultValues: {
      name: doctor?.name ?? "",
      email: doctor?.email ?? "",
      phone: doctor?.phone ? doctor.phone.replace(/^\+\d+/, "").slice(-10) : "",
      country_code: (doctor as any)?.country_code || (() => {
        let rawPhone = doctor?.phone || "";
        if (rawPhone.startsWith("+")) {
          const codes = ["+91", "+1", "+44", "+971"];
          for (const c of codes) {
            if (rawPhone.startsWith(c)) {
              return c;
            }
          }
        }
        return "+91";
      })(),
      role: doctor?.role ?? "doctor",
      specialization: doctor?.specialization ?? "",
      password: "",
      confirmPassword: "",
      permissions: normalizePermissions(doctor?.permissions ?? [
        "dashboard",
        "appointments",
        "patients",
        "consultation",
        "treatments",
        "medical_records",
        "consent_forms",
      ]),
      uniqueId: doctor?.uniqueId ?? `STAFF${Date.now().toString().slice(-6)}`,
      documents: doctor?.documents ?? [],
      profitSharing: doctor?.profitSharing ?? false,
      profitPercentage: doctor?.profitPercentage ?? 0,
      licenseNumber: doctor?.licenseNumber ?? "",
      monthlySalary: doctor?.monthlySalary !== undefined ? String(doctor.monthlySalary) : "",
      salaryPaid: doctor?.salaryPaid !== undefined ? String(doctor.salaryPaid) : "0",
      salaryPending: doctor?.salaryPending !== undefined ? String(doctor.salaryPending) : "0",
      education: doctor?.education ?? "",
      experience: doctor?.experience !== undefined ? String(doctor.experience) : "",
      department: doctor?.department ?? "",
      designation: doctor?.designation ?? "",
      qualification: doctor?.qualification ?? "",
      consultationFee: doctor?.consultationFee !== undefined ? String(doctor.consultationFee) : "",
      isActive: doctor?.isActive !== undefined ? doctor.isActive : true,
      avatar: doctor?.avatar ?? doctor?.image ?? "",
    },
  });
 
  React.useEffect(() => {
    if (doctor) {
      if (singleStaffData) {
        const s = singleStaffData.data || singleStaffData;
 
        let normalizedRole = 'staff';
        let rawRole = s.role?.name || s.role_id || s.role || 'staff';
        if (rawRole.toLowerCase().includes('super')) normalizedRole = 'super_admin';
        else if (rawRole.toLowerCase().includes('admin')) normalizedRole = 'admin';
        else if (rawRole.toLowerCase().includes('doctor')) normalizedRole = 'doctor';
        else if (rawRole.toLowerCase().includes('receptionist')) normalizedRole = 'receptionist';
        else if (rawRole.toLowerCase().includes('assistant')) normalizedRole = 'assistant';
 
        let permissions: string[] = [];
        try {
          if (s.module_permission) {
            const rawPerms = typeof s.module_permission === 'string' ? JSON.parse(s.module_permission) : s.module_permission;
            if (Array.isArray(rawPerms)) {
              permissions = normalizePermissions(rawPerms);
            }
          }
        } catch (e) {
          // Failed to parse permissions
        }
 
        const profile = s.personal_profile || {};
        const exp = profile.experience_years !== undefined ? String(profile.experience_years) : '';
        const sal = profile.monthly_salary !== undefined ? String(profile.monthly_salary) : '';
 
        let rawPhone = s.phone || doctor.phone || "";
        let parsedCountryCode = s.country_code || (doctor as any)?.country_code || "+91";
        if (!s.country_code && !(doctor as any)?.country_code && rawPhone.startsWith("+")) {
          const codes = ["+91", "+1", "+44", "+971"];
          for (const c of codes) {
            if (rawPhone.startsWith(c)) {
              parsedCountryCode = c;
              rawPhone = rawPhone.slice(c.length);
              break;
            }
          }
        }

        form.reset({
          name: s.name || doctor.name || "",
          email: s.email || doctor.email || "",
          phone: rawPhone.replace(/^\+\d+/, "").slice(-10),
          country_code: parsedCountryCode,
          role: normalizedRole as any,
          specialization: profile.specialization?.name || profile.specialization_id || doctor.specialization || '',
          password: "",
          confirmPassword: "",
          permissions: permissions.length > 0 ? permissions : normalizePermissions(doctor.permissions || ['dashboard']),
          uniqueId: s.emp_id || doctor.uniqueId || s.id.slice(0, 8),
          documents: s.documents || doctor.documents || [],
          profitSharing: profile.profit_sharing || doctor.profitSharing || false,
          profitPercentage: profile.profit_sharing_percentage || doctor.profitPercentage || 0,
          licenseNumber: profile.license_number || doctor.licenseNumber || '',
          monthlySalary: String(sal ?? doctor.monthlySalary ?? ''),
          salaryPaid: String(s.salaryPaid ?? doctor.salaryPaid ?? '0'),
          salaryPending: String(s.salaryPending ?? doctor.salaryPending ?? sal ?? '0'),
          education: profile.education || doctor.education || '',
          experience: String(exp ?? doctor.experience ?? ''),
          department: profile.department || doctor.department || '',
          designation: profile.designation || doctor.designation || '',
          qualification: profile.qualification || doctor.qualification || '',
          consultationFee: String(profile.consultation_fee ?? doctor.consultationFee ?? ''),
          isActive: s.status === 'ACTIVE',
          avatar: s.profile_picture || doctor.avatar || doctor.image || '',
        });
      } else {
        let rawPhone = doctor.phone || "";
        let parsedCountryCode = (doctor as any)?.country_code || "+91";
        if (!(doctor as any)?.country_code && rawPhone.startsWith("+")) {
          const codes = ["+91", "+1", "+44", "+971"];
          for (const c of codes) {
            if (rawPhone.startsWith(c)) {
              parsedCountryCode = c;
              rawPhone = rawPhone.slice(c.length);
              break;
            }
          }
        }

        form.reset({
          name: doctor.name ?? "",
          email: doctor.email ?? "",
          phone: rawPhone.replace(/^\+\d+/, "").slice(-10),
          country_code: parsedCountryCode,
          role: doctor.role ?? "doctor",
          specialization: doctor.specialization ?? "",
          password: "",
          confirmPassword: "",
          permissions: normalizePermissions(doctor.permissions ?? [
            "dashboard",
            "appointments",
            "patients",
            "consultation",
            "treatments",
            "medical_records",
            "consent_forms",
          ]),
          uniqueId: doctor.uniqueId ?? `STAFF${Date.now().toString().slice(-6)}`,
          documents: doctor.documents ?? [],
          profitSharing: doctor.profitSharing ?? false,
          profitPercentage: doctor.profitPercentage ?? 0,
          licenseNumber: doctor.licenseNumber ?? "",
          monthlySalary: doctor.monthlySalary !== undefined ? String(doctor.monthlySalary) : "",
          salaryPaid: doctor.salaryPaid !== undefined ? String(doctor.salaryPaid) : "0",
          salaryPending: doctor.salaryPending !== undefined ? String(doctor.salaryPending) : "0",
          education: doctor.education ?? "",
          experience: doctor.experience !== undefined ? String(doctor.experience) : "",
          department: doctor.department ?? "",
          designation: doctor.designation ?? "",
          qualification: doctor.qualification ?? "",
          consultationFee: doctor.consultationFee !== undefined ? String(doctor.consultationFee) : "",
          isActive: doctor.isActive !== undefined ? doctor.isActive : true,
          avatar: doctor.avatar ?? doctor.image ?? "",
        });
      }
    }
  }, [doctor, singleStaffData, form]);

  const formData = form.watch();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => form.setValue("avatar", reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = async () => {
    // Per-step field validation before advancing
    const stepFields: Record<number, (keyof StaffFormData)[]> = {
      1: [...staffStep1Fields] as (keyof StaffFormData)[],
      2: [...staffStep2Fields] as (keyof StaffFormData)[],
      3: [...staffStep3Fields] as (keyof StaffFormData)[],
    };
    const fields = stepFields[currentStep];
    if (fields) {
      const valid = await form.trigger(fields);
      if (!valid) return;
    }

    // Step 3 Document Compliance validation
    if (currentStep === 3) {
      const docs = form.getValues("documents") || [];
      const role = form.getValues("role") || "doctor";
      const requiredList = REQUIRED_DOCS[role] || REQUIRED_DOCS.assistant || [];

      const missingDocs = requiredList.filter(
        reqDoc => !docs.some((uploadedDoc: any) => uploadedDoc.type === reqDoc)
      );

      if (missingDocs.length > 0) {
        showToast(`Please upload the following mandatory documents:\n• ${missingDocs.join("\n• ")}`, "error");
        return;
      }
    }

    setCurrentStep((s) => s + 1);
  };

  const handleStepClick = async (targetStep: number) => {
    if (targetStep === currentStep) return;

    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    // Going forward: validate intermediate steps sequentially
    for (let step = currentStep; step < targetStep; step++) {
      const stepFields: Record<number, (keyof StaffFormData)[]> = {
        1: [...staffStep1Fields] as (keyof StaffFormData)[],
        2: [...staffStep2Fields] as (keyof StaffFormData)[],
        3: [...staffStep3Fields] as (keyof StaffFormData)[],
      };
      const fields = stepFields[step];
      if (fields) {
        const valid = await form.trigger(fields);
        if (!valid) {
          setCurrentStep(step);
          return;
        }
      }

      if (step === 3) {
        const docs = form.getValues("documents") || [];
        const role = form.getValues("role") || "doctor";
        const requiredList = REQUIRED_DOCS[role] || REQUIRED_DOCS.assistant || [];

        const missingDocs = requiredList.filter(
          (reqDoc) => !docs.some((uploadedDoc: any) => uploadedDoc.type === reqDoc)
        );

        if (missingDocs.length > 0) {
          showToast(`Please upload the following mandatory documents:\n• ${missingDocs.join("\n• ")}`, "error");
          setCurrentStep(3);
          return;
        }
      }
    }

    setCurrentStep(targetStep);
  };
  const { data: apiRoles } = useRolesQuery();
  const { data: apiSpecs } = useSpecializationsQuery();
  const { mutateAsync: createStaff, isPending: isCreating } = useCreateStaffMutation();
  const { mutateAsync: updateStaff, isPending: isUpdating } = useUpdateStaffMutation();
  const queryClient = useQueryClient();
  const isSaving = isCreating || isUpdating;

  const onSubmit = async (data: StaffFormData) => {
    try {
      let currentApiRoles = apiRoles;
      if (!currentApiRoles) {
        // Fallback fetch if React Query failed or returned undefined (e.g., due to QuotaExceededError)
        try {
          const fallbackRoles = await fetchRolesList();
          currentApiRoles = fallbackRoles;
        } catch (e) {
          // Fallback role fetch failed
        }
      }

      let rawRoles: any[] | null = null;
      if (Array.isArray(currentApiRoles)) {
        rawRoles = currentApiRoles;
      } else if (currentApiRoles && Array.isArray((currentApiRoles as any).roles)) {
        rawRoles = (currentApiRoles as any).roles;
      } else if (currentApiRoles && (currentApiRoles as any).data && Array.isArray((currentApiRoles as any).data.roles)) {
        rawRoles = (currentApiRoles as any).data.roles;
      } else if (currentApiRoles && Array.isArray((currentApiRoles as any).data)) {
        rawRoles = (currentApiRoles as any).data;
      }

      // Attempt to map by exact match
      let roleObj = rawRoles?.find((r: any) => r.name?.toLowerCase() === data.role.toLowerCase() || r.code?.toLowerCase() === data.role.toLowerCase());

      // If exact match fails, maybe it's mapping "super_admin" to "SUPER_ADMIN"
      if (!roleObj && data.role === "super_admin") {
        roleObj = rawRoles?.find((r: any) => r.code?.toLowerCase() === "super_admin" || r.name?.toLowerCase().includes("super admin") || r.name?.toLowerCase() === "admin");
      }

      if (!roleObj) {
        throw new Error(`Role mapping failed. Selected: '${data.role}'. Available from API: ${rawRoles ? rawRoles.map((r: any) => r.name).join(', ') : 'None fetched'}`);
      }

      const roleId = roleObj.id || roleObj.role_id || roleObj.uuid;

      if (!roleId) {
        throw new Error(`Role found but ID is missing! Keys available: ${Object.keys(roleObj).join(', ')}`);
      }

      let rawSpecs: any[] | null = null;
      if (Array.isArray(apiSpecs)) {
        rawSpecs = apiSpecs;
      } else if (apiSpecs && Array.isArray((apiSpecs as any).specializations)) {
        rawSpecs = (apiSpecs as any).specializations;
      } else if (apiSpecs && (apiSpecs as any).data && Array.isArray((apiSpecs as any).data.specializations)) {
        rawSpecs = (apiSpecs as any).data.specializations;
      } else if (apiSpecs && Array.isArray((apiSpecs as any).data)) {
        rawSpecs = (apiSpecs as any).data;
      }

      const specObj = rawSpecs?.find((s: any) => (typeof s === "string" ? s : s.name || "") === data.specialization);
      const specId = specObj?.id || data.specialization;

      const formDataObj = new FormData();
      formDataObj.append("name", data.name);
      formDataObj.append("email", data.email);
      if (data.password) formDataObj.append("password", data.password);
      if (data.phone) formDataObj.append("phone", data.phone);
      if (data.country_code) formDataObj.append("country_code", data.country_code);

      // Pass the mapped UUID instead of name
      formDataObj.append("role_id", roleId);
      formDataObj.append("status", data.isActive ? "ACTIVE" : "INACTIVE");

      const personalProfile = {
        specialization_id: specId,
        experience_years: parseInt(data.experience || "0", 10),
        qualification: data.qualification,
        license_number: data.licenseNumber,
        consultation_fee: parseInt(data.consultationFee || "0", 10),
        profit_sharing: data.profitSharing,
        profit_sharing_percentage: data.profitPercentage || 0,
        monthly_salary: data.monthlySalary ? parseInt(data.monthlySalary, 10) : 0,
        status: data.isActive ? "ACTIVE" : "INACTIVE"
      };
      formDataObj.append("personal_profile", JSON.stringify(personalProfile));

      const perms = (data.role === "admin" || data.role === "super_admin") ? ["all"] : data.permissions;
      formDataObj.append("module_permission", JSON.stringify(perms.map(p => {
        const up = p.toUpperCase();
        if (up === 'APPOINTMENTS') return 'APPOINTMENT';
        if (up === 'REPORTS') return 'ANALYTICS';
        if (up === 'STAFF') return 'STAFF';
        if (up === 'MEMBERSHIP') return 'MEMBERSHIP';
        if (up === 'PROFIT_SHARING') return 'PROFIT_SHARING';
        return up;
      })));

      if (avatarFile) {
        formDataObj.append("profile_picture", avatarFile);
      }

      const docTypeMapping: Record<string, string> = {
        "Aadhaar / Identity Proof": "aadhar_card",
        "Aadhaar Card": "aadhar_card",
        "Educational Degree Documents": "educational_degree",
        "Educational Certificate": "educational_degree",
        "Education Certificate": "educational_degree",
        "Medical Council Registration": "medical_council_registration",
        "Experience Certificates": "experience_certificates",
        "Experience Certificate": "experience_certificates",
        "Previous Employment Proof": "experience_certificates",
        "Previous Experience Proof": "experience_certificates",
        "Medical Indemnity Insurance": "medical_indemnity_insurance",
        "NOC (if applicable)": "noc",
        "Police Verification": "police_verification",
        "PAN Card": "pan_card",
        "Bank Details / Passbook": "bank_details",
        "Signed Employment Contract": "employment_contract",
        "Signed NDA": "employment_contract",
        "Appointment Letter": "employment_contract",
        "Vaccination Proof (Hep-B/COVID)": "vaccination_proof",
        "Medical Fitness Certificate": "medical_fitness_certificate"
      };

      data.documents?.forEach((doc: any) => {
        if (doc.file) {
          const fieldName = docTypeMapping[doc.type];
          // Only append if the backend explicitly supports this field name.
          // Otherwise, multer will throw an "Unexpected field" error.
          if (fieldName) {
            formDataObj.append(fieldName, doc.file);
          }
        }
      });

      // API call
      let response;
      if (doctor?.id) {
        response = await updateStaff({ id: doctor.id, formData: formDataObj });
      } else {
        response = await createStaff({ formData: formDataObj });
      }

      // Explicitly invalidate staff list so UI refreshes immediately
      await queryClient.invalidateQueries({ queryKey: ["staff"] });
      if (doctor?.id) {
        await queryClient.invalidateQueries({ queryKey: ["singleStaff", doctor.id] });
      }

      // Strip large files/base64 before saving to local state
      const cleanData = { ...data };
      if (cleanData.documents) {
        cleanData.documents = cleanData.documents.map((d: any) => ({
          type: d.type,
          name: d.name,
          size: d.size
        }));
      }
      cleanData.avatar = ""; // don't store base64 in local state

      onSave({
        ...cleanData,
        id: response?.id || doctor?.id || Date.now().toString(),
        salaryPending: !doctor
          ? (parseFloat(cleanData.monthlySalary ?? "0") || 0).toLocaleString("en-IN")
          : cleanData.salaryPending,
        permissions: perms,
        workingHours: doctor?.workingHours || {
          monday: { isWorking: true, startTime: "09:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
          tuesday: { isWorking: true, startTime: "09:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
          wednesday: { isWorking: true, startTime: "09:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
          thursday: { isWorking: true, startTime: "09:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
          friday: { isWorking: true, startTime: "09:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" },
          saturday: { isWorking: false, startTime: "09:00", endTime: "18:00" },
          sunday: { isWorking: false, startTime: "09:00", endTime: "18:00" },
        },
        timeSlots: doctor?.timeSlots || { duration: 30, bufferTime: 5 },
      });
    } catch (error: any) {

      let errMsg = "Failed to save staff. Please check the details.";

      const resData = error.response?.data || error;
      
      if (resData?.responseStatusList?.statusList?.[0]?.statusDesc) {
        errMsg = resData.responseStatusList.statusList[0].statusDesc;
      } else if (resData?.status?.statusDesc) {
        errMsg = resData.status.statusDesc;
      } else if (resData?.message) {
        errMsg = resData.message;
      } else if (resData?.error && typeof resData.error === 'string') {
        errMsg = resData.error;
      } else if (resData?.errors && Array.isArray(resData.errors)) {
        errMsg = resData.errors.join(", ");
      } else if (resData?.responseObject?.message) {
        errMsg = resData.responseObject.message;
      } else if (typeof resData === 'string') {
        errMsg = resData;
      } else if (error.message && !error.message.includes('status code')) {
        errMsg = error.message;
      } else if (typeof error === 'string') {
        errMsg = error;
      }

      showToast(errMsg, "error");
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;
    if (name === "profitPercentage") {
      finalValue = value === "" ? 0 : Number(value);
    }
    form.setValue(
      name as keyof StaffFormData,
      finalValue,
      { shouldValidate: true },
    );
  };

  const handlePermissionChange = (id: string, checked: boolean) => {
    const current = form.getValues("permissions");
    form.setValue(
      "permissions",
      checked ? [...current, id] : current.filter((p) => p !== id),
    );
  };

  const handleDocumentUpload = (docType: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const current = form.getValues("documents") || [];
      const filtered = current.filter((d: any) => d.type !== docType);
      form.setValue("documents", [
        ...filtered,
        { type: docType, name: file.name, url: reader.result, size: file.size, file },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentRemove = (fileObj: any) => {
    const current = form.getValues("documents");
    form.setValue(
      "documents",
      current.filter((d: any) => d !== fileObj && d.url !== fileObj.url),
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Personal
            formData={formData}
            onChange={handleChange}
            fileInputRef={fileInputRef}
            onImageUpload={handleImageUpload}
            isEdit={!!doctor}
            errors={form.formState.errors}
          />
        );
      case 2:
        return (
          <Step2Role
            formData={formData}
            onChange={(role) => {
              form.setValue("role", role as any, { shouldValidate: true });
              if (role === "super_admin") {
                form.setValue(
                  "permissions",
                  [
                    "dashboard",
                    "appointments",
                    "patients",
                    "consultation",
                    "treatments",
                    "medical_records",
                    "consent_forms",
                    "billing",
                    "inventory",
                    "reports",
                    "staff",
                    "profit_sharing",
                    "membership",
                  ],
                  { shouldValidate: true }
                );
              } else if (role === "staff") {
                form.setValue(
                  "permissions",
                  [
                    "dashboard",
                    "appointments",
                    "patients",
                    "consultation",
                    "treatments",
                    "medical_records",
                    "consent_forms",
                    "billing",
                    "inventory",
                    "reports",
                    "staff",
                  ],
                  { shouldValidate: true }
                );
              } else if (role === "doctor") {
                form.setValue(
                  "permissions",
                  [
                    "dashboard",
                    "appointments",
                    "patients",
                    "consultation",
                    "treatments",
                    "medical_records",
                    "consent_forms",
                  ],
                  { shouldValidate: true }
                );
              } else if (role === "receptionist") {
                form.setValue(
                  "permissions",
                  [
                    "dashboard",
                    "appointments",
                    "patients",
                    "consent_forms",
                    "billing",
                    "inventory",
                  ],
                  { shouldValidate: true }
                );
              }
            }}
            onPermissionChange={handlePermissionChange}
            errors={form.formState.errors}
          />
        );
      case 3:
        return (
          <Step3Documentation
            role={formData.role}
            documents={formData.documents}
            onUpload={handleDocumentUpload}
            onRemove={handleDocumentRemove}
            errors={form.formState.errors}
          />
        );
      case 4:
        return (
          <Step4Professional
            formData={formData}
            onChange={handleChange}
            errors={form.formState.errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      title={formTitle}
      onClose={onClose}
      size="2xl"
      icon={<User className="w-4 h-4" />}
      footer={
        <div className="flex justify-between items-center w-full">
          <Button
            variant="outline"
            onClick={() =>
              currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()
            }
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />{" "}
            {currentStep === 1 ? "Cancel" : "Previous Step"}
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={
                currentStep < 4 ? handleNextStep : form.handleSubmit(onSubmit, (errs) => {
                  const errorMsg = Object.values(errs)
                    .map((err: any) => err.message)
                    .filter(Boolean)
                    .join(", ");
                  showToast(errorMsg || "Please fill all required fields correctly.", "error");
                })
              }
              disabled={isSaving}
              className="gap-2"
            >
              {currentStep < 4 ? (
                <>
                  <ChevronRight className="w-4 h-4" /> Next Step
                </>
              ) : isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> {submitLabel}
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 relative min-h-[400px]">
        {isFetching && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-50 rounded-2xl transition-all duration-300">
            <Loading type="spinner" text="Loading staff details from API..." />
          </div>
        )}
        <div className="flex items-center justify-between px-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = currentStep === s.number;
            const isDone = currentStep > s.number;
            return (
              <React.Fragment key={s.number}>
                <div
                  onClick={() => handleStepClick(s.number)}
                  className="flex flex-col items-center gap-1.5 relative group cursor-pointer focus:outline-none"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleStepClick(s.number);
                    }
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isDone
                        ? "bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105"
                        : isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:scale-105"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest hidden sm:block transition-colors duration-300 ${
                      isActive
                        ? "text-primary"
                        : isDone
                        ? "text-emerald-600 group-hover:text-emerald-700"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] rounded-full mx-2 mt-5 self-start transition-all duration-300 ${isDone ? "bg-emerald-500" : "bg-gray-200"}`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="min-h-[400px]">{renderCurrentStep()}</div>
      </div>
    </Modal>
  );
}
