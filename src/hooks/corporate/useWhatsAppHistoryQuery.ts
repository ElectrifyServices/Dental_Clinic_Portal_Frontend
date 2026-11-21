import { useApiQuery } from "../useApiQuery";

export interface WhatsAppHistoryFilters {
  status?: string | string[];
  direction?: string | string[];
  messageType?: string | string[];
  message_type?: string | string[];
  template_name?: string | string[];
  startDate?: string | string[];
  from_date?: string | string[];
  endDate?: string | string[];
  to_date?: string | string[];
  recipient?: string | string[];
}

export interface WhatsAppHistoryVariables {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  filters?: WhatsAppHistoryFilters;
}

export function useWhatsAppHistoryQuery(variables: WhatsAppHistoryVariables, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;

  // Build filters payload where each selected filter is wrapped in an array if not already
  const apiFilters: any = {};
  if (variables.filters) {
    const rawFilters = variables.filters;
    if (rawFilters.status) {
      apiFilters.status = Array.isArray(rawFilters.status) ? rawFilters.status : [rawFilters.status].filter(Boolean);
    }
    if (rawFilters.direction) {
      apiFilters.direction = Array.isArray(rawFilters.direction) ? rawFilters.direction : [rawFilters.direction].filter(Boolean);
    }
    const mType = rawFilters.message_type || rawFilters.messageType;
    if (mType) {
      apiFilters.message_type = Array.isArray(mType) ? mType : [mType].filter(Boolean);
    }
    if (rawFilters.template_name) {
      apiFilters.template_name = Array.isArray(rawFilters.template_name) ? rawFilters.template_name : [rawFilters.template_name].filter(Boolean);
    }
    const fromDate = rawFilters.from_date || rawFilters.startDate;
    if (fromDate) {
      apiFilters.from_date = Array.isArray(fromDate) ? fromDate : [fromDate].filter(Boolean);
    }
    const toDate = rawFilters.to_date || rawFilters.endDate;
    if (toDate) {
      apiFilters.to_date = Array.isArray(toDate) ? toDate : [toDate].filter(Boolean);
    }
    if (rawFilters.recipient) {
      apiFilters.recipient = Array.isArray(rawFilters.recipient) ? rawFilters.recipient : [rawFilters.recipient].filter(Boolean);
    }
  }

  return useApiQuery<any>({
    queryKey: ["whatsapp-history", variables],
    endpoint: "/notification/whatsapp/message/list",
    method: "post",
    data: {
      page: variables.page || 1,
      limit: variables.limit || 10,
      search: variables.search || "",
      sortBy: variables.sortBy || "createdAt",
      sortOrder: variables.sortOrder || "DESC",
      filters: apiFilters,
    },
    options: {
      enabled,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  });
}
