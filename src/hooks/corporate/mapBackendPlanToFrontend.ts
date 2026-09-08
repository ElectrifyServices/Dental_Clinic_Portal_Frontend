import { CorporatePlan, PlanBenefitType } from '../../types';
import { mapProcedureLabelToKey } from '../../constants/consent.constants';

const mapHexToColor = (hex: string): string => {
  const colorMap: Record<string, string> = {
    "#3B82F6": "blue",
    "#8B5CF6": "violet",
    "#10B981": "emerald",
    "#F43F5E": "rose",
    "#F59E0B": "amber",
    "#06B6D4": "cyan",
    "#6366F1": "indigo",
    "#14B8A6": "teal",
  };
  return colorMap[hex?.toUpperCase()] || "blue";
};

const mapBackendBenefitType = (backendType: string): PlanBenefitType => {
  const typeMap: Record<string, PlanBenefitType> = {
    FLAT_DISCOUNT: "flat_discount",
    TREATMENT_DISCOUNT: "treatment_discount",
    FREE_CONSULTATION: "free_consultations",
    FREE_TREATMENT_SERVICE: "free_treatments",
    CAPPED_DISCOUNT: "capped_discount",
    UNLIMITED_CONSULTATION: "unlimited_consultations",
    COMPLIMENTARY_SESSION: "complimentary_session",
    PRIORITY_SCHEDULING: "priority_scheduling",
    FLUORIDE_APPLICATION: "fluoride_application",
    CUSTOM: "custom",
  };
  return typeMap[backendType] || "custom";
};

export function mapBackendPlanToFrontend(plan: any): CorporatePlan {
  return {
    id: plan.id,
    name: plan.plan_name,
    companyName: plan.company_name,
    code: plan.plan_code,
    description: plan.description || "",
    validFrom: plan.valid_from ? plan.valid_from.split('T')[0] : "",
    validTo: plan.valid_till ? plan.valid_till.split('T')[0] : "",
    maxMembers: plan.max_member || plan.enrollment_cap || undefined,
    currentMembers: plan._count?.enrollments ?? plan._count?.employees ?? 0,
    isActive: plan.status === "ACTIVE",
    status: plan.status,
    createdAt: plan.created_at || new Date().toISOString(),
    createdBy: plan.created_by || "Super Admin",
    color: mapHexToColor(plan.theme_color),
    planCategory: (plan.plan_type?.toLowerCase() === 'company' ? 'corporate' : plan.plan_type?.toLowerCase() === 'individual' ? 'individual' : plan.plan_category?.toLowerCase() || 'corporate') as any,
    planType: plan.plan_type || (plan.plan_type?.toLowerCase() === 'company' ? 'COMPANY' : plan.plan_type?.toLowerCase() === 'individual' ? 'INDIVIDUAL' : 'COMPANY'),
    planTier: plan.plan_tier?.toLowerCase() as any,
    annualFee: plan.annual_fee ? Number(plan.annual_fee) : undefined,
    maxDependents: plan.family_coverage_limit ?? plan.max_dependents ?? 0,
    benefits: (plan.benefits || []).map((b: any) => {
      let customTreatmentText = "";
      const standardKeys = [
        'consultation', 'follow-up', 'xray-review', 'cleaning', 'emergency',
        'filling', 'root-canal', 'extraction', 'orthodontics', 'implants',
        'full-mouth-rehab', 'veneers-cosmetic', 'child-dentistry', 'crown',
        'denture', 'toothache', 'swelling-infection', 'broken-tooth', 'trauma-injury'
      ];
      const treatmentTypes = (b.clinical_procedures || []).map((proc: string) => {
        const key = mapProcedureLabelToKey(proc);
        if (!standardKeys.includes(key)) {
          customTreatmentText = proc;
          return 'other';
        }
        return key;
      });

      return {
        id: b.id,
        type: mapBackendBenefitType(b.type),
        value: ["FREE_CONSULTATION", "FREE_TREATMENT_SERVICE"].includes(b.type)
          ? (b.allocationCount ?? b.count ?? 0)
          : (b.discount_percentage ?? 0),
        cap: b.max_amount || undefined,
        customName: b.benifit_label || undefined,
        treatmentTypes,
        customTreatmentText,
        description: b.description || "",
      };
    }),
  };
}
