export type ApiErrorResponse = {
  message: string;
  code?: string;
  details?: unknown;
};

export type PaginatedResponse<TItem> = {
  data: TItem[];
  page: number;
  pageSize: number;
  total: number;
};
