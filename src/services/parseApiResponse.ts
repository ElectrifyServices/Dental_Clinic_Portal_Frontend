export interface ApiStatus {
  statusCode: number;
  statusType: string;
  statusDesc: string;
}

export interface ApiResponse<T = any> {
  responseStatusList?: { statusList: ApiStatus[] };
  responseObject?: T;
}

export type ParsedApiResponse<T> = {
  status: ApiStatus | null;
  data: T | null;
};

export function parseApiResponse<T>(response: ApiResponse<T>) {
  if (!response || typeof response !== "object") {
    throw new Error("Invalid response");
  }
  const status = response.responseStatusList?.statusList?.[0] ?? null;
  const data = response.responseObject ?? null;
  return { status, data };
}
