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
import { Modal, Button } from "@/components/ui";
import { Step1Personal } from "./StaffForm/Step1Personal";
import { Step2Role } from "./StaffForm/Step2Role";
import { Step3Documentation } from "./StaffForm/Step3Documentation";
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

interface DoctorFormProps {
  onClose: () => void;
  onSave: (doctor: any) => void;
  doctor?: any;
}

export function DoctorForm({ onClose, onSave, doctor }: DoctorFormProps) {
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

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema) as any,
    defaultValues: {
      name: doctor?.name ?? "",
      email: doctor?.email ?? "",
      phone: doctor?.phone ?? "",
      role: doctor?.role ?? "doctor",
      specialization: doctor?.specialization ?? "",
      password: "",
      confirmPassword: "",
      permissions: doctor?.permissions ?? [
        "appointments",
        "patients",
        "treatments",
        "emr",
      ],
      uniqueId: doctor?.uniqueId ?? `STAFF${Date.now().toString().slice(-6)}`,
      documents: doctor?.documents ?? [],
      profitSharing: doctor?.profitSharing ?? false,
      profitPercentage: doctor?.profitPercentage ?? 0,
      licenseNumber: doctor?.licenseNumber ?? "",
      monthlySalary: doctor?.monthlySalary ?? "",
      salaryPaid: doctor?.salaryPaid ?? "0",
      salaryPending: doctor?.salaryPending ?? "0",
      education: doctor?.education ?? "",
      experience: doctor?.experience ?? "",
      department: doctor?.department ?? "",
      designation: doctor?.designation ?? "",
      qualification: doctor?.qualification ?? "",
      consultationFee: doctor?.consultationFee ?? "",
      isActive: doctor?.isActive !== undefined ? doctor.isActive : true,
      avatar: doctor?.avatar ?? doctor?.image ?? "",
    },
  });

  const formData = form.watch();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    setCurrentStep((s) => s + 1);
  };

  const onSubmit = (data: StaffFormData) => {
    onSave({
      ...data,
      id: doctor?.id || Date.now().toString(),
      salaryPending: !doctor
        ? (parseFloat(data.monthlySalary ?? "0") || 0).toLocaleString("en-IN")
        : data.salaryPending,
      permissions: data.role === "admin" ? ["all"] : data.permissions,
      workingHours: doctor?.workingHours || {
        monday: {
          isWorking: true,
          startTime: "09:00",
          endTime: "18:00",
          breakStart: "13:00",
          breakEnd: "14:00",
        },
        tuesday: {
          isWorking: true,
          startTime: "09:00",
          endTime: "18:00",
          breakStart: "13:00",
          breakEnd: "14:00",
        },
        wednesday: {
          isWorking: true,
          startTime: "09:00",
          endTime: "18:00",
          breakStart: "13:00",
          breakEnd: "14:00",
        },
        thursday: {
          isWorking: true,
          startTime: "09:00",
          endTime: "18:00",
          breakStart: "13:00",
          breakEnd: "14:00",
        },
        friday: {
          isWorking: true,
          startTime: "09:00",
          endTime: "18:00",
          breakStart: "13:00",
          breakEnd: "14:00",
        },
        saturday: { isWorking: false, startTime: "09:00", endTime: "18:00" },
        sunday: { isWorking: false, startTime: "09:00", endTime: "18:00" },
      },
      timeSlots: doctor?.timeSlots || { duration: 30, bufferTime: 5 },
    });
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    form.setValue(
      name as keyof StaffFormData,
      type === "checkbox" ? checked : value,
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
      const current = form.getValues("documents");
      form.setValue("documents", [
        ...current.filter((d: any) => d.type !== docType),
        { type: docType, name: file.name, url: reader.result, size: file.size },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentRemove = (docType: string) => {
    const current = form.getValues("documents");
    form.setValue(
      "documents",
      current.filter((d: any) => d.type !== docType),
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
          />
        );
      case 2:
        return (
          <Step2Role
            formData={formData}
            onChange={(role) => form.setValue("role", role as any)}
            onPermissionChange={handlePermissionChange}
          />
        );
      case 3:
        return (
          <Step3Documentation
            role={formData.role}
            documents={formData.documents}
            onUpload={handleDocumentUpload}
            onRemove={handleDocumentRemove}
          />
        );
      case 4:
        return (
          <Step4Professional formData={formData} onChange={handleChange} />
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
                currentStep < 4 ? handleNextStep : form.handleSubmit(onSubmit)
              }
              className="gap-2"
            >
              {currentStep < 4 ? (
                <>
                  <ChevronRight className="w-4 h-4" /> Next Step
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
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = currentStep === s.number;
            const isDone = currentStep > s.number;
            return (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center gap-1.5 relative group">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isDone ? "bg-emerald-500 text-white" : isActive ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "bg-muted text-muted-foreground"}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest ${isActive ? "text-primary" : isDone ? "text-emerald-600" : "text-muted-foreground"}`}
                  >
                    {s.title}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 rounded-full mx-2 ${isDone ? "bg-emerald-500" : "bg-muted"}`}
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
