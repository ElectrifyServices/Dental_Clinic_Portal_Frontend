import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/contexts/ModalContext";
import { Procedure } from "./useProcedureQuery";

export interface DeleteProcedureVariables {
  id: string;
}

export function useDeleteProcedureMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useModal();

  return useApiMutation<Procedure, DeleteProcedureVariables>({
    getEndpoint: (vars) => `/procedures/${vars.id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["procedures"] });
        showToast("Procedure deleted successfully", "success");
      },
      onError: (err: any) => {
        showToast(err?.message || "Failed to delete procedure", "error");
      },
    },
  });
}
