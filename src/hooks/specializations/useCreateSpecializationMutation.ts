import { useApiMutation } from "../useApiMutation";

export interface CreateSpecializationVariables {
  name: string;
  description?: string;
}

export interface Specialization {
  id: string;
  name: string;
  description: string;
  [key: string]: any;
}

export function useCreateSpecializationMutation() {
  return useApiMutation<Specialization, CreateSpecializationVariables>({
    endpoint: "/specialization/create",

    method: "post",
  });
}
