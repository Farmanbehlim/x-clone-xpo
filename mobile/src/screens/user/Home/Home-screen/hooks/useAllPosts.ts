
import { useInfiniteQuery, QueryFunctionContext, UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';
// import { APIResponse } from '../types';
import { postApi, useApiClient, userApi } from '@/src/api/api';
import {  PostsResponse } from '../types';


export const useAllPosts = (

): UseInfiniteQueryResult<InfiniteData<PostsResponse>, Error> => {
    const api = useApiClient();

    const fetchUsers =
        async (context: QueryFunctionContext<['AllUserPost'], number>): Promise<PostsResponse> => {
            const { pageParam = 1 } = context;

            try {
                // Add explicit type casting to number if needed
                const pageNumber = pageParam as number;
                const response = await postApi?.getAllUserPost(api, pageNumber);
                return {
                    posts: response?.data?.posts,
                    pagination: response?.data?.pagination
                };
            } catch (error: any) {
                const message = error.response?.data?.message ||
                    error?.message ||
                    'Unknown error occurred';
                throw new Error(message);
            }
        }


    return useInfiniteQuery<
        PostsResponse,
        Error,
        InfiniteData<PostsResponse>,
        ["AllUserPost"],
        number

    >({
        queryKey: ['AllUserPost'],
        queryFn: fetchUsers,
        initialPageParam: 1,
        getNextPageParam: (lastPage: PostsResponse) =>
            lastPage?.pagination?.hasNextPage ? parseInt(lastPage?.pagination?.currentPage) + 1 : undefined

    });
};