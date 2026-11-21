import { useApiMutation } from "../useApiMutation";

export interface CreatePlanBenefitVariables {
  type: string;
  allocationCount?: number;
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
  max_member?: number;
  theme_color?: string;
  benefits: CreatePlanBenefitVariables[];
  plan_type?: 'COMPANY' | 'INDIVIDUAL';
  plan_tier?: string;
  annual_fee?: number;
  family_coverage_limit?: number;
}

export interface CreateCorporatePlanResponse {
  id: string;
  plan_name: string;
  company_name: string;
  plan_code: string;
  description: string;
  valid_from: string;
  valid_till: string;
  max_member: number;
  theme_color: string;
  benefits: any[];
  [key: string]: any;
}

import { useQueryClient } from "@tanstack/react-query";

export function useCreateCorporatePlanMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<CreateCorporatePlanResponse, CreateCorporatePlanVariables>({
    endpoint: "/membershipPlan",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["membershipPlans"] });
        queryClient.invalidateQueries({ queryKey: ["membershipStats"] });
      },
    },
  });
}
