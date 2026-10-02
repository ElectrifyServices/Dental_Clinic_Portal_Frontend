import type { ApiAny } from "../../types/api";
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "../useApiQuery";
import { useApiMutation } from "../useApiMutation";

export const useMedicinesQuery = (params: { page: number; limit: number; search: string }, options?: ApiAny) => {
  return useApiQuery<ApiAny>({
    queryKey: ["medicines", params],
    endpoint: "/medicines/list",
    method: "post",
    data: params,
    options,
  });
};

export const useCreateMedicineMutation = () => {
  const queryClient = useQueryClient();

  return useApiMutation<ApiAny, { name: string; description?: string }>({
    endpoint: "/medicines",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["medicines"] });
      },
    },
  });
};

export const useDeleteMedicineMutation = () => {
  const queryClient = useQueryClient();

  return useApiMutation<ApiAny, string>({
    getEndpoint: (id: string) => `/medicines/${id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["medicines"] });
      },
    },
  });
};
