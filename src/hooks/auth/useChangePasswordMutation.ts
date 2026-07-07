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

const CHANGE_PASSWORD_ENDPOINT = "/auth/change-password"; // wait, user says PATCH /change-password but let's check

export function useChangePasswordMutation() {
  return useApiMutation<ChangePasswordResponse, ChangePasswordVariables>({
    endpoint: "/auth/change-password",
    method: "patch",
  });
}
