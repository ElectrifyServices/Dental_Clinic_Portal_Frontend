import { useApiQuery } from "../useApiQuery";

export interface Specialization {
  id: string;
  name: string;
  description: string;
  [key: string]: any;
}

export function useSpecializationsQuery() {
  return useApiQuery<Specialization[]>({
    queryKey: ["specializations"],
    endpoint: "/specialization/list",
    method: "post",
    data: { all: true },
  });
}
