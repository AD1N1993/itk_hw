export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export type Paginator<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
};

export const buildPaginator = <T>(
  items: T[],
  totalCount: number,
  page: number,
  pageSize: number,
): Paginator<T> => {
  return {
    pagesCount: Math.ceil(totalCount / pageSize),
    page,
    pageSize,
    totalCount,
    items,
  };
};
