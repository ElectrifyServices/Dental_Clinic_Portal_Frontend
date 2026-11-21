import { useApiMutation } from "../useApiMutation";

export interface ActivateAccountVariables {
  token: string;
}

export interface ActivateAccountResponse {
  data: null;
}

export function useActivateAccountMutation() {
  return useApiMutation<ActivateAccountResponse, ActivateAccountVariables>({
    getEndpoint: (variables) => `/auth/activate-account?token=${encodeURIComponent(variables.token)}`,
    method: "put",
    transformRequest: () => ({}),
  });
}
