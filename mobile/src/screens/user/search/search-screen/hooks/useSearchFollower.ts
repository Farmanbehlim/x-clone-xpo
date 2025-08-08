
import { useInfiniteQuery, QueryFunctionContext, UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';
import { APIResponse } from '../types';
import { useApiClient, userApi } from '@/src/api/api';
import { useCallback } from 'react';

export const useInfiniteUsers = (
  search: string
): UseInfiniteQueryResult<InfiniteData<APIResponse>, Error> => {
  const api = useApiClient();

  const fetchUsers = 
    async (context: QueryFunctionContext<[string, string], number>): Promise<APIResponse> => {
      const { pageParam = 1, queryKey } = context;
      const [, searchTerm] = queryKey;

      try {
        // Add explicit type casting to number if needed
        const pageNumber = pageParam as number;

        // Ensure getAllUser expects (api, string, number) signature
        const response = await userApi.getAllUser(api, searchTerm, pageNumber);
        return response.data;
      } catch (error: any) {
        const message = error.response?.data?.message ||
          error.message ||
          'Unknown error occurred';
        throw new Error(message);
      }
    }
    

  return useInfiniteQuery<
    APIResponse,
    Error,
    InfiniteData<APIResponse>,
    [string, string],
    number
  >({
    queryKey: ['userSearch', search],
    queryFn: fetchUsers,
    initialPageParam: 1,
    getNextPageParam: (lastPage: APIResponse) => {
      return lastPage.pagination.hasNextPage
        ? lastPage.pagination.currentPage + 1
        : undefined;
    },
    enabled: !!search,
  });
};