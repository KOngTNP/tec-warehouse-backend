import { IConnection } from './pagination.type';

/**
 * Create paginated response from array
 */
export function createPaginatedResponse<T>(
  array: T[],
  count: number,
  limit?: number,
  offset?: number,
): IConnection<T> {
  return {
    totalCount: count,
    hasNextPage: (offset || 0) + (limit || 0) < count,
    nodes: array,
  };
}
