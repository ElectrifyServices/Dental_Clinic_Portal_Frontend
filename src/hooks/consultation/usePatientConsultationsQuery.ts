import { useApiQuery } from "../useApiQuery";
import { ConsultationResponse } from "../../types/consultationTypes";

export interface PatientConsultationsFilters {
    search?: string;
    followUp?: "all" | "yes" | "no";
    sort?: "newest" | "oldest";
    date?: string;
    dateFrom?: string;
    dateTo?: string;
}

export function usePatientConsultationsQuery(
    patientId: string,
    filters?: PatientConsultationsFilters,
    options?: { enabled?: boolean }
) {
    let endpoint = `/consultations/patient/${patientId}`;
    const queryParams = new URLSearchParams();

    if (filters?.search) {
        queryParams.append('search', filters.search);
    }
    if (filters?.followUp && filters.followUp !== 'all') {
        queryParams.append('followUp', filters.followUp);
    }
    if (filters?.sort) {
        queryParams.append('sort', filters.sort);
    }
    if (filters?.date) {
        queryParams.append('date', filters.date);
    }
    if (filters?.dateFrom) {
        queryParams.append('dateFrom', filters.dateFrom);
    }
    if (filters?.dateTo) {
        queryParams.append('dateTo', filters.dateTo);
    }

    const queryString = queryParams.toString();
    if (queryString) {
        endpoint += `?${queryString}`;
    }

    return useApiQuery<ConsultationResponse[]>({
        queryKey: ["patient-consultations", patientId, filters],
        endpoint,
        method: "get",
        options: {
            enabled: !!patientId && !patientId.startsWith("WALK-") && (options?.enabled ?? true),
            staleTime: 30 * 1000,
        },
    });
}
