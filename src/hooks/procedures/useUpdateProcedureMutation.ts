import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/contexts/ModalContext";
import { Procedure } from "./useProcedureQuery";

export interface UpdateProcedureVariables {
  id: string;
  name?: string;
  status?: "ACTIVE" | "INACTIVE" | "EXPIRED";
}

export function useUpdateProcedureMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useModal();

  return useApiMutation<Procedure, UpdateProcedureVariables>({
    getEndpoint: (vars) => `/procedures/${vars.id}`,
    method: "patch",
    transformRequest: (vars) => {
      const { id, ...data } = vars;
      return data;
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["procedures"] });
        showToast("Procedure updated successfully", "success");
      },
      onError: (err: any) => {
        showToast(err?.message || "Failed to update procedure", "error");
      },
    },
  });
}
