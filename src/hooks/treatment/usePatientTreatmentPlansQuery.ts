import { useInfiniteQuery } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import { parseApiResponse, type ApiResponse } from "../../services/parseApiResponse";
import { TreatmentPlanResponse } from "./useCreateTreatmentPlanMutation";

interface PaginationMeta {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface PatientTreatmentPlansResponse {
  data?: {
    data?: TreatmentPlanResponse[];
    pagination?: PaginationMeta;
  };
  pagination?: PaginationMeta;
}

function getPagination(page: PatientTreatmentPlansResponse | null | undefined) {
  return page?.data?.pagination || page?.pagination;
}

export function usePatientTreatmentPlansQuery(
  patientId?: string,
  options?: { enabled?: boolean; limit?: number; filters?: any },
) {
  const enabled = (options?.enabled ?? true) && !!patientId;
  const limit = options?.limit ?? 10;

  return useInfiniteQuery({
    queryKey: ["patientTreatmentPlans", patientId, limit, JSON.stringify(options?.filters)],
    enabled,
    initialPageParam: 1,
    staleTime: 60_000,
    queryFn: async ({ pageParam }): Promise<PatientTreatmentPlansResponse | null> => {
      const res = await apiClient.request<ApiResponse<PatientTreatmentPlansResponse>>({
        url: `/treatment/patient/${patientId}/list`,
        method: "post",
        data: {
          page: pageParam,
          limit,
          filters: options?.filters,
        },
      });

      const parsed = parseApiResponse(res.data);

      if (parsed.status && (parsed.status.statusCode < 200 || parsed.status.statusCode >= 300)) {
        throw parsed.data || new Error(parsed.status.statusDesc);
      }

      return parsed.data;
    },
    getNextPageParam: (lastPage) => {
      const pagination = getPagination(lastPage);
      if (!pagination) return undefined;
      return pagination.page < pagination.totalPages ? pagination.page + 1 : undefined;
    },
  });
}
