import { useApiMutation } from "../useApiMutation";

export interface CreatePlanBenefitVariables {
  type: string;
  count?: number;
  clinical_procedures?: string[];
  description: string;
  benifit_label: string;
  discount_percentage?: number;
  max_amount?: number;
}

export interface CreateCorporatePlanVariables {
  plan_name: string;
  company_name: string;
  plan_code: string;
  description?: string;
  valid_from: string;
  valid_till: string;
  enrollment_cap?: number;
  theme_color?: string;
  benefits: CreatePlanBenefitVariables[];
}

export interface CreateCorporatePlanResponse {
  id: string;
  plan_name: string;
  company_name: string;
  plan_code: string;
  description: string;
  valid_from: string;
  valid_till: string;
  enrollment_cap: number;
  theme_color: string;
  benefits: any[];
  [key: string]: any;
}

export function useCreateCorporatePlanMutation() {
  return useApiMutation<CreateCorporatePlanResponse, CreateCorporatePlanVariables>({
    endpoint: "/corporate/plan/create",
    method: "post",
  });
}
