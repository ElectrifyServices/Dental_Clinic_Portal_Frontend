import { useApiMutation } from "../useApiMutation";

export interface ForgotPasswordVariables {
  email: string;
}

export interface ForgotPasswordResponse {
  data: null;
}

export function useForgotPasswordMutation() {
  return useApiMutation<ForgotPasswordResponse, ForgotPasswordVariables>({
    endpoint: "/auth/forgot-password",
    method: "post",
  });
}
