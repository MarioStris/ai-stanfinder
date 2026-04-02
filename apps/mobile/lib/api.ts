import { Config } from "@constants/config";
import type {
  ApiResult,
  PaginatedResult,
  Filter,
  MatchResult,
} from "@stanfinder/shared-types";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResult<T>> {
  const { method = "GET", body, headers = {}, token } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), Config.apiTimeout);

  try {
    const response = await fetch(`${Config.apiUrl}${path}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const json = await response.json();
    return json as ApiResult<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function paginatedRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<PaginatedResult<T>> {
  const result = await request<T[]>(path, options);
  return result as unknown as PaginatedResult<T>;
}

export interface CreateFilterPayload {
  name: string;
  cities: string[];
  propertyTypes: string[];
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  freeText?: string;
}

export const apiClient = {
  get: <T>(path: string, token?: string) => request<T>(path, { token }),
  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "POST", body, token }),
  put: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "PUT", body, token }),
  patch: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "PATCH", body, token }),
  delete: <T>(path: string, token?: string) =>
    request<T>(path, { method: "DELETE", token }),
  getPaginated: <T>(path: string, token?: string) =>
    paginatedRequest<T>(path, { token }),
};

export const filtersApi = {
  getAll: (token: string) =>
    apiClient.get<Filter[]>("/api/v1/filters", token),

  create: (payload: CreateFilterPayload, token: string) =>
    apiClient.post<Filter>("/api/v1/filters", payload, token),

  update: (filterId: string, payload: Partial<CreateFilterPayload>, token: string) =>
    apiClient.put<Filter>(`/api/v1/filters/${filterId}`, payload, token),

  remove: (filterId: string, token: string) =>
    apiClient.delete(`/api/v1/filters/${filterId}`, token),
};

export const matchesApi = {
  getByFilter: (filterId: string, token: string) =>
    apiClient.getPaginated<MatchResult>(
      `/api/v1/filters/${filterId}/matches`,
      token
    ),

  refresh: (filterId: string, token: string) =>
    apiClient.post<MatchResult[]>(
      `/api/v1/filters/${filterId}/matches/refresh`,
      {},
      token
    ),

  getDetail: (matchId: string, token: string) =>
    apiClient.get<MatchResult>(`/api/v1/matches/${matchId}`, token),
};
