import { SortDirection } from '../../core/types/paginator';

// Query-параметры для GET /blogs после валидации и toInt().
export type BlogQueryInput = {
  searchNameTerm?: string;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
};
