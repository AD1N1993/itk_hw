import { query } from 'express-validator';
import { SortDirection } from '../../types/paginator';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_BY = 'createdAt';
const DEFAULT_SORT_DIRECTION = SortDirection.Desc;

// sortBy не ограничен строгим enum по спецификации (type: string) — допустимость
// конкретного поля проверяет репозиторий (fallback на createdAt), а не 400 здесь.
export const paginationAndSortingValidation = [
  query('pageNumber')
    .default(DEFAULT_PAGE)
    .isInt({ min: 1 })
    .withMessage('pageNumber must be a positive integer')
    .toInt(),

  query('pageSize')
    .default(DEFAULT_PAGE_SIZE)
    .isInt({ min: 1, max: 20 })
    .withMessage('pageSize must be between 1 and 20')
    .toInt(),

  query('sortBy').default(DEFAULT_SORT_BY).isString(),

  query('sortDirection')
    .default(DEFAULT_SORT_DIRECTION)
    .isIn(Object.values(SortDirection))
    .withMessage(
      `sortDirection must be one of: ${Object.values(SortDirection).join(', ')}`,
    ),
];

export const searchNameTermValidation = query('searchNameTerm')
  .optional({ values: 'falsy' })
  .isString()
  .withMessage('searchNameTerm must be a string');
