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
  enrollment_cap?: number;
  theme_color?: string;
  benefits: CreatePlanBenefitVariables[];
}

export function useUpdateCorporatePlanMutation() {
  return useApiMutation<CreateCorporatePlanResponse, UpdateCorporatePlanVariables>({
    getEndpoint: (variables) => `/corporatePlan/${variables.id}`,
    method: "put",
    transformRequest: ({ id: _id, ...rest }) => rest,
  });
}
