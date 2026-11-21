import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "../useApiQuery";
import { useApiMutation } from "../useApiMutation";

export const useMedicinesQuery = (params: { page: number; limit: number; search: string }, options?: any) => {
  return useApiQuery<any>({
    queryKey: ["medicines", params],
    endpoint: "/medicines/list",
    method: "post",
    data: params,
    options,
  });
};

export const useCreateMedicineMutation = () => {
  const queryClient = useQueryClient();

  return useApiMutation<any, { name: string; description?: string }>({
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

  return useApiMutation<any, string>({
    getEndpoint: (id: string) => `/medicines/${id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["medicines"] });
      },
    },
  });
};
