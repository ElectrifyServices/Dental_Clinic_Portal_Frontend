import { useApiMutation } from "../useApiMutation";

export interface ResetPasswordVariables {
  token: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface ResetPasswordResponse {
  data: null;
}

export function useResetPasswordMutation() {
  return useApiMutation<ResetPasswordResponse, ResetPasswordVariables>({
    getEndpoint: (variables) => `/auth/reset-password?token=${encodeURIComponent(variables.token)}`,
    method: "patch",
    transformRequest: (variables) => {
      const { token, ...body } = variables;
      return body;
    },
  });
}
