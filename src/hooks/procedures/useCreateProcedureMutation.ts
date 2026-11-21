import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/contexts/ModalContext";
import { Procedure } from "./useProcedureQuery";

export interface CreateProcedureVariables {
  name: string;
  status?: "ACTIVE" | "INACTIVE" | "EXPIRED";
}

export function useCreateProcedureMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useModal();

  return useApiMutation<Procedure, CreateProcedureVariables>({
    endpoint: "/procedures",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["procedures"] });
        showToast("Procedure created successfully", "success");
      },
      onError: (err: any) => {
        showToast(err?.message || "Failed to create procedure", "error");
      },
    },
  });
}
