import { keepPreviousData } from "@tanstack/react-query";
import { useApiQuery } from "../useApiQuery";

export interface BroadcastRecipient {
  id: string;
  name: string;
  phone: string | null;
  country_code?: string;
  /** "patient" | "member" — from the core dropdown endpoint */
  source: "patient" | "member";
  profile_picture?: string | null;
}

export interface BroadcastRecipientsVariables {
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Flattens the (inconsistently, sometimes triple-) nested core list response
 * into `{ rows, total }` by walking down `.data` / `.rows` until an array.
 */
export function normalizeRecipients(raw: unknown): {
  rows: BroadcastRecipient[];
  total: number;
} {
  let node: any = raw;
  let total: number | undefined;

  for (let i = 0; i < 6 && node && typeof node === "object"; i++) {
    if (total === undefined) {
      total =
        node.pagination?.total_items ??
        (typeof node.total === "number" ? node.total : undefined);
    }
    if (Array.isArray(node)) break;
    if (Array.isArray(node.data)) {
      node = node.data;
      break;
    }
    if (Array.isArray(node.rows)) {
      node = node.rows;
      break;
    }
    node = node.data ?? node.rows;
  }

  const rows: BroadcastRecipient[] = Array.isArray(node) ? node : [];
  return { rows, total: total ?? rows.length };
}

/**
 * Merged patient + member list for the broadcast recipient picker.
 * Uses the "dropdown" mode of POST /patient/list, which already excludes
 * members that became patients (so no patient/member duplicates).
 */
export function useBroadcastRecipientsQuery(
  variables: BroadcastRecipientsVariables,
  options?: { enabled?: boolean },
) {
  return useApiQuery<unknown>({
    queryKey: ["broadcast-recipients", variables],
    endpoint: "/patient/list",
    method: "post",
    data: {
      page: variables.page ?? 1,
      limit: variables.limit ?? 25,
      search: variables.search || "",
      filters: { isDropdown: ["true"] },
    },
    options: {
      enabled: options?.enabled ?? true,
      staleTime: 60_000,
      placeholderData: keepPreviousData,
    },
  });
}
