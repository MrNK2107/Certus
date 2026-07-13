export interface ApiResponse<T> {
  requestId: string;
  timestamp: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  requestId: string;
  timestamp: string;
  errorCode: string;
  message: string;
  details?: Record<string, unknown>;
  actionableHint?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  status?: string;
  sector?: string;
  branch?: string;
  team?: string;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  scoreBand?: string;
  completenessBand?: string;
}
