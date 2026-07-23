import { SortDirection } from '../../core/types/paginator';

// Query-параметры для GET /posts (и GET /blogs/:blogId/posts) после валидации и toInt().
export type PostQueryInput = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
};
