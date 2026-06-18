import { useApiMutation } from "../useApiMutation";
import { CreatePlanBenefitVariables, CreateCorporatePlanResponse } from "./useCreateCorporatePlanMutation";

export interface UpdateCorporatePlanVariables {
  id: string;
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

import { useQueryClient } from "@tanstack/react-query";

export function useUpdateCorporatePlanMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<CreateCorporatePlanResponse, UpdateCorporatePlanVariables>({
    getEndpoint: (variables) => `/membershipPlan/${variables.id}`,
    method: "put",
    transformRequest: ({ id: _id, ...rest }) => rest,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["membershipPlans"] });
        queryClient.invalidateQueries({ queryKey: ["membershipStats"] });
      },
    },
  });
}
