// hooks/treatment/useTreatmentPlansQuery.ts
import { keepPreviousData } from "@tanstack/react-query";
import { useApiQuery } from "../useApiQuery";
import { TreatmentPlanResponse } from "./useCreateTreatmentPlanMutation";

export interface TreatmentPlansFilters {
  // Pagination
  page?: number;
  limit?: number;
  all?: boolean;

  // Search
  search?: string;

  // Sorting
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';

  // Date ranges
  startDate?: Date;
  endDate?: Date;

  // Advanced filters (all support arrays for list-based filtering)
  filters?: {
    status?: string[];           // Multiple statuses
    patientId?: string[];        // Multiple patient IDs
    doctorId?: string[];         // Multiple doctor IDs
    procedure?: string[];        // Multiple procedures
    toothNumber?: number[];      // Multiple tooth numbers
    consultationId?: string[];   // Multiple consultation IDs
    createdBy?: string[];        // Multiple creator IDs
    minCost?: number;            // Minimum cost
    maxCost?: number;            // Maximum cost
    costRanges?: Array<{ min: number; max: number }>; // Multiple cost ranges
  };
}

export interface TreatmentPlansResponse {
  data: TreatmentPlanResponse[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  }
  summary: {
    all: number;
    active: number;
    completed: number;
    planned: number;
    cancelled: number;
    revenue: number;
    averageCost: number;
    minCost: number;
    maxCost: number;
    statusBreakdown: Record<string, number>;
  };
}

export function useTreatmentPlansQuery(
  filters: TreatmentPlansFilters = {},
  options?: { enabled?: boolean },
) {
  // Build request body
  const buildRequestBody = () => {
    const body: any = {};

    // Pagination
    if (filters.page !== undefined) body.page = filters.page;
    if (filters.limit !== undefined) body.limit = filters.limit;
    if (filters.all !== undefined) body.all = filters.all;

    // Search
    if (filters.search) body.search = filters.search;

    // Sorting
    if (filters.sortBy) body.sortBy = filters.sortBy;
    if (filters.sortOrder) body.sortOrder = filters.sortOrder;

    // Date ranges
    if (filters.startDate) body.startDate = filters.startDate.toISOString();
    if (filters.endDate) body.endDate = filters.endDate.toISOString();

    // Advanced filters - convert arrays to proper format for API
    if (filters.filters) {
      body.filters = {};

      // Handle list-based filters (arrays)
      if (filters.filters.status?.length) {
        body.filters.status = filters.filters.status;
      }
      if (filters.filters.patientId?.length) {
        body.filters.patientId = filters.filters.patientId;
      }
      if (filters.filters.doctorId?.length) {
        body.filters.doctorId = filters.filters.doctorId;
      }
      if (filters.filters.procedure?.length) {
        body.filters.procedure = filters.filters.procedure;
      }
      if (filters.filters.toothNumber?.length) {
        body.filters.toothNumber = filters.filters.toothNumber;
      }
      if (filters.filters.consultationId?.length) {
        body.filters.consultationId = filters.filters.consultationId;
      }
      if (filters.filters.createdBy?.length) {
        body.filters.createdBy = filters.filters.createdBy;
      }

      // Handle range filters
      if (filters.filters.minCost !== undefined) {
        body.filters.minCost = filters.filters.minCost;
      }
      if (filters.filters.maxCost !== undefined) {
        body.filters.maxCost = filters.filters.maxCost;
      }

      // Handle multiple cost ranges
      if (filters.filters.costRanges?.length) {
        body.filters.costRanges = filters.filters.costRanges;
      }
    }

    return body;
  };

  const requestBody = buildRequestBody();

  // Use a consistent endpoint without query string parameters
  const endpoint = `treatment/patient/list`;

  return useApiQuery<TreatmentPlansResponse>({
    queryKey: ["treatmentPlans", filters],
    endpoint,
    method: "post",
    data: requestBody, // Send data in the request body
    options: {
      enabled: options?.enabled ?? true,
      staleTime: 0,
      placeholderData: keepPreviousData,
    },
  });
}
