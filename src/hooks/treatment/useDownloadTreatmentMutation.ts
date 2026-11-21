import { useApiQuery } from "../useApiQuery";
import { useMutation } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import { parseApiResponse } from "../../services/parseApiResponse";
import { TreatmentPlanResponse } from "./useCreateTreatmentPlanMutation";

/**
 * GET /treatment/download/:id  (Query version)
 * Use this when you want to pre-fetch or conditionally load plan data for PDF.
 */
export function useDownloadTreatmentQuery(
  planId?: string,
  options?: { enabled?: boolean },
) {
  const enabled = (options?.enabled ?? true) && !!planId;

  return useApiQuery<TreatmentPlanResponse>({
    queryKey: ["treatmentDownload", planId],
    endpoint: `/treatment/download/${planId}`,
    method: "get",
    options: {
      enabled,
      staleTime: 0,
    },
  });
}

/**
 * GET /treatment/download/:id  (Mutation / on-demand version)
 * Backward-compatible alias — existing components that call mutateAsync({ id }) continue to work.
 */
export function useDownloadTreatmentMutation() {
  return useMutation<TreatmentPlanResponse, any, { id: string }>({
    mutationFn: async ({ id }) => {
      const res = await apiClient.request<any>({
        url: `/treatment/download/${id}`,
        method: "get",
      });
      const parsed = parseApiResponse(res.data);
      return (parsed.data ?? res.data) as TreatmentPlanResponse;
    },
  });
}
