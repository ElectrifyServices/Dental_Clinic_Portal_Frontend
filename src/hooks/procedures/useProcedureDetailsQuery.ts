import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";
import { Procedure } from "./useProcedureQuery";

export function useProcedureDetailsQuery(id?: string, options?: ApiAny) {
  return useApiQuery<Procedure>({
    queryKey: ["procedure", id],
    endpoint: `/procedures/${id}`,
    method: "get",
    options: {
      enabled: !!id,
      ...options,
    },
  });
}
