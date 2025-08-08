
import { useInfiniteQuery, QueryFunctionContext, UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';
// import { APIResponse } from '../types';
import { commentApi, useApiClient, } from '@/src/api/api';
import { CommentResPonse } from '../types/getcomment-type';



export const useGetComments = (
    postId: string
): UseInfiniteQueryResult<InfiniteData<CommentResPonse>, Error> => {
    const api = useApiClient();

    const fetchcomments =
        async (context: QueryFunctionContext<['GetPostComments', string], number>): Promise<CommentResPonse> => {
            const { pageParam = 1 } = context;
            const [, queryPostId] = context.queryKey;
            console.log(queryPostId, 'querykey');
            try {

                if (queryPostId == null) {
                    return { comments: [], pagination: undefined };
                }

                // Add explicit type casting to number if needed
                const pageNumber = pageParam as number;
                const response = await commentApi.getPostComment(api, pageNumber, queryPostId);
                // console.log('amazing')
                return {
                    comments: response?.data.comments,
                    pagination: response?.data?.pagination
                };
            } catch (error: any) {
                console.log(error)
                const message = error.response?.data?.message ||
                    error.message ||
                    'Unknown error occurred';
                throw new Error(message);
            }
        }


    return useInfiniteQuery<
        CommentResPonse,
        Error,
        InfiniteData<CommentResPonse>,
        ["GetPostComments", string],
        number

    >({
        queryKey: ['GetPostComments', postId],
        queryFn: fetchcomments,
        initialPageParam: 1,
        getNextPageParam: (lastPage: CommentResPonse) =>
            lastPage?.pagination?.hasNextPage ? parseInt(lastPage?.pagination?.currentPage) + 1 : undefined,
        staleTime: 2000 * 60 * 10,
    });
};