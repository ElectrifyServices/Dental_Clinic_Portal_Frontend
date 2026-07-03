import React, { useState, useEffect } from "react";
import {
  User,
  CheckCircle,
  Users,
  Plus,
  Trash2,
  UserPlus,
  Edit,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Modal,
  Button,
  SectionRenderer,
  Label,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  ContentCard,
  Loading,
} from "../../ui";
import {
  CorporateEmployee,
  CorporatePlan,
  PlanDependent,
  CoverageType,
} from "../../../types";
import { useFormConfig } from "../../../hooks/useFormConfig";
import { useCreateEmployeeMutation } from "../../../hooks/corporate/useCreateEmployeeMutation";
import { useUpdateEmployeeMutation } from "../../../hooks/corporate/useUpdateEmployeeMutation";
import { useEmployeeQuery } from "../../../hooks/corporate/useEmployeeQuery";
import { useDependentsQuery } from "../../../hooks/corporate/useDependentsQuery";
import { useAddDependentMutation } from "../../../hooks/corporate/useAddDependentMutation";
import { useRemoveDependentMutation } from "../../../hooks/corporate/useRemoveDependentMutation";
import { useUpdateDependentMutation } from "../../../hooks/corporate/useUpdateDependentMutation";
import { useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";

interface EmployeeFormModalProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  editEmp: CorporateEmployee | null;
  activePlans: CorporatePlan[];
  onSave: (emp: CorporateEmployee) => void;
  refetch: () => void;
}

const EMPTY_EMP = (): Partial<CorporateEmployee> => ({
  employeeId: "",
  name: "",
  phone: "",
  email: "",
  gender: "male",
  dateOfBirth: "",
  designation: "",
  department: "",
  companyName: "",
  corporatePlanId: "",
  corporatePlanName: "",
  eligible_date: new Date().toISOString().split("T")[0],
  isActive: true,
  coverageType: "self",
});

interface PendingDependent {
  tempId: string;
  name: string;
  relationship: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  phone: string;
}

const EMPTY_PENDING = (): PendingDependent => ({
  tempId: `tmp-${Date.now()}`,
  name: "",
  relationship: "",
  dateOfBirth: "",
  gender: "male",
  phone: "",
});

export function EmployeeFormModal({
  showForm,
  setShowForm,
  editEmp,
  activePlans,
  onSave,
  refetch,
}: EmployeeFormModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<CorporateEmployee>>(EMPTY_EMP());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [pendingDependents, setPendingDependents] = useState<
    PendingDependent[]
  >([]);
  const [showAddDepForm, setShowAddDepForm] = useState(false);
  const [addDepForm, setAddDepForm] =
    useState<PendingDependent>(EMPTY_PENDING());
  const [editingDepId, setEditingDepId] = useState<string | null>(null);
  const [expandedBenefits, setExpandedBenefits] = useState<
    Record<string, boolean>
  >({});

  const todayStr = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const isDateInPast = React.useMemo(() => {
    if (!form.eligible_date) return false;
    return form.eligible_date < todayStr;
  }, [form.eligible_date, todayStr]);

  const empCfg = useFormConfig("employee");
  const createEmployeeMutation = useCreateEmployeeMutation();
  const updateEmployeeMutation = useUpdateEmployeeMutation();
  const addDependentMutation = useAddDependentMutation();
  const removeDependentMutation = useRemoveDependentMutation();
  const updateDependentMutation = useUpdateDependentMutation();

  const { data: employeeDetails, isLoading: isFetching } = useEmployeeQuery(
    editEmp?.id || undefined,
    {
      enabled: showForm && !!editEmp?.id,
    },
  );

  const { data: existingDependents, refetch: refetchDependents } =
    useDependentsQuery(showForm && editEmp?.id ? editEmp.id : undefined);

  const selectedPlan = React.useMemo(
    () => activePlans.find((p) => p.id === form.corporatePlanId),
    [activePlans, form.corporatePlanId],
  );

  const maxDependents = selectedPlan
    ? Number((selectedPlan as any).family_coverage_limit) ||
      Number((selectedPlan as any).familyCoverageLimit) ||
      Number(selectedPlan.limit) ||
      Number(selectedPlan.maxDependents) ||
      0
    : 0;
  const totalDependents =
    (existingDependents?.length ?? 0) + pendingDependents.length;

  const empCfgAny = empCfg as any;
  const personalSection = React.useMemo(() => {
    const sec = empCfg.sections?.find((s) => s.id === "personal");
    if (!sec) return undefined;
    return {
      ...sec,
      fields: sec.fields.filter(
        (f) =>
          f.name !== "email" && f.name !== "gender" && f.name !== "dateOfBirth",
      ),
    };
  }, [empCfg]);
  const employmentSection = empCfg.sections?.find((s) => s.id === "employment");
  const eligibilitySection = empCfg.sections?.find(
    (s) => s.id === "eligibility",
  );

  useEffect(() => {
    if (showForm) {
      if (editEmp) {
        if (employeeDetails) {
          const empData = employeeDetails.data || employeeDetails;
          const activeEnrollment =
            empData.enrollments?.find((en: any) => en.status === "ACTIVE") ||
            empData.enrollments?.[0];
          const planId = activeEnrollment?.plan_id || "";
          const plan = activePlans.find((p) => p.id === planId);
          const expiryDate = activeEnrollment?.expiry_date || "";

          setForm({
            id: empData.id,
            employeeId: empData.id || "",
            name: empData.name || "",
            phone: empData.phone || "",
            email: empData.email || "",
            gender: empData.gender?.toLowerCase() || "male",
            dateOfBirth: empData.date_of_birth
              ? empData.date_of_birth.split("T")[0]
              : "",
            designation: "",
            department: "",
            companyName: activeEnrollment?.plan?.company_name || "",
            corporatePlanId: planId,
            corporatePlanName:
              activeEnrollment?.plan?.plan_name || plan?.name || "",
            enrolledAt:
              activeEnrollment?.enrollment_date ||
              empData.created_at ||
              editEmp.enrolledAt ||
              "",
            eligible_date: expiryDate ? expiryDate.split("T")[0] : "",
            isActive: empData.status === "ACTIVE",
            patientId: empData.patient_id || editEmp.patientId,
            coverageType: (empData.family_members?.length > 0
              ? "family"
              : "self") as CoverageType,
          });
        } else {
          setForm({ ...editEmp });
        }
      } else {
        setForm(EMPTY_EMP());
        setPendingDependents([]);
      }
      setFormErrors({});
      setShowAddDepForm(false);
      setEditingDepId(null);
      setExpandedBenefits({});
    }
  }, [showForm, editEmp, employeeDetails, activePlans]);

  React.useEffect(() => {
    if (showForm && maxDependents > 0) {
      const existingCount = existingDependents?.length || 0;
      const targetPendingCount = Math.max(0, maxDependents - 1 - existingCount);

      setPendingDependents((prev) => {
        if (prev.length === targetPendingCount) return prev;
        const newArr = [...prev];
        if (newArr.length > targetPendingCount) {
          return newArr.slice(0, targetPendingCount);
        } else {
          const needed = targetPendingCount - newArr.length;
          for (let i = 0; i < needed; i++) {
            newArr.push({
              tempId: `tmp-${Date.now()}-${newArr.length + i}`,
              name: "",
              relationship: "",
              dateOfBirth: "",
              gender: "male",
              phone: "",
            });
          }
          return newArr;
        }
      });
    } else if (showForm && maxDependents === 0) {
      setPendingDependents([]);
    }
  }, [maxDependents, showForm, existingDependents?.length]);

  const handleFormChange = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const planOptions = React.useMemo(() => {
    return activePlans
      .filter((p) => p.isActive !== false)
      .map((plan) => {
        const fee = plan.annual_fee || plan.annualFee || plan.fee || "0";
        const limit =
          plan.family_coverage_limit || plan.familyCoverageLimit || plan.limit;
        const benefitsSummary =
          plan.benefits
            ?.map((b: any) => b.description || b.benifit_label)
            .join(", ") || "No specific benefits listed";
        const benefitsArray = plan.benefits?.map((b: any) => b.description || b.benifit_label).filter(Boolean) || [];
        const planType =
          (plan as any).plan_type || plan.planCategory || "Unknown";
        return {
          label: plan.name,
          value: plan.id,
          planData: plan,
          fee,
          limit,
          benefitsSummary,
          benefitsArray,
          planType,
        };
      })
      .sort((a, b) => Number(a.fee) - Number(b.fee));
  }, [activePlans]);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.name?.trim()) errs.name = "Required";
    if (!form.phone?.trim()) errs.phone = "Required";
    if (!form.corporatePlanId) errs.corporatePlanId = "Assign a corporate plan";
    setFormErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleEditDependent = (dep: any, isExisting: boolean) => {
    setEditingDepId(isExisting ? dep.id : dep.tempId);
    setAddDepForm({
      tempId: isExisting ? dep.id : dep.tempId,
      name: dep.name,
      relationship: dep.relationship,
      dateOfBirth: dep.dateOfBirth || "",
      gender: dep.gender || "male",
      phone: dep.phone || "",
    });
    setShowAddDepForm(true);
  };

  const handleAddDependent = () => {
    if (!addDepForm.name.trim() || !addDepForm.relationship.trim()) {
      return;
    }

    if (editingDepId && !editingDepId.startsWith("tmp-")) {
      updateDependentMutation
        .mutateAsync({
          id: editingDepId,
          name: addDepForm.name,
          relationship: addDepForm.relationship,
          dateOfBirth: addDepForm.dateOfBirth || undefined,
          gender: addDepForm.gender,
          phone: addDepForm.phone || undefined,
        })
        .then(() => {
          refetchDependents();
          setEditingDepId(null);
          setAddDepForm(EMPTY_PENDING());
          setShowAddDepForm(false);
        });
    }
  };

  const handleRemoveExistingDependent = async (depId: string) => {
    await removeDependentMutation.mutateAsync({ id: depId });
    refetchDependents();
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const plan = activePlans.find((p) => p.id === form.corporatePlanId);
    const companyNameVal = plan?.companyName || "Individual";
    const coverageTypeVal = form.coverageType === "family" ? "FAMILY" : "SELF";

    if (!editEmp) {
      try {
        const transformedBody: any = {
          plan_id: form.corporatePlanId!,
          name: form.name!,
          phone: form.phone!,
          status: form.isActive !== false ? "ACTIVE" : "INACTIVE",
        };

        const validDependents = pendingDependents.filter(
          (dep) => dep.name && dep.relationship,
        );
        if (validDependents.length > 0) {
          transformedBody.family_members = validDependents.map((dep) => ({
            name: dep.name,
            relationship_type: dep.relationship.toUpperCase(),
            phone: dep.phone || undefined,
          }));
        }

        const apiResponse =
          await createEmployeeMutation.mutateAsync(transformedBody);
        const newEmpId = apiResponse?.id || `EMP-${Date.now()}`;

        const emp: CorporateEmployee = {
          id: newEmpId,
          employeeId: form.employeeId || apiResponse?.emp_id || "",
          name: form.name!,
          phone: form.phone!,
          email: form.email || "",
          gender: form.gender || "male",
          dateOfBirth: form.dateOfBirth || "",
          designation: form.designation || "",
          department: form.department || "",
          companyName: companyNameVal,
          corporatePlanId: form.corporatePlanId!,
          corporatePlanName: plan?.name || "",
          enrolledAt: new Date().toISOString(),
          eligible_date: form.eligible_date || apiResponse?.eligible_date || "",
          isActive: form.isActive !== false,
          patientId: undefined,
          coverageType: form.coverageType || "self",
        };
        onSave(emp);
        queryClient.invalidateQueries({ queryKey: ["corporatePlans"] });
        queryClient.invalidateQueries({ queryKey: ["member"] });
        queryClient.invalidateQueries({ queryKey: ["companies"] });
        refetch();
        setShowForm(false);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.1, y: 0.6 },
          angle: 60,
        });
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.9, y: 0.6 },
          angle: 120,
        });
      } catch (err: any) {
        const apiError =
          err?.response?.data?.responseStatusList?.statusList?.[0]
            ?.statusDesc ||
          err?.response?.data?.statusDesc ||
          err?.response?.data?.message ||
          err?.status?.statusDesc ||
          err?.message ||
          "Failed to create employee on backend";
        const msg = Array.isArray(apiError) ? apiError.join(", ") : apiError;
        setFormErrors((prev) => ({ ...prev, submit: msg }));
      }
    } else {
      try {
        const transformedBody: any = {
          id: editEmp.id,
          plan_id: form.corporatePlanId!,
          name: form.name!,
          phone: form.phone!,
          status: form.isActive !== false ? "ACTIVE" : "INACTIVE",
        };

        const validDependents = pendingDependents.filter(
          (dep) => dep.name && dep.relationship,
        );
        if (validDependents.length > 0) {
          transformedBody.family_members = validDependents.map((dep) => ({
            name: dep.name,
            relationship_type: dep.relationship.toUpperCase(),
            phone: dep.phone || undefined,
          }));
        }

        await updateEmployeeMutation.mutateAsync(transformedBody);

        const emp: CorporateEmployee = {
          id: editEmp.id,
          employeeId: form.employeeId || "",
          name: form.name!,
          phone: form.phone!,
          email: form.email || "",
          gender: form.gender || "male",
          dateOfBirth: form.dateOfBirth || "",
          designation: form.designation || "",
          department: form.department || "",
          companyName: companyNameVal,
          corporatePlanId: form.corporatePlanId!,
          corporatePlanName: plan?.name || "",
          enrolledAt: editEmp?.enrolledAt || new Date().toISOString(),
          eligible_date: form.eligible_date || editEmp?.eligible_date || "",
          isActive: form.isActive !== false,
          patientId: editEmp?.patientId || undefined,
          coverageType: form.coverageType || "self",
        };
        onSave(emp);
        queryClient.invalidateQueries({ queryKey: ["corporatePlans"] });
        queryClient.invalidateQueries({ queryKey: ["member"] });
        queryClient.invalidateQueries({ queryKey: ["companies"] });
        refetch();
        setShowForm(false);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.1, y: 0.6 },
          angle: 60,
        });
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.9, y: 0.6 },
          angle: 120,
        });
      } catch (err: any) {
        const apiError =
          err?.response?.data?.responseStatusList?.statusList?.[0]
            ?.statusDesc ||
          err?.response?.data?.statusDesc ||
          err?.response?.data?.message ||
          err?.status?.statusDesc ||
          err?.message ||
          "Failed to update employee on backend";
        const msg = Array.isArray(apiError) ? apiError.join(", ") : apiError;
        setFormErrors((prev) => ({ ...prev, submit: msg }));
      }
    }
  };

  if (!showForm) return null;

  const coverageLimitReached =
    totalDependents >= maxDependents && maxDependents > 0;

  return (
    <Modal
      title={
        editEmp
          ? (empCfgAny.title?.edit ?? "Edit Member")
          : (empCfgAny.title?.create ?? "Add Member")
      }
      onClose={() => setShowForm(false)}
      size="3xl"
      icon={<User className="w-4 h-4" />}
      footer={
        <div className="flex flex-col gap-3 w-full">
          {formErrors.submit && (
            <p className="text-red-500 text-xs font-bold text-left px-4 py-2.5 bg-red-50 rounded-xl border border-red-200">
              {formErrors.submit}
            </p>
          )}
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="gap-2 shadow-lg shadow-primary/10"
              disabled={
                createEmployeeMutation.isPending ||
                updateEmployeeMutation.isPending
              }
            >
              {createEmployeeMutation.isPending ||
              updateEmployeeMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />{" "}
                  {editEmp
                    ? (empCfgAny.submitLabel?.edit ?? "Save Changes")
                    : (empCfgAny.submitLabel?.create ?? "Register Member")}
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 relative min-h-[200px]">
        {isFetching && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-50 rounded-2xl transition-all duration-300">
            <Loading type="spinner" text="Loading employee details from API..." />
          </div>
        )}
        {/* Personal Details Card */}
        {personalSection && (
          <ContentCard title={personalSection.title} className="bg-card/50">
            <SectionRenderer
              section={personalSection}
              values={form}
              onChange={handleFormChange}
              errors={formErrors}
              cols={2}
            />
          </ContentCard>
        )}

        {/* Membership & Coverage Details Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ContentCard
            title="Membership Plan"
            className="bg-card/50 flex flex-col md:col-span-2"
            bodyClassName="flex-1 flex flex-col justify-center"
          >
            <div className="space-y-3 w-full">
              <Label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                Membership Plan{" "}
                <span className="text-destructive font-black">*</span>
              </Label>
              {planOptions.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                  No active membership plans available.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                  {planOptions.map((opt) => {
                    const isSelected = form.corporatePlanId === opt.value;
                    const isExpanded = !!expandedBenefits[opt.value];
                    const benefits =
                      opt.benefitsArray?.length > 0
                        ? opt.benefitsArray
                        : (opt.benefitsSummary && opt.benefitsSummary !== "No specific benefits listed"
                            ? opt.benefitsSummary.split(", ")
                            : []);
                    return (
                      <div
                        key={opt.value}
                        onClick={() =>
                          handleFormChange("corporatePlanId", opt.value)
                        }
                        className={`relative flex flex-col h-full p-3 rounded-xl border-2 text-left cursor-pointer transition-all duration-200 hover:shadow-md ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm shadow-primary/5"
                            : "border-border bg-white hover:border-muted-foreground/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-foreground text-sm truncate">
                              {opt.label}
                            </span>
                            <span className="text-[9px] font-black text-muted-foreground/80 uppercase mt-0.5 tracking-wider">
                              {opt.planType}
                            </span>
                          </div>
                          {isSelected ? (
                            <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white">
                              <CheckCircle className="w-3 h-3 fill-white text-primary" />
                            </span>
                          ) : (
                            <span className="shrink-0 w-5 h-5 rounded-full border border-muted-foreground/30" />
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-200/60">
                            ₹{opt.fee}/yr
                          </span>
                          {opt.limit && Number(opt.limit) > 1 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                              Limit: {opt.limit} Members
                            </span>
                          )}
                        </div>

                        {benefits.length > 0 && (
                          <div className="mt-auto pt-2 border-t border-dashed border-border/60">
                            <ul className="space-y-1 text-[11px] text-muted-foreground">
                              {(isExpanded ? benefits : benefits.slice(0, 2)).map((b, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                                  <span
                                    className="leading-snug whitespace-normal break-words sm:break-normal w-full"
                                    title={b}
                                  >
                                    {b}
                                  </span>
                                </li>
                              ))}
                            </ul>

                            {benefits.length > 2 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedBenefits((prev) => ({
                                    ...prev,
                                    [opt.value]: !prev[opt.value],
                                  }));
                                }}
                                className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors mt-2"
                              >
                                <span>
                                  {isExpanded
                                    ? "Show less"
                                    : `+ ${benefits.length - 2} more benefits`}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {formErrors.corporatePlanId && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  {formErrors.corporatePlanId}
                </p>
              )}
            </div>
          </ContentCard>

          {eligibilitySection && (
            <ContentCard
              title={eligibilitySection.title}
              className="bg-card/50 flex flex-col md:col-span-1"
              bodyClassName="flex-1 flex flex-col justify-center"
            >
              <SectionRenderer
                section={eligibilitySection}
                values={form}
                onChange={handleFormChange}
                errors={formErrors}
                cols={1}
              />
            </ContentCard>
          )}
        </div>

        {/* Dependents — only shown when plan allows dependents */}
        {maxDependents > 0 && (
          <div className="bg-card/50 rounded-2xl border border-border/80 shadow-sm overflow-hidden">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Family Members (Optional)
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-semibold">
                    {totalDependents} / {maxDependents} added
                  </p>
                </div>
              </div>

              {/* Existing (saved) dependents */}
              {existingDependents && existingDependents.length > 0 && (
                <div className="space-y-2">
                  {existingDependents.map((dep: PlanDependent) => (
                    <div
                      key={dep.id}
                      className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {dep.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-semibold">
                            {dep.relationship}
                            {dep.dateOfBirth ? ` • ${dep.dateOfBirth}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary hover:bg-primary/10 rounded-xl"
                          onClick={() => handleEditDependent(dep, true)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 rounded-xl"
                          onClick={() => handleRemoveExistingDependent(dep.id)}
                          disabled={removeDependentMutation.isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pending (not yet saved) dependents */}
              {pendingDependents.length > 0 && (
                <div className="space-y-4">
                  {pendingDependents.map((dep, index) => (
                    <div
                      key={dep.tempId}
                      className="border border-primary/20 bg-white rounded-2xl p-4 shadow-sm space-y-3"
                    >
                      <Label className="text-[10px] font-black text-primary uppercase tracking-widest">
                        Dependent{" "}
                        {existingDependents
                          ? existingDependents.length + index + 1
                          : index + 1}
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">
                            Name
                          </Label>
                          <Input
                            value={dep.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPendingDependents((prev) =>
                                prev.map((d, i) =>
                                  i === index ? { ...d, name: val } : d,
                                ),
                              );
                            }}
                            placeholder="Full name"
                            className="rounded-xl text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">
                            Relationship
                          </Label>
                          <Select
                            value={dep.relationship}
                            onValueChange={(val) => {
                              setPendingDependents((prev) =>
                                prev.map((d, i) =>
                                  i === index ? { ...d, relationship: val } : d,
                                ),
                              );
                            }}
                          >
                            <SelectTrigger className="rounded-xl text-sm h-10 bg-white">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Spouse">Spouse</SelectItem>
                              <SelectItem value="Child">Child</SelectItem>
                              <SelectItem value="Parent">Parent</SelectItem>
                              <SelectItem value="Sibling">Sibling</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">
                            Phone
                          </Label>
                          <Input
                            value={dep.phone}
                            onChange={(e) => {
                              const val = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10);
                              setPendingDependents((prev) =>
                                prev.map((d, i) =>
                                  i === index ? { ...d, phone: val } : d,
                                ),
                              );
                            }}
                            placeholder="Optional (10 digits)"
                            className="rounded-xl text-sm"
                            maxLength={10}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add dependent inline form */}
              {showAddDepForm && (
                <div className="border border-primary/20 bg-primary/5 rounded-2xl p-4 space-y-3">
                  <Label className="text-[10px] font-black text-primary uppercase tracking-widest">
                    {editingDepId ? "Edit Family Member" : "Add Family Member"}
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">
                        Name *
                      </Label>
                      <Input
                        value={addDepForm.name}
                        onChange={(e) =>
                          setAddDepForm((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="Full name"
                        className="rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">
                        Relationship *
                      </Label>
                      <Select
                        value={addDepForm.relationship}
                        onValueChange={(val) =>
                          setAddDepForm((p) => ({ ...p, relationship: val }))
                        }
                      >
                        <SelectTrigger className="rounded-xl text-sm h-10 bg-white">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Spouse">Spouse</SelectItem>
                          <SelectItem value="Child">Child</SelectItem>
                          <SelectItem value="Parent">Parent</SelectItem>
                          <SelectItem value="Sibling">Sibling</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">
                        Phone
                      </Label>
                      <Input
                        value={addDepForm.phone}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          setAddDepForm((p) => ({ ...p, phone: val }));
                        }}
                        placeholder="Optional (10 digits)"
                        className="rounded-xl text-sm"
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={handleAddDependent}
                      className="gap-1.5"
                      disabled={
                        addDependentMutation.isLoading ||
                        updateDependentMutation.isLoading
                      }
                    >
                      <CheckCircle className="w-3.5 h-3.5" />{" "}
                      {editingDepId ? "Save" : "Add"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddDepForm(false);
                        setEditingDepId(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {coverageLimitReached && (
                <p className="text-[11px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                  Maximum {maxDependents} dependent
                  {maxDependents !== 1 ? "s" : ""} allowed for this plan.
                </p>
              )}
            </div>
          </div>
        )}

        {/* <div className="p-5 bg-card/40 rounded-2xl border border-border/60 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${form.isActive !== false ? 'bg-emerald-500' : 'bg-muted-foreground animate-pulse'}`} />
              <Label htmlFor="empActive" className={`text-xs font-black uppercase tracking-widest ${isDateInPast ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground cursor-pointer'}`}>Active Status</Label>
            </div>
            <Label className={`relative inline-flex items-center ${isDateInPast ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
              <Input type="checkbox" id="empActive" checked={form.isActive !== false} className="sr-only peer"
                disabled={isDateInPast}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </Label>
          </div>
          {isDateInPast && (
            <p className="text-[10px] text-rose-500 font-semibold font-mono">
              * Cannot change status when eligibility date is in the past.
            </p>
          )}
        </div> */}
      </div>
    </Modal>
  );
}
