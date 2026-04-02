export interface ApiResponse<T> {
  data: T;
  success: true;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
  success: true;
  timestamp: string;
}

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ErrorResponse {
  success: false;
  error: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export type ApiResult<T> = ApiResponse<T> | ErrorResponse;
export type PaginatedResult<T> = PaginatedResponse<T> | ErrorResponse;
