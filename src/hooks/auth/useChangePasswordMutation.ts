import { useApiMutation } from "../useApiMutation";

export interface ChangePasswordVariables {
  email: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface ChangePasswordResponse {
  data: null;
}

export function useChangePasswordMutation() {
  return useApiMutation<ChangePasswordResponse, ChangePasswordVariables>({
    endpoint: "/auth/change-password",
    method: "patch",
  });
}
